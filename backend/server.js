import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();

// O Render fica na frente do servidor; com isso o req.ip mostra o IP real do visitante
app.set('trust proxy', 1);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10kb' })); // pedidos gigantes são recusados

const PORT = process.env.PORT || 5000;
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('ERRO: GEMINI_API_KEY não foi encontrada no arquivo .env');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Mostra só o final da chave (nunca ela inteira) para conferir qual está em uso.
if (apiKey) {
  console.log(`GEMINI_API_KEY carregada, termina em: ...${apiKey.slice(-4)}`);
}

// Lista de modelos do Gemini, em ordem de prioridade. Se um falhar, o código
// passa para o próximo até algum funcionar. Dá pra trocar a lista pelo Render
// (Environment) sem mexer no código, separando os nomes por vírgula:
//   GEMINI_MODELS=gemini-3.6-flash,gemini-3.8-flash,gemini-3.5-flash
const DEFAULT_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
];

const MODELS = process.env.GEMINI_MODELS
  ? process.env.GEMINI_MODELS.split(',').map((m) => m.trim()).filter(Boolean)
  : DEFAULT_MODELS;

// Inicializar o Supabase com as chaves do .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

if (!supabaseUrl || !supabaseKey) {
  console.error('AVISO: Credenciais do Supabase não encontradas no arquivo .env');
}

// Rota de teste inicial
app.get('/', (req, res) => {
  res.json({ message: '🚀 LinguaDeck Backend Server is running smoothly with Supabase and Gemini!' });
});

// ==========================================
// FUNÇÕES AUXILIARES DA IA (retry + modelo reserva)
// ==========================================

const GENERATION_CONFIG = {
  temperature: 0.1,
  maxOutputTokens: 900,
  responseMimeType: 'application/json',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Tempo máximo de espera por UM modelo e por TODA a busca (em milissegundos).
// Sem isso, um modelo sobrecarregado pode demorar vários segundos para responder
// o erro, e o pedido nunca chega nos modelos seguintes da lista.
const MODEL_TIMEOUT_MS = 7000;
const TOTAL_BUDGET_MS = 20000;

// "Castigo": quando um modelo falha por sobrecarga/timeout, ele é pulado nos
// próximos pedidos por 1 minuto (e por 10 minutos se der 404). Assim o site
// não perde vários segundos testando modelos que acabaram de falhar.
const COOLDOWN_MS = 60 * 1000;
const NOT_FOUND_COOLDOWN_MS = 10 * 60 * 1000;
const modelCooldown = new Map(); // nome do modelo -> até quando pular

const availableModels = () => {
  const now = Date.now();
  const available = MODELS.filter((m) => (modelCooldown.get(m) || 0) <= now);
  // Se todos estiverem de castigo, tenta todos mesmo assim.
  return available.length > 0 ? available : MODELS;
};

// Erros "passageiros": vale a pena passar para o próximo modelo.
// 503 = Google sobrecarregado, 429 = muitos pedidos em pouco tempo,
// e também quando o modelo demora demais (timeout) ou a conexão cai.
const isTemporaryError = (err) =>
  err?.status === 503 ||
  err?.status === 429 ||
  /abort|timeout|timed out|fetch failed|econnreset/i.test(`${err?.name} ${err?.message}`);

// Percorre a lista de modelos na ordem. Por padrão cada modelo recebe só 1
// tentativa: se falhar (sobrecarga, timeout ou 404), passa direto para o próximo,
// sem perder tempo. Se quiser repetir o mesmo modelo, aumente o maxAttempts.
async function generateWithRetry(prompt, maxAttempts = 1) {
  const models = [...new Set(availableModels())];
  const startedAt = Date.now();
  let lastError;
  let temporaryError; // guarda o último erro passageiro (503/429), se houver

  for (const modelName of models) {
    // Se o tempo total estourou, para de tentar novos modelos.
    if (Date.now() - startedAt > TOTAL_BUDGET_MS) break;

    const model = genAI.getGenerativeModel(
      { model: modelName, generationConfig: GENERATION_CONFIG },
      { timeout: MODEL_TIMEOUT_MS } // não deixa um modelo lento segurar a fila
    );

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        console.log(`OK com ${modelName} (${Date.now() - startedAt}ms no total)`);
        return result;
      } catch (err) {
        lastError = err;
        if (isTemporaryError(err)) temporaryError = err;
        if (err.status === 404 || isTemporaryError(err)) {
          modelCooldown.set(
            modelName,
            Date.now() + (err.status === 404 ? NOT_FOUND_COOLDOWN_MS : COOLDOWN_MS)
          );
        }
        console.warn(
          `Falha com ${modelName} (tentativa ${attempt}/${maxAttempts}): ${err.status || ''} ${err.message}`
        );

        // Modelo não existe mais (404): não adianta tentar de novo, vai pro reserva.
        if (err.status === 404) break;

        // Erro que não é passageiro (ex.: chave inválida, pedido mal formado): para tudo.
        if (!isTemporaryError(err)) throw err;

        // Erro passageiro: espera um pouco e tenta de novo.
        if (attempt < maxAttempts) {
          await sleep(1000 * 2 ** (attempt - 1));
        }
      }
    }
  }

  // Se algum modelo falhou por sobrecarga, devolve esse erro (vira a mensagem amigável).
  // Assim um 404 do modelo reserva não esconde o problema real.
  throw temporaryError || lastError;
}

// ==========================================
// PROTEÇÕES DA ROTA DA IA (login e limite de pedidos)
// ==========================================

// Tamanho máximo do texto que o usuário pode mandar para traduzir
const MAX_WORD_LENGTH = 300;

// Limitador simples em memória: no máximo "max" pedidos a cada "windowMs" para cada chave
const createRateLimiter = ({ windowMs, max, keyFn, message }) => {
  const hits = new Map(); // chave -> horários dos últimos pedidos

  // Limpa de vez em quando as chaves antigas, para a memória não crescer
  setInterval(() => {
    const now = Date.now();
    for (const [key, times] of hits) {
      const recent = times.filter((t) => now - t < windowMs);
      if (recent.length === 0) hits.delete(key);
      else hits.set(key, recent);
    }
  }, Math.min(windowMs, 10 * 60 * 1000)).unref();

  return (req, res, next) => {
    const key = keyFn(req);
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);

    if (recent.length >= max) {
      const retryAfter = Math.ceil((windowMs - (now - recent[0])) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ error: message });
    }

    recent.push(now);
    hits.set(key, recent);
    next();
  };
};

// 1º filtro: por IP, antes de qualquer outra coisa (barra quem fica martelando o servidor)
const ipLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  keyFn: (req) => req.ip,
  message: 'Too many requests. Please wait a moment and try again.',
});

// Confere se quem está pedindo tem um login válido do Supabase
const requireAuth = async (req, res, next) => {
  if (!supabase) {
    console.error('Login check unavailable: SUPABASE_URL / SUPABASE_ANON_KEY are missing on the server.');
    return res.status(500).json({ error: 'The server login check is not configured.' });
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (!token) {
    return res.status(401).json({ error: 'Please sign in to use the translator.' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      const loginProblem = !error || [400, 401, 403].includes(error.status);
      return res.status(loginProblem ? 401 : 503).json({
        error: loginProblem
          ? 'Your session has expired. Please sign in again.'
          : 'Could not verify your login right now. Please try again.',
      });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error('Error verifying login:', err);
    res.status(503).json({ error: 'Could not verify your login right now. Please try again.' });
  }
};

// Limites por usuário (generosos: quem estuda normalmente nunca chega neles)
const userPerMinuteLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  keyFn: (req) => req.user.id,
  message: 'You are translating very fast. Please wait a few seconds and try again.',
});

const userPerDayLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  max: 300,
  keyFn: (req) => req.user.id,
  message: 'You reached the daily translation limit. Please come back tomorrow.',
});

// ==========================================
// ROTA DA IA (Tradução e Geração de Flashcards)
// ==========================================

app.post('/api/translate', ipLimiter, requireAuth, userPerMinuteLimiter, userPerDayLimiter, async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({
        error: 'The GEMINI_API_KEY is not configured on the server.',
      });
    }

    const body = req.body || {};
    const word = typeof body.word === 'string' ? body.word.trim() : '';
    const sourceLang =
      typeof body.sourceLang === 'string' && body.sourceLang.length <= 40 ? body.sourceLang : 'Japonês';
    const targetLang =
      typeof body.targetLang === 'string' && body.targetLang.length <= 40 ? body.targetLang : 'Português';

    if (!word) {
      return res.status(400).json({
        error: 'Please enter a word or phrase.',
      });
    }

    if (word.length > MAX_WORD_LENGTH) {
      return res.status(400).json({
        error: `Please use a shorter text (up to ${MAX_WORD_LENGTH} characters).`,
      });
    }

    const prompt = `
You are the linguistic assistant for LinguaDeck, a language-learning app.

Analyze the following input:
"${word}"

Source language: ${sourceLang}
Target language: ${targetLang}

Return a valid JSON object with exactly this structure:
{
  "mainWord": "The original word or phrase",
  "reading": "Kana reading if Japanese, otherwise an appropriate reading",
  "romaji": "Romaji if Japanese, otherwise an empty string",
  "meanings": ["Meaning 1", "Meaning 2"],
  "tags": ["JLPT N5", "Verb"],
  "primaryExample": {
    "sourceText": "A natural example in the source language WITHOUT furigana notation",
    "furiganaText": "The same Japanese example using Kanji[reading] notation",
    "targetText": "Natural translation into the target language"
  },
  "extraExamples": [
    {
      "sourceText": "Another natural example WITHOUT furigana notation",
      "furiganaText": "The same Japanese example using Kanji[reading] notation",
      "targetText": "Translation into the target language"
    }
  ]
}

Rules:
1. sourceText must be clean and contain no furigana or square brackets.
2. When the source language is Japanese, furiganaText must include readings for every kanji or kanji compound.
3. Use this notation: 毎朝[まいあさ]、パンを 食[た]べます。
4. Keep hiragana and katakana outside the brackets.
5. For Japanese, reading must be in kana and romaji must be separate.
6. For non-Japanese source languages, reading and romaji may be empty strings.
7. Meanings and translations must be in the target language.
8. Provide one primary example and up to two extra examples.
9. Tags should include a grammatical category and a JLPT level when applicable.
10. Return strictly valid JSON only, without markdown code fences or extra text.
`;

    const result = await generateWithRetry(prompt);
    let responseText = result.response.text().trim();

    responseText = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

    const jsonStartIndex = responseText.indexOf('{');
    const jsonEndIndex = responseText.lastIndexOf('}');
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      responseText = responseText.substring(jsonStartIndex, jsonEndIndex + 1);
    }

    const data = JSON.parse(responseText);

    const normalizedData = {
      mainWord: data.mainWord || word,
      reading: data.reading || '',
      romaji: data.romaji || '',
      meanings: Array.isArray(data.meanings) ? data.meanings : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      primaryExample: {
        sourceText: data.primaryExample?.sourceText || '',
        furiganaText: data.primaryExample?.furiganaText || '',
        targetText: data.primaryExample?.targetText || '',
      },
      extraExamples: Array.isArray(data.extraExamples) ? data.extraExamples : [],
    };

    res.json(normalizedData);
  } catch (error) {
    console.error('Erro ao processar tradução:', error);

    // Se mesmo com retry e modelo reserva o Google continuou sobrecarregado,
    // devolve uma mensagem amigável para o usuário.
    if (isTemporaryError(error)) {
      return res.status(503).json({
        error: 'The AI is receiving a lot of requests right now. Please wait a few seconds and try again.',
      });
    }

    res.status(500).json({
      error: error.message || 'An error occurred while processing the translation.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n=================================`);
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`   Modelos (em ordem): ${MODELS.join(' -> ')}`);
  console.log(`=================================\n`);
});
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

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
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

if (!supabaseUrl || !supabaseKey) {
  console.error('AVISO: Credenciais do Supabase não encontradas no arquivo .env');
}

// Rota de teste inicial
app.get('/', (req, res) => {
  res.json({ message: '🚀 LinguaDeck Backend Server is running smoothly with Supabase and Gemini!' });
});

// ==========================================
// ROTAS DE SUPABASE (Decks & Cards)
// ==========================================

// 1. Obter palavras recentes (para a barra lateral do dashboard)
app.get('/api/decks/recent-words', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase is not configured on the server.' });
    }

    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Criar um novo cartão/palavra
app.post('/api/cards', async (req, res) => {
  const { deck_id, word, reading, translation, type, level } = req.body;

  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase is not configured on the server.' });
    }

    const { data, error } = await supabase
      .from('cards')
      .insert([{ deck_id, word, reading, translation, type, level }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
// ROTA DA IA (Tradução e Geração de Flashcards)
// ==========================================

app.post('/api/translate', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({
        error: 'The GEMINI_API_KEY is not configured on the server.',
      });
    }

    const {
      word,
      sourceLang = 'Japonês',
      targetLang = 'Português',
    } = req.body;

    if (!word || !word.trim()) {
      return res.status(400).json({
        error: 'Please enter a word or phrase.',
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
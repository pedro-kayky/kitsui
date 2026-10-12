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

const genAI = apiKey ? new GoogleGenerativeAI({ apiKey: apiKey }) : null;

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
      return res.status(500).json({ error: 'Supabase não está configurado no servidor.' });
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
      return res.status(500).json({ error: 'Supabase não está configurado no servidor.' });
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
// ROTA DA IA (Tradução e Geração de Flashcards)
// ==========================================

app.post('/api/translate', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({
        error: 'A chave GEMINI_API_KEY não está configurada no servidor.',
      });
    }

    const {
      word,
      sourceLang = 'Japonês',
      targetLang = 'Português',
    } = req.body;

    if (!word || !word.trim()) {
      return res.status(400).json({
        error: 'Por favor, digite uma palavra ou frase.',
      });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 900,
        responseMimeType: 'application/json',
      },
    });

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

    const result = await model.generateContent(prompt);
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
    res.status(500).json({
      error: error.message || 'Ocorreu um erro ao processar a tradução.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n=================================`);
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`=================================\n`);
});
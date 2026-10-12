import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Inicializar o Supabase com as chaves do .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// ROTAS DE SUPABASE (Decks & Cards)
// ==========================================

// 1. Obter palavras recentes (para a barra lateral do dashboard)
app.get('/api/decks/recent-words', async (req, res) => {
  try {
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

// Rota de teste inicial
app.get('/', (req, res) => {
  res.json({ message: '🚀 LinguaDeck API is running smoothly with Supabase!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n=================================`);
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`=================================\n`);
});
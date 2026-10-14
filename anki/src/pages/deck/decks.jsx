import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Mascot from '../../assets/components/pet/Mascot';
import RecentWordsTimeline from '../../assets/components/timeLine/RecentWordsTimeline';
import './Decks.css';

import { supabase } from '../../assets/components/supaBase/supaBaseClient';

// ==========================================
// CONFIGURAÇÕES DO ANKI (pode ajustar os números)
// ==========================================
const START_EASE = 2.5;   // facilidade inicial (o "Good" multiplica o intervalo por isso)
const MIN_EASE = 1.3;     // a facilidade nunca cai abaixo disso
const HARD_FACTOR = 1.2;  // o "Hard" multiplica o intervalo por isso
const EASY_BONUS = 1.3;   // bônus extra do "Easy"
const EASY_START_DAYS = 5; // intervalo do "Easy" em um cartão novo
const EASY_MIN_DAYS = 3;   // o "Easy" perde 1 dia a cada erro, até chegar neste mínimo
const LEARN_AHEAD_MS = 20 * 60 * 1000; // mostra cartões em aprendizado até 20 min antes da hora

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Estado de estudo do cartão (guardado dentro de data.srs no Supabase)
// phase: 'new' | 'learn0' | 'learn1' | 'review'
const getSrs = (card) => {
  const saved = card.data?.srs;
  if (saved && saved.phase) return saved;
  if (!card.dueDate) return { phase: 'new', ease: START_EASE, lapses: 0 };
  // Cartas estudadas antes deste sistema entram como revisão normal
  return { phase: 'review', ease: START_EASE, lapses: 0 };
};

// Intervalo do "Easy" quando o cartão ainda está aprendendo: 5 dias, e vai caindo a cada erro
const easyDaysFor = (lapses) => Math.max(EASY_MIN_DAYS, EASY_START_DAYS - lapses);

// Como os intervalos crescem (cartão já aprendido):
//   Hard = intervalo atual x 1.2
//   Good = intervalo atual x facilidade (começa em 2.5)
//   Easy = intervalo atual x facilidade x 1.3
// A facilidade de cada cartão muda: Easy +0.15, Hard -0.15, Again -0.2, Good não muda
// (nunca abaixo de 1.3). Os resultados são arredondados para dias inteiros.
//
// Calcula o que acontece com o cartão para cada botão (igual ao Anki)
const computeSchedule = (card, rating) => {
  const srs = getSrs(card);
  const lapses = srs.lapses || 0;
  const ease = srs.ease || START_EASE;
  const now = Date.now();

  // Continua em aprendizado (intervalo em minutos)
  const stay = (phase, minutes, newLapses = lapses, newEase = ease) => ({
    interval: 0,
    minutes,
    dueMs: now + minutes * MINUTE_MS,
    srs: { phase, ease: newEase, lapses: newLapses }
  });

  // Aprendeu: vira revisão (intervalo em dias)
  const graduate = (days, newEase = ease) => ({
    interval: days,
    days,
    dueMs: now + days * DAY_MS,
    srs: { phase: 'review', ease: newEase, lapses }
  });

  // Cartão já aprendido: os intervalos crescem conforme o botão escolhido
  if (srs.phase === 'review') {
    const current = Math.max(1, card.interval || 1);
    const hard = Math.max(current + 1, Math.round(current * HARD_FACTOR));
    const good = Math.max(hard + 1, Math.round(current * ease));
    const easy = Math.max(good + 1, Math.round(current * ease * EASY_BONUS));

    if (rating === 'again') return stay('learn1', 1, lapses + 1, Math.max(MIN_EASE, ease - 0.2));
    if (rating === 'hard') return graduate(hard, Math.max(MIN_EASE, ease - 0.15));
    if (rating === 'good') return graduate(good);
    return graduate(easy, ease + 0.15);
  }

  // Segunda etapa do aprendizado (depois de um erro ou do primeiro "Good")
  if (srs.phase === 'learn1') {
    if (rating === 'again') return stay('learn1', 1, lapses + 1);
    if (rating === 'hard') return stay('learn1', 10);
    if (rating === 'good') return graduate(1);
    return graduate(easyDaysFor(lapses));
  }

  // Cartão novo (ou ainda na primeira etapa): 1m, 6m, 10m e Easy em dias
  if (rating === 'again') return stay('learn1', 1, lapses + 1);
  if (rating === 'hard') return stay('learn0', 6);
  if (rating === 'good') return stay('learn1', 10);
  return graduate(easyDaysFor(lapses));
};

const formatDays = (days) => {
  if (days < 30) return `${days}d`;
  if (days < 365) return `${(days / 30).toFixed(1).replace(/\.0$/, '')}mo`;
  return `${(days / 365).toFixed(1).replace(/\.0$/, '')}y`;
};

// Texto que aparece em cima de cada botão (ex.: <1m, <6m, <10m, 5d)
const getButtonLabels = (card) => {
  const label = (rating) => {
    const r = computeSchedule(card, rating);
    return r.minutes !== undefined ? `<${r.minutes}m` : formatDays(r.days);
  };
  return {
    again: label('again'),
    hard: label('hard'),
    good: label('good'),
    easy: label('easy')
  };
};

const shuffle = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Escolhe o próximo cartão da fila: primeiro os novos/vencidos,
// depois os que estão em aprendizado (o que vence primeiro)
const pickNextIndex = (queue) => {
  const now = Date.now();

  const readyIndex = queue.findIndex(
    (card) => !card.dueDate || new Date(card.dueDate).getTime() <= now
  );
  if (readyIndex !== -1) return readyIndex;

  let bestIndex = -1;
  let bestTime = Infinity;
  queue.forEach((card, i) => {
    const time = new Date(card.dueDate).getTime();
    if (time < bestTime && time - now <= LEARN_AHEAD_MS) {
      bestIndex = i;
      bestTime = time;
    }
  });
  return bestIndex;
};

// Contadores do topo (novos, revisões, aprendendo) calculados a partir da fila
const getQueueCounts = (queue) => {
  let newCount = 0;
  let reviewCount = 0;
  let learningCount = 0;

  queue.forEach((card) => {
    const { phase } = getSrs(card);
    if (phase === 'new') newCount++;
    else if (phase === 'review') reviewCount++;
    else learningCount++;
  });

  return { newCount, reviewCount, learningCount };
};

export default function Decks() {
  // Inicialização instantânea via cache local
  const [decks, setDecks] = useState(() => {
    const cached = localStorage.getItem('linguaDeck_cachedDecks');
    return cached ? JSON.parse(cached) : {};
  });
  
  const [deckIdMap, setDeckIdMap] = useState(() => {
    const cachedMap = localStorage.getItem('linguaDeck_cachedDeckIdMap');
    return cachedMap ? JSON.parse(cachedMap) : {};
  });

  const [activeDeckName, setActiveDeckName] = useState(null);
  const [newDeckInput, setNewDeckInput] = useState('');
  const [notification, setNotification] = useState('');

  // User & Loading States
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loadingDecks, setLoadingDecks] = useState(false);

  // Study Mode States (Anki Spaced Repetition)
  const [isStudying, setIsStudying] = useState(false);
  const [studyQueue, setStudyQueue] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Mascot Reactions
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [mascotState, setMascotState] = useState({ mood: 'study', message: null });

  // Session Listener & Supabase Fetching
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchSupabaseDecksAndCards(session.user.id);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchSupabaseDecksAndCards(session.user.id);
      } else {
        setUser(null);
        setDecks({});
        setDeckIdMap({});
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Decks from Supabase and cache locally
  const fetchSupabaseDecksAndCards = async (userId) => {
    setLoadingDecks(true);
    try {
      const { data: decksData, error: decksErr } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', userId);

      if (decksErr) throw decksErr;

      const { data: cardsData, error: cardsErr } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId);

      if (cardsErr) throw cardsErr;

      const formattedDecks = {};
      const idMapping = {};

      (decksData || []).forEach(d => {
        formattedDecks[d.name] = [];
        idMapping[d.name] = d.id;
      });

      (cardsData || []).forEach(card => {
        const deckObj = decksData.find(d => d.id === card.deck_id);
        if (deckObj) {
          formattedDecks[deckObj.name].push({
            id: card.id,
            deck_id: card.deck_id,
            type: card.type,
            data: card.data,
            interval: card.interval || 0,
            dueDate: card.due_date,
            createdAt: card.created_at
          });
        }
      });

      setDecks(formattedDecks);
      setDeckIdMap(idMapping);

      // Guardar no cache para os próximos carregamentos serem instantâneos
      localStorage.setItem('linguaDeck_cachedDecks', JSON.stringify(formattedDecks));
      localStorage.setItem('linguaDeck_cachedDeckIdMap', JSON.stringify(idMapping));
    } catch (err) {
      console.error("Error fetching decks from Supabase:", err);
    } finally {
      setLoadingDecks(false);
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const selectDeckByName = (deckName) => {
    setActiveDeckName(deckName);
    if (deckName && deckIdMap[deckName]) {
      localStorage.setItem('linguaDeck_selectedDeckId', deckIdMap[deckName]);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err) {
      console.error("Login Error:", err.message);
    }
  };

  const getRecentWordsList = () => {
    const allWords = [];
    Object.keys(decks).forEach((deckName) => {
      const cards = decks[deckName] || [];
      cards.forEach((card) => {
        let mainText = '';
        let subReading = '';

        if (card.type === 'word') {
          mainText = card.data?.mainWord || '';
          subReading = card.data?.reading ? `(${card.data.reading})` : '';
        } else {
          const rawFront = card.data?.front || '';
          mainText = rawFront.replace(/<[^>]*>?/gm, ''); 
          subReading = card.data?.backTranslation ? `— ${card.data.backTranslation}` : '';
        }

        allWords.push({
          id: card.id,
          word: mainText,
          reading: subReading,
          type: card.type || 'word',
          addedAt: card.createdAt ? new Date(card.createdAt).toLocaleDateString() : 'Today',
          deckName: deckName
        });
      });
    });
    return allWords.reverse();
  };

  // Create Deck
  const handleCreateDeck = async (e) => {
    e.preventDefault();
    const name = newDeckInput.trim();
    if (!name || !user) return;

    if (decks[name]) {
      showNotification('A deck with this name already exists!');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('decks')
        .insert([{ name, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      const updatedDecks = { ...decks, [name]: [] };
      const updatedMap = { ...deckIdMap, [name]: data.id };

      setDecks(updatedDecks);
      setDeckIdMap(updatedMap);
      
      localStorage.setItem('linguaDeck_selectedDeckId', data.id);
      localStorage.setItem('linguaDeck_cachedDecks', JSON.stringify(updatedDecks));
      localStorage.setItem('linguaDeck_cachedDeckIdMap', JSON.stringify(updatedMap));

      setNewDeckInput('');
      showNotification(`Deck "${name}" created successfully!`);
    } catch (err) {
      console.error("Error creating deck:", err);
      showNotification("Failed to create deck in cloud.");
    }
  };

  // Delete Deck
  const handleDeleteDeck = async (deckName, e) => {
    e.stopPropagation();
    const deckId = deckIdMap[deckName];

    if (window.confirm(`Are you sure you want to delete "${deckName}" and all its cards?`)) {
      try {
        if (deckId) {
          await supabase.from('cards').delete().eq('deck_id', deckId);
          await supabase.from('decks').delete().eq('id', deckId);
        }

        const copyDecks = { ...decks };
        delete copyDecks[deckName];

        const copyMap = { ...deckIdMap };
        delete copyMap[deckName];

        setDecks(copyDecks);
        setDeckIdMap(copyMap);

        localStorage.setItem('linguaDeck_cachedDecks', JSON.stringify(copyDecks));
        localStorage.setItem('linguaDeck_cachedDeckIdMap', JSON.stringify(copyMap));

        if (activeDeckName === deckName) setActiveDeckName(null);
        showNotification('Deck deleted.');
      } catch (err) {
        console.error("Error deleting deck:", err);
        showNotification('Failed to delete deck.');
      }
    }
  };

  // Remove Card
  const handleRemoveCard = async (deckName, cardId) => {
    try {
      const { error } = await supabase.from('cards').delete().eq('id', cardId);
      if (error) throw error;

      const updatedDeckCards = (decks[deckName] || []).filter(item => item.id !== cardId);
      const updatedDecks = { ...decks, [deckName]: updatedDeckCards };

      setDecks(updatedDecks);
      localStorage.setItem('linguaDeck_cachedDecks', JSON.stringify(updatedDecks));

      showNotification('Card removed from deck.');
    } catch (err) {
      console.error("Error removing card:", err);
      showNotification('Failed to remove card.');
    }
  };

  const getDeckStats = (cards = []) => {
    const now = new Date();
    let newCount = 0;
    let reviewCount = 0;

    cards.forEach(card => {
      if (!card.dueDate) {
        newCount++;
      } else if (new Date(card.dueDate) <= now) {
        reviewCount++;
      }
    });

    return { newCount, reviewCount };
  };

  const startStudying = (deckName) => {
    const deckCards = decks[deckName] || [];
    const now = new Date();

    // Cartas novas ou que já venceram, em ordem embaralhada
    // (assim a ordem do estudo não é a mesma da lista do deck)
    const dueCards = shuffle(
      deckCards.filter(card => !card.dueDate || new Date(card.dueDate) <= now)
    );

    selectDeckByName(deckName);
    setStudyQueue(dueCards);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsStudying(true);
    setConsecutiveErrors(0);

    setMascotState({
      mood: 'study',
      message: `Let's review ${deckName}! Take your time with each card.`
    });
  };

  const handleRateCard = async (rating) => {
    const currentCard = studyQueue[currentCardIndex];
    if (!currentCard) return;

    // Calcula o novo intervalo e o novo estado do cartão (igual ao Anki)
    const result = computeSchedule(currentCard, rating);
    const newDueDate = new Date(result.dueMs).toISOString();
    const newData = { ...(currentCard.data || {}), srs: result.srs };
    const updatedCard = {
      ...currentCard,
      interval: result.interval,
      dueDate: newDueDate,
      data: newData
    };

    if (rating === 'again') {
      const nextErrors = consecutiveErrors + 1;
      setConsecutiveErrors(nextErrors);

      if (nextErrors >= 3) {
        setMascotState({
          mood: 'frustrado',
          message: '3 strikes? Don\'t worry! Let\'s take a breath and analyze this word together.'
        });
      } else {
        setMascotState({
          mood: 'study',
          message: 'No worries! Practice makes perfect. We will review this card again.'
        });
      }
    } else {
      if (consecutiveErrors >= 3) {
        setMascotState({
          mood: 'aliviado',
          message: 'Phew! We finally got it! Tough cards mean real progress.'
        });
      } else {
        setMascotState({ mood: 'celebrate', message: null });
      }
      setConsecutiveErrors(0);
    }

    // Atualiza o cartão no deck (tela e cache local)
    const updatedDeckCards = (decks[activeDeckName] || []).map(card =>
      card.id === currentCard.id ? updatedCard : card
    );
    const updatedDecks = { ...decks, [activeDeckName]: updatedDeckCards };
    setDecks(updatedDecks);
    localStorage.setItem('linguaDeck_cachedDecks', JSON.stringify(updatedDecks));

    // Atualiza a fila: se ainda está aprendendo, volta para o fim da fila;
    // se já aprendeu (vira revisão em dias), sai da sessão de hoje
    const updatedQueue = studyQueue.filter((_, i) => i !== currentCardIndex);
    if (result.srs.phase !== 'review') {
      updatedQueue.push(updatedCard);
    }

    setStudyQueue(updatedQueue);
    setShowAnswer(false);

    if (updatedQueue.length > 0) {
      setCurrentCardIndex(Math.max(0, pickNextIndex(updatedQueue)));
    } else {
      setCurrentCardIndex(0);
      setMascotState({
        mood: 'parabens',
        message: 'Congratulations! You cleared all cards in this study session!'
      });
    }

    // Salva o progresso no Supabase
    try {
      const { data: savedRows, error } = await supabase
        .from('cards')
        .update({
          interval: result.interval,
          due_date: newDueDate,
          data: newData
        })
        .eq('id', currentCard.id)
        .select('id');

      if (error) throw error;
      if (!savedRows || savedRows.length === 0) {
        throw new Error('No rows were updated (check the update policy of the cards table).');
      }
    } catch (err) {
      console.error("Error updating SRS in Supabase:", err);
      showNotification('Could not save your progress to the cloud.');
    }
  };

  if (authLoading) {
    return (
      <div className="decks-page-container" style={{ textAlign: 'center', paddingTop: '50px' }}>
        <p>Loading study decks...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="decks-page-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        width: '80%',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '420px',
          width: '80%',
          padding: '36px',
          textAlign: 'center',
          backgroundColor: '#ffffff',        
          borderRadius: '16px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          border: '1px solid var(--border-color, #232334)',
          color: '#000000'
        }}>
          <h2 style={{ marginBottom: '12px', fontSize: '1.5rem', color: '#000000', fontWeight: 'bold' }}>
            Sign in to Decks
          </h2>
          <p style={{ marginBottom: '24px', color: '#a0a0b8', fontSize: '0.9rem', lineHeight: '1.4' }}>
            Please sign in with Google to view and study your saved flashcard decks.
          </p>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '12px 20px',
              backgroundColor: '#4285F4',
              color: '#ffffff',
              border: '1px solid #2b2b3d',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  const recentWordsList = getRecentWordsList();

  return (
    <div className={`decks-page-container${isStudying ? ' studying' : ''}`}>
      {/* No PC, centraliza a tela de estudo (o celular não muda) */}
      <style>{`
        @media (min-width: 900px) {
          .decks-page-container.studying {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: flex-start;
            width: 100%;
            max-width: none;
            margin: 0 auto;
            box-sizing: border-box;
          }
          .decks-page-container.studying .decks-main-content {
            width: 100%;
            max-width: 640px;
            margin: 0 auto;
          }
        }
      `}</style>

      {notification && <div className="notification-toast">{notification}</div>}

      <div className="decks-main-content">
        {isStudying && activeDeckName ? (
          (() => {
            const currentCard = studyQueue[currentCardIndex];
            const isFinished = studyQueue.length === 0 || !currentCard;
            const counts = getQueueCounts(studyQueue);
            const labels = isFinished ? null : getButtonLabels(currentCard);

            return (
              <div className="decks-container">
                <Mascot 
                  mood={isFinished ? 'parabens' : mascotState.mood} 
                  message={isFinished ? 'Amazing job! You crushed all your reviews for today. Take a well-deserved break!' : mascotState.message} 
                  title="Kitsui" 
                />

                {!isFinished && (
                  <div className="deck-view-header">
                    <button onClick={() => setIsStudying(false)} className="btn-back">
                      ← Exit Study Mode
                    </button>
                    
                    <div className="study-top-bar">
                      <h2>{activeDeckName}</h2>
                      <div className="anki-live-counters">
                        <span className="counter-badge counter-new" title="New cards">{counts.newCount}</span>
                        <span className="counter-badge counter-review" title="Review cards">{counts.reviewCount}</span>
                        <span className="counter-badge counter-learning" title="Learning / Due again">{counts.learningCount}</span>
                      </div>
                    </div>
                  </div>
                )}

                {isFinished ? (
                  <div className="empty-deck" style={{ padding: '30px 20px', textAlign: 'center', background: 'var(--bg-card, #1e1e2d)', borderRadius: '12px', border: '1px solid var(--border-color, #2b2b3d)', marginTop: '20px' }}>
                    <p style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '10px', color: '#fff' }}>
                      🎉 Deck cleared! No more reviews for today.
                    </p>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted, #a0a0b8)', marginBottom: '24px' }}>
                      Awesome discipline! Come back tomorrow or add new words via the Translator.
                    </p>
                    <button onClick={() => setIsStudying(false)} className="translator-btn-primary">
                      Back to Decks
                    </button>
                  </div>
                ) : (
                  <div className="anki-study-box">
                    <div className="anki-card-display">
                      <span className="deck-badge" style={{ marginBottom: '12px', display: 'inline-block' }}>
                        {currentCard.type === 'word' ? 'Word Card' : 'Example Card'}
                      </span>
                      
                      <h3 className="anki-front-text">
                        {currentCard.type === 'word' ? currentCard.data?.mainWord : currentCard.data?.front}
                      </h3>

                      {showAnswer && (
                        <div className="anki-answer-section">
                          <p className="deck-meanings" style={{ fontSize: '1.1rem', fontWeight: '500', color: '#60a5fa' }}>
                            {currentCard.type === 'word' ? currentCard.data?.meanings?.join(', ') : currentCard.data?.backTranslation}
                          </p>
                          {currentCard.data?.backFurigana && (
                            <div className="deck-furigana-preview" style={{ marginTop: '12px' }}>
                              <span className="preview-label">Furigana:</span>
                              <span dangerouslySetInnerHTML={{ __html: currentCard.data.backFurigana }} />
                            </div>
                          )}
                          {currentCard.type === 'word' && currentCard.data?.reading && (
                            <p className="deck-reading" style={{ marginTop: '6px' }}>Reading: {currentCard.data.reading}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {!showAnswer ? (
                      <button 
                        onClick={() => setShowAnswer(true)} 
                        className="translator-btn-primary"
                        style={{ width: '100%', marginTop: '16px' }}
                      >
                        Show Answer
                      </button>
                    ) : (
                      <div className="anki-actions-grid">
                        <button onClick={() => handleRateCard('again')} className="btn-anki-rate btn-again">
                          <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.85 }}>{labels.again}</span>
                          Again
                        </button>
                        <button onClick={() => handleRateCard('hard')} className="btn-anki-rate btn-hard">
                          <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.85 }}>{labels.hard}</span>
                          Hard
                        </button>
                        <button onClick={() => handleRateCard('good')} className="btn-anki-rate btn-good">
                          <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.85 }}>{labels.good}</span>
                          Good
                        </button>
                        <button onClick={() => handleRateCard('easy')} className="btn-anki-rate btn-easy">
                          <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.85 }}>{labels.easy}</span>
                          Easy
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()
        ) : activeDeckName !== null ? (
          <div className="decks-container">
            <div className="deck-view-header">
              <button onClick={() => setActiveDeckName(null)} className="btn-back">
                ← Back to Decks
              </button>

              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '12px 0 4px 0', wordBreak: 'break-word' }}>
                {activeDeckName}
              </h1>

              <p className="decks-subtitle" style={{ marginBottom: '16px' }}>
                {(decks[activeDeckName] || []).length} saved cards
              </p>

              {(decks[activeDeckName] || []).length > 0 && (
                <button 
                  onClick={() => startStudying(activeDeckName)} 
                  className="translator-btn-primary" 
                  style={{ width: '100%', padding: '12px 0', marginBottom: '12px' }}
                >
                  Start Study
                </button>
              )}
            </div>

            {(decks[activeDeckName] || []).length === 0 ? (
              <div className="empty-deck">
                <p>This deck is currently empty.</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Go to the Translator tab to add new words or example sentences!
                </p>
              </div>
            ) : (
              <div className="deck-list">
                {(decks[activeDeckName] || []).map((item) => (
                  <div key={item.id} className="deck-card">
                    <div className="deck-card-info">
                      <span className="deck-badge">{item.type === 'word' ? 'Word' : 'Example'}</span>
                      <span className="deck-date">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
                    </div>

                    {item.type === 'word' ? (
                      <div className="card-content-word">
                        <h3>{item.data?.mainWord}</h3>
                        {item.data?.reading && <p className="deck-reading">{item.data.reading}</p>}
                        <p className="deck-meanings">{item.data?.meanings?.join(', ')}</p>
                      </div>
                    ) : (
                      <div className="card-content-example">
                        <p className="deck-source">{item.data?.front}</p>
                        <p className="deck-translation">{item.data?.backTranslation}</p>
                        {item.data?.backFurigana && (
                          <div className="deck-furigana-preview">
                            <span className="preview-label">Furigana Preview:</span>
                            <span dangerouslySetInnerHTML={{ __html: item.data.backFurigana }} />
                          </div>
                        )}
                      </div>
                    )}

                    <button 
                      onClick={() => handleRemoveCard(activeDeckName, item.id)} 
                      className="btn-delete-card"
                      title="Remove card"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="decks-container">
            <Mascot 
              mood="study" 
              message="Welcome to your Decks! Pick a deck to start reviewing or create a new one." 
              title="Kitsui" 
            />

            <div className="decks-header">
              <h1>My Study Decks</h1>
              <p className="decks-subtitle">Organize your study progress by topics or proficiency levels.</p>
            </div>

            <form onSubmit={handleCreateDeck} className="create-deck-form">
              <input 
                type="text"
                placeholder="New deck name (e.g. Intermediate Japanese)..."
                value={newDeckInput}
                onChange={(e) => setNewDeckInput(e.target.value)}
                className="translator-input"
              />
              <button type="submit" className="translator-btn-primary">
                Create Deck
              </button>
            </form>

            <div className="decks-grid">
              {loadingDecks && Object.keys(decks).length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
                  Loading decks...
                </div>
              ) : Object.keys(decks).length === 0 ? (
                <div className="empty-deck">
                  <p>No study decks created yet.</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Create a deck above to start organizing your flashcards!
                  </p>
                </div>
              ) : (
                Object.entries(decks).map(([deckName, items]) => {
                  const stats = getDeckStats(items);
                  return (
                    <div 
                      key={deckName} 
                      className="deck-folder-card"
                      onClick={() => selectDeckByName(deckName)}
                    >
                      <div className="deck-folder-info">
                        <h3>{deckName}</h3>
                        <span className="deck-count">{items.length} total cards</span>
                      </div>

                      <div className="anki-stats-badge" onClick={(e) => e.stopPropagation()}>
                        <span className="stat-new" title="New cards">{stats.newCount}</span>
                        <span className="stat-review" title="Due reviews">{stats.reviewCount}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {items.length > 0 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); startStudying(deckName); }}
                            className="btn-anki-study-shortcut"
                          >
                            Study
                          </button>
                        )}
                        <button 
                          onClick={(e) => handleDeleteDeck(deckName, e)}
                          className="btn-delete-deck"
                          title="Delete deck"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* A lista de palavras recentes fica escondida durante o estudo,
          para não entregar as respostas dos cartões */}
      {!isStudying && (
        <div className="decks-sidebar">
          <RecentWordsTimeline recentWords={recentWordsList} />
        </div>
      )}
    </div>
  );
}
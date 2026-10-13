import React, { useState, useEffect, useRef } from 'react';
import Mascot from '../../assets/components/pet/Mascot';
import { supabase } from '../../assets/components/supaBase/supaBaseClient';
import './Review.css';

export default function Review({ onFinish }) {
  // Sessão do usuário e carregamento
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const loadedUserId = useRef(null); // evita recarregar tudo à toa quando a sessão é "renovada"

  // Decks e cartas vindos do Supabase
  const [userDecks, setUserDecks] = useState([]); // [{ id, name, ... }]
  const [cardsByDeck, setCardsByDeck] = useState({}); // { deckId: [cartas] }
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [cardsToReview, setCardsToReview] = useState([]);

  // Estados da Sessão de Estudo
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);

  // Controle do Mascote e Erros Consecutivos
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [mascotState, setMascotState] = useState({
    mood: 'study',
    message: null
  });

  // Estatísticas da sessão
  const [stats, setStats] = useState({
    correct: 0,
    wrong: 0
  });

  // Carrega os decks e as cartas do usuário no Supabase
  const loadDecksAndCards = async (userId) => {
    setLoading(true);
    setLoadError(null);

    const [decksRes, cardsRes] = await Promise.all([
      supabase.from('decks').select('*').eq('user_id', userId),
      supabase.from('cards').select('*').eq('user_id', userId)
    ]);

    if (decksRes.error || cardsRes.error) {
      console.error('Error loading review data:', decksRes.error || cardsRes.error);
      loadedUserId.current = null;
      setLoadError('Could not load your decks. Please try again.');
      setLoading(false);
      return;
    }

    // Agrupa as cartas por deck
    const grouped = {};
    (cardsRes.data || []).forEach((card) => {
      if (!grouped[card.deck_id]) grouped[card.deck_id] = [];
      grouped[card.deck_id].push(card);
    });

    const decks = decksRes.data || [];
    setUserDecks(decks);
    setCardsByDeck(grouped);

    if (decks.length > 0) {
      // Usa o mesmo deck escolhido na aba Translator, se ele ainda existir
      const savedId = localStorage.getItem('linguaDeck_selectedDeckId');
      const exists = decks.some((d) => String(d.id) === String(savedId));
      setSelectedDeckId(exists ? String(savedId) : String(decks[0].id));
    } else {
      setSelectedDeckId('');
    }

    setLoading(false);
  };

  // Espera o login terminar e recarrega quando o usuário muda (igual ao Translator)
  useEffect(() => {
    const handleSession = (session) => {
      if (session?.user) {
        setUser(session.user);
        if (loadedUserId.current !== session.user.id) {
          loadedUserId.current = session.user.id;
          loadDecksAndCards(session.user.id);
        }
      } else {
        loadedUserId.current = null;
        setUser(null);
        setUserDecks([]);
        setCardsByDeck({});
        setSelectedDeckId('');
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => handleSession(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const selectedDeck = userDecks.find((d) => String(d.id) === String(selectedDeckId));
  const selectedDeckName = selectedDeck?.name || 'your deck';
  const selectedDeckCount = (cardsByDeck[selectedDeckId] || []).length;

  // Iniciar a sessão de estudo com o Deck selecionado
  const handleStartSession = () => {
    const deck = cardsByDeck[selectedDeckId] || [];
    if (deck.length === 0) return;

    // Embaralha os cartões para a sessão
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setCardsToReview(shuffled);
    setCurrentIndex(0);
    setShowAnswer(false);
    setSessionStarted(true);
    setSessionFinished(false);
    setConsecutiveErrors(0);
    setStats({ correct: 0, wrong: 0 });

    setMascotState({
      mood: 'study',
      message: `Let's review ${selectedDeckName}! Take your time with each card.`
    });
  };

  const currentCard = cardsToReview[currentIndex];

  // Ação ao errar o cartão (Botão "Again" / "Errei")
  const handleWrong = () => {
    const nextErrors = consecutiveErrors + 1;
    setConsecutiveErrors(nextErrors);
    setShowAnswer(false);
    setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));

    // Coloca o cartão atual no final da fila para praticar novamente na mesma sessão
    // e avança para o próximo (sempre existe um, porque acabamos de adicionar este no fim)
    setCardsToReview(prev => [...prev, currentCard]);
    setCurrentIndex(prev => prev + 1);

    if (nextErrors >= 3) {
      // 🚨 GATILHO: 3 Erros Seguidos!
      setMascotState({
        mood: 'frustrado',
        message: '3 strikes? Don\'t worry! Let\'s take a breath and analyze this word together.'
      });
    } else {
      setMascotState({
        mood: 'study',
        message: 'No worries! Practice makes perfect. We will see this card again soon.'
      });
    }
  };

  // Ação ao acertar o cartão (Botão "Good" / "Easy")
  const handleCorrect = () => {
    setShowAnswer(false);
    setStats(prev => ({ ...prev, correct: prev.correct + 1 }));

    // Se tinha acumulado erros e agora acertou:
    if (consecutiveErrors >= 3) {
      setMascotState({
        mood: 'aliviado',
        message: 'Phew! We finally got it! Tough cards mean real progress.'
      });
    } else {
      setMascotState({
        mood: 'celebrate',
        message: null // Seleciona frase aleatória do pool de comemoração
      });
    }

    setConsecutiveErrors(0); // Reseta a contagem de erros consecutivos

    // Avança para o próximo cartão ou finaliza
    if (currentIndex + 1 < cardsToReview.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setSessionFinished(true);
      setMascotState({
        mood: 'parabens',
        message: 'Congratulations! You completed all reviews in this deck!'
      });
    }
  };

  // 1. Tela de Seleção de Deck (antes de iniciar o review)
  if (!sessionStarted) {
    return (
      <div className="review-container">
        <Mascot mood="study" title="Kitsui" />

        <div className="review-setup-box">
          <h2>Review Sessions</h2>
          <p>Select a deck to test your knowledge with interactive flashcards:</p>

          {loading ? (
            <p>Loading your decks...</p>
          ) : loadError ? (
            <div className="empty-deck-notice">
              <p>{loadError}</p>
              {user && (
                <button
                  onClick={() => {
                    loadedUserId.current = user.id;
                    loadDecksAndCards(user.id);
                  }}
                  className="start-review-btn"
                >
                  Try again
                </button>
              )}
            </div>
          ) : !user ? (
            <div className="empty-deck-notice">
              <p>Please sign in on the <strong>Translator</strong> tab to review your decks.</p>
            </div>
          ) : userDecks.length === 0 ? (
            <div className="empty-deck-notice">
              <p>No decks found. Go to the <strong>Translator</strong> or <strong>Decks</strong> tab to add new words!</p>
            </div>
          ) : (
            <div className="deck-select-group">
              <select
                value={selectedDeckId}
                onChange={(e) => setSelectedDeckId(e.target.value)}
                className="review-deck-select"
              >
                {userDecks.map((deck) => (
                  <option key={deck.id} value={String(deck.id)}>
                    {deck.name} ({(cardsByDeck[deck.id] || []).length} cards)
                  </option>
                ))}
              </select>

              <button
                onClick={handleStartSession}
                className="start-review-btn"
                disabled={!selectedDeckId || selectedDeckCount === 0}
              >
                Start Study Session 🚀
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Tela de Conclusão da Sessão
  if (sessionFinished) {
    return (
      <div className="review-container">
        <Mascot mood={mascotState.mood} message={mascotState.message} title="Kitsui" />

        <div className="review-results-box">
          <h2>Session Completed! 🎉</h2>
          <div className="results-summary">
            <div className="result-item correct">
              <span className="count">{stats.correct}</span>
              <span className="label">Correct</span>
            </div>
            <div className="result-item wrong">
              <span className="count">{stats.wrong}</span>
              <span className="label">Repeated / Errors</span>
            </div>
          </div>

          <button
            onClick={() => setSessionStarted(false)}
            className="finish-session-btn"
          >
            Back to Deck Selection
          </button>
        </div>
      </div>
    );
  }

  // Helper para renderizar a frente e o verso do cartão
  const cardFront = currentCard?.data?.front || currentCard?.data?.mainWord || '';
  const cardBack = currentCard?.data?.backTranslation || currentCard?.data?.meanings?.join(', ') || '';
  const cardFurigana = currentCard?.data?.backFurigana || currentCard?.data?.reading || null;

  // 3. Tela do Flashcard em Andamento
  return (
    <div className="review-container">
      {/* 🦊 Mascote Reativo */}
      <Mascot
        mood={mascotState.mood}
        message={mascotState.message}
        title="Kitsui"
      />

      <div className="flashcard-wrapper">
        <div className="progress-header">
          <span>Card {currentIndex + 1} of {cardsToReview.length}</span>
          <span className="deck-tag">{selectedDeckName}</span>
        </div>

        {/* Flashcard Box */}
        <div className={`flashcard ${showAnswer ? 'flipped' : ''}`}>
          <div className="card-section front">
            <span className="card-label">FRONT</span>
            <h2 className="card-title">{cardFront}</h2>
          </div>

          {showAnswer && (
            <div className="card-section back">
              <hr className="card-divider" />
              <span className="card-label">BACK / TRANSLATION</span>
              {cardFurigana && (
                <p className="card-furigana" dangerouslySetInnerHTML={{ __html: cardFurigana }} />
              )}
              <p className="card-meaning">{cardBack}</p>
            </div>
          )}
        </div>

        {/* Controles de Resposta */}
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="show-answer-btn"
          >
            Show Answer
          </button>
        ) : (
          <div className="answer-actions">
            <button onClick={handleWrong} className="ans-btn wrong-btn">
              ❌ Again (Wrong)
            </button>
            <button onClick={handleCorrect} className="ans-btn correct-btn">
              ✅ Good (Correct)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
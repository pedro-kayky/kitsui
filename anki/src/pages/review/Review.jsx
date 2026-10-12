import React, { useState, useEffect } from 'react';
import Mascot from '../../assets/components/pet/Mascot';
import './Review.css';

export default function Review({ onFinish }) {
  const [userDecks, setUserDecks] = useState({});
  const [selectedDeck, setSelectedDeck] = useState('');
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

  // Carrega os Decks do localStorage
  useEffect(() => {
    const savedDecks = JSON.parse(localStorage.getItem('linguaDeck_userDecks') || '{}');
    setUserDecks(savedDecks);

    const deckNames = Object.keys(savedDecks);
    if (deckNames.length > 0) {
      setSelectedDeck(deckNames[0]);
    }
  }, []);

  // Iniciar a sessão de estudo com o Deck selecionado
  const handleStartSession = () => {
    const deck = userDecks[selectedDeck] || [];
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
      message: `Let's review ${selectedDeck}! Take your time with each card.`
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
    setCardsToReview(prev => [...prev, currentCard]);

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
    const deckNames = Object.keys(userDecks);

    return (
      <div className="review-container">
        <Mascot mood="study" title="Kitsui" />

        <div className="review-setup-box">
          <h2>Review Sessions</h2>
          <p>Select a deck to test your knowledge with interactive flashcards:</p>

          {deckNames.length === 0 ? (
            <div className="empty-deck-notice">
              <p>No decks found. Go to the <strong>Translator</strong> or <strong>Decks</strong> tab to add new words!</p>
            </div>
          ) : (
            <div className="deck-select-group">
              <select 
                value={selectedDeck} 
                onChange={(e) => setSelectedDeck(e.target.value)}
                className="review-deck-select"
              >
                {deckNames.map(name => (
                  <option key={name} value={name}>
                    {name} ({userDecks[name].length} cards)
                  </option>
                ))}
              </select>

              <button 
                onClick={handleStartSession}
                className="start-review-btn"
                disabled={!selectedDeck || userDecks[selectedDeck]?.length === 0}
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
          <span className="deck-tag">{selectedDeck}</span>
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
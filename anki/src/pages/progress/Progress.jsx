import React, { useState, useEffect } from 'react';
import './Progress.css';
import Mascot from '../../assets/components/pet/Mascot'

export default function Progress() {
  const [totalCards, setTotalCards] = useState(0);
  const [newCardsCount, setNewCardsCount] = useState(0);
  const [reviewCardsCount, setReviewCardsCount] = useState(0);
  const [learnedCardsCount, setLearnedCardsCount] = useState(0);
  const [hardCardsCount, setHardCardsCount] = useState(0);

  const [streak, setStreak] = useState(0);
  const [totalReviewed, setTotalReviewed] = useState(0);

  // Função principal para carregar os dados reais do localStorage
  const loadProgressData = () => {
    const savedDecks = JSON.parse(localStorage.getItem('linguaDeck_userDecks') || '{}');
    const savedStreak = Number(localStorage.getItem('lingua_streak')) || 0;
    const savedReviews = Number(localStorage.getItem('lingua_reviews_count')) || 0;

    const now = new Date();

    let total = 0;
    let newCount = 0;
    let reviewCount = 0;
    let learnedCount = 0;
    let hardCount = 0;

    // Percorre todos os decks e cartões reais do Decks.jsx
    Object.values(savedDecks).forEach((cardsArray) => {
      if (Array.isArray(cardsArray)) {
        total += cardsArray.length;

        cardsArray.forEach((card) => {
          // Classificação por estado do cartão
          if (!card.dueDate) {
            newCount++;
          } else {
            const dueDate = new Date(card.dueDate);
            if (dueDate <= now) {
              reviewCount++;
            }
          }

          // Cartões Aprendidos vs Difíceis
          if (card.interval >= 3) {
            learnedCount++;
          } else if (card.interval > 0 && card.interval < 3) {
            hardCount++;
          }
        });
      }
    });

    setTotalCards(total);
    setNewCardsCount(newCount);
    setReviewCardsCount(reviewCount);
    setLearnedCardsCount(learnedCount);
    setHardCardsCount(hardCount);
    setStreak(savedStreak);
    setTotalReviewed(savedReviews);
  };

  useEffect(() => {
    // 1. Carrega os dados na abertura da página
    loadProgressData();

    // 2. Escuta o evento de atualização enviado pelo Decks.jsx
    window.addEventListener('lingua_storage_updated', loadProgressData);

    return () => {
      window.removeEventListener('lingua_storage_updated', loadProgressData);
    };
  }, []);

  // Percentagem de Domínio Geral (% de cartas aprendidas)
  const masteryPercentage = totalCards > 0 ? Math.round((learnedCardsCount / totalCards) * 100) : 0;

  // Lista de conquistas (Badges)
  const badges = [
    { id: 1, title: 'First Step', desc: 'Complete 1 day of study', icon: '🌱',  unlocked: streak >= 1 || totalReviewed > 0 || learnedCardsCount > 0},
    { id: 2, title: 'Week Warrior', desc: 'Maintain a 7-day streak', icon: '🔥', unlocked: streak >= 7 },
    { id: 3, title: 'Word Collector', desc: 'Save 50+ cards in total', icon: '📚', unlocked: totalCards >= 50 },
    { id: 4, title: 'Memory Knight', desc: 'Review 100+ cards in Anki Mode', icon: '🛡️', unlocked: totalReviewed >= 100 },
    { id: 5, title: 'Master Mind', desc: 'Reach 80% overall mastery with 30+ cards', icon: '🎓', unlocked: totalCards >= 30 && masteryPercentage >= 80},
    { id: 6, title: 'Unstoppable', desc: 'Maintain a 30-day streak', icon: '⚡', unlocked: streak >= 30 },
  ];

  // Reações do mascote
  const getMascotMood = () => {
    if (streak >= 7 || masteryPercentage >= 70) return 'celebrate';
    if (totalCards === 0) return 'explain';
    return 'study';
  };

  const getMascotMessage = () => {
    if (totalCards === 0) return "You don't have any cards yet! Add new words in the Translator tab to start building your decks!";
    if (masteryPercentage >= 70) return `Incredible! Your overall mastery is at ${masteryPercentage}%! Keep pushing forward! 🦊✨`;
    return `You have ${totalCards} cards saved across your decks. Review your due cards today to increase your mastery!`;
  };

  return (
    <div className="progress-container">
      <h1 className="progress-title">Your Learning Progress</h1>

      {/* RPG Mascot Box */}
      <Mascot 
        mood={getMascotMood()} 
        message={getMascotMessage()} 
        title="Kitsui" 
      />

      {/* Widget "Overall Progress" */}
      <div className="overall-progress-card">
        <div className="card-header-rpg">
          <span className="icon">📊</span>
          <h2>Overall Progress</h2>
        </div>

        <div className="chart-center-wrapper">
          <div 
            className="progress-donut-ring" 
            style={{
              background: `conic-gradient(#22c55e 0% ${masteryPercentage}%, #1e293b ${masteryPercentage}% 100%)`
            }}
          >
            <div className="donut-inner-content">
              <span className="donut-percentage">{masteryPercentage}%</span>
            </div>
          </div>
          <p className="mastery-subtitle">Overall Mastery</p>
          <span className="cards-ratio-subtext">{learnedCardsCount} / {totalCards} cards</span>
        </div>

        <div className="progress-card-divider"></div>

        {/* 4 Categorias vindas direto dos seus Decks */}
        <div className="categories-stats-row">
          <div className="cat-stat-item">
            <span className="cat-number text-blue-400">{newCardsCount}</span>
            <span className="cat-label">New</span>
          </div>

          <div className="cat-stat-item">
            <span className="cat-number text-yellow-400">{reviewCardsCount}</span>
            <span className="cat-label">Reviews</span>
          </div>

          <div className="cat-stat-item">
            <span className="cat-number text-rose-500">{hardCardsCount}</span>
            <span className="cat-label">Hard</span>
          </div>

          <div className="cat-stat-item">
            <span className="cat-number text-emerald-400">{learnedCardsCount}</span>
            <span className="cat-label">Learned</span>
          </div>
        </div>
      </div>

      {/* Badges */}
      <h2 className="section-title">Achievements & Badges</h2>
      <div className="badges-grid">
        {badges.map((b) => (
          <div 
            key={b.id} 
            className={`badge-card ${b.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="badge-icon">{b.icon}</div>
            <h3 className="badge-title">{b.title}</h3>
            <p className="badge-desc">{b.desc}</p>
            <span className={`badge-status-tag ${b.unlocked ? 'unlocked' : 'locked'}`}>
              {b.unlocked ? 'Unlocked!' : 'Locked'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
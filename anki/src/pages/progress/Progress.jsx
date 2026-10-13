import React, { useState, useEffect, useRef } from 'react';
import './Progress.css';
import Mascot from '../../assets/components/pet/Mascot';
import { supabase } from '../../assets/components/supaBase/supaBaseClient';

// Lê os campos de agendamento (estilo Anki) da carta.
// Funciona tanto se forem colunas da tabela quanto se estiverem dentro de "data".
// Se a carta não tiver esses campos, ela conta como "New".
const getDueDate = (card) =>
  card.due_date ?? card.dueDate ?? card.data?.dueDate ?? card.data?.due_date ?? null;
const getInterval = (card) =>
  Number(card.interval ?? card.data?.interval ?? 0) || 0;

export default function Progress() {
  const [totalCards, setTotalCards] = useState(0);
  const [newCardsCount, setNewCardsCount] = useState(0);
  const [reviewCardsCount, setReviewCardsCount] = useState(0);
  const [learnedCardsCount, setLearnedCardsCount] = useState(0);
  const [hardCardsCount, setHardCardsCount] = useState(0);

  const [streak, setStreak] = useState(0);
  const [totalReviewed, setTotalReviewed] = useState(0);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const loadedUserId = useRef(null); // evita recarregar à toa quando a sessão é "renovada"

  // Streak e total de revisões ainda vêm do navegador (localStorage)
  const loadLocalStats = () => {
    setStreak(Number(localStorage.getItem('lingua_streak')) || 0);
    setTotalReviewed(Number(localStorage.getItem('lingua_reviews_count')) || 0);
  };

  const resetCounts = () => {
    setTotalCards(0);
    setNewCardsCount(0);
    setReviewCardsCount(0);
    setLearnedCardsCount(0);
    setHardCardsCount(0);
  };

  // Carrega as cartas reais da conta no Supabase e calcula as estatísticas
  const loadCards = async (userId, silent = false) => {
    if (!silent) setLoading(true);
    setLoadError(null);

    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading progress data:', error);
      loadedUserId.current = null;
      setLoadError('Could not load your progress. Please reload the page.');
      setLoading(false);
      return;
    }

    const cards = data || [];
    const now = new Date();

    let newCount = 0;
    let reviewCount = 0;
    let learnedCount = 0;
    let hardCount = 0;

    cards.forEach((card) => {
      // Classificação por estado do cartão
      const dueDateRaw = getDueDate(card);
      if (!dueDateRaw) {
        newCount++;
      } else {
        const dueDate = new Date(dueDateRaw);
        if (dueDate <= now) {
          reviewCount++;
        }
      }

      // Cartões Aprendidos vs Difíceis
      const interval = getInterval(card);
      if (interval >= 3) {
        learnedCount++;
      } else if (interval > 0 && interval < 3) {
        hardCount++;
      }
    });

    setTotalCards(cards.length);
    setNewCardsCount(newCount);
    setReviewCardsCount(reviewCount);
    setLearnedCardsCount(learnedCount);
    setHardCardsCount(hardCount);
    setLoading(false);
  };

  useEffect(() => {
    loadLocalStats();

    // Espera o login terminar e recarrega quando o usuário muda (igual ao Translator)
    const handleSession = (session) => {
      if (session?.user) {
        setUser(session.user);
        if (loadedUserId.current !== session.user.id) {
          loadedUserId.current = session.user.id;
          loadCards(session.user.id);
        }
      } else {
        loadedUserId.current = null;
        setUser(null);
        resetCounts();
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => handleSession(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    // Escuta o evento de atualização (se alguma parte do app disparar)
    const handleStorageUpdate = () => {
      loadLocalStats();
      if (loadedUserId.current) loadCards(loadedUserId.current, true);
    };
    window.addEventListener('lingua_storage_updated', handleStorageUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('lingua_storage_updated', handleStorageUpdate);
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
    if (loading || loadError || !user) return 'explain';
    if (streak >= 7 || masteryPercentage >= 70) return 'celebrate';
    if (totalCards === 0) return 'explain';
    return 'study';
  };

  const getMascotMessage = () => {
    if (loading) return 'Counting your cards...';
    if (loadError) return loadError;
    if (!user) return 'Please sign in on the Translator tab to see your progress!';
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
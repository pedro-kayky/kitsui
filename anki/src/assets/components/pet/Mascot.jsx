import React, { useState, useEffect } from 'react';
import './Mascot.css';

// Importação das imagens
import mascotExplain from '../imgs/translator.png';
import mascotCelebrate from '../imgs/happy.png';
import mascotStudy from '../imgs/bomTrabalho.png';
import mascotSearching from '../imgs/pesquisando.png';
import mascotAliviado from '../imgs/aliviado.png';
import mascotFrustrado from '../imgs/frustado.png';
import mascotParabens from '../imgs/parabens.png';

// 1. Configuração dos pools de Imagens e Frases por Mood
const MOOD_CONFIG = {
  explain: {
    // 1. Mantém apenas a imagem normal de explicação no estado padrão (sem a lupa)
    images: [mascotExplain], 
    messages: [
      "Welcome back! Kitsui is ready. Let's learn something new today!",
      "Consistency is key! A few minutes of study every day makes a huge difference.",
      "Ready to expand your vocabulary? Type or paste a phrase to get started!"
    ]
  },
  
  // 2. Criamos o mood exclusivo para quando a busca estiver a acontecer (loading)
  searching: {
    images: [mascotSearching], // 🔍 A imagem com a lupa fica EXCLUSIVA aqui!
    messages: [
      "Searching the deep corners of memory...",
      "Analyzing words and meanings...",
      "Looking up the best translation for you!"
    ]
  },

  celebrate: {
    images: [mascotCelebrate, mascotParabens],
    messages: [
      "Awesome job! You're crushing it today!",
      "Look at that progress! Keep up the amazing work!"
    ]
  },
  
  study: {
    images: [mascotStudy, mascotAliviado],
    messages: [
      "Great focus! Keep pushing forward.",
      "Phew! Studying hard pays off. Let's keep going!"
    ]
  },

  frustrado: {
    images: [mascotFrustrado],
    messages: [
      "3 strikes? Don't worry! Let's take a breath and analyze this word together."
    ]
  }
};

export default function Mascot({ mood = 'explain', message, title = 'Kitsui' }) {
  const [currentImage, setCurrentImage] = useState(mascotExplain);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    // Obtém a configuração do mood atual ou usa 'explain' como fallback
    const config = MOOD_CONFIG[mood] || MOOD_CONFIG.explain;

    // Seleciona uma imagem aleatória do conjunto do mood
    const randomImage = config.images[Math.floor(Math.random() * config.images.length)];
    setCurrentImage(randomImage);

    // Se o componente recebeu uma `message` via prop (gatilho específico), usa essa.
    // Caso contrário, escolhe uma frase aleatória do pool do mood.
    if (message) {
      setCurrentMessage(message);
    } else {
      const randomMsg = config.messages[Math.floor(Math.random() * config.messages.length)];
      setCurrentMessage(randomMsg);
    }
  }, [mood, message]);

  return (
    <div className="rpg-dialogue-container">
      {/* Retrato do Personagem */}
      <div className="rpg-portrait-wrapper">
        <img 
          src={currentImage} 
          alt={title} 
          className="rpg-portrait-img"
        />
      </div>

      {/* Caixa de Diálogo RPG */}
      <div className="rpg-dialogue-box">
        <div className="rpg-name-tag">{title}</div>
        <p className="rpg-dialogue-text">{currentMessage}</p>
        <div className="rpg-continue-indicator">▼</div>
      </div>
    </div>
  );
}
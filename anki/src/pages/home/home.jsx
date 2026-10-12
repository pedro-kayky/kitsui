import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './Translator.css';
import Mascot from '../../assets/components/pet/Mascot';

import { supabase } from '../../assets/components/supaBase/supaBaseClient';

const LANGUAGES = [
  { code: 'ja', name: 'Japanese', label: '日本語 (Japanese)' },
  { code: 'en', name: 'English', label: 'English' },
  { code: 'pt', name: 'Portuguese', label: 'Português (Portuguese)' },
  { code: 'es', name: 'Spanish', label: 'Español (Spanish)' },
  { code: 'fr', name: 'French', label: 'Français (French)' },
  { code: 'de', name: 'German', label: 'Deutsch (German)' },
  { code: 'ko', name: 'Korean', label: '한국어 (Korean)' },
  { code: 'zh', name: 'Chinese', label: '中文 (Chinese)' },
  { code: 'vi', name: 'Vietnamese', label: 'Tiếng Việt (Vietnamese)' },
  { code: 'ne', name: 'Nepali', label: 'नेपाली (Nepali)' },
  { code: 'si', name: 'Sinhala', label: 'සිංහල (Sinhala)' },
  { code: 'my', name: 'Burmese', label: 'မြန်မာ (Myanmar / Burmese)' },
  { code: 'mn', name: 'Mongolian', label: 'Монгол (Mongolian)' }
];

export default function Translator() {
  const [word, setWord] = useState(() => localStorage.getItem('linguaDeck_lastWord') || '');
  const [sourceLang, setSourceLang] = useState(() => localStorage.getItem('linguaDeck_sourceLang') || 'Japonês');
  const [targetLang, setTargetLang] = useState(() => localStorage.getItem('linguaDeck_targetLang') || 'Português');
  
  const [cardData, setCardData] = useState(() => {
    const saved = localStorage.getItem('linguaDeck_cardData');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);
  const [slowNotice, setSlowNotice] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExamples, setShowExamples] = useState(false);
  const [notification, setNotification] = useState('');

  // States for Decks and User Session
  const [userDecks, setUserDecks] = useState(() => {
    const cached = localStorage.getItem('linguaDeck_cachedDecks');
    if (!cached) return [];
    const parsed = JSON.parse(cached);
    return Object.keys(parsed).map(name => ({ id: name, name }));
  });
  
  const [selectedDeckId, setSelectedDeckId] = useState(
    () => localStorage.getItem('linguaDeck_selectedDeckId') || ''
  );
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserDecksAndMigrate(session.user.id);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadUserDecksAndMigrate(session.user.id);
      } else {
        setUser(null);
        setUserDecks([]);
        setSelectedDeckId('');
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedDeckId) {
      localStorage.setItem('linguaDeck_selectedDeckId', selectedDeckId);
    }
  }, [selectedDeckId]);

  const loadUserDecksAndMigrate = async (userId) => {
    const { data: decksData, error: decksErr } = await supabase
      .from('decks')
      .select('*')
      .eq('user_id', userId);

    if (!decksErr && decksData) {
      setUserDecks(decksData);
      if (decksData.length > 0) {
        const savedDeckId = localStorage.getItem('linguaDeck_selectedDeckId');
        const exists = decksData.some(d => d.id === savedDeckId);

        if (savedDeckId && exists) {
          setSelectedDeckId(savedDeckId);
        } else {
          setSelectedDeckId(decksData[0].id);
        }
      }
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
      setError("Failed to initialize Google Login.");
    }
  };

  useEffect(() => {
    localStorage.setItem('linguaDeck_lastWord', word);
  }, [word]);

  useEffect(() => {
    localStorage.setItem('linguaDeck_sourceLang', sourceLang);
  }, [sourceLang]);

  useEffect(() => {
    localStorage.setItem('linguaDeck_targetLang', targetLang);
  }, [targetLang]);

  useEffect(() => {
    if (cardData) {
      localStorage.setItem('linguaDeck_cardData', JSON.stringify(cardData));
    } else {
      localStorage.removeItem('linguaDeck_cardData');
    }
  }, [cardData]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;

    setLoading(true);
    setError(null);
    setSlowNotice(false);

    // Quando a IA está sobrecarregada, o servidor pode levar até ~27s para
    // trocar de modelo até achar um que responda. Por isso o limite do front é 30s.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // Depois de 4s sem resposta, avisa o usuário que vai demorar mais que o normal.
    const slowTimerId = setTimeout(() => setSlowNotice(true), 4000);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
      
      const response = await fetch(`${API_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, sourceLang, targetLang }),
        signal: controller.signal
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `HTTP Error: ${response.status}`);
      }

      setCardData(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('The AI is taking too long because it is receiving a lot of requests right now. Please wait a moment and try again.');
      } else if (err instanceof TypeError) {
        // fetch falhou antes de receber resposta (sem internet ou backend desligado)
        setError('Could not reach the server. Please check your connection or whether the backend is running.');
      } else {
        // Mensagem enviada pelo servidor (ex.: "The AI is receiving a lot of requests...")
        setError(err.message);
      }
    } finally {
      clearTimeout(timeoutId);
      clearTimeout(slowTimerId);
      setSlowNotice(false);
      setLoading(false);
    }
  };

  const convertToRuby = (text) => {
    if (!text) return '';
    return text.replace(/([^\[]+)\[([^\]]+)\]/g, '<ruby>$1<rt>$2</rt></ruby>');
  };

  const addToDeck = async (itemToAdd, type = 'word') => {
    if (!selectedDeckId) {
      setNotification('Please create or select a deck first!');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    if (!user) {
      setNotification('You must be logged in to save cards!');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    let cardStructure = type === 'example' ? {
      front: itemToAdd.sourceText,
      backTranslation: itemToAdd.targetText,
      backFurigana: convertToRuby(itemToAdd.furiganaText || itemToAdd.sourceText)
    } : itemToAdd;

    try {
      const { error: insertErr } = await supabase
        .from('cards')
        .insert([{
          deck_id: selectedDeckId,
          user_id: user.id,
          type,
          data: cardStructure,
          source_lang: sourceLang,
          target_lang: targetLang
        }]);

      if (insertErr) throw insertErr;

      const targetDeckObj = userDecks.find(d => d.id === selectedDeckId);
      const deckName = targetDeckObj ? targetDeckObj.name : 'Deck';

      setNotification(type === 'word' ? `Word added to "${deckName}"!` : `Example added to "${deckName}"!`);
    } catch (err) {
      console.error("Error adding card to Supabase:", err);
      setNotification('Failed to add card. Please try again.');
    } finally {
      setTimeout(() => setNotification(''), 3000);
    }
  };

  if (authLoading) {
    return (
      <div className="translator-container" style={{ textAlign: 'center', paddingTop: '50px' }}>
        <p>Loading session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="translator-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        width: '80%'
      }}>
        <Mascot mood="explain" message="Please sign in to access Kitsui and save your cards safely!" title="Kitsui" />
        <div style={{
          maxWidth: '420px',
          width: '80%',
          margin: '20px auto',
          padding: '30px',
          textAlign: 'center',
          backgroundColor: 'var(--card-bg, #ffffff)',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          border: '1px solid var(--border-color, #eaeaea)'
        }}>
          <h2 style={{ marginBottom: '12px', fontSize: '1.5rem', color: '#1f2937' }}>Sign in to Kitsui</h2>
          <p style={{ marginBottom: '24px', color: 'var(--text-muted, #666)', fontSize: '0.9rem' }}>
            You need to be signed in with your Google account to translate and store your decks securely in the cloud.
          </p>
          <button 
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '12px 20px',
              backgroundColor: '#4285F4',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
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

  return (
    <div className="translator-container">
      {notification && <div className="notification-toast">{notification}</div>}

      <Mascot 
        mood={loading ? 'searching' : 'explain'} 
        message={
          loading
            ? slowNotice
              ? 'The AI is receiving a lot of requests, so this is taking a bit longer. Hang on, I am trying another one...'
              : 'Searching the deep corners of memory...'
            : null
        }
        title="Kitsui" 
      />

      <form onSubmit={handleSearch} className="search-box">
        <input
          type="text"
          placeholder="Type a word to translate..."
          value={word}
          onChange={(e) => setWord(e.target.value)}
          className="translator-input"
        />

        <div className="lang-selectors">
          <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="translator-select">
            {LANGUAGES.map((lang) => <option key={lang.code} value={lang.code}>{lang.label}</option>)}
          </select>
          <span className="lang-arrow">→</span>
          <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="translator-select">
            {LANGUAGES.map((lang) => <option key={lang.code} value={lang.code}>{lang.label}</option>)}
          </select>
        </div>

        <div className="target-deck-container">
          <label htmlFor="target-deck" className="target-deck-label">Target Deck:</label>
          <select
            id="target-deck"
            value={selectedDeckId}
            onChange={(e) => setSelectedDeckId(e.target.value)}
            className="translator-select deck-selector"
          >
            {userDecks.length === 0 ? (
              <option value="">No decks found (Create one in Decks tab)</option>
            ) : (
              userDecks.map((deck) => (
                <option key={deck.id} value={deck.id}>{deck.name}</option>
              ))
            )}
          </select>
        </div>

        <button type="submit" disabled={loading} className="translator-btn-primary">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className="translator-error">{error}</p>}

      {cardData && (
        <>
          <div className="word-card">
            {cardData.reading && <p className="reading">{cardData.reading}</p>}
            <h1 className="main-word" dangerouslySetInnerHTML={{ __html: convertToRuby(cardData.mainWord) }} />
            <div className="tags-container">
              {cardData.tags?.map((tag, idx) => <span key={idx} className="tag tag-highlight">{tag}</span>)}
              {cardData.meanings?.map((meaning, idx) => <span key={idx} className="tag tag-muted">{meaning}</span>)}
            </div>
            <div style={{ marginTop: '15px' }}>
              <button type="button" className="translator-btn-secondary" onClick={() => addToDeck(cardData, 'word')}>
                + Add Word to Deck
              </button>
            </div>
          </div>

          {cardData.primaryExample && (
            <div className="ai-card">
              <div className="ai-header">
                <span>✨ Main Example </span>
                <button type="button" className="add-example-btn" onClick={() => addToDeck(cardData.primaryExample, 'example')}>
                  + Add Example
                </button>
              </div>
              <div className="example-item">
                <div>
                  <p className="source-text">{cardData.primaryExample.sourceText}</p>
                  <p className="target-text">{cardData.primaryExample.targetText}</p>
                  <div style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-muted, #666)', borderTop: '1px dashed var(--border-color, #ddd)', paddingTop: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>Anki Back Preview (Furigana):</span>
                    <span dangerouslySetInnerHTML={{ __html: convertToRuby(cardData.primaryExample.furiganaText || cardData.primaryExample.sourceText) }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
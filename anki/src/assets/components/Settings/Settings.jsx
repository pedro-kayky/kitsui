import React, { useState } from 'react';
import Mascot from '../pet/Mascot';
import './Settings.css';

export default function Settings({ user, onLogin, onLogout }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    onLogin({ email, password, name, isRegistering });
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    // Aqui podes disparar o envio para o teu backend de suporte
    setSupportSent(true);
    setSupportMessage('');
    setTimeout(() => setSupportSent(false), 4000);
  };

  return (
    <div className="settings-container">
      {/* 🦊 Mascote Reativo na página de Configurações */}
      <Mascot 
        mood="study" 
        message="Manage your account, check out our Premium plans, or reach out to support right here!" 
        title="Kitsui" 
      />

      <div className="settings-grid">
        {/* 👤 SEÇÃO DE CONTA E AUTENTICAÇÃO */}
        <div className="settings-card">
          <h2>Account & Cloud Sync</h2>
          <p className="card-desc">
            {user ? 'Your decks and progress are safely synchronized with the cloud.' : 'Log in to sync your local decks to your email account.'}
          </p>

          {user ? (
            <div className="user-logged-info">
              <div className="user-badge-row">
                <span className="user-avatar-icon">🦊</span>
                <div>
                  <h3>{user.name || 'Language Learner'}</h3>
                  <p className="user-email-text">{user.email}</p>
                </div>
              </div>
              <div className="sync-active-badge">🟢 Cloud Sync Active</div>
              <button onClick={onLogout} className="btn-secondary-action">
                Log Out
              </button>
            </div>
          ) : (
            <form onSubmit={handleAuthSubmit} className="settings-auth-form">
              {isRegistering && (
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="settings-input"
                  required
                />
              )}
              <input 
                type="email" 
                placeholder="Email address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="settings-input"
                required
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="settings-input"
                required
              />
              <button type="submit" className="translator-btn-primary">
                {isRegistering ? 'Create Account & Sync' : 'Log In'}
              </button>
              
              <p className="auth-switch-text">
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                <span onClick={() => setIsRegistering(!isRegistering)}>
                  {isRegistering ? 'Log In' : 'Sign Up'}
                </span>
              </p>
            </form>
          )}
        </div>

        {/* 💎 SEÇÃO DE PLANOS (FREE VS PREMIUM) */}
        <div className="settings-card premium-banner-card">
          <h2>Subscription Plans</h2>
          <p className="card-desc">Choose the experience that fits your learning journey.</p>
          
          <div className="plans-grid">
            <div className={`plan-box ${user?.isPremium ? '' : 'active-plan'}`}>
              <h3>Free Plan</h3>
              <p className="plan-price">¥0 <span className="period">/ month</span></p>
              <ul>
                <li>✨ Access to all study decks & flashcards</li>
                <li>🦊 Kitsui companion included</li>
                <li>📢 Supported by light Google AdSense banners</li>
              </ul>
              <button className="plan-btn disabled" disabled>Current Plan</button>
            </div>

            <div className={`plan-box premium-box ${user?.isPremium ? 'active-plan' : ''}`}>
              <div className="premium-tag">RECOMMENDED</div>
              <h3>LinguaDeck Premium</h3>
              <p className="plan-price">¥500 <span className="period">/ month</span></p>
              <ul>
                <li>🚀 Zero Ads (No Google AdSense)</li>
                <li>⚡ Priority AI Translation server speeds</li>
                <li>📊 Advanced progress analytics & export features</li>
              </ul>
              <button className="translator-btn-primary premium-action-btn">
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>

        {/* 🛠️ SEÇÃO DE SUPORTE AO CLIENTE */}
        <div className="settings-card support-card">
          <h2>Contact Support</h2>
          <p className="card-desc">Found a bug or have a suggestion? Send a message directly to our team.</p>

          {supportSent ? (
            <div className="support-success-msg">
              ✅ Message sent successfully! Thank you for your feedback.
            </div>
          ) : (
            <form onSubmit={handleSupportSubmit} className="support-form">
              <textarea 
                placeholder="Describe your issue or suggestion..." 
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                className="settings-textarea"
                rows="4"
                required
              />
              <button type="submit" className="translator-btn-secondary">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
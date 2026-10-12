import React, { useState } from 'react';
import { supabase } from '../../assets/components/supaBase/supaBaseClient'

export default function Settings({ user, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para o formulário de suporte
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // Função para Login com Google via Supabase
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: supabaseError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (supabaseError) throw supabaseError;
    } catch (err) {
      setError(err.message || 'Erro ao efetuar login com o Google.');
      setLoading(false);
    }
  };

  const handleSendSupport = (e) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;

    const mailtoUrl = `mailto:pedrokayky63@gmail.com?subject=${encodeURIComponent(
    contactSubject || 'Suporte - Kitsui'
    )}&body=${encodeURIComponent(contactMessage)}`;
    window.location.href = mailtoUrl; 

    setContactSent(true);
    setContactSubject('');
    setContactMessage('');
  };

  // Extrai nome e email do utilizador da sessão do Supabase
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Kitsui Learner';
  const displayEmail = user?.email || 'Nenhum email associado';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        width: '100%',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      {/* ==========================================
          CASO 1: UTILIZADOR NÃO LOGADO
         ========================================== */}
      {!user ? (
        <div
          style={{
            maxWidth: '420px',
            width: '100%',
            padding: '36px 30px',
            backgroundColor: '#161926',
            borderRadius: '16px',
            border: '1px solid #282d3f',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
            textAlign: 'center',
            color: '#f3f4f6'
          }}
        >
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '10px', color: '#ffffff' }}>
            Sign in to Kitsui
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '28px', lineHeight: '1.5' }}>
            Please sign in with Google to view and study your saved flashcard decks.
          </p>

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '20px'
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 20px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '12px',
              transition: 'background-color 0.2s',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>
        </div>
      ) : (
        /* ==========================================
            CASO 2: UTILIZADOR LOGADO (ACCOUNT & SETTINGS)
           ========================================== */
        <div
          style={{
            maxWidth: '580px',
            width: '100%',
            padding: '32px',
            backgroundColor: '#161926',
            borderRadius: '16px',
            border: '1px solid #282d3f',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
            color: '#f3f4f6'
          }}
        >
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '24px', color: '#ffffff' }}>
            Account & Settings
          </h2>

          {/* Dados de Perfil */}
          <div
            style={{
              marginBottom: '28px',
              padding: '20px',
              backgroundColor: '#1e2235',
              borderRadius: '12px',
              border: '1px solid #2e344d'
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px', color: '#9ca3af' }}>
              PROFILE INFORMATION
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem' }}>
              <p style={{ margin: 0 }}>
                <span style={{ color: '#9ca3af' }}>Name:</span>{' '}
                <strong style={{ color: '#ffffff' }}>{displayName}</strong>
              </p>
              <p style={{ margin: 0 }}>
                <span style={{ color: '#9ca3af' }}>Email:</span>{' '}
                <strong style={{ color: '#ffffff' }}>{displayEmail}</strong>
              </p>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Account Type:</span>
                <span
                  style={{
                    padding: '2px 8px',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    border: '1px solid rgba(96, 165, 250, 0.3)'
                  }}
                >
                  Google Account
                </span>
              </p>
            </div>
          </div>

          {/* Formulário de Suporte */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#9ca3af' }}>
              CONTACT & SUPPORT
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginBottom: '16px', lineHeight: '1.4' }}>
              Need help or found a issue? Send us a direct message.
            </p>

            {contactSent && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid #22c55e',
                  color: '#86efac',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  marginBottom: '16px'
                }}
              >
                Your mail app was opened! You can now send your message.
              </div>
            )}

            <form onSubmit={handleSendSupport} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Subject (e.g. Bug report, Deck question)"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #2e344d',
                  backgroundColor: '#1e2235',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <textarea
                rows="3"
                placeholder="Describe your question or message..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                required
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #2e344d',
                  backgroundColor: '#1e2235',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Send Support Email
              </button>
            </form>
          </div>

          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #282d3f' }} />

          {/* Botão de Terminar Sessão */}
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
            }}
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
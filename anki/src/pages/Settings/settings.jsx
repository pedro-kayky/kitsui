import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Login from '../../assets/components/login/login';

import { supabase } from '../../assets/components/supaBase/supaBaseClient';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supportMessage, setSupportMessage] = useState('');
  const [notification, setNotification] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  // Enviar mensagem de suporte diretamente para a tabela no Supabase
  const handleSendSupport = async (e) => {
    e.preventDefault();
    if (!supportMessage.trim() || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('support_messages')
        .insert([{
          user_id: user.id,
          email: user.email,
          message: supportMessage
        }]);

      if (error) throw error;

      setNotification('Message sent to support successfully! We will get back to you soon.');
      setSupportMessage('');
    } catch (err) {
      console.error("Error sending support message:", err);
      setNotification('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotification(''), 4000);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-main, #333)' }}>
        <p>Loading settings...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto', padding: '20px', color: 'var(--text-main, #fff)' }}>
      {notification && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          color: '#34d399',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          {notification}
        </div>
      )}

      <h1 style={{ fontSize: '2rem', marginBottom: '8px', fontWeight: '800' }}>Account & Settings</h1>
      <p style={{ color: 'var(--text-muted, #9ca3af)', marginBottom: '30px' }}>
        Manage your connected account preferences and reach out to support if needed.
      </p>

      {/* Secção de Perfil */}
      <div style={{
        backgroundColor: 'var(--card-bg, #1e1e2d)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid var(--border-color, #2b2b3d)',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color, #2b2b3d)', paddingBottom: '10px' }}>
          👤 Profile Information
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem' }}>
          <p><strong>Name:</strong> {user.user_metadata?.full_name || 'Not provided'}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Authentication:</strong> Active Session</p>
        </div>
      </div>

      {/* Secção de Suporte (Guardado na BD) */}
      <div style={{
        backgroundColor: 'var(--card-bg, #1e1e2d)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid var(--border-color, #2b2b3d)',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color, #2b2b3d)', paddingBottom: '10px' }}>
          🛠️ Contact Support
        </h3>
        <form onSubmit={handleSendSupport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <textarea
            rows="4"
            placeholder="Describe your issue or feature request..."
            value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #2b2b3d)',
              backgroundColor: 'var(--input-bg, #12121a)',
              color: 'inherit',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit'
            }}
            required
          />
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-start',
              transition: 'background-color 0.2s'
            }}
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      {/* Secção de Logout */}
      <div style={{
        backgroundColor: 'var(--card-bg, #1e1e2d)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid var(--border-color, #2b2b3d)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '12px', fontSize: '1.2rem', color: '#ef4444' }}>
          🚪 Session Management
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #9ca3af)', marginBottom: '16px' }}>
          Sign out of your account on this browser session.
        </p>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
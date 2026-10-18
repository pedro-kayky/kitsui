import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const PUBLIC_CSS = `
.public-page {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 16px 90px;
  box-sizing: border-box;
  color: #e5e7eb;
  line-height: 1.75;
  text-align: left;
}
.public-page h1 {
  margin: 8px 0 16px;
  font-size: clamp(1.7rem, 4vw, 2.3rem);
  line-height: 1.25;
  color: #ffffff;
}
.public-page h2 {
  margin: 32px 0 10px;
  font-size: 1.35rem;
  color: #ffffff;
}
.public-page h3 {
  margin: 22px 0 8px;
  font-size: 1.1rem;
  color: #ffffff;
}
.public-page p,
.public-page li {
  color: #cbd5e1;
  font-size: 1rem;
}
.public-page p { margin: 0 0 14px; }
.public-page ul,
.public-page ol { margin: 0 0 14px; padding-left: 22px; }
.public-page a { color: #a5b4fc; }
.public-page .public-meta {
  margin: 0 0 24px;
  font-size: 0.85rem;
  color: #94a3b8;
}
.public-footer {
  margin-top: 56px;
  padding-top: 20px;
  border-top: 1px solid #2b2b3d;
  text-align: center;
  font-size: 0.9rem;
  color: #94a3b8;
}
.public-footer nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 16px;
}
.public-footer a { color: #a5b4fc; }
.public-footer p { margin: 12px 0 0; font-size: 0.85rem; color: #94a3b8; }
`;

export default function PublicPage({ title, description, updated, children }) {
  // Cada página pública tem seu próprio título e descrição (bom para o Google)
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | Kitsui`;

    let meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta ? meta.getAttribute('content') : null;
    if (description) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }

    window.scrollTo(0, 0);

    return () => {
      document.title = previousTitle;
      if (meta && previousDescription !== null) {
        meta.setAttribute('content', previousDescription);
      }
    };
  }, [title, description]);

  return (
    <main className="public-page">
      <style>{PUBLIC_CSS}</style>

      <h1>{title}</h1>
      {updated && <p className="public-meta">Last updated: {updated}</p>}

      {children}

      <footer className="public-footer">
        <nav aria-label="Kitsui pages">
          <Link to="/">Home</Link>
          <Link to="/guides">Guides</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/terms">Terms</Link>
          <a href="/privacy.html">Privacy Policy</a>
        </nav>
        <p>© {new Date().getFullYear()} Kitsui</p>
      </footer>
    </main>
  );
}
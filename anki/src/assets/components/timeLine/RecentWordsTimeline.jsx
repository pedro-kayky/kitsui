import React, { useState } from 'react';
import './RecentWordsTimeline.css';

export default function RecentWordsTimeline({ recentWords = [] }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter words based on search term
  const filteredWords = recentWords.filter((item) =>
    item.word?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.reading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.translation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="timeline-card-clean">
      {/* Header */}
      <div className="timeline-header-clean">
        <div className="timeline-title-row">
          <span className="timeline-icon">🕒</span>
          <h3>Recent Words</h3>
        </div>
        <span className="timeline-see-all" onClick={() => alert('Modal coming soon!')}>
          View all →
        </span>
      </div>

      {/* Quick Search for Duplicates */}
      <div className="quick-search-box">
        <input
          type="text"
          placeholder="🔍 Search word..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="timeline-search-input"
        />
        {searchTerm && (
          <p className="search-result-status">
            {filteredWords.length > 0 ? (
              <span className="found-yes">⚠️ Already exists in your decks!</span>
            ) : (
              <span className="found-no">✅ New word (not found).</span>
            )}
          </p>
        )}
      </div>

      {/* Clean Timeline List */}
      <div className="timeline-items-list">
        {filteredWords.length === 0 ? (
          <p className="timeline-empty">No recent entries.</p>
        ) : (
          filteredWords.slice(0, 5).map((item, index) => {
            // Dynamic badge: Shows Level (e.g. N3, B2) if available, otherwise 'Word' or 'Phrase'
            const displayBadge = item.level 
              ? item.level 
              : (item.type === 'word' ? 'Word' : 'Phrase');

            return (
              <div key={item.id || index} className="timeline-row-item">
                <div className="timeline-row-left">
                  <span className={`status-dot ${item.levelColor || 'yellow'}`}></span>
                  
                  {/* Clean Word / Text display */}
                  <span className="word-main" title={item.word}>
                    {item.word.length > 16 ? item.word.substring(0, 16) + '...' : item.word}
                  </span>

                  {item.reading && item.reading !== '()' && (
                    <span className="word-sub-reading">{item.reading}</span>
                  )}
                </div>

                <div className="timeline-row-right">
                  <span className="level-badge-tag">{displayBadge}</span>
                  <span className="time-ago-text">{item.addedAt || 'Today'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
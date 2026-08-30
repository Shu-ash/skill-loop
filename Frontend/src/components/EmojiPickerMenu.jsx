// src/components/EmojiPickerMenu.jsx
import React, { useState } from 'react';

const EMOJI_CATEGORIES = {
  'Tech & Code': [
    '💻', '🚀', '⚡', '🤖', '🧠', '📱', '🌐', '📊', '📈', '🔒', 
    '🛠️', '⚙️', '🖥️', '💾', '📡', '🕹️', '🔋', '⌨️', '🎮', '💡'
  ],
  'Design & Arts': [
    '🎨', '🖌️', '📐', '✍️', '✏️', '📸', '🎥', '🎭', '🎬', '🖼️', 
    '✒️', '🖋️', '🧶', '🪡', '💎', '✨', '🌈', '🧩', '🪞', '🧵'
  ],
  'Languages & Study': [
    '🗣️', '💬', '🌍', '🌎', '🌏', '📚', '📖', '🎓', '🧑‍🏫', '🧑‍💻', 
    '👥', '🤝', '📢', '🎙️', '👂', '🔤', '📝', '📜', '🧭', '🔍'
  ],
  'Music & Audio': [
    '🎵', '🎶', '🎸', '🎹', '🥁', '🎷', '🎺', '🎻', '🎧', '🎙️', 
    '🎼', '📻', '🔊', '🪕', '🪘', '🎙️', '🎤', '🎚️', '🎛️', '🔔'
  ],
  'Sports & Fitness': [
    '⚽', '🏀', '🎾', '🏃', '🏋️', '🧘', '🚴', '🏊', '🥋', '🥊', 
    '⛳', '🛹', '🏸', '🏓', '🧗', '🏄', '🏂', '🎯', '🎳', '♟️'
  ],
  'Food & Life': [
    '🍳', '☕', '🍵', '🍕', '🥗', '🍰', '🌿', '🪴', '🍞', '🍣', 
    '🍔', '🍲', '🥑', '🍎', '🧁', '🍽️', '🪄', '🔮', '🧸', '🌱'
  ],
  'Business & Badges': [
    '💡', '💰', '🪙', '📊', '📈', '👔', '💼', '🎯', '🏆', '🥇', 
    '📣', '🏷️', '📦', '🏢', '🛡️', '👑', '🔥', '⭐', '🌟', '❤️'
  ]
};

export default function EmojiPickerMenu({ selectedEmoji, onSelectEmoji }) {
  const [activeTab, setActiveTab] = useState('Tech & Code');
  const [search, setSearch] = useState('');

  const filteredEmojis = search.trim()
    ? Object.values(EMOJI_CATEGORIES).flat()
    : EMOJI_CATEGORIES[activeTab] || [];

  return (
    <div className="emoji-picker-container" style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '18px',
      border: '1.5px solid rgba(226, 232, 240, 0.95)',
      padding: '0.85rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
      marginTop: '0.4rem'
    }}>
      {/* Category Tabs (Smartphone Style) */}
      <div style={{
        display: 'flex',
        gap: '0.3rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        marginBottom: '0.65rem',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        scrollbarWidth: 'none'
      }}>
        {Object.keys(EMOJI_CATEGORIES).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => { setActiveTab(tab); setSearch(''); }}
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.74rem',
              fontWeight: activeTab === tab && !search ? 700 : 500,
              borderRadius: '9999px',
              border: 'none',
              background: activeTab === tab && !search ? 'var(--violet-primary, #6c5ce7)' : 'rgba(241, 245, 249, 0.9)',
              color: activeTab === tab && !search ? 'white' : 'var(--slate-700, #334155)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Emoji Grid (32+ clickable icons per tab) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))',
        gap: '0.35rem',
        maxHeight: '145px',
        overflowY: 'auto',
        padding: '0.2rem'
      }}>
        {filteredEmojis.map((emoji, idx) => {
          const isSelected = selectedEmoji === emoji;
          return (
            <button
              key={`${emoji}-${idx}`}
              type="button"
              onClick={() => onSelectEmoji(emoji)}
              style={{
                fontSize: '1.35rem',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isSelected ? 'var(--violet-subtle, #f0edff)' : 'transparent',
                border: isSelected ? '2px solid var(--violet-primary, #6c5ce7)' : '1px solid transparent',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'transform 0.1s ease, background 0.1s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title={`Select ${emoji}`}
            >
              {emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}

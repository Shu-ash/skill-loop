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
    <div className="emoji-picker-container">
      {/* Category Tabs (Smartphone Style) */}
      <div className="emoji-picker-tabs">
        {Object.keys(EMOJI_CATEGORIES).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => { setActiveTab(tab); setSearch(''); }}
            className={`emoji-tab-btn ${activeTab === tab && !search ? 'active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Emoji Grid (32+ clickable icons per tab) */}
      <div className="emoji-grid-viewport">
        {filteredEmojis.map((emoji, idx) => {
          const isSelected = selectedEmoji === emoji;
          return (
            <button
              key={`${emoji}-${idx}`}
              type="button"
              onClick={() => onSelectEmoji(emoji)}
              className={`emoji-cell-btn ${isSelected ? 'selected' : ''}`}
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

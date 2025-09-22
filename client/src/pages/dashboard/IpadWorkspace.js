import React, { useMemo, useRef, useState } from 'react';
import './IpadWorkspace.css';

const colorPalette = ['#007AFF', '#5856D6', '#34C759', '#FF9500', '#FF3B30', '#AF52DE'];

const initialScreens = [
  {
    id: 'screen-1',
    name: 'Productivity',
    bookmarks: [
      {
        id: 'calendar',
        title: 'Calendar',
        url: 'https://calendar.google.com',
        color: '#007AFF',
        icon: '📅',
      },
      {
        id: 'notes',
        title: 'Notes',
        url: 'https://keep.google.com',
        color: '#FF9500',
        icon: '🗒️',
      },
      {
        id: 'drive',
        title: 'Drive',
        url: 'https://drive.google.com',
        color: '#34C759',
        icon: '🗂️',
      },
      {
        id: 'focus',
        title: 'Focus Music',
        url: 'https://music.youtube.com',
        color: '#AF52DE',
        icon: '🎧',
      },
    ],
  },
  {
    id: 'screen-2',
    name: 'Agri Tools',
    bookmarks: [
      {
        id: 'market',
        title: 'Marketplace',
        url: '/marketplace',
        color: '#34C759',
        icon: '🌾',
      },
      {
        id: 'sdg',
        title: 'SDG Hub',
        url: '/sdg-knowledge',
        color: '#5856D6',
        icon: '🌍',
      },
      {
        id: 'carbon',
        title: 'Carbon Tracker',
        url: '/carbon-footprint',
        color: '#FF3B30',
        icon: '🌱',
      },
      {
        id: 'pest-detect',
        title: 'Pest Detection',
        url: '/pest-detection',
        color: '#007AFF',
        icon: '🔍',
      },
    ],
  },
  {
    id: 'screen-3',
    name: 'Inspiration',
    bookmarks: [
      {
        id: 'news',
        title: 'Agri News',
        url: 'https://www.agriculture.com',
        color: '#5856D6',
        icon: '📰',
      },
      {
        id: 'community',
        title: 'Community',
        url: 'https://community.agriconnect.com',
        color: '#007AFF',
        icon: '🤝',
      },
      {
        id: 'weather',
        title: 'Weather',
        url: 'https://weather.com',
        color: '#FF9500',
        icon: '⛅️',
      },
    ],
  },
];

const dockApps = [
  {
    id: 'messages',
    title: 'Messages',
    icon: '💬',
    color: '#0A84FF',
    url: 'https://messages.google.com',
  },
  {
    id: 'mail',
    title: 'Mail',
    icon: '✉️',
    color: '#007AFF',
    url: 'https://mail.google.com',
  },
  {
    id: 'safari',
    title: 'Safari',
    icon: '🌐',
    color: '#54A0FF',
    url: 'https://www.google.com',
  },
  {
    id: 'files',
    title: 'Files',
    icon: '📁',
    color: '#5856D6',
    url: 'https://drive.google.com',
  },
  {
    id: 'music',
    title: 'Music',
    icon: '🎵',
    color: '#FF2D55',
    url: 'https://music.apple.com',
  },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const shadeColor = (hexColor, percent) => {
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) {
    return hexColor;
  }

  const num = parseInt(hex, 16);
  const amt = Math.round((percent / 100) * 255);

  const r = clamp((num >> 16) + amt, 0, 255);
  const g = clamp(((num >> 8) & 0x00ff) + amt, 0, 255);
  const b = clamp((num & 0x0000ff) + amt, 0, 255);

  const componentToHex = (component) => component.toString(16).padStart(2, '0');
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
};

const gradientFromColor = (hexColor) => {
  const start = shadeColor(hexColor, 16);
  const end = shadeColor(hexColor, -14);
  return `linear-gradient(145deg, ${start}, ${end})`;
};

const normaliseUrl = (url) => {
  const trimmed = url.trim();
  if (!trimmed) {
    return '';
  }
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

const IpadWorkspace = () => {
  const [screens, setScreens] = useState(initialScreens);
  const [activeScreen, setActiveScreen] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBookmark, setNewBookmark] = useState({
    title: '',
    url: '',
    color: colorPalette[0],
  });

  const touchStartRef = useRef(null);
  const pointerActiveRef = useRef(false);

  const currentScreen = useMemo(() => screens[activeScreen], [screens, activeScreen]);

  const handleScreenChange = (index) => {
    setActiveScreen(clamp(index, 0, screens.length - 1));
  };

  const handleSwipeStart = (clientX) => {
    touchStartRef.current = clientX;
  };

  const handleSwipeEnd = (clientX) => {
    if (touchStartRef.current === null || typeof clientX !== 'number') {
      touchStartRef.current = null;
      return;
    }

    const deltaX = clientX - touchStartRef.current;
    const swipeThreshold = 60;

    if (deltaX > swipeThreshold) {
      handleScreenChange(activeScreen - 1);
    }

    if (deltaX < -swipeThreshold) {
      handleScreenChange(activeScreen + 1);
    }

    touchStartRef.current = null;
  };

  const handleMouseDown = (event) => {
    pointerActiveRef.current = true;
    handleSwipeStart(event.clientX);
  };

  const handleMouseUp = (event) => {
    if (!pointerActiveRef.current) {
      return;
    }
    pointerActiveRef.current = false;
    handleSwipeEnd(event.clientX);
  };

  const handleMouseLeave = (event) => {
    if (!pointerActiveRef.current) {
      return;
    }
    pointerActiveRef.current = false;
    handleSwipeEnd(event.clientX);
  };

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    handleSwipeStart(touch?.clientX ?? null);
  };

  const handleTouchEnd = (event) => {
    const touch = event.changedTouches[0];
    handleSwipeEnd(touch?.clientX ?? null);
  };

  const handleBookmarkOpen = (bookmark) => {
    const destination = normaliseUrl(bookmark.url);

    if (!destination) {
      return;
    }

    if (destination.startsWith('/')) {
      window.location.href = destination;
      return;
    }

    window.open(destination, '_blank', 'noopener,noreferrer');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewBookmark((prev) => ({ title: '', url: '', color: prev.color }));
  };

  const handleBookmarkSubmit = (event) => {
    event.preventDefault();

    const title = newBookmark.title.trim();
    const url = normaliseUrl(newBookmark.url);

    if (!title || !url) {
      return;
    }

    const bookmark = {
      id: `bookmark-${Date.now()}`,
      title,
      url,
      color: newBookmark.color,
      icon: title.charAt(0).toUpperCase(),
    };

    setScreens((prevScreens) =>
      prevScreens.map((screen, index) =>
        index === activeScreen
          ? {
              ...screen,
              bookmarks: [...screen.bookmarks, bookmark],
            }
          : screen,
      ),
    );

    setIsModalOpen(false);
    setNewBookmark({ title: '', url: '', color: newBookmark.color });
  };

  return (
    <div className="workspace">
      <div className="workspace-header">
        <div>
          <p className="workspace-subtitle">Workspace</p>
          <h1 className="workspace-title">{currentScreen?.name ?? 'Home'}</h1>
        </div>
        <div className="screen-indicators" role="tablist" aria-label="Desktop screens">
          {screens.map((screen, index) => (
            <button
              key={screen.id}
              type="button"
              role="tab"
              aria-selected={index === activeScreen}
              aria-label={`Go to ${screen.name}`}
              className={`screen-indicator ${index === activeScreen ? 'active' : ''}`}
              onClick={() => handleScreenChange(index)}
            />
          ))}
        </div>
      </div>

      <div
        className="screens-wrapper"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="screens-track"
          style={{ transform: `translateX(-${activeScreen * 100}%)` }}
        >
          {screens.map((screen) => (
            <section key={screen.id} className="workspace-screen" aria-label={screen.name}>
              <div className="bookmark-grid">
                {screen.bookmarks.map((bookmark) => (
                  <div key={bookmark.id} className="bookmark-item">
                    <button
                      type="button"
                      className="bookmark-icon"
                      style={{ background: gradientFromColor(bookmark.color) }}
                      onClick={() => handleBookmarkOpen(bookmark)}
                    >
                      <span className="bookmark-icon-symbol">{bookmark.icon}</span>
                    </button>
                    <span className="bookmark-label">{bookmark.title}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="add-bookmark-button"
        onClick={() => setIsModalOpen(true)}
        aria-label="Add a new bookmark"
      >
        <span aria-hidden="true">＋</span>
      </button>

      {isModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Add bookmark">
          <form className="modal-card" onSubmit={handleBookmarkSubmit}>
            <h2>Add Bookmark</h2>
            <label className="modal-label" htmlFor="bookmark-title">
              Name
            </label>
            <input
              id="bookmark-title"
              type="text"
              value={newBookmark.title}
              onChange={(event) =>
                setNewBookmark((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Bookmark title"
              required
            />

            <label className="modal-label" htmlFor="bookmark-url">
              Link
            </label>
            <input
              id="bookmark-url"
              type="url"
              value={newBookmark.url}
              onChange={(event) =>
                setNewBookmark((prev) => ({ ...prev, url: event.target.value }))
              }
              placeholder="https://example.com"
              required
            />

            <div className="color-picker">
              <span>Select an icon color</span>
              <div className="color-options">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-swatch ${newBookmark.color === color ? 'selected' : ''}`}
                    style={{ background: gradientFromColor(color) }}
                    onClick={() => setNewBookmark((prev) => ({ ...prev, color }))}
                    aria-label={`Use ${color} for the bookmark icon`}
                  />
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={handleModalClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add Bookmark
              </button>
            </div>
          </form>
        </div>
      )}

      <nav className="dock" aria-label="Dock">
        {dockApps.map((app) => (
          <button
            key={app.id}
            type="button"
            className="dock-app"
            style={{ background: gradientFromColor(app.color) }}
            onClick={() => handleBookmarkOpen(app)}
          >
            <span className="dock-icon" aria-hidden="true">
              {app.icon}
            </span>
            <span className="dock-label">{app.title}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default IpadWorkspace;

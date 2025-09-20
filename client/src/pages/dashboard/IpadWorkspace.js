import React, { useMemo, useRef, useState } from 'react';
import './IpadWorkspace.css';

const getId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const clampIndex = (index, length) => {
  if (index < 0) return 0;
  if (index >= length) return length - 1;
  return index;
};

const lightenDarkenColor = (hex, amt) => {
  let col = hex.replace('#', '');

  if (col.length === 3) {
    col = col.split('').map((c) => c + c).join('');
  }

  const num = parseInt(col, 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0x00ff) + amt;
  let b = (num & 0x0000ff) + amt;

  r = Math.max(Math.min(255, r), 0);
  g = Math.max(Math.min(255, g), 0);
  b = Math.max(Math.min(255, b), 0);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const createGradient = (baseColor) => {
  const light = lightenDarkenColor(baseColor, 40);
  const dark = lightenDarkenColor(baseColor, -40);
  return `linear-gradient(135deg, ${light}, ${dark})`;
};

const DEFAULT_SCREENS = [
  {
    id: 'screen-1',
    name: 'Productivity',
    bookmarks: [
      {
        id: 'bookmark-1',
        title: 'Agri Market',
        url: 'https://example.com/market',
        color: '#007AFF',
      },
      {
        id: 'bookmark-2',
        title: 'Weather',
        url: 'https://weather.com',
        color: '#34C759',
      },
      {
        id: 'bookmark-3',
        title: 'Analytics',
        url: 'https://analytics.google.com',
        color: '#FF9500',
      },
      {
        id: 'bookmark-4',
        title: 'Docs',
        url: 'https://docs.google.com',
        color: '#AF52DE',
      },
      {
        id: 'bookmark-5',
        title: 'Community',
        url: 'https://community.example.com',
        color: '#FF3B30',
      },
      {
        id: 'bookmark-6',
        title: 'News',
        url: 'https://news.ycombinator.com',
        color: '#FF2D55',
      },
    ],
  },
  {
    id: 'screen-2',
    name: 'Innovation',
    bookmarks: [
      {
        id: 'bookmark-7',
        title: 'AI Research',
        url: 'https://ai.google',
        color: '#5AC8FA',
      },
      {
        id: 'bookmark-8',
        title: 'Sustainability',
        url: 'https://sdgs.un.org',
        color: '#FFCC00',
      },
      {
        id: 'bookmark-9',
        title: 'Funding',
        url: 'https://funding.example.com',
        color: '#5856D6',
      },
      {
        id: 'bookmark-10',
        title: 'Design',
        url: 'https://dribbble.com',
        color: '#FF9F0A',
      },
      {
        id: 'bookmark-11',
        title: 'Climate',
        url: 'https://climate.nasa.gov',
        color: '#32ADE6',
      },
      {
        id: 'bookmark-12',
        title: 'Inspiration',
        url: 'https://behance.net',
        color: '#AF52DE',
      },
    ],
  },
  {
    id: 'screen-3',
    name: 'Focus',
    bookmarks: [
      {
        id: 'bookmark-13',
        title: 'Calm',
        url: 'https://calm.com',
        color: '#30B0C7',
      },
      {
        id: 'bookmark-14',
        title: 'Notes',
        url: 'https://keep.google.com',
        color: '#FFD60A',
      },
      {
        id: 'bookmark-15',
        title: 'Music',
        url: 'https://music.apple.com',
        color: '#FF375F',
      },
      {
        id: 'bookmark-16',
        title: 'Focus Docs',
        url: 'https://notion.so',
        color: '#5856D6',
      },
      {
        id: 'bookmark-17',
        title: 'Read Later',
        url: 'https://raindrop.io',
        color: '#007AFF',
      },
      {
        id: 'bookmark-18',
        title: 'Tasks',
        url: 'https://todoist.com',
        color: '#FF453A',
      },
    ],
  },
];

const DEFAULT_DOCK = [
  {
    id: 'dock-1',
    title: 'Mail',
    url: 'https://mail.google.com',
    color: '#007AFF',
  },
  {
    id: 'dock-2',
    title: 'Calendar',
    url: 'https://calendar.google.com',
    color: '#FF9500',
  },
  {
    id: 'dock-3',
    title: 'Files',
    url: 'https://drive.google.com',
    color: '#34C759',
  },
  {
    id: 'dock-4',
    title: 'Messages',
    url: 'https://messages.google.com',
    color: '#5856D6',
  },
];

const IpadWorkspace = () => {
  const [screens, setScreens] = useState(DEFAULT_SCREENS);
  const [dockItems, setDockItems] = useState(DEFAULT_DOCK);
  const [activeScreen, setActiveScreen] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addToDock, setAddToDock] = useState(false);
  const [bookmarkForm, setBookmarkForm] = useState({
    title: '',
    url: '',
    color: '#007AFF',
  });

  const dragStartRef = useRef(null);
  const isDraggingRef = useRef(false);

  const computedScreens = useMemo(
    () =>
      screens.map((screen) => ({
        ...screen,
        bookmarks: screen.bookmarks.map((bookmark) => ({
          ...bookmark,
          gradient: createGradient(bookmark.color),
        })),
      })),
    [screens]
  );

  const computedDock = useMemo(
    () =>
      dockItems.map((bookmark) => ({
        ...bookmark,
        gradient: createGradient(bookmark.color),
      })),
    [dockItems]
  );

  const handleScreenChange = (nextIndex) => {
    setActiveScreen((current) => clampIndex(nextIndex, screens.length));
  };

  const handlePointerStart = (clientX) => {
    dragStartRef.current = clientX;
    isDraggingRef.current = true;
  };

  const handlePointerEnd = (clientX) => {
    if (!isDraggingRef.current || dragStartRef.current === null) return;

    const delta = clientX - dragStartRef.current;
    if (Math.abs(delta) > 60) {
      if (delta < 0) {
        handleScreenChange(activeScreen + 1);
      } else {
        handleScreenChange(activeScreen - 1);
      }
    }
    dragStartRef.current = null;
    isDraggingRef.current = false;
  };

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    handlePointerStart(touch.clientX);
  };

  const handleTouchEnd = (event) => {
    const touch = event.changedTouches[0];
    handlePointerEnd(touch.clientX);
  };

  const handleMouseDown = (event) => {
    handlePointerStart(event.clientX);
  };

  const handleMouseUp = (event) => {
    handlePointerEnd(event.clientX);
  };

  const handleBookmarkClick = (bookmark) => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  const openAddModal = () => {
    setBookmarkForm({ title: '', url: '', color: '#007AFF' });
    setAddToDock(false);
    setShowAddModal(true);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setBookmarkForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!bookmarkForm.title.trim() || !bookmarkForm.url.trim()) {
      return;
    }

    const newBookmark = {
      id: getId(),
      title: bookmarkForm.title.trim(),
      url: bookmarkForm.url.trim(),
      color: bookmarkForm.color,
    };

    setScreens((prev) =>
      prev.map((screen, index) => {
        if (index !== activeScreen) return screen;
        return {
          ...screen,
          bookmarks: [...screen.bookmarks, newBookmark],
        };
      })
    );

    if (addToDock) {
      setDockItems((prev) => [...prev, { ...newBookmark, id: getId() }]);
    }

    setShowAddModal(false);
  };

  const activeScreenName = screens[activeScreen]?.name ?? 'Workspace';

  return (
    <div className="ios-workspace">
      <div className="ios-background" />
      <div className="ios-status-bar">
        <div className="ios-status-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div className="ios-status-icons">
          <span className="ios-status-dot" />
          <span className="ios-status-dot" />
          <span className="ios-status-battery">100%</span>
        </div>
      </div>

      <div className="ios-top-bar">
        <div>
          <h1 className="ios-title">{activeScreenName}</h1>
          <p className="ios-subtitle">Swipe or use the arrows to move between spaces</p>
        </div>
        <div className="ios-controls">
          <button type="button" className="ios-control-button" onClick={() => handleScreenChange(activeScreen - 1)} aria-label="Previous workspace">
            ‹
          </button>
          <button type="button" className="ios-control-button" onClick={() => handleScreenChange(activeScreen + 1)} aria-label="Next workspace">
            ›
          </button>
          <button type="button" className="ios-primary-button" onClick={openAddModal}>
            + Add Bookmark
          </button>
        </div>
      </div>

      <div
        className="ios-screen-wrapper"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <div className="ios-screen-track" style={{ transform: `translateX(-${activeScreen * 100}%)` }}>
          {computedScreens.map((screen) => (
            <div key={screen.id} className="ios-screen">
              <div className="ios-grid">
                {screen.bookmarks.map((bookmark) => (
                  <button
                    key={bookmark.id}
                    type="button"
                    className="ios-app"
                    onClick={() => handleBookmarkClick(bookmark)}
                  >
                    <span className="ios-app-icon" style={{ backgroundImage: bookmark.gradient }}>
                      <span className="ios-app-shine" />
                      <span className="ios-app-initials">{bookmark.title.slice(0, 2).toUpperCase()}</span>
                    </span>
                    <span className="ios-app-title">{bookmark.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ios-page-indicator" role="tablist" aria-label="Workspace selector">
        {screens.map((screen, index) => (
          <button
            key={screen.id}
            type="button"
            role="tab"
            aria-selected={index === activeScreen}
            className={`ios-page-dot ${index === activeScreen ? 'ios-page-dot-active' : ''}`}
            onClick={() => handleScreenChange(index)}
          >
            <span className="sr-only">{screen.name}</span>
          </button>
        ))}
      </div>

      <div className="ios-dock">
        <div className="ios-dock-blur" />
        <div className="ios-dock-inner">
          {computedDock.map((bookmark) => (
            <button
              key={bookmark.id}
              type="button"
              className="ios-dock-app"
              onClick={() => handleBookmarkClick(bookmark)}
            >
              <span className="ios-app-icon" style={{ backgroundImage: bookmark.gradient }}>
                <span className="ios-app-shine" />
                <span className="ios-app-initials">{bookmark.title.slice(0, 2).toUpperCase()}</span>
              </span>
              <span className="ios-app-title">{bookmark.title}</span>
            </button>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="ios-modal-backdrop" role="dialog" aria-modal="true">
          <form className="ios-modal" onSubmit={handleSubmit}>
            <h2 className="ios-modal-title">Add Bookmark</h2>
            <label className="ios-modal-label" htmlFor="bookmarkTitle">
              Title
              <input
                id="bookmarkTitle"
                type="text"
                name="title"
                className="ios-modal-input"
                value={bookmarkForm.title}
                onChange={handleFormChange}
                required
              />
            </label>
            <label className="ios-modal-label" htmlFor="bookmarkUrl">
              URL
              <input
                id="bookmarkUrl"
                type="url"
                name="url"
                className="ios-modal-input"
                value={bookmarkForm.url}
                onChange={handleFormChange}
                required
              />
            </label>
            <label className="ios-modal-label" htmlFor="bookmarkColor">
              Accent Color
              <input
                id="bookmarkColor"
                type="color"
                name="color"
                className="ios-modal-color"
                value={bookmarkForm.color}
                onChange={handleFormChange}
              />
            </label>
            <label className="ios-modal-checkbox">
              <input
                type="checkbox"
                checked={addToDock}
                onChange={(event) => setAddToDock(event.target.checked)}
              />
              <span>Add to dock</span>
            </label>
            <div className="ios-modal-actions">
              <button type="button" className="ios-secondary-button" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button type="submit" className="ios-primary-button">
                Save Bookmark
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default IpadWorkspace;

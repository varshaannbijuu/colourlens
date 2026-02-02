import { useEffect, useRef } from 'react';
import { fetchHistory } from '../services/api.js';

export default function HistoryPanel({ open, onClose, items, loading, error, onLoaded }) {
  const didFetch = useRef(false);

  // Fetch once when the panel first opens
  useEffect(() => {
    if (!open || didFetch.current) return;
    didFetch.current = true;

    let cancelled = false;
    (async () => {
      try {
        const data = await fetchHistory();
        if (!cancelled) onLoaded({ items: data, error: null });
      } catch (err) {
        if (!cancelled) onLoaded({ items: [], error: err.message });
      }
    })();

    return () => { cancelled = true; };
  }, [open, onLoaded]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`history-backdrop ${open ? 'history-backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className={`history-panel ${open ? 'history-panel--open' : ''}`} aria-label="History">

        {/* Header row */}
        <div className="history-panel__header">
          <h2 className="history-panel__title">History</h2>
          <button className="history-panel__close" onClick={onClose} aria-label="Close history">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 5 L15 15 M15 5 L5 15" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="history-panel__body">

          {loading && (
            <div className="history-panel__spinner" role="status" aria-label="Loading history" />
          )}

          {!loading && error && (
            <p className="history-panel__error" role="alert">{error}</p>
          )}

          {!loading && !error && items.length === 0 && (
            <p className="history-panel__empty">No colorized images yet.</p>
          )}

          {!loading && !error && items.length > 0 && (
            <ul className="history-panel__list">
              {items.map((item) => (
                <li key={item.id} className="history-panel__item">
                  <img src={item.resultUrl} alt={item.filename} className="history-panel__thumb" loading="lazy" />
                  <div className="history-panel__meta">
                    <span className="history-panel__filename">{item.filename}</span>
                    <time className="history-panel__date" dateTime={item.createdAt}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}

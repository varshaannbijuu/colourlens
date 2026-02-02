import { useRef } from 'react';

export default function OutputCard({ resultUrl, isProcessing, uploadProgress, error, onRetry }) {
  // determine what to render inside the card
  const uploading = uploadProgress > 0 && uploadProgress < 100 && !isProcessing && !resultUrl;
  const processing = isProcessing && !resultUrl;
  const hasError = !!error && !resultUrl;
  const hasResult = !!resultUrl;

  return (
    <div className="output-card">

      {/* ── Result image ── */}
      {hasResult && (
        <div className="output-card__result">
          <img src={resultUrl} alt="Colorized result" />
          <a
            href={resultUrl}
            download="colorized.png"
            className="output-card__download"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2 V14" />
              <path d="M5 9 L10 14 L15 9" />
              <path d="M3 17 H17" />
            </svg>
            Download
          </a>
        </div>
      )}

      {/* ── Upload progress ── */}
      {uploading && (
        <div className="output-card__status">
          <div className="output-card__progress-track">
            <div className="output-card__progress-fill" style={{ width: `${uploadProgress}%` }} />
          </div>
          <span className="output-card__status-text">Uploading… {uploadProgress}%</span>
        </div>
      )}

      {/* ── Processing spinner ── */}
      {processing && (
        <div className="output-card__status">
          <div className="output-card__spinner" role="status" aria-label="Processing" />
          <span className="output-card__status-text">Processing…</span>
        </div>
      )}

      {/* ── Error ── */}
      {hasError && (
        <div className="output-card__status output-card__status--error">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px', flexDirection: 'column' }}>
            <span className="output-card__error" role="alert">{error}</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="output-card__retry-btn"
                style={{
                  background: '#333',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Empty placeholder (matches screenshot) ── */}
      {!hasResult && !uploading && !processing && !hasError && (
        <div className="output-card__placeholder">
          {/* 4-point sparkle star */}
          <svg className="output-card__icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 4 C24 14 24 14 24 24 C24 14 24 14 24 4" />
            <path d="M24 44 C24 34 24 34 24 24 C24 34 24 34 24 44" />
            <path d="M4 24 C14 24 14 24 24 24 C14 24 14 24 4 24" />
            <path d="M44 24 C34 24 34 24 24 24 C34 24 34 24 44 24" />
            {/* Actual clean 4-point star shape */}
            <path d="M24 6 L27 21 L42 24 L27 27 L24 42 L21 27 L6 24 L21 21 Z" />
            {/* small accent dot top-right */}
            <circle cx="36" cy="12" r="2.5" fill="currentColor" stroke="none" />
          </svg>
          <p className="output-card__label">Your colorized image will appear here</p>
        </div>
      )}
    </div>
  );
}

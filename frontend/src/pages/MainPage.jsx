import { useState, useCallback } from 'react';
import UploadCard from '../components/UploadCard.jsx';
import OutputCard from '../components/OutputCard.jsx';
import HistoryPanel from '../components/HistoryPanel.jsx';
import { colorizeImage } from '../services/api.js';

export default function MainPage() {
  // Upload / processing
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);

  // History drawer
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  const busy = (uploadProgress > 0 && uploadProgress < 100) || isProcessing;

  // ── handlers ──

  const handleFileSelect = useCallback(({ file: selected, error: valErr }) => {
    setError(valErr || null);
    if (valErr) return;
    setFile(selected);
    setResultUrl(null);
    setUploadProgress(0);
  }, []);

  const handleColorize = useCallback(async () => {
    if (!file || busy) return;
    setError(null);
    setResultUrl(null);
    setUploadProgress(0);
    setIsProcessing(false);

    try {
      const result = await colorizeImage(file, (pct) => {
        setUploadProgress(pct);
        if (pct === 100) setIsProcessing(true);
      });
      setIsProcessing(false);
      setResultUrl(result.resultUrl);
    } catch (err) {
      setIsProcessing(false);
      setUploadProgress(0);
      setError(err.message);
    }
  }, [file, busy]);

  const handleClear = useCallback(() => {
    setFile(null);
    setResultUrl(null);
    setUploadProgress(0);
    setIsProcessing(false);
    setError(null);
  }, []);

  const handleRetry = useCallback(async () => {
    if (!file || busy) return;
    setError(null);
    setResultUrl(null);
    setUploadProgress(0);
    setIsProcessing(false);

    try {
      const result = await colorizeImage(file, (pct) => {
        setUploadProgress(pct);
        if (pct === 100) setIsProcessing(true);
      });
      setIsProcessing(false);
      setResultUrl(result.resultUrl);
    } catch (err) {
      setIsProcessing(false);
      setUploadProgress(0);
      setError(err.message);
    }
  }, [file, busy]);

  const handleHistoryLoaded = useCallback(({ items, error: err }) => {
    setHistoryItems(items);
    setHistoryLoading(false);
    setHistoryError(err);
  }, []);

  // ── render ──

  return (
    <div className="main-page">

      {/* Top-right pill History button — matches screenshot exactly */}
      <div className="main-page__topbar">
        <button className="main-page__history-btn" onClick={() => setHistoryOpen(true)}>
          <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="9" r="7.5" />
            <path d="M9 5 V9 L11.5 10.5" />
          </svg>
          History
        </button>
      </div>

      {/* Heading block */}
      <div className="main-page__head">
        <h1 className="main-page__title">Transform Your Vision</h1>
        <p className="main-page__subtitle">Upload an image and watch it come to life with vibrant colors</p>
      </div>

      {/* Two panels side by side */}
      <div className="main-page__panels">
        <UploadCard file={file} onFileSelect={handleFileSelect} disabled={busy} />
        <OutputCard
          resultUrl={resultUrl}
          isProcessing={isProcessing}
          uploadProgress={uploadProgress}
          error={error}
          onRetry={handleRetry}
        />
      </div>

      {/* Action row — only visible when a file is selected */}
      {file && (
        <div className="main-page__actions">
          <button
            className="main-page__btn main-page__btn--primary"
            onClick={handleColorize}
            disabled={busy}
          >
            {isProcessing ? 'Processing…' : busy ? `Uploading… ${uploadProgress}%` : 'Colorize'}
          </button>
          <button
            className="main-page__btn main-page__btn--ghost"
            onClick={handleClear}
            disabled={busy}
          >
            Clear
          </button>
        </div>
      )}

      {/* History drawer */}
      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        items={historyItems}
        loading={historyLoading}
        error={historyError}
        onLoaded={handleHistoryLoaded}
      />
    </div>
  );
}

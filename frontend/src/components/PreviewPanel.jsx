import { useEffect, useRef } from 'react';

export default function PreviewPanel({ file, resultUrl, uploadProgress, isProcessing, error }) {
  const objectUrlRef = useRef(null);

  // Create and clean up object URL when file changes
  useEffect(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    objectUrlRef.current = file ? URL.createObjectURL(file) : null;

    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [file]);

  const showUploadProgress = file && uploadProgress > 0 && uploadProgress < 100 && !isProcessing && !resultUrl && !error;
  const showSpinner = isProcessing;
  const showError = !!error;
  const showResult = !!resultUrl;
  const showBefore = !!file;

  return (
    <div className="preview-panel">

      {/* Before */}
      <div className="preview-panel__col">
        <h3 className="preview-panel__heading">Before</h3>
        <div className="preview-panel__frame">
          {showBefore ? (
            <img src={objectUrlRef.current} alt="Original" />
          ) : (
            <span className="preview-panel__empty">No image selected</span>
          )}
        </div>
      </div>

      {/* Center: arrow / progress / spinner / error */}
      <div className="preview-panel__divider">
        {showUploadProgress && (
          <div className="preview-panel__status">
            <div className="preview-panel__progress-bar">
              <div
                className="preview-panel__progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="preview-panel__progress-text">
              Uploading… {uploadProgress}%
            </span>
          </div>
        )}

        {showSpinner && (
          <div className="preview-panel__status">
            <div className="preview-panel__spinner" aria-label="Processing" role="status" />
            <span className="preview-panel__progress-text">Processing…</span>
          </div>
        )}

        {showError && (
          <p className="preview-panel__error" role="alert">{error}</p>
        )}

        {!showUploadProgress && !showSpinner && !showError && (
          <svg
            className="preview-panel__arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        )}
      </div>

      {/* After */}
      <div className="preview-panel__col">
        <h3 className="preview-panel__heading">After</h3>
        <div className="preview-panel__frame">
          {showResult ? (
            <img src={resultUrl} alt="Colorized" />
          ) : (
            <span className="preview-panel__empty">Result appears here</span>
          )}
        </div>
      </div>
    </div>
  );
}

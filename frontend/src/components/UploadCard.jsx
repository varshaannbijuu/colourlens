import { useState, useRef, useCallback } from 'react';

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024;

export default function UploadCard({ file, onFileSelect, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const validate = useCallback((f) => {
    if (!f) return null;
    if (!ACCEPTED.includes(f.type))
      return { error: `Unsupported format. Use PNG, JPG, or WEBP.` };
    if (f.size > MAX_BYTES)
      return { error: `File is ${(f.size / 1024 / 1024).toFixed(1)} MB. Max 10 MB.` };
    return { file: f };
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const result = validate(e.dataTransfer.files[0]);
    if (result) onFileSelect(result);
  }, [disabled, validate, onFileSelect]);

  const handleChange = useCallback((e) => {
    const result = validate(e.target.files[0]);
    if (result) onFileSelect(result);
    e.target.value = '';
  }, [validate, onFileSelect]);

  return (
    <div
      className={`upload-card ${dragOver && !disabled ? 'upload-card--dragover' : ''} ${disabled ? 'upload-card--disabled' : ''}`}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => { if (e.key === 'Enter' && !disabled) inputRef.current?.click(); }}
      aria-label="Upload image"
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="upload-card__input"
        onChange={handleChange}
      />

      {file ? (
        /* Preview state */
        <div className="upload-card__preview">
          <img src={URL.createObjectURL(file)} alt="Selected" />
          <span className="upload-card__filename">{file.name}</span>
        </div>
      ) : (
        /* Empty / placeholder state — matches screenshot exactly */
        <div className="upload-card__placeholder">
          {/* Upload icon: box with up-arrow */}
          <svg className="upload-card__icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="24" width="32" height="10" rx="3" />
            <path d="M20 22 V6" />
            <path d="M12 14 L20 6 L28 14" />
          </svg>
          <p className="upload-card__label">Click to upload</p>
          <p className="upload-card__sub">or drag and drop</p>
          <p className="upload-card__hint">PNG, JPG, WEBP up to 10MB</p>
        </div>
      )}
    </div>
  );
}

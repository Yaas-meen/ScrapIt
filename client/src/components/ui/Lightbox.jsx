import { useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';

export default function Lightbox({ src, alt = 'Image', onClose }) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center
        justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 p-2 rounded-xl bg-white/10
          hover:bg-white/20 text-white transition"
      >
        <X size={20} />
      </button>

      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-[90vh] object-contain rounded-xl
          shadow-2xl"
      />
    </div>
  );
}

// Thumbnail that opens the lightbox
export function LightboxTrigger({ src, alt, className = '' }) {
  return (
    <button
      type="button"
      onClick={() => window.__openLightbox?.(src)}
      className={`relative group overflow-hidden rounded-xl ${className}`}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/30 opacity-0
        group-hover:opacity-100 flex items-center justify-center transition">
        <ZoomIn size={20} className="text-white" />
      </div>
    </button>
  );
}
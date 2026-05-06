import { Info } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import styles from './ui.module.css';

interface InfoHintProps {
  text: string;
  /** Short name for aria-label, e.g. option label or “Class A / B / C”. */
  contextLabel: string;
  disabled?: boolean;
}

export function InfoHint({ text, contextLabel, disabled }: InfoHintProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => panelRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  return (
    <span ref={wrapRef} className={styles.infoHintWrap}>
      <button
        type="button"
        className={styles.infoHintBtn}
        aria-label={`More about ${contextLabel}`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-describedby={open ? panelId : undefined}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setOpen((v) => !v);
        }}
      >
        <Info size={15} strokeWidth={2} aria-hidden />
      </button>
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="region"
          aria-live="polite"
          className={styles.infoHintPanel}
          tabIndex={-1}
        >
          {text}
        </div>
      )}
    </span>
  );
}

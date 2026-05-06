import { Info } from 'lucide-react';
import { useId } from 'react';
import styles from './ui.module.css';

interface InfoHintProps {
  text: string;
  /** Short name for aria-label, e.g. option label or “Class A / B / C”. */
  contextLabel: string;
  disabled?: boolean;
}

/** Hover / keyboard-focus tooltip; icon-only control (no filled button chrome). */
export function InfoHint({ text, contextLabel, disabled }: InfoHintProps) {
  const tipId = useId();

  return (
    <span className={styles.infoHintWrap}>
      <button
        type="button"
        className={styles.infoHintBtnGhost}
        aria-label={`More about ${contextLabel}`}
        aria-describedby={tipId}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Info size={15} strokeWidth={2} aria-hidden />
      </button>
      <span id={tipId} role="tooltip" className={styles.infoHintFlyout}>
        {text}
      </span>
    </span>
  );
}

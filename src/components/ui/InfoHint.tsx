import { Info } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './ui.module.css';

interface InfoHintProps {
  text: string;
  /** Short name for aria-label, e.g. option label or "Class A / B / C". */
  contextLabel: string;
  disabled?: boolean;
}

interface FlyoutPos {
  top: number;
  left: number;
}

const FLYOUT_WIDTH = 300;
const FLYOUT_GAP = 6;
const VIEWPORT_PAD = 8;

function computePos(btn: HTMLButtonElement): FlyoutPos {
  const r = btn.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Prefer opening above the button, aligned to its right edge
  const preferredTop = r.top - FLYOUT_GAP;
  const preferredLeft = r.right - FLYOUT_WIDTH;

  // Clamp left so it never goes under left sidebar / viewport edge
  const left = Math.max(VIEWPORT_PAD, Math.min(preferredLeft, vw - FLYOUT_WIDTH - VIEWPORT_PAD));

  // Flip to below if not enough room above (assume max ~240px height)
  const FLYOUT_MAX_H = 240;
  const top =
    preferredTop - FLYOUT_MAX_H < VIEWPORT_PAD
      ? r.bottom + FLYOUT_GAP
      : preferredTop - FLYOUT_MAX_H;

  // Clamp top so it never goes off-screen bottom
  const clampedTop = Math.min(top, vh - FLYOUT_MAX_H - VIEWPORT_PAD);

  return { top: clampedTop, left };
}

/** Hover / keyboard-focus / click tooltip; renders via portal so it escapes any overflow ancestor. */
export function InfoHint({ text, contextLabel, disabled }: InfoHintProps) {
  const tipId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<FlyoutPos>({ top: 0, left: 0 });

  const show = useCallback(() => {
    if (!btnRef.current || disabled) return;
    setPos(computePos(btnRef.current));
    setVisible(true);
  }, [disabled]);

  const hide = useCallback(() => setVisible(false), []);

  const toggle = useCallback(() => {
    if (visible) hide();
    else show();
  }, [visible, show, hide]);

  // Recompute on scroll / resize while visible
  useEffect(() => {
    if (!visible) return;
    const update = () => {
      if (btnRef.current) setPos(computePos(btnRef.current));
    };
    window.addEventListener('scroll', update, { capture: true, passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update, { capture: true });
      window.removeEventListener('resize', update);
    };
  }, [visible]);

  // Hide on outside click
  useEffect(() => {
    if (!visible) return;
    const onDown = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        hide();
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [visible, hide]);

  const flyout = visible && !disabled
    ? createPortal(
        <span
          id={tipId}
          role="tooltip"
          className={styles.infoHintFlyout}
          style={{ top: pos.top, left: pos.left }}
        >
          {text}
        </span>,
        document.body,
      )
    : null;

  return (
    <span className={styles.infoHintWrap}>
      <button
        ref={btnRef}
        type="button"
        className={styles.infoHintBtnGhost}
        aria-label={`More about ${contextLabel}`}
        aria-describedby={tipId}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle();
        }}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <Info size={15} strokeWidth={2} aria-hidden />
      </button>
      {flyout}
    </span>
  );
}

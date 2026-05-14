import { useMemo, useState } from 'react';
import styles from './PriceRangeDual.module.css';

interface PriceRangeDualProps {
  minBound: number;
  maxBound: number;
  floor: number | '';
  ceil: number | '';
  onFloor: (v: number | '') => void;
  onCeil: (v: number | '') => void;
  disabled?: boolean;
}

function pct(value: number, minBound: number, maxBound: number): number {
  const span = maxBound - minBound;
  if (span <= 0) return 0;
  return ((value - minBound) / span) * 100;
}

export function PriceRangeDual({
  minBound,
  maxBound,
  floor,
  ceil,
  onFloor,
  onCeil,
  disabled,
}: PriceRangeDualProps) {
  const [focusThumb, setFocusThumb] = useState<'min' | 'max'>('max');

  const lo = floor === '' ? minBound : Math.min(Math.max(floor, minBound), maxBound);
  const hi = ceil === '' ? maxBound : Math.min(Math.max(ceil, minBound), maxBound);
  const safeLo = Math.min(lo, hi);
  const safeHi = Math.max(lo, hi);

  const fillStyle = useMemo(() => {
    const left = pct(safeLo, minBound, maxBound);
    const right = pct(safeHi, minBound, maxBound);
    return {
      left: `${left}%`,
      width: `${Math.max(0, right - left)}%`,
    };
  }, [safeLo, safeHi, minBound, maxBound]);

  return (
    <div className={styles.wrap} role="group" aria-label="Price range in dollars">
      <div className={styles.labels}>
        <span>Min ${safeLo.toLocaleString()}</span>
        <span>Max ${safeHi.toLocaleString()}</span>
      </div>
      <div className={styles.slider}>
        <div className={styles.trackLine} aria-hidden />
        <div className={styles.trackFill} style={fillStyle} aria-hidden />
        <div className={styles.thumbsLayer}>
          <label
            className={styles.thumbLbl}
            style={{ zIndex: focusThumb === 'min' ? 5 : 3 }}
            onPointerDown={() => setFocusThumb('min')}
          >
            <span className={styles.srOnly}>Minimum price</span>
            <input
              type="range"
              min={minBound}
              max={maxBound}
              step={50}
              disabled={disabled}
              value={safeLo}
              onChange={(e) => {
                const v = Number(e.target.value);
                onFloor(v);
                if (safeHi < v) onCeil(v);
              }}
              className={styles.range}
            />
          </label>
          <label
            className={styles.thumbLbl}
            style={{ zIndex: focusThumb === 'max' ? 5 : 3 }}
            onPointerDown={() => setFocusThumb('max')}
          >
            <span className={styles.srOnly}>Maximum price</span>
            <input
              type="range"
              min={minBound}
              max={maxBound}
              step={50}
              disabled={disabled}
              value={safeHi}
              onChange={(e) => {
                const v = Number(e.target.value);
                onCeil(v);
                if (safeLo > v) onFloor(v);
              }}
              className={styles.range}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

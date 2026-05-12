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

export function PriceRangeDual({
  minBound,
  maxBound,
  floor,
  ceil,
  onFloor,
  onCeil,
  disabled,
}: PriceRangeDualProps) {
  const lo = floor === '' ? minBound : Math.min(Math.max(floor, minBound), maxBound);
  const hi = ceil === '' ? maxBound : Math.min(Math.max(ceil, minBound), maxBound);
  const safeLo = Math.min(lo, hi);
  const safeHi = Math.max(lo, hi);

  return (
    <div className={styles.wrap}>
      <div className={styles.labels}>
        <span>Min ${safeLo.toLocaleString()}</span>
        <span>Max ${safeHi.toLocaleString()}</span>
      </div>
      <div className={styles.dual}>
        <label className={styles.rangeLbl}>
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
        <label className={styles.rangeLbl}>
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
  );
}

import { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useApp } from '../../store';
import { calculateVolumeTotals } from '../../data/poolSections';
import formStyles from './forms.module.css';
import styles from './DeckForm.module.css';

function fmtNum(n: number, digits = 0): string {
  if (!Number.isFinite(n) || n === 0) return digits === 0 ? '0' : (0).toFixed(digits);
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Brett spec — bather-load deck-ratio category. */
function deckCategory(deckSf: number, waterSurfaceArea: number):
  | { key: 'minimum' | 'equal' | 'double'; label: string; ratio: number }
  | null {
  if (deckSf <= 0 || waterSurfaceArea <= 0) return null;
  const ratio = deckSf / waterSurfaceArea;
  if (deckSf < waterSurfaceArea) return { key: 'minimum', label: 'Minimum Deck', ratio };
  if (deckSf < 2 * waterSurfaceArea) return { key: 'equal', label: 'Equal Deck', ratio };
  return { key: 'double', label: 'Double Deck', ratio };
}

export function DeckForm() {
  const { state, dispatch } = useApp();
  const d = state.data;
  const disabled = d.isFinalized;

  const volumeTotals = useMemo(() => calculateVolumeTotals(d.poolSections), [d.poolSections]);
  const waterSurfaceArea = volumeTotals.totalArea;
  const category = deckCategory(d.deckSf, waterSurfaceArea);

  const setDeckSf = (v: number) =>
    dispatch({ type: 'UPDATE_DATA', payload: { deckSf: Math.max(0, v) } });

  const isComplete = d.deckSf > 0;

  return (
    <div className={formStyles.form}>
      <div className={styles.titleRow}>
        <h2 className={formStyles.formTitle}>Deck</h2>
        {isComplete && (
          <span className={styles.completeBadge}>
            <CheckCircle2 size={13} aria-hidden="true" />
            Complete
          </span>
        )}
      </div>

      <p className={formStyles.formDesc}>
        Total deck surface area surrounding the pool. The deck-to-pool ratio drives the bather-load
        category used downstream in engineering.
      </p>

      <div className={styles.sectionLabel}>Deck Area</div>

      <div className={styles.fieldRow}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Total deck area</span>
          <div className={styles.numWrap}>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={50}
              className={`${styles.input} ${styles.inputNum}`}
              value={d.deckSf === 0 ? '' : d.deckSf}
              onChange={(e) => setDeckSf(e.target.value === '' ? 0 : Number(e.target.value))}
              placeholder="0"
              disabled={disabled}
              aria-label="Deck area in square feet"
            />
            <span className={styles.unit}>sf</span>
          </div>
        </label>
      </div>

      <div className={styles.totalsLabel}>Bather-Load Impact</div>

      <div className={styles.totals}>
        <div className={styles.totalCard}>
          <div className={styles.totalLabel}>Deck-to-pool ratio</div>
          <div className={styles.totalValueRow}>
            <span className={styles.totalValue}>
              {category ? fmtNum(category.ratio, 2) : '—'}
            </span>
            <span className={styles.totalUnit}>×</span>
          </div>
        </div>
        <div className={styles.totalCard}>
          <div className={styles.totalLabel}>Category</div>
          <div className={styles.totalValueRow}>
            <span className={`${styles.totalValue} ${styles.totalValueText}`}>
              {category ? category.label : '—'}
            </span>
          </div>
        </div>
        <div className={styles.totalCard}>
          <div className={styles.totalLabel}>Water surface area</div>
          <div className={styles.totalValueRow}>
            <span className={styles.totalValue}>{fmtNum(waterSurfaceArea, 0)}</span>
            <span className={styles.totalUnit}>sq ft</span>
          </div>
        </div>
      </div>
    </div>
  );
}

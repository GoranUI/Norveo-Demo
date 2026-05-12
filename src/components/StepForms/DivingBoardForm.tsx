import { CheckCircle2 } from 'lucide-react';
import { useApp } from '../../store';
import { isDivingBoardStepVisible } from '../../utils/codeFeatures';
import formStyles from './forms.module.css';
import styles from './DeckForm.module.css';

function fmtNum(n: number, digits = 0): string {
  if (!Number.isFinite(n) || n === 0) return digits === 0 ? '0' : (0).toFixed(digits);
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function DivingBoardForm() {
  const { state, dispatch } = useApp();
  const d = state.data;
  const disabled = d.isFinalized;

  const setBoards = (v: number) =>
    dispatch({
      type: 'UPDATE_DATA',
      payload: { numDivingBoards: Math.max(0, Math.floor(v)) },
    });

  const setExclusion = (v: number) =>
    dispatch({
      type: 'UPDATE_DATA',
      payload: { divingBoardExclusionSf: Math.max(0, v) },
    });

  const totalExclusion = d.numDivingBoards * d.divingBoardExclusionSf;
  const showInputs = isDivingBoardStepVisible(d);

  if (!showInputs) {
    return (
      <div className={formStyles.form}>
        <div className={styles.titleRow}>
          <h2 className={formStyles.formTitle}>Diving Board</h2>
        </div>
        <p className={formStyles.formDesc}>
          Each board reduces usable deep-end area for bather-load purposes. Brett spec defaults to
          300&nbsp;sf of exclusion per board; tune below if a local code differs.
        </p>
        <div className={styles.naPanel}>
          <p className={styles.naTitle}>Not applicable for the selected pool class</p>
          <p className={styles.naBody}>
            Diving boards are usually omitted for spas, wading pools, leisure rivers, and similar
            vessels. Enable the override if you still need to document boards or exclusions.
          </p>
          <div className={styles.naActions}>
            <button
              type="button"
              className={styles.naBtn}
              disabled={disabled}
              onClick={() =>
                dispatch({ type: 'UPDATE_DATA', payload: { deckDivingWizardOverride: true } })
              }
            >
              Configure diving board anyway
            </button>
            <span className={styles.naGhost}>Also shows the Deck step when it was hidden.</span>
          </div>
        </div>
      </div>
    );
  }

  const isComplete = d.numDivingBoards >= 0;

  return (
    <div className={formStyles.form}>
      <div className={styles.titleRow}>
        <h2 className={formStyles.formTitle}>Diving Board</h2>
        {isComplete && (
          <span className={styles.completeBadge}>
            <CheckCircle2 size={13} aria-hidden="true" />
            Complete
          </span>
        )}
      </div>

      <p className={formStyles.formDesc}>
        Each board reduces usable deep-end area for bather-load purposes. Brett spec defaults to
        300&nbsp;sf of exclusion per board; tune below if a local code differs.
      </p>

      <div className={styles.sectionLabel}>Boards</div>

      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Number of diving boards</span>
          <div className={styles.numWrap}>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              className={`${styles.input} ${styles.inputNum}`}
              value={d.numDivingBoards}
              onChange={(e) => setBoards(e.target.value === '' ? 0 : Number(e.target.value))}
              placeholder="0"
              disabled={disabled}
              aria-label="Number of diving boards"
            />
          </div>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            Exclusion per board <span className={styles.fieldHint}>(default 300)</span>
          </span>
          <div className={styles.numWrap}>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={50}
              className={`${styles.input} ${styles.inputNum}`}
              value={d.divingBoardExclusionSf === 0 ? '' : d.divingBoardExclusionSf}
              onChange={(e) => setExclusion(e.target.value === '' ? 0 : Number(e.target.value))}
              placeholder="300"
              disabled={disabled}
              aria-label="Exclusion per board in square feet"
            />
            <span className={styles.unit}>sf</span>
          </div>
        </label>
      </div>

      <div className={styles.totalsLabel}>Bather-Load Impact</div>

      <div className={styles.totals}>
        <div className={styles.totalCard}>
          <div className={styles.totalLabel}>Boards</div>
          <div className={styles.totalValueRow}>
            <span className={styles.totalValue}>{d.numDivingBoards}</span>
            <span className={styles.totalUnit}>
              {d.numDivingBoards === 1 ? 'board' : 'boards'}
            </span>
          </div>
        </div>
        <div className={styles.totalCard}>
          <div className={styles.totalLabel}>Deep-area exclusion</div>
          <div className={styles.totalValueRow}>
            <span className={styles.totalValue}>{fmtNum(totalExclusion, 0)}</span>
            <span className={styles.totalUnit}>sq ft</span>
          </div>
        </div>
        <div className={styles.totalCard}>
          <div className={styles.totalLabel}>Per-board</div>
          <div className={styles.totalValueRow}>
            <span className={styles.totalValue}>{fmtNum(d.divingBoardExclusionSf, 0)}</span>
            <span className={styles.totalUnit}>sf</span>
          </div>
        </div>
      </div>
    </div>
  );
}

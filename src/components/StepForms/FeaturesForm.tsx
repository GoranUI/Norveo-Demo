import { useApp } from '../../store';
import { MultiSelect } from '../ui/MultiSelect';
import { getOptionCost } from '../../data/configCosts';
import styles from './forms.module.css';

/** Travis Apr 24 — general pool features (extras beyond water features & finishes). */
const OPTIONS = [
  { value: 'Auto Cover', label: 'Auto Cover' },
  { value: 'Pool Slide', label: 'Pool Slide' },
  { value: 'ADA Pool Lift', label: 'ADA Pool Lift' },
  { value: 'In-Floor Cleaning System', label: 'In-Floor Cleaning System' },
  { value: 'Hand Rails', label: 'Hand Rails' },
  { value: 'Deck Jets', label: 'Deck Jets' },
].map((o) => ({ ...o, cost: getOptionCost('poolFeatures', o.value)?.cost }));

export function FeaturesForm() {
  const { state, dispatch } = useApp();
  const d = state.data;
  const disabled = d.isFinalized;

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>Pool Features</h2>
      <p className={styles.formDesc}>
        Optional extras — covers, slides, accessibility lifts, and other on-deck
        features. Pick any that apply.
      </p>
      <MultiSelect
        label="Features"
        options={OPTIONS}
        value={d.poolFeatures}
        onChange={(v) => dispatch({ type: 'UPDATE_DATA', payload: { poolFeatures: v } })}
        disabled={disabled}
      />
    </div>
  );
}

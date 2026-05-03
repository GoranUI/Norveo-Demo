import { useApp } from '../../store';
import { MultiSelect } from '../ui/MultiSelect';
import { getOptionCost } from '../../data/configCosts';
import styles from './forms.module.css';

/** Travis Apr 24 — optional polishing systems on top of primary sanitation. */
const OPTIONS = [
  { value: 'Ozone System', label: 'Ozone System' },
  { value: 'Ultraviolet Light System', label: 'Ultraviolet Light System' },
].map((o) => ({ ...o, cost: getOptionCost('secondarySanitation', o.value)?.cost }));

export function SecondarySanitationForm() {
  const { state, dispatch } = useApp();
  const d = state.data;
  const disabled = d.isFinalized;

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>Secondary Sanitation</h2>
      <p className={styles.formDesc}>
        Optional polishing systems that supplement the primary chemical sanitizer.
        Many commercial codes recommend or require one for indoor pools.
      </p>
      <MultiSelect
        label="Add-on Systems"
        options={OPTIONS}
        value={d.secondarySanitation}
        onChange={(v) => dispatch({ type: 'UPDATE_DATA', payload: { secondarySanitation: v } })}
        disabled={disabled}
      />
    </div>
  );
}

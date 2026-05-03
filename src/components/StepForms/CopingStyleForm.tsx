import { useApp } from '../../store';
import { OptionButton } from '../ui/OptionButton';
import { getOptionCost } from '../../data/configCosts';
import styles from './forms.module.css';

const OPTIONS = [
  { value: 'Bull Nose', label: 'Bull Nose' },
  { value: 'Cantilevered', label: 'Cantilevered' },
  { value: 'Flat', label: 'Flat' },
  { value: 'Rolled Edge', label: 'Rolled Edge' },
].map((o) => ({ ...o, cost: getOptionCost('copingStyle', o.value)?.cost }));

export function CopingStyleForm() {
  const { state, dispatch } = useApp();
  const d = state.data;
  const disabled = d.isFinalized;

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>Coping Style</h2>
      <OptionButton
        label="Style"
        options={OPTIONS}
        value={d.copingStyle}
        onChange={(v) => dispatch({ type: 'UPDATE_DATA', payload: { copingStyle: v } })}
        disabled={disabled}
      />
    </div>
  );
}

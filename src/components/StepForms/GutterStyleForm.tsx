import { useApp } from '../../store';
import { NestedOptionButton } from '../ui/NestedOptionButton';
import { RECIRCULATION_GROUPS } from '../../data/recirculationOptions';
import styles from './forms.module.css';

export function GutterStyleForm() {
  const { state, dispatch } = useApp();
  const d = state.data;
  const disabled = d.isFinalized;

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>Pool Recirculation</h2>
      <NestedOptionButton
        mode="multi"
        label="Family"
        groups={RECIRCULATION_GROUPS}
        value={d.gutterStyle}
        onChange={(v) => dispatch({ type: 'UPDATE_DATA', payload: { gutterStyle: v } })}
        disabled={disabled}
      />
    </div>
  );
}

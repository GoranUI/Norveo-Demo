import { useApp } from '../../store';
import { MultiSelect } from '../ui/MultiSelect';
import { getOptionCost } from '../../data/configCosts';
import styles from './forms.module.css';

const OPTIONS = [
  { value: 'Waterfall', label: 'Waterfall' },
  { value: 'Fountain', label: 'Fountain' },
  { value: 'Bubbler', label: 'Bubbler' },
  { value: 'Laminar Jets', label: 'Laminar Jets' },
  { value: 'Spillover Spa', label: 'Spillover Spa' },
  { value: 'Rain Curtain', label: 'Rain Curtain' },
  { value: 'None', label: 'None' },
].map((o) => ({ ...o, cost: getOptionCost('waterFeatures', o.value)?.cost }));

export function WaterFeaturesForm() {
  const { state, dispatch } = useApp();
  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>Water Features</h2>
      <MultiSelect
        label="Features"
        options={OPTIONS}
        value={state.data.waterFeatures}
        onChange={(v) => dispatch({ type: 'UPDATE_DATA', payload: { waterFeatures: v } })}
        disabled={state.data.isFinalized}
      />
    </div>
  );
}

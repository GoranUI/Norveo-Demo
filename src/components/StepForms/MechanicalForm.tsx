import { useApp } from '../../store';
import { OptionButton } from '../ui/OptionButton';
import { MultiSelect } from '../ui/MultiSelect';
import styles from './forms.module.css';

export function MechanicalForm() {
  const { state, dispatch } = useApp();
  const d = state.data;
  const disabled = d.isFinalized;
  const update = (payload: Record<string, unknown>) => dispatch({ type: 'UPDATE_DATA', payload });

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>Mechanical Systems</h2>
      <OptionButton
        label="System Knowledge"
        options={[
          { value: 'know', label: 'I know my system' },
          { value: 'help', label: 'Help me choose' },
        ]}
        value={d.mechanicalKnowledge}
        onChange={(v) => update({ mechanicalKnowledge: v })}
        disabled={disabled}
      />
      {d.mechanicalKnowledge === 'know' && (
        <div className={styles.conditional}>
          <p className={styles.formDesc}>
            Pick preferred brands per equipment type in the Filtration, Sanitation, and Heating
            steps. Each picker reads from the BackOffice brand catalogue.
          </p>
        </div>
      )}
      {d.mechanicalKnowledge === 'help' && (
        <div className={styles.conditional}>
          <MultiSelect
            label="Priorities"
            options={[
              { value: 'Energy Efficiency', label: 'Energy Efficiency' },
              { value: 'Low Maintenance', label: 'Low Maintenance' },
              { value: 'Budget', label: 'Budget Friendly' },
              { value: 'Performance', label: 'Performance' },
              { value: 'Quiet Operation', label: 'Quiet Operation' },
            ]}
            value={d.mechanicalPriorities}
            onChange={(v) => update({ mechanicalPriorities: v })}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}

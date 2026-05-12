import { useApp } from '../../store';
import { OptionButton } from '../ui/OptionButton';
import styles from './forms.module.css';

export function ProjectTypeForm() {
  const { state, dispatch } = useApp();
  const d = state.data;
  const disabled = d.isFinalized;

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>Project Type</h2>
      <OptionButton
        label="Type"
        options={[
          { value: 'New Construction', label: 'New Construction' },
          { value: 'Renovation', label: 'Renovation' },
          { value: 'Addition', label: 'Addition' },
        ]}
        value={d.projectType}
        onChange={(v) => dispatch({ type: 'UPDATE_DATA', payload: { projectType: v } })}
        disabled={disabled}
      />

      <p className={styles.formDesc} style={{ marginTop: 'var(--sp-5)', fontWeight: 600, marginBottom: 4 }}>
        Pool environment
      </p>
      <p className={styles.formDesc} style={{ marginTop: 0 }}>
        Indoor vs outdoor affects heater surface-loss assumptions and is summarized on the Heating
        step as read-only context.
      </p>
      <OptionButton
        label=""
        options={[
          { value: 'outdoor', label: 'Outdoor' },
          { value: 'indoor', label: 'Indoor' },
        ]}
        value={d.poolEnvironment}
        onChange={(v) =>
          dispatch({
            type: 'UPDATE_DATA',
            payload: { poolEnvironment: v as 'indoor' | 'outdoor' },
          })
        }
        disabled={disabled}
      />
    </div>
  );
}

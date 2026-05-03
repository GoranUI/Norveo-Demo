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
    </div>
  );
}

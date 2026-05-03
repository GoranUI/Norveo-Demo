import { useApp } from '../../store';
import { TextInput } from '../ui/TextInput';
import styles from './forms.module.css';

export function CustomerForm() {
  const { state, dispatch } = useApp();
  const d = state.data;
  const disabled = d.isFinalized;

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>Customer</h2>
      <p className={styles.formDesc}>Link the project owner or CRM record.</p>
      <TextInput label="Owner / CRM Link" value={d.ownerCrmLink} onChange={(v) => dispatch({ type: 'UPDATE_DATA', payload: { ownerCrmLink: v } })} placeholder="CRM URL or owner name" disabled={disabled} />
    </div>
  );
}

import { useApp } from '../../store';
import { TextInput } from '../ui/TextInput';
import styles from './forms.module.css';

export function ProjectLocationForm() {
  const { state, dispatch } = useApp();
  const d = state.data;
  const disabled = d.isFinalized;
  const update = (payload: Record<string, string>) => dispatch({ type: 'UPDATE_DATA', payload });

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>Project Location</h2>
      <p className={styles.formDesc}>Enter the project site address.</p>
      <TextInput label="Project Name" value={d.projectName} onChange={(v) => update({ projectName: v })} placeholder="e.g. Smith Residence" disabled={disabled} />
      <TextInput label="Street Address" value={d.projectAddress} onChange={(v) => update({ projectAddress: v })} placeholder="123 Main St" disabled={disabled} required />
      <div className={styles.row3}>
        <TextInput label="City" value={d.projectCity} onChange={(v) => update({ projectCity: v })} disabled={disabled} required />
        <TextInput label="State" value={d.projectState} onChange={(v) => update({ projectState: v })} disabled={disabled} required />
        <TextInput label="Zip" value={d.projectZip} onChange={(v) => update({ projectZip: v })} disabled={disabled} required />
      </div>
    </div>
  );
}

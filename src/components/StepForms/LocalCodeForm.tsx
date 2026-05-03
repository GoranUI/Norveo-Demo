import { useState, type KeyboardEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { useApp } from '../../store';
import { OptionButton } from '../ui/OptionButton';
import { MultiSelect } from '../ui/MultiSelect';
import { CODE_STANDARDS } from '../../data/codeStandards';
import formStyles from './forms.module.css';
import styles from './LocalCodeForm.module.css';

const CODE_OPTIONS = CODE_STANDARDS.map((c) => ({
  value: c.id,
  label: c.label,
}));

export function LocalCodeForm() {
  const { state, dispatch } = useApp();
  const d = state.data;
  const disabled = d.isFinalized;

  const [draft, setDraft] = useState('');

  const update = (payload: Record<string, unknown>) =>
    dispatch({ type: 'UPDATE_DATA', payload });

  const addCustom = () => {
    const trimmed = draft.trim();
    if (!trimmed || disabled) return;
    if (d.customCodes.includes(trimmed)) {
      setDraft('');
      return;
    }
    update({ customCodes: [...d.customCodes, trimmed] });
    setDraft('');
  };

  const removeCustom = (code: string) =>
    update({ customCodes: d.customCodes.filter((c) => c !== code) });

  const onDraftKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustom();
    }
  };

  return (
    <div className={formStyles.form}>
      <h2 className={formStyles.formTitle}>Local Code Awareness</h2>
      <p className={formStyles.formDesc}>
        Are you familiar with the local building codes that apply to this project?
        Future enhancement: codes will autopopulate from project location.
      </p>

      <OptionButton
        label="Awareness"
        options={[
          { value: 'yes', label: 'Yes, I know the codes' },
          { value: 'no', label: 'No, not familiar' },
          { value: 'help', label: 'Need help identifying' },
        ]}
        value={d.localCodeAwareness}
        onChange={(v) => update({ localCodeAwareness: v })}
        disabled={disabled}
      />

      {d.localCodeAwareness === 'yes' && (
        <div className={formStyles.conditional}>
          <MultiSelect
            label="Applicable Codes"
            options={CODE_OPTIONS}
            value={d.codeStandards}
            onChange={(v) => update({ codeStandards: v })}
            disabled={disabled}
          />

          <div className={styles.customSection}>
            <div className={styles.customLabel}>Custom Codes</div>
            <p className={styles.customHint}>
              Add any project-specific or local codes not in the list above.
            </p>

            {d.customCodes.length > 0 && (
              <ul className={styles.chipList}>
                {d.customCodes.map((code) => (
                  <li key={code} className={styles.chip}>
                    <span className={styles.chipText}>{code}</span>
                    <button
                      type="button"
                      className={styles.chipRemove}
                      onClick={() => removeCustom(code)}
                      disabled={disabled}
                      aria-label={`Remove ${code}`}
                      title="Remove"
                    >
                      <X size={12} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className={styles.addRow}>
              <input
                type="text"
                className={styles.input}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onDraftKey}
                placeholder="e.g. City of Dallas Pool Ordinance §12.4"
                disabled={disabled}
                aria-label="Custom code"
              />
              <button
                type="button"
                className={styles.addBtn}
                onClick={addCustom}
                disabled={disabled || draft.trim().length === 0}
              >
                <Plus size={14} aria-hidden="true" />
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

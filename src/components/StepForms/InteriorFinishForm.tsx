import { useApp } from '../../store';
import { OptionButton } from '../ui/OptionButton';
import { TextInput } from '../ui/TextInput';
import { getOptionCost } from '../../data/configCosts';
import styles from './forms.module.css';

const FINISH_OPTIONS = [
  { value: 'Plaster', label: 'Plaster' },
  { value: 'Pebble', label: 'Pebble / Aggregate' },
  { value: 'Tile', label: 'Tile' },
  { value: 'Vinyl Liner', label: 'Vinyl Liner' },
  { value: 'Fiberglass', label: 'Fiberglass' },
].map((o) => ({ ...o, cost: getOptionCost('interiorFinish', o.value)?.cost }));

export function InteriorFinishForm() {
  const { state, dispatch } = useApp();
  const d = state.data;
  const disabled = d.isFinalized;
  const update = (payload: Record<string, unknown>) => dispatch({ type: 'UPDATE_DATA', payload });

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>Interior Finish</h2>
      <OptionButton
        label="Finish Type"
        options={FINISH_OPTIONS}
        value={d.finishType}
        onChange={(v) => update({ finishType: v })}
        disabled={disabled}
      />
      {d.finishType === 'Tile' && (
        <div className={styles.conditional}>
          <OptionButton
            label="Tile Band Height"
            options={[
              { value: '6"', label: '6"' },
              { value: '12"', label: '12"' },
              { value: 'Full', label: 'Full Height' },
              { value: 'Custom', label: 'Custom' },
            ]}
            value={d.tileBandHeight}
            onChange={(v) => update({ tileBandHeight: v })}
            disabled={disabled}
          />
          {d.tileBandHeight === 'Custom' && (
            <TextInput
              label="Custom Height"
              value={d.customTileHeight}
              onChange={(v) => update({ customTileHeight: v })}
              placeholder='e.g. 18"'
              disabled={disabled}
            />
          )}
          <OptionButton
            label="Stair Nosing Detail"
            options={[
              { value: 'Matching Tile', label: 'Matching Tile' },
              { value: 'Contrasting', label: 'Contrasting Color' },
              { value: 'Bull Nose', label: 'Bull Nose Trim' },
            ]}
            value={d.stairNosingDetail}
            onChange={(v) => update({ stairNosingDetail: v })}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}

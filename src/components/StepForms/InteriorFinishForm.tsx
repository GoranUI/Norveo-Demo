import { useMemo } from 'react';
import { useApp } from '../../store';
import { OptionButton } from '../ui/OptionButton';
import { TextInput } from '../ui/TextInput';
import { getOptionCost } from '../../data/configCosts';
import { AGGREGATE_FINISH_BRANDS, PLASTER_FINISH_BRANDS } from '../../data/finishCatalog';
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

  const brandCatalog = useMemo(() => {
    if (d.finishType === 'Plaster') return PLASTER_FINISH_BRANDS;
    if (d.finishType === 'Pebble') return AGGREGATE_FINISH_BRANDS;
    return [];
  }, [d.finishType]);

  const lineOptions = useMemo(() => {
    const b = brandCatalog.find((x) => x.brand === d.finishBrand);
    return b?.lines ?? [];
  }, [brandCatalog, d.finishBrand]);

  const colorOptions = useMemo(() => {
    const line = lineOptions.find((l) => l.id === d.finishProductLine);
    return line?.colors ?? [];
  }, [lineOptions, d.finishProductLine]);

  const showFinishCatalog = d.finishType === 'Plaster' || d.finishType === 'Pebble';
  const showWaterline = d.finishType === 'Plaster' || d.finishType === 'Pebble';
  const showAllTile = d.finishType === 'Tile';

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>Interior Finish</h2>
      <OptionButton
        label="Finish Type"
        options={FINISH_OPTIONS}
        value={d.finishType}
        onChange={(v) =>
          update({
            finishType: v,
            finishBrand: null,
            finishProductLine: null,
            finishColorName: null,
            waterlineTileEnabled: v === 'Plaster' || v === 'Pebble',
            allTilePool: v === 'Tile' ? d.allTilePool : false,
          })
        }
        disabled={disabled}
      />

      {showFinishCatalog && (
        <div className={styles.conditional}>
          <p className={styles.formDesc}>Pick a catalog entry (demo data) or leave blank and describe in notes.</p>
          <label className={styles.formDesc} style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
            Brand
          </label>
          <select
            className={styles.input}
            style={{ maxWidth: 360, height: 'var(--control-h)' }}
            value={d.finishBrand ?? ''}
            disabled={disabled}
            onChange={(e) =>
              update({
                finishBrand: e.target.value || null,
                finishProductLine: null,
                finishColorName: null,
              })
            }
            aria-label="Finish brand"
          >
            <option value="">Select brand…</option>
            {brandCatalog.map((b) => (
              <option key={b.brand} value={b.brand}>
                {b.brand}
              </option>
            ))}
          </select>

          {d.finishBrand && (
            <>
              <label className={styles.formDesc} style={{ display: 'block', margin: '12px 0 6px', fontWeight: 600 }}>
                Product line
              </label>
              <select
                className={styles.input}
                style={{ maxWidth: 360, height: 'var(--control-h)' }}
                value={d.finishProductLine ?? ''}
                disabled={disabled}
                onChange={(e) =>
                  update({
                    finishProductLine: e.target.value || null,
                    finishColorName: null,
                  })
                }
                aria-label="Finish product line"
              >
                <option value="">Select line…</option>
                {lineOptions.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </>
          )}

          {d.finishProductLine && colorOptions.length > 0 && (
            <>
              <label className={styles.formDesc} style={{ display: 'block', margin: '12px 0 6px', fontWeight: 600 }}>
                Color
              </label>
              <select
                className={styles.input}
                style={{ maxWidth: 360, height: 'var(--control-h)' }}
                value={d.finishColorName ?? ''}
                disabled={disabled}
                onChange={(e) => update({ finishColorName: e.target.value || null })}
                aria-label="Finish color"
              >
                <option value="">Select color…</option>
                {colorOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}

      {showWaterline && (
        <div className={styles.conditional}>
          <h3 className={styles.blockTitle}>Waterline tile</h3>
          <OptionButton
            label="Band height"
            options={[
              { value: '6', label: '6″' },
              { value: '12', label: '12″' },
              { value: 'full', label: 'Full' },
            ]}
            value={
              d.waterlineBandInches === 12 ? '12' : d.waterlineBandInches && d.waterlineBandInches >= 48 ? 'full' : '6'
            }
            onChange={(v) => {
              const inches = v === '12' ? 12 : v === 'full' ? 60 : 6;
              update({ waterlineBandInches: inches, waterlineTileEnabled: true });
            }}
            disabled={disabled}
          />
          <OptionButton
            label="Tile size"
            options={[
              { value: '1×1', label: '1×1' },
              { value: '2×2', label: '2×2' },
              { value: '6×6', label: '6×6' },
            ]}
            value={d.waterlineTileSizeLabel ?? '6×6'}
            onChange={(v) => update({ waterlineTileSizeLabel: v })}
            disabled={disabled}
          />
          <OptionButton
            label="Selection mode"
            options={[
              { value: 'colors', label: 'Specific colors' },
              { value: 'price-range', label: 'Price tier' },
              { value: 'unknown', label: 'I don’t know' },
            ]}
            value={d.waterlinePickMode ?? 'unknown'}
            onChange={(v) => update({ waterlinePickMode: v as 'colors' | 'price-range' | 'unknown' })}
            disabled={disabled}
          />
          <OptionButton
            label="Price tier (when unsure)"
            options={[
              { value: 'low', label: 'Value' },
              { value: 'mid', label: 'Mid' },
              { value: 'high', label: 'Premium' },
            ]}
            value={d.waterlinePriceTier ?? 'high'}
            onChange={(v) => update({ waterlinePriceTier: v as 'low' | 'mid' | 'high' })}
            disabled={disabled || d.waterlinePickMode === 'colors'}
          />
        </div>
      )}

      {showAllTile && (
        <div className={styles.conditional}>
          <h3 className={styles.blockTitle}>All-tile pool</h3>
          <label className={styles.sameAsCard} style={{ marginBottom: 'var(--sp-3)' }}>
            <input
              type="checkbox"
              checked={d.allTilePool}
              disabled={disabled}
              onChange={(e) => update({ allTilePool: e.target.checked })}
            />
            <span className={styles.sameAsCardText}>
              <span className={styles.sameAsLead}>Entire vessel is tiled</span>
            </span>
          </label>
          <label className={styles.sameAsCard}>
            <input
              type="checkbox"
              checked={d.applyWaterlineTileToBody}
              disabled={disabled || !d.allTilePool}
              onChange={(e) => update({ applyWaterlineTileToBody: e.target.checked })}
            />
            <span className={styles.sameAsCardText}>
              <span className={styles.sameAsLead}>Apply waterline selections to field tile</span>
            </span>
          </label>
        </div>
      )}

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

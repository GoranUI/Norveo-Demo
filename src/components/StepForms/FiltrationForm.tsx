import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Filter as FilterIcon,
  Droplets,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../store';
import { OptionButton } from '../ui/OptionButton';
import { BrandSelect } from '../ui/BrandSelect';
import { getOptionCost } from '../../data/configCosts';
import { getBrandsForCategory } from '../../data/brands';
import {
  FILTER_CATALOG,
  type FilterMediaType,
  type FilterProduct,
} from '../../data/equipmentCatalog';
import {
  calculateFilterSizing,
  defaultDesignRate,
  defaultBackwashRate,
  type FilterSizingInputs,
} from '../../data/filterSizing';
import { calculateVolumeTotals } from '../../data/poolSections';
import { getTurnoverHoursForPoolType } from '../../data/engineering';
import formStyles from './forms.module.css';
import styles from './FiltrationForm.module.css';

const MEDIA_OPTIONS = [
  { value: 'Sand', label: 'Sand' },
  { value: 'Cartridge', label: 'Cartridge' },
  { value: 'DE', label: 'Diatomaceous Earth (DE)' },
  { value: 'Glass Media', label: 'Glass Media' },
].map((o) => ({ ...o, cost: getOptionCost('filtrationType', o.value)?.cost }));

const FILTRATION_BRANDS = getBrandsForCategory('filtration');

function fmtNum(n: number, digits = 1): string {
  if (!Number.isFinite(n) || n === 0) return digits === 0 ? '0' : (0).toFixed(digits);
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function fmtGallons(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '—';
  return `${Math.round(n).toLocaleString()} gal`;
}

interface NumFieldProps {
  label: string;
  value: number;
  unit: string;
  hint?: string;
  disabled?: boolean;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  /** True when the visible value is the default (used only for placeholder hint). */
  isDefault?: boolean;
}

interface FiltrationCatalogueBlockProps {
  baseCatalogueRows: FilterProduct[];
  disabled: boolean;
  filterCount: number;
  selectedFilterModelId: string | null;
  recirculationGpm: number;
  designRate: number;
  onSelect: (f: FilterProduct) => void;
}

/** Toolbar + table; remounted when `mediaType` / brand preference change so filter UI resets without an effect. */
function FiltrationCatalogueBlock({
  baseCatalogueRows,
  disabled,
  filterCount,
  selectedFilterModelId,
  recirculationGpm,
  designRate,
  onSelect,
}: FiltrationCatalogueBlockProps) {
  const priceBounds = useMemo(() => {
    if (!baseCatalogueRows.length) return { min: 0, max: 0 };
    const prices = baseCatalogueRows.map((r) => r.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [baseCatalogueRows]);

  const brandsInCatalogue = useMemo(() => {
    const set = new Set(baseCatalogueRows.map((r) => r.brand));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [baseCatalogueRows]);

  const [priceFloor, setPriceFloor] = useState<number | ''>('');
  const [priceCeil, setPriceCeil] = useState<number | ''>('');
  const [brandFilter, setBrandFilter] = useState<string[]>([]);
  const [meetsFilter, setMeetsFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [sortKey, setSortKey] = useState<'area' | 'price' | 'brand'>('area');

  const displayedCatalogueRows = useMemo(() => {
    let rows = [...baseCatalogueRows];
    if (priceFloor !== '') rows = rows.filter((r) => r.price >= priceFloor);
    if (priceCeil !== '') rows = rows.filter((r) => r.price <= priceCeil);
    if (brandFilter.length) rows = rows.filter((r) => brandFilter.includes(r.brand));
    rows = rows.filter((f) => {
      const totalArea = f.filterAreaSqFt * Math.max(1, filterCount);
      const rate = totalArea > 0 ? recirculationGpm / totalArea : 0;
      const meetsDesign = totalArea > 0 && rate <= designRate;
      if (meetsFilter === 'yes') return meetsDesign;
      if (meetsFilter === 'no') return totalArea > 0 && !meetsDesign;
      return true;
    });
    rows.sort((a, b) => {
      if (sortKey === 'price') return a.price - b.price || a.model.localeCompare(b.model);
      if (sortKey === 'brand') return a.brand.localeCompare(b.brand) || a.price - b.price;
      return a.filterAreaSqFt - b.filterAreaSqFt || a.price - b.price;
    });
    return rows;
  }, [
    baseCatalogueRows,
    priceFloor,
    priceCeil,
    brandFilter,
    meetsFilter,
    sortKey,
    filterCount,
    recirculationGpm,
    designRate,
  ]);

  const filtersDirty =
    priceFloor !== '' ||
    priceCeil !== '' ||
    brandFilter.length > 0 ||
    meetsFilter !== 'all' ||
    sortKey !== 'area';

  const clearToolbarFilters = () => {
    setPriceFloor('');
    setPriceCeil('');
    setBrandFilter([]);
    setMeetsFilter('all');
    setSortKey('area');
  };

  return (
    <div className={styles.catSelectionShell}>
      <div className={styles.catToolbar}>
        <div className={styles.catToolbarHeader}>
          <div className={styles.catToolbarTitle}>
            <SlidersHorizontal size={14} className={styles.catToolbarTitleIcon} aria-hidden />
            <span>Filter & sort</span>
          </div>
          {filtersDirty && (
            <button
              type="button"
              className={styles.catResetBtn}
              onClick={clearToolbarFilters}
              disabled={disabled}
            >
              <RotateCcw size={12} aria-hidden />
              Clear filters
            </button>
          )}
        </div>
        <div className={styles.catToolbarRow}>
          <div className={styles.catField}>
            <span className={styles.catFieldLabel}>Price min</span>
            <input
              type="number"
              className={styles.catInput}
              min={0}
              step={50}
              placeholder={priceBounds.min ? String(priceBounds.min) : '—'}
              value={priceFloor === '' ? '' : priceFloor}
              onChange={(e) => {
                const v = e.target.value;
                setPriceFloor(v === '' ? '' : Number(v));
              }}
              disabled={disabled}
              aria-label="Minimum price"
            />
          </div>
          <div className={styles.catField}>
            <span className={styles.catFieldLabel}>Price max</span>
            <input
              type="number"
              className={styles.catInput}
              min={0}
              step={50}
              placeholder={priceBounds.max ? String(priceBounds.max) : '—'}
              value={priceCeil === '' ? '' : priceCeil}
              onChange={(e) => {
                const v = e.target.value;
                setPriceCeil(v === '' ? '' : Number(v));
              }}
              disabled={disabled}
              aria-label="Maximum price"
            />
          </div>
          <div className={styles.catField}>
            <span className={styles.catFieldLabel}>Meets design rate</span>
            <select
              className={styles.catSelect}
              value={meetsFilter}
              onChange={(e) => setMeetsFilter(e.target.value as 'all' | 'yes' | 'no')}
              disabled={disabled}
              aria-label="Filter rows by design rate"
            >
              <option value="all">All rows</option>
              <option value="yes">Meets design (green)</option>
              <option value="no">Over design rate</option>
            </select>
          </div>
          <div className={styles.catField}>
            <span className={styles.catFieldLabel}>Sort</span>
            <select
              className={styles.catSelect}
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as 'area' | 'price' | 'brand')}
              disabled={disabled}
              aria-label="Sort catalogue"
            >
              <option value="area">Tank area (ft²)</option>
              <option value="price">Price</option>
              <option value="brand">Brand</option>
            </select>
          </div>
        </div>
        {brandsInCatalogue.length > 1 && (
          <div className={styles.catField}>
            <span className={styles.catFieldLabel}>Brands (multi-select)</span>
            <div className={styles.brandChips}>
              {brandsInCatalogue.map((b) => {
                const on = brandFilter.includes(b);
                return (
                  <label key={b} className={styles.catBrandToggle}>
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={disabled}
                      onChange={() => {
                        setBrandFilter((prev) =>
                          on ? prev.filter((x) => x !== b) : [...prev, b],
                        );
                      }}
                    />
                    <span>{b}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
        <div className={styles.toolbarMeta}>
          <span className={styles.toolbarMetaBadge}>
            {displayedCatalogueRows.length} / {baseCatalogueRows.length} models
          </span>
          {priceBounds.min !== priceBounds.max && (
            <span className={styles.toolbarMetaRange}>
              ${priceBounds.min.toLocaleString()}–${priceBounds.max.toLocaleString()} in catalogue
            </span>
          )}
        </div>
      </div>
      {displayedCatalogueRows.length === 0 ? (
        <div className={styles.catTablePane}>
          <div className={styles.emptyState}>
            No models match the current filters. Widen the price range or clear brand checkboxes.
          </div>
        </div>
      ) : (
        <div className={styles.catTablePane}>
          <div className={styles.compTable} role="table" aria-label="Filter selection">
          <div className={styles.compHead} role="row">
            <div role="columnheader" className={styles.compHeadRadio} aria-label="Selection" />
            <div role="columnheader">Model</div>
            <div role="columnheader" className={styles.compHeadRight}>Per-tank ft²</div>
            <div role="columnheader" className={styles.compHeadRight}>Total ft²</div>
            <div role="columnheader" className={styles.compHeadRight}>Rate gpm/ft²</div>
          </div>
          {displayedCatalogueRows.map((f) => {
            const isSelected = selectedFilterModelId === f.id;
            const totalArea = f.filterAreaSqFt * Math.max(1, filterCount);
            const rate = totalArea > 0 ? recirculationGpm / totalArea : 0;
            const meetsDesign = totalArea > 0 && rate <= designRate;
            return (
              <button
                key={f.id}
                type="button"
                role="row"
                className={`${styles.compRow} ${meetsDesign ? styles.compRowMeets : styles.compRowOver} ${isSelected ? styles.compRowSelected : ''}`}
                onClick={() => onSelect(f)}
                disabled={disabled}
                aria-pressed={isSelected}
                aria-label={`${f.brand} ${f.model}, ${fmtNum(f.filterAreaSqFt, 1)} square feet per tank${isSelected ? ', selected' : ''}`}
              >
                <div className={styles.compSelectCell} role="cell">
                  <span className={styles.compRadio} aria-hidden="true">
                    {isSelected && <span className={styles.compRadioInner} />}
                  </span>
                </div>
                <div className={styles.compCell} role="cell">
                  <span className={styles.compModelBrand}>{f.brand}</span>
                  {f.model}
                </div>
                <div className={`${styles.compCell} ${styles.compCellRight}`} role="cell">
                  {fmtNum(f.filterAreaSqFt, 2)}
                </div>
                <div className={`${styles.compCell} ${styles.compCellRight}`} role="cell">
                  {fmtNum(totalArea, 2)}
                </div>
                <div
                  className={`${styles.compCell} ${styles.compCellRight} ${meetsDesign ? '' : styles.compMuted}`}
                  role="cell"
                >
                  {totalArea > 0 ? fmtNum(rate, 2) : '—'}
                </div>
              </button>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}

function NumField({ label, value, unit, hint, disabled, onChange, min = 0, step = 1, isDefault }: NumFieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>
        {label}
        {hint && <span className={styles.fieldHint}> ({hint})</span>}
      </span>
      <div className={styles.numWrap}>
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          className={`${styles.input} ${styles.inputNum}`}
          value={value === 0 ? '' : value}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
          placeholder={isDefault ? `${value}` : '0'}
          disabled={disabled}
          aria-label={label}
        />
        <span className={styles.unit}>{unit}</span>
      </div>
    </label>
  );
}

export function FiltrationForm() {
  const { state, dispatch } = useApp();
  const d = state.data;
  const disabled = d.isFinalized;
  const update = (payload: Record<string, unknown>) =>
    dispatch({ type: 'UPDATE_DATA', payload });

  const totals = useMemo(() => calculateVolumeTotals(d.poolSections), [d.poolSections]);
  const turnoverHours =
    d.turnoverHoursOverride ?? getTurnoverHoursForPoolType(d.poolUseType, totals.averageDepth);
  const recirculationGpm = useMemo(
    () => (turnoverHours > 0 ? Math.round(totals.totalGallons / (turnoverHours * 60)) : 0),
    [totals.totalGallons, turnoverHours],
  );

  const mediaType = (d.filtrationType as FilterMediaType | null) ?? null;
  const brand = d.brandPreferences.filtration;

  // Catalogue rows for the chosen media (and optional preferred brand).
  const baseCatalogueRows = useMemo(() => {
    let rows: FilterProduct[] = FILTER_CATALOG;
    if (mediaType) rows = rows.filter((f) => f.mediaType === mediaType);
    if (brand) rows = rows.filter((f) => f.brand === brand);
    return rows;
  }, [mediaType, brand]);

  const selectedFilter = useMemo(
    () => FILTER_CATALOG.find((f) => f.id === d.selectedFilterModelId) ?? null,
    [d.selectedFilterModelId],
  );

  const designRateDefault = defaultDesignRate(mediaType, d.poolUseType);
  const designRate = d.filterDesignRateGpmPerSf ?? designRateDefault;

  const backwashRateDefault = defaultBackwashRate(mediaType);
  const backwashRate = d.filterBackwashRateGpmPerSf ?? backwashRateDefault;

  const sizingInputs: FilterSizingInputs = useMemo(
    () => ({
      recirculationGpm,
      flowRateDesignGpmPerSf: d.filterDesignRateGpmPerSf,
      mediaType,
      poolUseType: d.poolUseType,
      perFilterAreaSf: selectedFilter?.filterAreaSqFt ?? 0,
      filterCount: d.filterCount,
      backwashRateGpmPerSf: d.filterBackwashRateGpmPerSf,
      sewerCapacityGpm: d.filterSewerCapacityGpm,
      retentionTimeMin: d.filterRetentionTimeMin,
      retentionPitLengthFt: d.filterRetentionPitLengthFt,
      retentionPitWidthFt: d.filterRetentionPitWidthFt,
      retentionPitDepthFt: d.filterRetentionPitDepthFt,
    }),
    [
      recirculationGpm,
      d.filterDesignRateGpmPerSf,
      mediaType,
      d.poolUseType,
      selectedFilter,
      d.filterCount,
      d.filterBackwashRateGpmPerSf,
      d.filterSewerCapacityGpm,
      d.filterRetentionTimeMin,
      d.filterRetentionPitLengthFt,
      d.filterRetentionPitWidthFt,
      d.filterRetentionPitDepthFt,
    ],
  );

  const sizing = useMemo(() => calculateFilterSizing(sizingInputs), [sizingInputs]);

  const isComplete = !!d.filtrationType && !!d.selectedFilterModelId && d.filterCount > 0;

  const handleSelectFilter = (f: FilterProduct) => {
    const recommended = sizing.filterAreaRequiredSf > 0
      ? Math.max(1, Math.ceil(sizing.filterAreaRequiredSf / f.filterAreaSqFt))
      : Math.max(1, d.filterCount);
    update({
      selectedFilterModelId: f.id,
      filterCount: recommended,
    });
  };

  return (
    <div className={formStyles.form}>
      <div className={styles.titleRow}>
        <h2 className={formStyles.formTitle}>Filtration</h2>
        {isComplete && (
          <span className={styles.completeBadge}>
            <CheckCircle2 size={13} aria-hidden="true" />
            Complete
          </span>
        )}
      </div>

      <p className={formStyles.formDesc}>
        Pick a media type, then select a filter tank model. The catalogue is
        filtered by your media (and brand preference, if any). The recirculation
        rate from the volume + turnover calc is used to size required area, and
        we surface backwash flow plus retention pit dimensions for your sewer
        capacity.
      </p>

      {/* ── Filtration Type & Brand ── */}
      <div className={styles.sectionLabel}>Filtration Type — Preferred Brand</div>
      <BrandSelect
        label=""
        brands={FILTRATION_BRANDS}
        value={brand}
        onChange={(v) =>
          update({
            brandPreferences: { ...d.brandPreferences, filtration: v },
            // Clear the selected model if it's no longer in the brand-filtered list.
            selectedFilterModelId:
              v && selectedFilter && selectedFilter.brand !== v
                ? null
                : d.selectedFilterModelId,
          })
        }
        disabled={disabled}
      />
      <OptionButton
        label="Filter Type"
        options={MEDIA_OPTIONS}
        value={d.filtrationType}
        onChange={(v) =>
          update({
            filtrationType: v,
            // Clear selection / overrides when media changes — defaults must reset.
            selectedFilterModelId: null,
            filterDesignRateGpmPerSf: null,
            filterBackwashRateGpmPerSf: null,
          })
        }
        disabled={disabled}
      />

      {/* ── Sizing Inputs ── */}
      <div className={styles.sectionLabel}>
        <FilterIcon size={13} aria-hidden="true" style={{ verticalAlign: '-2px' }} />{' '}
        Sizing — Required Filter Area
      </div>
      <p className={styles.hint}>
        Recirculation rate comes from your volume + turnover. The design rate
        falls back to a media-specific standard for your pool class — override
        if your local code differs.
      </p>
      <div className={styles.summaryStrip}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Recirculation (Q)</div>
          <div className={styles.summaryValue}>{recirculationGpm.toLocaleString()} gpm</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Turnover</div>
          <div className={styles.summaryValue}>
            {turnoverHours > 0 ? `${fmtNum(turnoverHours, 1)} hrs` : '—'}
          </div>
        </div>
        <div className={`${styles.summaryCard} ${styles.summaryCardAccent}`}>
          <div className={styles.summaryLabel}>Required filter area</div>
          <div className={styles.summaryValue}>{fmtNum(sizing.filterAreaRequiredSf, 2)} ft²</div>
        </div>
      </div>

      <div className={styles.fieldGrid} style={{ marginTop: 'var(--sp-3)' }}>
        <NumField
          label="Design flow rate"
          value={designRate}
          unit="gpm/ft²"
          hint={d.filterDesignRateGpmPerSf == null ? 'media default' : 'override'}
          step={0.5}
          disabled={disabled}
          isDefault={d.filterDesignRateGpmPerSf == null}
          onChange={(v) =>
            update({ filterDesignRateGpmPerSf: v === designRateDefault || v === 0 ? null : v })
          }
        />
        <NumField
          label="Number of filters"
          value={d.filterCount}
          unit="tanks"
          step={1}
          disabled={disabled}
          onChange={(v) => update({ filterCount: Math.max(1, Math.floor(v)) })}
        />
      </div>

      {/* ── Filter Selection (catalogue table) ── */}
      <div className={styles.sectionLabel}>Filter Selection</div>
      <p className={styles.hint}>
        Choose a filter tank. Each row shows total area for the selected count
        and the resulting surface flow rate. Rows that meet your design rate
        are marked with a green bar.
      </p>

      {baseCatalogueRows.length === 0 ? (
        <div className={styles.emptyState}>
          {brand
            ? `No ${mediaType ?? 'filter'} models from ${brand} in the catalogue. Clear the brand preference or switch media to see options.`
            : 'No filter models in the catalogue match the current media. Pick a media type first.'}
        </div>
      ) : (
        <FiltrationCatalogueBlock
          key={`${mediaType ?? 'none'}|${brand ?? 'any'}`}
          baseCatalogueRows={baseCatalogueRows}
          disabled={disabled}
          filterCount={d.filterCount}
          selectedFilterModelId={d.selectedFilterModelId}
          recirculationGpm={recirculationGpm}
          designRate={designRate}
          onSelect={handleSelectFilter}
        />
      )}

      {/* ── Capacity Actuals ── */}
      {selectedFilter && (
        <>
          <div className={styles.sectionLabel}>Filter Capacity — Actual</div>
          <div className={styles.summaryStrip}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Selected model</div>
              <div className={styles.summaryValue}>{selectedFilter.model}</div>
            </div>
            <div className={`${styles.summaryCard} ${styles.summaryCardAccent}`}>
              <div className={styles.summaryLabel}>Actual area total</div>
              <div className={styles.summaryValue}>{fmtNum(sizing.filterAreaActualSf, 2)} ft²</div>
            </div>
            <div
              className={`${styles.summaryCard} ${sizing.meetsDesignRate ? styles.summaryCardAccent : styles.summaryCardWarn}`}
            >
              <div className={styles.summaryLabel}>Actual filter rate</div>
              <div className={styles.summaryValue}>
                {fmtNum(sizing.filterRateActualGpmPerSf, 2)} gpm/ft²
              </div>
            </div>
          </div>
          {!sizing.meetsDesignRate && sizing.filterAreaActualSf > 0 && (
            <p className={styles.hint}>
              Actual rate ({fmtNum(sizing.filterRateActualGpmPerSf, 2)} gpm/ft²)
              exceeds your design rate ({fmtNum(designRate, 2)} gpm/ft²). Add a
              tank, choose a larger model, or relax the design rate.
            </p>
          )}
        </>
      )}

      {/* ── Backwash & Sewer ── */}
      <div className={styles.sectionLabel}>
        <Droplets size={13} aria-hidden="true" style={{ verticalAlign: '-2px' }} />{' '}
        Backwash &amp; Sewer
      </div>
      <p className={styles.hint}>
        Backwash flow per tank is the worst-case discharge during a single
        filter's cleaning cycle. The retention pit absorbs the difference when
        backwash exceeds sewer capacity.
      </p>
      <div className={styles.fieldGrid}>
        <NumField
          label="Backwash rate"
          value={backwashRate}
          unit="gpm/ft²"
          hint={d.filterBackwashRateGpmPerSf == null ? 'media default' : 'override'}
          step={0.5}
          disabled={disabled || mediaType === 'Cartridge'}
          isDefault={d.filterBackwashRateGpmPerSf == null}
          onChange={(v) =>
            update({
              filterBackwashRateGpmPerSf: v === backwashRateDefault || v === 0 ? null : v,
            })
          }
        />
        <NumField
          label="Sewer capacity"
          value={d.filterSewerCapacityGpm}
          unit="gpm"
          step={5}
          disabled={disabled}
          onChange={(v) => update({ filterSewerCapacityGpm: Math.max(0, v) })}
        />
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Backwash flow / tank</div>
          <div className={styles.summaryValue}>
            {fmtNum(sizing.backwashFlowPerFilterGpm, 0)} gpm
          </div>
        </div>
        <NumField
          label="Retention time"
          value={d.filterRetentionTimeMin}
          unit="min"
          step={0.5}
          disabled={disabled}
          onChange={(v) => update({ filterRetentionTimeMin: Math.max(0, v) })}
        />
      </div>

      {/* ── Retention Pit ── */}
      <div className={styles.sectionLabel}>Retention Pit</div>
      <p className={styles.hint}>
        Sized to absorb a single backwash event when the sewer can't take the
        full flow. Length × Width × Depth × 7.4805 gal/ft³.
      </p>
      <div className={styles.fieldGrid3}>
        <NumField
          label="Length"
          value={d.filterRetentionPitLengthFt}
          unit="ft"
          step={0.5}
          disabled={disabled}
          onChange={(v) => update({ filterRetentionPitLengthFt: Math.max(0, v) })}
        />
        <NumField
          label="Width"
          value={d.filterRetentionPitWidthFt}
          unit="ft"
          step={0.5}
          disabled={disabled}
          onChange={(v) => update({ filterRetentionPitWidthFt: Math.max(0, v) })}
        />
        <NumField
          label="Depth"
          value={d.filterRetentionPitDepthFt}
          unit="ft"
          step={0.5}
          disabled={disabled}
          onChange={(v) => update({ filterRetentionPitDepthFt: Math.max(0, v) })}
        />
      </div>
      <div className={styles.summaryStrip2} style={{ marginTop: 'var(--sp-3)' }}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Required capacity</div>
          <div className={styles.summaryValue}>{fmtGallons(sizing.retentionRequiredGallons)}</div>
        </div>
        <div
          className={`${styles.summaryCard} ${
            sizing.retentionMeetsRequirement ? styles.summaryCardAccent : styles.summaryCardWarn
          }`}
        >
          <div className={styles.summaryLabel}>Actual pit capacity</div>
          <div className={styles.summaryValue}>{fmtGallons(sizing.retentionActualGallons)}</div>
        </div>
      </div>
      {!sizing.retentionMeetsRequirement && sizing.retentionRequiredGallons > 0 && (
        <p className={styles.hint}>
          Pit is {fmtGallons(sizing.retentionRequiredGallons - sizing.retentionActualGallons)}{' '}
          short of the required capacity. Increase L / W / D or shorten the
          retention time.
        </p>
      )}
    </div>
  );
}

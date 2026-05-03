import { useState, useMemo, useEffect, useRef, type ReactNode } from 'react';
import {
  FileDown, ShoppingCart, Search, ChevronDown, ChevronRight, ExternalLink, SquarePen,
  DollarSign, Save, SlidersHorizontal, Check,
} from 'lucide-react';
import { useApp } from '../../store';
import { flattenItems } from '../../data/projectItems';
import type { ProjectItem, ItemStatus } from '../../types';
import {
  inventoryForLine,
  BOM_STATUS_LABELS,
} from '../../data/inventory';
import type { BOMLineRef } from '../../data/inventory';
import { SwapModal } from '../ui/SwapModal';
import type { SwapAllocation } from '../ui/SwapModal';
import { EstimateWorkspace } from './EstimateWorkspace';
import { OrderSummary, type OrderTab } from './OrderSummary';
import styles from './bom.module.css';

interface BOMRow extends BOMLineRef {
  id: string;
  markup: number;
}

function projectItemToBOM(item: ProjectItem): BOMRow {
  return {
    id: item.id,
    partNo: item.partNo,
    brand: item.brand,
    description: item.description,
    category: item.category,
    qty: item.qty,
    unit: item.unit,
    supplier: item.supplier,
    status: item.status,
    unitCost: item.price,
    markup: item.markup ?? 0,
  };
}

function rowToLineRef(row: BOMRow): BOMLineRef {
  return {
    partNo: row.partNo,
    brand: row.brand,
    description: row.description,
    category: row.category,
    qty: row.qty,
    unit: row.unit,
    supplier: row.supplier,
    status: row.status,
    unitCost: row.unitCost,
  };
}

import { computeSwapPatch } from '../../data/projectItemSwap';

const CATEGORIES = ['Structural', 'Mechanical', 'Plumbing', 'Fixtures', 'Finishes'];
const STATUS_ORDER: ItemStatus[] = ['to-purchase', 'on-order', 'purchased', 'not-required'];
const STATUS_OPTIONS = STATUS_ORDER.map((status) => ({
  value: status,
  label: BOM_STATUS_LABELS[status].label,
}));

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

type BomView = 'parts' | 'estimate' | 'order';
type EstimateView = 'admin' | 'customer';
type MarkupMode = 'separate' | 'included';

export function BOMWorkspace() {
  const { state, dispatch } = useApp();
  const [activeView, setActiveView] = useState<BomView>('parts');
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  /* Filters — formerly chips, now grouped inside a single popover */
  const [activeSuppliers, setActiveSuppliers] = useState<Set<string>>(new Set());
  const [activeCostCodes, setActiveCostCodes] = useState<Set<string>>(new Set());
  const [activeStatuses, setActiveStatuses] = useState<Set<ItemStatus>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);

  const [estimateView, setEstimateView] = useState<EstimateView>('admin');
  const [cheapestMode, setCheapestMode] = useState(false);
  const [procurementTab, setProcurementTab] = useState<OrderTab>('pending');

  /* Markup display mode. `separate` = show raw cost + dedicated Markup column.
     `included` = fold markup into Unit/Ext Cost, hide the Markup column. */
  const [markupMode, setMarkupMode] = useState<MarkupMode>('separate');

  const toggle = (cat: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const rows = useMemo(
    () => flattenItems(state.projectItems).map(projectItemToBOM),
    [state.projectItems],
  );

  const suppliers = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      if (r.supplier) set.add(r.supplier);
    }
    return Array.from(set).sort();
  }, [rows]);

  const costCodes = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) if (r.category) set.add(r.category);
    return CATEGORIES.filter((c) => set.has(c));
  }, [rows]);

  const statuses = useMemo(() => {
    const set = new Set<ItemStatus>();
    for (const r of rows) set.add(r.status);
    return STATUS_ORDER.filter((s) => set.has(s));
  }, [rows]);

  const toggleInSet = <T,>(
    setter: (updater: (prev: Set<T>) => Set<T>) => void,
    value: T,
  ) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const clearAllFilters = () => {
    setActiveSuppliers(new Set());
    setActiveCostCodes(new Set());
    setActiveStatuses(new Set());
  };

  const totalFilterCount =
    activeSuppliers.size + activeCostCodes.size + activeStatuses.size;

  const [swapItem, setSwapItem] = useState<BOMRow | null>(null);

  useEffect(() => {
    if (swapItem && !rows.some((r) => r.id === swapItem.id)) {
      const timer = window.setTimeout(() => setSwapItem(null), 0);
      return () => window.clearTimeout(timer);
    }
  }, [rows, swapItem]);

  const filtered = useMemo(() => {
    let result = rows;
    if (activeSuppliers.size > 0) {
      result = result.filter((r) => activeSuppliers.has(r.supplier));
    }
    if (activeCostCodes.size > 0) {
      result = result.filter((r) => activeCostCodes.has(r.category));
    }
    if (activeStatuses.size > 0) {
      result = result.filter((r) => activeStatuses.has(r.status));
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        r.description.toLowerCase().includes(q) ||
        r.partNo.toLowerCase().includes(q) ||
        r.brand.toLowerCase().includes(q) ||
        r.supplier.toLowerCase().includes(q)
      );
    }
    return result;
  }, [rows, search, activeSuppliers, activeCostCodes, activeStatuses]);

  const modalInventory = useMemo(
    () => (swapItem ? inventoryForLine(rowToLineRef(swapItem)) : []),
    [swapItem],
  );

  const applyAllocations = (allocations: SwapAllocation[]) => {
    if (!swapItem) { setSwapItem(null); return; }
    const result = computeSwapPatch(
      { id: swapItem.id, partNo: swapItem.partNo, qty: swapItem.qty },
      allocations,
      state.projectItems,
    );
    if (result) {
      dispatch({ type: 'UPDATE_PROJECT_ITEM', id: result.id, patch: result.patch });
    }
    setSwapItem(null);
  };

  const setItemStatus = (id: string, status: ItemStatus) => {
    dispatch({ type: 'UPDATE_PROJECT_ITEM', id, patch: { status } });
  };

  /* ── View tabs (shared across all views, hosted inside the top bar) ── */
  const viewTabs = (
    <div className={styles.viewTabs}>
      {(['parts', 'estimate', 'order'] as BomView[]).map((v) => (
        <button
          key={v}
          className={`${styles.viewTab} ${activeView === v ? styles.viewTabActive : ''}`}
          onClick={() => setActiveView(v)}
        >
          {v === 'parts' ? 'Parts' : v === 'estimate' ? 'Estimate' : 'Orders'}
        </button>
      ))}
    </div>
  );

  /* ── Filter popover (closes on outside click / Escape) ── */
  const filterWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const onDown = (e: MouseEvent) => {
      if (filterWrapRef.current && !filterWrapRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFilterOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [filterOpen]);

  const filterButton = (
    <div className={styles.filterWrap} ref={filterWrapRef}>
      <button
        type="button"
        className={`${styles.toolBtn} ${totalFilterCount > 0 ? styles.toolBtnActive : ''}`}
        onClick={() => setFilterOpen((v) => !v)}
        aria-expanded={filterOpen}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal size={13} />
        Filter
        {totalFilterCount > 0 && (
          <span className={styles.filterBadge}>{totalFilterCount}</span>
        )}
      </button>
      {filterOpen && (
        <div className={styles.filterPopover} role="dialog" aria-label="Filter parts">
          <div className={styles.filterPopHeader}>
            <span className={styles.filterPopTitle}>Filters</span>
            <button
              type="button"
              className={styles.filterClearLink}
              onClick={clearAllFilters}
              disabled={totalFilterCount === 0}
            >
              Clear all
            </button>
          </div>

          <FilterSection
            title="Supplier"
            values={suppliers}
            active={activeSuppliers}
            onToggle={(v) => toggleInSet(setActiveSuppliers, v)}
          />

          <FilterSection
            title="Cost Code"
            values={costCodes}
            active={activeCostCodes}
            onToggle={(v) => toggleInSet(setActiveCostCodes, v)}
          />

          <FilterSection
            title="Status"
            values={statuses}
            labelFor={(s) => BOM_STATUS_LABELS[s].label}
            active={activeStatuses}
            onToggle={(v) => toggleInSet(setActiveStatuses, v)}
          />
        </div>
      )}
    </div>
  );

  /* ── Right-side actions change per view ── */
  let rightActions: ReactNode;
  if (activeView === 'parts') {
    rightActions = (
      <>
        <div className={styles.searchWrap}>
          <Search size={12} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search parts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {filterButton}
        <button
          type="button"
          className={`${styles.markupToggle} ${markupMode === 'included' ? styles.markupToggleOn : ''}`}
          onClick={() => setMarkupMode((m) => (m === 'separate' ? 'included' : 'separate'))}
          title={
            markupMode === 'separate'
              ? 'Markup shown as its own column'
              : 'Markup folded into Unit Cost and Ext. Cost'
          }
        >
          <DollarSign size={13} />
          Markup: {markupMode === 'separate' ? 'Separate' : 'Included'}
        </button>
        <button className={styles.toolBtn}><FileDown size={13} /> Export</button>
        <button
          className={styles.toolBtnPrimary}
          onClick={() => setActiveView('order')}
          title="Go to Orders — review pending items and place orders by supplier"
        >
          <ShoppingCart size={13} /> Order Parts
        </button>
      </>
    );
  } else if (activeView === 'estimate') {
    rightActions = (
      <>
        <div className={styles.viewSeg} role="group" aria-label="Estimate view">
          <button
            type="button"
            className={`${styles.viewSegBtn} ${estimateView === 'admin' ? styles.viewSegBtnActive : ''}`}
            onClick={() => setEstimateView('admin')}
          >
            Admin
          </button>
          <button
            type="button"
            className={`${styles.viewSegBtn} ${estimateView === 'customer' ? styles.viewSegBtnActiveCustomer : ''}`}
            onClick={() => setEstimateView('customer')}
          >
            Customer
          </button>
        </div>
        {estimateView === 'admin' ? (
          <span className={styles.adminBadge}>Cost build</span>
        ) : (
          <span className={styles.customerBadge}>Quote</span>
        )}
        <button className={styles.toolBtn}><FileDown size={13} /> Export</button>
        <button className={styles.toolBtnPrimary}><Save size={13} /> Save</button>
      </>
    );
  } else {
    rightActions = (
      <>
        {procurementTab !== 'completed' && (
          <button
            type="button"
            className={`${styles.cheapBtn} ${cheapestMode ? styles.cheapBtnActive : ''}`}
            onClick={() => setCheapestMode(!cheapestMode)}
          >
            <DollarSign size={13} />
            {cheapestMode ? 'Showing Cheapest' : 'Show Cheapest Prices'}
          </button>
        )}
        <button className={styles.toolBtn}><FileDown size={13} /> Export</button>
      </>
    );
  }

  const topBar = (
    <div className={styles.topBar}>
      {viewTabs}
      <div className={styles.topBarRight}>{rightActions}</div>
    </div>
  );

  if (activeView === 'estimate') {
    return (
      <div className={styles.outer}>
        {topBar}
        <EstimateWorkspace estimateView={estimateView} />
      </div>
    );
  }

  if (activeView === 'order') {
    return (
      <div className={styles.outer}>
        {topBar}
        <OrderSummary
          rows={rows}
          cheapestMode={procurementTab === 'completed' ? false : cheapestMode}
          onActiveTabChange={setProcurementTab}
        />
      </div>
    );
  }

  /* ── Markup-aware display helpers ──
     The column set and numeric values both depend on markupMode. Ext. Cost
     always reflects the billable total (qty × (unitCost + markup)) so the
     user never has to do mental math when switching modes. */
  const showMarkupCol = markupMode === 'separate';
  const displayUnitCost = (r: BOMRow): number =>
    markupMode === 'included' ? r.unitCost + r.markup : r.unitCost;
  const extForRow = (r: BOMRow): number => r.qty * (r.unitCost + r.markup);
  const totalColSpan = showMarkupCol ? 7 : 6;

  return (
    <div className={styles.outer}>
      {topBar}

      {/* Parts table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thPartNo}>Part #</th>
              <th className={styles.thBrand}>Brand</th>
              <th className={styles.thDesc}>Description</th>
              <th className={styles.thQty}>Qty</th>
              <th className={styles.thUnit}>Unit</th>
              <th className={styles.thCost}>
                {markupMode === 'included' ? 'Unit Price' : 'Unit Cost'}
              </th>
              {showMarkupCol && <th className={styles.thMarkup}>Markup</th>}
              <th className={styles.thCost}>Ext. Cost</th>
              <th className={styles.thSupplier}>Supplier</th>
              <th className={styles.thStatus}>Status</th>
            </tr>
          </thead>
          {filtered.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={showMarkupCol ? 10 : 9} className={styles.emptyRow}>
                  No parts match your current filters.
                </td>
              </tr>
            </tbody>
          )}
          {CATEGORIES.map((cat) => {
            const items = filtered.filter((r) => r.category === cat);
            if (items.length === 0) return null;
            const isOpen = !collapsed.has(cat);
            const catTotal = items.reduce((s, r) => s + extForRow(r), 0);
            return (
              <tbody key={cat}>
                <tr className={styles.catRow} onClick={() => toggle(cat)}>
                  <td colSpan={totalColSpan}>
                    <div className={styles.catCell}>
                      {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      <span className={styles.catName}>{cat}</span>
                      <span className={styles.catCount}>{items.length} items</span>
                    </div>
                  </td>
                  <td className={styles.catTotal}>{fmt(catTotal)}</td>
                  <td colSpan={2} />
                </tr>
                {isOpen && items.map((item) => {
                  const st = BOM_STATUS_LABELS[item.status];
                  const isSwapOpen = swapItem?.id === item.id;
                  return (
                    <tr
                      key={item.id}
                      className={`${styles.itemRow} ${isSwapOpen ? styles.itemRowActive : ''}`}
                      onClick={() => setSwapItem(item)}
                      title="Click to replace with another part from inventory"
                    >
                      <td className={styles.cellPartNo}>
                        <span className={styles.partWithIcon}>
                          <span className={styles.partNoText}>{item.partNo}</span>
                          <span className={styles.swapIconWrap} aria-hidden>
                            <SquarePen size={13} className={styles.swapHint} strokeWidth={1.25} />
                          </span>
                        </span>
                      </td>
                      <td className={styles.cellBrand}>{item.brand}</td>
                      <td className={styles.cellDesc}>{item.description}</td>
                      <td className={styles.cellQty}>{item.qty}</td>
                      <td className={styles.cellUnit}>{item.unit}</td>
                      <td className={styles.cellCost}>{fmt(displayUnitCost(item))}</td>
                      {showMarkupCol && (
                        <td
                          className={styles.cellMarkup}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MarkupInput
                            key={`${item.id}:${item.markup}`}
                            initial={item.markup}
                            onCommit={(v) => {
                              if (v !== item.markup) {
                                dispatch({
                                  type: 'UPDATE_PROJECT_ITEM',
                                  id: item.id,
                                  patch: { markup: v },
                                });
                              }
                            }}
                          />
                        </td>
                      )}
                      <td className={styles.cellCost}>{fmt(extForRow(item))}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className={styles.cellSupplier}>
                          {item.supplier}
                          <ExternalLink size={10} className={styles.supplierLink} />
                        </div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className={styles.statusCell}>
                          <select
                            className={`${styles.statusSelect} ${styles[st.cls]}`}
                            value={item.status}
                            onChange={(e) => setItemStatus(item.id, e.target.value as ItemStatus)}
                            aria-label={`Set procurement status for ${item.description}`}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {(item.status === 'not-required' || item.status === 'purchased') && (
                            <button
                              type="button"
                              className={styles.pendingBtn}
                              onClick={() => setItemStatus(item.id, 'to-purchase')}
                            >
                              Add to Pending
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            );
          })}
        </table>
      </div>

      {swapItem && (
        <SwapModal
          item={rowToLineRef(swapItem)}
          inventory={modalInventory}
          onApply={applyAllocations}
          onClose={() => setSwapItem(null)}
        />
      )}
    </div>
  );
}

/* ── Filter section (one checkbox group inside the popover) ── */
interface FilterSectionProps<T extends string> {
  title: string;
  values: T[];
  active: Set<T>;
  onToggle: (v: T) => void;
  labelFor?: (v: T) => string;
}

function FilterSection<T extends string>({
  title, values, active, onToggle, labelFor,
}: FilterSectionProps<T>) {
  if (values.length === 0) return null;
  return (
    <div className={styles.filterSection}>
      <div className={styles.filterSectionHeader}>
        <span className={styles.filterSectionTitle}>{title}</span>
        {active.size > 0 && (
          <span className={styles.filterSectionCount}>
            {active.size} of {values.length}
          </span>
        )}
      </div>
      <ul className={styles.filterList}>
        {values.map((v) => {
          const isOn = active.has(v);
          return (
            <li key={v}>
              <button
                type="button"
                className={`${styles.filterOption} ${isOn ? styles.filterOptionOn : ''}`}
                onClick={() => onToggle(v)}
                role="checkbox"
                aria-checked={isOn}
              >
                <span className={`${styles.filterCheckbox} ${isOn ? styles.filterCheckboxOn : ''}`}>
                  {isOn && <Check size={10} />}
                </span>
                <span className={styles.filterOptionLabel}>
                  {labelFor ? labelFor(v) : v}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── Inline-edit markup input ──
   The value displayed when idle is a fully formatted currency string ("$264")
   so the column visually matches Unit Cost. Focus switches to raw digits for
   easy editing; blur re-formats and dispatches. The input itself is text-type
   with inputMode="numeric" so mobile keyboards still show digits. */
interface MarkupInputProps {
  initial: number;
  onCommit: (v: number) => void;
}

function formatMarkup(n: number): string {
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function parseMarkup(raw: string): number {
  const digits = raw.replace(/[^0-9.]/g, '');
  return Math.max(0, Math.round(parseFloat(digits) || 0));
}

function MarkupInput({ initial, onCommit }: MarkupInputProps) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      className={styles.markupInput}
      defaultValue={formatMarkup(initial)}
      onClick={(e) => e.stopPropagation()}
      onFocus={(e) => {
        e.target.value = String(initial);
        e.target.select();
      }}
      onBlur={(e) => {
        const v = parseMarkup(e.target.value);
        e.target.value = formatMarkup(v);
        onCommit(v);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') {
          e.currentTarget.value = formatMarkup(initial);
          e.currentTarget.blur();
        }
      }}
    />
  );
}

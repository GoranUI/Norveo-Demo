import { useState, useMemo, useEffect, useCallback } from 'react';
import { useApp } from '../../store';
import type { ProjectItem } from '../../types';
import { flattenItems } from '../../data/projectItems';
import { inflationHintPctTotal, monthsFromToday } from '../../data/inflationHints';
import styles from './estimate.module.css';

type BudgetTab = 'budget' | 'breakdown';
export type EstimateView = 'admin' | 'customer';

// Realistic display values per the wireframe
interface DisplayRow {
  n: number | null;
  desc: string;
  unit: string;
  qty: string;
  equip: string;
  mat: string;
  labor: string;
  ucost: string;
  profit: string;
  total: string;
  isSub?: boolean;
}

const B = ''; // blank shorthand
const DISPLAY_DATA: DisplayRow[] = [
  // ── Excavation ──
  { n: 1,  desc: 'Excavation',            unit: 'LS',  qty: '1.00',     equip: '$4,500.00', mat: '$0.00',     labor: '$680.00',   ucost: '$5,180.00',   profit: '22%',  total: '$6,319.60' },
  { n: 2,  desc: 'Haul Away',             unit: 'CY',  qty: '45.00',    equip: '$0.00',     mat: '$0.00',     labor: '$85.00',    ucost: '$3,825.00',   profit: '22%',  total: '$4,666.50' },
  { n: null, desc: B, unit: B, qty: B, equip: B, mat: B, labor: B, ucost: B, profit: B, total: B },
  { n: 4,  desc: 'Excavation Subtotal',   unit: B,     qty: B,          equip: B,           mat: B,           labor: B,           ucost: '$9,005.00',   profit: B,      total: '$10,986.10', isSub: true },
  { n: null, desc: B, unit: B, qty: B, equip: B, mat: B, labor: B, ucost: B, profit: B, total: B },
  // ── Steel & Shell ──
  { n: 6,  desc: 'Rebar',                 unit: 'LBS', qty: '4,200',    equip: '$0.00',     mat: '$1.85',     labor: '$0.45',     ucost: '$9,660.00',   profit: '22%',  total: '$11,785.20' },
  { n: 7,  desc: 'Gunite Shell',          unit: 'CY',  qty: '55.00',    equip: '$0.00',     mat: '$336.00',   labor: '$185.00',   ucost: '$28,655.00',  profit: '22%',  total: '$34,959.10' },
  { n: null, desc: B, unit: B, qty: B, equip: B, mat: B, labor: B, ucost: B, profit: B, total: B },
  { n: 9,  desc: 'Steel & Shell Subtotal',unit: B,     qty: B,          equip: B,           mat: B,           labor: B,           ucost: '$38,315.00',  profit: B,      total: '$46,744.30', isSub: true },
  { n: null, desc: B, unit: B, qty: B, equip: B, mat: B, labor: B, ucost: B, profit: B, total: B },
  // ── Equipment ──
  { n: 11, desc: 'Filter System',         unit: 'EA',  qty: '1.00',     equip: '$2,800.00', mat: '$450.00',   labor: '$680.00',   ucost: '$3,930.00',   profit: '25%',  total: '$4,912.50' },
  { n: 12, desc: 'Pump - 2HP',            unit: 'EA',  qty: '1.00',     equip: '$1,200.00', mat: '$150.00',   labor: '$420.00',   ucost: '$1,770.00',   profit: '25%',  total: '$2,212.50' },
  { n: 13, desc: 'Heater - Gas 400k BTU', unit: 'EA',  qty: '1.00',     equip: '$4,500.00', mat: '$380.00',   labor: '$650.00',   ucost: '$5,530.00',   profit: '25%',  total: '$6,912.50' },
  { n: 14, desc: 'Sanitization System',   unit: 'EA',  qty: '1.00',     equip: '$3,200.00', mat: '$250.00',   labor: '$480.00',   ucost: '$3,930.00',   profit: '25%',  total: '$4,912.50' },
  { n: 15, desc: 'Chemical Controller',   unit: 'EA',  qty: '1.00',     equip: '$1,200.00', mat: '$180.00',   labor: '$320.00',   ucost: '$1,700.00',   profit: '25%',  total: '$2,125.00' },
  { n: null, desc: B, unit: B, qty: B, equip: B, mat: B, labor: B, ucost: B, profit: B, total: B },
  { n: 17, desc: 'Equipment Subtotal',    unit: B,     qty: B,          equip: B,           mat: B,           labor: B,           ucost: '$16,860.00',  profit: B,      total: '$21,075.00', isSub: true },
  { n: null, desc: B, unit: B, qty: B, equip: B, mat: B, labor: B, ucost: B, profit: B, total: B },
  // ── Plumbing ──
  { n: 19, desc: 'PVC Pipe - 2"',         unit: 'LF',  qty: '150',      equip: '$0.00',     mat: '$8.50',     labor: '$4.20',     ucost: '$1,905.00',   profit: '35%',  total: '$2,571.75' },
  { n: 20, desc: 'PVC Pipe - 1.5"',       unit: 'LF',  qty: '80',       equip: '$0.00',     mat: '$6.80',     labor: '$3.50',     ucost: '$824.00',     profit: '35%',  total: '$1,112.40' },
  { n: 21, desc: 'Fittings & Valves',     unit: 'LS',  qty: '1.00',     equip: '$0.00',     mat: '$1,850.00', labor: '$420.00',   ucost: '$2,270.00',   profit: '35%',  total: '$3,064.50' },
  { n: 22, desc: 'Main Drains',           unit: 'EA',  qty: '2.00',     equip: '$0.00',     mat: '$285.00',   labor: '$180.00',   ucost: '$930.00',     profit: '35%',  total: '$1,255.50' },
  { n: 23, desc: 'Skimmers',              unit: 'EA',  qty: '2.00',     equip: '$0.00',     mat: '$420.00',   labor: '$240.00',   ucost: '$1,320.00',   profit: '35%',  total: '$1,782.00' },
  { n: 24, desc: 'Return Jets',           unit: 'EA',  qty: '6.00',     equip: '$0.00',     mat: '$45.00',    labor: '$28.00',    ucost: '$438.00',     profit: '35%',  total: '$591.30' },
  { n: null, desc: B, unit: B, qty: B, equip: B, mat: B, labor: B, ucost: B, profit: B, total: B },
  { n: 26, desc: 'Plumbing Subtotal',     unit: B,     qty: B,          equip: B,           mat: B,           labor: B,           ucost: '$7,687.00',   profit: B,      total: '$10,377.45', isSub: true },
  { n: null, desc: B, unit: B, qty: B, equip: B, mat: B, labor: B, ucost: B, profit: B, total: B },
  // ── Finishes ──
  { n: 28, desc: 'Interior Finish',       unit: 'SF',  qty: '450',      equip: '$0.00',     mat: '$12.00',    labor: '$8.50',     ucost: '$9,225.00',   profit: '40%',  total: '$12,915.00' },
  { n: 29, desc: 'Waterline Tile',        unit: 'LF',  qty: '85',       equip: '$0.00',     mat: '$18.50',    labor: '$12.00',    ucost: '$2,592.50',   profit: '40%',  total: '$3,629.50' },
  { n: 30, desc: 'Coping',                unit: 'LF',  qty: '85',       equip: '$0.00',     mat: '$32.00',    labor: '$18.00',    ucost: '$4,250.00',   profit: '40%',  total: '$5,950.00' },
  { n: null, desc: B, unit: B, qty: B, equip: B, mat: B, labor: B, ucost: B, profit: B, total: B },
  { n: 32, desc: 'Finishes Subtotal',     unit: B,     qty: B,          equip: B,           mat: B,           labor: B,           ucost: '$16,067.50',  profit: B,      total: '$22,494.50', isSub: true },
];

const COLS_BASE = [
  { key: 'desc',   label: 'ITEM DESCRIPTION', width: 'minmax(180px, 1.8fr)', align: 'left' as const },
  { key: 'unit',   label: 'UNIT',             width: '56px',                  align: 'center' as const },
  { key: 'qty',    label: 'QTY',              width: '90px',                  align: 'right' as const },
  { key: 'equip',  label: 'EQUIPMENT',        width: '100px',                 align: 'right' as const },
  { key: 'mat',    label: 'MATERIAL',         width: '90px',                  align: 'right' as const },
  { key: 'labor',  label: 'LABOR',            width: '80px',                  align: 'right' as const },
  { key: 'ucost',  label: 'UNIT COST',        width: '110px',                 align: 'right' as const },
  { key: 'profit', label: 'PROFIT %',         width: '80px',                  align: 'right' as const },
  { key: 'total',  label: 'TOTAL',            width: 'minmax(110px, 1fr)',    align: 'right' as const },
] as const;

type ColKey = (typeof COLS_BASE)[number]['key'];

function parseMoney(s: string): number {
  if (!s || s === B) return 0;
  const n = parseFloat(s.replace(/[$,]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function fmtMoney(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function profitDecimal(profitStr: string): number {
  if (!profitStr || profitStr === B) return 0;
  const n = parseFloat(profitStr.replace('%', '').trim());
  return Number.isFinite(n) ? n / 100 : 0;
}

/** Customer view: embed margin in E/M/L and unit column; hide profit; line totals unchanged */
function toCustomerRow(row: DisplayRow): DisplayRow {
  if (!row.desc || row.desc === B) return row;
  if (row.isSub) {
    return {
      ...row,
      equip: B,
      mat: B,
      labor: B,
      ucost: '—',
      profit: B,
      total: row.total,
    };
  }
  const p = profitDecimal(row.profit);
  if (p <= 0) {
    return { ...row, profit: B };
  }
  const f = 1 + p;
  return {
    ...row,
    equip: fmtMoney(parseMoney(row.equip) * f),
    mat: fmtMoney(parseMoney(row.mat) * f),
    labor: fmtMoney(parseMoney(row.labor) * f),
    ucost: fmtMoney(parseMoney(row.ucost) * f),
    profit: B,
    total: row.total,
  };
}

function columnsForView(view: EstimateView) {
  if (view === 'admin') {
    return [...COLS_BASE];
  }
  return COLS_BASE.filter((c) => c.key !== 'profit').map((c) =>
    c.key === 'ucost' ? { ...c, label: 'UNIT PRICE' } : c,
  );
}

interface EstimateWorkspaceProps {
  estimateView: EstimateView;
}

export function EstimateWorkspace({ estimateView }: EstimateWorkspaceProps) {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<BudgetTab>('budget');
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [formulaText, setFormulaText] = useState('Select a cell to view formula');
  const [budgetRowErrors, setBudgetRowErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSelectedRow(null);
      setFormulaText('Select a cell to view formula');
    }, 0);
    return () => window.clearTimeout(timer);
  }, [estimateView]);

  const displayRows = useMemo(
    () => (estimateView === 'customer' ? DISPLAY_DATA.map(toCustomerRow) : DISPLAY_DATA),
    [estimateView],
  );

  const visibleCols = useMemo(() => columnsForView(estimateView), [estimateView]);

  const leaves = useMemo(() => flattenItems(state.projectItems), [state.projectItems]);

  const materialBasis = useMemo(() => {
    return leaves.reduce((sum, item) => sum + item.qty * (item.price + (item.markup ?? 0)), 0);
  }, [leaves]);

  const budgetTotals = useMemo(() => {
    let budget = 0;
    for (const item of leaves) {
      if (item.budgetCost != null && Number.isFinite(item.budgetCost)) budget += item.budgetCost;
    }
    return { budget, actual: materialBasis };
  }, [leaves, materialBasis]);

  const onBudgetBlur = useCallback(
    (item: ProjectItem, raw: string, el: HTMLInputElement) => {
      const trimmed = raw.trim();
      if (trimmed === '') {
        dispatch({ type: 'UPDATE_PROJECT_ITEM', id: item.id, patch: { budgetCost: null } });
        setBudgetRowErrors((p) => {
          const next = { ...p };
          delete next[item.id];
          return next;
        });
        return;
      }
      const n = parseFloat(raw.replace(/[^0-9.-]/g, ''));
      if (!Number.isFinite(n) || n < 0) {
        el.value =
          item.budgetCost != null && Number.isFinite(item.budgetCost)
            ? String(Math.round(item.budgetCost))
            : '';
        setBudgetRowErrors((p) => ({ ...p, [item.id]: 'Enter a valid amount' }));
        return;
      }
      const budgetCost = Math.max(0, n);
      dispatch({ type: 'UPDATE_PROJECT_ITEM', id: item.id, patch: { budgetCost } });
      setBudgetRowErrors((p) => {
        const next = { ...p };
        delete next[item.id];
        return next;
      });
    },
    [dispatch],
  );

  const buildMonthValue = state.data.expectedBuildDate
    ? state.data.expectedBuildDate.slice(0, 7)
    : '';
  const buildHintPct = inflationHintPctTotal(state.data.expectedBuildDate);
  const buildMonths = state.data.expectedBuildDate ? monthsFromToday(state.data.expectedBuildDate) : 0;

  const showLemBreakdown = useMemo(
    () =>
      leaves.some(
        (i) =>
          i.catalogLaborUnit != null || i.catalogEquipUnit != null || i.catalogMatUnit != null,
      ),
    [leaves],
  );

  const lemExtended = (item: ProjectItem) => ({
    labor: item.qty * (item.catalogLaborUnit ?? 0),
    equip: item.qty * (item.catalogEquipUnit ?? 0),
    mat: item.qty * (item.catalogMatUnit ?? 0),
  });

  const handleRowClick = (idx: number, row: DisplayRow) => {
    setSelectedRow(idx);
    if (estimateView === 'customer') {
      if (row.isSub) {
        setFormulaText(`=SUM(Total for ${row.desc}) — customer quote (no margin column)`);
      } else if (row.desc) {
        setFormulaText(`=${row.desc}: customer-facing rates include allowances; line total matches your quote`);
      } else {
        setFormulaText('Select a cell to view formula');
      }
      return;
    }
    if (row.isSub) {
      setFormulaText(`=SUM(Total for ${row.desc})`);
    } else if (row.desc) {
      setFormulaText(`=${row.desc}: ${row.qty} × (Equipment + Material + Labor) × (1 + Profit%)`);
    } else {
      setFormulaText('Select a cell to view formula');
    }
  };

  const gridCols = visibleCols.map((c) => c.width).join(' ');

  const formulaBarText =
    estimateView === 'customer' && selectedRow === null
      ? `${state.data.projectName || 'Project'} quote preview — customer rates include allowances; current BOM material basis ${fmtMoney(materialBasis)}.`
      : selectedRow === null
        ? `${state.data.projectName || 'Project'} cost build — current BOM material basis ${fmtMoney(materialBasis)}. Select a cell to view formula.`
        : formulaText;

  const cellContent = (row: DisplayRow, col: { key: string; align: string; label: string }, isSub: boolean) => {
    const key = col.key as ColKey;
    const raw = row[key as keyof DisplayRow];
    const val = raw ?? '';

    if (key === 'desc') {
      return (
        <div className={styles.cellDesc} style={{ textAlign: 'left' }} key={col.key}>
          {isSub ? <strong>{val}</strong> : val}
        </div>
      );
    }

    const ucostClass = key === 'ucost' && isSub ? styles.cellSubUcost : '';
    const totalClass = key === 'total' && isSub ? styles.cellSubTotal : '';
    return (
      <div
        key={col.key}
        className={`${styles.cell} ${ucostClass} ${totalClass}`}
        style={{ textAlign: col.align as 'left' | 'right' | 'center' }}
      >
        {val}
      </div>
    );
  };

  return (
    <div className={styles.outer}>
      {estimateView === 'admin' && (
        <div className={styles.bomBudgetWrap}>
          <div className={styles.bomBudgetRow}>
            <span className={styles.bomBudgetLabel}>Expected build</span>
            <input
              className={styles.bomBudgetMonth}
              type="month"
              value={buildMonthValue}
              onChange={(e) => {
                const v = e.target.value;
                dispatch({
                  type: 'UPDATE_DATA',
                  payload: { expectedBuildDate: v ? `${v}-01` : null },
                });
              }}
              aria-label="Expected first month of construction"
            />
            {state.data.expectedBuildDate && buildHintPct != null && buildMonths > 0 && (
              <span className={styles.bomBudgetHint}>
                ~+{buildHintPct}% cumulative material drift hint ({buildMonths} mo — flat rate, UI only; not applied to line totals).
              </span>
            )}
          </div>
          <table className={styles.bomBudgetTable}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                {showLemBreakdown && (
                  <>
                    <th>Labor</th>
                    <th>Equip</th>
                    <th>Mat</th>
                  </>
                )}
                <th>Actual</th>
                <th>Budget</th>
                <th>Var $</th>
                <th>Var %</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={showLemBreakdown ? 9 : 6} className={styles.bomBudgetEmpty}>
                    No BOM lines yet
                  </td>
                </tr>
              ) : (
                <>
                  {leaves.map((item) => {
                    const actual = item.qty * (item.price + (item.markup ?? 0));
                    const bud = item.budgetCost;
                    const varD = bud == null ? null : actual - bud;
                    const varP = bud != null && bud > 0 && varD != null ? (varD / bud) * 100 : null;
                    const err = budgetRowErrors[item.id];
                    const lem = lemExtended(item);
                    const hasLem =
                      item.catalogLaborUnit != null ||
                      item.catalogEquipUnit != null ||
                      item.catalogMatUnit != null;
                    return (
                      <tr key={item.id}>
                        <td>{item.description || item.name}</td>
                        <td>{item.qty}</td>
                        {showLemBreakdown && (
                          <>
                            <td>{hasLem ? fmtMoney(lem.labor) : '—'}</td>
                            <td>{hasLem ? fmtMoney(lem.equip) : '—'}</td>
                            <td>{hasLem ? fmtMoney(lem.mat) : '—'}</td>
                          </>
                        )}
                        <td>{fmtMoney(actual)}</td>
                        <td className={styles.bomBudgetCell} onClick={(e) => e.stopPropagation()}>
                          <input
                            key={`${item.id}-${item.budgetCost ?? 'x'}-${err ?? ''}`}
                            className={styles.bomBudgetInput}
                            type="text"
                            inputMode="decimal"
                            defaultValue={bud != null ? String(Math.round(bud)) : ''}
                            placeholder="—"
                            aria-label={`Budget for ${item.name}`}
                            aria-invalid={err ? true : undefined}
                            aria-describedby={err ? `budget-err-${item.id}` : undefined}
                            onFocus={() => {
                              setBudgetRowErrors((p) => {
                                if (!p[item.id]) return p;
                                const next = { ...p };
                                delete next[item.id];
                                return next;
                              });
                            }}
                            onBlur={(e) => onBudgetBlur(item, e.target.value, e.target)}
                          />
                          {err ? (
                            <span id={`budget-err-${item.id}`} className={styles.bomBudgetInputError}>
                              {err}
                            </span>
                          ) : null}
                        </td>
                        <td>{varD == null ? '—' : fmtMoney(varD)}</td>
                        <td>{varP == null ? '—' : `${varP >= 0 ? '+' : ''}${varP.toFixed(1)}%`}</td>
                      </tr>
                    );
                  })}
                  <tr className={styles.bomBudgetSub}>
                    <td>Subtotal / budget subtotal</td>
                    <td />
                    {showLemBreakdown && (
                      <>
                        <td>
                          {fmtMoney(
                            leaves.reduce((s, it) => s + lemExtended(it).labor, 0),
                          )}
                        </td>
                        <td>
                          {fmtMoney(
                            leaves.reduce((s, it) => s + lemExtended(it).equip, 0),
                          )}
                        </td>
                        <td>
                          {fmtMoney(
                            leaves.reduce((s, it) => s + lemExtended(it).mat, 0),
                          )}
                        </td>
                      </>
                    )}
                    <td>{fmtMoney(budgetTotals.actual)}</td>
                    <td>{fmtMoney(budgetTotals.budget)}</td>
                    <td>{fmtMoney(budgetTotals.actual - budgetTotals.budget)}</td>
                    <td>
                      {budgetTotals.budget > 0
                        ? `${(((budgetTotals.actual - budgetTotals.budget) / budgetTotals.budget) * 100).toFixed(1)}%`
                        : '—'}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Formula bar */}
      <div className={styles.formulaBar}>
        <span className={styles.fxLabel}>fx</span>
        <span className={styles.fxText}>{formulaBarText}</span>
      </div>

      {/* Spreadsheet */}
      <div className={styles.sheetWrap}>
        {/* Header */}
        <div className={styles.sheetHeader} style={{ gridTemplateColumns: `36px ${gridCols}` }}>
          <div className={styles.rowNum} />
          {visibleCols.map((col) => (
            <div key={col.key} className={styles.colHeader} style={{ textAlign: col.align }}>
              {col.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className={styles.sheetBody}>
          {displayRows.map((row, idx) => {
            const isBlank = !row.desc;
            const isSub = !!row.isSub;
            const isSelected = selectedRow === idx;

            return (
              <div
                key={idx}
                className={`${styles.sheetRow} ${isSub ? styles.subtotalRow : ''} ${isBlank ? styles.blankRow : ''} ${isSelected ? styles.selectedRow : ''}`}
                style={{ gridTemplateColumns: `36px ${gridCols}` }}
                onClick={() => handleRowClick(idx, row)}
              >
                <div className={styles.rowNum}>{row.n ?? ''}</div>
                {visibleCols.map((col) => cellContent(row, col, isSub))}
              </div>
            );
          })}
          {/* Extra empty rows to fill */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className={`${styles.sheetRow} ${styles.blankRow}`}
              style={{ gridTemplateColumns: `36px ${gridCols}` }}
            >
              <div className={styles.rowNum}>{33 + i}</div>
              {visibleCols.map((col) => (
                <div key={col.key} className={col.key === 'desc' ? styles.cellDesc : styles.cell} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom tabs */}
      <div className={styles.bottomBar}>
        <button
          className={`${styles.sheetTab} ${activeTab === 'budget' ? styles.sheetTabActive : ''}`}
          onClick={() => setActiveTab('budget')}
        >
          Budget
        </button>
        <button
          className={`${styles.sheetTab} ${activeTab === 'breakdown' ? styles.sheetTabActive : ''}`}
          onClick={() => setActiveTab('breakdown')}
        >
          Cost Breakdown
        </button>
      </div>
    </div>
  );
}

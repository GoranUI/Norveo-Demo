import { useMemo } from 'react';
import { useApp } from '../../store';
import { getTurnoverHoursForPoolType } from '../../data/engineering';
import { estimateTotalDynamicHeadFt, pipesForDesignFlow } from '../../data/hydraulicsHead';
import { flattenItems } from '../../data/projectItems';
import { calculateVolumeTotals } from '../../data/poolSections';
import styles from './ProjectKpiBar.module.css';

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function Kpi({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  const cls = warn ? styles.valueWarn : accent ? styles.valueAccent : styles.value;
  return (
    <div className={styles.kpi}>
      <span className={styles.label}>{label}</span>
      <span className={cls}>{value}</span>
    </div>
  );
}

export function ProjectKpiBar() {
  const { state } = useApp();
  const d = state.data;

  const totals = useMemo(() => calculateVolumeTotals(d.poolSections), [d.poolSections]);
  const volume = totals.totalGallons;
  const poolUseType = d.poolUseType || null;
  const turnoverHours =
    d.turnoverHoursOverride ?? getTurnoverHoursForPoolType(poolUseType, totals.averageDepth);
  const requiredGpm = Math.round(volume / (turnoverHours * 60));
  const defaultAddGpm = Math.max(0, Math.round(requiredGpm * 0.1));
  const addGpm = state.engineeringFlowAddGpm ?? defaultAddGpm;
  const designGpm = requiredGpm + addGpm;

  const surfaceArea = totals.totalArea;
  const averageDepth = totals.averageDepth;
  const batherLoadSqFtPerPerson = d.batherLoadSqFtPerPerson ?? 15;
  const usageMultiplier = d.batherLoadUsageMultiplier ?? 0.5;
  const maxBathers = surfaceArea > 0 ? Math.round(surfaceArea / batherLoadSqFtPerPerson) : 0;
  const designBathers = Math.round(maxBathers * usageMultiplier);

  const pipes = useMemo(
    () => pipesForDesignFlow(designGpm, d.designSuctionFps, d.designReturnFps),
    [designGpm, d.designSuctionFps, d.designReturnFps],
  );
  const tdhFt = useMemo(
    () =>
      estimateTotalDynamicHeadFt({
        designGpm,
        suctionIdIn: pipes.suction.idIn,
        returnIdIn: pipes.return.idIn,
        averageDepthFt: averageDepth,
        surfaceAreaSqFt: surfaceArea,
        filtrationType: d.filtrationType,
        hasHeater: d.heatingSystem.length > 0,
      }),
    [
      designGpm,
      pipes.suction.idIn,
      pipes.return.idIn,
      averageDepth,
      surfaceArea,
      d.filtrationType,
      d.heatingSystem,
    ],
  );

  const totalCost = useMemo(() => {
    const rows = flattenItems(state.projectItems);
    return rows.reduce((s, r) => s + r.qty * r.price, 0);
  }, [state.projectItems]);

  return (
    <div className={styles.strip}>
      <Kpi label="Volume" value={volume > 0 ? `${volume.toLocaleString()} gal` : '— gal'} />
      <div className={styles.divider} />
      <Kpi label="Design GPM" value={`${designGpm} GPM`} accent />
      <div className={styles.divider} />
      <Kpi label="TDH" value={tdhFt > 0 ? `${tdhFt} ft` : '—'} accent />
      <div className={styles.divider} />
      <Kpi label="Bather Load" value={`${designBathers}`} />
      <div className={styles.divider} />
      <Kpi label="Turnover" value={`${turnoverHours}h`} />

      <div className={styles.separator} />
      <Kpi label="Material Cost" value={fmt(totalCost)} accent />
    </div>
  );
}

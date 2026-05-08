import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../store';
import { flattenItems } from '../../data/projectItems';
import styles from './RightPanel.module.css';

interface TreeItem {
  id: string;
  name: string;
  children?: TreeItem[];
  count?: number;
}

const MODEL_TREE: TreeItem[] = [
  {
    id: 'shell',
    name: 'Pool Shell',
    children: [
      { id: 'perimeter', name: 'Perimeter', count: 4 },
      { id: 'steps', name: 'Steps', count: 1 },
      { id: 'benches', name: 'Benches', count: 0 },
      { id: 'spa', name: 'Spa', count: 1 },
    ],
  },
  {
    id: 'fixtures',
    name: 'Fixtures',
    children: [
      { id: 'wallReturns', name: 'Wall Returns', count: 4 },
      { id: 'floorReturns', name: 'Floor Returns', count: 2 },
      { id: 'skimmers', name: 'Skimmers', count: 1 },
      { id: 'drains', name: 'Pool Drains', count: 2 },
      { id: 'lights', name: 'Wall Lights', count: 3 },
      { id: 'waterLevel', name: 'Water Level Controller', count: 1 },
      { id: 'bubblers', name: 'Bubblers', count: 0 },
    ],
  },
  {
    id: 'hydraulics',
    name: 'Hydraulics',
    children: [
      { id: 'supplyLines', name: 'Supply Lines', count: 0 },
      { id: 'returnLines', name: 'Return Lines', count: 0 },
    ],
  },
];

function mergeTreeCounts(items: TreeItem[], qtyById: Record<string, number>): TreeItem[] {
  return items.map((item) => ({
    ...item,
    count: qtyById[item.id] ?? item.count,
    children: item.children ? mergeTreeCounts(item.children, qtyById) : item.children,
  }));
}

function TreeNode({ item, depth = 0 }: { item: TreeItem; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const [visible, setVisible] = useState(true);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <div
        className={styles.treeRow}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        {hasChildren ? (
          <button className={styles.treeChevron} onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
        ) : (
          <span className={styles.treeChevronSpace} />
        )}
        <button
          className={styles.treeVisibility}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <Eye size={10} /> : <EyeOff size={10} />}
        </button>
        <span className={`${styles.treeName} ${!visible ? styles.treeHidden : ''}`}>
          {item.name}
        </span>
        {item.count !== undefined && item.count > 0 && (
          <span className={styles.treeBadge}>{item.count}</span>
        )}
      </div>
      {expanded && hasChildren && item.children!.map((child) => (
        <TreeNode key={child.id} item={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function ModelTree() {
  const { state } = useApp();
  const qtyById = useMemo(() => {
    const m: Record<string, number> = {};
    for (const it of flattenItems(state.projectItems)) {
      m[it.id] = it.qty;
    }
    return m;
  }, [state.projectItems]);
  const tree = useMemo(() => mergeTreeCounts(MODEL_TREE, qtyById), [qtyById]);

  return (
    <div className={styles.treeContainer}>
      {tree.map((item) => (
        <TreeNode key={item.id} item={item} />
      ))}
    </div>
  );
}

import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { ModelTree } from './ModelTree';
import { PropertiesInspector } from './PropertiesInspector';
import styles from './RightPanel.module.css';

type Tab = 'tree' | 'props';

interface Props {
  /** Default tab on mount. */
  defaultTab?: Tab;
}

export function RightPanel({ defaultTab = 'tree' }: Props) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className={`${styles.panel} ${styles.panelCollapsed}`}>
        <button
          type="button"
          className={styles.collapseToggle}
          onClick={() => setCollapsed(false)}
          aria-label="Expand panel"
          title="Expand panel"
        >
          <ChevronLeft size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'tree'}
            className={`${styles.tab} ${tab === 'tree' ? styles.tabActive : ''}`}
            onClick={() => setTab('tree')}
          >
            Model Tree
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'props'}
            className={`${styles.tab} ${tab === 'props' ? styles.tabActive : ''}`}
            onClick={() => setTab('props')}
          >
            Properties
          </button>
        </div>
        <button
          type="button"
          className={styles.collapseToggle}
          onClick={() => setCollapsed(true)}
          aria-label="Collapse panel"
          title="Collapse panel"
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <div className={styles.content}>
        {tab === 'tree' ? <ModelTree /> : <PropertiesInspector />}
      </div>
    </div>
  );
}

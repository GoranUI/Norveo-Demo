import { PanelHeader } from '../ui/PanelHeader';
import { PropertiesInspector } from './PropertiesInspector';
import styles from './RightPanel.module.css';

export function RightPanel() {
  return (
    <div className={styles.panel}>
      <PanelHeader title="Inspector" />
      <div className={styles.content}>
        <PropertiesInspector />
      </div>
    </div>
  );
}

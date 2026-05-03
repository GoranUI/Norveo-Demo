import { useApp } from '../../store';
import { AUTHORING_MODE_LABELS } from '../../types';
import styles from './RightPanel.module.css';

export function PropertiesInspector() {
  const { state } = useApp();
  const { authoringMode, activeWorkspace } = state;

  if (activeWorkspace !== 'design') {
    return <div className={styles.empty}>Select a canvas object to inspect.</div>;
  }

  return (
    <div className={styles.inspector}>
      <div className={styles.inspectorSection}>
        <div className={styles.inspectorLabel}>Authoring Mode</div>
        <div className={styles.inspectorValue}>{AUTHORING_MODE_LABELS[authoringMode]}</div>
      </div>
      <div className={styles.inspectorSection}>
        <div className={styles.inspectorLabel}>Selection</div>
        <div className={styles.inspectorValue}>No object selected</div>
      </div>
    </div>
  );
}

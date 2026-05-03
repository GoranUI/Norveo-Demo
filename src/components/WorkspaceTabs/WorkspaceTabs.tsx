import { useApp } from '../../store';
import { WORKSPACE_LABELS } from '../../types';
import type { Workspace } from '../../types';
import {
  SlidersHorizontal, PenTool, ClipboardList, Folder,
} from 'lucide-react';
import styles from './WorkspaceTabs.module.css';

const WORKSPACES: { id: Workspace; icon: React.FC<{ size?: number }> }[] = [
  { id: 'configurator', icon: SlidersHorizontal },
  { id: 'design', icon: PenTool },
  { id: 'bom', icon: ClipboardList },
  { id: 'files', icon: Folder },
];

export function WorkspaceTabs() {
  const { state, dispatch } = useApp();

  return (
    <div className={styles.bar}>
      {WORKSPACES.map(({ id, icon: Icon }) => {
        const isActive = state.activeWorkspace === id;
        return (
          <button
            key={id}
            className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
            onClick={() => dispatch({ type: 'SET_WORKSPACE', workspace: id })}
          >
            <Icon size={13} />
            <span>{WORKSPACE_LABELS[id]}</span>
          </button>
        );
      })}
    </div>
  );
}

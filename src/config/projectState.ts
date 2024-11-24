export interface ProjectState {
  version: string;
  savedAt: string;
  cacheKeys: string[];
}

export const PROJECT_VERSION = '1.0.0';

export const saveProjectState = (): ProjectState => {
  const state: ProjectState = {
    version: PROJECT_VERSION,
    savedAt: new Date().toISOString(),
    cacheKeys: Object.keys(localStorage).filter(key => 
      key.startsWith('clientes_cache') || 
      key.startsWith('movimientos_cache_')
    )
  };

  localStorage.setItem('project_state', JSON.stringify(state));
  return state;
};

export const loadProjectState = (): ProjectState | null => {
  const state = localStorage.getItem('project_state');
  if (!state) return null;
  
  try {
    return JSON.parse(state);
  } catch {
    return null;
  }
};

export const clearProjectState = () => {
  const state = loadProjectState();
  if (!state) return;

  state.cacheKeys.forEach(key => localStorage.removeItem(key));
  localStorage.removeItem('project_state');
};
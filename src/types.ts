// ── Workspaces (bottom tabs) ──
export type Workspace =
  | 'configurator'
  | 'engineering'
  | 'design'
  | 'bom'
  | 'estimate'
  | 'deliverables'
  | 'history'
  | 'summary'
  | 'files';

/** Sub-view inside Files: `browse` = folder tree; `activity` = save log (who saved, when). */
export type FilesView = 'browse' | 'activity';

// ── Design workspace (canvas) ──
export type AuthoringMode = 'geometry' | 'architecture' | 'fixtures' | 'hydraulics' | 'structure' | 'framing';
export type CanvasLayerView = 'all' | 'geometry' | 'architecture' | 'fixtures' | 'plumbing';
export type DrawTool = string;

// ── Equipment categories (manufacturer selection) ──
export type EquipmentCategory =
  | 'filtration'
  | 'sanitation'
  | 'heating'
  | 'pump'
  | 'controller'
  | 'lighting';

// ── Project items (shared between Procurement and Configurator) ──
export type ItemStatus = 'purchased' | 'to-purchase' | 'on-order' | 'not-required';

export type ItemInteraction = 'movable' | 'shapeable';

export interface ProjectItem {
  id: string;
  name: string;
  category: string;
  color: string;
  qty: number;
  unit: string;
  price: number;
  /** Dollar markup added per unit on top of `price`. Defaults to 0 if absent. */
  markup?: number;
  visible: boolean;
  partNo: string;
  brand: string;
  description: string;
  supplier: string;
  status: ItemStatus;
  interaction: ItemInteraction;
  configuratorSection?: string;
  children?: ProjectItem[];
}

// ── Config Steps ──
export const ConfigStep = {
  ProjectLocation: 'projectLocation',
  Customer: 'customer',
  ProjectType: 'projectType',
  LocalCodeAwareness: 'localCodeAwareness',
  LocalCodeDetails: 'localCodeDetails',
  PoolUseType: 'poolUseType',
  Volume: 'volume',
  Deck: 'deck',
  DivingBoard: 'divingBoard',
  GutterStyle: 'gutterStyle',
  CopingStyle: 'copingStyle',
  MechanicalKnowledge: 'mechanicalKnowledge',
  MechanicalBrand: 'mechanicalBrand',
  MechanicalPriorities: 'mechanicalPriorities',
  Filtration: 'filtration',
  Sanitation: 'sanitation',
  ChemicalControl: 'chemicalControl',
  SecondarySanitation: 'secondarySanitation',
  PhBuffer: 'phBuffer',
  Heating: 'heating',
  InteriorFinish: 'interiorFinish',
  TileDetails: 'tileDetails',
  WaterFeatures: 'waterFeatures',
  Features: 'features',
  FinalReview: 'finalReview',
} as const;

export type ConfigStep = (typeof ConfigStep)[keyof typeof ConfigStep];

// ── Step metadata ──
export interface StepMeta {
  id: ConfigStep;
  label: string;
  group: StepGroup;
  getValue: (data: ProjectData) => string;
  isVisible: (data: ProjectData) => boolean;
  isComplete: (data: ProjectData) => boolean;
}

export type StepGroup =
  | 'Project Information'
  | 'Local Code'
  | 'Pool Volumes'
  | 'Pool Design'
  | 'Mechanical Systems'
  | 'Finishes'
  | 'Features'
  | 'Review';

// ── Project Data ──
export interface ProjectData {
  projectName: string;
  clientCompanyName: string;
  clientContactName: string;
  clientContactEmail: string;
  ownerName: string;
  ownerAddress: string;
  projectAddress: string;
  projectCity: string;
  projectState: string;
  projectZip: string;
  ownerCrmLink: string;
  projectType: string | null;
  localCodeAwareness: string | null;
  /** @deprecated free-form notes — replaced by `codeStandards` + `customCodes`. */
  localCodeNotes: string;
  /** Selected standard codes (multi-select). Stored as code IDs from CODE_STANDARDS. */
  codeStandards: string[];
  /** User-added custom codes (free text). Per Travis: future autopopulation by location. */
  customCodes: string[];
  poolUseType: string | null;
  /** Volume Calculator — editable list of pool sections (label, type, area, depth). */
  poolSections: import('./data/poolSections').PoolSection[];
  /** Deck surface area in square feet. Drives bather-load deck-ratio category (Brett spec). */
  deckSf: number;
  /** Number of diving boards. Each subtracts ~300 sf from usable deep area. */
  numDivingBoards: number;
  /** Per-board deep-area exclusion in sf. Brett spec default = 300. */
  divingBoardExclusionSf: number;
  gutterStyle: string[];
  copingStyle: string | null;
  mechanicalKnowledge: string | null;
  /** @deprecated Use `brandPreferences` for per-system selection. Kept for migration. */
  mechanicalBrandPreference: string;
  mechanicalPriorities: string[];
  /** Preferred manufacturer per equipment category. `null` = "any / no preference". */
  brandPreferences: Record<EquipmentCategory, string | null>;
  filtrationType: string | null;
  /** Catalogue product id (e.g. 'flt-pen-tr140') for the chosen filter tank. Null = none picked. */
  selectedFilterModelId: string | null;
  /** Number of identical filter tanks installed in parallel. */
  filterCount: number;
  /** Override design surface flow rate (gpm/ft²). Null = use media+pool default. */
  filterDesignRateGpmPerSf: number | null;
  /** Override backwash velocity (gpm/ft²). Null = media default. */
  filterBackwashRateGpmPerSf: number | null;
  /** Sewer / discharge line capacity (gpm). */
  filterSewerCapacityGpm: number;
  /** Retention time used to size the retention pit (min). */
  filterRetentionTimeMin: number;
  /** Retention pit dimensions (ft). */
  filterRetentionPitLengthFt: number;
  filterRetentionPitWidthFt: number;
  filterRetentionPitDepthFt: number;
  sanitationType: string | null;
  /** Chemical controller class. Brett spec — single select from 4 classes. */
  chemicalControl: string | null;
  /** Optional secondary sanitation systems (multi-select: Ozone, UV). */
  secondarySanitation: string[];
  /** pH buffer system (single select). */
  phBuffer: string | null;
  heatingSystem: string[];
  /** Indoor vs outdoor — drives wind/evaporation loss assumptions. */
  poolEnvironment: 'indoor' | 'outdoor';
  /** Which weather scenario to size the heater against. */
  heaterScenario: 'coldest-month' | 'shoulder-season';
  /** Desired pool water temperature (°F). */
  heaterTargetWaterTempF: number;
  /** Starting water temperature before heat-up (°F). Often = fill/groundwater temp. */
  heaterStartWaterTempF: number;
  /** Design outdoor ambient air temperature (°F) for heat-loss calcs. */
  heaterAmbientTempF: number;
  /** Average wind speed during the design scenario (mph). */
  heaterWindMph: number;
  /** Average fill / groundwater temperature (°F). Pulled from project location when available. */
  heaterFillWaterTempF: number;
  /** Target heat-up time in days. Typical commercial = 2 days. */
  heaterHeatUpDays: number;
  /** Heater thermal efficiency as a percentage (e.g. 84 for an 84% efficient gas heater). */
  heaterEfficiencyPct: number;
  /** User-selected heater output in BTU/hr from the comparison panel. Null = auto-recommend. */
  selectedHeaterBtu: number | null;
  finishType: string | null;
  tileBandHeight: string | null;
  customTileHeight: string;
  stairNosingDetail: string | null;
  waterFeatures: string[];
  /** General pool features (auto-cover, slide, ADA lift, etc.). Multi-select. */
  poolFeatures: string[];
  isFinalized: boolean;
  /** Sq ft per bather for bather load calc. Null = use default (15). Regional codes may differ. */
  batherLoadSqFtPerPerson: number | null;
  /** Usage multiplier for design bather load. Null = use default (0.5). */
  batherLoadUsageMultiplier: number | null;
  /** Override turnover hours (bypasses pool use type lookup). Null = derive from pool use type. */
  turnoverHoursOverride: number | null;
  /** Design suction velocity target (ft/s). Null = use default (5). */
  designSuctionFps: number | null;
  /** Design return velocity target (ft/s). Null = use default (8). */
  designReturnFps: number | null;
}

// ── User mode ──
export type UserMode = 'engineer' | 'sales';

// ── UI theme ──
export type Theme = 'dark' | 'light';

/** Entry flow: landing (project list) -> template/chat (new project) -> workspace. */
export type WizardPhase = 'landing' | 'chat' | 'template' | 'wizard' | 'workspace';

// ── App State ──
export interface AppState {
  activeWorkspace: Workspace;
  // Config drawer
  activeStep: ConfigStep | null;
  configDrawerOpen: boolean;
  expandedGroups: StepGroup[];
  // Design canvas
  authoringMode: AuthoringMode;
  activeTool: DrawTool;
  canvasLayerView: CanvasLayerView;
  zoom: number;
  gridEnabled: boolean;
  snapEnabled: boolean;
  showDimensions: boolean;
  // Mode & theme
  userMode: UserMode;
  theme: Theme;
  /** Additive GPM on top of code-required flow; null = default 10% of required GPM (rounded). */
  engineeringFlowAddGpm: number | null;
  // Data
  data: ProjectData;
  wizardPhase: WizardPhase;
  /** True when ProjectData has been modified since the last save. Drives the "leave project" confirm dialog. */
  isDirty: boolean;
  appliedTemplatePreset: Partial<ProjectData> | null;
  projectItems: ProjectItem[];
  /** User-saved templates (persisted to localStorage). */
  userTemplates: import('./data/projectTemplates').ProjectTemplate[];
  /** Sub-view inside the Files workspace. */
  filesView: FilesView;
  /** Project files (mutable — grows on each Save). */
  projectFiles: import('./data/projectHistory').ProjectFile[];
  /** Activity feed in state; the Saves tab only shows `saved` events (who / when). */
  activityLog: import('./data/projectHistory').ActivityEvent[];
  /** Cross-workspace handoff: Files/Browse reads this to auto-select a file. */
  selectedFileId: string | null;
}

// ── Actions ──
export type AppAction =
  | { type: 'SET_WORKSPACE'; workspace: Workspace }
  | { type: 'SET_STEP'; step: ConfigStep | null }
  | { type: 'OPEN_CONFIG_DRAWER'; step: ConfigStep }
  | { type: 'CLOSE_CONFIG_DRAWER' }
  /**
   * Switch to the Configurator workspace and target a specific step. Used by
   * the Engineering / Summary / Final Review surfaces so a click on a summary
   * row routes the user to the proper configurator step instead of opening
   * the side drawer.
   */
  | { type: 'NAVIGATE_TO_STEP'; step: ConfigStep }
  | { type: 'TOGGLE_GROUP'; group: StepGroup }
  | { type: 'UPDATE_DATA'; payload: Partial<ProjectData> }
  | { type: 'TOGGLE_FINALIZE' }
  | { type: 'SET_AUTHORING_MODE'; mode: AuthoringMode }
  | { type: 'SET_ACTIVE_TOOL'; tool: DrawTool }
  | { type: 'SET_CANVAS_LAYER_VIEW'; view: CanvasLayerView }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_SNAP' }
  | { type: 'TOGGLE_DIMENSIONS' }
  | { type: 'SET_USER_MODE'; mode: UserMode }
  | { type: 'SET_THEME'; theme: Theme }
  | { type: 'SET_ENGINEERING_FLOW_ADD_GPM'; gpm: number | null }
  | { type: 'APPLY_WORKSPACE_TEMPLATE'; preset: Partial<ProjectData> }
  | { type: 'START_NEW_PROJECT' }
  | { type: 'START_CHAT' }
  | { type: 'START_CHAT_WITH_PRESET'; preset: Partial<ProjectData> }
  | { type: 'FINISH_WIZARD' }
  | { type: 'SKIP_WIZARD' }
  | { type: 'SAVE_AS_TEMPLATE'; name: string }
  | { type: 'DELETE_USER_TEMPLATE'; id: string }
  | { type: 'UPDATE_PROJECT_ITEM'; id: string; patch: Partial<ProjectItem> }
  | { type: 'TOGGLE_ALL_ITEMS_VISIBILITY'; visible: boolean }
  | { type: 'SELECT_FILE'; fileId: string | null }
  | { type: 'SET_FILES_VIEW'; view: FilesView }
  | { type: 'SAVE_PROJECT' }
  | {
      type: 'OPEN_PROJECT';
      profile: {
        preset: Partial<ProjectData>;
        projectItems: ProjectItem[];
        projectFiles: import('./data/projectHistory').ProjectFile[];
        activityLog: import('./data/projectHistory').ActivityEvent[];
        engineeringFlowAddGpm: number | null;
      };
    }
  | { type: 'RETURN_TO_LANDING' };

// ── Step definitions ──
function truncate(s: string, n = 28): string {
  return s.length > n ? s.slice(0, n) + '...' : s;
}

export const STEP_DEFINITIONS: StepMeta[] = [
  {
    id: ConfigStep.ProjectLocation,
    label: 'Project Location',
    group: 'Project Information',
    getValue: (d) => {
      if (d.projectAddress) {
        const parts = [d.projectAddress, d.projectCity, d.projectState, d.projectZip].filter(Boolean);
        return truncate(parts.join(', '));
      }
      return '';
    },
    isVisible: () => true,
    isComplete: (d) => !!(d.projectAddress && d.projectCity && d.projectState && d.projectZip),
  },
  {
    id: ConfigStep.Customer,
    label: 'Customer',
    group: 'Project Information',
    getValue: (d) => d.ownerCrmLink ? truncate(d.ownerCrmLink) : '',
    isVisible: () => true,
    isComplete: (d) => !!d.ownerCrmLink,
  },
  {
    id: ConfigStep.ProjectType,
    label: 'Project Type',
    group: 'Project Information',
    getValue: (d) => d.projectType || '',
    isVisible: () => true,
    isComplete: (d) => !!d.projectType,
  },
  {
    id: ConfigStep.LocalCodeAwareness,
    label: 'Code Awareness',
    group: 'Local Code',
    getValue: (d) => {
      if (!d.localCodeAwareness) return '';
      if (d.localCodeAwareness === 'yes') return 'Aware';
      if (d.localCodeAwareness === 'no') return 'Not aware';
      return 'Needs help';
    },
    isVisible: () => true,
    isComplete: (d) => !!d.localCodeAwareness,
  },
  {
    id: ConfigStep.LocalCodeDetails,
    label: 'Code Standards',
    group: 'Local Code',
    getValue: (d) => {
      const total = d.codeStandards.length + d.customCodes.length;
      if (total === 0) return '';
      return `${total} ${total === 1 ? 'code' : 'codes'}`;
    },
    isVisible: (d) => d.localCodeAwareness === 'yes',
    isComplete: (d) => d.codeStandards.length + d.customCodes.length > 0,
  },
  {
    id: ConfigStep.Volume,
    label: 'Volume',
    group: 'Pool Volumes',
    getValue: (d) => {
      const sections = d.poolSections;
      if (!sections || sections.length === 0) return '';
      let totalArea = 0;
      let totalVolume = 0;
      for (const s of sections) {
        const a = Math.max(0, s.area);
        totalArea += a;
        totalVolume += a * Math.max(0, s.depth);
      }
      if (totalArea <= 0 || totalVolume <= 0) return '';
      const gal = Math.round(totalVolume * 7.4805);
      return `${gal.toLocaleString()} gal`;
    },
    isVisible: () => true,
    isComplete: (d) =>
      d.poolSections.length > 0 &&
      d.poolSections.every((s) => s.label.trim().length > 0 && s.area > 0 && s.depth > 0),
  },
  {
    id: ConfigStep.Deck,
    label: 'Deck',
    group: 'Pool Volumes',
    getValue: (d) => (d.deckSf > 0 ? `${d.deckSf.toLocaleString()} sf` : ''),
    isVisible: () => true,
    isComplete: (d) => d.deckSf > 0,
  },
  {
    id: ConfigStep.DivingBoard,
    label: 'Diving Board',
    group: 'Pool Volumes',
    getValue: (d) => `${d.numDivingBoards} ${d.numDivingBoards === 1 ? 'board' : 'boards'}`,
    isVisible: () => true,
    /** 0 boards is a valid answer; the field is always considered complete once acknowledged. */
    isComplete: (d) => d.numDivingBoards >= 0,
  },
  {
    id: ConfigStep.PoolUseType,
    label: 'Pool Use',
    group: 'Pool Design',
    getValue: (d) => d.poolUseType || '',
    isVisible: () => true,
    isComplete: (d) => !!d.poolUseType,
  },
  {
    id: ConfigStep.GutterStyle,
    label: 'Pool Recirculation',
    group: 'Pool Design',
    getValue: (d) => {
      const values = d.gutterStyle;
      if (!values.length) return '';
      // Inline lookup to avoid circular import. Falls back to raw value.
      const map: Record<string, string> = {
        'skimmer-12-coping': 'Skimmer · 12" coping',
        'skimmer-18-coping': 'Skimmer · 18" coping',
        'coping-no-skimmers': 'Coping, no skimmers',
        'no-gutter-splash-pad': 'No gutter — splash pad',
        'ss-deck-level-weirs': 'SS · deck-level (weirs)',
        'ss-deck-level': 'SS · deck-level',
        'ss-rollout': 'SS · rollout',
        'concrete-deck-level': 'Concrete · deck-level',
        'concrete-rollout': 'Concrete · rollout',
        'concrete-rollout-parapet': 'Concrete · rollout w/ parapet',
        'concrete-fully-recessed': 'Concrete · fully recessed',
      };
      return truncate(values.map((v) => map[v] ?? v).join(', '));
    },
    isVisible: () => true,
    isComplete: (d) => d.gutterStyle.length > 0,
  },
  {
    id: ConfigStep.CopingStyle,
    label: 'Coping Style',
    group: 'Pool Design',
    getValue: (d) => d.copingStyle || '',
    isVisible: () => true,
    isComplete: (d) => !!d.copingStyle,
  },
  {
    id: ConfigStep.MechanicalKnowledge,
    label: 'System Knowledge',
    group: 'Mechanical Systems',
    getValue: (d) => {
      if (!d.mechanicalKnowledge) return '';
      return d.mechanicalKnowledge === 'know' ? 'Known' : 'Help me choose';
    },
    isVisible: () => true,
    isComplete: (d) => !!d.mechanicalKnowledge,
  },
  {
    id: ConfigStep.MechanicalPriorities,
    label: 'Priorities',
    group: 'Mechanical Systems',
    getValue: (d) => d.mechanicalPriorities.length ? d.mechanicalPriorities.join(', ') : '',
    isVisible: (d) => d.mechanicalKnowledge === 'help',
    isComplete: (d) => d.mechanicalPriorities.length > 0,
  },
  {
    id: ConfigStep.Filtration,
    label: 'Filtration',
    group: 'Mechanical Systems',
    getValue: (d) => {
      const parts: string[] = [];
      if (d.filtrationType) parts.push(d.filtrationType);
      if (d.selectedFilterModelId && d.filterCount > 0) {
        parts.push(`${d.filterCount}× selected`);
      }
      return parts.length ? truncate(parts.join(' · ')) : '';
    },
    isVisible: () => true,
    isComplete: (d) => !!d.filtrationType && !!d.selectedFilterModelId && d.filterCount > 0,
  },
  {
    id: ConfigStep.Sanitation,
    label: 'Primary Sanitation',
    group: 'Mechanical Systems',
    getValue: (d) => d.sanitationType || '',
    isVisible: () => true,
    isComplete: (d) => !!d.sanitationType,
  },
  {
    id: ConfigStep.ChemicalControl,
    label: 'Chemical Control',
    group: 'Mechanical Systems',
    getValue: (d) => d.chemicalControl || '',
    isVisible: () => true,
    isComplete: (d) => !!d.chemicalControl,
  },
  {
    id: ConfigStep.SecondarySanitation,
    label: 'Secondary Sanitation',
    group: 'Mechanical Systems',
    getValue: (d) => (d.secondarySanitation.length ? d.secondarySanitation.join(', ') : ''),
    isVisible: () => true,
    /** Optional system — empty array is a valid "no secondary" answer. */
    isComplete: () => true,
  },
  {
    id: ConfigStep.PhBuffer,
    label: 'pH Buffer',
    group: 'Mechanical Systems',
    getValue: (d) => d.phBuffer || '',
    isVisible: () => true,
    isComplete: (d) => !!d.phBuffer,
  },
  {
    id: ConfigStep.Heating,
    label: 'Heating',
    group: 'Mechanical Systems',
    getValue: (d) => {
      const parts: string[] = [];
      if (d.heatingSystem.length) parts.push(d.heatingSystem.join(', '));
      if (d.heaterTargetWaterTempF) parts.push(`${d.heaterTargetWaterTempF}°F`);
      return parts.length ? truncate(parts.join(' · ')) : '';
    },
    isVisible: () => true,
    isComplete: (d) => d.heatingSystem.length > 0 && d.heaterTargetWaterTempF > 0,
  },
  {
    id: ConfigStep.InteriorFinish,
    label: 'Interior Finish',
    group: 'Finishes',
    getValue: (d) => d.finishType || '',
    isVisible: () => true,
    isComplete: (d) => !!d.finishType,
  },
  {
    id: ConfigStep.TileDetails,
    label: 'Tile Details',
    group: 'Finishes',
    getValue: (d) => {
      const parts = [d.tileBandHeight, d.stairNosingDetail].filter(Boolean);
      return parts.length ? truncate(parts.join(', ')) : '';
    },
    isVisible: (d) => d.finishType === 'Tile',
    isComplete: (d) => !!(d.tileBandHeight && d.stairNosingDetail),
  },
  {
    id: ConfigStep.WaterFeatures,
    label: 'Water Features',
    group: 'Features',
    getValue: (d) => d.waterFeatures.length ? truncate(d.waterFeatures.join(', ')) : '',
    isVisible: () => true,
    isComplete: (d) => d.waterFeatures.length > 0,
  },
  {
    id: ConfigStep.Features,
    label: 'Pool Features',
    group: 'Features',
    getValue: (d) => (d.poolFeatures.length ? truncate(d.poolFeatures.join(', ')) : ''),
    isVisible: () => true,
    /** Optional list — empty is a valid answer ("no extras"). */
    isComplete: () => true,
  },
  {
    id: ConfigStep.FinalReview,
    label: 'Final Review',
    group: 'Review',
    getValue: () => '',
    isVisible: () => true,
    isComplete: () => false,
  },
];

export const STEP_GROUPS: StepGroup[] = [
  'Project Information',
  'Local Code',
  'Pool Volumes',
  'Pool Design',
  'Mechanical Systems',
  'Finishes',
  'Features',
  'Review',
];

/** Groups rendered on the Configurator workspace (excludes wizard-only Project Information and Review). */
export const CONFIGURATOR_STEP_GROUPS: StepGroup[] = STEP_GROUPS.filter(
  (g) => g !== 'Review' && g !== 'Project Information',
);

/** True when every visible step in the Configurator groups is complete (same rules as the configurator nav). */
export function isConfiguratorWorkflowComplete(data: ProjectData): boolean {
  for (const group of CONFIGURATOR_STEP_GROUPS) {
    const steps = STEP_DEFINITIONS.filter(
      (s) => s.group === group && s.isVisible(data),
    );
    if (steps.length === 0) continue;
    if (!steps.every((s) => s.isComplete(data))) return false;
  }
  return true;
}

// ── Tool definitions per authoring mode ──
export interface ToolDef {
  id: string;
  label: string;
  shortcut?: string;
  icon: string;
}

export const TOOLS_BY_MODE: Record<AuthoringMode, ToolDef[]> = {
  geometry: [
    { id: 'select', label: 'Select', shortcut: 'V', icon: 'MousePointer2' },
    { id: 'pan', label: 'Pan', shortcut: 'H', icon: 'Hand' },
    { id: 'divider1', label: '', icon: '' },
    { id: 'addPoint', label: 'Add Point', shortcut: 'P', icon: 'Plus' },
    { id: 'addSegment', label: 'Add Segment', shortcut: 'L', icon: 'Minus' },
    { id: 'offset', label: 'Offset', shortcut: 'O', icon: 'CopyPlus' },
    { id: 'measure', label: 'Measure', shortcut: 'M', icon: 'Ruler' },
  ],
  architecture: [
    { id: 'select', label: 'Select', shortcut: 'V', icon: 'MousePointer2' },
    { id: 'pan', label: 'Pan', shortcut: 'H', icon: 'Hand' },
    { id: 'divider1', label: '', icon: '' },
    { id: 'addStep', label: 'Add Step', icon: 'Footprints' },
    { id: 'addBench', label: 'Add Bench', icon: 'Armchair' },
    { id: 'addShelf', label: 'Add Shelf', icon: 'AlignVerticalSpaceAround' },
    { id: 'addLedge', label: 'Add Ledge', icon: 'RectangleHorizontal' },
  ],
  fixtures: [
    { id: 'select', label: 'Select', shortcut: 'V', icon: 'MousePointer2' },
    { id: 'pan', label: 'Pan', shortcut: 'H', icon: 'Hand' },
    { id: 'divider1', label: '', icon: '' },
    { id: 'placeReturn', label: 'Wall Return', icon: 'ArrowUpFromDot' },
    { id: 'placeDrain', label: 'Main Drain', icon: 'CircleDot' },
    { id: 'placeLight', label: 'Light', icon: 'Lightbulb' },
    { id: 'placeSkimmer', label: 'Skimmer', icon: 'Filter' },
  ],
  hydraulics: [
    { id: 'select', label: 'Select', shortcut: 'V', icon: 'MousePointer2' },
    { id: 'pan', label: 'Pan', shortcut: 'H', icon: 'Hand' },
    { id: 'divider1', label: '', icon: '' },
    { id: 'routePipe', label: 'Route Pipe', icon: 'Route' },
    { id: 'addValve', label: 'Add Valve', icon: 'Disc' },
    { id: 'addFitting', label: 'Add Fitting', icon: 'GitBranch' },
  ],
  structure: [
    { id: 'select', label: 'Select', shortcut: 'V', icon: 'MousePointer2' },
    { id: 'pan', label: 'Pan', shortcut: 'H', icon: 'Hand' },
    { id: 'divider1', label: '', icon: '' },
    { id: 'setThickness', label: 'Set Thickness', icon: 'Layers' },
    { id: 'markSection', label: 'Mark Section', icon: 'ScanLine' },
    { id: 'measure', label: 'Measure', shortcut: 'M', icon: 'Ruler' },
  ],
  framing: [
    { id: 'select', label: 'Select', shortcut: 'V', icon: 'MousePointer2' },
    { id: 'pan', label: 'Pan', shortcut: 'H', icon: 'Hand' },
    { id: 'divider1', label: '', icon: '' },
    { id: 'placeRebar', label: 'Place Rebar', icon: 'Grid3x3' },
    { id: 'placeSteel', label: 'Place Steel', icon: 'Box' },
    { id: 'measure', label: 'Measure', shortcut: 'M', icon: 'Ruler' },
  ],
};

export const AUTHORING_MODE_LABELS: Record<AuthoringMode, string> = {
  geometry: 'Geometry',
  architecture: 'Architecture',
  fixtures: 'Fixtures',
  hydraulics: 'Hydraulics',
  structure: 'Structure',
  framing: 'Framing',
};

export const CANVAS_LAYER_LABELS: Record<CanvasLayerView, string> = {
  all: 'All',
  geometry: 'Geometry',
  architecture: 'Architecture',
  fixtures: 'Fixtures',
  plumbing: 'Plumbing',
};

export const WORKSPACE_LABELS: Record<Workspace, string> = {
  configurator: 'Configurator',
  engineering: 'Engineering',
  design: 'Design',
  bom: 'Procurement',
  estimate: 'Estimate',
  deliverables: 'Deliverables',
  history: 'History',
  summary: 'Summary',
  files: 'Files',
};

export const FILES_VIEW_LABELS: Record<FilesView, string> = {
  browse: 'Folders',
  activity: 'Project Saves',
};

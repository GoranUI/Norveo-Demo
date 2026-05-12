import type { ProjectData } from '../types';

/** Pool types where deck area is usually not part of the hydraulic / permit package in this demo. */
const POOL_TYPES_HIDE_DECK = new Set(['Fountain', 'Interactive Play']);

/** Pool types where diving boards are not applicable by default. */
const POOL_TYPES_HIDE_DIVING = new Set([
  'Fountain',
  'Interactive Play',
  'Wading Pool',
  'Spa / Hot Tub',
  'Residential Spa',
  'Therapeutic Small',
  'Leisure River',
]);

/**
 * Deck step visibility — user can force-show when a jurisdiction still wants deck data
 * for an edge-case pool type.
 */
export function isDeckStepVisible(data: ProjectData): boolean {
  if (data.deckDivingWizardOverride) return true;
  const t = data.poolUseType;
  if (!t) return true;
  return !POOL_TYPES_HIDE_DECK.has(t);
}

export function isDivingBoardStepVisible(data: ProjectData): boolean {
  if (data.deckDivingWizardOverride) return true;
  const t = data.poolUseType;
  if (!t) return true;
  return !POOL_TYPES_HIDE_DIVING.has(t);
}

/** When MAHC or Texas public-pool rules are selected, secondary sanitation is commonly required — demo rule. */
export function secondarySanitationRequiredByCodes(data: ProjectData): boolean {
  const ids = data.codeStandards;
  if (ids.includes('mahc') || ids.includes('tx-tac-265-l')) {
    const publicish = data.poolUseType && ['Public Pool', 'Semi-Public Pool'].includes(data.poolUseType);
    return Boolean(publicish);
  }
  return false;
}

import { Opportunity } from '../types';

/**
 * Maps eligibility levels to MUI Chip color tokens.
 * @param elig - Opportunity eligibility category
 * @returns 'success' | 'warning' | 'error' | 'default'
 */
export const getEligibilityColor = (
  elig?: Opportunity['eligibility'] | string
): 'success' | 'warning' | 'error' | 'default' => {
  switch (elig) {
    case 'Eligible':
      return 'success';
    case 'Potentially Eligible':
      return 'warning';
    case 'Ineligible':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Safely formats ISO deadline strings into readable user-friendly dates.
 * @param deadlineStr - ISO 8601 string or undefined
 * @returns Formatted date string (e.g. "Nov 15, 2026") or fallback
 */
export const formatDeadline = (deadlineStr?: string): string => {
  if (!deadlineStr) return 'Flexible timeline';
  try {
    const d = new Date(deadlineStr);
    if (isNaN(d.getTime())) return 'Flexible timeline';
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Flexible timeline';
  }
};

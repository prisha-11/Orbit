import { Opportunity, StudentProfile } from '../types';
import sampleOpportunities from '../data/sampleOpportunities';

const OPPORTUNITIES_KEY = 'orbit_opportunities';
const PROFILE_KEY = 'orbit_profile';

/**
 * Resolves broad or casing-inconsistent category strings to strict Opportunity types.
 */
export const resolveOpportunityType = (val?: string): Opportunity['type'] => {
  const s = (val || '').toLowerCase().trim();
  if (s.includes('hack')) return 'Hackathon';
  if (s.includes('conf')) return 'Conference';
  if (s.includes('research') || s.includes('fellowship') || s.includes('paper')) return 'Research';
  if (s.includes('net') || s.includes('meet') || s.includes('summit') || s.includes('mixer')) return 'Networking';
  return 'Internship';
};

/**
 * Sanitizes untrusted or partial opportunity objects with robust defaults.
 */
export const sanitizeOpportunity = (raw: Record<string, unknown> | Partial<Opportunity> | null | undefined): Opportunity => {
  const o = raw || {};
  let skills: string[] = [];

  if (Array.isArray(o.skillsRequired)) {
    skills = o.skillsRequired.filter((s: unknown): s is string => typeof s === 'string' && s.trim().length > 0);
  } else if (typeof o.skillsRequired === 'string') {
    skills = o.skillsRequired.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  const rawType = typeof o.type === 'string' ? o.type : undefined;
  const rawElig = typeof o.eligibility === 'string' ? o.eligibility : undefined;
  const rawStatus = typeof o.status === 'string' ? o.status : undefined;

  return {
    id: String(o.id || Date.now().toString()),
    title: String(o.title || 'Untitled Opportunity'),
    organization: String(o.organization || 'Unknown Organization'),
    type: resolveOpportunityType(rawType),
    source: String(o.source || 'Direct Capture'),
    eligibility: (['Eligible', 'Potentially Eligible', 'Ineligible', 'Unknown'].includes(rawElig || '')
      ? rawElig
      : 'Eligible') as Opportunity['eligibility'],
    eligibilityReason: o.eligibilityReason ? String(o.eligibilityReason) : undefined,
    deadline: o.deadline ? String(o.deadline) : undefined,
    dates: (typeof o.dates === 'object' && o.dates !== null ? o.dates : {}) as Opportunity['dates'],
    description: String(o.description || ''),
    skillsRequired: skills.length > 0 ? skills : ['Problem Solving', 'Engineering'],
    compensationOrFees: o.compensationOrFees ? String(o.compensationOrFees) : undefined,
    location: o.location ? String(o.location) : 'Remote / Hybrid',
    sourceUrl: o.sourceUrl ? String(o.sourceUrl) : undefined,
    applicationUrl: o.applicationUrl ? String(o.applicationUrl) : undefined,
    matchScore: typeof o.matchScore === 'number' ? Math.min(Math.max(o.matchScore, 0), 100) : 75,
    matchReason: o.matchReason ? String(o.matchReason) : undefined,
    extractionConfidence: typeof o.extractionConfidence === 'number' ? o.extractionConfidence : 90,
    capturedAt: o.capturedAt ? String(o.capturedAt) : new Date().toISOString(),
    originalText: o.originalText ? String(o.originalText) : '',
    verificationStatus: o.verificationStatus === 'Unverified' ? 'Unverified' : 'Verified',
    status: (['Saved', 'To Apply', 'Applied', 'Shortlisted', 'Accepted', 'Closed'].includes(rawStatus || '')
      ? rawStatus
      : 'Saved') as Opportunity['status'],
  };
};

/**
 * Loads opportunities from localStorage with automatic category hydration.
 */
export const loadOpportunities = (): Opportunity[] => {
  let list: Opportunity[] = [];
  try {
    const data = typeof window !== 'undefined' ? localStorage.getItem(OPPORTUNITIES_KEY) : null;
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        list = parsed.map(item => sanitizeOpportunity(item as Record<string, unknown>));
      }
    }
  } catch (err) {
    console.warn('Error reading orbit_opportunities from localStorage:', err);
    list = [];
  }

  // Ensure all categories exist: Internship, Hackathon, Conference/Research, Networking
  const hasIntern = list.some(o => o.type === 'Internship');
  const hasHack = list.some(o => o.type === 'Hackathon');
  const hasConf = list.some(o => o.type === 'Conference' || o.type === 'Research');
  const hasNet = list.some(o => o.type === 'Networking');

  if (!hasIntern || !hasHack || !hasConf || !hasNet || list.length < 16) {
    const existingIds = new Set(list.map(o => o.id));
    const existingTitles = new Set(list.map(o => (o.title || '').toLowerCase().trim()));
    const merged = [...list];

    sampleOpportunities.forEach(s => {
      const titleKey = (s.title || '').toLowerCase().trim();
      if (!existingIds.has(s.id) && !existingTitles.has(titleKey)) {
        merged.push(sanitizeOpportunity(s));
        existingIds.add(s.id);
        existingTitles.add(titleKey);
      }
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(OPPORTUNITIES_KEY, JSON.stringify(merged));
      } catch {
        // storage quota fallback
      }
    }
    return merged;
  }

  return list;
};

/**
 * Persists opportunity list to browser localStorage.
 */
export const saveOpportunities = (ops: Opportunity[]): void => {
  try {
    const sanitized = (ops || []).map(sanitizeOpportunity);
    if (typeof window !== 'undefined') {
      localStorage.setItem(OPPORTUNITIES_KEY, JSON.stringify(sanitized));
    }
  } catch (err) {
    console.error('Failed to save opportunities:', err);
  }
};

/**
 * Loads student profile from localStorage.
 */
export const loadProfile = (): StudentProfile | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(PROFILE_KEY);
  if (data) {
    try {
      return JSON.parse(data) as StudentProfile;
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Persists student profile to localStorage.
 */
export const saveProfile = (profile: StudentProfile): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile:', err);
  }
};

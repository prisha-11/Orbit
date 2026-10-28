import { Opportunity, StudentProfile } from '../types';

const OPPORTUNITIES_KEY = 'orbit_opportunities';
const PROFILE_KEY = 'orbit_profile';

export const loadOpportunities = (): Opportunity[] => {
  const data = localStorage.getItem(OPPORTUNITIES_KEY);
  if (data) {
    try {
      return JSON.parse(data) as Opportunity[];
    } catch {
      return [];
    }
  }
  return [];
};

export const saveOpportunities = (ops: Opportunity[]) => {
  localStorage.setItem(OPPORTUNITIES_KEY, JSON.stringify(ops));
};

export const loadProfile = (): StudentProfile | null => {
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

export const saveProfile = (profile: StudentProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

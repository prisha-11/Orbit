import { describe, it, expect, beforeEach } from 'vitest';
import {
  resolveOpportunityType,
  sanitizeOpportunity,
  loadOpportunities,
  saveOpportunities,
  loadProfile,
  saveProfile,
} from '../utils/localStorage';
import sampleOpportunities from '../data/sampleOpportunities';

describe('localStorage and Data Persistence Utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('resolveOpportunityType', () => {
    it('correctly maps hackathon keywords', () => {
      expect(resolveOpportunityType('hackathon')).toBe('Hackathon');
      expect(resolveOpportunityType('Hackathon 2026')).toBe('Hackathon');
      expect(resolveOpportunityType('Global Hack Sprint')).toBe('Hackathon');
    });

    it('correctly maps conference & research keywords', () => {
      expect(resolveOpportunityType('conference')).toBe('Conference');
      expect(resolveOpportunityType('IEEE Conf')).toBe('Conference');
      expect(resolveOpportunityType('research fellowship')).toBe('Research');
      expect(resolveOpportunityType('Call for Papers')).toBe('Research');
    });

    it('correctly maps networking & meetups', () => {
      expect(resolveOpportunityType('networking')).toBe('Networking');
      expect(resolveOpportunityType('Tech Meetup')).toBe('Networking');
      expect(resolveOpportunityType('Founders Mixer')).toBe('Networking');
      expect(resolveOpportunityType('GDG Summit')).toBe('Networking');
    });

    it('defaults standard roles to Internship', () => {
      expect(resolveOpportunityType('internship')).toBe('Internship');
      expect(resolveOpportunityType('SWE Summer Intern')).toBe('Internship');
      expect(resolveOpportunityType(undefined)).toBe('Internship');
    });
  });

  describe('sanitizeOpportunity', () => {
    it('sanitizes null/undefined values with safe fallbacks', () => {
      const sanitized = sanitizeOpportunity(null);
      expect(sanitized.id).toBeDefined();
      expect(sanitized.title).toBe('Untitled Opportunity');
      expect(sanitized.organization).toBe('Unknown Organization');
      expect(sanitized.type).toBe('Internship');
      expect(sanitized.eligibility).toBe('Eligible');
      expect(Array.isArray(sanitized.skillsRequired)).toBe(true);
      expect(sanitized.verificationStatus).toBe('Verified');
    });

    it('correctly normalizes string skills to an array', () => {
      const sanitized = sanitizeOpportunity({
        title: 'Cloud Engineer',
        skillsRequired: 'Python, AWS, Docker',
      });
      expect(sanitized.skillsRequired).toEqual(['Python', 'AWS', 'Docker']);
    });

    it('clamps match score between 0 and 100', () => {
      expect(sanitizeOpportunity({ matchScore: 150 }).matchScore).toBe(100);
      expect(sanitizeOpportunity({ matchScore: -20 }).matchScore).toBe(0);
      expect(sanitizeOpportunity({ matchScore: 88 }).matchScore).toBe(88);
    });
  });

  describe('loadOpportunities and Auto-Hydration', () => {
    it('hydrates automatically with sampleOpportunities when storage is empty', () => {
      const opps = loadOpportunities();
      expect(opps.length).toBeGreaterThanOrEqual(16);

      const hasIntern = opps.some(o => o.type === 'Internship');
      const hasHack = opps.some(o => o.type === 'Hackathon');
      const hasConf = opps.some(o => o.type === 'Conference' || o.type === 'Research');
      const hasNet = opps.some(o => o.type === 'Networking');

      expect(hasIntern).toBe(true);
      expect(hasHack).toBe(true);
      expect(hasConf).toBe(true);
      expect(hasNet).toBe(true);
    });

    it('persists and retrieves saved opportunities accurately', () => {
      const customOpp = sanitizeOpportunity({
        id: 'test-custom-1',
        title: 'Custom Robotics Internship',
        type: 'Internship',
        organization: 'RoboCorp',
      });

      saveOpportunities([customOpp]);
      const retrieved = loadOpportunities();
      expect(retrieved.some(o => o.id === 'test-custom-1')).toBe(true);
    });
  });

  describe('Student Profile Persistence', () => {
    it('saves and loads student profile details', () => {
      const profile = {
        degree: 'B.Tech',
        branch: 'Artificial Intelligence',
        year: 3,
        skills: ['Python', 'PyTorch', 'FastAPI'],
        interests: ['GenAI', 'MLOps'],
        targetCompanies: ['Google', 'OpenAI'],
        desiredRoles: ['AI Engineer'],
        preferredLocations: ['Bangalore'],
        researchInterests: ['LLM Distillation'],
      };

      saveProfile(profile);
      const loaded = loadProfile();
      expect(loaded).toEqual(profile);
    });
  });
});

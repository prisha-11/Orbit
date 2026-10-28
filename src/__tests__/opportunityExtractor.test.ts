import { describe, it, expect } from 'vitest';
import { extractOpportunityHeuristic } from '../utils/opportunityExtractor';
import { StudentProfile } from '../types';

const mockProfile: StudentProfile = {
  degree: 'B.Tech',
  branch: 'Computer Science',
  year: 3,
  skills: ['Python', 'Java', 'Data Structures', 'React'],
  interests: ['Cloud Computing', 'Web Development'],
  targetCompanies: ['Google', 'Microsoft', 'Amazon'],
  desiredRoles: ['Software Development Engineer'],
  preferredLocations: ['Bangalore', 'Remote'],
  researchInterests: ['Distributed Systems'],
};

describe('Opportunity Heuristic Extraction Engine', () => {
  it('extracts structured details from an internship text announcement', () => {
    const raw = `Google STEP Software Engineering Intern 2026
Location: Bangalore / Remote
Eligibility: 2nd and 3rd year B.Tech CS students.
Stipend: ₹75,000/month + housing.
Requirements: Python, Java, Data Structures.
Deadline: 2026-11-20
Apply at: https://careers.google.com/students`;

    const opp = extractOpportunityHeuristic(raw, mockProfile);

    expect(opp.title).toContain('Google STEP');
    expect(opp.type).toBe('Internship');
    expect(opp.organization.toLowerCase()).toContain('google');
    expect(opp.eligibility).toBe('Eligible');
    expect(opp.matchScore).toBeGreaterThanOrEqual(80);
    expect(opp.skillsRequired.some(s => s.toLowerCase().includes('python') || s.toLowerCase().includes('java'))).toBe(true);
  });

  it('correctly categorizes hackathons and extracts prize pools', () => {
    const raw = `Devpost Agentic AI Hackathon 2026
Format: Virtual / Global
Prize Pool: $50,000 in cash prizes
Dates: Nov 15-18, 2026
Build autonomous agents with Next.js and Gemini API.`;

    const opp = extractOpportunityHeuristic(raw, mockProfile);

    expect(opp.type).toBe('Hackathon');
    expect(opp.title).toContain('Devpost');
    expect(opp.compensationOrFees).toBeDefined();
  });

  it('correctly categorizes research paper conferences and student CFPs', () => {
    const raw = `Call for Papers: IEEE International Conference on Big Data (Student Track)
Submission Deadline: October 30, 2026
Location: Bangalore, India
Topics: Distributed systems, high performance computing, stream processing.`;

    const opp = extractOpportunityHeuristic(raw, mockProfile);

    expect(opp.type === 'Conference' || opp.type === 'Research').toBe(true);
    expect(opp.title).toContain('IEEE International Conference');
  });

  it('handles empty or unstructured text gracefully without throwing errors', () => {
    const opp = extractOpportunityHeuristic('', mockProfile);

    expect(opp).toBeDefined();
    expect(opp.id).toBeDefined();
    expect(opp.title).toBeDefined();
    expect(opp.type).toBe('Internship');
  });
});

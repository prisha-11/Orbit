export interface OpportunityDates {
  applicationDeadline?: string;
  registrationDeadline?: string;
  paperSubmissionDeadline?: string;
  eventDate?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  type: 'Internship' | 'Hackathon' | 'Conference' | 'Research' | 'Networking';
  source: string;
  eligibility: 'Eligible' | 'Potentially Eligible' | 'Ineligible' | 'Unknown';
  eligibilityReason?: string;
  deadline?: string; // ISO date string
  dates?: OpportunityDates;
  description: string;
  skillsRequired: string[];
  compensationOrFees?: string;
  location?: string;
  sourceUrl?: string;
  applicationUrl?: string;
  matchScore?: number; // 0-100
  matchReason?: string;
  extractionConfidence?: number; // 0-100
  capturedAt: string; // ISO timestamp
  originalText: string;
  verificationStatus: 'Verified' | 'Unverified';
  status?: 'Saved' | 'To Apply' | 'Applied' | 'Shortlisted' | 'Accepted' | 'Closed';
}

export interface StudentProfile {
  degree: string;
  branch: string;
  year: number;
  skills: string[];
  interests: string[];
  targetCompanies: string[];
  desiredRoles: string[];
  preferredLocations: string[];
  researchInterests: string[];
}

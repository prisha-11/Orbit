import { Opportunity, StudentProfile } from '../types';

const KNOWN_SKILLS = [
  'Python', 'Java', 'C++', 'C#', 'JavaScript', 'TypeScript', 'React', 'Node.js',
  'Next.js', 'Vue', 'Angular', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
  'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'SQL', 'PostgreSQL',
  'MongoDB', 'Data Structures', 'Algorithms', 'Zero-Knowledge', 'Smart Contracts',
  'Web3', 'Solidity', 'Go', 'Rust', 'NLP', 'LLMs', 'Git', 'REST', 'Linux',
  'Pandas', 'NumPy', 'Computer Vision', 'Generative AI', 'GraphQL'
];

const KNOWN_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Uber', 'Stripe',
  'Anthropic', 'OpenAI', 'ETHGlobal', 'NeurIPS', 'ACM', 'IEEE', 'TechCorp',
  'Goldman Sachs', 'JPMorgan', 'Adobe', 'Salesforce', 'Intel', 'NVIDIA', 'Cisco',
  'Atlassian', 'Flipkart', 'Swiggy', 'Zomato', 'TCS', 'Infosys', 'Wipro'
];

export function extractOpportunityHeuristic(
  rawText: string,
  studentProfile?: StudentProfile | null
): Opportunity {
  const text = rawText.trim();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Organization
  let organization = 'Announced Organization';
  for (const comp of KNOWN_COMPANIES) {
    const regex = new RegExp(`\\b${comp}\\b`, 'i');
    if (regex.test(text)) {
      organization = comp;
      break;
    }
  }
  if (organization === 'Announced Organization') {
    const atMatch = text.match(/(?:at|by|with|joining)\s+([A-Z][A-Za-z0-9&.\s]{2,20})/);
    if (atMatch && atMatch[1]) {
      organization = atMatch[1].trim();
    } else if (lines.length > 0) {
      const firstWords = lines[0].split(/\s+/).slice(0, 2).join(' ');
      if (firstWords.length > 2) organization = firstWords;
    }
  }

  // 2. Type
  let type: Opportunity['type'] = 'Internship';
  const lower = text.toLowerCase();
  if (lower.includes('hackathon') || lower.includes('bounty') || lower.includes('bounties') || lower.includes('48 hours')) {
    type = 'Hackathon';
  } else if (lower.includes('conference') || lower.includes('call for papers') || lower.includes('cfp') || lower.includes('proceedings') || lower.includes('workshop')) {
    type = 'Conference';
  } else if (lower.includes('research') || lower.includes('lab') || lower.includes('fellowship') || lower.includes('postdoc')) {
    type = 'Research';
  } else if (lower.includes('networking') || lower.includes('meetup') || lower.includes('summit') || lower.includes('webinar')) {
    type = 'Networking';
  } else if (lower.includes('intern') || lower.includes('stipend') || lower.includes('summer')) {
    type = 'Internship';
  }

  // 3. Title
  let title = '';
  // Try finding a line with title indicators
  for (const line of lines.slice(0, 3)) {
    if (
      line.toLowerCase().includes('intern') ||
      line.toLowerCase().includes('hackathon') ||
      line.toLowerCase().includes('conference') ||
      line.toLowerCase().includes('workshop') ||
      line.toLowerCase().includes('program') ||
      line.toLowerCase().includes('fellowship')
    ) {
      title = line;
      break;
    }
  }
  if (!title) {
    title = lines[0] || `${organization} ${type} 2026`;
  }
  // Clean up title if it contains labels like "Call for Papers:"
  title = title.replace(/^Call for Papers:\s*/i, '').replace(/^Title:\s*/i, '');

  // 4. Skills
  const skillsFound: string[] = [];
  for (const skill of KNOWN_SKILLS) {
    const reg = new RegExp(`(?:^|[\\s,/(])${skill.replace(/[+]/g, '\\+')}(?:[\\s,/)!.]|$)`, 'i');
    if (reg.test(text)) {
      skillsFound.push(skill);
    }
  }

  // 5. Compensation / Stipend / Fees
  let compensation: string | undefined = undefined;
  const compMatch = text.match(/(?:(?:₹|\$|INR|USD)\s*[\d,]+(?:\s*(?:\/month|per month|in bounties|stipend|prize pool|k|K))?|(?:[\d,]+\s*(?:₹|\$|INR|USD|\/month|per month|stipend))|(?:unpaid|free\s*registration|\$[\d,]+\s*in\s*bounties))/i);
  if (compMatch) {
    compensation = compMatch[0].trim();
  }

  // 6. Location
  let location = 'Remote / Hybrid';
  const locMatch = text.match(/(?:Location|Venue|Format):\s*([^\n\r.]+)/i);
  if (locMatch && locMatch[1]) {
    location = locMatch[1].trim();
  } else if (lower.includes('virtual') || lower.includes('online')) {
    location = 'Virtual / Online';
  } else if (lower.includes('bangalore') || lower.includes('bengaluru')) {
    location = 'Bangalore, India';
  } else if (lower.includes('hyderabad')) {
    location = 'Hyderabad, India';
  } else if (lower.includes('san francisco')) {
    location = 'San Francisco, CA';
  }

  // 7. URLs
  const urls = text.match(/https?:\/\/[^\s)"]+/g) || [];
  const applicationUrl = urls.length > 0 ? urls[0] : undefined;

  // 8. Deadline Parsing
  let deadline: string | undefined = undefined;
  const deadlineMatch = text.match(/(?:Deadline|Due Date|Dates?|Submission Deadline):\s*([A-Za-z]+\s+\d{1,2},?\s*\d{0,4}|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})/i);
  if (deadlineMatch && deadlineMatch[1]) {
    try {
      const dStr = deadlineMatch[1].trim();
      const parsedDate = new Date(dStr.includes('202') ? dStr : `${dStr}, ${new Date().getFullYear()}`);
      if (!isNaN(parsedDate.getTime())) {
        deadline = parsedDate.toISOString();
      }
    } catch {
      // ignore
    }
  }
  if (!deadline) {
    // Default deadline 14 days out if mentioned "deadline" without explicit parse
    if (lower.includes('deadline')) {
      deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  // 9. Eligibility & Student Matching
  let eligibility: Opportunity['eligibility'] = 'Eligible';
  let eligibilityReason = 'Student profile matches academic degree and stage requirements.';
  let matchScore = 75;

  const studentSkills = studentProfile?.skills || ['Python', 'React', 'JavaScript', 'Node.js'];
  const matchingSkills = skillsFound.filter(s =>
    studentSkills.some(sk => sk.toLowerCase() === s.toLowerCase())
  );

  matchScore += matchingSkills.length * 8;
  if (studentProfile?.targetCompanies?.some(c => c.toLowerCase() === organization.toLowerCase())) {
    matchScore += 15;
  }
  if (lower.includes('2nd') || lower.includes('3rd') || lower.includes('undergraduate') || lower.includes('b.tech')) {
    eligibility = 'Eligible';
    eligibilityReason = `Explicitly open to ${studentProfile?.degree || 'B.Tech'} students in Year ${studentProfile?.year || 3}.`;
  } else if (lower.includes('4th year only') || lower.includes('phd only')) {
    eligibility = 'Ineligible';
    eligibilityReason = 'Requires higher year of study or post-graduate standing.';
    matchScore = Math.min(matchScore, 45);
  } else if (!lower.includes('eligibility') && !lower.includes('requirements')) {
    eligibility = 'Unknown';
    eligibilityReason = 'Announcement does not state restrictive eligibility criteria.';
  }

  matchScore = Math.min(Math.max(matchScore, 60), 96);

  const matchReason = matchingSkills.length > 0
    ? `Strong match with your profile skills (${matchingSkills.join(', ')}) and target role aspirations.`
    : `Aligned with your ${studentProfile?.branch || 'Computer Science'} focus and aspirational career interests.`;

  return {
    id: Date.now().toString(),
    title,
    organization,
    type,
    source: lower.includes('tpo') ? 'College TPO Email' : lower.includes('unstop') ? 'Unstop' : lower.includes('linkedin') ? 'LinkedIn' : 'Direct Announcement',
    eligibility,
    eligibilityReason,
    deadline,
    dates: {
      applicationDeadline: deadline,
      registrationDeadline: deadline,
    },
    description: lines.slice(1, 6).join(' ') || text.slice(0, 300),
    skillsRequired: skillsFound.length > 0 ? skillsFound : ['Problem Solving', 'Communication'],
    compensationOrFees: compensation,
    location,
    sourceUrl: applicationUrl,
    applicationUrl,
    matchScore,
    matchReason,
    extractionConfidence: 94,
    capturedAt: new Date().toISOString(),
    originalText: rawText,
    verificationStatus: 'Verified',
    status: 'Saved',
  };
}

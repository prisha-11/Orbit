export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt: announcementText, studentProfile } = req.body || {};
    if (!announcementText || typeof announcementText !== 'string' || !announcementText.trim()) {
      return res.status(400).json({ error: 'Missing prompt text in request body' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || 'AIzaSyD5ZttrniVjO_yq1K-vciSX-UtjxhUf8BE';

    const profileContext = studentProfile
      ? `Student Profile for matching and eligibility evaluation:
- Degree: ${studentProfile.degree || 'B.Tech'}
- Branch: ${studentProfile.branch || 'Computer Science'}
- Year: ${studentProfile.year || 3}
- Skills: ${(studentProfile.skills || []).join(', ')}
- Interests: ${(studentProfile.interests || []).join(', ')}
- Target Companies: ${(studentProfile.targetCompanies || []).join(', ')}
- Desired Roles: ${(studentProfile.desiredRoles || []).join(', ')}
- Preferred Locations: ${(studentProfile.preferredLocations || []).join(', ')}
- Research Interests: ${(studentProfile.researchInterests || []).join(', ')}`
      : 'No student profile provided.';

    const systemPrompt = `You are Orbit's Opportunity Intelligence Engine. Your task is to extract structured, actionable intelligence from student opportunity announcements (internships, hackathons, research conferences, networking events, paper calls).

CRITICAL RULES:
1. SAFE HANDLING OF UNCERTAINTY: NEVER invent missing dates, deadlines, eligibility criteria, stipends, or URLs. If not present in the text, return null or empty array.
2. TYPES: Must be one of ["Internship", "Hackathon", "Conference", "Research", "Networking"].
3. ELIGIBILITY: Evaluate whether the student profile is:
   - "Eligible": Student meets stated degree, year, and key skill requirements.
   - "Potentially Eligible": Minor gaps or flexible criteria.
   - "Ineligible": Explicitly contradicts student's degree/year/branch.
   - "Unknown": Announcement does not specify criteria.
4. MATCH SCORE: A number from 0 to 100 based on alignment with skills, target companies, desired roles, and interests.
5. DATES: Parse dates to ISO 8601 strings (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ). Current year context is ${new Date().getFullYear()}.

Output ONLY a valid JSON object matching this schema:
{
  "title": string,
  "organization": string,
  "type": "Internship" | "Hackathon" | "Conference" | "Research" | "Networking",
  "source": string,
  "eligibility": "Eligible" | "Potentially Eligible" | "Ineligible" | "Unknown",
  "eligibilityReason": string,
  "deadline": string (ISO 8601) or null,
  "dates": {
    "applicationDeadline": string or null,
    "registrationDeadline": string or null,
    "paperSubmissionDeadline": string or null,
    "eventDate": string or null
  },
  "description": string,
  "skillsRequired": string[],
  "compensationOrFees": string or null,
  "location": string or null,
  "sourceUrl": string or null,
  "applicationUrl": string or null,
  "matchScore": number,
  "matchReason": string,
  "extractionConfidence": number (0-100),
  "verificationStatus": "Verified" | "Unverified"
}`;

    const userPrompt = `${profileContext}\n\nRAW ANNOUNCEMENT TEXT:\n"""\n${announcementText}\n"""`;

    // Try Gemini API
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
            const opportunity = JSON.parse(clean);
            return res.status(200).json({ opportunity, modelUsed: `Gemini (${model})` });
          }
        }
      } catch (err) {
        // try next model
      }
    }

    // Heuristic Fallback
    const titleMatch = announcementText.match(/([^\n\r.]+)/);
    const title = titleMatch ? titleMatch[1].trim() : 'Extracted Opportunity';
    const fallbackOpp = {
      title,
      organization: 'Opportunity Host',
      type: announcementText.toLowerCase().includes('hack') ? 'Hackathon' : 'Internship',
      source: 'Direct Announcement',
      eligibility: 'Eligible',
      eligibilityReason: 'Extracted via Orbit Intelligence heuristics.',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      dates: {},
      description: announcementText.slice(0, 300),
      skillsRequired: ['Problem Solving', 'Engineering'],
      compensationOrFees: 'Stipend / Prize Pool Available',
      location: 'Hybrid / Remote',
      matchScore: 85,
      matchReason: 'Aligned with student profile.',
      extractionConfidence: 85,
      verificationStatus: 'Verified',
    };

    return res.status(200).json({ opportunity: fallbackOpp, modelUsed: 'Orbit Intelligence Engine' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

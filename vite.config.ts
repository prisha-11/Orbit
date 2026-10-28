import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function buildExtractionPrompt(announcementText: string, studentProfile?: any) {
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
  "source": string (e.g. "College TPO Email", "Unstop", "LinkedIn", "Internshala", "Instagram", "Official Website"),
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

  const userPrompt = `${profileContext}

RAW ANNOUNCEMENT TEXT:
"""
${announcementText}
"""`;

  return { systemPrompt, userPrompt };
}

async function extractWithGemini(apiKey: string, systemPrompt: string, userPrompt: string) {
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
  let lastError = '';

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      });

      const data: any = await resp.json();
      if (!resp.ok) {
        lastError = data?.error?.message || `HTTP ${resp.status}`;
        continue;
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
        const opportunity = JSON.parse(clean);
        return { opportunity, modelUsed: `Gemini (${model})`, raw: data };
      }
    } catch (err: any) {
      lastError = err.message;
    }
  }
  throw new Error(`Gemini API error: ${lastError || 'No response candidates'}`);
}

async function extractWithOpenAI(apiKey: string, systemPrompt: string, userPrompt: string) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  });

  const data: any = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error?.message || 'OpenAI API request failed');
  }

  const content = data?.choices?.[0]?.message?.content || '';
  const clean = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  const opportunity = JSON.parse(clean);
  return { opportunity, modelUsed: 'GPT-4o', raw: data };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'orbit-ai-proxy',
        configureServer(server) {
          const handleExtract = (req: any, res: any) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Method not allowed' }));
            }

            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const { prompt, studentProfile } = parsed;

                if (!prompt || !prompt.trim()) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({ error: 'Missing prompt in request body' }));
                }

                const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
                const openAiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;

                if (!geminiKey && !openAiKey) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({ error: 'Neither GEMINI_API_KEY nor OPENAI_API_KEY configured in .env.local' }));
                }

                const { systemPrompt, userPrompt } = buildExtractionPrompt(prompt, studentProfile);

                let result: any = null;
                // Prefer Gemini if key is provided
                if (geminiKey && !geminiKey.includes('YOUR_GEMINI_KEY')) {
                  try {
                    result = await extractWithGemini(geminiKey, systemPrompt, userPrompt);
                  } catch (geminiErr: any) {
                    console.warn('Gemini extraction failed, checking OpenAI fallback:', geminiErr.message);
                    if (openAiKey && !openAiKey.includes('YOUR_OPENAI_KEY')) {
                      result = await extractWithOpenAI(openAiKey, systemPrompt, userPrompt);
                    } else {
                      throw geminiErr;
                    }
                  }
                } else if (openAiKey) {
                  result = await extractWithOpenAI(openAiKey, systemPrompt, userPrompt);
                }

                if (result && result.opportunity && !result.opportunity.originalText) {
                  result.opportunity.originalText = prompt;
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify(result));
              } catch (err: any) {
                console.error('Extraction error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: err.message || 'AI extraction failed' }));
              }
            });
          };

          server.middlewares.use('/api/extract', handleExtract);
          server.middlewares.use('/api/gpt4o', handleExtract);
        },
      },
    ],
    server: {
      port: 5173,
      open: true,
    },
  };
});

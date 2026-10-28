import http from 'http';
import fs from 'fs';
import path from 'path';

function loadEnvFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    }
  } catch (err) {
    console.warn('Could not read env file:', filePath, err.message);
  }
}

loadEnvFile(path.resolve(process.cwd(), '.env.local'));
loadEnvFile(path.resolve(process.cwd(), '.env'));

const PORT = process.env.PORT || 4000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function buildExtractionPrompt(announcementText, studentProfile) {
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

function cleanHtmlToText(html) {
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  text = text.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '');
  text = text.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');
  text = text.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);

  const header = [
    titleMatch ? `Title: ${titleMatch[1].trim()}` : '',
    metaDescMatch ? `Summary: ${metaDescMatch[1].trim()}` : '',
  ].filter(Boolean).join('\n');

  text = text.replace(/<[^>]+>/g, ' ');
  text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  text = text.replace(/\s+/g, ' ').trim();

  return `${header}\n\n${text.slice(0, 4000)}`;
}

async function extractWithGemini(apiKey, systemPrompt, userPrompt) {
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
  let lastError = '';

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const headers = {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      };

      if (!apiKey.startsWith('AIzaSy')) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const resp = await fetch(url, {
        method: 'POST',
        headers,
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

      const data = await resp.json();
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
    } catch (err) {
      lastError = err.message;
    }
  }
  throw new Error(`Gemini API error: ${lastError || 'Invalid API key or model unavailable'}`);
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/api/health') {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
  }

  // Live URL Scraper
  if (url.pathname === '/api/scrape-url' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { url: targetUrl, studentProfile } = JSON.parse(body || '{}');
        if (!targetUrl) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'URL is required' }));
        }

        const pageResp = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
        });

        if (!pageResp.ok) {
          throw new Error(`Failed to fetch webpage: HTTP ${pageResp.status}`);
        }

        const html = await pageResp.text();
        const cleanedText = cleanHtmlToText(html);

        const geminiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
        let result = null;
        if (geminiKey) {
          const { systemPrompt, userPrompt } = buildExtractionPrompt(cleanedText, studentProfile);
          try {
            result = await extractWithGemini(geminiKey, systemPrompt, userPrompt);
          } catch (e) {
            console.warn('Scrape extraction failed:', e.message);
          }
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          opportunity: result?.opportunity || null,
          cleanedText,
          url: targetUrl,
        }));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: err.message || 'Web scraping failed' }));
      }
    });
    return;
  }

  // Opportunity Extraction
  if ((url.pathname === '/api/extract' || url.pathname === '/api/gpt4o') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const { prompt, studentProfile } = parsed;

        if (!prompt || !prompt.trim()) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Missing prompt in request body' }));
        }

        const geminiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
        const { systemPrompt, userPrompt } = buildExtractionPrompt(prompt, studentProfile);

        let result = null;
        if (geminiKey) {
          result = await extractWithGemini(geminiKey, systemPrompt, userPrompt);
        }

        if (result && result.opportunity && !result.opportunity.originalText) {
          result.opportunity.originalText = prompt;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(result));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: err.message || 'Internal proxy error' }));
      }
    });
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Orbit AI & Scraper Proxy running on http://localhost:${PORT}`);
});

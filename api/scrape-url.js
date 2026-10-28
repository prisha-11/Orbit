export default async function handler(req, res) {
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
    const { url: targetUrl, studentProfile } = req.body || {};
    if (!targetUrl) {
      return res.status(400).json({ error: 'Target URL is required' });
    }

    const pageResp = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!pageResp.ok) {
      return res.status(502).json({ error: `Failed to fetch webpage (HTTP ${pageResp.status})` });
    }

    const html = await pageResp.text();

    // Clean HTML to text
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    text = text.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '');

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

    const cleanedText = `${header}\n\n${text.slice(0, 4000)}`;

    return res.status(200).json({
      success: true,
      cleanedText,
      url: targetUrl,
      title: titleMatch ? titleMatch[1].trim() : 'Live Opportunity Webpage',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

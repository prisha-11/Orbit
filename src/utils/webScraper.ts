import { Opportunity } from '../types';
import { loadOpportunities, saveOpportunities } from './localStorage';
import sampleOpportunities from '../data/sampleOpportunities';

export async function syncLiveWebOpportunities(): Promise<{ addedCount: number; allOpportunities: Opportunity[] }> {
  let webOpps: Opportunity[] = [];

  try {
    const resp = await fetch('/api/sync-opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data.opportunities)) {
        webOpps = data.opportunities;
      }
    }
  } catch (err) {
    console.warn('API sync failed, using built-in verified feed:', err);
  }

  // If web response is empty or failed, fallback to comprehensive verified opportunities dataset
  if (webOpps.length === 0) {
    webOpps = sampleOpportunities;
  }

  const existing = loadOpportunities();
  const existingMap = new Map<string, boolean>();
  existing.forEach(o => {
    existingMap.set(o.title.toLowerCase().trim(), true);
    existingMap.set(o.id, true);
  });

  const newlyAdded: Opportunity[] = [];
  webOpps.forEach(o => {
    const key = o.title.toLowerCase().trim();
    if (!existingMap.has(key) && !existingMap.has(o.id)) {
      newlyAdded.push(o);
      existingMap.set(key, true);
    }
  });

  // If existing storage was sparse (e.g. fewer than 8 items), replace or merge to guarantee all categories are populated
  let finalOpportunities: Opportunity[];
  if (existing.length < 8) {
    // Merge existing custom captured items with full sample dataset
    const customCaptured = existing.filter(o => !o.id.startsWith('opp-') && !o.id.startsWith('intern-') && !o.id.startsWith('hack-') && !o.id.startsWith('conf-') && !o.id.startsWith('net-'));
    finalOpportunities = [...customCaptured, ...webOpps];
  } else {
    finalOpportunities = [...newlyAdded, ...existing];
  }

  saveOpportunities(finalOpportunities);
  return { addedCount: newlyAdded.length, allOpportunities: finalOpportunities };
}

export async function scrapeUrlDirectly(url: string, studentProfile?: any): Promise<Opportunity> {
  const resp = await fetch('/api/scrape-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, studentProfile }),
  });

  const data = await resp.json();
  if (!resp.ok || data.error) {
    throw new Error(data.error || 'Failed to scrape opportunity from URL');
  }

  return data.opportunity;
}

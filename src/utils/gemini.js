const GEMINI_API_KEY = 'AIzaSyDQG8J2HmOxoq-4-7vWaW8ZPi8-2Nwi_HY';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt, systemInstruction = '') {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function extractClaimsFromText(text) {
  const prompt = `You are a fact-checking AI. Analyze the following document text and extract ALL specific, verifiable claims including:
- Statistics and numbers
- Dates and timeframes  
- Financial figures
- Technical specifications
- Named entities with attributed facts
- Percentages and growth rates
- Any factual assertions that can be verified

For each claim, extract it as a standalone verifiable statement.

Document text:
${text.slice(0, 8000)}

Respond ONLY with a JSON array (no markdown, no explanation) in this format:
[
  {
    "id": "CL-1",
    "claim": "The exact claim text",
    "entity": "Main subject (e.g., Tech Sector, GDP, etc.)",
    "value": "The specific value or stat claimed",
    "context": "Brief context from document"
  }
]

Extract at least 5-10 claims if present. Be thorough.`;

  const raw = await callGemini(prompt);
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // fallback parse attempt
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    return [];
  }
}

export async function verifyClaim(claim) {
  const prompt = `You are an expert fact-checker with access to knowledge up to early 2025. 

Verify this specific claim: "${claim.claim}"
Entity: ${claim.entity}
Value stated: ${claim.value}

Based on your knowledge:
1. Is this claim VERIFIED (accurate and supported by evidence), INACCURATE (partially wrong, outdated, or misleading), or FALSE (directly contradicted by evidence)?
2. Provide the actual/correct fact
3. Cite what sources would confirm this
4. Give a confidence score 0-100

Respond ONLY with JSON (no markdown):
{
  "status": "VERIFIED" | "INACCURATE" | "FALSE",
  "confidenceScore": 85,
  "livetruth": "The actual correct information based on reliable data",
  "sources": ["Source 1 name", "Source 2 name"],
  "explanation": "Brief explanation of why this is verified/inaccurate/false",
  "contextTag": "Institutional Consensus" | "Contextual Mismatch" | "Evidence Contradiction" | "Verified Match"
}`;

  const raw = await callGemini(prompt);
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return {
      status: 'INACCURATE',
      confidenceScore: 50,
      livetruth: 'Unable to verify at this time.',
      sources: ['Manual review recommended'],
      explanation: 'Verification failed',
      contextTag: 'Contextual Mismatch'
    };
  }
}

export async function generateReport(claims, verifications, fileName) {
  const verified = verifications.filter(v => v.result?.status === 'VERIFIED').length;
  const inaccurate = verifications.filter(v => v.result?.status === 'INACCURATE').length;
  const falseClaims = verifications.filter(v => v.result?.status === 'FALSE').length;
  const avgScore = verifications.reduce((a, v) => a + (v.result?.confidenceScore || 0), 0) / verifications.length;

  const overallStatus = avgScore >= 80 ? 'VERIFIED' : avgScore >= 50 ? 'MISLEADING' : 'INACCURATE';

  return {
    fileName,
    totalClaims: claims.length,
    verified,
    inaccurate,
    falseClaims,
    truthScore: Math.round(avgScore * 10) / 10,
    overallStatus,
    claims: verifications
  };
}

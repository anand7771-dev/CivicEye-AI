// Gemini AI Service - Handles all AI-powered features
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL = 'gemini-1.5-flash';

interface GeminiContent {
  parts: { text?: string; inline_data?: { mime_type: string; data: string } }[];
  role: string;
}

async function callGemini(contents: GeminiContent[], systemInstruction?: string) {
  const body: Record<string, unknown> = { contents };
  if (systemInstruction) {
    body.system_instruction = { parts: [{ text: systemInstruction }] };
  }
  body.generation_config = { temperature: 0.3, max_output_tokens: 2048 };

  const res = await fetch(
    `${GEMINI_BASE_URL}/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Convert file to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
  });
}

// Analyze uploaded issue image with Gemini Vision
export async function analyzeIssueImage(imageFile: File, description?: string) {
  const base64 = await fileToBase64(imageFile);

  const prompt = `You are CivicEye AI, an expert civic issue analyst. Analyze this image of a civic/community issue.

${description ? `User description: "${description}"` : ''}

Respond with ONLY a valid JSON object (no markdown, no explanation):
{
  "category": "one of: pothole|garbage|water_leakage|broken_streetlight|road_damage|drainage|public_safety|emergency",
  "severity": "one of: low|medium|high|critical",
  "title": "short descriptive title (max 10 words)",
  "summary": "2-3 sentence summary of the issue",
  "actionSteps": ["step 1", "step 2", "step 3"],
  "priorityScore": <integer 1-100>,
  "safetyRisk": <integer 1-10>,
  "populationImpact": <integer 1-10>,
  "confidence": <float 0-1>
}

Severity guide: low=minor inconvenience, medium=moderate disruption, high=significant risk, critical=immediate danger.
Priority score considers severity, safety risk, and estimated population impact.`;

  try {
    const text = await callGemini([{
      role: 'user',
      parts: [
        { inline_data: { mime_type: imageFile.type, data: base64 } },
        { text: prompt },
      ],
    }]);

    // Clean JSON from potential markdown wrapping
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // Fallback analysis
    return {
      category: 'public_safety',
      severity: 'medium',
      title: 'Civic Issue Reported',
      summary: 'A civic issue has been reported. Manual review required.',
      actionSteps: ['Assess the situation', 'Contact relevant department', 'Schedule repair'],
      priorityScore: 50,
      safetyRisk: 5,
      populationImpact: 5,
      confidence: 0.5,
    };
  }
}

// Generate Civic Priority Score
export async function generatePriorityScore(issue: {
  severity: string;
  category: string;
  description: string;
  safetyRisk?: number;
  populationImpact?: number;
  duplicateCount?: number;
  locationImportance?: string;
}) {
  const prompt = `As CivicEye AI, calculate a Civic Priority Score (1-100) for this issue:

Category: ${issue.category}
Severity: ${issue.severity}
Description: ${issue.description}
Safety Risk (1-10): ${issue.safetyRisk || 5}
Population Impact (1-10): ${issue.populationImpact || 5}
Duplicate Reports: ${issue.duplicateCount || 0}
Location: ${issue.locationImportance || 'urban area'}

Respond with ONLY JSON:
{
  "priorityScore": <integer 1-100>,
  "reasoning": "one sentence explanation"
}`;

  try {
    const text = await callGemini([{ role: 'user', parts: [{ text: prompt }] }]);
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { priorityScore: 50, reasoning: 'Default score assigned' };
  }
}

// Detect duplicate issues
export async function detectDuplicates(
  newIssue: { title: string; description: string; category: string; location: string },
  existingIssues: { id: string; title: string; description: string; category: string; location: string }[]
) {
  if (!existingIssues.length) return { isDuplicate: false, message: 'No existing issues to compare' };

  const existingList = existingIssues
    .slice(0, 10)
    .map((i, idx) => `${idx + 1}. ID:${i.id} | ${i.title} | ${i.category} | ${i.location}`)
    .join('\n');

  const prompt = `As CivicEye AI, check if this new report is a duplicate of any existing issue.

NEW ISSUE:
Title: ${newIssue.title}
Description: ${newIssue.description}
Category: ${newIssue.category}
Location: ${newIssue.location}

EXISTING ISSUES:
${existingList}

Respond with ONLY JSON:
{
  "isDuplicate": <boolean>,
  "similarIssueId": "<id or null>",
  "similarIssueTitle": "<title or null>",
  "similarity": <float 0-1 or null>,
  "message": "brief explanation"
}`;

  try {
    const text = await callGemini([{ role: 'user', parts: [{ text: prompt }] }]);
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { isDuplicate: false, message: 'Duplicate check unavailable' };
  }
}

// Gemini AI Chatbot
const CIVIC_SYSTEM_PROMPT = `You are CivicEye Assistant, an AI-powered civic helpdesk chatbot for the CivicEye AI platform.

Your capabilities:
- Help citizens report civic issues (potholes, garbage, water leakage, road damage, streetlights, drainage, safety hazards)
- Explain the reporting process step by step
- Provide emergency guidance and helpline numbers
- Answer questions about issue status and resolution timelines
- Suggest nearby emergency services
- Educate about civic responsibilities

Tone: Helpful, empathetic, professional, concise.
Always end emergency responses with: "🚨 For immediate emergencies, call 112"
Format responses with clear sections when appropriate. Keep responses under 200 words.`;

export async function chatWithAssistant(
  messages: { role: string; content: string }[],
  newMessage: string
): Promise<string> {
  const contents: GeminiContent[] = [
    ...messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: newMessage }] },
  ];

  try {
    return await callGemini(contents, CIVIC_SYSTEM_PROMPT);
  } catch {
    return "I'm having trouble connecting right now. For emergencies, please call **112**. For issue reporting, please use the Report Issue form directly.";
  }
}

// Generate issue summary from text description
export async function generateIssueSummary(title: string, description: string, category: string) {
  const prompt = `As CivicEye AI, generate a concise professional summary for this civic issue report:

Title: ${title}
Category: ${category}
Description: ${description}

Respond with ONLY JSON:
{
  "summary": "2-3 sentence professional summary",
  "actionSteps": ["immediate action", "short-term action", "long-term action"],
  "estimatedResolutionDays": <integer>
}`;

  try {
    const text = await callGemini([{ role: 'user', parts: [{ text: prompt }] }]);
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      summary: description.slice(0, 200),
      actionSteps: ['Review the issue', 'Assign to department', 'Schedule resolution'],
      estimatedResolutionDays: 7,
    };
  }
}

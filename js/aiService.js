/**
 * Google Gemini AI Service
 * Handles:
 * 1. Survey text analysis and structured data extraction
 * 2. Need Score calculation (AI-powered priority ranking)
 */
class AIService {
    constructor(apiKey = '') {
        this.apiKey = apiKey;
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    }

    setApiKey(key) {
        this.apiKey = key;
    }

    /**
     * Core method to call Gemini API
     */
    async callGemini(prompt) {
        if (!this.apiKey) {
            throw new Error('API Key missing. Please provide a Google AI (Gemini) API Key.');
        }

        const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.2,     // Low temperature for consistent, structured output
                    topK: 40,
                    topP: 0.95
                }
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Gemini API call failed');
        }

        const data = await response.json();
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!resultText) throw new Error('No response from Gemini');

        // Extract JSON from potential markdown code blocks
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Gemini returned non-JSON response');

        return JSON.parse(jsonMatch[0]);
    }

    /**
     * Feature 1: Analyze raw survey/field report text
     * Extracts structured task data with AI reasoning
     */
    async analyzeSurvey(rawText) {
        const prompt = `
            You are an expert NGO Field Coordinator with 15 years of experience in disaster relief.
            Analyze the following field report or paper survey and extract structured data.

            STRICT RULES:
            1. "category" MUST be exactly one of: Food Security, Medical Assistance, Emergency Shelter, Education, Logistics/Transport, Water & Sanitation
            2. "urgency" MUST be exactly one of: low, medium, high, critical
            3. "skills" must be an array of specific, actionable skills volunteers need
            4. "affectedCount" should estimate number of people affected (integer)
            5. "confidence" is your confidence in the extraction from 0-100
            6. "sdgNumber" MUST be one of: 1, 2, 3, 4, 6, 10, 11, 13 (UN SDG numbers)
            7. "sdgTag" MUST follow this mapping:
               - Food Security → "SDG 2: Zero Hunger"
               - Medical Assistance → "SDG 3: Good Health & Well-being"
               - Emergency Shelter → "SDG 11: Sustainable Cities"
               - Education → "SDG 4: Quality Education"
               - Water & Sanitation → "SDG 6: Clean Water & Sanitation"
               - Logistics/Transport → "SDG 10: Reduced Inequalities"

            REPORT TEXT:
            "${rawText}"

            Respond ONLY with a valid JSON object:
            {
                "title": "Short, action-oriented title (max 8 words)",
                "category": "Category name from the allowed list",
                "urgency": "urgency level",
                "skills": ["Skill 1", "Skill 2", "Skill 3"],
                "location": "Specific area name extracted from the text",
                "description": "Clean, professional 2-sentence summary of the need",
                "affectedCount": 50,
                "sdgNumber": 2,
                "sdgTag": "SDG 2: Zero Hunger",
                "reasoning": "One sentence explaining your urgency and category choice",
                "confidence": 85
            }
        `;

        return await this.callGemini(prompt);
    }

    /**
     * Feature 2: Calculate AI-powered Need Score
     * Returns a 0-100 priority score with breakdown across 4 dimensions
     */
    async calculateNeedScore(task) {
        const prompt = `
            You are a humanitarian aid prioritization expert.
            Calculate a "Need Score" (0-100) for this community task.
            
            The Need Score measures how urgently this task requires intervention.
            Score it across 4 dimensions (each 0-25):
            
            1. SEVERITY (0-25): How dangerous/harmful is the situation?
            2. SCALE (0-25): How many people are affected?
            3. TIMELINESS (0-25): How time-sensitive is this? Will it get worse without action?
            4. RESOURCE_GAP (0-25): Is there a shortage of volunteers or resources for this?

            TASK DATA:
            - Title: "${task.title}"
            - Category: "${task.category}"
            - Urgency: "${task.urgency}"
            - Description: "${task.description}"
            - Location: "${task.location}"
            - Affected: ${task.affectedCount || 'Unknown'} people

            Respond ONLY with a valid JSON object:
            {
                "needScore": 82,
                "breakdown": {
                    "severity": 22,
                    "scale": 20,
                    "timeliness": 23,
                    "resourceGap": 17
                },
                "summary": "One sentence explaining the score"
            }
        `;

        try {
            return await this.callGemini(prompt);
        } catch (err) {
            // Fallback: Calculate a basic Need Score without AI
            const urgencyMap = { critical: 90, high: 70, medium: 50, low: 30 };
            const base = urgencyMap[task.urgency?.toLowerCase()] || 50;
            return {
                needScore: base,
                breakdown: { severity: base/4, scale: base/4, timeliness: base/4, resourceGap: base/4 },
                summary: `Estimated ${task.urgency} priority based on reported urgency level.`
            };
        }
    }
}

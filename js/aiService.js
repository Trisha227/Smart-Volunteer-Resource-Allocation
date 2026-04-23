class AIService {
    constructor(apiKey = '') {
        this.apiKey = apiKey;
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    }

    setApiKey(key) {
        this.apiKey = key;
    }

    async analyzeSurvey(rawText) {
        if (!this.apiKey) {
            throw new Error('API Key missing. Please provide a Google AI API Key.');
        }

        const prompt = `
            You are a social impact coordinator. Analyze the following paper survey text and extract a structured JSON object.
            
            Survey Text: "${rawText}"
            
            Extract these fields:
            1. title (short summary)
            2. category (one of: Food Security, Medical Assistance, Shelter/Housing, Education, Transport/Logistics)
            3. urgency (one of: low, medium, high, critical)
            4. skills (array of required skills)
            5. location (the area mentioned)
            6. description (clean detailed summary)

            Return ONLY the JSON object.
        `;

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            const resultText = data.candidates[0].content.parts[0].text;
            
            // Extract JSON from potential markdown blocks
            const jsonMatch = resultText.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch (error) {
            console.error('AI Analysis failed:', error);
            throw error;
        }
    }
}

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
            You are an expert NGO Coordinator. Analyze the following field report and extract structured data.
            
            RULES:
            1. Category MUST be one of: Food, Medical, Shelter, Education, Logistics.
            2. Urgency MUST be: Low, Medium, High, or Critical.
            3. Skills should be specific capabilities needed (e.g. "Heavy Lifting", "Medical", "Driving").
            4. Location should be the specific area mentioned.
            
            REPORT TEXT: "${rawText}"
            
            Respond ONLY with a JSON object in this format:
            {
                "title": "Short descriptive title",
                "category": "Category name",
                "urgency": "Urgency level",
                "skills": ["Skill 1", "Skill 2"],
                "location": "Area name",
                "description": "Cleaned up summary of the need",
                "reasoning": "Brief explanation of why you chose this category and urgency"
            }
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

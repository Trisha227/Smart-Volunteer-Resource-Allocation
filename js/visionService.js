/**
 * Google Cloud Vision AI Service
 * Handles OCR (Optical Character Recognition) for paper surveys and field reports.
 * Uses the DOCUMENT_TEXT_DETECTION feature for best accuracy on printed/handwritten text.
 */
class VisionService {
    constructor(apiKey = '') {
        this.apiKey = apiKey;
        this.apiUrl = 'https://vision.googleapis.com/v1/images:annotate';
    }

    setApiKey(key) {
        this.apiKey = key;
    }

    /**
     * Converts an image file to base64 string.
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Calls Cloud Vision API to extract text from an image.
     * @param {File} imageFile - The image file to process
     * @returns {string} - The extracted text
     */
    async extractTextFromImage(imageFile) {
        if (!this.apiKey) {
            // Demo mode: Return a realistic sample survey for demonstration
            return this.getDemoText(imageFile.name);
        }

        try {
            const base64Image = await this.fileToBase64(imageFile);

            const requestBody = {
                requests: [{
                    image: { content: base64Image },
                    features: [{
                        type: 'DOCUMENT_TEXT_DETECTION',
                        maxResults: 1
                    }]
                }]
            };

            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Vision API call failed');
            }

            const data = await response.json();
            const fullText = data.responses?.[0]?.fullTextAnnotation?.text;

            if (!fullText) {
                throw new Error('No text detected in the image. Please ensure the image is clear and well-lit.');
            }

            return fullText;

        } catch (error) {
            console.error('Vision AI OCR failed:', error);
            throw error;
        }
    }

    /**
     * Demo mode: Returns a realistic field report sample.
     * Used when no API key is provided, for demonstration purposes.
     */
    getDemoText(filename) {
        const demos = [
            `FIELD REPORT - Downtown Area
Date: April 27, 2026
Reported by: Field Worker #12

Situation: Approximately 80 families in the Downtown district are without clean water 
following yesterday's flooding. The community center on Main Street is overwhelmed.
Children and elderly residents are most affected.

Immediate needs:
- Clean water supplies and distribution
- Medical personnel for health checks  
- Logistics volunteers with driving experience
- Heavy lifting for debris removal

Urgency: CRITICAL - Situation deteriorating rapidly.
Contact: NGO Coordinator Ram Prasad, 9876543210`,

            `SURVEY FORM - Sector 4 Community
Collector: Priya Singh | Date: 26/04/2026

Problem: Local clinic running out of medical supplies and staff.
Only 2 doctors serving 400+ patients this week.
Spanish and Hindi translators urgently needed.

Resources needed:
1. Medical volunteers (first aid certified)
2. Translators (Spanish, Hindi)
3. Medical supply donations

Priority Level: HIGH
Area: Sector 4, near the bus depot`,

            `Emergency Report - Southside Zone
Time: 6:45 AM, April 27

50+ families displaced by building collapse near Southside High School.
Temporary shelter needed immediately. School gymnasium available but needs setup.

Requirements:
- Construction volunteers for cot setup
- Coordination support
- Food and water for 200 people

STATUS: CRITICAL - Families currently on street`
        ];

        const index = Math.floor(Math.random() * demos.length);
        return `[DEMO MODE - Vision AI Simulation]\n\n${demos[index]}`;
    }
}

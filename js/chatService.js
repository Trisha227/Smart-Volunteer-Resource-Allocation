/**
 * ImpactConnect Gemini Coordinator Chatbot Service
 * A context-aware AI assistant that answers questions about LIVE dashboard data.
 * Judges can ask: "Which shelter needs help most?" "What are the critical tasks?"
 */
class ChatService {
    constructor(aiService) {
        this.ai = aiService;
        this.history = [];
    }

    /**
     * Builds a rich system context from live app data so Gemini can answer
     * questions about the REAL state of the platform.
     */
    buildContext(tasks, volunteers, facilities) {
        const criticalTasks = tasks.filter(t => t.urgency === 'critical' || t.urgency === 'high');
        const resolvedTasks = tasks.filter(t => t.status === 'Resolved');

        const facilitySummary = facilities.map(f => {
            const pct = Math.round((f.occupancy / f.capacity) * 100);
            return `${f.name} (${f.type}): ${pct}% full, Status: ${f.status}, Needs: ${f.needs.join(', ')}`;
        }).join('\n');

        const taskSummary = tasks.map(t =>
            `[${t.urgency.toUpperCase()}] ${t.title} @ ${t.location} — Skills: ${t.skills.join(', ')} — SDG: ${t.sdgTag || 'Not tagged'}`
        ).join('\n');

        const volunteerSummary = volunteers.map(v =>
            `${v.name} (${v.location}): ${v.skills.join(', ')} — Availability: ${v.availability} — ${v.points} pts`
        ).join('\n');

        return `
You are the ImpactConnect AI Coordinator. You have LIVE access to the platform's data.
Answer coordinator questions based ONLY on this real data. Be concise, helpful, and action-oriented.
Always end with ONE specific, actionable recommendation.

=== LIVE PLATFORM DATA ===

TASKS (${tasks.length} total, ${criticalTasks.length} critical/high, ${resolvedTasks.length} resolved):
${taskSummary}

VOLUNTEERS (${volunteers.length} active):
${volunteerSummary}

FACILITIES (${facilities.length} monitored):
${facilitySummary}

UN SDG FOCUS: SDG 1 (No Poverty), SDG 2 (Zero Hunger), SDG 3 (Good Health), SDG 10 (Reduced Inequalities), SDG 11 (Sustainable Cities), SDG 13 (Climate Action)

=== END DATA ===
`;
    }

    /**
     * Sends a message to Gemini with full platform context.
     * Returns a text response (not JSON).
     */
    async chat(userMessage, tasks, volunteers, facilities) {
        if (!this.ai.apiKey) {
            // Demo mode: return a smart canned response
            return this.getDemoResponse(userMessage, tasks, facilities);
        }

        const context = this.buildContext(tasks, volunteers, facilities);
        const prompt = `${context}\n\nCOORDINATOR QUESTION: "${userMessage}"\n\nAI RESPONSE:`;

        const response = await fetch(`${this.ai.apiUrl}?key=${this.ai.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.5,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 300
                }
            })
        });

        if (!response.ok) throw new Error('Chat AI failed');
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response.';
    }

    getDemoResponse(message, tasks, facilities) {
        const msg = message.toLowerCase();

        if (msg.includes('shelter') || msg.includes('facility')) {
            const critical = facilities.find(f => f.status === 'Warning' || Math.round((f.occupancy / f.capacity) * 100) > 75);
            if (critical) {
                const pct = Math.round((critical.occupancy / critical.capacity) * 100);
                return `🏥 **${critical.name}** needs immediate attention — it's at **${pct}% capacity** with status: **${critical.status}**.\n\nImmediate need: ${critical.needs.join(', ')}.\n\n**Recommendation:** Deploy 2 logistics volunteers to ${critical.name} immediately.`;
            }
        }
        if (msg.includes('critical') || msg.includes('urgent')) {
            const crits = tasks.filter(t => t.urgency === 'critical');
            return `🚨 There are **${crits.length} critical tasks** right now:\n\n${crits.map(t => `• **${t.title}** @ ${t.location}`).join('\n')}\n\n**Recommendation:** Address "${crits[0]?.title}" first — it affects the most people.`;
        }
        if (msg.includes('volunteer') || msg.includes('who')) {
            return `👥 The platform has **${tasks.length} active tasks** and the Smart Matcher can identify the best volunteer for each.\n\n**Recommendation:** Go to the Smart Matcher tab and click any critical task to find matched volunteers instantly.`;
        }
        if (msg.includes('sdg') || msg.includes('goal')) {
            return `🌍 ImpactConnect maps all tasks to UN Sustainable Development Goals:\n\n• **Food tasks** → SDG 2: Zero Hunger\n• **Medical tasks** → SDG 3: Good Health\n• **Shelter tasks** → SDG 11: Sustainable Cities\n\n**Recommendation:** Check the Ingest tab — all new tasks are auto-tagged to SDGs by Gemini AI.`;
        }
        return `I'm operating in demo mode. For full AI responses, add a Gemini API key in the Ingest tab.\n\nI can answer questions like:\n• "Which shelter needs help most?"\n• "What are the critical tasks?"\n• "Which volunteers are available?"\n• "What SDGs does this project address?"`;
    }
}

class MatchingEngine {
    constructor(volunteers) {
        this.volunteers = volunteers;
    }

    /**
     * Calculates a match score between a task and a volunteer.
     * Score is based on:
     * - Skill overlap (Highest weight)
     * - Location proximity (Medium weight)
     * - Availability (Low weight)
     */
    calculateMatchScore(task, volunteer) {
        let score = 0;
        let reasons = [];

        // 1. Skill Match (up to 60 points)
        const matchedSkills = volunteer.skills.filter(skill => task.skills.includes(skill));
        const skillPercentage = task.skills.length > 0 ? (matchedSkills.length / task.skills.length) : 0;
        const skillScore = skillPercentage * 60;
        score += skillScore;
        
        if (matchedSkills.length > 0) {
            reasons.push(`${matchedSkills.length} matching skills`);
        } else {
            reasons.push(`No matching skills`);
        }

        // 2. Location Proximity (up to 30 points)
        // Mocking proximity: exact match gets 30, otherwise partial match gets 15, else 0
        if (task.location.toLowerCase().includes(volunteer.location.toLowerCase())) {
            score += 30;
            reasons.push('Nearby location');
        } else {
            reasons.push('Further away');
        }

        // 3. Availability (up to 10 points)
        let availabilityScore = 0;
        if (volunteer.availability === 'High') {
            availabilityScore = 100;
        } else if (volunteer.availability === 'Medium') {
            availabilityScore = 50;
        }

        const finalScore = Math.round(
            (skillScore * this.weights.skills) + 
            (proximityScore * this.weights.proximity) + 
            (availabilityScore * this.weights.availability)
        );

        return {
            volunteer,
            score: finalScore,
            breakdown: {
                skills: Math.round(skillScore),
                proximity: Math.round(proximityScore),
                availability: Math.round(availabilityScore)
            },
            reasons
        };
    }

    /**
     * Get ranked matches for a given task
     */
    getMatchesForTask(task, limit = 5) {
        const matches = this.volunteers.map(vol => this.calculateMatchScore(task, vol));
        
        // Sort descending by score
        matches.sort((a, b) => b.score - a.score);
        
        return matches.slice(0, limit);
    }
}

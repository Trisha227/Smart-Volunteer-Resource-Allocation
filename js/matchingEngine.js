class MatchingEngine {
    constructor(volunteers) {
        this.volunteers = volunteers;

        // Weighted scoring system (must add up to 1.0)
        this.weights = {
            skills: 0.60,       // 60% weight on skill match
            proximity: 0.30,    // 30% weight on location
            availability: 0.10  // 10% weight on availability
        };
    }

    /**
     * Calculates a match score between a task and a volunteer.
     * Returns a score 0-100 with a full breakdown.
     */
    calculateMatchScore(task, volunteer) {
        let reasons = [];

        // 1. Skill Match (0-100)
        const matchedSkills = volunteer.skills.filter(skill =>
            task.skills.some(ts => ts.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(ts.toLowerCase()))
        );
        const skillScore = task.skills.length > 0
            ? (matchedSkills.length / task.skills.length) * 100
            : 0;

        if (matchedSkills.length > 0) {
            reasons.push(`${matchedSkills.length} matching skill${matchedSkills.length > 1 ? 's' : ''}`);
        } else {
            reasons.push('No direct skill match');
        }

        // 2. Location Proximity (0-100)
        let proximityScore = 0;
        const taskLoc = task.location.toLowerCase();
        const volLoc = volunteer.location.toLowerCase();

        if (taskLoc.includes(volLoc) || volLoc.includes(taskLoc)) {
            proximityScore = 100;
            reasons.push('Nearby location');
        } else {
            proximityScore = 30; // Partial score — still deployable
            reasons.push('Further away');
        }

        // 3. Availability (0-100)
        let availabilityScore = 0;
        if (volunteer.availability === 'High') {
            availabilityScore = 100;
            reasons.push('High availability');
        } else if (volunteer.availability === 'Medium') {
            availabilityScore = 50;
            reasons.push('Medium availability');
        } else {
            availabilityScore = 10;
            reasons.push('Low availability');
        }

        // Weighted final score
        const finalScore = Math.min(100, Math.round(
            (skillScore * this.weights.skills) +
            (proximityScore * this.weights.proximity) +
            (availabilityScore * this.weights.availability)
        ));

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
        matches.sort((a, b) => b.score - a.score);
        return matches.slice(0, limit);
    }
}

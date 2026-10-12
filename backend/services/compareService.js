const { parsePDF } = require('../utils');

const compareResumeAndJD = async (resumeBuffer, jdText) => {
    const resumeText = await parsePDF(resumeBuffer);
    
    // Placeholder for AI comparison logic
    // Currently returns basic word match count or similar
    const resumeWords = resumeText.toLowerCase().split(/\s+/);
    const jdWords = jdText.toLowerCase().split(/\s+/);
    
    const intersection = jdWords.filter(word => resumeWords.includes(word));
    const score = (intersection.length / jdWords.length) * 100;

    return {
        matchScore: score.toFixed(2),
        parsedResume: resumeText.substring(0, 500) + '...', // Preview
        parsedJD: jdText.substring(0, 500) + '...',
        message: "AI analysis will be integrated here later."
    };
};

module.exports = {
    compareResumeAndJD
};

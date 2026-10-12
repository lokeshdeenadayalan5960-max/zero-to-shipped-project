const { compareResumeAndJD } = require('../services/compareService');

const compare = async (req, res) => {
    try {
        const { jd } = req.body;
        const resumeFile = req.file;

        if (!jd || !resumeFile) {
            return res.status(400).json({ error: 'Both Resume (PDF) and Job Description (text) are required' });
        }

        const result = await compareResumeAndJD(resumeFile.buffer, jd);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    compare
};

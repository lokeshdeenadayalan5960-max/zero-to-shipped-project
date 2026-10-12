import mongoose from 'mongoose'

// One document per resume-vs-JD comparison.
const analysisSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    // Text is capped so a pathological PDF can't bloat the collection.
    resumeText: { type: String, required: true },
    jobDescription: { type: String, required: true },
    jdSkills: { type: [String], required: true },
    matchedSkills: { type: [String], required: true },
    missingSkills: { type: [String], required: true },
    extraSkills: { type: [String], default: [] },
    score: { type: Number, required: true, min: 0, max: 100 },
    band: { type: String, required: true },
  },
  { timestamps: true },
)

export default mongoose.model('Analysis', analysisSchema)

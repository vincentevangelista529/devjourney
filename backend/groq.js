const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function analyzeSkillGap(jobDescription, mySkills) {
    const prompt = `
You are a technical recruiter assistant. Compare the job description below against the candidate's current skills.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S CURRENT SKILLS:
${mySkills}

Respond ONLY with valid JSON in this exact structure, no markdown formatting, no backticks, no extra text:
{
  "required_skills": ["skill1", "skill2"],
  "matched_skills": ["skill you already have that matches"],
  "missing_skills": ["skill required but not in your list"],
  "fit_score": <a number from 0 to 100 representing how well the candidate currently matches this role>,
  "recommendation": "<one of exactly: 'Strong Match', 'Worth Applying', 'Stretch Application', 'Not Yet Ready'>",
  "advice": "one short paragraph of practical advice on how to close the gap"
}

Base fit_score and recommendation on realistic hiring standards for entry-level/junior roles specifically — remember most job postings list skills as "nice to have," not strict requirements, and companies commonly hire junior candidates who don't meet every listed skill if their fundamentals are strong. Be honest but not overly harsh.
`;

    const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
    });

    const responseText = completion.choices[0].message.content;
    const cleaned = responseText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
}

module.exports = { analyzeSkillGap };
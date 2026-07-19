const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('DevJourney API is running');
});

app.get('/api/applications', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM applications ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


app.post('/api/applications', async (req, res) => {
    try {
        const { company, role, status, date_applied, job_url, salary_min, salary_max, notes, skills_required } = req.body;

        const result = await pool.query(
            `INSERT INTO applications (company, role, status, date_applied, job_url, salary_min, salary_max, notes, skills_required)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [company, role, status, date_applied, job_url, salary_min, salary_max, notes, skills_required]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.delete('/api/applications/:id', async (req, res) => {
  try {
    const  { id } =req.params;
    await pool.query('DELETE FROM applications WHERE id = $1', [id]);
    res.json({ message: 'Application deleted'})
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
});

app.put('/api/applications/:id', async (req, res) => {
  try {
    const { id } =req.params;
    const { company, role, status, date_applied, job_url, salary_min, salary_max, notes, skills_required } = req.body;

    const result = await pool.query(
      `UPDATE applications
      SET company = $1, role = $2, status = $3, date_applied = $4, job_url = $5,
        salary_min = $6, salary_max = $7, notes = $8, skills_required = $9
      WHERE id =$10
      RETURNING *`,
      [company, role, status, date_applied, job_url, salary_min, salary_max, notes, skills_required, id]
    );
    
    res.json(result.rows[0])
  }catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

const { analyzeSkillGap } = require('./groq');

app.post('/api/analyze-gap', async (req, res) => {
    try {
        const { jobDescription, mySkills } = req.body;

        if (!jobDescription || !mySkills) {
            return res.status(400).json({ error: 'jobDescription and mySkills are required' });
        }

        const analysis = await analyzeSkillGap(jobDescription, mySkills);
        res.json(analysis);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to analyze skill gap' });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
import { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [applications, setApplications] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        company: '',
        role: '',
        status: 'Applied',
        date_applied: '',
        job_url: '',
        salary_min: '',
        salary_max: '',
        notes: '',
        skills_required: ''
    });
    const [showAiPanel, setShowAiPanel] = useState(false);
    const [jobDescription, setJobDescription] = useState('');
    const [mySkills, setMySkills] = useState('React, Node.js, Express, PostgreSQL, JWT authentication, REST APIs, Git, HTML, CSS, JavaScript, Docker (learning)');
    const [aiResult, setAiResult] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    const handleAnalyze = () => {
        if (!jobDescription.trim()) return;

        setAiLoading(true);
        setAiResult(null);

        fetch(`${import.meta.env.VITE_API_URL}/api/analyze-gap`, 
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ jobDescription, mySkills })
        })
            .then(res => res.json())
            .then(data => {
                setAiResult(data);
                setAiLoading(false);
            })
            .catch(err => {
                console.error('Error Analyzing gap', err);
                setAiLoading(false);
            });
    };

    const fetchApplications = () => {
        fetch(`${import.meta.env.VITE_API_URL}/api/applications`)
            .then(res => res.json())
            .then(data => setApplications(data))
            .catch(err => console.error('Error Fetching Applications', err));
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            company: '', role: '', status: 'Applied', date_applied: '',
            job_url: '', salary_min: '', salary_max: '', notes: '', skills_required: ''
        });
        setEditingId(null);
        setShowModal(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingId) {
            fetch(`${import.meta.env.VITE_API_URL}/api/applications/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
                .then(res => res.json())
                .then(() => {
                    fetchApplications();
                    resetForm();
                })
                .catch(err => console.error('Error Updating Application', err));
        } else {
            fetch(`${import.meta.env.VITE_API_URL}/api/applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
                .then(res => res.json())
                .then(() => {
                    fetchApplications();
                    resetForm();
                })
                .catch(err => console.error('Error Adding Application', err));
        }
    };

    const handleDelete = (id) => {
        fetch(`${import.meta.env.VITE_API_URL}/api/applications/${id}`, {
            method: 'DELETE'
        })
            .then(() => fetchApplications())
            .catch(err => console.error('Error Deleting Application', err));
    };

    const handleEditClick = (app) => {
        setFormData({
            company: app.company,
            role: app.role,
            status: app.status,
            date_applied: app.date_applied ? app.date_applied.split('T')[0] : '',
            job_url: app.job_url || '',
            salary_min: app.salary_min || '',
            salary_max: app.salary_max || '',
            notes: app.notes || '',
            skills_required: app.skills_required || ''
        });
        setEditingId(app.id);
        setShowModal(true);
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>DevJourney</h1>
                <p>Tracking {applications.length} application(s)</p>
                <button className="open-modal-btn" onClick={() => setShowModal(true)}>
                    + Add Application
                </button>
            </header>

            <div className="applications-grid">
                {applications.map((app) => (
                   <div key={app.id} className={`application-card status-border-${app.status.toLowerCase()}`}>
                        <span className={`status-badge status-${app.status.toLowerCase()}`}>
                            {app.status}
                        </span>
                        <h3>{app.company} — {app.role}</h3>
                        <p>Salary: ₱{app.salary_min?.toLocaleString()} - ₱{app.salary_max?.toLocaleString()}</p>
                        <p>{app.notes}</p>
                        <div className="card-buttons">
                            <button onClick={() => handleEditClick(app)}>Edit</button>
                            <button onClick={() => handleDelete(app.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={resetForm}>
                    <form
    onSubmit={handleSubmit}
    className="application-form"
    onClick={(e) => e.stopPropagation()}
>
    <h2>{editingId ? 'Update Application' : 'Add Application'}</h2>

    <div className="form-group">
        <label>Company</label>
        <input name="company" value={formData.company} onChange={handleChange} required />
    </div>

    <div className="form-group">
        <label>Role</label>
        <input name="role" value={formData.role} onChange={handleChange} required />
    </div>

    <div className="form-row">
        <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Applied">Applied</option>
                <option value="Assessment">Assessment</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
            </select>
        </div>
        <div className="form-group">
            <label>Date Applied</label>
            <input type="date" name="date_applied" value={formData.date_applied} onChange={handleChange} />
        </div>
    </div>

    <div className="form-group">
        <label>Job URL</label>
        <input name="job_url" value={formData.job_url} onChange={handleChange} />
    </div>

    <div className="form-row">
        <div className="form-group">
            <label>Salary Min</label>
            <input type="number" name="salary_min" value={formData.salary_min} onChange={handleChange} />
        </div>
        <div className="form-group">
            <label>Salary Max</label>
            <input type="number" name="salary_max" value={formData.salary_max} onChange={handleChange} />
        </div>
    </div>

    <div className="form-group">
        <label>Notes</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} />
    </div>

    <div className="form-group">
        <label>Skills Required</label>
        <input name="skills_required" placeholder="comma separated" value={formData.skills_required} onChange={handleChange} />
    </div>

    <div className="form-buttons">
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        <button type="button" onClick={resetForm}>Cancel</button>
    </div>
</form>
                </div>
            )}
            <button className="ai-bubble" onClick={() => setShowAiPanel(true)}>
    ✦
</button>

{showAiPanel && (
    <div className="ai-panel-overlay" onClick={() => setShowAiPanel(false)}>
        <div className="ai-panel" onClick={(e) => e.stopPropagation()}>
            <div className="ai-panel-header">
                <h2>AI Skill Gap Analysis</h2>
                <button className="close-btn" onClick={() => setShowAiPanel(false)}>✕</button>
            </div>

            <div className="form-group">
                <label>Paste Job Description</label>
                <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job posting here..."
                    rows={6}
                />
            </div>

            <div className="form-group">
                <label>Your Current Skills</label>
                <textarea
                    value={mySkills}
                    onChange={(e) => setMySkills(e.target.value)}
                    rows={3}
                />
            </div>

            <button className="analyze-btn" onClick={handleAnalyze} disabled={aiLoading}>
                {aiLoading ? 'Analyzing...' : 'Analyze Fit'}
            </button>

            {aiResult && (
    <div className="ai-result">
        <div className={`recommendation recommendation-${aiResult.recommendation.toLowerCase().replace(/\s+/g, '-')}`}>
            <span className="fit-score">{aiResult.fit_score}%</span>
            <span className="recommendation-text">{aiResult.recommendation}</span>
        </div>

        <div className="skill-tags-group">
            <p className="tags-label">Matched Skills</p>
            <div className="tags">
                {aiResult.matched_skills.map((skill, i) => (
                    <span key={i} className="tag tag-matched">{skill}</span>
                ))}
            </div>
        </div>

        <div className="skill-tags-group">
            <p className="tags-label">Missing Skills</p>
            <div className="tags">
                {aiResult.missing_skills.map((skill, i) => (
                    <span key={i} className="tag tag-missing">{skill}</span>
                ))}
            </div>
        </div>

        <div className="ai-advice">
            <p className="tags-label">Advice</p>
            <p>{aiResult.advice}</p>
        </div>
    </div>
)}
        </div>
    </div>
)}
        </div>
    );
}

export default App;
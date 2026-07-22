# DevJourney

A full-stack job application tracker with AI-powered skill-gap analysis. Log the roles you're applying to, track their status, and get an instant read on how well your skills match a job posting — powered by Groq's Llama 3.3.

---

## Why I built this

Job hunting means applying to dozens of postings and losing track of what you applied to, what the requirements were, and whether you're actually a good fit. DevJourney solves both problems. It's a tracker for the applications themselves, and an AI assistant that tells you whether a posting is worth the effort — before you spend time tailoring a resume for it.

## Features

- **Application tracking** — add, edit, and delete job applications with company, role, status, salary range, job URL, and notes
- **Status-based organization** — track where each application stands (Applied, Rejected, etc.) with a clean card-based UI
- **AI skill-gap analysis** — paste a job description and your current skills, and get:
  - A **fit score** (e.g. "40% — Worth Applying")
  - **Matched skills** — what you already have that the role wants
  - **Missing skills** — the gaps, called out explicitly
  - **Tailored advice** — specific, actionable next steps to close the gap
- **Dockerized** — both frontend and backend include Dockerfiles for containerized deployment

## Screenshots

**Tracker dashboard**
![DevJourney dashboard showing tracked applications](./screenshots/dashboard.png)

**AI skill-gap analysis**
![AI analysis showing fit score, matched/missing skills, and advice](./screenshots/ai-analysis.png)


## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| AI | Groq API (Llama 3.3) |
| Deployment | Docker |

## Architecture

```
┌─────────────┐      REST API       ┌─────────────┐      SQL      ┌──────────────┐
│   React     │ ──────────────────> │   Express   │ ────────────> │  PostgreSQL  │
│  (frontend) │ <────────────────── │  (backend)  │ <──────────── │  (applications) │
└─────────────┘                     └──────┬──────┘                └──────────────┘
                                            │
                                            │  skill-gap request
                                            ▼
                                     ┌──────────────┐
                                     │   Groq API   │
                                     │ (Llama 3.3)  │
                                     └──────────────┘
```

The frontend is a single-page React app that talks to an Express REST API. The API handles CRUD operations against PostgreSQL for application tracking, and a separate route (`/api/analyze-gap`) forwards job description + skills data to Groq's Llama 3.3 model, which returns a structured fit analysis.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/applications` | Fetch all tracked applications, newest first |
| POST | `/api/applications` | Create a new application entry |
| PUT | `/api/applications/:id` | Update an existing application |
| DELETE | `/api/applications/:id` | Remove an application |
| POST | `/api/analyze-gap` | Send a job description + your skills, get back an AI-generated fit analysis |

All database queries use **parameterized queries** (`$1`, `$2`, etc.) to prevent SQL injection.

## Database Schema

```sql
CREATE TABLE applications (
    id integer PRIMARY KEY,
    company character varying(100) NOT NULL,
    role character varying(100) NOT NULL,
    status character varying(50) DEFAULT 'Applied',
    date_applied date,
    job_url text,
    salary_min integer,
    salary_max integer,
    notes text,
    skills_required text,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
```

## Running Locally

### Prerequisites
- Node.js
- PostgreSQL
- A Groq API key ([console.groq.com](https://console.groq.com))

### Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```
DATABASE_URL=postgresql://username:password@localhost:5432/devjourney
GROQ_API_KEY=your_groq_api_key
PORT=5000
```

Set up the database:

```bash
psql -U postgres -d devjourney -f schema.sql
```

Start the server:

```bash
node server.js
```

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### Running with Docker

Both `backend/` and `frontend/` include Dockerfiles for containerized deployment. Build and run each service according to your Docker setup (see individual Dockerfiles for exposed ports and build steps).

## What I'd improve next

- Add authentication so multiple users can track their own applications separately
- Expand the schema to a normalized structure (e.g. separate `skills` table) instead of a flat `skills_required` text field
- Add automated tests for the API routes, especially the AI analysis endpoint
- Cache repeated Groq API calls for identical job descriptions to reduce cost and latency

## Author

**Vincent Evangelista**
[GitHub](https://github.com/vincentevangelista529) · [Portfolio](https://vincentevangelista.vercel.app/)

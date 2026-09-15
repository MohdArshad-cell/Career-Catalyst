<div align="center">
  
# 🚀 Career Catalyst
### The AI-Powered Resume Engine & Full-Stack Career Optimization Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?logo=fastapi&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](#)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?logo=supabase&logoColor=white)](#)
[![Redis](https://img.shields.io/badge/Redis-Rate_Limiting-DC382D?logo=redis&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?logo=tailwind-css&logoColor=white)](#)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-6772E5?logo=stripe&logoColor=white)](#)

*Your unfair advantage in the modern job market.*

</div>

---

## 📖 Table of Contents
1. [Domain & Vision](#-domain--vision)
2. [Tech Stack](#-tech-stack)
3. [Premium SaaS Features](#-premium-saas-features)
4. [Free Lead-Gen Tools](#-free-lead-gen-tools)
5. [Database Schema](#-database-schema)
6. [System Architecture & Data Flow](#-system-architecture--data-flow)
7. [Growth & Economy Mechanics](#-growth--economy-mechanics)
8. [Getting Started (Local Setup)](#-getting-started)

---

## 🌐 Domain & Vision

**Career Catalyst** operates in the **Career Technology (CareerTech) and HR-Tech domain**. 
The job market is increasingly dominated by automated Applicant Tracking Systems (ATS) that ruthlessly filter resumes before human eyes ever see them. Career Catalyst is a B2C / B2B SaaS platform built to level the playing field.

Instead of just blindly injecting keywords, the platform uses intelligent LLM orchestration (Groq/Gemini), mathematical fuzzy matching, and dynamic tone scaling to rewrite resumes exactly how senior technical recruiters and ATS algorithms want to read them. It features a built-in token economy, referral mechanics, secure authentication, and a full admin suite.

---

## 🛠️ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | **React.js (v18)** | Component-based SPA framework. |
| **Styling** | **Tailwind CSS** | Utility-first CSS framework for custom Glassmorphism and 3D UI. |
| **Routing** | **React Router v6** | Client-side routing and protected SaaS routes. |
| **Backend API** | **FastAPI (Python)** | High-performance async API for AI orchestration. |
| **AI / LLMs** | **Groq & Google Gemini** | Ultra-fast inference for generative career text. |
| **Database** | **Supabase (PostgreSQL)** | Relational DB for logs, tokens, users, and referrals. |
| **Auth** | **Supabase Auth** | JWT-based OAuth and Magic Link authentication. |
| **Caching/Limits** | **Redis** | IP-based rate limiting for free endpoints. |
| **Payments** | **Stripe** | Checkout sessions and webhooks for token purchasing. |
| **Document Gen** | **Tectonic (LaTeX)** | Compiles dynamic `.tex` templates into beautiful PDFs. |

---

## 💎 Premium SaaS Features

Access to these tools is gated behind the internal **Token Economy**. Users spend 1 token per generation.

| Feature | Description | Underlying Technology |
| :--- | :--- | :--- |
| **AI Resume Tailor** | Rewrites an entire resume to perfectly match a target Job Description. | RapidFuzz + LLM Orchestration + LaTeX Compiler |
| **Brutal ATS Scanner** | Mathematical evaluation of ATS compatibility with actionable Roasts. | Keyword extraction + AI Critique |
| **ATS X-Ray Vision** | Live split-screen highlighting of missing keywords from a JD. | NLP text parsing + React Highlighting |
| **Cover Letter AI** | Dynamically generates targeted, markdown-stripped cover letters. | LLM + Dynamic Prompting |
| **Mock Interview** | Generates highly-specific behavioral and technical interview questions. | LLM Context Injection |
| **LinkedIn Optimizer** | Re-writes headlines and About sections to rank in Recruiter search. | LLM + SEO heuristics |
| **Cold Outreach Drafter** | Generates personalized, high-converting networking DMs. | LLM + Value Prop matching |
| **Career Roadmap** | Analyzes a resume vs a dream job and outputs a 12-month upskill plan. | Gap Analysis AI |

---

## 🧲 Free Lead-Gen Tools

Designed for viral marketing and SEO. Protected by **Redis IP Rate Limiting** to prevent abuse.

| Tool Name | Route | Functionality |
| :--- | :--- | :--- |
| **Bullet Rewriter** | `/bullet-rewriter` | Converts weak tasks into XYZ/STAR formula achievements. (Limit: 10/hr) |
| **Job Fit Score** | `/job-fit` | Client-side keyword matching tool for instant % match rating. |
| **Resignation Letter** | `/resignation-letter` | Quick, form-based tool to draft professional resignation letters. (Limit: 5/hr) |
| **Resume Diff Checker** | `/resume-diff` | Client-side tool that shows diffs between old and AI-tailored resumes. |

---

## 🗄️ Database Schema

The platform relies on a robust PostgreSQL schema hosted on Supabase.

### 1. `profiles`
Manages user profiles and their unique referral identifiers.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID (PK)` | Links directly to `auth.users` via foreign key. |
| `referral_code` | `TEXT (Unique)` | The unique 8-character string for their referral link. |
| `created_at` | `TIMESTAMPTZ` | Timestamp of profile creation. |

### 2. `referrals`
Tracks the lifecycle of a referral for the Viral Loop.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID (PK)` | Unique ID for the referral instance. |
| `referrer_id` | `UUID (FK)` | The user who shared the link. |
| `referred_user_id`| `UUID (FK)` | The new user who signed up. |
| `status` | `TEXT` | `pending`, `completed`, or `rewarded`. |
| `tokens_awarded` | `INTEGER` | Amount of tokens given to both parties (default 5). |

### 3. `token_ledger`
Immutable ledger for the internal token economy.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID (PK)` | Unique transaction/ledger row. |
| `user_id` | `UUID (FK)` | The user who owns the tokens. |
| `tokens_balance` | `INTEGER` | The current real-time balance of the user. |
| `transaction_type`| `TEXT` | `grant` (adding) or `deduct` (spending). |
| `action` | `TEXT` | E.g., `signup_bonus`, `stripe_checkout`, `ai_generation`. |

### 4. `generation_logs`
Used by the Admin Dashboard to track LLM costs and usage.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID (PK)` | Unique generation ID. |
| `user_id` | `UUID (FK)` | The user who requested the generation. |
| `tool_name` | `TEXT` | E.g., `ai_tailor`, `mock_interview`. |
| `status` | `TEXT` | `success` or `failed`. |
| `latency_ms` | `INTEGER` | Milliseconds taken by the LLM. |
| `cost_estimate` | `FLOAT` | Estimated API cost for the generation. |

---

## 🏗️ System Architecture & Data Flow

1. **Frontend Request:** User interacts with React UI and submits data (e.g. PDF upload).
2. **Gateway & Auth:** 
   - Paid endpoints pass the JWT token to FastAPI.
   - FastAPI verifies the token asynchronously using PyJWKClient against Supabase Auth.
   - FastAPI checks the user's `token_ledger` balance. If `< 1`, raises `402 Payment Required`.
3. **AI Processing:** 
   - Prompt engineering templates are dynamically loaded.
   - Groq/Gemini processes the text. Pydantic enforces strict JSON structures.
4. **Compilation (Resumes Only):**
   - AI JSON is injected into Jinja2 templates for LaTeX.
   - Subprocess runs `tectonic` to compile the PDF.
5. **Ledger Update:** 
   - 1 token is deducted.
   - Usage is logged in `generation_logs`.
6. **Response:** Data (JSON or binary PDF) is returned to the user.

---

## 📈 Growth & Economy Mechanics

- **Sign Up Bonus:** New users get **15 free tokens** via Supabase Auth triggers/backend grants.
- **Stripe Integration:** Users can buy Token Packs. Webhooks securely update the `token_ledger`.
- **Viral Referral Loop:** 
  - User shares `career-catalyst.com/login?ref=XYZ`.
  - New user clicks and signs up. The frontend detects the `ref` code in `localStorage`.
  - Upon first dashboard entry, the frontend auto-redeems the code.
  - The `grant_tokens` Postgres RPC function atomically adds **5 tokens** to *both* the referrer and referee.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Python 3.10+
- Redis Server (running locally on port `6379`)
- [Tectonic LaTeX Compiler](https://tectonic-typesetting.github.io/en-US/) in system PATH.

### 1. Database Setup (Supabase)
Execute the migration scripts in the Supabase SQL Editor:
- `supabase_migration_phase2.sql`
- `supabase_migration_phase5.sql`

### 2. Backend Setup
```bash
cd resume-engine
python -m venv venv
venv\Scripts\activate   # (On Windows)
pip install -r requirements.txt

# Create .env with required keys (Groq, Gemini, Stripe, Supabase, Redis)
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env with REACT_APP_SUPABASE_URL, ANON_KEY, and API_BASE_URL
npm start
```

---
*Built to beat the ATS and land interviews.* 🎯

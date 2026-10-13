# Project Specification: Gunavardhan's Full-Stack Portfolio

## 1. Project Overview
A modern, animated full-stack developer portfolio website showcasing Gunavardhan Tigulla's expertise in Web Development, AI/ML, and Software Engineering.

## 2. Technical Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Animations**: GSAP, Typed.js, ScrollReveal
- **Backend**: Python with Flask
- **Database**: SQL (MySQL or PostgreSQL)
- **Styling**: Glassmorphism/Dark Theme with blue accents

## 3. Core Features & Sections

### 1. Hero Section
- **Intro**: Animated introduction with typing effect.
- **Title**: Full-Stack Developer & AI/ML Enthusiast.
- **Sub-skills**: Web Developer, Problem Solver, Tech Innovator.
- **CTAs**: "View Projects" and "Contact Me".

### 2. About Me
- Short introduction about background in Computer Science and passion for software engineering.
- Stats showing core projects and tech tools.
- Modern image grid showcasing workspace and coding.

### 3. Skills Section
- **Categories**:
  - **Frontend**: HTML5, CSS3, JavaScript, React.js.
  - **Backend**: Python, Flask, SQL, REST APIs.
  - **ML / Data**: NumPy, Pandas, Scikit-learn, Data Analysis.
  - **Tools**: Git, GitHub, VS Code, Docker, Postman.

### 4. Featured Projects
- **Resume Analyzer**: AI-powered tool for parsing and analyzing resumes.
- **Ad Budget Optimizer**: Smart system to optimize advertising spend using ML.
- **SmartRoad**: Real-time pothole detection system using computer vision.

### 5. Experience & Timeline
- Timeline-style animated section showing educational and professional journey. (Pending implementation)

### 6. Contact Section
- Integrated contact form with backend submission.
- Real-time success notifications.
- Links to GitHub (Gunavardhan22), LinkedIn, and HackerRank.

## 4. Development Roadmap (15 Stages)
- [x] Stage 1-10: Foundation, Core Sections, Basic UI
- [x] Stage 11: Implement Project Cards & Contact Form UI
- [x] Stage 12: Visual Polish & Micro-animations (ScrollReveal & Typed.js integration)
- [x] Stage 13: Backend Foundation (Flask API initialized with app.py)
- [x] Stage 14: Deployment Configuration (Vercel/Heroku readiness)
- [x] Stage 15: Final Testing & Documentation

## 5. File Structure
- `index.html`: Main frontend file.
- `style.css`: Modern styling with dark mode and glassmorphism.
- `script.js`: Interactive logic, typing effect, and particles.
- `app.py`: Flask backend for contact form Handling.
- `database.sql`: SQL schema for the project database.
- `portfolio.db`: Local SQLite database (automatically generated).
- `requirements.txt`: Python dependencies.
- `Procfile`: Heroku/Render deployment config.
- `.gitignore`: Files to exclude from Git.

## 6. Deployment Guide
### Backend (Heroku/Render)
1. **Requirements**: The `requirements.txt` and `Procfile` are ready.
2. **Commands**:
   - `pip install -r requirements.txt`
   - `gunicorn app:app`
### Frontend (Vercel/Netlify)
1. **Zero Config**: Drop the frontend files into a new project on Vercel.
2. **Environment Variable**: Update `script.js` with your production API URL if needed.

## 7. Aesthetics & UX
- Dark theme (`#0d1117`) with glassmorphism elements.
- Custom particle background using `particles.js`.
- Smooth scrolling and typed header effects.
- Fully responsive layout for all device sizes.
- Scroll-triggered animations for all sections.

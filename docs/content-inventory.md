# Content inventory

Records where every factual claim on the site, in the spoken introduction (`content/intro.js`), and in the assistant's knowledge file (`content/profile.md`) comes from, and what still needs the owner's input before launch.

Repository facts were checked on 2026-10-10 against the public repositories at https://github.com/Gunavardhan22. Skills and the Resume Analyzer, SmartRoad, and Student Management System descriptions come from the owner's own brief.

## Launch blockers (owner action needed)

| # | Item | Why it blocks launch | Where to fix |
|---|------|----------------------|--------------|
| 1 | **Background image rights.** The moonlit character artwork (`assets/images/moonlit-*`) appears to be fan art of a copyrighted anime character. | A public, professional site needs permission to use it, or at least an artist credit. Replacing it only means swapping two image files. | `assets/images/` |
| 2 | **Rotate the Groq API key.** It was pasted into a chat. | Treat it as exposed. Create a new key, put it in `.env` as `AI_API_KEY` (and in the host's environment), and delete the old one. | Groq console, `.env` |
| 3 | **Rotate the Gemini API keys** hardcoded in `Explainable-Deep-Learning-Intrusion-Detection-System-/app1.py` and `chatbot-powered-by-gemini/Chatbot/app.py`. | The portfolio links recruiters to these repos. Load the keys from environment variables and remove them from git history. | Those two repos |
| 4 | **Repository URLs** for the AI Resume Analyzer, Seat Seeker, and Student Management System. | Their cards have no links yet. Commented blocks are ready where useful. | `index.html` → `#projects`, `content/profile.md` |
| 5 | **LinkedIn URL.** | A commented-out entry is ready in Contact. | `index.html` → `#contact` |
| 6 | **Résumé vs. site differences** (see below). | Recruiters will compare the PDF with the site. | `assets/resume.pdf` or `index.html` |

Done: `assets/resume.pdf` was added (2026-10-13).

## Accuracy decisions

- **Sources (2026-10-13 redesign).** The résumé (`assets/resume.pdf`) added Seat Seeker, the certifications, LangChain/LangGraph/ChromaDB, SDLC/Agile, and the newer AI Resume Analyzer description (Flask REST API, LangChain, MongoDB, Docker). They appear on the site and in `content/profile.md` as the résumé states them.
- **Résumé vs. site differences to resolve:** the résumé says the IDS uses **SHAP**, but the public repo uses **LIME**, so the site keeps "LIME, with SHAP as the next step". The résumé's Resume Analyzer stack omits React, which the old site listed; the site now follows the résumé.
- **RAG** moved from "Currently learning" to skills, because the résumé describes RAG with ChromaDB in Seat Seeker.
- **No experience section.** The résumé lists no work experience, so none is shown.

- **IDS explanations: LIME, with SHAP planned.** `app1.py` uses `lime.lime_tabular` and there's no SHAP in the repo. The card, About text, and assistant profile say LIME is in use and SHAP is the next step. The title no longer says "using GAN and SHAP". Change the wording once SHAP is in the code.
- **Projects without public repos.** The Resume Analyzer, Seat Seeker, and Student Management System cards say "No public repo yet" and have no links. SmartRoad (a concept in the old narration) is not shown.
- **Skills** list the brief's technologies. RAG, embeddings, vector search, output evaluation, SHAP, and AWS fundamentals sit under *Currently learning*, since no public repo shows them in use.
- **Coffee House** is described from its code: React, TypeScript, and Vite; coffee, matcha, and dessert menus; customisation, cart, and checkout; Supabase migrations for menus and orders. It isn't labelled GenAI, because no GenAI code was found. Status is "In progress", based on recent commits.
- **Narration claim "Protecting data matters"** is worded as a value, not a claim that every repo already does it (item 3).

## Projects shown

| Project | Repo | Evidence | Status label |
|---------|------|----------|--------------|
| Explainable Deep Learning IDS | `Explainable-Deep-Learning-Intrusion-Detection-System-` | `app1.py`: Streamlit, CNN/LSTM, LIME, Gemini explanation. Notebook: UNSW-NB15, GAN generator/discriminator | Prototype · runs locally |
| AI Resume Analyzer | pending (#4) | Résumé (Flask REST API, LangChain, MongoDB, Docker) | No public repo yet |
| Seat Seeker | pending (#4) | Résumé (LangGraph, LangChain, ChromaDB, MySQL) | No public repo yet |
| Student Management System | pending (#4) | Owner's brief (Java, JDBC, MySQL) | No public repo yet |
| Documentation Module Extractor | `pulsegen-pma` | crawler, parser, module inference, DistilBART summariser with spaCy fallback, FastAPI, Streamlit, CLI, tests, Dockerfile | Prototype · has tests |
| Gemini-Powered Chatbot | `chatbot-powered-by-gemini` | Flask `/chat`, Gemini chat session with history, input check, error handling, Dockerfile | Prototype · runs locally |
| Come With Me For A Cup Of Coffee | `Come-With-Me-For-A-Cup-Of-Coffee` | `src/components/*`, `CartContext`, `supabase/migrations/*` | In progress |
| Electricity Consumption Forecasting | `Ml-power--pre.` | Notebook: stacked LSTM with dropout, scaling, weekly windows, chronological split, RMSE | Academic project |

Journey dates for the projects come from repository activity (2025 and 2025–2026).

## No metrics published

No accuracy, F1, RMSE values, or usage numbers appear on the site, in the introduction, or in the assistant profile.

# Content inventory

Records where every factual claim on the site and in the spoken narration comes from, and what still needs the owner's input before launch.

Repository facts were checked on 2026-10-10 against the public repositories at https://github.com/Gunavardhan22. Skills and the Resume Analyzer, SmartRoad, and Student Management System descriptions come from the owner's own brief.

## Launch blockers (owner action needed)

| # | Item | Why it blocks launch | Where to fix |
|---|------|----------------------|--------------|
| 1 | **Accept the Orpheus model terms in Groq.** Every TTS request currently returns `400 model_terms_required`. | The AI voice can't generate audio until an org admin accepts at https://console.groq.com/playground?model=canopylabs%2Forpheus-v1-english. Until then visitors get the browser voice. | Groq console, then `npm run voice:build` |
| 2 | **Rotate the Groq API key.** It was pasted into a chat. | Treat it as exposed. Create a new key, put it in `.env` (and the host's environment), and delete the old one. | Groq console, `.env` |
| 3 | **Rotate the Gemini API keys** hardcoded in `Explainable-Deep-Learning-Intrusion-Detection-System-/app1.py` and `chatbot-powered-by-gemini/Chatbot/app.py`. | The portfolio links recruiters to these repos. Load the keys from environment variables and remove them from git history. | Those two repos |
| 4 | **Add `assets/resume.pdf`.** | Both "Download Résumé" buttons point to it. It's missing, so the link 404s. | `assets/resume.pdf` |
| 5 | **AI Resume Analyzer repository URL.** No such repo is public. | The card has no link yet (commented block ready). Its description comes from the old site ("analyzes resumes against job descriptions to provide compatibility scores", tagged NLP, React, Flask). | `index.html` → `#projects` |
| 6 | **LinkedIn URL.** | A commented-out entry is ready in Contact. | `index.html` → `#contact` |
| 7 | **Confirm degree status.** The site and narration say "studying" and "2022 to 2026 programme". | Update both if the degree is complete. | `index.html` → About, Journey. `content/about-me.js` → Hello |

## Accuracy decisions

- **IDS explanations: LIME, with SHAP planned.** `app1.py` uses `lime.lime_tabular` and there's no SHAP in the repo. The card, About text, and narration say LIME is in use and SHAP is the next step. The title no longer says "using GAN and SHAP". Change the wording once SHAP is in the code.
- **Narration-only projects.** SmartRoad is described as "a concept", per the brief. The Student Management System (Java, JDBC, MySQL) and Resume Analyzer are described as the brief states. None has a public repo, so they have no project cards except the Resume Analyzer card (link pending).
- **Skills** list the brief's technologies. RAG, embeddings, vector search, output evaluation, SHAP, and AWS fundamentals sit under *Currently learning*, since no public repo shows them in use.
- **Coffee House** is described from its code: React, TypeScript, and Vite; coffee, matcha, and dessert menus; customisation, cart, and checkout; Supabase migrations for menus and orders. It isn't labelled GenAI, because no GenAI code was found. Status is "In progress", based on recent commits.
- **Narration claim "Protecting data matters"** is worded as a value, not a claim that every repo already does it (item 3).

## Projects shown

| Project | Repo | Evidence | Status label |
|---------|------|----------|--------------|
| Explainable Deep Learning IDS | `Explainable-Deep-Learning-Intrusion-Detection-System-` | `app1.py`: Streamlit, CNN/LSTM, LIME, Gemini explanation. Notebook: UNSW-NB15, GAN generator/discriminator | Prototype · runs locally |
| AI Resume Analyzer | pending (#5) | Owner's brief, old site | none |
| Documentation Module Extractor | `pulsegen-pma` | crawler, parser, module inference, DistilBART summariser with spaCy fallback, FastAPI, Streamlit, CLI, tests, Dockerfile | Prototype · has tests |
| Gemini-Powered Chatbot | `chatbot-powered-by-gemini` | Flask `/chat`, Gemini chat session with history, input check, error handling, Dockerfile | Prototype · runs locally |
| Come With Me For A Cup Of Coffee | `Come-With-Me-For-A-Cup-Of-Coffee` | `src/components/*`, `CartContext`, `supabase/migrations/*` | In progress |
| Electricity Consumption Forecasting | `Ml-power--pre.` | Notebook: stacked LSTM with dropout, scaling, weekly windows, chronological split, RMSE | Academic project |

Journey dates for the projects come from repository activity (2025 and 2025–2026).

## No metrics published

No accuracy, F1, RMSE values, or usage numbers appear on the site or in the narration.

/*
   About-me narration: the single source for the voice assistant.
   The on-page transcript, the AI voice (server), and the browser-voice fallback
   all read from this file. Edit the text here and nowhere else.

   Writing tips for the voice:
   - Keep sentences short. The AI voice reads in chunks of up to 200 characters,
     split on sentence boundaries.
   - Only state things that are true and that you can discuss in an interview.
   - After editing, regenerate the AI audio with `npm run voice:build`
     (changed sentences get new audio; unchanged ones stay cached).
*/
(function (root, factory) {
    const content = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = content;
    } else {
        root.ABOUT_ME = content;
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    return {
        title: 'Meet Gunavardhan',
        subtitle: 'Your personal portfolio introduction',
        summary: 'A four-minute spoken introduction: who I am, what I build, the projects I have worked on, and the kind of role I am looking for.',

        parts: [
            {
                id: 'hello',
                heading: 'Hello',
                text: [
                    "Hi, I'm Gunavardhan Tigulla. Thanks for visiting my portfolio.",
                    "I'm an aspiring software and Generative AI developer.",
                    'I study Computer Science and Engineering at SRM Institute of Science and Technology, in the 2022 to 2026 programme.',
                    'What I enjoy most is taking a practical problem and turning it into software that people can actually use.',
                    "In the next few minutes, I'll share how I build things, what I've worked on, and where I'd like to go next.",
                ],
            },
            {
                id: 'foundations',
                heading: 'Foundations',
                text: [
                    "Let's start with the foundations.",
                    'Python is the language I use most, and SQL is how I work with data.',
                    "I've also learned Java and JavaScript, along with tools like React, Angular, Flask, Spring Boot, and Node.js.",
                    "Here's how I see them fitting together.",
                    'A real application has an interface that people use. Behind it, an API handles each request.',
                    'That API reads and writes data in a database, like MySQL, PostgreSQL, or MongoDB.',
                    'If any one layer is unreliable, the whole experience suffers.',
                    'So I try to understand every layer, not just the one in front of me.',
                ],
            },
            {
                id: 'ai',
                heading: 'AI and Generative AI',
                text: [
                    'My strongest interest is artificial intelligence.',
                    "I've trained machine learning and deep learning models, and I've worked with natural language processing.",
                    "Lately, I've focused on applications built around large language models.",
                    "I've connected the Gemini API to my own projects, and I learned something quickly.",
                    'Calling a model is the easy part. Making its output useful and reliable is the real work.',
                    "That's why I'm now learning retrieval-augmented generation, prompt engineering, evaluation, and explainability.",
                ],
            },
            {
                id: 'projects',
                heading: 'Projects',
                text: [
                    'Here are a few projects.',
                    'My most detailed one is an explainable intrusion detection system.',
                    'I trained CNN and LSTM models on the UNSW-NB15 network traffic dataset.',
                    'Some attack types are rare, so I used a generative adversarial network to create extra training samples for them.',
                    "Each prediction is currently explained with LIME, and I'm adding SHAP explanations next.",
                    'A Gemini step then turns that explanation into plain language.',
                    'I also built a documentation module extractor with FastAPI and Streamlit.',
                    'And a Flask chatbot powered by Gemini, which remembers the conversation.',
                    'My AI Resume Analyzer uses NLP to compare a résumé with a job description.',
                    'SmartRoad is a concept for detecting potholes with a CNN, and tagging each one with its GPS location.',
                    'And on the backend side, I built a Student Management System in Java, with JDBC and MySQL.',
                ],
            },
            {
                id: 'mindset',
                heading: 'How I work',
                text: [
                    'Across all of this, I try to keep a few habits.',
                    'I make sure I understand the problem before I write any code.',
                    'I choose tools that fit the problem, not just the newest ones.',
                    'I test my assumptions, and when something breaks, I read the error carefully.',
                    'Protecting data matters too, from API keys to personal information.',
                    'I also try to explain my technical decisions clearly, so the team can trust them.',
                    "And with AI, I follow one rule above all. Evaluate it, and don't trust it blindly.",
                    "A confident answer isn't always a correct one.",
                ],
            },
            {
                id: 'next',
                heading: "What's next",
                text: [
                    "So, what's next?",
                    "I'm looking for entry-level roles in software development, backend engineering, AI and machine learning, or Generative AI.",
                    "I'd love to join a team where I can contribute, learn from experienced developers, and help build applications people can rely on.",
                ],
            },
            {
                id: 'thanks',
                heading: 'Thanks for listening',
                text: [
                    'Thanks for listening.',
                    'Feel free to explore my projects, download my résumé, or visit my GitHub profile to read the code.',
                    "And if you're hiring for a role that fits, I'd be glad to hear from you.",
                    "You'll find my contact details at the bottom of this page.",
                ],
            },
        ],
    };
});

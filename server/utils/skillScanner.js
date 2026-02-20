
import { extractText } from './textExtractor.js';

// Skill Dictionary (Matches frontend categories)
const SKILL_KEYWORDS = {
    // Category: Analysis
    'Data Analysis': ['data analysis', 'excel', 'spss', 'tableau', 'power bi', 'statistics', 'quantitative', 'regression'],
    'Financial Modeling': ['financial model', 'dcf', 'valuation', 'forecasting', 'budgeting', 'excel model'],
    'Market Research': ['market research', 'competitor analysis', 'segmentation', 'survey', 'qualitative'],

    // Category: Writing
    'Academic Writing': ['academic writing', 'thesis', 'dissertation', 'essay', 'citation', 'literature review'],
    'Content Creation': ['content creation', 'blogging', 'copywriting', 'creative writing', 'seo'],
    'Technical Writing': ['technical writing', 'documentation', 'manual', 'white paper', 'report'],

    // Category: Research
    'Critical Thinking': ['critical thinking', 'problem solving', 'logic', 'reasoning', 'argument components'],
    'Qualitative Research': ['qualitative', 'interview', 'focus group', 'case study', 'phenomenology'],

    // Category: Technical
    'Python Programming': ['python', 'pandas', 'numpy', 'scikit-learn', 'django', 'flask'],
    'Web Development': ['html', 'css', 'javascript', 'react', 'node.js', 'typescript', 'frontend', 'backend'],
    'Machine Learning': ['machine learning', 'ai', 'neural network', 'deep learning', 'nlp', 'computer vision'],

    // Category: Presentation
    'Public Speaking': ['public speaking', 'presentation', 'speech', 'communication', 'pitch'],
    'Visual Design': ['design', 'visual', 'graphic', 'uI/ux', 'figma', 'canva'],

    // Category: Leadership
    'Project Management': ['project management', 'agile', 'scrum', 'kanban', 'jira', 'trello', 'leadership'],
    'Team Collaboration': ['collaboration', 'teamwork', 'communication', 'interpersonal', 'conflict resolution']
};

const CATEGORY_MAP = {
    'Data Analysis': 'Analysis',
    'Financial Modeling': 'Analysis',
    'Market Research': 'Analysis',
    'Academic Writing': 'Writing',
    'Content Creation': 'Writing',
    'Technical Writing': 'Writing',
    'Critical Thinking': 'Research',
    'Qualitative Research': 'Research',
    'Python Programming': 'Technical',
    'Web Development': 'Technical',
    'Machine Learning': 'Technical',
    'Public Speaking': 'Presentation',
    'Visual Design': 'Presentation',
    'Project Management': 'Leadership',
    'Team Collaboration': 'Leadership'
};

export { extractText };

export const analyzeSkills = (text) => {
    const foundSkills = [];
    const textLower = text.toLowerCase();

    for (const [skillName, keywords] of Object.entries(SKILL_KEYWORDS)) {
        let matchCount = 0;
        for (const keyword of keywords) {
            if (textLower.includes(keyword)) {
                matchCount++;
            }
        }

        if (matchCount > 0) {
            let score = 75 + (matchCount * 15);
            if (score > 150) score = 150;

            let level = 'Beginner';
            if (score > 100) level = 'Intermediate';
            if (score > 130) level = 'Advanced';

            foundSkills.push({
                name: skillName,
                category: CATEGORY_MAP[skillName] || 'Technical',
                level,
                score,
                source: 'AI Scan'
            });
        }
    }

    return foundSkills.sort((a, b) => b.score - a.score).slice(0, 5);
};

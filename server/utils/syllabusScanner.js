
import { extractText } from './textExtractor.js';

const KEYWORDS = {
    exam: ['exam', 'midterm', 'final', 'test', 'quiz', 'assessment'],
    assignment: ['assignment', 'homework', 'paper', 'essay', 'report', 'project', 'submission'],
    reading: ['read', 'chapter', 'textbook', 'article'],
    presentation: ['presentation', 'speech', 'defense']
};

const MONTHS = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
    'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
];

export const scanSyllabus = async (file) => {
    const text = await extractText(file);
    const events = [];

    // Split text into lines for line-by-line analysis
    const lines = text.split('\n');
    let currentYear = new Date().getFullYear();

    for (const line of lines) {
        const lineLower = line.toLowerCase();

        // 1. Detect Date
        // Simple regex for "Month Day" or "Day Month" or "MM/DD"
        // This is a naive implementation; complex date parsing is hard without NLP

        let detectedDate = null;

        // Try to find a month
        const foundMonth = MONTHS.find(m => lineLower.includes(m));
        if (foundMonth) {
            // Check for day number around the month
            // Regex: Month followed by 1-2 digits, or 1-2 digits followed by Month
            const dateRegex = new RegExp(`(${foundMonth})\\s+(\\d{1,2})|(\\d{1,2})\\s+(${foundMonth})`, 'i');
            const match = lineLower.match(dateRegex);

            if (match) {
                // Construct date
                // We need to map string month to index
                const monthIndex = new Date(`${foundMonth} 1, 2000`).getMonth();
                const day = parseInt(match[2] || match[3]);

                if (!isNaN(day)) {
                    detectedDate = new Date(currentYear, monthIndex, day);
                    // If date is in past (more than 6 months?), maybe it's next year?
                    // Or if syllabus is old. Let's assume current academic year.
                }
            }
        }

        // 2. Detect Event Type & Title
        if (detectedDate) {
            let type = 'other';
            let title = 'Course Event';
            let weight = ''; // Try to find "20%" or "15 pts"

            for (const [key, words] of Object.entries(KEYWORDS)) {
                if (words.some(w => lineLower.includes(w))) {
                    type = key;
                    // Use the line as title, truncated
                    title = line.substring(0, 50).trim();
                    if (title.length === 50) title += '...';
                    break;
                }
            }

            // Check for weight
            const weightMatch = line.match(/(\d{1,3})%/);
            if (weightMatch) {
                weight = weightMatch[0];
            }

            // Only add if it looks like an event
            if (type !== 'other' || line.length < 100) {
                events.push({
                    title: title || 'Untitled Event',
                    date: detectedDate.toISOString(),
                    type,
                    course: detectedCourseName,
                    weight: weight || '0%'
                });
            }
        }
    }

    return events;
};

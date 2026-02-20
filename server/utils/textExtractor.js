
import { createRequire } from 'module';
import { Buffer } from 'node:buffer';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

export const extractText = async (file) => {
    const mimeType = file.mimetype;
    // Use secure_url if path is not a valid URL (Cloudinary often puts URL in path, but let's be safe)
    const filePath = file.path || file.secure_url;
    let text = '';

    console.log(`[TextExtractor] Starting extraction for: ${file.originalname}`);
    console.log(`[TextExtractor] MimeType: ${mimeType}`);

    try {
        if (!filePath) {
            throw new Error('File path/URL is missing in request file object.');
        }

        if (mimeType === 'application/pdf') {
            console.log('[TextExtractor] Fetching PDF...');
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText} (${response.status})`);

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            console.log('[TextExtractor] Parsing PDF...');
            // pdf-parse v1.1.1 usage
            const data = await pdf(buffer);
            text = data.text;
            console.log(`[TextExtractor] PDF Parsed. Text length: ${text?.length}`);

        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimeType === 'application/msword'
        ) {
            console.log('[TextExtractor] Fetching DOCX...');
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            console.log('[TextExtractor] Parsing DOCX...');
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
            console.log(`[TextExtractor] DOCX Parsed. Text length: ${text?.length}`);
        } else {
            console.log('[TextExtractor] Fetching Text/Other...');
            const response = await fetch(filePath);
            text = await response.text();
            console.log(`[TextExtractor] Text Fetched. Length: ${text?.length}`);
        }
    } catch (error) {
        console.error('[TextExtractor] Error:', error);
        throw error;
    }

    if (!text) return "";
    return text; // Return raw text, let caller handle casing
};

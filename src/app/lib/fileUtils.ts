import { FileAttachment } from '../store';

/**
 * Extracts a clean, readable filename from a URL or FileAttachment object.
 * Handles Cloudinary URLs, encoded characters, and fallback scenarios.
 * 
 * @param file - The file URL string or FileAttachment object
 * @returns The extracted filename
 */
export function getCleanFileName(file: string | FileAttachment | File | { name: string }): string {
    if (!file) return 'Unknown File';

    // Handle FileAttachment or File object (has .name property)
    if (typeof file !== 'string' && 'name' in file) {
        return file.name;
    }

    // Handle string (URL or path)
    if (typeof file === 'string') {
        try {
            // Check if it's a URL
            if (file.startsWith('http') || file.startsWith('blob:')) {
                const urlObj = new URL(file);
                const pathParts = urlObj.pathname.split('/');
                const encodedName = pathParts[pathParts.length - 1];
                return decodeURIComponent(encodedName);
            }

            // Handle relative paths or raw strings
            const parts = file.split('/');
            return parts[parts.length - 1] || file;
        } catch (e) {
            // Fallback for any parsing errors
            return file;
        }
    }

    return 'Unknown File';
}

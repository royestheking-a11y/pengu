
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
    console.log("Attempting to require pdf-parse...");
    const pdf = require('pdf-parse');
    console.log("Require successful.");
    console.log("Type of pdf:", typeof pdf);
    console.log("pdf structure:", pdf);

    if (typeof pdf === 'function') {
        console.log("pdf is a function (OK)");
    } else if (pdf && typeof pdf.default === 'function') {
        console.log("pdf.default is a function (OK)");
    } else {
        console.error("pdf is NOT a function and does NOT have a default export.");
    }
} catch (error) {
    console.error("Failed to require pdf-parse:", error);
}

try {
    console.log("Attempting to require mammoth...");
    const mammoth = require('mammoth');
    console.log("mammoth type:", typeof mammoth);
} catch (error) {
    console.error("Failed to require mammoth:", error);
}

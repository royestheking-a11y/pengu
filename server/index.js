import fs from 'fs';

/**
 * Render/Production Loader v2
 * High-reliability logging to capture silent crashes.
 */
function logSync(msg) {
    fs.writeSync(1, `--- [LOADER] ${msg}\n`);
}

logSync('Booting Node.js process...');

// Capture global errors that happen during async operations or ESM resolution
process.on('uncaughtException', (err) => {
    logSync('UNCAUGHT EXCEPTION DETECTED');
    fs.writeSync(2, `${err.stack}\n`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logSync('UNHANDLED REJECTION DETECTED');
    fs.writeSync(2, `${reason}\n`);
});

try {
    logSync('Attempting to import app.js...');
    await import('./app.js');
    logSync('app.js successfully imported and executed');
} catch (error) {
    logSync('FATAL BOOT ERROR CAUGHT');
    fs.writeSync(2, `Error Name: ${error.name}\n`);
    fs.writeSync(2, `Error Message: ${error.message}\n`);
    fs.writeSync(2, `Stack Trace: ${error.stack}\n`);
    process.exit(1);
}

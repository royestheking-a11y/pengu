/**
 * Render/Production Loader
 * Wraps the main application in a try-catch to reveal hidden boot-time errors.
 */
console.log('--- [LOADER] Booting Node.js ---');

try {
    console.log('--- [LOADER] Attempting to import app.js ---');
    await import('./app.js');
    console.log('--- [LOADER] app.js loaded successfully ---');
} catch (error) {
    console.error('--- [LOADER] FATAL BOOT ERROR ---');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Stack Trace:', error.stack);

    // Check for common ESM/Dependency issues
    if (error.message.includes('Cannot find module')) {
        console.error('TIP: A dependency might be missing from server/package.json');
    }

    process.exit(1);
}

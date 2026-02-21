/**
 * Pengu Assistant - Root Entry Point (index.js)
 * High-compatibility loader for Render/Cloud Platforms
 */
console.log('--- [BOOT] Starting Pengu Backend Loader ---');

try {
    console.log('--- [BOOT] Importing server logic from ./server/app.js ---');
    await import('./server/app.js');
    console.log('--- [BOOT] Server logic initialized successfully ---');
} catch (error) {
    console.error('--- [BOOT] CRITICAL ERROR DURING STARTUP ---');
    console.error('Type:', error.name);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}

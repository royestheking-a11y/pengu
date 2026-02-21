/**
 * Pengu Assistant - Root Entry Point
 * Used for Render/Vercel/Cloud Deployment
 */
import fs from 'fs';

function log(msg) {
    fs.writeSync(1, `--- [ROOT_SERVER] ${msg}\n`);
}

log('Starting initialization from root...');

try {
    log('Transitioning to server logic...');
    await import('./server/app.js');
    log('Server logic loaded successfully.');
} catch (error) {
    fs.writeSync(2, `FATAL ERROR: ${error.message}\n`);
    fs.writeSync(2, `STACK: ${error.stack}\n`);
    process.exit(1);
}

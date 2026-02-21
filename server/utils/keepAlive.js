import axios from 'axios';

/**
 * Render Keep-Alive Utility
 * Pings the server's own health endpoint every 5 minutes 
 * to prevent the service from sleeping due to inactivity.
 */
const startKeepAlive = () => {
    const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5001}`;
    const healthUrl = `${url}/api/system/health`;

    console.log(`--- [KEEP-ALIVE] Initializing ping loop for: ${healthUrl} ---`);

    // Ping every 5 minutes (300,000 ms)
    setInterval(async () => {
        try {
            console.log(`--- [KEEP-ALIVE] Sending periodic ping to ${healthUrl} ---`);
            const response = await axios.get(healthUrl);
            console.log(`--- [KEEP-ALIVE] Ping successful: Status ${response.status} ---`);
        } catch (error) {
            console.error(`--- [KEEP-ALIVE] Ping failed: ${error.message} ---`);
        }
    }, 300000);
};

export default startKeepAlive;

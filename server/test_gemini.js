import axios from 'axios';

const listModels = async () => {
    const keys = [
        'AIzaSyCIKvS5LDSBRcoHnAS-KbQP6U6JOgMElJA',
        'AIzaSyAT1YyiW0u7eplTrfs99sVnwLI384Bko6c'
    ];

    console.log("Listing available Gemini Models...\n");

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        console.log(`Checking models for Key ${i + 1} (...${key.slice(-4)}):`);
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
            const response = await axios.get(url, {
                headers: { 'Content-Type': 'application/json' }
            });

            const models = response.data.models.map(m => m.name);
            console.log(`✅ Success! Available models:`);
            models.forEach(m => console.log(`   - ${m}`));
            console.log('\n');
            break; // only need to check one valid key
        } catch (error) {
            console.error(`❌ Failed!`);
            if (error.response) {
                console.error(`Status code: ${error.response.status}`);
                console.error(`Error details: ${JSON.stringify(error.response.data, null, 2)}\n`);
            } else {
                console.error(`Error message: ${error.message}\n`);
            }
        }
    }
};

listModels();

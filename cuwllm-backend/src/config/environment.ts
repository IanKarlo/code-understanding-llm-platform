import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    apiKey: process.env.API_KEY,
    googleApiKey: process.env.GOOGLE_API_KEY
};

if (!config.googleApiKey) {
    throw new Error('GOOGLE_API_KEY is required in environment variables');
}

if (!config.apiKey) {
    throw new Error('API_KEY is required in environment variables');
} 
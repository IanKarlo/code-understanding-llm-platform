import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';

export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== config.apiKey) {
        res.status(403).json({ error: 'Forbidden: Invalid API Key' });
        return;
    }
    
    next();
}; 
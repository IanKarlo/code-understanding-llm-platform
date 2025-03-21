import express from 'express';
import bodyParser from 'body-parser';
import apiRoutes from './routes/api';
import { config } from './config/environment';

const app = express();

// Middleware
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for larger code snippets
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

app.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
}); 
import express from 'express';
import cors from 'cors';
import { newestIdeasHandler } from './handlers/ideas/newest';
import { log } from '../utils/log';
import { tokenBalanceHandler } from './handlers/token/balance';

export function startApi(): boolean {
    try {
        const app = express();
        const PORT = process.env.PORT;
    
        // Middleware
        app.use(cors());
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
    
        // Token routes
        app.get('/token/balance', tokenBalanceHandler);

        // Idea routes
        app.post('/ideas/newest', newestIdeasHandler);

        // Health check
        app.get('/health', (req, res) => {
            res.json({
                status: 'OK',
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            });
        });
    
        // Error handling middleware
        app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            log("error", err.stack);
            res.status(500).json({
                error: 'Something went wrong!',
                message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
            });
        });
    
        // Start server
        app.listen(PORT, () => {
            log("info", `Server started on port ${PORT}`);
        });

        return true;
    } catch (error) {
        log("error", error);
        return false;
    }
}
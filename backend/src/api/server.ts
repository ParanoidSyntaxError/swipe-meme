import express from 'express';
import cors from 'cors';
import { newestIdeasHandler } from './handlers/ideas/newest';

export function startApi(): boolean {
    try {
        const app = express();
        const PORT = process.env.PORT;
    
        // Middleware
        app.use(cors());
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
    
        app.get('/health', (req, res) => {
            res.json({
                status: 'OK',
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            });
        });

        app.get('/ideas/newest', newestIdeasHandler);
        //app.get('/ideas/page', );
    
        // Error handling middleware
        app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error(err.stack);
            res.status(500).json({
                error: 'Something went wrong!',
                message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
            });
        });
    
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });

        return true;
    } catch (error) {
        console.error("Error starting API:", error);
        return false;
    }
}
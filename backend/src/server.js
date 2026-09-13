import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import leadsRouter from './routes/leads.js';
import healthRouter from './routes/health.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));

if (config.allowedOrigins.length) {
    app.use(cors({ origin: config.allowedOrigins }));
}

app.use('/api/health', healthRouter);
app.use('/api/leads', leadsRouter);

// Simple admin page to view/manage leads until a real CRM is connected
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

// Serve the existing static site (index.html, css/, js/, images/) from this same server/origin,
// so the frontend's relative fetch('/api/leads') calls work with no CORS setup needed.
if (config.staticSiteDir) {
    const staticDir = path.resolve(__dirname, '..', config.staticSiteDir);
    app.use(express.static(staticDir));
}

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
    console.log(`Life Gym backend listening on port ${config.port} (${config.nodeEnv})`);
});

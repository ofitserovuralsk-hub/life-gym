import { config } from '../config.js';

export function requireAdminKey(req, res, next) {
    if (!config.adminApiKey) {
        return res.status(500).json({ error: 'ADMIN_API_KEY is not configured on the server' });
    }

    const key = req.header('x-admin-key');
    if (key !== config.adminApiKey) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
}

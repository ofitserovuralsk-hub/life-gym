import { Router } from 'express';
import { insertLead, listLeads, updateLeadStatus, countLeads } from '../db.js';
import { notifyTelegram } from '../telegram.js';
import { validateLead } from '../middleware/validateLead.js';
import { leadsRateLimit } from '../middleware/rateLimit.js';
import { requireAdminKey } from '../middleware/auth.js';

const router = Router();
const ALLOWED_STATUSES = ['new', 'contacted', 'converted', 'rejected'];

// Public: create a new lead from any of the site's forms (try-gym, booking, payment)
router.post('/', leadsRateLimit, validateLead, async (req, res) => {
    const body = req.body;

    const lead = insertLead({
        source: body.source,
        name: body.name.trim(),
        phone: body.phone.trim(),
        email: body.email?.trim() || null,
        comment: body.comment?.trim() || null,
        planName: body.planName || null,
        planDuration: body.planDuration || null,
        planAmount: body.planAmount || null,
        paymentMethod: body.paymentMethod || null,
        utmSource: body.utm?.source || null,
        utmMedium: body.utm?.medium || null,
        utmCampaign: body.utm?.campaign || null,
        utmContent: body.utm?.content || null,
        utmTerm: body.utm?.term || null,
        referrer: body.referrer || null,
        pageUrl: body.pageUrl || null,
        userAgent: req.headers['user-agent'] || null,
        ip: req.ip,
    });

    notifyTelegram(lead).catch((err) => console.error('notifyTelegram failed:', err));

    res.status(201).json({ ok: true, id: lead.id });
});

// Admin: list leads (until a real CRM is connected)
router.get('/', requireAdminKey, (req, res) => {
    const { limit, offset, source, status } = req.query;
    const leads = listLeads({
        limit: limit ? Number(limit) : 100,
        offset: offset ? Number(offset) : 0,
        source: source || undefined,
        status: status || undefined,
    });
    res.json({ leads, total: countLeads() });
});

// Admin: move a lead through a simple new -> contacted -> converted/rejected workflow
router.patch('/:id/status', requireAdminKey, (req, res) => {
    const { status } = req.body || {};
    if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` });
    }

    const lead = updateLeadStatus(Number(req.params.id), status);
    if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ ok: true, lead });
});

export default router;

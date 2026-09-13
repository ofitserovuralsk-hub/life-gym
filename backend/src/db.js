import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Plain JSON-file storage: zero native dependencies, so it always installs and
// runs the same way on any VPS/Node version. Fine for a gym's lead volume
// (synchronous reads/writes, no concurrent-write races since Node runs the
// request handlers on one thread). If volume ever grows large, swap the
// implementation of the functions below for a real database — every route
// only calls insertLead/getLeadById/listLeads/updateLeadStatus/countLeads.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'leads.json');

fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(dataFile)) {
    writeStore({ nextId: 1, leads: [] });
}

function readStore() {
    return JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
}

function writeStore(store) {
    fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
}

export function insertLead(lead) {
    const store = readStore();

    const record = {
        id: store.nextId,
        source: lead.source,
        status: 'new',
        name: lead.name,
        phone: lead.phone,
        email: lead.email || null,
        comment: lead.comment || null,
        plan_name: lead.planName || null,
        plan_duration: lead.planDuration || null,
        plan_amount: lead.planAmount || null,
        payment_method: lead.paymentMethod || null,
        utm_source: lead.utmSource || null,
        utm_medium: lead.utmMedium || null,
        utm_campaign: lead.utmCampaign || null,
        utm_content: lead.utmContent || null,
        utm_term: lead.utmTerm || null,
        referrer: lead.referrer || null,
        page_url: lead.pageUrl || null,
        user_agent: lead.userAgent || null,
        ip: lead.ip || null,
        created_at: new Date().toISOString(),
    };

    store.leads.push(record);
    store.nextId += 1;
    writeStore(store);

    return record;
}

export function getLeadById(id) {
    return readStore().leads.find((lead) => lead.id === id) || null;
}

export function listLeads({ limit = 100, offset = 0, source, status } = {}) {
    let leads = readStore().leads.slice().reverse(); // newest first

    if (source) leads = leads.filter((lead) => lead.source === source);
    if (status) leads = leads.filter((lead) => lead.status === status);

    return leads.slice(offset, offset + limit);
}

export function updateLeadStatus(id, status) {
    const store = readStore();
    const lead = store.leads.find((l) => l.id === id);
    if (!lead) return null;

    lead.status = status;
    writeStore(store);

    return lead;
}

export function countLeads() {
    return readStore().leads.length;
}

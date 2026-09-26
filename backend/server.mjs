import { createHash, randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const initialGoals = [
  { id: 'emergency', name: 'Emergency Fund', icon: 'shield', current: 1500, target: 5000, color: 'brand' },
  { id: 'family', name: 'Family', icon: 'heart', current: 800, target: 3000, color: 'accent' },
  { id: 'festival', name: 'Festival', icon: 'sparkles', current: 400, target: 2000, color: 'warning' },
  { id: 'education', name: 'Education', icon: 'book', current: 600, target: 4000, color: 'brand' },
];

const initialStats = {
  todayEarnings: 700,
  monthlyEarnings: 12600,
  availableBalance: 8450,
  emergencySavings: 1500,
  currentJob: 'Residential Construction',
  currentEmployer: 'Kumar Constructions',
};

const validRoles = new Set(['labourer', 'contractor', 'employer', 'skilledWorker']);
const workerRoles = new Set(['labourer', 'skilledWorker']);
const validAvailability = new Set(['available', 'unavailable']);
const validDailyStatuses = new Set(['todayTimeUp', 'workDone', 'sickLeave', 'festivalLeave']);
const sessionDuration = 30 * 24 * 60 * 60;

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function getCookie(request, name) {
  const cookies = request.headers.cookie?.split(';') ?? [];
  const prefix = `${name}=`;
  const item = cookies.map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(prefix));
  return item?.slice(prefix.length);
}

function getShramaId(profile) {
  const initials = profile.name.replace(/[^a-zA-Z ]/g, '').split(' ').filter(Boolean)
    .map((part) => part[0]).join('').slice(0, 3).toUpperCase().padEnd(2, 'X');
  const lastFour = profile.phone.replace(/\D/g, '').slice(-4).padStart(4, '0');
  return `SHR-${initials}-${lastFour}`;
}

function sendJson(response, status, payload, headers = {}) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  let raw = '';
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 4 * 1024 * 1024) throw Object.assign(new Error('Request body is too large.'), { status: 413 });
  }
  try {
    return JSON.parse(raw || '{}');
  } catch {
    throw Object.assign(new Error('Request body must be valid JSON.'), { status: 400 });
  }
}

export function createApiServer({ databasePath = process.env.DATABASE_PATH || '.data/shramasetu.sqlite' } = {}) {
  const resolvedDatabasePath = resolve(databasePath);
  mkdirSync(dirname(resolvedDatabasePath), { recursive: true });
  const database = new DatabaseSync(resolvedDatabasePath);
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      profile_json TEXT NOT NULL,
      savings_json TEXT NOT NULL,
      stats_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS savings_deposits (
      id INTEGER PRIMARY KEY,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      goal_id TEXT NOT NULL,
      amount INTEGER NOT NULL CHECK(amount > 0),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS worker_state (
      account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
      jobs_json TEXT NOT NULL,
      earnings_json TEXT NOT NULL,
      conversations_json TEXT NOT NULL,
      availability TEXT NOT NULL DEFAULT 'available',
      daily_work_status TEXT NOT NULL DEFAULT 'workDone'
    );
    CREATE TABLE IF NOT EXISTS worker_assignments (
      contractor_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      worker_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (contractor_id, worker_id)
    );
    CREATE TABLE IF NOT EXISTS employer_contractor_links (
      id TEXT PRIMARY KEY,
      employer_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      contractor_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      tender_id TEXT NOT NULL,
      tender_title TEXT NOT NULL,
      location TEXT NOT NULL,
      budget INTEGER NOT NULL CHECK(budget >= 0),
      scope_description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (employer_id, contractor_id, tender_id)
    );
  `);

  const accountBySession = database.prepare(`
    SELECT accounts.id, accounts.role, accounts.profile_json, accounts.savings_json, accounts.stats_json
    FROM sessions JOIN accounts ON accounts.id = sessions.account_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `);
  const accountById = database.prepare(`
    SELECT id, role, profile_json, savings_json, stats_json FROM accounts WHERE id = ?
  `);

  function normalizeWorkerData(data = {}) {
    return {
      jobs: Array.isArray(data.jobs) ? data.jobs.slice(0, 100) : [],
      earnings: Array.isArray(data.earnings) ? data.earnings.slice(0, 500) : [],
      conversations: Array.isArray(data.conversations) ? data.conversations.slice(0, 100) : [],
      availability: validAvailability.has(data.availability) ? data.availability : 'available',
      dailyWorkStatus: validDailyStatuses.has(data.dailyWorkStatus) ? data.dailyWorkStatus : 'workDone',
    };
  }

  function readWorkerData(accountId) {
    const row = database.prepare('SELECT * FROM worker_state WHERE account_id = ?').get(accountId);
    if (!row) return null;
    return {
      jobs: JSON.parse(row.jobs_json),
      earnings: JSON.parse(row.earnings_json),
      conversations: JSON.parse(row.conversations_json),
      availability: row.availability,
      dailyWorkStatus: row.daily_work_status,
    };
  }

  function saveWorkerData(accountId, data) {
    const workerData = normalizeWorkerData(data);
    database.prepare(`
      INSERT INTO worker_state (account_id, jobs_json, earnings_json, conversations_json, availability, daily_work_status)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(account_id) DO UPDATE SET
        jobs_json = excluded.jobs_json,
        earnings_json = excluded.earnings_json,
        conversations_json = excluded.conversations_json,
        availability = excluded.availability,
        daily_work_status = excluded.daily_work_status
    `).run(
      accountId,
      JSON.stringify(workerData.jobs),
      JSON.stringify(workerData.earnings),
      JSON.stringify(workerData.conversations),
      workerData.availability,
      workerData.dailyWorkStatus,
    );
    return workerData;
  }

  function accountSnapshot(row) {
    return {
      role: row.role,
      profile: JSON.parse(row.profile_json),
      savingsGoals: JSON.parse(row.savings_json),
      workerStats: JSON.parse(row.stats_json),
      workerData: readWorkerData(row.id),
    };
  }

  function currentAccount(request) {
    const token = getCookie(request, 'shrama_session');
    if (!token) return null;
    const row = accountBySession.get(hashToken(token), Math.floor(Date.now() / 1000));
    return row ? { id: row.id, ...accountSnapshot(row) } : null;
  }

  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', 'http://localhost');
      if (request.method === 'GET' && url.pathname === '/api/health') {
        return sendJson(response, 200, { status: 'ok' });
      }
      if (request.method === 'GET' && url.pathname === '/api/session') {
        const account = currentAccount(request);
        return sendJson(response, 200, {
          account: account ? {
            role: account.role,
            profile: account.profile,
            savingsGoals: account.savingsGoals,
            workerStats: account.workerStats,
            workerData: readWorkerData(account.id),
          } : null,
        });
      }
      if (request.method === 'GET' && url.pathname === '/api/workers') {
        const viewer = currentAccount(request);
        if (!viewer) return sendJson(response, 401, { error: 'Sign in as an employer to browse worker profiles.' });
        if (viewer.role !== 'contractor' && viewer.role !== 'employer') {
          return sendJson(response, 403, { error: 'Only employer accounts can browse worker profiles.' });
        }
        const workers = database.prepare(`
          SELECT accounts.id, accounts.role, accounts.profile_json, worker_state.availability
          FROM accounts
          LEFT JOIN worker_state ON worker_state.account_id = accounts.id
          WHERE role IN ('labourer', 'skilledWorker')
          ORDER BY created_at DESC
        `).all().map((row) => {
          const profile = JSON.parse(row.profile_json);
          const initials = getShramaId(profile).split('-')[1];
          return {
            id: row.id,
            category: row.role,
            name: profile.name,
            primarySkill: profile.primarySkill,
            experience: profile.experience || 'Experience not provided',
            location: profile.location,
            availability: row.availability === 'unavailable' ? 'Unavailable' : 'Available',
            workCount: 0,
            verified: false,
            avatar: initials,
            shramaId: getShramaId(profile),
          };
        });
        const assignedWorkerIds = database.prepare('SELECT worker_id FROM worker_assignments WHERE contractor_id = ?')
          .all(viewer.id)
          .map((row) => row.worker_id);
        return sendJson(response, 200, { workers, assignedWorkerIds });
      }
      if (request.method === 'POST' && url.pathname === '/api/workers/assign') {
        const contractor = currentAccount(request);
        if (!contractor || (contractor.role !== 'contractor' && contractor.role !== 'employer')) {
          return sendJson(response, 401, { error: 'Sign in as a contractor or employer to assign workers.' });
        }
        const { workerId } = await readJson(request);
        if (typeof workerId !== 'string' || !workerId.trim()) {
          return sendJson(response, 400, { error: 'Choose a valid worker profile.' });
        }
        const worker = database.prepare("SELECT id FROM accounts WHERE id = ? AND role IN ('labourer', 'skilledWorker')")
          .get(workerId);
        if (!worker) return sendJson(response, 404, { error: 'Worker profile was not found.' });
        database.prepare(`
          INSERT INTO worker_assignments (contractor_id, worker_id) VALUES (?, ?)
          ON CONFLICT(contractor_id, worker_id) DO NOTHING
        `).run(contractor.id, worker.id);
        return sendJson(response, 201, { workerId: worker.id, assigned: true });
      }
      if (request.method === 'GET' && url.pathname === '/api/contractors') {
        const employer = currentAccount(request);
        if (!employer || employer.role !== 'employer') {
          return sendJson(response, 403, { error: 'Sign in as an employer to browse contractors.' });
        }
        const contractors = database.prepare("SELECT id, profile_json FROM accounts WHERE role = 'contractor' ORDER BY created_at DESC")
          .all()
          .map((row) => {
            const profile = JSON.parse(row.profile_json);
            const initials = profile.name.replace(/[^a-zA-Z ]/g, '').split(' ').filter(Boolean)
              .map((part) => part[0]).join('').slice(0, 2).toUpperCase().padEnd(2, 'X');
            const specialties = Array.from(new Set([profile.primarySkill, ...(profile.skills || [])].filter(Boolean)));
            return {
              id: row.id,
              name: profile.name,
              companyName: profile.company || profile.name,
              avatar: initials,
              location: profile.location,
              workforceCapacity: profile.workersManaged || 0,
              specialties,
              trustScore: 0,
              rating: 0,
              pastProjectsCount: 0,
              licenseVerified: false,
              verified: false,
              matchScore: 0,
              accountBacked: true,
            };
          });
        return sendJson(response, 200, { contractors });
      }
      if (request.method === 'POST' && url.pathname === '/api/contractor-links') {
        const employer = currentAccount(request);
        if (!employer || employer.role !== 'employer') {
          return sendJson(response, 403, { error: 'Only employer accounts can invite contractors.' });
        }
        const { contractorId, tenderId, tenderTitle, location, budget, scopeDescription = '' } = await readJson(request);
        if (typeof contractorId !== 'string' || typeof tenderId !== 'string' || !tenderId.trim() ||
          typeof tenderTitle !== 'string' || !tenderTitle.trim() || typeof location !== 'string' || !location.trim() ||
          !Number.isSafeInteger(budget) || budget < 0 || typeof scopeDescription !== 'string') {
          return sendJson(response, 400, { error: 'Provide a contractor, tender, location, and valid budget.' });
        }
        const contractor = database.prepare("SELECT id FROM accounts WHERE id = ? AND role = 'contractor'").get(contractorId);
        if (!contractor) return sendJson(response, 404, { error: 'Contractor account was not found.' });
        database.prepare(`
          INSERT INTO employer_contractor_links
            (id, employer_id, contractor_id, tender_id, tender_title, location, budget, scope_description)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(employer_id, contractor_id, tender_id) DO NOTHING
        `).run(randomBytes(16).toString('hex'), employer.id, contractor.id, tenderId, tenderTitle.trim(), location.trim(), budget, scopeDescription.slice(0, 5000));
        const link = database.prepare(`
          SELECT id, contractor_id AS contractorId, tender_id AS tenderId, tender_title AS tenderTitle,
            location, budget, scope_description AS scopeDescription, status, created_at AS createdAt
          FROM employer_contractor_links
          WHERE employer_id = ? AND contractor_id = ? AND tender_id = ?
        `).get(employer.id, contractor.id, tenderId);
        return sendJson(response, 201, { link });
      }
      if (request.method === 'GET' && url.pathname === '/api/contractor-links/inbox') {
        const contractor = currentAccount(request);
        if (!contractor || contractor.role !== 'contractor') {
          return sendJson(response, 403, { error: 'Sign in as a contractor to view employer requests.' });
        }
        const links = database.prepare(`
          SELECT links.id, links.tender_id, links.tender_title, links.location, links.budget,
            links.scope_description, links.status, links.created_at, employers.profile_json
          FROM employer_contractor_links AS links
          JOIN accounts AS employers ON employers.id = links.employer_id
          WHERE links.contractor_id = ?
          ORDER BY links.created_at DESC
        `).all(contractor.id).map((row) => {
          const employerProfile = JSON.parse(row.profile_json);
          return {
            id: row.id,
            tenderId: row.tender_id,
            tenderTitle: row.tender_title,
            location: row.location,
            budget: row.budget,
            scopeDescription: row.scope_description,
            status: row.status,
            createdAt: row.created_at,
            employer: { name: employerProfile.name, company: employerProfile.company || employerProfile.name },
          };
        });
        return sendJson(response, 200, { links });
      }
      if (request.method === 'GET' && url.pathname === '/api/contractor-links/outbox') {
        const employer = currentAccount(request);
        if (!employer || employer.role !== 'employer') {
          return sendJson(response, 403, { error: 'Sign in as an employer to view contractor requests.' });
        }
        const links = database.prepare(`
          SELECT links.id, links.contractor_id, links.tender_id, links.tender_title,
            links.status, links.created_at, contractors.profile_json
          FROM employer_contractor_links AS links
          JOIN accounts AS contractors ON contractors.id = links.contractor_id
          WHERE links.employer_id = ?
          ORDER BY links.created_at DESC
        `).all(employer.id).map((row) => {
          const contractorProfile = JSON.parse(row.profile_json);
          return {
            id: row.id,
            contractorId: row.contractor_id,
            contractorName: contractorProfile.name,
            tenderId: row.tender_id,
            tenderTitle: row.tender_title,
            status: row.status,
            createdAt: row.created_at,
          };
        });
        return sendJson(response, 200, { links });
      }
      const contractorLinkMatch = url.pathname.match(/^\/api\/contractor-links\/([a-f0-9]+)$/);
      if (request.method === 'PATCH' && contractorLinkMatch) {
        const contractor = currentAccount(request);
        if (!contractor || contractor.role !== 'contractor') {
          return sendJson(response, 403, { error: 'Only the invited contractor can respond to this request.' });
        }
        const { status } = await readJson(request);
        if (status !== 'accepted' && status !== 'declined') {
          return sendJson(response, 400, { error: 'Choose accepted or declined.' });
        }
        const update = database.prepare(`
          UPDATE employer_contractor_links SET status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND contractor_id = ?
        `).run(status, contractorLinkMatch[1], contractor.id);
        if (!update.changes) return sendJson(response, 404, { error: 'Employer request was not found.' });
        return sendJson(response, 200, { id: contractorLinkMatch[1], status });
      }
      if (request.method === 'POST' && url.pathname === '/api/signin') {
        const { shramaId, phone, role } = await readJson(request);
        if (typeof shramaId !== 'string' || typeof phone !== 'string' || !/^\d{10}$/.test(phone) || !validRoles.has(role)) {
          return sendJson(response, 400, { error: 'Enter a valid ShramaID and 10-digit mobile number.' });
        }
        const row = database.prepare('SELECT id, role, profile_json, savings_json, stats_json FROM accounts')
          .all()
          .find((candidate) => {
            const profile = JSON.parse(candidate.profile_json);
            return candidate.role === role && profile.phone === phone && getShramaId(profile).toUpperCase() === shramaId.trim().toUpperCase();
          });
        if (!row) return sendJson(response, 401, { error: 'ShramaID and mobile number do not match.' });
        const token = randomBytes(32).toString('base64url');
        database.prepare('INSERT INTO sessions (token_hash, account_id, expires_at) VALUES (?, ?, ?)')
          .run(hashToken(token), row.id, Math.floor(Date.now() / 1000) + sessionDuration);
        const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
        return sendJson(response, 200, { account: accountSnapshot(row) }, {
          'Set-Cookie': `shrama_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionDuration}${secure}`,
        });
      }
      if (request.method === 'POST' && url.pathname === '/api/jobs/apply') {
        const account = currentAccount(request);
        if (!account || !workerRoles.has(account.role)) {
          return sendJson(response, 401, { error: 'Sign in with a worker account to apply for jobs.' });
        }
        const { jobId, workerData: initialState } = await readJson(request);
        if (typeof jobId !== 'string' || !jobId.trim()) {
          return sendJson(response, 400, { error: 'Choose a valid job before applying.' });
        }
        const workerData = readWorkerData(account.id) || saveWorkerData(account.id, initialState);
        const job = workerData.jobs.find((item) => item.id === jobId);
        if (!job) return sendJson(response, 404, { error: 'This job is no longer available.' });
        const updated = saveWorkerData(account.id, {
          ...workerData,
          jobs: workerData.jobs.map((item) => item.id === jobId ? { ...item, applied: true } : item),
        });
        return sendJson(response, 200, { workerData: updated });
      }
      if (request.method === 'POST' && url.pathname === '/api/messages') {
        const account = currentAccount(request);
        if (!account || !workerRoles.has(account.role)) {
          return sendJson(response, 401, { error: 'Sign in with a worker account to send messages.' });
        }
        const { conversationId, text, attachment, workerData: initialState } = await readJson(request);
        if (typeof conversationId !== 'string' || typeof text !== 'string' || !text.trim() || text.length > 2000) {
          return sendJson(response, 400, { error: 'Enter a message of up to 2,000 characters.' });
        }
        if (attachment && attachment.type === 'image' && (
          typeof attachment.url !== 'string' || attachment.url.length > 3 * 1024 * 1024 ||
          !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(attachment.url)
        )) {
          return sendJson(response, 400, { error: 'Choose a supported image smaller than 2 MB.' });
        }
        const workerData = readWorkerData(account.id) || saveWorkerData(account.id, initialState);
        const conversation = workerData.conversations.find((item) => item.id === conversationId);
        if (!conversation) return sendJson(response, 404, { error: 'Conversation was not found.' });
        const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const message = {
          id: `m-${randomBytes(8).toString('hex')}`,
          sender: 'worker',
          text: text.trim(),
          time,
          ...(attachment && ['image', 'location'].includes(attachment.type)
            ? { attachment: {
              type: attachment.type,
              name: typeof attachment.name === 'string' ? attachment.name.slice(0, 200) : undefined,
              ...(attachment.type === 'image' ? { url: attachment.url } : {}),
            } }
            : {}),
        };
        const updated = saveWorkerData(account.id, {
          ...workerData,
          conversations: workerData.conversations.map((item) => item.id === conversationId
            ? { ...item, messages: [...item.messages, message], lastMessage: text.trim(), time, unread: 0 }
            : item),
        });
        return sendJson(response, 200, { workerData: updated });
      }
      if (request.method === 'POST' && url.pathname === '/api/messages/read') {
        const account = currentAccount(request);
        if (!account || !workerRoles.has(account.role)) {
          return sendJson(response, 401, { error: 'Sign in with a worker account to update messages.' });
        }
        const { conversationId, workerData: initialState } = await readJson(request);
        const workerData = readWorkerData(account.id) || saveWorkerData(account.id, initialState);
        if (!workerData.conversations.some((item) => item.id === conversationId)) {
          return sendJson(response, 404, { error: 'Conversation was not found.' });
        }
        const updated = saveWorkerData(account.id, {
          ...workerData,
          conversations: workerData.conversations.map((item) => item.id === conversationId ? { ...item, unread: 0 } : item),
        });
        return sendJson(response, 200, { workerData: updated });
      }
      if (request.method === 'PATCH' && url.pathname === '/api/availability') {
        const account = currentAccount(request);
        if (!account || !workerRoles.has(account.role)) {
          return sendJson(response, 401, { error: 'Sign in with a worker account to update availability.' });
        }
        const { availability, dailyWorkStatus, workerData: initialState } = await readJson(request);
        if (!validAvailability.has(availability) || !validDailyStatuses.has(dailyWorkStatus)) {
          return sendJson(response, 400, { error: 'Choose a valid availability and daily work status.' });
        }
        const existing = readWorkerData(account.id) || normalizeWorkerData(initialState);
        const updated = saveWorkerData(account.id, {
          ...existing,
          availability,
          dailyWorkStatus: availability === 'available' ? 'workDone' : dailyWorkStatus,
        });
        return sendJson(response, 200, { workerData: updated });
      }
      if (request.method === 'POST' && url.pathname === '/api/register') {
        const { role, profile, workerData: initialState } = await readJson(request);
        if (!validRoles.has(role) || !profile || typeof profile !== 'object') {
          return sendJson(response, 400, { error: 'Choose a valid account type and provide a profile.' });
        }
        if (typeof profile.name !== 'string' || profile.name.trim().length < 2 || profile.name.length > 120) {
          return sendJson(response, 400, { error: 'Enter a valid name.' });
        }
        if (typeof profile.phone !== 'string' || !/^\d{10}$/.test(profile.phone)) {
          return sendJson(response, 400, { error: 'Mobile number must be exactly 10 digits.' });
        }
        if (typeof profile.primarySkill !== 'string' || !profile.primarySkill.trim() || typeof profile.location !== 'string' || !profile.location.trim()) {
          return sendJson(response, 400, { error: 'Skill and location are required.' });
        }

        const id = randomBytes(16).toString('hex');
        const token = randomBytes(32).toString('base64url');
        const savingsGoals = structuredClone(initialGoals);
        const workerStats = structuredClone(initialStats);
        database.prepare('INSERT INTO accounts (id, role, profile_json, savings_json, stats_json) VALUES (?, ?, ?, ?, ?)')
          .run(id, role, JSON.stringify(profile), JSON.stringify(savingsGoals), JSON.stringify(workerStats));
        database.prepare('INSERT INTO sessions (token_hash, account_id, expires_at) VALUES (?, ?, ?)')
          .run(hashToken(token), id, Math.floor(Date.now() / 1000) + sessionDuration);
        const workerData = workerRoles.has(role) ? saveWorkerData(id, initialState) : null;
        const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
        return sendJson(response, 201, {
          account: { role, profile, savingsGoals, workerStats, workerData },
        }, {
          'Set-Cookie': `shrama_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionDuration}${secure}`,
        });
      }
      if (request.method === 'POST' && url.pathname === '/api/savings/deposits') {
        const session = currentAccount(request);
        if (!session) return sendJson(response, 401, { error: 'Register again to start a demo account session.' });
        const { goalId, amount } = await readJson(request);
        if (!Number.isSafeInteger(amount) || amount <= 0) {
          return sendJson(response, 400, { error: 'Deposit amount must be a positive whole number.' });
        }
        let account;
        database.exec('BEGIN IMMEDIATE');
        try {
          const row = accountById.get(session.id);
          if (!row) {
            database.exec('ROLLBACK');
            return sendJson(response, 401, { error: 'Register again to start a demo account session.' });
          }
          account = { id: row.id, ...accountSnapshot(row) };
          const goal = account.savingsGoals.find((item) => item.id === goalId);
          if (!goal) {
            database.exec('ROLLBACK');
            return sendJson(response, 404, { error: 'Savings goal was not found.' });
          }
          if (amount > account.workerStats.availableBalance) {
            database.exec('ROLLBACK');
            return sendJson(response, 409, { error: 'Not enough available balance for this prototype action.' });
          }

          account.savingsGoals = account.savingsGoals.map((item) => item.id === goalId
            ? { ...item, current: item.current + amount }
            : item);
          account.workerStats.availableBalance -= amount;
          if (goalId === 'emergency') account.workerStats.emergencySavings += amount;
          database.prepare('UPDATE accounts SET savings_json = ?, stats_json = ? WHERE id = ?')
            .run(JSON.stringify(account.savingsGoals), JSON.stringify(account.workerStats), account.id);
          database.prepare('INSERT INTO savings_deposits (account_id, goal_id, amount) VALUES (?, ?, ?)')
            .run(account.id, goalId, amount);
          database.exec('COMMIT');
        } catch (error) {
          database.exec('ROLLBACK');
          throw error;
        }
        return sendJson(response, 200, {
          account: {
            role: account.role,
            profile: account.profile,
            savingsGoals: account.savingsGoals,
            workerStats: account.workerStats,
          },
        });
      }
      return sendJson(response, 404, { error: 'API route not found.' });
    } catch (error) {
      const status = Number.isInteger(error?.status) ? error.status : 500;
      if (status === 500) console.error(error);
      return sendJson(response, status, { error: status === 500 ? 'Internal server error.' : error.message });
    }
  });

  server.on('close', () => database.close());
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createApiServer();
  const port = Number(process.env.API_PORT || 3001);
  server.listen(port, '127.0.0.1', () => console.log(`ShramaSetu API listening on http://localhost:${port}`));
  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

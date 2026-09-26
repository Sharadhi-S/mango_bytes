import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { createApiServer } from './server.mjs';

const directory = mkdtempSync(join(tmpdir(), 'shramasetu-api-'));
let server;
let baseUrl;

before(async () => {
  server = createApiServer({ databasePath: join(directory, 'test.sqlite') });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  rmSync(directory, { recursive: true, force: true });
});

test('registration persists an account and savings deposits are validated and stored', async () => {
  const profile = {
    name: 'Ravi Kumar',
    phone: '9876543210',
    primarySkill: 'Mason',
    skills: ['Mason'],
    location: 'Mysuru',
    monthlyIncome: 18000,
  };
  const invalidNameResponse = await fetch(`${baseUrl}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'labourer', profile: { ...profile, name: 'S' } }),
  });
  assert.equal(invalidNameResponse.status, 400);

  const registrationResponse = await fetch(`${baseUrl}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'labourer', profile }),
  });
  assert.equal(registrationResponse.status, 201);
  const cookie = registrationResponse.headers.get('set-cookie').split(';')[0];
  const registered = await registrationResponse.json();
  assert.equal(registered.account.profile.name, profile.name);

  const sessionResponse = await fetch(`${baseUrl}/api/session`, { headers: { Cookie: cookie } });
  assert.equal(sessionResponse.status, 200);
  assert.equal((await sessionResponse.json()).account.profile.phone, profile.phone);

  const depositResponse = await fetch(`${baseUrl}/api/savings/deposits`, {
    method: 'POST',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ goalId: 'emergency', amount: 500 }),
  });
  assert.equal(depositResponse.status, 200);
  const deposited = (await depositResponse.json()).account;
  assert.equal(deposited.savingsGoals.find((goal) => goal.id === 'emergency').current, 2000);
  assert.equal(deposited.workerStats.availableBalance, 7950);
  assert.equal(deposited.workerStats.emergencySavings, 2000);

  const invalidResponse = await fetch(`${baseUrl}/api/savings/deposits`, {
    method: 'POST',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ goalId: 'emergency', amount: -5 }),
  });
  assert.equal(invalidResponse.status, 400);

  const concurrentDeposits = await Promise.all([1, 2].map(() => fetch(`${baseUrl}/api/savings/deposits`, {
    method: 'POST',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ goalId: 'family', amount: 5000 }),
  })));
  assert.deepEqual(concurrentDeposits.map((response) => response.status).sort(), [200, 409]);

  const anonymousResponse = await fetch(`${baseUrl}/api/savings/deposits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goalId: 'emergency', amount: 10 }),
  });
  assert.equal(anonymousResponse.status, 401);

  const skilledRegistration = await fetch(`${baseUrl}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'skilledWorker',
      profile: { ...profile, name: 'Ananya Sharma', phone: '9876543211', primarySkill: 'Chef' },
      workerData: {
        jobs: [{ id: 'j1', title: 'Restaurant Chef', applied: false }],
        earnings: [],
        conversations: [{ id: 'c1', name: 'Cafe North', unread: 1, lastMessage: 'Hello', time: 'Today', messages: [] }],
        availability: 'available',
        dailyWorkStatus: 'workDone',
      },
    }),
  });
  assert.equal(skilledRegistration.status, 201);
  const workerCookie = skilledRegistration.headers.get('set-cookie').split(';')[0];

  const workerDirectoryDenied = await fetch(`${baseUrl}/api/workers`, { headers: { Cookie: workerCookie } });
  assert.equal(workerDirectoryDenied.status, 403);

  const applicationResponse = await fetch(`${baseUrl}/api/jobs/apply`, {
    method: 'POST',
    headers: { Cookie: workerCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId: 'j1' }),
  });
  assert.equal(applicationResponse.status, 200);
  assert.equal((await applicationResponse.json()).workerData.jobs[0].applied, true);

  const messageResponse = await fetch(`${baseUrl}/api/messages`, {
    method: 'POST',
    headers: { Cookie: workerCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversationId: 'c1',
      text: 'I can start tomorrow.',
      attachment: { type: 'image', url: 'data:image/png;base64,aGVsbG8=', name: 'work.png' },
    }),
  });
  assert.equal(messageResponse.status, 200);
  const sentMessage = (await messageResponse.json()).workerData.conversations[0].messages[0];
  assert.equal(sentMessage.text, 'I can start tomorrow.');
  assert.equal(sentMessage.attachment.url, 'data:image/png;base64,aGVsbG8=');

  const readResponse = await fetch(`${baseUrl}/api/messages/read`, {
    method: 'POST',
    headers: { Cookie: workerCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId: 'c1' }),
  });
  assert.equal(readResponse.status, 200);
  assert.equal((await readResponse.json()).workerData.conversations[0].unread, 0);

  const availabilityResponse = await fetch(`${baseUrl}/api/availability`, {
    method: 'PATCH',
    headers: { Cookie: workerCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ availability: 'unavailable', dailyWorkStatus: 'sickLeave' }),
  });
  assert.equal(availabilityResponse.status, 200);
  assert.equal((await availabilityResponse.json()).workerData.dailyWorkStatus, 'sickLeave');

  const workerSession = await fetch(`${baseUrl}/api/session`, { headers: { Cookie: workerCookie } });
  const restoredWorkerData = (await workerSession.json()).account.workerData;
  assert.equal(restoredWorkerData.jobs[0].applied, true);
  assert.equal(restoredWorkerData.conversations[0].unread, 0);
  assert.equal(restoredWorkerData.availability, 'unavailable');

  const employerRegistration = await fetch(`${baseUrl}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'employer', profile: { ...profile, name: 'Rajesh Kumar', phone: '9876543210' } }),
  });
  assert.equal(employerRegistration.status, 201);
  const employerCookie = employerRegistration.headers.get('set-cookie').split(';')[0];
  const signInResponse = await fetch(`${baseUrl}/api/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shramaId: 'SHR-RK-3210', phone: '9876543210', role: 'employer' }),
  });
  assert.equal(signInResponse.status, 200);
  assert.equal((await signInResponse.json()).account.role, 'employer');
  const signedInCookie = signInResponse.headers.get('set-cookie').split(';')[0];
  const workerDirectory = await fetch(`${baseUrl}/api/workers`, { headers: { Cookie: signedInCookie || employerCookie } });
  assert.equal(workerDirectory.status, 200);
  const listedWorkers = await workerDirectory.json();
  const listedLabourer = listedWorkers.workers.find((worker) => worker.name === 'Ravi Kumar');
  assert.equal(listedLabourer.category, 'labourer');
  const listedChef = listedWorkers.workers.find((worker) => worker.name === 'Ananya Sharma');
  assert.equal(listedChef.primarySkill, 'Chef');
  assert.equal(listedChef.category, 'skilledWorker');
  assert.equal(listedChef.availability, 'Unavailable');
  assert.equal(listedChef.phone, undefined);

  const contractorRegistration = await fetch(`${baseUrl}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'contractor', profile: { ...profile, name: 'Kiran Das', phone: '9876543213' } }),
  });
  assert.equal(contractorRegistration.status, 201);
  const contractorCookie = contractorRegistration.headers.get('set-cookie').split(';')[0];
  const contractorDirectoryResponse = await fetch(`${baseUrl}/api/workers`, { headers: { Cookie: contractorCookie } });
  assert.equal(contractorDirectoryResponse.status, 200);
  const contractorDirectory = await contractorDirectoryResponse.json();
  const contractorLabourer = contractorDirectory.workers.find((worker) => worker.name === 'Ravi Kumar');
  const contractorSkilledWorker = contractorDirectory.workers.find((worker) => worker.name === 'Ananya Sharma');
  assert.ok(contractorLabourer);
  assert.ok(contractorSkilledWorker);

  const workerCannotAssign = await fetch(`${baseUrl}/api/workers/assign`, {
    method: 'POST',
    headers: { Cookie: workerCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ workerId: contractorLabourer.id }),
  });
  assert.equal(workerCannotAssign.status, 401);

  for (const worker of [contractorLabourer, contractorSkilledWorker]) {
    const assignment = await fetch(`${baseUrl}/api/workers/assign`, {
      method: 'POST',
      headers: { Cookie: contractorCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerId: worker.id }),
    });
    assert.equal(assignment.status, 201);
  }
  const assignedDirectoryResponse = await fetch(`${baseUrl}/api/workers`, { headers: { Cookie: contractorCookie } });
  const assignedDirectory = await assignedDirectoryResponse.json();
  assert.ok(assignedDirectory.assignedWorkerIds.includes(contractorLabourer.id));
  assert.ok(assignedDirectory.assignedWorkerIds.includes(contractorSkilledWorker.id));

  const registeredContractorsResponse = await fetch(`${baseUrl}/api/contractors`, { headers: { Cookie: signedInCookie } });
  assert.equal(registeredContractorsResponse.status, 200);
  const registeredContractors = await registeredContractorsResponse.json();
  const linkedContractor = registeredContractors.contractors.find((contractor) => contractor.name === 'Kiran Das');
  assert.ok(linkedContractor);
  assert.equal(linkedContractor.phone, undefined);

  const rfpResponse = await fetch(`${baseUrl}/api/contractor-links`, {
    method: 'POST',
    headers: { Cookie: signedInCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contractorId: linkedContractor.id,
      tenderId: 'tender-001',
      tenderTitle: 'Mysuru Site Renovation',
      location: 'Mysuru, Karnataka',
      budget: 250000,
      scopeDescription: 'Renovation, electrical work, and finishing.',
    }),
  });
  assert.equal(rfpResponse.status, 201);
  const rfp = (await rfpResponse.json()).link;

  const contractorInboxResponse = await fetch(`${baseUrl}/api/contractor-links/inbox`, { headers: { Cookie: contractorCookie } });
  assert.equal(contractorInboxResponse.status, 200);
  const contractorInbox = await contractorInboxResponse.json();
  assert.equal(contractorInbox.links[0].tenderTitle, 'Mysuru Site Renovation');
  assert.equal(contractorInbox.links[0].status, 'pending');
  assert.equal(contractorInbox.links[0].employer.company, 'Rajesh Kumar');

  const wrongContractorResponse = await fetch(`${baseUrl}/api/contractor-links/${rfp.id}`, {
    method: 'PATCH',
    headers: { Cookie: workerCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'accepted' }),
  });
  assert.equal(wrongContractorResponse.status, 403);

  const responseToRfp = await fetch(`${baseUrl}/api/contractor-links/${rfp.id}`, {
    method: 'PATCH',
    headers: { Cookie: contractorCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'accepted' }),
  });
  assert.equal(responseToRfp.status, 200);

  const employerOutboxResponse = await fetch(`${baseUrl}/api/contractor-links/outbox`, { headers: { Cookie: signedInCookie } });
  assert.equal(employerOutboxResponse.status, 200);
  const employerOutbox = await employerOutboxResponse.json();
  assert.equal(employerOutbox.links[0].contractorName, 'Kiran Das');
  assert.equal(employerOutbox.links[0].status, 'accepted');
});

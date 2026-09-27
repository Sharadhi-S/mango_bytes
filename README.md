# ShramaSetu (श्रमसेतु)

> **Work. Wages. Together.**  
> A ground-up workforce management and financial inclusion platform built by **Mango Bytes** for India’s unorganized construction and blue-collar sector.

---

## What is ShramaSetu?

If you've ever visited an active construction site in India — whether in Bengaluru, Mysuru, or Belagavi — you already know how chaotic the system is:
- **Labourers** get paid on daily cash vouchers or scrap paper diary entries. When they go to a bank, they have zero paperwork to prove their income or creditworthiness.
- **Contractors** juggle phone calls every morning at 6:30 AM trying to figure out which masons or bar benders will actually show up, while manually maintaining attendance muster on torn sheets.
- **Employers & Govt Authorities** (PWD, Smart City Missions, private builders) publish multi-crore tenders with hundreds of BOQ line items, but have no direct way to match with verified contractor fleets that have the exact crew sizes needed on day one.

**ShramaSetu** solves this by establishing a clear, verified three-tier workflow:

```
┌──────────────────────────────────────────────────────────────┐
│                    1. THE EMPLOYER                           │
│  (PWD, Smart City Mission, Commercial Real Estate Builders)  │
│  • Posts project tenders & work orders (with AI document OCR)│
│  • Pays transparent dynamic matching fee                     │
│  • Unlocks verified Contractor Profiles & sends formal RFPs  │
└──────────────────────────────┬───────────────────────────────┘
                               │
                       Tenders & Direct RFPs
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                   2. THE CONTRACTOR                          │
│        (Kumar Constructions, Shree Balaji Infra)             │
│  • Bids on & accepts Client RFPs                             │
│  • Rosters crew (Masons, Operators, Labourers)               │
│  • Runs daily muster (Present / Half / Absent)               │
│  • Pays daily & weekly wages directly to worker accounts     │
└──────────────────────────────┬───────────────────────────────┘
                               │
                      Jobs, Muster & Wages
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│             3. LABOURERS & SKILLED WORKERS                   │
│          (Ravi Kumar, Craftsmen, Electricians)               │
│  • Carries a verified digital identity (ShramaID)            │
│  • Receives job offers from verified contractors             │
│  • Sees live attendance-verified daily earnings              │
│  • Automated daily micro-savings (1% to 10%) into bank       │
└──────────────────────────────────────────────────────────────┘
```

---

## How Each Persona Works

### 1. The Employer Hub
- **AI Work Order Upload**: Drag-and-drop an official tender PDF or click *Load Sample PDF* to simulate neural parsing of BOQ line items, trades, and headcounts in under two seconds.
- **AI Tender Analysis**: Enter custom tender specs (budget, duration, trades) and preview real-time workforce allocation requirements.
- **Platform Fee Calculator**: Dynamic fee tiers based on estimated project value (e.g., ₹2,500 base for minor works up to ₹15,000 for major infrastructure projects).
- **Contractor Matching**: Review verified contractor fleets with PWD/CPWD licenses, worker capacity (60–110 workers), ratings, and send one-click RFPs.

### 2. The Contractor Operations Hub
- **Incoming Client RFPs**: Real-time sync with Employer tender awards. Review project scope, budget, and workforce demand, then accept the contract or message the employer directly.
- **Active Work Orders**: Monitor fulfillment progress (e.g., *88 / 100 workers deployed*), identify trade shortages before the scheduled start date, and launch the **Project Command Center**.
- **Daily Attendance Muster**: Record morning headcount across Civil, Mason, and Labourer teams with instant recalculation of total wage dues.
- **Wage Ledger**: One-click disbursement tracking to prevent wage leakage.

### 3. The Labourer Dashboard
- **Digital ShramaID**: Unique QR-enabled identifier (e.g. `SHR-RK-4821`) carrying proof of verified work history, trade qualifications, and emergency contacts.
- **Active Site Assignment**: See the currently assigned site and contractor (e.g. *Kumar Constructions*), today's attendance verification status, and daily earnings breakdown.
- **Smart Micro-Savings**: Daily automated micro-savings (1% to 10%) deducted from confirmed wages and stored toward targeted goals (health, tools, children's education).
- **Contractor Invitations**: Receive and accept formal site work offers from verified contractors.

### 4. Skilled Worker Dashboard
- **Career Studio**: Designed for electricians, equipment operators, masons, and technicians who don't have corporate CVs. Includes an AI resume builder, regional workplace translator, and computer basics guide.
- **Hyper-Local Matching**: Connect with contractors looking for specialized skills within a practical 5–15 km radius.
- **₹49 Membership**: Affordable quarterly access to skill-based insurance and verified contractor hiring feeds.

---

## Regional Accessibility & Multilingual Integration

ShramaSetu is designed from day one to be used on cheap Android phones on noisy job sites. It defaults strictly to English (`en`) and includes reactive, instant language switching across **7 Indian languages**:
1. **English** (`en`) — Default
2. **हिन्दी** (Hindi - `hi`)
3. **ಕನ್ನಡ** (Kannada - `kn`)
4. **தமிழ்** (Tamil - `ta`)
5. **తెలుగు** (Telugu - `te`)
6. **मराठी** (Marathi - `mr`)
7. **বাংলা** (Bengali - `bn`)

Switching the language in the top navigation bar immediately updates every single screen, modal, and button without losing your place or form progress.

---

## Tech Stack & Architecture

- **Frontend**: React 18 with TypeScript, Tailwind CSS, and Lucide React icons.
- **Bundler & Tooling**: Vite 5 with hot-module reload.
- **Backend API**: Clean Node.js HTTP server utilizing Node's built-in SQLite engine (`node:sqlite`) with Write-Ahead Logging (`WAL`) mode enabled for concurrent read/write stability.
- **State & Cross-Tab Sync**: React Context (`AppContext`) backed by `BroadcastChannel` APIs and `localStorage` so changes in one tab (e.g. Employer sending an RFP) immediately reflect across other tabs.
- **Theme Engine**: Complete light and dark contrast modes tailored for bright outdoor sunlight and low-light evening use.

---

## Running the Project Locally

### 1. Prerequisites
- **Node.js**: v20 or v22+ (recommended for native SQLite support)
- **npm**: v10+

### 2. Setup & Start
```bash
# Clone the repository
git clone https://github.com/Sharat2004/mango_bytes.git
cd mango_bytes

# Install dependencies
npm install

# Start both the backend API (port 3001) and Vite dev server (port 5173)
npm run dev
```

Open your browser at **http://localhost:5173**.

### 3. Verification & Testing
```bash
# Verify TypeScript types
npm run typecheck

# Run backend SQLite tests
npm run test:backend

# Run frontend Vitest test suite
npx vitest run

# Test production build
npm run build
```

---

## Presentation & Demo Tips

- **Switching Personas**: Click the persona switcher button in the top bar (or bottom navigation) to hop between *Employer*, *Contractor*, *Labourer*, and *Skilled Worker* in one click.
- **1-Click Tender Upload**: In Employer view, tap **AI Work Order Upload** and choose **Load Sample PDF** to demonstrate automated document extraction. If you don't want to wait through the analysis steps, click **Skip Wait & Open Confirm Page Now**.
- **Send RFP -> Receive as Contractor**: As an Employer, unlock contractors and click **Send Official RFP**. Switch to the Contractor persona — the new RFP will be waiting under **Incoming Client RFPs** ready to accept.
- **Reset to Defaults**: Click **Reset Fresh Data** in the persona modal at any time to clear custom changes and restore clean hackathon prototype models.

---

## Team

Crafted with dedication by **Mango Bytes**:
- **Sharat**
- **Abhishek**
- **Team Mango Bytes**

# 🐧 Pengu - Premium Academic OS & Career Accelerator

Pengu is a next-generation academic operating system and gig-economy platform designed to bridge the gap between struggling students and top 1% academic experts. Operating on a robust **Play-to-Earn** and **Learn-to-Earn** ecosystem, Pengu offers a holistic suite of tools encompassing Academic Triage, Global Scholarship Discovery, Career Acceleration, and Gamified Mental Wellness.

---

## 🌟 Platform Vision
To create a borderless, intelligent ecosystem where ambitious students and world-class experts collaborate in real-time. By integrating AI-driven problem-solving, structured milestones, and gamified incentives, Pengu ensures secure, high-quality academic success.

---

## 📱 Core Ecosystems & Features (A to Z)

### 🎓 1. Student Portal (The Academic OS)
The heart of the student experience, designed to organize, solve, and accelerate academic goals.

*   **Universal Problem Solver (AI Ticket System)**: A multi-modal conversational AI intake system where students can describe issues, drop files (PDFs, Images, Data), and receive a quote and matched expert within an hour. 
*   **Global Scholarships (Smart Match)**: An AI-powered discovery board parsing over active scholarships globally. Uses CGPA, English proficiency (IELTS), and demographic data to recommend high-probability funding opportunities (Full, Partial, Exchange).
*   **Career Vault**: A premier career acceleration module featuring proprietary, ATS-optimized Resume/CV templates, cover letter builders, and hidden job market discovery tools.
*   **Pengu Arcade (Play-to-Earn)**: A premium 3D web gaming zone where students compete on global leaderboards to earn **Pengu Coins**. These coins can be converted into BDT to fund their service requests.
*   **Mood Swing Tracker**: A localized mental wellness tracker where students log their academic stress (from "Burnt Out" to "Zen"). Provides weekly insights and prompts proactive administrative support for burnt-out users.
*   **Live Order Tracking**: A transparent pipeline showing the real-time status of academic orders (Pending, Scoping, In Progress, Final Review, Delivered), complete with milestone-based payment systems.
*   **Direct Expert Chat**: Secure, anonymized real-time chat with assigned experts for rapid iteration and feedback.

### 💼 2. Expert Portal (The Gig Engine)
A dedicated environment for top-tier academics and professionals to monetize their knowledge.

*   **Dynamic Task Board**: A Kanban-style interface featuring available user tickets. Experts can accept tasks based on their specialized taxonomy (e.g., Computer Science, Data Analysis, Essay Formatting).
*   **Active Missions & Milestones**: A structured workspace to track ongoing projects, communicate with students via integrated chat, and submit milestone deliverables for instant payout.
*   **Premium Gamified Payouts**: Uses a dynamic commission system (default 30% platform fee, 70% expert payout). High-performing experts unlock multipliers and badges (e.g., "Speed Demon", "Quality King").
*   **AI-Assisted Workflow**: Built-in AI grading and research assistants embedded directly into the expert workspace to accelerate delivery times while maintaining extreme quality.
*   **Automated Invoicing**: Frictionless financial tracking, summarizing weekly payouts and lifetime earnings directly to integrated mobile banking (e.g., bKash, SSLCommerz).

### 🛠️ 3. Admin Control Center (The Overmind)
A powerful God-Mode dashboard for platform owners to regulate the marketplace, configure economics, and monitor health.

*   **Universal Ticket Manager**: Route, price, and assign incoming student tickets to the appropriate experts.
*   **Financial & Economics Engine**: Total control over the platform's liquidity. Adjust global commission rates, conversion ratios (e.g., 1000 Coins = 100 BDT), and monitor Net Growth vs. Platform Profit.
*   **Scholarship & Career Content CMS**: A rich GUI to create, edit, and publish dynamic Scholarship entries and Career Vault templates in real-time.
*   **User & Expert Auditing**: Oversee the entire user base. Verify expert credentials, monitor student satisfaction, and execute manual interventions (bans, refunds, promotions).
*   **Arcade Configurator**: Reset leaderboards, distribute coin rewards, and launch new game partnerships.
*   **Global Architecture Overview**: Track real-time server health, API latency, and database scaling metrics.

---

## ⚙️ Technical Architecture

Pengu is built on the **MERN** stack (MongoDB, Express, React, Node.js) with deep integrations of modern Web3-style web technologies.

### Frontend (React + Vite)
*   **Framework**: React 18, utilizing functional components and custom Hooks.
*   **Styling**: TailwindCSS, prioritizing a "Premium Glassmorphism" aesthetic with custom deep browns (`#3E2723`) and amber accents (`#F59E0B`). 
*   **Animations**: Framer Motion for highly fluid, 60fps micro-interactions, page transitions, and responsive drawers.
*   **State Management**: Zustand for lightweight, high-performance global store (Auth, Wallet, Live Counters).
*   **Routing**: React Router v6 for dynamic, protected nested routing.
*   **Icons & Assets**: Lucide React for crisp, scalable vectors. 
*   **SEO**: `react-helmet-async` for dynamic OpenGraph, structured data, and meta injection across dynamic pages (like Scholarships and Legal).

### Backend (Node.js + Express)
*   **Architecture**: RESTful API with a highly modular MVC structure.
*   **Database**: MongoDB (Mongoose ODM) for flexible schema design (Users, Tickets, Chat Messages, Scholarships, Transactions).
*   **Authentication**: Dual-layer utilizing JSON Web Tokens (JWT) for session management and Google OAuth for frictionless 1-click onboarding.
*   **Real-time Infrastructure**: Socket.io for synchronous bidirectional communication (Direct Messaging, Live Order Status Updates, Notification Broadcasting).
*   **AI & ML Integration**: Groq Cloud API for ultra-fast, multi-modal conversational processing within the Universal Problem Solver.
*   **File Storage**: Cloudinary integration for scalable, optimized image and document storage.

---

## 🚀 Deployment & Production (Render + Vercel)

The platform is designed to run with a **Vercel** frontend and a **Render** backend.

### 1. Backend (Render) Configuration
To ensure the backend stays active on Render's free tier, a **Keep-Alive** mechanism is natively implemented.

**Mandatory Environment Variable:**
*   `RENDER_EXTERNAL_URL`: Your public Render service URL (e.g. `https://your-api.onrender.com`).
  *   *Why?* Used by the internal ping-loop to prevent the instance from sleeping.

**Other Required Variables (`.env` file):**
*   `MONGO_URI`: MongoDB connection string.
*   `JWT_SECRET`: Secure string for auth tokens.
*   `FRONTEND_URL`: Your production Vercel URL (e.g., `https://pengu.work.gd`).
*   `NODE_ENV`: Set to `production`.
*   `GROQ_API_KEY`: For the Universal Problem Solver AI.
*   `CLOUDINARY_URL`: For asset storage.
*   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: For OAuth.

### 2. Frontend (Vercel) Configuration
**Environment Variables:**
*   `VITE_API_BASE_URL`: Your Render API URL (e.g. `https://your-api.onrender.com/api`).
*   `VITE_SOCKET_URL`: Your Render base websocket URL (e.g. `https://your-api.onrender.com`).

---

## 💻 Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/pengu.git
   cd pengu
   ```

2. **Install Dependencies**
   *Note: Pengu uses a monorepo structure.*
   ```bash
   # Install Frontend
   npm install

   # Install Backend
   cd server
   npm install
   ```

3. **Configure Environment Variables**
   *   Create a `.env` in the root (for frontend) matching `VITE_API_BASE_URL`.
   *   Create a `.env` in `server/` matching the required backend variables.

4. **Run the Development Servers**
   Open two terminals:
   ```bash
   # Terminal 1: Backend
   cd server
   npm run dev

   # Terminal 2: Frontend
   npm run dev
   ```

5. **Access the Application**
   Open `http://localhost:5173` in your browser.

---

## 🛡️ Security & Integrity (Honor Code)
Pengu strictly enforces a Zero-Tolerance policy regarding academic fraud. The platform is designed to be a **collaborative tutor and accelerator**, not a cheating service.
*   **Data Minimization**: Strict PII handling for scholarship demographics.
*   **Encrypted Paylines**: bKash and transactional routing are end-to-end secured.
*   **Audit Logging**: All expert deliveries and AI generative outputs are logged and hash-checked to ensure originality.

---

## 🔮 Future Roadmap (v2.0)
*   **Pengu Mobile (React Native)**: Native iOS and Android applications.
*   **Video Consultations**: Integrated WebRTC for 1-on-1 live expert video calls.
*   **Crypto Withdrawals**: Enabling experts to withdraw earnings in USDC.
*   **Enterprise Dashboard**: B2B portal for Universities to sponsor student accounts.
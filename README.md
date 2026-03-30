# Stratify

Stratify is an AI-driven LinkedIn content strategy and scheduling platform. It uses cutting-edge LLMs to analyze user niches, target audiences, and goals to generate high-performing hooks, insights, and weekly post drafts.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database & Auth**: Supabase
- **AI Engine**: Groq (Llama 3.3 70B)
- **Styling**: Tailwind CSS & shadcn/ui
- **Data Enrichment**: Apify (LinkedIn Profile Data)
- **Emails**: Resend

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Copy the example environment file and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```

3. **Database Setup**:
   Apply the migrations located in the `/supabase/migrations` folder to set up your Supabase project.

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Infrastructure

The application relies on several core database tables:
- `profiles`: User information and settings
- `onboarding`: User's niche, audience, and goals
- `content_history`: Weekly generated insights and post drafts
- `usage_tracking`: Generation quota tracking
- `post_feedback`: Analytics and performance tracking for generated content

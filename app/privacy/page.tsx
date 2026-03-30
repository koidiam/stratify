import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Stratify',
  description: 'Stratify privacy policy and data handling practices.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-12 transition-colors">
          <ArrowLeft size={16} />
          Back to home
        </Link>
        
        <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Data Collection</h2>
            <p className="mb-4">
              When you use Stratify, we collect the minimal data necessary to provide you with high-quality content generation and analytics. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Authentication data (via Supabase).</li>
              <li>Your explicitly provided target audience, writing tone, and reference LinkedIn content.</li>
              <li>Usage metrics (such as how many generations you use per week) for billing and rate limiting.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Purpose of Collection</h2>
            <p className="mb-4">
              We exclusively use the collected data to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide and improve the Strategy Engine logic.</li>
              <li>"Calibrate" the AI specifically for your brand voice.</li>
              <li>Authenticate your account and maintain security constraints.</li>
            </ul>
            <p className="mt-4">
              Your profile data and generated content are never sold or shared with any third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Third-Party Services</h2>
            <p className="mb-4">
              To power the infrastructure backing Stratify, we securely integrate with industry-leading third-party services:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Supabase:</strong> For database hosting, authentication, and secure data storage. They adhere to industry-standard data protection policies.</li>
              <li><strong>LLM Providers (e.g. Groq, Anthropic):</strong> For parsing text and generating content. Prompts include your insights but are not used by model providers to train their foundational models.</li>
              <li><strong>Live Data Extraction (Apify):</strong> When you leverage competitor analysis, our background scrapers parse public LinkedIn data securely. No PII is collected during viral post sweeps.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Your Rights</h2>
            <p className="mb-4">
              You have full ownership of your data. If you decide to close your account, you can request full deletion of your profile, tone references, and generation history from our Supabase tables. 
            </p>
          </section>

          <section className="pt-8 text-sm">
            <p>Last updated: March 2026</p>
          </section>
        </div>
      </div>
    </div>
  );
}

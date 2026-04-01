import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Stratify',
  description: 'Stratify terms of service, billing, and usage policies.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-12 transition-colors">
          <ArrowLeft size={16} />
          Back to home
        </Link>
        
        <h1 className="text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Service Description</h2>
            <p className="mb-4">
              Stratify is an AI-powered LinkedIn content strategy platform. It generates weekly insights, hooks,
              and ready-to-publish drafts tailored to your professional niche and brand tone.
            </p>
            <p className="mb-4">
              The service uses Groq (large language model provider) for content generation, Apify for optional
              LinkedIn data enrichment on eligible plans, and Supabase for authentication and secure data storage.
            </p>
            <p>
              By creating an account and using Stratify, you agree to the following terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Billing & Refunds</h2>
            <p className="mb-4">
              Stratify offers a Free plan with limited weekly generations and paid plans (Basic, Pro) billed
              monthly through Lemon Squeezy, our payment processor.
            </p>
            <p className="mb-4">
              When you upgrade, your new plan takes effect immediately. You gain access to the features and limits
              associated with your chosen plan for the duration of the billing cycle.
            </p>
            <p className="mb-4">
              If you cancel your subscription, your paid plan remains active until the end of the current billing
              period. After that, your account automatically reverts to the Free plan. No partial refunds are
              issued for unused time within a billing cycle.
            </p>
            <p>
              As a digital service, refunds are handled on a case-by-case basis. If you experience a technical
              issue that prevents you from using the service, contact us and we will work to resolve it or issue
              a refund where appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Data & Privacy</h2>
            <p className="mb-4">
              We collect the minimum data necessary to provide the service: your authentication credentials (managed
              by Supabase), onboarding preferences (niche, tone, target audience), generation history, and usage
              metrics for billing and rate limiting.
            </p>
            <p className="mb-4">
              Your data is processed by third-party services that power Stratify — specifically Groq for AI generation,
              Apify for public LinkedIn data enrichment, and Supabase for storage. None of these providers use your
              data to train their models.
            </p>
            <p>
              We do not sell, share, or distribute your personal data or generated content to third-party advertisers.
              For full details, see our <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors underline">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Contact</h2>
            <p className="mb-4">
              For support, billing questions, or any concerns about the service, reach us at:
            </p>
            <p className="font-medium text-foreground">
              stratify00@gmail.com
            </p>
            <p className="mt-4">
              We aim to respond to all inquiries within 48 hours during business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Account & Cancellation</h2>
            <p className="mb-4">
              You may cancel your subscription at any time through the Lemon Squeezy customer portal, accessible
              from your Settings page. Cancellation takes effect at the end of the current billing period.
            </p>
            <p className="mb-4">
              If you wish to delete your account entirely, send a request to stratify00@gmail.com. Upon confirmation,
              we will permanently remove your profile, onboarding data, generation history, and usage records from
              our database.
            </p>
            <p>
              We reserve the right to suspend accounts that violate these terms, engage in automated abuse of the
              service, or attempt to circumvent usage limits.
            </p>
          </section>

          <section className="pt-8 border-t border-border text-sm space-y-2">
            <p>Last updated: April 2026</p>
            <p className="text-xs text-muted-foreground/60">
              This document outlines the terms under which Stratify operates. It is not legal advice.
              For questions about your rights, consult a qualified legal professional.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

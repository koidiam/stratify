import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact | Stratify',
  description: 'Get in touch with the Stratify team for support, billing, or general inquiries.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-12 transition-colors">
          <ArrowLeft size={16} />
          Back to home
        </Link>
        
        <h1 className="text-4xl font-bold tracking-tight mb-8">Contact</h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <p className="text-lg leading-relaxed mb-6">
              Have a question about your account, billing, or the platform? We're here to help.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Mail size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Email Support</h2>
                <p className="text-sm text-muted-foreground">Best for billing, account, and feature questions</p>
              </div>
            </div>
            <a 
              href="mailto:support@stratify.dev" 
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors text-lg"
            >
              support@stratify.dev
            </a>
            <p className="mt-4 text-sm">
              We aim to respond within 48 hours during business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Common Topics</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Billing & Subscriptions</span>
                  <span className="text-sm ml-1">— plan changes, invoices, refund requests</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Account Management</span>
                  <span className="text-sm ml-1">— deletion, profile updates, login issues</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Feature Questions</span>
                  <span className="text-sm ml-1">— generation, insights, plan differences</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Bug Reports</span>
                  <span className="text-sm ml-1">— include steps to reproduce and your plan type</span>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

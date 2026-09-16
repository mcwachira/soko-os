import { Metadata } from 'next';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Soko-OS collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div>
      <section className="border-b-4 border-black bg-warning">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg font-bold text-foreground/80 max-w-2xl">
              Your privacy is important to us. This policy explains how Soko-OS handles your data.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black mb-2">Information We Collect</h2>
              <p className="font-bold text-muted-foreground">
                We collect information you provide directly to us, such as your name, email address, business name, and payment information when you sign up for Soko-OS.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-black mb-2">How We Use Your Information</h2>
              <p className="font-bold text-muted-foreground">
                We use your information to provide, maintain, and improve Soko-OS. We also use it to communicate with you about updates, security alerts, and support messages.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-black mb-2">Data Storage & Security</h2>
              <p className="font-bold text-muted-foreground">
                Your data is stored securely using industry-standard encryption. We take reasonable measures to protect your information from unauthorized access, alteration, or disclosure.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-black mb-2">Sharing Your Information</h2>
              <p className="font-bold text-muted-foreground">
                We do not sell your personal data. We may share information with service providers who assist us in operating Soko-OS, subject to strict confidentiality obligations.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-black mb-2">Your Rights</h2>
              <p className="font-bold text-muted-foreground">
                You may access, update, or delete your account information at any time. Contact us at hello@soko-os.com for any privacy-related requests.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-black mb-2">Updates to This Policy</h2>
              <p className="font-bold text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of significant changes via email or through the Soko-OS platform.
              </p>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-4 bg-muted border-2 border-black rounded-xl p-6 shadow">
            <div className="p-2 bg-info border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)]">
              <Shield className="h-5 w-5" />
            </div>
            <p className="font-bold text-sm">
              Questions about privacy? Email us at <span className="font-black">hello@soko-os.com</span>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

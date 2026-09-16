import { Metadata } from 'next';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the terms and conditions for using Soko-OS services.',
};

export default function TermsPage() {
  return (
    <div>
      <section className="border-b-4 border-black bg-warning">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
              Terms of Service
            </h1>
            <p className="mt-4 text-lg font-bold text-foreground/80 max-w-2xl">
              By using Soko-OS, you agree to the following terms and conditions.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black mb-2">Acceptance of Terms</h2>
              <p className="font-bold text-muted-foreground">
                By accessing or using Soko-OS, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-black mb-2">Use of Services</h2>
              <p className="font-bold text-muted-foreground">
                Soko-OS grants you a limited, non-exclusive license to use the platform for your internal business operations. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-black mb-2">Subscriptions & Payments</h2>
              <p className="font-bold text-muted-foreground">
                Paid plans are billed in advance on a monthly or annual basis. Fees are non-refundable except as required by law. We may change pricing with reasonable notice.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-black mb-2">Data Ownership</h2>
              <p className="font-bold text-muted-foreground">
                You retain full ownership of all data you enter into Soko-OS. We claim no ownership over your business data and will not use it for any purpose other than providing and improving the service.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-black mb-2">Limitation of Liability</h2>
              <p className="font-bold text-muted-foreground">
                Soko-OS is provided on an as-is basis. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-black mb-2">Governing Law</h2>
              <p className="font-bold text-muted-foreground">
                These terms are governed by the laws of Kenya. Any disputes arising from these terms shall be resolved in the courts of Nairobi, Kenya.
              </p>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-4 bg-muted border-2 border-black rounded-xl p-6 shadow">
            <div className="p-2 bg-info border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)]">
              <FileText className="h-5 w-5" />
            </div>
            <p className="font-bold text-sm">
              For legal inquiries, contact us at <span className="font-black">hello@soko-os.com</span>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

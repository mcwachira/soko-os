import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Globe, FileText, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { countries } from '@/config/countries';

export const metadata: Metadata = {
  title: 'Compliance & Security',
  description: 'Learn about Soko-OS compliance, tax capabilities, fiscalization, and data security for African markets.',
};

export default function CompliancePage() {
  const supportedCountries = countries.filter((c) => !c.comingSoon);

  return (
    <div>
      <section className="border-b-4 border-black bg-warning">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
              Compliance & Security
            </h1>
            <p className="mt-4 text-lg font-bold text-foreground/80 max-w-2xl">
              Built for African regulatory environments. Soko-OS helps you stay compliant, secure, and audit-ready.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-muted border-2 border-black rounded-xl p-6 shadow">
              <div className="p-2 bg-info border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)] w-fit mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black mb-2">Countries Supported</h2>
              <p className="font-bold text-muted-foreground mb-4">
                Active deployments in Kenya, Nigeria, and South Africa, with more markets launching soon.
              </p>
              <div className="flex flex-wrap gap-2">
                {supportedCountries.map((c) => (
                  <span key={c.id} className="bg-secondary-background border-2 border-black rounded-full px-3 py-1 text-sm font-black">
                    {c.flag} {c.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-muted border-2 border-black rounded-xl p-6 shadow">
              <div className="p-2 bg-info border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)] w-fit mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black mb-2">Tax Capabilities</h2>
              <p className="font-bold text-muted-foreground mb-4">
                Automated VAT and tax calculations with country-specific rules built in.
              </p>
              <ul className="space-y-2">
                {supportedCountries.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2 border-b-2 border-black last:border-0">
                    <span className="font-bold">{c.flag} {c.taxName}</span>
                    <span className="font-black text-sm">{c.taxRate}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-muted border-2 border-black rounded-xl p-6 shadow">
              <div className="p-2 bg-info border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)] w-fit mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black mb-2">Fiscalization</h2>
              <p className="font-bold text-muted-foreground">
                KRA eTIMS integration in Kenya and SARS eFiling readiness in South Africa. Audit trails, compliance logs, and automatic rate updates ensure you stay ready for inspections.
              </p>
            </div>

            <div className="bg-muted border-2 border-black rounded-xl p-6 shadow">
              <div className="p-2 bg-info border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)] w-fit mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black mb-2">Data & Security</h2>
              <p className="font-bold text-muted-foreground">
                All data encrypted in transit and at rest. Regular backups, industry-standard security practices, and strict data handling policies. We never share your data with third parties.
              </p>
            </div>
          </div>

          <div className="mt-12 bg-muted border-2 border-black rounded-xl p-6 shadow">
            <h2 className="text-xl font-black mb-4">Official Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a href="https://www.kra.go.ke" target="_blank" rel="noopener noreferrer" className="font-bold text-sm hover:underline flex items-center gap-2">
                Kenya Revenue Authority (KRA) <ArrowRight className="h-4 w-4" />
              </a>
              <a href="https://www.firs.gov.ng" target="_blank" rel="noopener noreferrer" className="font-bold text-sm hover:underline flex items-center gap-2">
                Nigeria Revenue Service (FIRS) <ArrowRight className="h-4 w-4" />
              </a>
              <a href="https://www.sars.gov.za" target="_blank" rel="noopener noreferrer" className="font-bold text-sm hover:underline flex items-center gap-2">
                South African Revenue Service (SARS) <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="mt-8 p-4 bg-destructive text-white border-2 border-black rounded-xl shadow">
            <p className="font-black text-sm">Disclaimer</p>
            <p className="mt-1 font-bold text-white/90">
              Tax, regulatory and compliance requirements can change. Soko-OS provides software capabilities to support compliance workflows and does not replace professional tax or legal advice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

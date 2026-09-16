'use client';

import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DemoForm() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', business: '', country: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-info border-2 border-black rounded-xl p-8 shadow text-center">
        <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-black text-foreground">Demo Requested!</h2>
        <p className="mt-2 font-bold text-foreground/80">We will reach out within 24 hours to schedule your demo.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold mb-1">Full Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 font-bold border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)] outline-none focus:bg-warning/20"
        />
      </div>
      <div>
        <label className="block text-sm font-bold mb-1">Work Email</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 font-bold border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)] outline-none focus:bg-warning/20"
        />
      </div>
      <div>
        <label className="block text-sm font-bold mb-1">Phone Number</label>
        <input
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 font-bold border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)] outline-none focus:bg-warning/20"
        />
      </div>
      <div>
        <label className="block text-sm font-bold mb-1">Business Name</label>
        <input
          type="text"
          required
          value={formData.business}
          onChange={(e) => setFormData({ ...formData, business: e.target.value })}
          className="w-full px-4 py-3 font-bold border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)] outline-none focus:bg-warning/20"
        />
      </div>
      <div>
        <label className="block text-sm font-bold mb-1">Country</label>
        <select
          required
          value={formData.country}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          className="w-full px-4 py-3 font-bold border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)] outline-none focus:bg-warning/20"
        >
          <option value="">Select country</option>
          <option value="KE">Kenya</option>
          <option value="NG">Nigeria</option>
          <option value="ZA">South Africa</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <Button type="submit" size="lg" className="w-full shadow">
        Request Demo <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </form>
  );
}

'use client';

import React, { useState } from 'react';
import { ArrowRight, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-info border-2 border-black rounded-xl p-8 shadow text-center">
        <h2 className="text-2xl font-black text-foreground">Message Sent!</h2>
        <p className="mt-2 font-bold text-foreground/80">We will get back to you within 24 hours.</p>
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
        <label className="block text-sm font-bold mb-1">Email</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 font-bold border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)] outline-none focus:bg-warning/20"
        />
      </div>
      <div>
        <label className="block text-sm font-bold mb-1">Company</label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="w-full px-4 py-3 font-bold border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)] outline-none focus:bg-warning/20"
        />
      </div>
      <div>
        <label className="block text-sm font-bold mb-1">Message</label>
        <textarea
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 font-bold border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)] outline-none focus:bg-warning/20"
          rows={4}
        />
      </div>
      <Button type="submit" size="lg" className="w-full shadow">
        Send Message <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </form>
  );
}

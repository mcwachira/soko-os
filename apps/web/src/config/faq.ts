export const faqs = [
  {
    category: 'General',
    questions: [
      {
        question: 'What is Soko-OS?',
        answer: 'Soko-OS is an offline-first business operating system built for African businesses. It includes POS, inventory, accounting, tax, payments, and analytics modules that work without internet and sync when connected.',
      },
      {
        question: 'Do I need internet to use Soko-OS?',
        answer: 'No. Soko-OS is designed to work fully offline. Your data is stored locally on your device and syncs automatically when you reconnect to the internet.',
      },
      {
        question: 'What devices can I use?',
        answer: 'Soko-OS works on Android tablets, iOS tablets, and web browsers. For the best experience, we recommend a tablet with at least 4GB RAM.',
      },
      {
        question: 'Is my data secure?',
        answer: 'Yes. All data is encrypted in transit and at rest. We use industry-standard security practices and regular backups. We never share your data with third parties.',
      },
    ],
  },
  {
    category: 'Pricing & Plans',
    questions: [
      {
        question: 'Can I try Soko-OS for free?',
        answer: 'Yes. All plans come with a 14-day free trial. No credit card required to start.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept M-Pesa, card payments, bank transfers, and cash. All subscriptions are billed in your local currency.',
      },
      {
        question: 'Can I switch plans later?',
        answer: 'Yes. You can upgrade or downgrade your plan at any time. Changes take effect immediately and we prorate any differences.',
      },
      {
        question: 'Is there a setup fee?',
        answer: 'No. There are no setup fees, no hidden costs, and no long-term contracts. You pay only for your subscription.',
      },
    ],
  },
  {
    category: 'Technical',
    questions: [
      {
        question: 'How does offline mode work?',
        answer: 'When offline, Soko-OS stores all transactions locally using IndexedDB. When you reconnect, changes sync automatically to the cloud and across your branches.',
      },
      {
        question: 'What happens if my device breaks?',
        answer: 'Your data is backed up in the cloud. You can restore your account on a new device in minutes by logging in.',
      },
      {
        question: 'Do you provide training?',
        answer: 'Yes. All plans include access to our knowledge base, video tutorials, and live chat support during business hours. Enterprise plans include dedicated onboarding.',
      },
      {
        question: 'Can I import my existing data?',
        answer: 'Yes. We support CSV imports for products, customers, and inventory. Our team can also assist with migrations from other POS systems.',
      },
    ],
  },
];

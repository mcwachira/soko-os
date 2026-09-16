import { LayoutDashboard, ShoppingCart, Utensils, HeartPulse, Truck, Package, Building2 } from 'lucide-react';

export const navigation = [
  { name: 'Solutions', href: '/solutions' },
  { name: 'Countries', href: '/countries' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Resources', href: '/resources' },
  { name: 'Stories', href: '/stories' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export const productLinks = [
  { name: 'Soko POS', href: '/products/pos' },
  { name: 'Soko Inventory', href: '/products/inventory' },
  { name: 'Soko Pay', href: '/products/pay' },
  { name: 'Soko Tax', href: '/products/tax' },
  { name: 'Soko Books', href: '/products/books' },
  { name: 'Soko Analytics', href: '/products/analytics' },
  { name: 'Soko Connect', href: '/products/connect' },
];

export const solutionLinks = [
  { name: 'Retail', href: '/solutions/retail' },
  { name: 'Supermarkets', href: '/solutions/supermarkets' },
  { name: 'Restaurants', href: '/solutions/restaurants' },
  { name: 'Pharmacies', href: '/solutions/pharmacies' },
  { name: 'Wholesale', href: '/solutions/wholesale' },
  { name: 'Distribution', href: '/solutions/distribution' },
  { name: 'Multi-Branch', href: '/solutions/multi-branch' },
];

export const countryLinks = [
  { name: 'Kenya', href: '/countries/kenya' },
  { name: 'Nigeria', href: '/countries/nigeria' },
  { name: 'South Africa', href: '/countries/south-africa' },
];

export const resourceLinks = [
  { name: 'Blog', href: '/blog' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Compliance', href: '/compliance' },
  { name: 'Reviews', href: '/reviews' },
];

export const companyLinks = [
  { name: 'About', href: '/about' },
  { name: 'Stories', href: '/stories' },
  { name: 'Careers', href: '#' },
  { name: 'Press', href: '#' },
];

export const legalLinks = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
];

export const solutionIcons: Record<string, any> = {
  retail: ShoppingCart,
  supermarkets: LayoutDashboard,
  restaurants: Utensils,
  pharmacies: HeartPulse,
  wholesale: Truck,
  distribution: Package,
  multiBranch: Building2,
};

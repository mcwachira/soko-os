export type ProductKey = 
  | 'pos' 
  | 'crm' 
  | 'books' 
  | 'inventory' 
  | 'procurement' 
  | 'commerce' 
  | 'insights';

export interface ProductTheme {
  main: string;
  mainForeground: string;
  background: string;
  secondaryBackground: string;
  foreground: string;
  border: string;
  ring: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  input: string;
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

export interface ProductNavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  product: ProductKey | null;
  children?: ProductNavigationItem[];
}

export interface ProductNavigationGroup {
  title: string;
  product: ProductKey | null;
  items: ProductNavigationItem[];
}

export interface ProductConfig {
  key: ProductKey;
  name: string;
  description: string;
  theme: ProductTheme;
  marketingPath: string;
  appPath: string;
  navigation: ProductNavigationGroup[];
  entitlementKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const PRODUCT_THEMES: Record<ProductKey, ProductTheme> = {
  pos: {
    main: 'oklch(78.57% 0.1422 180.36)',
    mainForeground: 'oklch(0% 0 0)',
    background: 'oklch(95.08% 0.0481 184.07)',
    secondaryBackground: 'oklch(100% 0 0)',
    foreground: 'oklch(0% 0 0)',
    border: 'oklch(0% 0 0)',
    ring: 'oklch(0% 0 0)',
    primary: 'oklch(78.57% 0.1422 180.36)',
    primaryForeground: 'oklch(0% 0 0)',
    secondary: 'oklch(100% 0 0)',
    secondaryForeground: 'oklch(0% 0 0)',
    accent: 'oklch(95.08% 0.0481 184.07)',
    accentForeground: 'oklch(0% 0 0)',
    muted: '96% 0 0',
    mutedForeground: '56% 0 0',
    card: '100% 0 0',
    cardForeground: '0% 0 0',
    popover: '100% 0 0',
    popoverForeground: '0% 0 0',
    input: '0% 0 0',
    sidebarBackground: '100% 0 0',
    sidebarForeground: '0% 0 0',
    sidebarPrimary: 'oklch(78.57% 0.1422 180.36)',
    sidebarPrimaryForeground: '0% 0 0',
    sidebarAccent: 'oklch(95.08% 0.0481 184.07)',
    sidebarAccentForeground: '0% 0 0',
    sidebarBorder: 'oklch(0% 0 0)',
    sidebarRing: 'oklch(78.57% 0.1422 180.36)',
  },
  crm: {
    main: 'hsl(353, 100%, 70%)',
    mainForeground: 'oklch(0% 0 0)',
    background: 'hsl(204, 100%, 80%)',
    secondaryBackground: 'oklch(100% 0 0)',
    foreground: 'oklch(0% 0 0)',
    border: 'oklch(0% 0 0)',
    ring: 'oklch(0% 0 0)',
    primary: 'hsl(353, 100%, 70%)',
    primaryForeground: 'oklch(0% 0 0)',
    secondary: 'oklch(100% 0 0)',
    secondaryForeground: 'oklch(0% 0 0)',
    accent: 'hsl(204, 100%, 80%)',
    accentForeground: 'oklch(0% 0 0)',
    muted: '96% 0 0',
    mutedForeground: '56% 0 0',
    card: '100% 0 0',
    cardForeground: '0% 0 0',
    popover: '100% 0 0',
    popoverForeground: '0% 0 0',
    input: '0% 0 0',
    sidebarBackground: '100% 0 0',
    sidebarForeground: '0% 0 0',
    sidebarPrimary: 'hsl(353, 100%, 70%)',
    sidebarPrimaryForeground: '0% 0 0',
    sidebarAccent: 'hsl(204, 100%, 80%)',
    sidebarAccentForeground: 'oklch(0% 0 0)',
    sidebarBorder: 'oklch(0% 0 0)',
    sidebarRing: 'hsl(353, 100%, 70%)',
  },
  books: {
    main: 'hsl(49, 100%, 49%)',
    mainForeground: 'oklch(0% 0 0)',
    background: 'hsl(204, 100%, 80%)',
    secondaryBackground: 'oklch(100% 0 0)',
    foreground: 'oklch(0% 0 0)',
    border: 'oklch(0% 0 0)',
    ring: 'oklch(0% 0 0)',
    primary: 'hsl(49, 100%, 49%)',
    primaryForeground: 'oklch(0% 0 0)',
    secondary: 'oklch(100% 0 0)',
    secondaryForeground: 'oklch(0% 0 0)',
    accent: 'hsl(204, 100%, 80%)',
    accentForeground: 'oklch(0% 0 0)',
    muted: '96% 0 0',
    mutedForeground: '56% 0 0',
    card: '100% 0 0',
    cardForeground: '0% 0 0',
    popover: '100% 0 0',
    popoverForeground: '0% 0 0',
    input: '0% 0 0',
    sidebarBackground: '100% 0 0',
    sidebarForeground: '0% 0 0',
    sidebarPrimary: 'hsl(49, 100%, 49%)',
    sidebarPrimaryForeground: '0% 0 0',
    sidebarAccent: 'hsl(204, 100%, 80%)',
    sidebarAccentForeground: 'oklch(0% 0 0)',
    sidebarBorder: 'oklch(0% 0 0)',
    sidebarRing: 'hsl(49, 100%, 49%)',
  },
  inventory: {
    main: 'hsl(320, 100%, 70%)',
    mainForeground: 'oklch(0% 0 0)',
    background: 'hsl(204, 100%, 80%)',
    secondaryBackground: 'oklch(100% 0 0)',
    foreground: 'oklch(0% 0 0)',
    border: 'oklch(0% 0 0)',
    ring: 'oklch(0% 0 0)',
    primary: 'hsl(320, 100%, 70%)',
    primaryForeground: 'oklch(0% 0 0)',
    secondary: 'oklch(100% 0 0)',
    secondaryForeground: 'oklch(0% 0 0)',
    accent: 'hsl(204, 100%, 80%)',
    accentForeground: 'oklch(0% 0 0)',
    muted: '96% 0 0',
    mutedForeground: '56% 0 0',
    card: '100% 0 0',
    cardForeground: '0% 0 0',
    popover: '100% 0 0',
    popoverForeground: '0% 0 0',
    input: '0% 0 0',
    sidebarBackground: '100% 0 0',
    sidebarForeground: '0% 0 0',
    sidebarPrimary: 'hsl(320, 100%, 70%)',
    sidebarPrimaryForeground: '0% 0 0',
    sidebarAccent: 'hsl(204, 100%, 80%)',
    sidebarAccentForeground: 'oklch(0% 0 0)',
    sidebarBorder: 'oklch(0% 0 0)',
    sidebarRing: 'hsl(320, 100%, 70%)',
  },
  procurement: {
    main: 'hsl(84, 100%, 45%)',
    mainForeground: 'oklch(0% 0 0)',
    background: 'hsl(204, 100%, 80%)',
    secondaryBackground: 'oklch(100% 0 0)',
    foreground: 'oklch(0% 0 0)',
    border: 'oklch(0% 0 0)',
    ring: 'oklch(0% 0 0)',
    primary: 'hsl(84, 100%, 45%)',
    primaryForeground: 'oklch(0% 0 0)',
    secondary: 'oklch(100% 0 0)',
    secondaryForeground: 'oklch(0% 0 0)',
    accent: 'hsl(204, 100%, 80%)',
    accentForeground: 'oklch(0% 0 0)',
    muted: '96% 0 0',
    mutedForeground: '56% 0 0',
    card: '100% 0 0',
    cardForeground: '0% 0 0',
    popover: '100% 0 0',
    popoverForeground: '0% 0 0',
    input: '0% 0 0',
    sidebarBackground: '100% 0 0',
    sidebarForeground: '0% 0 0',
    sidebarPrimary: 'hsl(84, 100%, 45%)',
    sidebarPrimaryForeground: '0% 0 0',
    sidebarAccent: 'hsl(204, 100%, 80%)',
    sidebarAccentForeground: 'oklch(0% 0 0)',
    sidebarBorder: 'oklch(0% 0 0)',
    sidebarRing: 'hsl(84, 100%, 45%)',
  },
  commerce: {
    main: 'hsl(200, 100%, 50%)',
    mainForeground: 'oklch(0% 0 0)',
    background: 'hsl(204, 100%, 80%)',
    secondaryBackground: 'oklch(100% 0 0)',
    foreground: 'oklch(0% 0 0)',
    border: 'oklch(0% 0 0)',
    ring: 'oklch(0% 0 0)',
    primary: 'hsl(200, 100%, 50%)',
    primaryForeground: 'oklch(0% 0 0)',
    secondary: 'oklch(100% 0 0)',
    secondaryForeground: 'oklch(0% 0 0)',
    accent: 'hsl(204, 100%, 80%)',
    accentForeground: 'oklch(0% 0 0)',
    muted: '96% 0 0',
    mutedForeground: '56% 0 0',
    card: '100% 0 0',
    cardForeground: '0% 0 0',
    popover: '100% 0 0',
    popoverForeground: '0% 0 0',
    input: '0% 0 0',
    sidebarBackground: '100% 0 0',
    sidebarForeground: '0% 0 0',
    sidebarPrimary: 'hsl(200, 100%, 50%)',
    sidebarPrimaryForeground: '0% 0 0',
    sidebarAccent: 'hsl(204, 100%, 80%)',
    sidebarAccentForeground: 'oklch(0% 0 0)',
    sidebarBorder: 'oklch(0% 0 0)',
    sidebarRing: 'hsl(200, 100%, 50%)',
  },
  insights: {
    main: 'hsl(280, 100%, 60%)',
    mainForeground: 'oklch(0% 0 0)',
    background: 'hsl(204, 100%, 80%)',
    secondaryBackground: 'oklch(100% 0 0)',
    foreground: 'oklch(0% 0 0)',
    border: 'oklch(0% 0 0)',
    ring: 'oklch(0% 0 0)',
    primary: 'hsl(280, 100%, 60%)',
    primaryForeground: 'oklch(0% 0 0)',
    secondary: 'oklch(100% 0 0)',
    secondaryForeground: 'oklch(0% 0 0)',
    accent: 'hsl(204, 100%, 80%)',
    accentForeground: 'oklch(0% 0 0)',
    muted: '96% 0 0',
    mutedForeground: '56% 0 0',
    card: '100% 0 0',
    cardForeground: '0% 0 0',
    popover: '100% 0 0',
    popoverForeground: '0% 0 0',
    input: '0% 0 0',
    sidebarBackground: '100% 0 0',
    sidebarForeground: '0% 0 0',
    sidebarPrimary: 'hsl(280, 100%, 60%)',
    sidebarPrimaryForeground: '0% 0 0',
    sidebarAccent: 'hsl(204, 100%, 80%)',
    sidebarAccentForeground: 'oklch(0% 0 0)',
    sidebarBorder: 'oklch(0% 0 0)',
    sidebarRing: 'hsl(280, 100%, 60%)',
  },
};

export const PRODUCT_CONFIGS: Record<string, {
  key: string;
  name: string;
  description: string;
  theme: typeof PRODUCT_THEMES[keyof typeof PRODUCT_THEMES];
  marketingPath: string;
  appPath: string;
  navigation: {
    title: string;
    product: string | null;
    items: { title: string; href: string; icon: string; product: string }[];
  }[];
  entitlementKey: string;
  icon: string;
}> = {
  pos: {
    key: 'pos',
    name: 'Soko POS',
    description: 'Fast, intuitive point of sale designed for African retail environments.',
    theme: PRODUCT_THEMES.pos,
    marketingPath: '/pos',
    appPath: '/app/pos',
    navigation: [
      {
        title: 'POS',
        product: 'pos',
        items: [
          { title: 'Checkout', href: '/app/pos', icon: 'ShoppingCart', product: 'pos' },
          { title: 'Sales', href: '/app/pos/sales', icon: 'ShoppingBag', product: 'pos' },
          { title: 'Orders', href: '/app/pos/orders', icon: 'ClipboardList', product: 'pos' },
          { title: 'Returns', href: '/app/pos/returns', icon: 'RotateCcw', product: 'pos' },
          { title: 'Cash & Shifts', href: '/app/pos/shifts', icon: 'Wallet', product: 'pos' },
        ],
      },
      {
        title: 'POS Reports',
        product: 'pos',
        items: [
          { title: 'Reports', href: '/app/pos/reports', icon: 'BarChart3', product: 'pos' },
          { title: 'Quick Keys', href: '/app/pos/quick-keys', icon: 'Settings', product: 'pos' },
          { title: 'Loyalty', href: '/app/pos/loyalty', icon: 'Users', product: 'pos' },
          { title: 'Store Credits', href: '/app/pos/store-credits', icon: 'CreditCard', product: 'pos' },
          { title: 'Price Overrides', href: '/app/pos/price-overrides', icon: 'Tag', product: 'pos' },
        ],
      },
    ],
    entitlementKey: 'pos',
    icon: 'ShoppingCart',
  },
  crm: {
    key: 'crm',
    name: 'Soko CRM',
    description: 'Customer relationship management for African businesses.',
    theme: PRODUCT_THEMES.crm,
    marketingPath: '/crm',
    appPath: '/app/crm',
    navigation: [
      {
        title: 'CRM',
        product: 'crm',
        items: [
          { title: 'Leads', href: '/app/crm/leads', icon: 'UserPlus', product: 'crm' },
          { title: 'Accounts', href: '/app/crm/accounts', icon: 'Handshake', product: 'crm' },
          { title: 'Contacts', href: '/app/crm/contacts', icon: 'PhoneCall', product: 'crm' },
          { title: 'Deals', href: '/app/crm/deals', icon: 'Target', product: 'crm' },
          { title: 'Pipelines', href: '/app/crm/pipelines', icon: 'Target', product: 'crm' },
          { title: 'Campaigns', href: '/app/crm/campaigns', icon: 'Megaphone', product: 'crm' },
          { title: 'Cases', href: '/app/crm/cases', icon: 'Ticket', product: 'crm' },
        ],
      },
    ],
    entitlementKey: 'crm',
    icon: 'Handshake',
  },
  books: {
    key: 'books',
    name: 'Soko Books',
    description: 'Full double-entry bookkeeping designed for African businesses.',
    theme: PRODUCT_THEMES.books,
    marketingPath: '/books',
    appPath: '/app/books',
    navigation: [
      {
        title: 'ACCOUNTING',
        product: 'books',
        items: [
          { title: 'Accounting', href: '/app/books/accounting', icon: 'BookOpen', product: 'books' },
          { title: 'Quotes', href: '/app/books/quotes', icon: 'BookOpen', product: 'books' },
          { title: 'Sales Orders', href: '/app/books/sales-orders', icon: 'BookOpen', product: 'books' },
          { title: 'Invoices', href: '/app/books/invoices', icon: 'BookOpen', product: 'books' },
          { title: 'Credit Notes', href: '/app/books/credit-notes', icon: 'BookOpen', product: 'books' },
          { title: 'Debit Notes', href: '/app/books/debit-notes', icon: 'BookOpen', product: 'books' },
          { title: 'Expenses', href: '/app/books/expenses', icon: 'BookOpen', product: 'books' },
          { title: 'Refunds', href: '/app/books/refunds', icon: 'BookOpen', product: 'books' },
          { title: 'Receivables', href: '/app/books/receivables', icon: 'BookOpen', product: 'books' },
          { title: 'Payables', href: '/app/books/payables', icon: 'BookOpen', product: 'books' },
          { title: 'Projects', href: '/app/books/projects', icon: 'BookOpen', product: 'books' },
          { title: 'Tasks', href: '/app/books/tasks', icon: 'BookOpen', product: 'books' },
          { title: 'Timesheets', href: '/app/books/timesheets', icon: 'BookOpen', product: 'books' },
          { title: 'Project Expenses', href: '/app/books/project-expenses', icon: 'BookOpen', product: 'books' },
          { title: 'Retainers', href: '/app/books/retainers', icon: 'BookOpen', product: 'books' },
        ],
      },
      {
        title: 'BANKING',
        product: 'books',
        items: [
          { title: 'Bank Accounts', href: '/app/books/bank-accounts', icon: 'BookOpen', product: 'books' },
          { title: 'Transactions', href: '/app/books/bank-transactions', icon: 'BookOpen', product: 'books' },
          { title: 'Reconciliation', href: '/app/books/bank-reconciliation', icon: 'BookOpen', product: 'books' },
        ],
      },
    ],
    entitlementKey: 'books',
    icon: 'BookOpen',
  },
  inventory: {
    key: 'inventory',
    name: 'Soko Inventory',
    description: 'Track inventory across multiple branches in real-time.',
    theme: PRODUCT_THEMES.inventory,
    marketingPath: '/inventory',
    appPath: '/app/inventory',
    navigation: [
      {
        title: 'INVENTORY',
        product: 'inventory',
        items: [
          { title: 'Dashboard', href: '/app/inventory', icon: 'Package', product: 'inventory' },
          { title: 'Products', href: '/app/inventory/products', icon: 'Package', product: 'inventory' },
          { title: 'Units', href: '/app/inventory/units', icon: 'Settings', product: 'inventory' },
          { title: 'Batches', href: '/app/inventory/batches', icon: 'Hash', product: 'inventory' },
          { title: 'Serials', href: '/app/inventory/serial-numbers', icon: 'Hash', product: 'inventory' },
          { title: 'Bins', href: '/app/inventory/bins', icon: 'MapPin', product: 'inventory' },
          { title: 'Adjustments', href: '/app/inventory/adjustments', icon: 'RefreshCw', product: 'inventory' },
          { title: 'Stocktakes', href: '/app/inventory/stocktakes', icon: 'ClipboardList', product: 'inventory' },
          { title: 'Transfers', href: '/app/inventory/transfers', icon: 'ArrowRightLeft', product: 'inventory' },
          { title: 'Assemblies', href: '/app/inventory/assemblies', icon: 'Boxes', product: 'inventory' },
          { title: 'Landed Costs', href: '/app/inventory/landed-costs', icon: 'DollarSign', product: 'inventory' },
          { title: 'Replenishment', href: '/app/inventory/replenishment', icon: 'TrendingUp', product: 'inventory' },
          { title: 'Price Lists', href: '/app/inventory/price-lists', icon: 'Tag', product: 'inventory' },
          { title: 'Packages', href: '/app/inventory/packages', icon: 'Package', product: 'inventory' },
          { title: 'Shipments', href: '/app/inventory/shipments', icon: 'Truck', product: 'inventory' },
          { title: 'eTIMS', href: '/app/inventory/etims', icon: 'FileText', product: 'inventory' },
        ],
      },
    ],
    entitlementKey: 'inventory',
    icon: 'Package',
  },
  procurement: {
    key: 'procurement',
    name: 'Soko Procurement',
    description: 'Purchase requisitions, RFQs, and supplier management.',
    theme: PRODUCT_THEMES.procurement,
    marketingPath: '/procurement',
    appPath: '/app/procurement',
    navigation: [
      {
        title: 'PROCUREMENT',
        product: 'procurement',
        items: [
          { title: 'Requisitions', href: '/app/procurement/requisitions', icon: 'ClipboardList', product: 'procurement' },
          { title: 'RFQs', href: '/app/procurement/rfqs', icon: 'FileText', product: 'procurement' },
          { title: 'Tenders', href: '/app/procurement/tenders', icon: 'FileText', product: 'procurement' },
          { title: 'Contracts', href: '/app/procurement/contracts', icon: 'FileText', product: 'procurement' },
          { title: 'Invoices', href: '/app/procurement/invoices', icon: 'FileText', product: 'procurement' },
          { title: 'Payments', href: '/app/procurement/payments', icon: 'Wallet', product: 'procurement' },
          { title: 'Payment Vouchers', href: '/app/procurement/payment-vouchers', icon: 'Wallet', product: 'procurement' },
          { title: 'Matches', href: '/app/procurement/matches', icon: 'GitCompare', product: 'procurement' },
          { title: 'Reconciliations', href: '/app/procurement/reconciliations', icon: 'RefreshCw', product: 'procurement' },
          { title: 'Approval Rules', href: '/app/procurement/approval-rules', icon: 'Shield', product: 'procurement' },
        ],
      },
    ],
    entitlementKey: 'procurement',
    icon: 'ShoppingBag',
  },
  commerce: {
    key: 'commerce',
    name: 'Soko Commerce',
    description: 'Unified commerce platform for online and offline sales.',
    theme: PRODUCT_THEMES.commerce,
    marketingPath: '/commerce',
    appPath: '/app/commerce',
    navigation: [
      {
        title: 'COMMERCE',
        product: 'commerce',
        items: [
          { title: 'Products', href: '/app/commerce/products', icon: 'Package', product: 'commerce' },
          { title: 'Inventory', href: '/app/commerce/inventory', icon: 'Package', product: 'commerce' },
          { title: 'Customers', href: '/app/commerce/customers', icon: 'Users', product: 'commerce' },
          { title: 'Suppliers', href: '/app/commerce/suppliers', icon: 'Truck', product: 'commerce' },
          { title: 'Purchasing', href: '/app/commerce/purchasing', icon: 'Truck', product: 'commerce' },
        ],
      },
    ],
    entitlementKey: 'commerce',
    icon: 'ShoppingCart',
  },
  insights: {
    key: 'insights',
    name: 'Soko Insights',
    description: 'Powerful analytics dashboard with sales trends and business health metrics.',
    theme: PRODUCT_THEMES.insights,
    marketingPath: '/insights',
    appPath: '/app/insights',
    navigation: [
      {
        title: 'INSIGHTS',
        product: 'insights',
        items: [
          { title: 'Analytics', href: '/app/insights/analytics', icon: 'TrendingUp', product: 'insights' },
          { title: 'Reports', href: '/app/insights/reports', icon: 'BarChart3', product: 'insights' },
        ],
      },
    ],
    entitlementKey: 'insights',
    icon: 'BarChart3',
  },
};

export const PRODUCT_KEYS: ProductKey[] = ['pos', 'crm', 'books', 'inventory', 'procurement', 'commerce', 'insights'];

export function getProductConfig(key: string) {
  return PRODUCT_CONFIGS[key];
}

export function getProductTheme(key: string) {
  return PRODUCT_THEMES[key as ProductKey];
}
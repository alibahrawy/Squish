// Comprehensive SaaS Service Pricing Data
// Based on research from January 2025-2026

export type ServiceCategory =
  | "database"
  | "hosting"
  | "auth"
  | "email"
  | "payments"
  | "analytics"
  | "storage"
  | "jobs";

export interface ServiceTier {
  name: string;
  baseCost: number;
  triggerAt: number; // User count that triggers this tier
  includedUnits?: number;
  unitType?: string;
  overageCost?: number;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  tiers: ServiceTier[];
  pricingModel: "flat" | "usage" | "percentage" | "per-user";
  // For percentage-based (payments)
  feePercent?: number;
  perTransaction?: number;
  // Per-user cost estimates at 1K users
  costPer1kUsers?: {
    low: number;
    medium: number;
    high: number;
  };
  gotchas?: string[];
  recommended?: boolean;
}

export interface Category {
  id: ServiceCategory;
  name: string;
  icon: string; // Lucide icon name
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "database",
    name: "Database",
    icon: "Database",
    description: "PostgreSQL, NoSQL, and serverless databases",
  },
  {
    id: "hosting",
    name: "Hosting",
    icon: "Server",
    description: "Deployment and hosting platforms",
  },
  {
    id: "auth",
    name: "Auth",
    icon: "Shield",
    description: "Authentication and user management",
  },
  {
    id: "email",
    name: "Email",
    icon: "Mail",
    description: "Transactional email services",
  },
  {
    id: "payments",
    name: "Payments",
    icon: "CreditCard",
    description: "Payment processing and subscriptions",
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: "BarChart3",
    description: "Product analytics and error tracking",
  },
  {
    id: "storage",
    name: "Storage",
    icon: "HardDrive",
    description: "File storage and CDN",
  },
  {
    id: "jobs",
    name: "Jobs",
    icon: "Cog",
    description: "Background jobs and queues",
  },
];

export const SERVICES: Service[] = [
  // ============================================
  // DATABASE SERVICES
  // ============================================
  {
    id: "supabase-db",
    name: "Supabase",
    category: "database",
    description: "PostgreSQL with realtime, auth, and storage",
    pricingModel: "flat",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Pro", baseCost: 25, triggerAt: 500 },
      { name: "Team", baseCost: 599, triggerAt: 50000 },
    ],
    costPer1kUsers: { low: 25, medium: 35, high: 50 },
    gotchas: [
      "Free projects pause after 7 days of inactivity",
      "Storage $0.125/GB overage",
      "MAUs $0.00325/MAU over 100K",
    ],
  },
  {
    id: "neon",
    name: "Neon",
    category: "database",
    description: "Serverless PostgreSQL with scale-to-zero",
    pricingModel: "usage",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Launch", baseCost: 19, triggerAt: 500 },
      { name: "Scale", baseCost: 69, triggerAt: 10000 },
    ],
    costPer1kUsers: { low: 18, medium: 25, high: 35 },
    gotchas: ["Compute rate $0.106/CU-hour on Launch", "Storage $0.35/GB"],
  },
  {
    id: "firebase",
    name: "Firebase",
    category: "database",
    description: "Google's NoSQL realtime database",
    pricingModel: "usage",
    tiers: [
      { name: "Spark (Free)", baseCost: 0, triggerAt: 0 },
      { name: "Blaze", baseCost: 0, triggerAt: 100 }, // Pay as you go
    ],
    costPer1kUsers: { low: 0, medium: 20, high: 50 },
    gotchas: [
      "Reads/writes can escalate quickly",
      "~$0.36/100K reads, ~$0.18/100K writes",
    ],
  },
  {
    id: "mongodb-atlas",
    name: "MongoDB Atlas",
    category: "database",
    description: "Managed MongoDB with flexible schema",
    pricingModel: "flat",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Flex", baseCost: 8, triggerAt: 100 },
      { name: "Dedicated", baseCost: 57, triggerAt: 5000 },
    ],
    costPer1kUsers: { low: 8, medium: 20, high: 30 },
  },
  {
    id: "planetscale",
    name: "PlanetScale",
    category: "database",
    description: "MySQL-compatible serverless database",
    pricingModel: "flat",
    tiers: [
      { name: "Scaler", baseCost: 29, triggerAt: 0 },
      { name: "Scaler Pro", baseCost: 59, triggerAt: 5000 },
    ],
    costPer1kUsers: { low: 29, medium: 35, high: 50 },
    gotchas: ["Free tier deprecated in 2024"],
  },
  {
    id: "upstash-redis",
    name: "Upstash Redis",
    category: "database",
    description: "Serverless Redis for caching and sessions",
    pricingModel: "usage",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Pay-as-you-go", baseCost: 0, triggerAt: 100 },
    ],
    costPer1kUsers: { low: 0, medium: 5, high: 20 },
    gotchas: ["$0.20/100K commands after free tier"],
  },
  {
    id: "turso",
    name: "Turso",
    category: "database",
    description: "Edge SQLite for multi-tenant apps",
    pricingModel: "flat",
    tiers: [
      { name: "Starter", baseCost: 0, triggerAt: 0 },
      { name: "Scaler", baseCost: 29, triggerAt: 1000 },
      { name: "Enterprise", baseCost: 99, triggerAt: 10000 },
    ],
    costPer1kUsers: { low: 0, medium: 29, high: 50 },
  },

  // ============================================
  // HOSTING SERVICES
  // ============================================
  {
    id: "vercel",
    name: "Vercel",
    category: "hosting",
    description: "Next.js optimized deployment platform",
    pricingModel: "flat",
    tiers: [
      { name: "Hobby", baseCost: 0, triggerAt: 0 },
      { name: "Pro", baseCost: 20, triggerAt: 100 },
      { name: "Enterprise", baseCost: 1667, triggerAt: 50000 }, // ~$20K/year
    ],
    costPer1kUsers: { low: 20, medium: 30, high: 50 },
    gotchas: [
      "Hobby plan prohibits commercial use",
      "Bandwidth $0.15/GB (expensive at scale)",
      "Enterprise cliff ~$20K+ minimum",
    ],
  },
  {
    id: "cloudflare-workers",
    name: "Cloudflare Workers",
    category: "hosting",
    description: "Edge computing with zero bandwidth cost",
    pricingModel: "usage",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Paid", baseCost: 5, triggerAt: 1000 },
    ],
    costPer1kUsers: { low: 0, medium: 5, high: 5 },
    gotchas: ["Zero bandwidth charges - massive savings at scale"],
  },
  {
    id: "netlify",
    name: "Netlify",
    category: "hosting",
    description: "Static sites and Jamstack deployment",
    pricingModel: "flat",
    tiers: [
      { name: "Starter", baseCost: 0, triggerAt: 0 },
      { name: "Pro", baseCost: 19, triggerAt: 500 },
      { name: "Business", baseCost: 99, triggerAt: 5000 },
    ],
    costPer1kUsers: { low: 19, medium: 30, high: 70 },
    gotchas: ["Bandwidth overages $55/100GB"],
  },
  {
    id: "railway",
    name: "Railway",
    category: "hosting",
    description: "Simple deployment for apps and databases",
    pricingModel: "usage",
    tiers: [
      { name: "Hobby", baseCost: 5, triggerAt: 0 },
      { name: "Pro", baseCost: 20, triggerAt: 5000 },
    ],
    costPer1kUsers: { low: 7, medium: 15, high: 25 },
    gotchas: ["RAM $10/GB/month, CPU $20/vCPU/month"],
  },
  {
    id: "render",
    name: "Render",
    category: "hosting",
    description: "Heroku alternative with simple pricing",
    pricingModel: "flat",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Starter", baseCost: 7, triggerAt: 100 },
      { name: "Standard", baseCost: 25, triggerAt: 2000 },
    ],
    costPer1kUsers: { low: 7, medium: 15, high: 25 },
  },
  {
    id: "fly-io",
    name: "Fly.io",
    category: "hosting",
    description: "Global edge VMs with low latency",
    pricingModel: "usage",
    tiers: [
      { name: "Pay-as-you-go", baseCost: 0, triggerAt: 0 },
      { name: "Scale", baseCost: 29, triggerAt: 5000 },
    ],
    costPer1kUsers: { low: 5, medium: 10, high: 20 },
  },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    category: "hosting",
    description: "Simple cloud infrastructure",
    pricingModel: "flat",
    tiers: [
      { name: "Basic Droplet", baseCost: 6, triggerAt: 0 },
      { name: "General Purpose", baseCost: 63, triggerAt: 5000 },
    ],
    costPer1kUsers: { low: 6, medium: 20, high: 40 },
  },

  // ============================================
  // AUTHENTICATION SERVICES
  // ============================================
  {
    id: "memberstack",
    name: "Memberstack",
    category: "auth",
    description: "Membership, auth & payments for websites",
    pricingModel: "per-user",
    recommended: true,
    tiers: [
      { name: "Starter", baseCost: 25, triggerAt: 0 },
      { name: "Pro", baseCost: 45, triggerAt: 100 },
      { name: "Business", baseCost: 200, triggerAt: 1000 },
    ],
    costPer1kUsers: { low: 45, medium: 200, high: 400 },
    gotchas: [
      "Includes payments - also in Payments tab",
      "Starter limited to 100 members",
      "Pro limited to 1,000 members",
      "Business includes unlimited members",
      "Great for Webflow/Framer sites",
    ],
  },
  {
    id: "supabase-auth",
    name: "Supabase Auth",
    category: "auth",
    description: "Built-in auth with Supabase (best value)",
    pricingModel: "per-user",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Pro", baseCost: 0, triggerAt: 50000 }, // Included with Supabase Pro
    ],
    costPer1kUsers: { low: 0, medium: 0, high: 3 },
    gotchas: ["$0.00325/MAU over 100K - best value at scale"],
  },
  {
    id: "clerk",
    name: "Clerk",
    category: "auth",
    description: "Developer-friendly auth with great DX",
    pricingModel: "per-user",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Pro", baseCost: 25, triggerAt: 10000 },
      { name: "Enterprise", baseCost: 500, triggerAt: 50000 },
    ],
    costPer1kUsers: { low: 0, medium: 25, high: 50 },
    gotchas: ["$0.02/MAU overage", "SMS auth $100/mo add-on"],
  },
  {
    id: "auth0",
    name: "Auth0",
    category: "auth",
    description: "Enterprise auth with many integrations",
    pricingModel: "per-user",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Essentials", baseCost: 35, triggerAt: 7500 },
      { name: "Professional", baseCost: 240, triggerAt: 25000 },
    ],
    costPer1kUsers: { low: 0, medium: 35, high: 100 },
    gotchas: ["300% higher overage rates than competitors", "Complex tiers"],
  },
  {
    id: "kinde",
    name: "Kinde",
    category: "auth",
    description: "Modern auth with feature flags included",
    pricingModel: "per-user",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Pro", baseCost: 25, triggerAt: 10500 },
      { name: "Business", baseCost: 99, triggerAt: 25000 },
    ],
    costPer1kUsers: { low: 0, medium: 25, high: 40 },
    gotchas: ["$0.0175/MAU overage"],
  },
  {
    id: "workos",
    name: "WorkOS",
    category: "auth",
    description: "Enterprise SSO and directory sync",
    pricingModel: "per-user",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Enterprise", baseCost: 2500, triggerAt: 1000000 },
    ],
    costPer1kUsers: { low: 0, medium: 0, high: 2.5 },
    gotchas: ["1M MAU free, then $2,500/million - best for B2B"],
  },

  // ============================================
  // EMAIL SERVICES
  // ============================================
  {
    id: "resend",
    name: "Resend",
    category: "email",
    description: "Modern email API with React support",
    pricingModel: "flat",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Pro", baseCost: 20, triggerAt: 150 },
      { name: "Scale", baseCost: 90, triggerAt: 3500 },
      { name: "Enterprise", baseCost: 650, triggerAt: 35000 },
    ],
    costPer1kUsers: { low: 20, medium: 20, high: 30 },
    gotchas: [
      "Daily limit of 100 on Free tier",
      "Data retention only 1-7 days",
    ],
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    category: "email",
    description: "Twilio's email platform",
    pricingModel: "flat",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Essentials", baseCost: 20, triggerAt: 300 },
      { name: "Pro", baseCost: 90, triggerAt: 3500 },
    ],
    costPer1kUsers: { low: 20, medium: 35, high: 90 },
    gotchas: ["Marketing and Email API are separate products"],
  },
  {
    id: "postmark",
    name: "Postmark",
    category: "email",
    description: "Best deliverability (93.8%)",
    pricingModel: "flat",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "10K", baseCost: 15, triggerAt: 500 },
      { name: "50K", baseCost: 55, triggerAt: 2500 },
      { name: "125K", baseCost: 115, triggerAt: 6000 },
    ],
    costPer1kUsers: { low: 15, medium: 17, high: 25 },
  },
  {
    id: "amazon-ses",
    name: "Amazon SES",
    category: "email",
    description: "Cheapest at scale ($0.10/1K emails)",
    pricingModel: "usage",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Pay-as-you-go", baseCost: 0, triggerAt: 200 },
    ],
    costPer1kUsers: { low: 1, medium: 1.5, high: 3 },
    gotchas: ["Lower deliverability (71-78%)", "More setup required"],
  },
  {
    id: "mailgun",
    name: "Mailgun",
    category: "email",
    description: "Flexible email API",
    pricingModel: "flat",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Foundation", baseCost: 15, triggerAt: 500 },
      { name: "Scale", baseCost: 90, triggerAt: 5000 },
    ],
    costPer1kUsers: { low: 15, medium: 15, high: 25 },
  },

  // ============================================
  // PAYMENT SERVICES
  // ============================================
  {
    id: "stripe",
    name: "Stripe",
    category: "payments",
    description: "Industry standard payment processing",
    pricingModel: "percentage",
    feePercent: 2.9,
    perTransaction: 0.3,
    tiers: [{ name: "Standard", baseCost: 0, triggerAt: 0 }],
    costPer1kUsers: { low: 0, medium: 0, high: 0 }, // Percentage based
    gotchas: [
      "Add 0.7% for Billing, 0.5% for Tax, 1% for international",
      "Full stack = ~6-8% (approaching MoR pricing)",
    ],
  },
  {
    id: "paddle",
    name: "Paddle",
    category: "payments",
    description: "Merchant of Record - handles taxes",
    pricingModel: "percentage",
    feePercent: 5,
    perTransaction: 0.5,
    tiers: [{ name: "Standard", baseCost: 0, triggerAt: 0 }],
    costPer1kUsers: { low: 0, medium: 0, high: 0 },
    gotchas: ["Handles VAT/GST registration and tax filing"],
  },
  {
    id: "lemonsqueezy",
    name: "LemonSqueezy",
    category: "payments",
    description: "MoR for digital products",
    pricingModel: "percentage",
    feePercent: 5,
    perTransaction: 0.5,
    tiers: [{ name: "Standard", baseCost: 0, triggerAt: 0 }],
    costPer1kUsers: { low: 0, medium: 0, high: 0 },
    gotchas: ["Great for indie devs, handles all compliance"],
  },
  {
    id: "gumroad",
    name: "Gumroad",
    category: "payments",
    description: "Simple payments for creators",
    pricingModel: "percentage",
    feePercent: 10,
    perTransaction: 0,
    tiers: [{ name: "Standard", baseCost: 0, triggerAt: 0 }],
    costPer1kUsers: { low: 0, medium: 0, high: 0 },
    gotchas: ["30% on marketplace sales", "Higher fees but simpler"],
  },
  {
    id: "memberstack",
    name: "Memberstack",
    category: "payments",
    description: "Membership payments & subscriptions",
    pricingModel: "flat",
    tiers: [
      { name: "Starter", baseCost: 25, triggerAt: 0 },
      { name: "Pro", baseCost: 45, triggerAt: 100 },
      { name: "Business", baseCost: 200, triggerAt: 1000 },
    ],
    costPer1kUsers: { low: 45, medium: 200, high: 400 },
    gotchas: [
      "Same as Memberstack Auth - only counted once",
      "Includes Stripe integration",
      "0% transaction fees (pay Stripe directly)",
    ],
  },

  // ============================================
  // ANALYTICS SERVICES
  // ============================================
  {
    id: "posthog",
    name: "PostHog",
    category: "analytics",
    description: "Open source product analytics",
    pricingModel: "usage",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Pay-as-you-go", baseCost: 0, triggerAt: 5000 },
    ],
    costPer1kUsers: { low: 0, medium: 0, high: 5 },
    gotchas: ["1M events, 5K replays, 1M feature flags free"],
  },
  {
    id: "mixpanel",
    name: "Mixpanel",
    category: "analytics",
    description: "Event-based product analytics",
    pricingModel: "usage",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Growth", baseCost: 24, triggerAt: 10000 },
    ],
    costPer1kUsers: { low: 0, medium: 0, high: 2.4 },
    gotchas: ["20M events/mo free"],
  },
  {
    id: "amplitude",
    name: "Amplitude",
    category: "analytics",
    description: "Enterprise product analytics",
    pricingModel: "per-user",
    tiers: [
      { name: "Starter", baseCost: 0, triggerAt: 0 },
      { name: "Growth", baseCost: 49, triggerAt: 50000 },
    ],
    costPer1kUsers: { low: 0, medium: 0, high: 1 },
    gotchas: ["50K MTUs/mo free"],
  },
  {
    id: "plausible",
    name: "Plausible",
    category: "analytics",
    description: "Privacy-focused simple analytics",
    pricingModel: "flat",
    tiers: [
      { name: "10K", baseCost: 9, triggerAt: 0 },
      { name: "100K", baseCost: 19, triggerAt: 2000 },
      { name: "1M", baseCost: 69, triggerAt: 20000 },
    ],
    costPer1kUsers: { low: 9, medium: 10, high: 18 },
  },
  {
    id: "sentry",
    name: "Sentry",
    category: "analytics",
    description: "Error tracking and monitoring",
    pricingModel: "usage",
    tiers: [
      { name: "Developer", baseCost: 0, triggerAt: 0 },
      { name: "Team", baseCost: 26, triggerAt: 1000 },
      { name: "Business", baseCost: 80, triggerAt: 5000 },
    ],
    costPer1kUsers: { low: 0, medium: 2.6, high: 8 },
    gotchas: ["5K errors/mo free"],
  },
  {
    id: "logrocket",
    name: "LogRocket",
    category: "analytics",
    description: "Session replay and monitoring",
    pricingModel: "flat",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Team", baseCost: 99, triggerAt: 100 },
      { name: "Professional", baseCost: 300, triggerAt: 1000 },
    ],
    costPer1kUsers: { low: 99, medium: 150, high: 300 },
    gotchas: ["1K sessions/mo free", "Most expensive option"],
  },

  // ============================================
  // STORAGE SERVICES
  // ============================================
  {
    id: "cloudflare-r2",
    name: "Cloudflare R2",
    category: "storage",
    description: "S3-compatible with zero egress fees",
    pricingModel: "usage",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Pay-as-you-go", baseCost: 0, triggerAt: 1000 },
    ],
    costPer1kUsers: { low: 0, medium: 0.76, high: 5 },
    gotchas: [
      "Zero egress fees - 98% cheaper than S3 for bandwidth",
      "$0.015/GB storage",
    ],
  },
  {
    id: "aws-s3",
    name: "AWS S3",
    category: "storage",
    description: "Industry standard object storage",
    pricingModel: "usage",
    tiers: [{ name: "Pay-as-you-go", baseCost: 0, triggerAt: 0 }],
    costPer1kUsers: { low: 5, medium: 19, high: 50 },
    gotchas: ["Egress $0.09/GB - can be 60x more expensive than R2"],
  },
  {
    id: "uploadthing",
    name: "UploadThing",
    category: "storage",
    description: "Simple file uploads for Next.js",
    pricingModel: "flat",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Pro", baseCost: 25, triggerAt: 500 },
    ],
    costPer1kUsers: { low: 25, medium: 25, high: 50 },
    gotchas: ["Flat $25 for 250GB - good for moderate storage"],
  },
  {
    id: "cloudinary",
    name: "Cloudinary",
    category: "storage",
    description: "Image/video optimization and CDN",
    pricingModel: "usage",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Plus", baseCost: 89, triggerAt: 2000 },
      { name: "Advanced", baseCost: 224, triggerAt: 10000 },
    ],
    costPer1kUsers: { low: 0, medium: 45, high: 90 },
    gotchas: ["Credit-based pricing can be confusing"],
  },

  // ============================================
  // BACKGROUND JOBS SERVICES
  // ============================================
  {
    id: "qstash",
    name: "QStash",
    category: "jobs",
    description: "Serverless message queue (cheapest)",
    pricingModel: "usage",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Pay-as-you-go", baseCost: 0, triggerAt: 1000 },
    ],
    costPer1kUsers: { low: 0, medium: 0.5, high: 5 },
    gotchas: ["$1/100K messages", "1K messages/day free"],
  },
  {
    id: "trigger-dev",
    name: "Trigger.dev",
    category: "jobs",
    description: "Background jobs with great DX",
    pricingModel: "usage",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Pro", baseCost: 10, triggerAt: 2000 },
    ],
    costPer1kUsers: { low: 0, medium: 10, high: 50 },
    gotchas: ["$5/mo credit on free tier", "Pay for compute time"],
  },
  {
    id: "inngest",
    name: "Inngest",
    category: "jobs",
    description: "Event-driven workflows",
    pricingModel: "usage",
    tiers: [
      { name: "Free", baseCost: 0, triggerAt: 0 },
      { name: "Team", baseCost: 50, triggerAt: 3000 },
      { name: "Pro", baseCost: 175, triggerAt: 10000 },
    ],
    costPer1kUsers: { low: 0, medium: 5, high: 75 },
    gotchas: ["50K executions/mo free", "Step-based pricing"],
  },
];

// Helper functions
export function getServicesByCategory(category: ServiceCategory): Service[] {
  return SERVICES.filter((s) => s.category === category);
}

export function getServiceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function getRecommendedServices(): Service[] {
  return SERVICES.filter((s) => s.recommended);
}

export function getCategoryById(id: ServiceCategory): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

// Calculate cost for a service at given user count
export function calculateServiceCost(service: Service, users: number): number {
  // Find the active tier based on user count
  const sortedTiers = [...service.tiers].sort(
    (a, b) => b.triggerAt - a.triggerAt
  );
  const activeTier =
    sortedTiers.find((tier) => users >= tier.triggerAt) || service.tiers[0];

  return activeTier.baseCost;
}

// Get all tier upgrades for a service
export function getServiceUpgrades(
  service: Service,
  currentUsers: number
): { tier: ServiceTier; isActive: boolean }[] {
  return service.tiers.map((tier) => ({
    tier,
    isActive: currentUsers >= tier.triggerAt,
  }));
}

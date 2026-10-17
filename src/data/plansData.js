export const SUBSCRIPTION_PLANS = [
  {
    id: 'plan_starter',
    name: 'Starter Creator',
    tagline: 'Ideal for freelance developers, writers, and digital creators starting their AI journey.',
    monthlyPrice: 24,
    annualPrice: 19, // per month, billed annually
    badge: 'INDIVIDUAL CREATOR',
    featured: false,
    tokens: '1,000,000 Neural Tokens / mo',
    toolsCount: '6 Core AI Tools Included',
    features: [
      { text: '6 Core AI Tools included (LLM, Vision, Code)', included: true },
      { text: '1,000,000 Monthly Neural Tokens', included: true },
      { text: '250 8K Image Generations / month', included: true },
      { text: 'Standard GPU Processing Queue', included: true },
      { text: '2 Active Production API Keys (60 req/min)', included: true },
      { text: 'Full 100% Commercial Rights', included: true },
      { text: 'Dedicated H100 GPU Cluster', included: false },
      { text: 'Multi-Agent Autonomous Workflows', included: false },
      { text: 'Zero Data Retention SLA', included: false }
    ],
    ctaText: 'Subscribe to Starter'
  },
  {
    id: 'plan_pro',
    name: 'Pro AI Suite',
    tagline: 'The ultimate powerhouse for startups, power developers, and creative agencies.',
    monthlyPrice: 59,
    annualPrice: 49, // per month, billed annually
    badge: 'MOST POPULAR CHOICE',
    featured: true,
    tokens: 'UNLIMITED Tokens (15M Fair Use)',
    toolsCount: 'ALL 45+ AI Engines Unlocked',
    features: [
      { text: 'ALL 45+ AI Engines & Tools Unlocked', included: true, highlight: true },
      { text: 'UNLIMITED Neural Tokens (15M Fair Use)', included: true, highlight: true },
      { text: 'Unlimited 8K Art & Photorealism Renders', included: true },
      { text: 'DeepCode Copilot v4.5 Full Access', included: true },
      { text: 'Priority H100 SXM5 GPU Cluster (Sub-second)', included: true },
      { text: '10 High-Speed API Keys (1,200 req/min)', included: true },
      { text: 'Multi-Agent Autonomous Workflows', included: true },
      { text: 'Full Commercial Rights with $1M Indemnity', included: true },
      { text: 'Priority 24/7 VIP Discord & Ticket Support', included: true }
    ],
    ctaText: 'Subscribe to Pro Suite'
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise Sovereign',
    tagline: 'Private dedicated clusters, custom fine-tuning, and zero data retention for organizations.',
    monthlyPrice: 159,
    annualPrice: 129, // per month, billed annually
    badge: 'ENTERPRISE GRADE',
    featured: false,
    tokens: 'Custom Allocation / Unlimited',
    toolsCount: 'All Tools + Custom Fine-Tuned Models',
    features: [
      { text: 'Everything in Pro AI Suite', included: true },
      { text: 'Private Dedicated Tensor Core GPU Cloud', included: true },
      { text: 'Zero Data Retention (SOC2 Type II & HIPAA Audited)', included: true, highlight: true },
      { text: 'Custom Fine-Tuning on Proprietary Datasets', included: true },
      { text: 'Unlimited API Keys & Custom Rate Limits', included: true },
      { text: '99.99% Financially-Backed SLA', included: true },
      { text: 'Commercial Rights with $5M Indemnity', included: true },
      { text: 'Dedicated AI Solutions Architect & Shared Slack', included: true }
    ],
    ctaText: 'Subscribe to Enterprise'
  }
];

export const COMPARISON_MATRIX = [
  { feature: 'Included AI Tools', starter: '6 Core Tools', pro: 'All 45+ Tools Unlocked', enterprise: 'All Tools + Custom Models' },
  { feature: 'Monthly Neural Tokens', starter: '1,000,000', pro: 'Unlimited (15M Fair Use)', enterprise: 'Unlimited / Custom' },
  { feature: 'GPU Cloud Speed', starter: 'Standard Shared', pro: 'Priority H100 Cluster', enterprise: 'Dedicated Private Cloud' },
  { feature: 'API Rate Limits', starter: '60 req/min', pro: '1,200 req/min', enterprise: 'Unlimited / Burst Custom' },
  { feature: 'Autonomous Agents', starter: 'Limited (1 agent)', pro: 'Unlimited Swarms', enterprise: 'Enterprise Multi-Cluster Swarms' },
  { feature: 'Zero Data Training Retention', starter: 'No', pro: 'Available via API flag', enterprise: 'Guaranteed & Audited' },
  { feature: 'Commercial Rights Indemnity', starter: 'Standard Rights', pro: '$1,000,000 Indemnity', enterprise: '$5,000,000 Indemnity' },
  { feature: 'Support Channel', starter: 'Community Forum', pro: 'Priority VIP Discord & Ticket', enterprise: 'Dedicated Architect & Slack' }
];

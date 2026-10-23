/**
 * Dyzzstore AI Support & Payment Knowledge Engine
 * Provides dual-mode intelligence:
 * 1. Live backend query via /api/ai-chat (Laravel API)
 * 2. Instant client-side NLP fallback with deep store domain knowledge
 */
import { apiUrl } from './api';

export const INITIAL_MESSAGE = {
  id: 'welcome',
  sender: 'bot',
  text: `### Hello! 👋 Welcome to Dyzzstore Support\n\nI'm your **AI Customer Care Assistant**. I can help you with:\n\n- 💳 **How to pay** step-by-step using **Cambodia National KHQR**\n- ⚡ How **instant license key & API delivery** works\n- 💎 Differences between **Single Lifetime Tools** vs **Pro AI Suite**\n- 🛡️ **14-day refund policy** & 100% commercial rights\n- 💬 Connecting with **human support**\n\nHow can I help you today? Choose a question below or type your inquiry!`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  quickReplies: [
    '💳 How do I pay with KHQR?',
    '⚡ How do I get my license key?',
    '💎 Pro Suite vs Single Tool',
    '🏦 Which banks are supported?',
    '🛡️ Money-back guarantee',
    '💬 Contact human support'
  ],
  actions: [
    { type: 'open_checkout', label: '💳 Start Checkout' },
    { type: 'browse_tools', label: '🛍️ Browse AI Tools' }
  ]
};

export const QUICK_PROMPTS = [
  '💳 How do I pay with KHQR?',
  '⚡ How do I get my license key?',
  '💎 Pro Suite vs Single Tool',
  '🏦 Which banks are supported?',
  '🛡️ Money-back guarantee',
  '💬 Contact human support'
];

/**
 * Intelligent Client-Side NLP Knowledge Matcher
 */
export function getLocalAiResponse(userQuery, cartTotal = 0) {
  const q = userQuery.toLowerCase().trim();

  // 1. Payment process & How to pay
  if (
    q.includes('how to pay') ||
    q.includes('process to pay') ||
    q.includes('payment process') ||
    q.includes('how do i pay') ||
    q.includes('how can i pay') ||
    q.includes('pay process') ||
    q.includes('khqr') ||
    q.includes('aba') ||
    q.includes('bakong') ||
    q.includes('scan qr') ||
    q.includes('how to buy') ||
    q.includes('steps to pay') ||
    q.includes('payment method') ||
    q.includes('how payment works')
  ) {
    return {
      reply: `### 💳 How to Pay on Dyzzstore (Instant & Automated)\n\nWe accept **Cambodia National KHQR** for automated, real-time verified payments!\n\n**Here is the simple 5-step process:**\n\n1. **Select Tools or Plan**: Add your chosen AI tools or Pro Subscription to your cart and click **Checkout** (or "Instant KHQR Buy").\n2. **Enter Customer Details**: Fill in your Name & Email address (where your invoice, license key, and instant API token will be sent).\n3. **Dynamic KHQR Generated**: A unique KHQR code matching your exact total${cartTotal > 0 ? ` ($${cartTotal.toFixed(2)})` : ''} appears on screen.\n4. **Scan & Approve**: Open **ABA Mobile**, **Bakong**, **ACLEDA**, **Canadia**, **Wing**, or any Cambodian bank app, tap **Scan QR**, and confirm payment in USD.\n5. **Instant Automated Delivery**: Within **2–3 seconds**, our gateway automatically verifies your payment! Your license key and download link appear on screen immediately with 1-click copy.\n\n💡 *No waiting for manual admin approval. Automated delivery operates 24/7!*`,
      quickReplies: [
        'Open Checkout Now',
        'Which banks are supported?',
        'Where do I get my license key?',
        'Contact human support'
      ],
      actions: [
        { type: 'open_checkout', label: '💳 Open Checkout Window' },
        { type: 'browse_tools', label: '🔍 Browse AI Tools Catalog' }
      ]
    };
  }

  // 2. Supported Banks
  if (
    q.includes('which bank') ||
    q.includes('supported bank') ||
    q.includes('what bank') ||
    q.includes('bank app') ||
    q.includes('acleda') ||
    q.includes('canadia') ||
    q.includes('wing') ||
    q.includes('sathapana') ||
    q.includes('chip mong')
  ) {
    return {
      reply: `### 🏦 Supported Banks & Payment Wallets\n\nOur encrypted KHQR gateway supports **ALL Cambodian banks and mobile wallets** that adhere to the National Bakong KHQR standard:\n\n- 🟢 **ABA Mobile** (Instant USD & KHR)\n- 🔴 **Bakong App** (National payment hub)\n- 🔵 **ACLEDA Mobile**\n- 🟡 **Canadia Bank App**\n- 🔵 **Wing Bank**\n- 🟣 **Sathapana Mobile**\n- 🟠 **Chip Mong Bank**\n- 🟢 **TrueMoney Cambodia**\n\nAll payments are settled automatically in seconds!`,
      quickReplies: ['How do I pay with KHQR?', 'Open Checkout Now', 'Contact human support'],
      actions: [
        { type: 'open_checkout', label: '💳 Proceed to Checkout' }
      ]
    };
  }

  // 3. License Key Delivery & Activation
  if (
    q.includes('license') ||
    q.includes('api key') ||
    q.includes('activation') ||
    q.includes('delivery') ||
    q.includes('where is my key') ||
    q.includes('how to get key') ||
    q.includes('how do i receive') ||
    q.includes('credentials')
  ) {
    return {
      reply: `### ⚡ Instant License Key & API Delivery\n\nThe moment your KHQR scan is confirmed by the bank:\n\n- 🖥️ **Instant On-Screen Display**: Your cryptographically generated license key (e.g. \`LIC-DCP-9812-7801-XC\`) and API token appear on the confirmation screen with a **1-click Copy** button.\n- 📧 **Automated Email Confirmation**: A full receipt with your credentials, invoice PDF, and quick-start docs is dispatched to your email.\n\nAll license keys and activation credentials are delivered immediately upon payment completion!`,
      quickReplies: ['How do I pay with KHQR?', 'Contact human support', 'Single tool vs Pro Suite'],
      actions: []
    };
  }

  // 4. Discounts / Promo Code inquiries (Handled cleanly)
  if (
    q.includes('discount') ||
    q.includes('coupon') ||
    q.includes('promo') ||
    q.includes('code') ||
    q.includes('voucher') ||
    q.includes('sale') ||
    q.includes('deal') ||
    q.includes('cheap')
  ) {
    return {
      reply: `### 🏷️ Direct Lifetime Pricing\n\nAll AI tools and subscriptions on Dyzzstore are already offered at direct wholesale rates with **no extra promotion codes required**:\n\n- **Perpetual Licenses**: From $29 one-time (pay once, keep forever)\n- **Pro AI Suite**: All 45+ premier AI models unlocked\n- **100% Commercial Rights**: Free updates and dedicated API credits\n\nSimply select your tools and checkout with instant KHQR!`,
      quickReplies: ['How do I pay with KHQR?', 'Browse AI Tools', 'Contact human support'],
      actions: [
        { type: 'open_checkout', label: '💳 Proceed to Checkout' },
        { type: 'browse_tools', label: '🛍️ Browse AI Tools' }
      ]
    };
  }

  // 5. Subscription vs Single Tool
  if (
    q.includes('subscription') ||
    q.includes('pro suite') ||
    q.includes('single tool') ||
    q.includes('difference') ||
    q.includes('vs') ||
    q.includes('starter') ||
    q.includes('enterprise') ||
    q.includes('plan') ||
    q.includes('pricing') ||
    q.includes('price') ||
    q.includes('cost')
  ) {
    return {
      reply: `### 💎 Single Tool vs Pro AI Suite Subscription\n\n**Option 1: Single Tool Perpetual License ($29 – $49 one-time)**\n- Pay once, own forever with zero recurring fees.\n- Lifetime minor updates for that specific tool.\n- Dedicated standalone API credits.\n\n**Option 2: Pro AI Suite Subscription ($49/mo billed annually or $59/mo)**\n- Unlocks **ALL 45+ premier AI models & engines**.\n- **UNLIMITED Neural Tokens** (15M fair use).\n- Priority H100 SXM5 GPU cluster speeds.\n- 10 High-speed API keys & multi-agent workflows.\n- 100% Commercial rights with indemnification.\n\nCancel or pause anytime with 1 click!`,
      quickReplies: ['How do I pay with KHQR?', 'Browse AI Tools', 'Contact human support'],
      actions: [
        { type: 'browse_tools', label: '🛍️ Explore AI Tools Catalog' }
      ]
    };
  }

  // 6. Tools Catalog & Features
  if (
    q.includes('tool') ||
    q.includes('model') ||
    q.includes('claude') ||
    q.includes('gpt') ||
    q.includes('chatgpt') ||
    q.includes('deepcode') ||
    q.includes('midjourney') ||
    q.includes('cursor') ||
    q.includes('elevenlabs') ||
    q.includes('voice') ||
    q.includes('diffusion') ||
    q.includes('catalog')
  ) {
    return {
      reply: `### 🚀 Featured AI Models on Dyzzstore\n\nDyzzstore provides unified access to the world's most capable AI engines:\n\n- 🧠 **Synapse Omni-LLM 4.5**: Multimodal frontier reasoning, coding, and analysis.\n- 🎨 **Visionary Diffusion X**: Ultra-photorealistic 8K image & character generation.\n- 💻 **DeepCode Copilot Pro**: Autonomous multi-file codebase engineer.\n- 🎙️ **NeuralVoice Studio 4D**: Ultra-low latency voice cloning & synthesis.\n- ⚡ **QuantumFlow Agent 3.0**: Autonomous web research and workflow automation.\n\nEvery tool comes with instant API access and full commercial rights!`,
      quickReplies: ['How do I pay with KHQR?', 'Single tool vs Pro Suite', 'Contact human support'],
      actions: [
        { type: 'browse_tools', label: '🔍 View Full Catalog' }
      ]
    };
  }

  // 7. Refund Policy & Commercial Rights
  if (q.includes('refund') || q.includes('money back') || q.includes('return') || q.includes('cancel')) {
    return {
      reply: `### 🛡️ 14-Day 100% Money-Back Guarantee\n\nWe stand behind every AI model and software tool we sell!\n\n- **Unconditional 14-Day Refund**: If any tool does not meet your technical expectations or workflow requirements, you can request a full prompt refund.\n- **Hassle-Free**: Simply message our support team or admin on Telegram for a prompt refund.\n- **Subscriptions**: You can cancel anytime with zero lock-in contracts or penalty fees.`,
      quickReplies: ['How do I pay with KHQR?', 'Contact human support', 'Do I own commercial rights?']
    };
  }

  if (q.includes('commercial') || q.includes('copyright') || q.includes('rights') || q.includes('sell') || q.includes('ownership')) {
    return {
      reply: `### ⚖️ 100% Commercial Rights Ownership\n\n**You retain 100% full commercial rights** to everything you generate using Dyzzstore AI tools:\n\n- Sell, trademark, and monetize generated text, code, audio, and visual assets.\n- No royalty fees or mandatory Dyzzstore attribution.\n- Enterprise tier includes formal IP indemnity protection.`,
      quickReplies: ['How do I pay with KHQR?', 'Browse AI Tools', 'Contact human support']
    };
  }

  // 8. Human Support & Telegram
  if (
    q.includes('support') ||
    q.includes('human') ||
    q.includes('admin') ||
    q.includes('telegram') ||
    q.includes('chett4244') ||
    q.includes('contact') ||
    q.includes('person') ||
    q.includes('talk to someone') ||
    q.includes('issue') ||
    q.includes('help')
  ) {
    return {
      reply: `### 💬 Connect with Human Support\n\nNeed assistance from our administrator or sales team?\n\n- ✈️ **Direct Telegram**: [@chett4244](https://t.me/chett4244)\n- ✉️ **Official Email**: support@dyzzstore.store\n- 🕒 **Response Time**: Usually under 5 minutes 24/7!\n\nClick the button below to message **@chett4244** directly on Telegram!`,
      quickReplies: ['How do I pay with KHQR?', 'Where is my license key?', 'Browse AI Tools'],
      actions: [
        { type: 'link', url: 'https://t.me/chett4244', label: '✈️ Contact Human on Telegram (@chett4244)' }
      ]
    };
  }

  // 9. Greetings & Pleasantries
  if (
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q === 'good morning' ||
    q === 'good afternoon' ||
    q === 'yo' ||
    q === 'test'
  ) {
    return {
      reply: `Hello there! 👋 How can I help you today?\n\nI can show you **how to pay with KHQR**, explain our **instant license key delivery**, or help you choose the best AI tool for your project!`,
      quickReplies: [
        '💳 How do I pay with KHQR?',
        '⚡ How do I get my license key?',
        '💎 Pro Suite vs Single Tool',
        '💬 Contact human support'
      ],
      actions: [
        { type: 'open_checkout', label: '💳 Start Checkout' },
        { type: 'browse_tools', label: '🛍️ Browse AI Tools' }
      ]
    };
  }

  // Fallback with intelligent suggestions
  return {
    reply: `I understand! Regarding "${userQuery}":\n\nI'm specialized in helping you navigate Dyzzstore. I can:\n- 💳 Explain our **instant KHQR payment process** step-by-step\n- ⚡ Guide you on **license keys & API credentials**\n- 💎 Compare **single lifetime tools vs Pro Suite**\n- 💬 Connect you directly with **human support on Telegram (@chett4244)**\n\nWhat would you like to explore?`,
    quickReplies: [
      '💳 How do I pay with KHQR?',
      '⚡ How do I get my license key?',
      '💎 Pro Suite vs Single Tool',
      '💬 Contact human support'
    ],
    actions: [
      { type: 'open_checkout', label: '💳 Open Checkout' },
      { type: 'browse_tools', label: '🛍️ Browse AI Tools' }
    ]
  };
}

/**
 * Sends customer message to backend API with automatic fallback to local knowledge
 */
export async function sendAiChatMessage(userMessage, conversationHistory = [], cartTotal = 0) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(apiUrl('/api/ai-chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        history: conversationHistory.slice(-6).map(m => ({ sender: m.sender, text: m.text }))
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.reply) {
        return {
          reply: data.reply,
          quickReplies: data.quick_replies || QUICK_PROMPTS.slice(0, 4),
          actions: data.actions || []
        };
      }
    }
  } catch (err) {
    // Silent network / offline fallback
  }

  // Graceful local instant response
  return getLocalAiResponse(userMessage, cartTotal);
}

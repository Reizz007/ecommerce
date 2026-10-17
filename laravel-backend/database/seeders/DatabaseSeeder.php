<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use App\Models\Subscriber;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Default Admin User
        User::updateOrCreate(
            ['email' => 'admin@synapse.ai'],
            [
                'name' => 'Chief Platform Architect',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        // 2. Create Categories
        $categoriesData = [
            [
                'name' => 'LLM & Reasoning',
                'slug' => 'llm',
                'description' => 'Large language models, deep reasoning engines, and multimodal conversational AI systems.',
                'icon' => 'Brain',
                'color' => '#8b5cf6',
                'badge' => 'Flagship',
                'display_order' => 1,
            ],
            [
                'name' => 'Image & Vision',
                'slug' => 'vision',
                'description' => 'Diffusion models, 8K photorealism generative art studios, and computer vision systems.',
                'icon' => 'Sparkles',
                'color' => '#ec4899',
                'badge' => 'Creative',
                'display_order' => 2,
            ],
            [
                'name' => 'Code & DevOps',
                'slug' => 'code',
                'description' => 'Autonomous coding agents, unit test generators, and repository refactoring engines.',
                'icon' => 'Code2',
                'color' => '#06b6d4',
                'badge' => 'Dev Suite',
                'display_order' => 3,
            ],
            [
                'name' => 'Audio & Voice',
                'slug' => 'audio',
                'description' => 'Zero-shot voice cloning, emotional speech synthesis, and real-time audio isolation.',
                'icon' => 'Mic',
                'color' => '#10b981',
                'badge' => 'Studio',
                'display_order' => 4,
            ],
            [
                'name' => 'Video & 3D',
                'slug' => 'video',
                'description' => 'Kinematic video generation, 3D Gaussian splatting, and neural spatial radiance fields.',
                'icon' => 'Video',
                'color' => '#f59e0b',
                'badge' => 'Hyper-Real',
                'display_order' => 5,
            ],
            [
                'name' => 'Autonomous Agents',
                'slug' => 'agents',
                'description' => 'Self-organizing multi-agent workflows, browser automation, and enterprise web scrapers.',
                'icon' => 'Bot',
                'color' => '#3b82f6',
                'badge' => 'Enterprise',
                'display_order' => 6,
            ],
        ];

        $categoriesMap = [];
        foreach ($categoriesData as $cData) {
            $cat = Category::updateOrCreate(['slug' => $cData['slug']], $cData);
            $categoriesMap[$cData['slug']] = $cat->id;
        }

        // 3. Create Products / AI Tools
        $tools = [
            [
                'product_id' => 'omni-llm',
                'name' => 'Synapse Omni-LLM 4.5',
                'slug' => 'omni-llm',
                'category_slug' => 'llm',
                'badge' => 'Flagship Reasoning',
                'rating' => 4.98,
                'reviews_count' => 3840,
                'users_count' => '62k+',
                'short_desc' => 'Multimodal 2M context window conversational and deep reasoning engine with zero hallucination verification.',
                'capabilities' => ['2M Context Window', 'Document OCR', 'Structured JSON Mode', 'Sub-20ms TTFT'],
                'price_monthly' => 29,
                'price_lifetime' => 199,
                'included_in_sub' => true,
                'engine_version' => 'v4.5-Flash-Turbo',
                'latency' => '14ms',
                'icon' => 'Brain',
                'color' => '#8b5cf6',
                'status' => 'Active',
            ],
            [
                'product_id' => 'visionary-diffusion',
                'name' => 'Visionary Diffusion X',
                'slug' => 'visionary-diffusion',
                'category_slug' => 'vision',
                'badge' => '8K Photorealism',
                'rating' => 4.96,
                'reviews_count' => 2910,
                'users_count' => '48k+',
                'short_desc' => 'Hyper-realistic generative image studio. Render photorealistic portraits, 3D product mockups, and cyberpunk concept art.',
                'capabilities' => ['8K Native Upscale', 'Inpainting & Outpainting', 'Precise Text In Image', 'Prompt Weighting'],
                'price_monthly' => 39,
                'price_lifetime' => 249,
                'included_in_sub' => true,
                'engine_version' => 'v3.2-Latent-Flux',
                'latency' => '0.8s / 8K',
                'icon' => 'Sparkles',
                'color' => '#ec4899',
                'status' => 'Active',
            ],
            [
                'product_id' => 'deepcode-copilot',
                'name' => 'DeepCode Copilot Pro',
                'slug' => 'deepcode-copilot',
                'category_slug' => 'code',
                'badge' => 'Autonomous Dev',
                'rating' => 4.99,
                'reviews_count' => 4120,
                'users_count' => '78k+',
                'short_desc' => 'Autonomous full-stack AI coding assistant. Generates production-ready code, writes unit tests, and refactors complex repos.',
                'capabilities' => ['32 Languages Supported', '99.4% Test Pass Rate', 'Git & Docker Native', 'OWASP Security Scan'],
                'price_monthly' => 24,
                'price_lifetime' => 179,
                'included_in_sub' => true,
                'engine_version' => 'v4.5-CodeNeural',
                'latency' => '22ms',
                'icon' => 'Code2',
                'color' => '#06b6d4',
                'status' => 'Active',
            ],
            [
                'product_id' => 'audiogen-studio',
                'name' => 'AudioGen Master Studio',
                'slug' => 'audiogen-studio',
                'category_slug' => 'audio',
                'badge' => 'Zero-Shot Voice',
                'rating' => 4.92,
                'reviews_count' => 1840,
                'users_count' => '31k+',
                'short_desc' => 'Studio-grade voice cloning and cinematic sound design. Clone any voice with a 3-second sample in 48 languages.',
                'capabilities' => ['3s Voice Cloning', 'Emotional Prosody', 'Stems Isolation', '48kHz Lossless WAV'],
                'price_monthly' => 19,
                'price_lifetime' => 149,
                'included_in_sub' => true,
                'engine_version' => 'v2.8-NeuralVoice',
                'latency' => '45ms',
                'icon' => 'Mic',
                'color' => '#10b981',
                'status' => 'Active',
            ],
            [
                'product_id' => 'videogen-4d',
                'name' => 'VideoGen 4D Kinematic',
                'slug' => 'videogen-4d',
                'category_slug' => 'video',
                'badge' => 'Cinema 60FPS',
                'rating' => 4.97,
                'reviews_count' => 2240,
                'users_count' => '39k+',
                'short_desc' => 'Text-to-video cinematic renderer with temporal consistency, physics simulation, and 4K 60FPS camera motion control.',
                'capabilities' => ['4K 60FPS Output', 'Camera Path Director', 'Physics Consistency', 'Multi-shot Storyboards'],
                'price_monthly' => 49,
                'price_lifetime' => 299,
                'included_in_sub' => true,
                'engine_version' => 'v2.0-Sora-Kinematic',
                'latency' => '12s / clip',
                'icon' => 'Video',
                'color' => '#f59e0b',
                'status' => 'Active',
            ],
            [
                'product_id' => 'neural-agent-orchestrator',
                'name' => 'Neural Agent Orchestrator',
                'slug' => 'neural-agent-orchestrator',
                'category_slug' => 'agents',
                'badge' => 'Autonomous Swarm',
                'rating' => 4.95,
                'reviews_count' => 1520,
                'users_count' => '24k+',
                'short_desc' => 'Multi-agent goal-seeking swarm. Deploys cooperative AI agents that browse the web, write reports, and execute API pipelines.',
                'capabilities' => ['Recursive Task Solver', 'Headless Browser Ops', 'Tool Calling Framework', 'Auto-healing Logic'],
                'price_monthly' => 34,
                'price_lifetime' => 229,
                'included_in_sub' => true,
                'engine_version' => 'v3.5-SwarmMesh',
                'latency' => 'Real-time Async',
                'icon' => 'Bot',
                'color' => '#3b82f6',
                'status' => 'Active',
            ],
            [
                'product_id' => 'quantum-math-pro',
                'name' => 'Quantum Math Pro',
                'slug' => 'quantum-math-pro',
                'category_slug' => 'llm',
                'badge' => 'Formal Verification',
                'rating' => 4.99,
                'reviews_count' => 1190,
                'users_count' => '18k+',
                'short_desc' => 'Formal theorem prover and symbolic math engine. Solves IMO-grade competition mathematics with Lean 4 verification.',
                'capabilities' => ['Lean 4 Formal Proofs', 'LaTeX Export', 'Symbolic Integration', 'Zero Algebraic Drift'],
                'price_monthly' => 22,
                'price_lifetime' => 169,
                'included_in_sub' => true,
                'engine_version' => 'v1.9-SymPyNeural',
                'latency' => '32ms',
                'icon' => 'Cpu',
                'color' => '#6366f1',
                'status' => 'Active',
            ],
            [
                'product_id' => '3d-mesh-radiance',
                'name' => '3D Mesh Radiance Studio',
                'slug' => '3d-mesh-radiance',
                'category_slug' => 'video',
                'badge' => 'NeRF & Splatting',
                'rating' => 4.93,
                'reviews_count' => 1340,
                'users_count' => '21k+',
                'short_desc' => 'Convert single 2D images or video into textured PBR 3D meshes and Gaussian Splats ready for Blender, Unreal Engine, and Unity.',
                'capabilities' => ['FBX / OBJ / GLTF', 'PBR Texture Maps', 'Gaussian Splats (.ply)', 'Rigged Topology'],
                'price_monthly' => 44,
                'price_lifetime' => 269,
                'included_in_sub' => true,
                'engine_version' => 'v3.0-GaussianSplat',
                'latency' => '4.2s / mesh',
                'icon' => 'Layers',
                'color' => '#d946ef',
                'status' => 'Active',
            ],
            [
                'product_id' => 'voice-isolate-neural',
                'name' => 'VoiceIsolate Neural De-Noiser',
                'slug' => 'voice-isolate-neural',
                'category_slug' => 'audio',
                'badge' => 'Studio Isolation',
                'rating' => 4.94,
                'reviews_count' => 980,
                'users_count' => '15k+',
                'short_desc' => 'Real-time background noise, room reverb, and mic clipping removal for podcast creators, Twitch streamers, and call centers.',
                'capabilities' => ['Zero Latency VST/AU', '40dB Noise Attenuation', 'De-Reverb Algorithm', 'Spatial Binaural'],
                'price_monthly' => 14,
                'price_lifetime' => 99,
                'included_in_sub' => true,
                'engine_version' => 'v2.1-DeepFilter',
                'latency' => '3ms VST',
                'icon' => 'Headphones',
                'color' => '#14b8a6',
                'status' => 'Active',
            ],
            [
                'product_id' => 'cyber-sentinel-scanner',
                'name' => 'CyberSentinel AI Pentest',
                'slug' => 'cyber-sentinel-scanner',
                'category_slug' => 'code',
                'badge' => 'DevSecOps',
                'rating' => 4.98,
                'reviews_count' => 1670,
                'users_count' => '28k+',
                'short_desc' => 'Automated smart contract and cloud infrastructure vulnerability scanner with AI exploit payload generation and zero-day detection.',
                'capabilities' => ['Solidity / Rust Audit', 'Kubernetes Config Scan', 'Automated CVE Exploit', 'SOC2 Compliance Report'],
                'price_monthly' => 59,
                'price_lifetime' => 389,
                'included_in_sub' => true,
                'engine_version' => 'v4.0-SentinelZero',
                'latency' => 'Cloud Cluster',
                'icon' => 'Shield',
                'color' => '#ef4444',
                'status' => 'Active',
            ],
        ];

        foreach ($tools as $tool) {
            $catId = $categoriesMap[$tool['category_slug']] ?? null;
            $tool['category_id'] = $catId;
            Product::updateOrCreate(['slug' => $tool['slug']], $tool);
        }

        // 4. Default Settings
        Setting::set('aba_pay_link', 'https://link.payway.com.kh/ABAPAY9s540501U');
        Setting::set('announcement_text', 'Synapse Omni-LLM 4.5 & VideoGen 4D are now live! Get 20% OFF all annual subscriptions with code NEURON20');
        Setting::set('system_status', 'All AI Clusters Operational (99.99% SLA)');
        Setting::set('maintenance_mode', false);
        Setting::set('promo_codes', [
            ['code' => 'NEURON20', 'percent' => 20, 'active' => true],
            ['code' => 'AIWELCOME', 'amount' => 10, 'active' => true],
        ]);

        // 5. Seed Initial Orders
        $orders = [
            [
                'order_number' => 'SYN-ORD-1092',
                'customer_name' => 'Alex Vance',
                'customer_email' => 'alex@venturelabs.ai',
                'company' => 'VentureLabs Inc.',
                'items' => ['Pro AI Suite (Annual Subscription)'],
                'amount' => 588,
                'payment_method' => 'ABA PAY / PayWay',
                'aba_link' => 'https://link.payway.com.kh/ABAPAY9s540501U',
                'status' => 'Verified',
                'api_key' => 'sk_synapse_live_98a7f1c90e2b45398ab7102e88a',
            ],
            [
                'order_number' => 'SYN-ORD-1088',
                'customer_name' => 'Sarah Lin',
                'customer_email' => 'sarah@hyperdrive.studio',
                'company' => 'HyperDrive Studio',
                'items' => ['Visionary Diffusion X', 'VideoGen 4D Kinematic'],
                'amount' => 548,
                'payment_method' => 'ABA PAY / PayWay',
                'aba_link' => 'https://link.payway.com.kh/ABAPAY9s540501U',
                'status' => 'Verified',
                'api_key' => 'sk_synapse_live_4b7019cf882141aa9e71239cd01',
            ],
            [
                'order_number' => 'SYN-ORD-1075',
                'customer_name' => 'David Miller',
                'customer_email' => 'david@neurofin.io',
                'company' => 'NeuroFin Quantum',
                'items' => ['Quantum Math Pro (Lifetime)'],
                'amount' => 169,
                'payment_method' => 'Credit Card',
                'aba_link' => null,
                'status' => 'Verified',
                'api_key' => 'sk_synapse_live_12c983ba299042bba081192e204',
            ],
        ];

        foreach ($orders as $ord) {
            Order::updateOrCreate(['order_number' => $ord['order_number']], $ord);
        }

        // 6. Seed Initial Subscribers
        $subscribers = [
            [
                'name' => 'Alex Vance',
                'email' => 'alex@venturelabs.ai',
                'plan' => 'Pro AI Suite (Annual)',
                'tier' => 'pro',
                'tokens_used' => 3840000,
                'token_limit' => 15000000,
                'status' => 'Active',
                'renews_on' => '2027-10-16',
                'payment_method' => 'ABA PAY / PayWay',
            ],
            [
                'name' => 'Elena Rostova',
                'email' => 'elena@cybernetics.de',
                'plan' => 'Starter Creator (Monthly)',
                'tier' => 'starter',
                'tokens_used' => 1240000,
                'token_limit' => 2000000,
                'status' => 'Active',
                'renews_on' => '2026-11-15',
                'payment_method' => 'Credit Card',
            ],
            [
                'name' => 'Kenji Sato',
                'email' => 'kenji@tokyo-automata.jp',
                'plan' => 'Enterprise Sovereign (Annual)',
                'tier' => 'enterprise',
                'tokens_used' => 48200000,
                'token_limit' => 100000000,
                'status' => 'Active',
                'renews_on' => '2027-08-20',
                'payment_method' => 'ABA PAY / PayWay',
            ],
        ];

        foreach ($subscribers as $sub) {
            Subscriber::updateOrCreate(['email' => $sub['email']], $sub);
        }
    }
}

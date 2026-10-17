import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Layers, 
  PiggyBank, 
  RefreshCw, 
  Headphones, 
  Code2, 
  Check, 
  Cpu, 
  ArrowRight 
} from 'lucide-react';

export default function PlatformFeatures() {
  return (
    <section className="features-section" id="features">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-tag">
            <Cpu size={14} /> ENTERPRISE CLOUD ARCHITECTURE
          </span>
          <h2 className="section-title">
            Engineered For <span className="gradient-text">Extreme Speed & Privacy</span>
          </h2>
          <p className="section-desc">
            Why 185k+ developers choose Synapse.AI over fragmented model APIs and individual app subscriptions.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-box-icon">
              <Zap size={22} />
            </div>
            <h3>Sub-15ms Neural Gateway</h3>
            <p>
              Intelligent geo-distributed load balancing automatically routes your requests to the lowest latency NVIDIA H100 GPU cluster globally.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-box-icon">
              <ShieldCheck size={22} />
            </div>
            <h3>Zero Data Training Guarantee</h3>
            <p>
              Your proprietary code, business documents, and customer data are strictly quarantined and never used to retrain foundational models.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-box-icon">
              <Layers size={22} />
            </div>
            <h3>One Standardized SDK</h3>
            <p>
              Switch between Omni-LLM reasoning, Diffusion X image generation, and DeepCode with a single NPM or Python package.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-box-icon">
              <PiggyBank size={22} />
            </div>
            <h3>70% Tech Stack Cost Reduction</h3>
            <p>
              Consolidate image, video, code, voice, and reasoning tools under one consolidated monthly or annual bill. Zero fragmented invoices.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-box-icon">
              <RefreshCw size={22} />
            </div>
            <h3>Instant Model Upgrades</h3>
            <p>
              Whenever a newly released frontier model breaks benchmarks, it is automatically deployed to your active subscription with zero migration downtime.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-box-icon">
              <Headphones size={22} />
            </div>
            <h3>Direct AI Research Support</h3>
            <p>
              Chat directly with machine learning researchers and systems architects on our private member Discord and priority ticket desk.
            </p>
          </div>
        </div>

        {/* Visual Showcase Banner */}
        <div className="feature-showcase-banner">
          <div className="showcase-content">
            <span className="badge-pill">DEEPCODE COPILOT v4.5</span>
            <h3>Autonomous Code Architecture & Full-Stack Refactoring</h3>
            <p>
              Generate, refactor, and deploy entire microservices directly from natural language specifications. Fully integrated with Git, Docker, and Kubernetes.
            </p>
            <ul className="feature-checklist">
              <li>
                <Check size={16} className="text-cyan mr-2" />
                Supports 32 programming languages & 80+ modern frameworks
              </li>
              <li>
                <Check size={16} className="text-cyan mr-2" />
                Automated test suite generation with 99.4% pass rates
              </li>
              <li>
                <Check size={16} className="text-cyan mr-2" />
                Real-time OWASP security audit and automated remediation
              </li>
            </ul>
            <a href="#tools" className="btn btn-primary btn-glow mt-4">
              <span>View DeepCode in Store</span>
              <ArrowRight size={16} />
            </a>
          </div>
          <div className="showcase-image-container">
            <img
              src="/assets/images/code.jpg"
              alt="DeepCode Autonomous Engineering Laboratory"
              className="showcase-img"
            />
            <div className="image-overlay-glow"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

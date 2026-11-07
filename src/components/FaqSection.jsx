import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FAQS_DATA } from '../data/faqsData';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function FaqSection() {
  const { t } = useApp();
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="faq-section" id="faq">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-tag">
            <HelpCircle size={14} /> {t('faq_section_tag', 'HELP & FAQS')}
          </span>
          <h2 className="section-title">
            {t('faq_title_1', 'Frequently Asked')} <span className="gradient-text">{t('faq_title_2', 'Questions')}</span>
          </h2>
          <p className="section-desc">
            {t('faq_desc', 'Everything you need to know about purchasing AI tools, managing API keys, and subscription billing.')}
          </p>
        </div>

        <div className="faq-accordion">
          {FAQS_DATA.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    size={18}
                    className={`faq-arrow ${isOpen ? 'rotate' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

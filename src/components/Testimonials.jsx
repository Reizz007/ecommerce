import React from 'react';
import { useApp } from '../context/AppContext';
import { TESTIMONIALS_DATA } from '../data/faqsData';
import { Star, MessageSquareQuote, CheckCircle2 } from 'lucide-react';

export default function Testimonials() {
  const { t } = useApp();

  return (
    <section className="testimonials-section" id="testimonials">
      <div id="reviews" style={{ position: 'relative', top: '-80px', visibility: 'hidden' }}></div>
      <div className="container">
        <div className="section-header text-center">
          <span className="section-tag">
            <MessageSquareQuote size={14} /> {t('reviews_section_tag', 'WALL OF LOVE')}
          </span>
          <h2 className="section-title">
            {t('reviews_title_1', 'Loved By Builders')} <span className="gradient-text">{t('reviews_title_2', 'Around The Globe')}</span>
          </h2>
          <p className="section-desc">
            {t('reviews_desc', 'See how high-growth startups, indie hackers, and creative agencies build 10x faster with Dyzzstore.')}
          </p>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS_DATA.map((t) => (
            <div
              key={t.id}
              className={`testimonial-card ${t.highlight ? 'highlight-card' : ''}`}
            >
              <div className="stars-row">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-warning text-warning" />
                ))}
              </div>
              <p className="testimonial-body">"{t.body}"</p>
              <div className="author-info">
                <div className="author-avatar">{t.avatar}</div>
                <div>
                  <div className="author-name flex-items-center">
                    <span>{t.name}</span>
                    <CheckCircle2 size={13} className="text-cyan ml-1" />
                  </div>
                  <div className="author-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

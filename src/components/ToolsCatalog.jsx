import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TOOLS_DATA } from '../data/toolsData';
import { 
  Search, 
  X, 
  Star, 
  Brain, 
  Code2, 
  Sparkles, 
  Mic, 
  Video, 
  Workflow, 
  Database, 
  ShieldCheck, 
  Sliders, 
  TrendingUp, 
  ShoppingCart, 
  Eye, 
  Zap, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

const ICON_MAP = {
  Brain,
  Sparkles,
  Code2,
  Mic,
  Video,
  Workflow,
  Database,
  ShieldCheck,
  Sliders,
  TrendingUp
};

const CATEGORIES = [
  { id: 'all', label: 'All Tools', icon: null },
  { id: 'llm', label: 'LLM & Reasoning', icon: Brain },
  { id: 'code', label: 'Code & Dev', icon: Code2 },
  { id: 'vision', label: 'Vision & Art', icon: Sparkles },
  { id: 'video', label: 'Video & 3D', icon: Video },
  { id: 'audio', label: 'Audio & Voice', icon: Mic },
  { id: 'data', label: 'Data & SEO', icon: Database }
];

export default function ToolsCatalog({ searchRef }) {
  const { addToCart, formatPrice, setSelectedToolModal, tools: catalogTools } = useApp();
  const sourceTools = useMemo(() => {
    let deleted = [];
    try {
      deleted = JSON.parse(localStorage.getItem('synapse_deleted_tools') || '[]');
    } catch {}
    const list = Array.isArray(catalogTools) && catalogTools.length > 0 ? catalogTools : TOOLS_DATA;
    return list.filter(t => !deleted.includes(t.id) && !deleted.includes(t.slug) && !deleted.includes(t.product_id));
  }, [catalogTools]);

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pricingFilter, setPricingFilter] = useState('all'); // 'all' | 'subscription' | 'lifetime'
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'rating' | 'price-asc' | 'price-desc'

  const filteredTools = useMemo(() => {
    return sourceTools.filter((tool) => {
      // Category filter
      const toolCat = String(tool.category_slug || (typeof tool.category === 'object' ? tool.category?.slug : tool.category) || '').toLowerCase();
      if (activeCategory !== 'all' && toolCat !== activeCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = (tool.name || '').toLowerCase().includes(query);
        const matchesDesc = (tool.shortDesc || tool.short_desc || tool.description || '').toLowerCase().includes(query);
        const caps = Array.isArray(tool.capabilities) ? tool.capabilities : (typeof tool.capabilities === 'string' ? tool.capabilities.split(',') : []);
        const matchesCap = caps.some((c) => String(c).toLowerCase().includes(query));
        const matchesBadge = (tool.badge || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCap && !matchesBadge) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const priceA = a.priceLifetime || a.price_lifetime || a.priceMonthly || a.price_monthly || 0;
      const priceB = b.priceLifetime || b.price_lifetime || b.priceMonthly || b.price_monthly || 0;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      return (b.reviewsCount || b.reviews_count || 0) - (a.reviewsCount || a.reviews_count || 0);
    });
  }, [sourceTools, activeCategory, searchQuery, sortBy]);

  const handleAddToolToCart = (tool) => {
    const price = tool.priceLifetime || tool.price_lifetime || tool.priceMonthly || tool.price_monthly || 0;
    addToCart({
      id: `${tool.id}_license`,
      name: `${tool.name} (Perpetual License)`,
      type: 'tool',
      price: price,
      toolId: tool.id,
      badge: tool.badge || 'License'
    });
  };

  return (
    <section className="tools-section" id="tools">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-tag">
            <Zap size={14} /> TOOL CATALOG
          </span>
          <h2 className="section-title">
            Explore 45+ Premier <span className="gradient-text">AI Engines & Tools</span>
          </h2>
          <p className="section-desc">
            Purchase perpetual lifetime licenses with zero recurring fees, or access all tools via our unified Pro AI Suite subscription.
          </p>
        </div>

        {/* Toolbar */}
        <div className="catalog-toolbar">
          {/* Categories */}
          <div className="category-filters">
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.id}
                  className={`cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {IconComp && <IconComp size={15} />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search + Filter Inputs */}
          <div className="toolbar-subcontrols">
            <div className="search-input-box">
              <Search size={16} className="search-icon" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search tools, models, capabilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear Search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="filter-dropdown-group">
              <select
                className="filter-select"
                value={pricingFilter}
                onChange={(e) => setPricingFilter(e.target.value)}
                aria-label="Filter by License Type"
              >
                <option value="all">All License Types</option>
                <option value="subscription">Included in Subscription</option>
                <option value="lifetime">Lifetime License Available</option>
              </select>

              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort Order"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Results Count */}
        <div className="active-filter-bar">
          <span className="results-count">
            Showing <strong>{filteredTools.length}</strong> AI Tools
          </span>
          {(activeCategory !== 'all' || searchQuery || pricingFilter !== 'all') && (
            <button
              className="btn-reset-filters"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                setPricingFilter('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="tools-grid">
            {filteredTools.map((tool) => {
              const IconComponent = ICON_MAP[tool.icon] || Brain;
              return (
                <div 
                  key={tool.id} 
                  className="tool-card"
                  onClick={() => setSelectedToolModal(tool)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="tool-card-glow" style={{ background: `radial-gradient(circle at 50% 0%, ${tool.color}25, transparent 70%)` }}></div>
                  
                  <div className="tool-card-top">
                    <div className="tool-icon-wrapper" style={{ color: tool.color, borderColor: `${tool.color}40`, backgroundColor: `${tool.color}15` }}>
                      <IconComponent size={24} />
                    </div>
                    <span className="tool-badge-pill" style={{ borderColor: `${tool.color}50`, color: tool.color }}>
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="tool-name">{tool.name}</h3>

                  <div className="tool-meta-row">
                    <span className="tool-rating">
                      <Star size={14} className="fill-warning text-warning" />
                      <strong>{tool.rating || 5.0}</strong> ({(tool.reviewsCount || tool.reviews_count || 100).toLocaleString()})
                    </span>
                    <span className="tool-users">
                      <Zap size={13} className="text-accent" /> {tool.usersCount || tool.users_count || '1k+'} Active Users
                    </span>
                  </div>

                  <p className="tool-description">{tool.shortDesc || tool.short_desc || tool.description || ''}</p>

                  <div className="tool-capabilities">
                    {(Array.isArray(tool.capabilities) ? tool.capabilities : (typeof tool.capabilities === 'string' ? tool.capabilities.split(',') : [])).map((cap, idx) => (
                      <span key={idx} className="capability-tag">
                        <CheckCircle2 size={12} className="text-cyan mr-1" /> {String(cap).trim()}
                      </span>
                    ))}
                  </div>

                  {/* Production Ready API Highlight Badge */}
                  <div className="subscription-included-badge">
                    <Zap size={14} className="text-cyan fill-cyan" />
                    <span>Verified <strong>Production-Ready API</strong> (Instant Deployment)</span>
                  </div>

                  {/* Price & Buy Action Footer */}
                  <div className="tool-card-footer">
                    <div className="tool-pricing-info">
                      <div className="tool-lifetime-price">
                        {formatPrice(tool.priceLifetime || tool.price_lifetime || tool.priceMonthly || tool.price_monthly || 0)}
                        <span className="lifetime-label">perpetual license</span>
                      </div>
                    </div>

                    <div className="tool-actions-row">
                      <button
                        className="btn-icon-view"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedToolModal(tool);
                        }}
                        title="View API Docs & Details"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="btn btn-primary btn-sm btn-glow"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToolToCart(tool, 'lifetime');
                        }}
                      >
                        <ShoppingCart size={15} />
                        <span>Buy License</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Search size={32} />
            </div>
            <h3>No AI Tools Found</h3>
            <p>We couldn't find any tools matching "{searchQuery}". Try searching with different keywords.</p>
            <button
              className="btn btn-secondary mt-3"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                setPricingFilter('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

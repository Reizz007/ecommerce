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
  ExternalLink,
  Boxes,
  Bot,
  FolderKanban,
  Cpu,
  Layers,
  Tag,
  Headphones,
  Globe,
  Wrench,
  Rocket,
  Flame
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
  TrendingUp,
  Boxes,
  Bot,
  FolderKanban,
  Cpu,
  Layers,
  Tag,
  Headphones,
  Globe,
  Wrench,
  Rocket,
  Flame
};

function getIconForCategory(nameOrSlug = '') {
  const s = String(nameOrSlug).toLowerCase();
  if (s.includes('brain') || s.includes('llm') || s.includes('reasoning') || s.includes('gpt')) return Brain;
  if (s.includes('code') || s.includes('dev') || s.includes('program')) return Code2;
  if (s.includes('vision') || s.includes('art') || s.includes('image') || s.includes('draw')) return Sparkles;
  if (s.includes('video') || s.includes('3d') || s.includes('anim')) return Video;
  if (s.includes('audio') || s.includes('voice') || s.includes('speech') || s.includes('sound')) return Mic;
  if (s.includes('data') || s.includes('seo') || s.includes('analytic')) return Database;
  if (s.includes('agent') || s.includes('flow') || s.includes('auto')) return Workflow;
  if (s.includes('tool') || s.includes('box') || s.includes('pack')) return Boxes;
  if (s.includes('bot') || s.includes('robot')) return Bot;
  if (s.includes('folder') || s.includes('suite')) return FolderKanban;
  return Boxes;
}

const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'All Tools', icon: null },
  { id: 'llm', label: 'LLM & Reasoning', icon: Brain },
  { id: 'code', label: 'Code & Dev', icon: Code2 },
  { id: 'vision', label: 'Vision & Art', icon: Sparkles },
  { id: 'video', label: 'Video & 3D', icon: Video },
  { id: 'audio', label: 'Audio & Voice', icon: Mic },
  { id: 'data', label: 'Data & SEO', icon: Database }
];

export default function ToolsCatalog({ searchRef }) {
  const { addToCart, formatPrice, setSelectedToolModal, tools: catalogTools, categories: adminCategories } = useApp();
  const sourceTools = useMemo(() => {
    let deleted = [];
    try {
      deleted = JSON.parse(localStorage.getItem('synapse_deleted_tools') || '[]');
    } catch {}
    const list = Array.isArray(catalogTools) && catalogTools.length > 0 ? catalogTools : TOOLS_DATA;
    return list.filter(t => !deleted.includes(t.id) && !deleted.includes(t.slug) && !deleted.includes(t.product_id));
  }, [catalogTools]);

  // Dynamically derive category pills from Admin Panel / Laravel Database
  const categoryList = useMemo(() => {
    const allPill = { id: 'all', label: 'All Tools', icon: null };
    const pills = [];
    const seenIds = new Set(['all']);

    // 1. Add categories configured in Admin Panel / Database (sorted by display_order)
    if (Array.isArray(adminCategories) && adminCategories.length > 0) {
      const sortedAdmin = [...adminCategories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      for (const cat of sortedAdmin) {
        const id = String(cat.slug || cat.id).toLowerCase().trim();
        if (!seenIds.has(id)) {
          seenIds.add(id);
          pills.push({
            id: cat.slug || String(cat.id),
            rawId: cat.id,
            slug: cat.slug,
            label: cat.name,
            icon: ICON_MAP[cat.icon] || getIconForCategory(cat.slug || cat.name),
            badge: cat.badge,
            color: cat.color
          });
        }
      }
    }

    // 2. Also ensure any extra category present on tools in sourceTools is included
    for (const t of sourceTools) {
      const catSlug = String(t.category_slug || (typeof t.category === 'object' ? t.category?.slug : t.category) || '').toLowerCase().trim();
      if (catSlug && !seenIds.has(catSlug)) {
        seenIds.add(catSlug);
        const catName = typeof t.category === 'object' && t.category?.name 
          ? t.category.name 
          : catSlug.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        pills.push({
          id: catSlug,
          rawId: t.category_id,
          slug: catSlug,
          label: catName,
          icon: getIconForCategory(catSlug),
          badge: null,
          color: '#8b5cf6'
        });
      }
    }

    // 3. Fallback to default categories if neither admin nor tools have categories
    if (pills.length === 0) {
      return DEFAULT_CATEGORIES;
    }

    return [allPill, ...pills];
  }, [adminCategories, sourceTools]);

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pricingFilter, setPricingFilter] = useState('all'); // 'all' | 'subscription' | 'lifetime'
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'rating' | 'price-asc' | 'price-desc'

  const filteredTools = useMemo(() => {
    return sourceTools.filter((tool) => {
      // Category filter - robust matching by slug, id, or name
      if (activeCategory !== 'all') {
        const catSlug = String(tool.category_slug || (typeof tool.category === 'object' ? tool.category?.slug : tool.category) || '').toLowerCase().trim();
        const catId = String(tool.category_id || (typeof tool.category === 'object' ? tool.category?.id : '') || '').trim();
        const catName = String(typeof tool.category === 'object' ? tool.category?.name : '').toLowerCase().trim();
        const activeLower = String(activeCategory).toLowerCase().trim();

        const matches = 
          catSlug === activeLower ||
          catId === activeLower ||
          catName === activeLower;

        if (!matches) {
          return false;
        }
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
            {categoryList.map((cat) => {
              const IconComp = cat.icon;
              const count = cat.id === 'all' 
                ? sourceTools.length 
                : sourceTools.filter(t => {
                    const slug = String(t.category_slug || (typeof t.category === 'object' ? t.category?.slug : t.category) || '').toLowerCase().trim();
                    const id = String(t.category_id || (typeof t.category === 'object' ? t.category?.id : '') || '').trim();
                    const name = String(typeof t.category === 'object' ? t.category?.name : '').toLowerCase().trim();
                    const target = String(cat.id).toLowerCase().trim();
                    return slug === target || id === target || name === target || (cat.rawId && id === String(cat.rawId));
                  }).length;

              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  className={`cat-pill ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                  style={isActive && cat.color ? { borderColor: cat.color, boxShadow: `0 0 16px ${cat.color}40` } : {}}
                >
                  {IconComp && <IconComp size={15} style={cat.color ? { color: cat.color } : {}} />}
                  <span>{cat.label}</span>
                  {count > 0 && (
                    <span 
                      className="cat-count-pill" 
                      style={{
                        fontSize: '0.72rem',
                        opacity: 0.85,
                        marginLeft: '0.2rem',
                        padding: '1px 5px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.12)'
                      }}
                    >
                      {count}
                    </span>
                  )}
                  {cat.badge && (
                    <span 
                      className="cat-badge-pill" 
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginLeft: '0.25rem',
                        padding: '1px 6px',
                        borderRadius: '6px',
                        background: cat.color ? `${cat.color}25` : 'rgba(139, 92, 246, 0.25)',
                        color: cat.color || 'var(--cyan)',
                        border: `1px solid ${cat.color ? `${cat.color}40` : 'rgba(139, 92, 246, 0.4)'}`
                      }}
                    >
                      {cat.badge}
                    </span>
                  )}
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

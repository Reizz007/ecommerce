import React, { useState, useRef, useEffect } from 'react';
import { useApp, LANGUAGES } from '../context/AppContext';
import { ChevronDown } from 'lucide-react';

export default function LanguageSelector() {
  const { language, setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = LANGUAGES[language] || LANGUAGES.kh;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="language-selector-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="language-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch Language"
        title="Switch Language"
      >
        <img
          src={currentLang.flag}
          alt={currentLang.label}
          className="language-flag-img"
        />
        <span className="language-label-text">{currentLang.shortLabel}</span>
        <ChevronDown size={12} className={`language-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="language-dropdown-menu">
          {Object.values(LANGUAGES).map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                className={`language-menu-item ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
              >
                <img
                  src={lang.flag}
                  alt={lang.label}
                  className="language-flag-img"
                />
                <span className="language-menu-label">{lang.label}</span>
                {isSelected && <span className="language-check-mark">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


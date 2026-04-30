import React, { useState, useRef } from 'react';
import { parsePhoneNumberFromString, getCountries, getCountryCallingCode } from 'libphonenumber-js';

// Top countries shown first
const PRIORITY = ['NG', 'GB', 'US', 'CA', 'GH', 'KE', 'ZA', 'DE', 'NL', 'SE', 'FR', 'AE'];

const FLAG = (code) => {
  // Convert ISO 3166-1 alpha-2 to flag emoji
  return code.toUpperCase().replace(/./g, c =>
    String.fromCodePoint(127397 + c.charCodeAt())
  );
};

const COUNTRY_NAMES = new Intl.DisplayNames(['en'], { type: 'region' });

function buildList() {
  const all = getCountries();
  const priority = PRIORITY.filter(c => all.includes(c));
  const rest = all
    .filter(c => !PRIORITY.includes(c))
    .sort((a, b) => COUNTRY_NAMES.of(a).localeCompare(COUNTRY_NAMES.of(b)));
  return [...priority, 'DIVIDER', ...rest];
}

const COUNTRIES = buildList();

export default function PhoneInput({ label, value = '', onChange, error, placeholder = '800 000 0000' }) {
  const [country, setCountry] = useState('NG');
  const [number,  setNumber]  = useState('');
  const [open,    setOpen]    = useState(false);
  const [search,  setSearch]  = useState('');
  const dropRef = useRef(null);

  const dial = getCountryCallingCode(country);

  const emit = (c, n) => {
    const raw = `+${getCountryCallingCode(c)}${n.replace(/\D/g, '')}`;
    onChange?.(raw);
  };

  const handleCountry = (c) => {
    setCountry(c);
    setOpen(false);
    setSearch('');
    emit(c, number);
  };

  const handleNumber = (e) => {
    const n = e.target.value.replace(/[^\d\s\-().]/g, '');
    setNumber(n);
    emit(country, n);
  };

  const filtered = COUNTRIES.filter(c => {
    if (c === 'DIVIDER') return true;
    if (!search) return true;
    const name = COUNTRY_NAMES.of(c).toLowerCase();
    const code = `+${getCountryCallingCode(c)}`;
    return name.includes(search.toLowerCase()) || code.includes(search) || c.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {label && (
        <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)' }}>
          {label}
        </label>
      )}
      <div style={{ display: 'flex', gap: '0', position: 'relative' }}>
        {/* Country selector */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.75rem 0.75rem',
            background: 'var(--surface-2)',
            border: `1px solid ${error ? 'var(--red)' : open ? 'var(--teal)' : 'var(--border)'}`,
            borderRight: 'none',
            borderRadius: 'var(--radius) 0 0 var(--radius)',
            cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
            color: 'var(--text)',
            boxShadow: open ? '0 0 0 3px var(--teal-border)' : 'none',
            transition: 'var(--trans-fast)',
          }}
        >
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{FLAG(country)}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--teal)' }}>+{dial}</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-3)', marginLeft: '0.1rem' }}>▼</span>
        </button>

        {/* Number input */}
        <input
          type="tel"
          value={number}
          onChange={handleNumber}
          placeholder={placeholder}
          style={{
            flex: 1,
            borderRadius: '0 var(--radius) var(--radius) 0',
            borderColor: error ? 'var(--red)' : undefined,
            boxShadow: error ? '0 0 0 3px var(--red-faint)' : undefined,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.05em',
          }}
        />

        {/* Dropdown */}
        {open && (
          <div
            ref={dropRef}
            style={{
              position: 'absolute', top: '100%', left: 0, zIndex: 200, marginTop: 4,
              width: 280, maxHeight: 320, overflowY: 'auto',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--surface-2)', zIndex: 1 }}>
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search country…"
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            {filtered.map((c, i) => {
              if (c === 'DIVIDER') return (
                <div key="div" style={{ height: 1, background: 'var(--border)', margin: '0.25rem 0' }} />
              );
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCountry(c)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    width: '100%', padding: '0.5rem 0.75rem',
                    background: c === country ? 'var(--teal-faint)' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    color: 'var(--text)', fontSize: '0.85rem',
                    transition: 'var(--trans-fast)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = c === country ? 'var(--teal-faint)' : 'transparent'; }}
                >
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{FLAG(c)}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{COUNTRY_NAMES.of(c)}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)', flexShrink: 0 }}>+{getCountryCallingCode(c)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      {error && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{error}</span>}
    </div>
  );
}

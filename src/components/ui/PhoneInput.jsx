import React, { useState, useRef, useEffect } from 'react';
import { parsePhoneNumber, getCountries, getCountryCallingCode, AsYouType } from 'libphonenumber-js';

const PRIORITY = ['NG', 'GB', 'US', 'CA', 'GH', 'KE', 'ZA', 'DE', 'NL', 'SE', 'FR', 'AE'];
const FLAG = code => code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));
const COUNTRY_NAMES = new Intl.DisplayNames(['en'], { type: 'region' });

function buildList() {
  const all      = getCountries();
  const priority = PRIORITY.filter(c => all.includes(c));
  const rest     = all.filter(c => !PRIORITY.includes(c)).sort((a, b) =>
    COUNTRY_NAMES.of(a).localeCompare(COUNTRY_NAMES.of(b))
  );
  return [...priority, 'DIVIDER', ...rest];
}
const COUNTRIES = buildList();

// Parse an E.164 string (+2348012345678) back into { country, localNumber }
// For countries like NG that conventionally display with leading 0 in national format,
// prepend '0' to the localNumber for UI display (so user sees 0801... not 801...)
function parseE164(e164) {
  if (!e164 || !e164.startsWith('+')) return { country: 'NG', localNumber: '' };
  try {
    const parsed = parsePhoneNumber(e164);
    if (parsed) {
      let local = parsed.nationalNumber || '';
      // prepend leading 0 for display in countries that use it (NG, GH, etc.)
      const leadingZero = ['NG', 'GH', 'KE', 'ZA', 'UG', 'TZ', 'MW', 'ZM'];
      if (leadingZero.includes(parsed.country || '') && local && !local.startsWith('0')) {
        local = '0' + local;
      }
      return {
        country:     parsed.country || 'NG',
        localNumber: local,
      };
    }
  } catch {}
  return { country: 'NG', localNumber: e164.replace(/^\+\d{1,4}/, '') };
}

export default function PhoneInput({ label, value = '', onChange, error, placeholder }) {
  const initial = parseE164(value);
  const [country, setCountry] = useState(initial.country || 'NG');
  const [number,  setNumber]  = useState(initial.localNumber || '');
  const [open,    setOpen]    = useState(false);
  const [search,  setSearch]  = useState('');
  const dropRef   = useRef(null);
  const inputRef  = useRef(null);

  // Initial value is already handled by useState. 
  // No need for a useEffect that overwrites state on first keystroke.

  const dial = getCountryCallingCode(country);
  const placeholder_ = placeholder || (country === 'NG' ? '0801 234 5678' : '');

  const emit = (c, n) => {
    let digits = n.replace(/\D/g, '');
    // strip any leading 0s (users type "08..." for NG, but E.164 is +23480... without the display 0)
    digits = digits.replace(/^0+/, '');
    if (!digits) { onChange?.(''); return; }
    onChange?.(`+${getCountryCallingCode(c)}${digits}`);
  };

  const handleCountry = (c) => {
    setCountry(c);
    setOpen(false);
    setSearch('');
    emit(c, number);
    inputRef.current?.focus();
  };

  const handleNumber = (e) => {
    const raw = e.target.value;
    const display = raw.replace(/\D/g, '');
    let digits = display;
    let newCountry = country;
    // Support pasting full numbers: detect +234..., 234..., 080... etc and switch country + extract local
    if (digits.length >= 3) {
      if (digits.startsWith('234')) {
        newCountry = 'NG';
        digits = digits.slice(3);
      } else if (digits.startsWith('0')) {
        if (country !== 'NG') newCountry = 'NG';
        digits = digits.slice(1);
      } else if (digits.length > 10) {
        try {
          const p = parsePhoneNumber('+' + digits);
          if (p && p.country) {
            newCountry = p.country;
            digits = p.nationalNumber || digits;
          }
        } catch {}
      }
    }
    if (newCountry !== country) {
      setCountry(newCountry);
    }
    // Show the user exactly what they typed (including leading 0 for NG).
    // Only strip the leading 0 for the E.164 emit value.
    setNumber(display);
    emit(newCountry, digits);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

      {/* Helper text */}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', margin: '-0.1rem 0 0.1rem' }}>
        Select your country, then type your number.
      </p>

      <div style={{ display: 'flex', position: 'relative' }} ref={dropRef}>
        {/* Country flag + dial code button */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-label="Select country code"
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
          <span style={{ fontSize: '0.6rem', color: 'var(--text-3)' }}>{open ? '▲' : '▼'}</span>
        </button>

        {/* Local number input */}
        <input
          ref={inputRef}
          type="tel"
          value={number}
          onChange={handleNumber}
          placeholder={placeholder_}
          aria-label="Phone number"
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
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 300,
            width: 300, maxHeight: 320, overflowY: 'auto',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)',
          }}>
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
              if (c === 'DIVIDER') return <div key="div" style={{ height: 1, background: 'var(--border)', margin: '0.25rem 0' }} />;
              return (
                <button key={c} type="button" onClick={() => handleCountry(c)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    width: '100%', padding: '0.5rem 0.75rem',
                    background: c === country ? 'var(--teal-faint)' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    color: 'var(--text)', fontSize: '0.85rem', transition: 'var(--trans-fast)',
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

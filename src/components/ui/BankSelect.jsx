// BankSelect.jsx renders a viewport-safe bank picker with an internal scroll area.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CaretDown, Check, MagnifyingGlass } from 'phosphor-react';

export default function BankSelect({
  label,
  banks = [],
  value = '',
  onChange,
  error,
  hint,
  containerStyle,
  placeholder = 'Select bank',
}) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedBank = useMemo(() => banks.find(bank => bank.code === value) || null, [banks, value]);

  useEffect(() => {
    const handler = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  const filteredBanks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return banks;
    return banks.filter(bank => {
      const name = (bank.name || '').toLowerCase();
      const code = (bank.code || '').toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [banks, search]);

  const handleSelect = (bankCode) => {
    onChange?.(bankCode);
    setOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', ...containerStyle }}>
      {label && (
        <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-2)' }}>
          {label}
        </label>
      )}

      <div ref={rootRef} style={{ position: 'relative', minWidth: 0 }}>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen(prev => !prev)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'var(--surface-2)',
            border: `1px solid ${error ? 'var(--red)' : open ? 'var(--teal)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            color: selectedBank ? 'var(--text)' : 'var(--text-3)',
            textAlign: 'left',
            boxShadow: open ? '0 0 0 3px var(--teal-border)' : 'none',
            transition: 'var(--trans-fast)',
            minWidth: 0,
          }}
        >
          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedBank ? selectedBank.name : placeholder}
          </span>
          <CaretDown size={16} color="var(--text-3)" weight="bold" style={{ flexShrink: 0 }} />
        </button>

        {open && (
          <div
            role="listbox"
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.35rem)',
              left: 0,
              right: 0,
              zIndex: 60,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              maxHeight: 'min(320px, calc(100vh - 190px))',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {banks.length > 12 && (
              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                <div style={{ position: 'relative' }}>
                  <MagnifyingGlass size={15} color="var(--text-3)" style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    autoFocus
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search bank"
                    style={{
                      padding: '0.6rem 0.75rem 0.6rem 2rem',
                      fontSize: '0.84rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ overflowY: 'auto', overscrollBehavior: 'contain' }}>
              <button
                type="button"
                onClick={() => handleSelect('')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  color: 'var(--text)',
                  background: !value ? 'var(--teal-faint)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span>Select bank</span>
                {!value && <Check size={16} color="var(--teal)" weight="bold" />}
              </button>

              {filteredBanks.map(bank => (
                <button
                  key={bank.code}
                  type="button"
                  role="option"
                  aria-selected={bank.code === value}
                  onClick={() => handleSelect(bank.code)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    color: 'var(--text)',
                    background: bank.code === value ? 'var(--teal-faint)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {bank.name}
                  </span>
                  {bank.code === value ? <Check size={16} color="var(--teal)" weight="bold" /> : <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-3)', flexShrink: 0 }}>{bank.code}</span>}
                </button>
              ))}

              {filteredBanks.length === 0 && (
                <div style={{ padding: '0.85rem 1rem', color: 'var(--text-3)', fontSize: '0.82rem' }}>
                  No banks match your search.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{error}</span>}
      {!error && hint && <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{hint}</span>}
    </div>
  );
}

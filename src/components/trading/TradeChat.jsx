import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperPlaneTilt } from 'phosphor-react';
import { useWebSocket } from '../../hooks/useWebSocket.js';
import useTradeStore from '../../store/tradeStore.js';
import dayjs from 'dayjs';

const QUICK_ACTIONS = [
  'sell 100 USDT', 'sell 0.001 BTC', 'buy 50 USDT',
  'market', 'portfolio', 'history',
];

const PLACEHOLDERS = {
  idle:            'Type anything — sell 100 USDT, check rates, portfolio...',
  awaiting_account:'Enter: account_number bank_code  (e.g. 0123456789 058)',
  pin:             'Enter your PIN  (e.g. 7294)',
  awaiting_crypto: 'Reply SENT once you have transferred',
  confirm:         'Type YES to confirm or CANCEL to abort',
  quote:           'Type YES to confirm or CANCEL to abort',
  done:            'Transaction complete! Type anything to continue.',
  frozen:          'Account frozen. Contact support.',
};

function ChatBubble({ msg }) {
  const isBot = msg.from === 'bot';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: isBot ? 'flex-start' : 'flex-end',
        marginBottom: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', maxWidth: '80%' }}>
        {isBot && (
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--teal)', color: 'var(--text-inv)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
          }}>Q</div>
        )}
        <div style={{
          background: isBot ? 'var(--surface-2)' : 'var(--teal)',
          color: isBot ? 'var(--text)' : 'var(--text-inv)',
          padding: '0.7rem 1rem', borderRadius: isBot ? '0 12px 12px 12px' : '12px 0 12px 12px',
          fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          border: isBot ? '1px solid var(--border)' : 'none',
          fontFamily: isBot ? 'var(--font-mono)' : 'var(--font-body)',
        }}>
          {msg.text}
        </div>
      </div>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.2rem', paddingLeft: isBot ? '2rem' : 0 }}>
        {dayjs(msg.id).format('HH:mm')}
      </span>
    </motion.div>
  );
}

export default function TradeChat() {
  const { send, connected, connecting } = useWebSocket();
  const { messages, step } = useTradeStore();
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const t = text.trim();
    if (!t || !connected) return;
    send(t);
    setText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleQuick = (cmd) => {
    send(cmd);
    inputRef.current?.focus();
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 160px)', minHeight: 400,
      background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)', overflow: 'hidden',
    }}>
      <div style={{
        padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>
          Qreek Chat
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: connected ? 'var(--green)' : (connecting ? 'var(--amber)' : 'var(--red)'),
            boxShadow: connected ? '0 0 6px var(--green)' : 'none',
          }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
            {connected ? 'Connected' : connecting ? 'Connecting…' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', paddingTop: '2rem' }}>
            <p style={{ color: 'var(--text-3)', fontSize: '0.88rem' }}>Quick start:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {QUICK_ACTIONS.map(cmd => (
                <button
                  key={cmd}
                  onClick={() => handleQuick(cmd)}
                  disabled={!connected}
                  style={{
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    color: 'var(--teal)', borderRadius: 'var(--radius-full)',
                    padding: '0.4rem 0.9rem', fontSize: '0.82rem', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', transition: 'var(--trans-fast)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.background = 'var(--teal-faint)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        )}
        <AnimatePresence>
          {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div style={{
        padding: '0.75rem 1rem', borderTop: '1px solid var(--border)',
        display: 'flex', gap: '0.5rem', background: 'var(--bg-2)',
      }}>
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDERS[step] || PLACEHOLDERS.idle}
          disabled={!connected || step === 'frozen'}
          style={{ flex: 1, borderRadius: 'var(--radius-full)', padding: '0.6rem 1rem' }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || !connected}
          aria-label="Send message"
          style={{
            background: 'var(--teal)', border: 'none', borderRadius: '50%',
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, transition: 'var(--trans-fast)',
            opacity: (!text.trim() || !connected) ? 0.4 : 1,
          }}
        >
          <PaperPlaneTilt size={18} weight="fill" color="var(--text-inv)" />
        </button>
      </div>
    </div>
  );
}

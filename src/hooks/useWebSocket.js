import { useEffect, useRef, useCallback, useState } from 'react';
import useAuthStore from '../store/authStore.js';
import useTradeStore from '../store/tradeStore.js';

const WS_BASE = import.meta.env.VITE_WS_URL || '';

export function useWebSocket() {
  const token      = useAuthStore(s => s.token);
  const addMessage = useTradeStore(s => s.addMessage);
  const setStep    = useTradeStore(s => s.setStep);
  const ws         = useRef(null);
  const reconnect  = useRef(null);
  const mounted    = useRef(true);
  const [connected,  setConnected]  = useState(false);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(() => {
    if (!token || !mounted.current) return;
    setConnecting(true);
    const url = WS_BASE
      ? `${WS_BASE}/ws/trade?token=${token}`
      : `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/trade?token=${token}`;

    const socket = new WebSocket(url);
    ws.current   = socket;

    socket.onopen = () => { setConnected(true); setConnecting(false); };

    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        addMessage({ from: 'qreek', text: data.message, ts: Date.now() });
        setStep(data.step, data.pending || null);
      } catch {}
    };

    socket.onclose = () => {
      setConnected(false);
      setConnecting(false);
      if (!mounted.current) return;
      reconnect.current = setTimeout(connect, 3000);
    };

    socket.onerror = () => socket.close();
  }, [token]);

  useEffect(() => {
    mounted.current = true;
    connect();
    return () => {
      mounted.current = false;
      clearTimeout(reconnect.current);
      ws.current?.close();
    };
  }, [connect]);

  const send = useCallback((text) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(text);
      addMessage({ from: 'user', text, ts: Date.now() });
    }
  }, [addMessage]);

  return { send, connected, connecting };
}

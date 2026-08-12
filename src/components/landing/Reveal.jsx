import React, { useEffect, useRef, useState } from 'react';

/* Scroll-reveal primitive for the landing page. Fires once, then disconnects. */
export default function Reveal({ children, delay = 0, dx = 0, dy = 24, threshold = 0.1, style, className, ...rest }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); io.disconnect(); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={className} {...rest} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : `translate(${dx}px, ${dy}px)`,
      transition: `opacity 0.75s ${delay}ms ease, transform 0.75s ${delay}ms ease`,
      ...style,
    }}>
      {children}
    </div>
  );
}

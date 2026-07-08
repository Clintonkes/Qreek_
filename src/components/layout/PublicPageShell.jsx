import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: 'easeOut' },
  },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

function useScrollReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll('[data-reveal]'));
    if (!items.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      items.forEach(node => node.setAttribute('data-reveal-state', 'visible'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute('data-reveal-state', 'visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    );

    items.forEach((node, index) => {
      const delay = Number(node.getAttribute('data-reveal-delay') || 0);
      node.style.setProperty('--reveal-delay', `${delay + index * 16}ms`);
      node.setAttribute('data-reveal-state', 'hidden');
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, [rootRef]);
}

export default function PublicPageShell() {
  const rootRef = useRef(null);
  useScrollReveal(rootRef);

  return (
    <motion.div
      ref={rootRef}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      style={{ minHeight: '100vh' }}
    >
      <style>{`
        [data-reveal] {
          opacity: 0;
          transform: translateY(18px);
          transition:
            opacity 0.72s ease,
            transform 0.72s cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--reveal-delay, 0ms);
          will-change: opacity, transform;
        }

        [data-reveal][data-reveal-state="visible"] {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          [data-reveal] {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
      <Outlet />
    </motion.div>
  );
}

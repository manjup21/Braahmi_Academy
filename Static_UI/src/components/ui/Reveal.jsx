import { createContext, useContext } from 'react';
import { useInView } from '../../hooks/useInView';

const RevealCtx = createContext(false);

const VARIANT_CLASS = {
  up: 'reveal-up',
  down: 'reveal-down',
  left: 'reveal-left',
  right: 'reveal-right',
  scale: 'reveal-scale',
  fade: 'reveal-fade',
};

export function RevealSection({ children, className = '', id, as: Tag = 'section' }) {
  const [ref, inView] = useInView(0.06);

  return (
    <RevealCtx.Provider value={inView}>
      <Tag ref={ref} id={id} className={className}>
        {children}
      </Tag>
    </RevealCtx.Provider>
  );
}

export function Reveal({ children, className = '', delay = 0, variant = 'up' }) {
  const inView = useContext(RevealCtx);
  const base = VARIANT_CLASS[variant] ?? VARIANT_CLASS.up;

  return (
    <div
      className={`${base} ${inView ? 'is-visible' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      {children}
    </div>
  );
}

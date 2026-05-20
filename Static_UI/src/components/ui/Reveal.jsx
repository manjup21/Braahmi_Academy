import { createContext, useContext } from 'react';
import { useInView } from '../../hooks/useInView';

const RevealCtx = createContext(false);

export function RevealSection({ children, className = '', id, as: Tag = 'section' }) {
  const [ref, inView] = useInView(0.08);

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
  const base = variant === 'scale' ? 'reveal-scale' : 'reveal-up';

  return (
    <div
      className={`${base} ${inView ? 'is-visible' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      {children}
    </div>
  );
}

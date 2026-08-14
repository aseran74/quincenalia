import type { Variants, Transition } from 'framer-motion';

/** Emil Kowalski strong ease-out — UI entrances */
export const easeOut = [0.23, 1, 0.32, 1] as const;
/** Strong ease-in-out — on-screen movement */
export const easeInOut = [0.77, 0, 0.175, 1] as const;

const enter: Transition = {
  duration: 0.45,
  ease: easeOut,
};

/** Scroll reveal (marketing): opacity + translate — never scale(0) */
export const fadeUp: Variants = {
  hidden: { opacity: 0, transform: 'translateY(16px)' },
  show: {
    opacity: 1,
    transform: 'translateY(0px)',
    transition: enter,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35, ease: easeOut } },
};

/** Stagger 50–80ms (Emil: 30–80ms) */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

export const staggerFast: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
};

/** Card entrance: scale 0.96 + opacity (never scale 0) */
export const scaleIn: Variants = {
  hidden: { opacity: 0, transform: 'scale(0.96)' },
  show: {
    opacity: 1,
    transform: 'scale(1)',
    transition: enter,
  },
};

export const viewportOnce = { once: true, amount: 0.2 as const, margin: '-80px 0px' as const };

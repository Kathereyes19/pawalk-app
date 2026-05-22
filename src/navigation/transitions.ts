import type { AppScreen } from './screens';
import { BOOKING_FLOW_SCREENS, ONBOARDING_SCREENS } from './screens';

type MotionTransition = {
  initial: Record<string, unknown>;
  animate: Record<string, unknown>;
  exit: Record<string, unknown>;
  transition?: Record<string, unknown>;
};

export function getScreenTransition(screen: AppScreen): MotionTransition {
  if (screen === 'splash') {
    return { initial: {}, animate: {}, exit: {} };
  }

  if (ONBOARDING_SCREENS.includes(screen)) {
    return {
      initial: { x: '100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '-50%', opacity: 0 },
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    };
  }

  if (BOOKING_FLOW_SCREENS.includes(screen)) {
    return {
      initial: { x: '100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '-50%', opacity: 0 },
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    };
  }

  return {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
    transition: { duration: 0.25, ease: 'easeInOut' },
  };
}

export function getNavigationKey(screen: AppScreen, activeTab: string): string {
  return screen === 'home' && activeTab !== 'home' ? activeTab : screen;
}

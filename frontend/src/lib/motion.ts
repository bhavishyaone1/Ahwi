import type { Variants, Transition } from "motion/react";

/**
 * AETHER Scientific Motion System
 * Controlled, restrained, high-performance animations for meteorological intelligence.
 */

// Timing standards (in seconds)
export const TIMING = {
  micro: 0.14,           // 100–180ms
  interaction: 0.2,       // 150–250ms
  page: 0.25,            // 200–350ms
  chart: 0.45,           // 350–600ms
  map: 0.4,              // 300–600ms
  modelWeights: 0.55,    // 400–700ms
} as const;

// Easing curves
export const EASING = {
  scientific: [0.16, 1, 0.3, 1] as const, // ease-out cubic
  subtle: [0.25, 0.1, 0.25, 1] as const,
  spring: { type: "spring", stiffness: 300, damping: 28 } as const,
} as const;

// Page Transition: subtle opacity + translateY + scale (never dramatic slides)
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.995,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: TIMING.page,
      ease: EASING.scientific,
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.995,
    transition: {
      duration: TIMING.micro,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// Fade Up
export const fadeUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: TIMING.interaction, ease: EASING.scientific },
  },
  exit: { opacity: 0, y: -8, transition: { duration: TIMING.micro } },
};

// Fade In
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: TIMING.interaction, ease: "easeOut" },
  },
  exit: { opacity: 0, transition: { duration: TIMING.micro } },
};

// Slide In (Subtle)
export const slideIn: Variants = {
  initial: { opacity: 0, x: -12 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: TIMING.interaction, ease: EASING.scientific },
  },
  exit: { opacity: 0, x: 12, transition: { duration: TIMING.micro } },
};

// Scale In
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: TIMING.interaction, ease: EASING.scientific },
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: TIMING.micro } },
};

// Stagger Container
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

// Stagger Item
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: TIMING.interaction, ease: EASING.scientific },
  },
};

// Panel Variants (e.g. Overview Right Panel, Trace Drawer)
export const panelVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: TIMING.page, ease: EASING.scientific },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: TIMING.interaction, ease: "easeIn" },
  },
};

// Map Panel Transition
export const mapPanelTransition: Transition = {
  duration: TIMING.map,
  ease: EASING.scientific,
};

// Chart Transition
export const chartTransition: Transition = {
  duration: TIMING.chart,
  ease: EASING.scientific,
};

// Modal Transition
export const modalTransition: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: TIMING.interaction, ease: EASING.scientific },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: TIMING.micro },
  },
};

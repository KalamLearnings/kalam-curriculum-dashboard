'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================================================
// Animated Gradient Border
// A container that wraps children with an animated purple/blue gradient border
// Used for the AI modal and cards to give them the "AI glow" look
// ============================================================================

interface AIGradientBorderProps {
  children: React.ReactNode;
  className?: string;
  /** Controls the border radius */
  rounded?: string;
  /** Whether the glow animation is active */
  active?: boolean;
}

export function AIGradientBorder({
  children,
  className,
  rounded = 'rounded-lg',
  active = true,
}: AIGradientBorderProps) {
  return (
    <div className={cn('relative', rounded, className)}>
      {/* Animated gradient border */}
      {active && (
        <div
          className={cn(
            'absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 animate-ai-border-glow',
            rounded
          )}
        />
      )}
      {/* Inner content */}
      <div className={cn('relative bg-white', rounded)}>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// AI Sparkle Particles
// Floating sparkle dots that drift around a container
// Used behind buttons and in modal headers
// ============================================================================

interface SparkleProps {
  count?: number;
  className?: string;
}

const sparkleVariants = {
  initial: { opacity: 0, scale: 0 },
  animate: (i: number) => ({
    opacity: [0, 1, 0],
    scale: [0, 1, 0],
    x: [0, (Math.random() - 0.5) * 30],
    y: [0, (Math.random() - 0.5) * 20],
    transition: {
      duration: 1.5 + Math.random() * 1,
      repeat: Infinity,
      delay: i * 0.3,
      ease: 'easeInOut',
    },
  }),
};

export function AISparkles({ count = 5, className }: SparkleProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={sparkleVariants}
          initial="initial"
          animate="animate"
          className="absolute w-1 h-1 rounded-full bg-purple-400"
          style={{
            left: `${15 + Math.random() * 70}%`,
            top: `${15 + Math.random() * 70}%`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// AI Shimmer Bar
// An animated progress-like shimmer that indicates AI is working
// Used during the generation loading state
// ============================================================================

interface AIShimmerBarProps {
  className?: string;
}

export function AIShimmerBar({ className }: AIShimmerBarProps) {
  return (
    <div className={cn('h-1 w-full rounded-full overflow-hidden bg-purple-100', className)}>
      <motion.div
        className="h-full w-1/3 rounded-full bg-gradient-to-r from-purple-400 via-violet-500 to-purple-400"
        animate={{ x: ['-100%', '400%'] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

// ============================================================================
// AI Generating Overlay
// Full overlay shown inside the modal during generation
// Includes shimmer, pulsing icon, and status text
// ============================================================================

interface AIGeneratingOverlayProps {
  message?: string;
  subMessage?: string;
}

export function AIGeneratingOverlay({
  message = 'Generating with AI...',
  subMessage = 'This may take 30-60 seconds',
}: AIGeneratingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-12 px-6"
    >
      {/* Pulsing orb */}
      <div className="relative mb-6">
        <motion.div
          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500"
          animate={{
            scale: [1, 1.15, 1],
            boxShadow: [
              '0 0 0 0 rgba(168, 85, 247, 0.3)',
              '0 0 0 20px rgba(168, 85, 247, 0)',
              '0 0 0 0 rgba(168, 85, 247, 0)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Inner sparkle icon */}
        <motion.svg
          className="absolute inset-0 m-auto w-8 h-8 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
        </motion.svg>
      </div>

      {/* Shimmer bar */}
      <AIShimmerBar className="w-48 mb-4" />

      {/* Text */}
      <motion.p
        className="text-sm font-medium text-gray-900"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message}
      </motion.p>
      <p className="text-xs text-gray-400 mt-1">{subMessage}</p>
    </motion.div>
  );
}

// ============================================================================
// AI Button
// A button with the AI glow effect, sparkles, and gradient styling
// ============================================================================

interface AIButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function AIButton({
  children,
  onClick,
  disabled = false,
  className,
  size = 'md',
}: AIButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={cn(
        'relative group flex items-center gap-2 font-medium rounded-lg transition-colors overflow-hidden',
        'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600',
        'text-white shadow-md',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
        className
      )}
    >
      {/* Shimmer overlay on hover */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-ai-shimmer opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundSize: '200% 100%' }}
      />

      {/* Glow pulse behind button */}
      <div className="absolute inset-0 rounded-lg animate-ai-glow opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Sparkles */}
      <AISparkles count={3} className="opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}

// ============================================================================
// Animated Section Reveal
// Wraps content to animate it appearing (fade + slide up)
// ============================================================================

interface AnimatedRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedReveal({ children, className, delay = 0 }: AnimatedRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";

// Premium agency cubic-bezier curve (smooth ease-in-out)
const TRANSITION_EASE = [0.76, 0, 0.24, 1];
const DURATION = 0.55;

const MotionLink = motion.create(Link);

export default function AnimatedButton({
  href,
  onClick,
  children,
  className = "",
  variant = "primary", // primary, secondary, outline, ghost
  type = "button",
  disabled = false,
}) {
  // Styles configuration per variant
  const variantStyles = {
    primary: {
      base: "bg-neutral-900 text-white border border-neutral-800 shadow-sm",
      bgFill: "bg-brand-orange", // Sliding fill color
      textHoverColor: "text-white",
    },
    secondary: {
      base: "bg-brand-orange text-white shadow-lg shadow-brand-orange/20",
      bgFill: "bg-black",
      textHoverColor: "text-white",
    },
    outline: {
      base: "bg-transparent text-neutral-900 border border-neutral-300",
      bgFill: "bg-neutral-900",
      textHoverColor: "group-hover:text-white",
    },
    ghost: {
      base: "bg-transparent text-neutral-900 hover:bg-neutral-100",
      bgFill: "transparent",
      textHoverColor: "",
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;

  const commonProps = {
    className: `group relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium cursor-pointer select-none px-7 py-3.5 text-base transition-colors ${currentVariant.base} ${className}`,
    initial: "initial",
    animate: "initial",
    whileHover: "hover",
    whileTap: { scale: 0.97 },
    transition: { duration: 0.2 },
  };

  const content = (
    <>
      {/* Dynamic Background Fill Effect */}
      {variant !== "ghost" && (
        <motion.span
          className={`absolute inset-0 rounded-full ${currentVariant.bgFill} pointer-events-none`}
          variants={{
            initial: { y: "100%", opacity: 0.8 },
            hover: { y: "0%", opacity: 1 },
          }}
          transition={{
            duration: DURATION,
            ease: TRANSITION_EASE,
          }}
        />
      )}

      {/* Dimension Anchor (Invisible spacer keeping exact width & height) */}
      <span className="invisible flex items-center gap-2 tracking-tight">
        {children}
      </span>

      {/* Layer 1: Initial Text (Slides out to the top) */}
      <motion.span
        className="absolute inset-0 flex items-center justify-center gap-2 tracking-tight z-10"
        variants={{
          initial: { y: "0%", opacity: 1 },
          hover: { y: "-120%", opacity: 0 },
        }}
        transition={{
          duration: DURATION,
          ease: TRANSITION_EASE,
        }}
      >
        {children}
      </motion.span>

      {/* Layer 2: Hover Text (Slides in from the bottom) */}
      <motion.span
        className={`absolute inset-0 flex items-center justify-center gap-2 tracking-tight z-10 ${
          currentVariant.textHoverColor ?? ""
        }`}
        variants={{
          initial: { y: "120%", opacity: 0 },
          hover: { y: "0%", opacity: 1 },
        }}
        transition={{
          duration: DURATION,
          ease: TRANSITION_EASE,
        }}
      >
        {children}
      </motion.span>
    </>
  );

  if (href) {
    return (
      <MotionLink href={href} {...commonProps}>
        {content}
      </MotionLink>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...commonProps}
    >
      {content}
    </motion.button>
  );
}
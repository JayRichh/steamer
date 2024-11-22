"use client";

import { HTMLMotionProps, motion } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "~/utils/cn";

type TextVariant = "h1" | "h2" | "h3" | "h4" | "body-lg" | "body" | "body-sm" | "caption";
type TextGradient = "none" | "gaming" | "accent" | "highlight" | "brand";

interface TextProps extends Omit<HTMLMotionProps<"div">, "color"> {
  variant?: TextVariant;
  color?: "default" | "primary" | "secondary" | "success" | "error";
  weight?: "normal" | "medium" | "bold";
  align?: "left" | "center" | "right";
  gradient?: TextGradient;
  glass?: boolean;
  balance?: boolean;
  mono?: boolean;
  animate?: boolean;
}

const variantClasses: Record<TextVariant, string> = {
  h1: "text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9]",
  h2: "text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[0.95]",
  h3: "text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-[1]",
  h4: "text-xl md:text-2xl lg:text-3xl font-bold tracking-tight leading-[1.1]",
  "body-lg": "text-lg md:text-xl leading-relaxed",
  body: "text-base md:text-lg leading-relaxed",
  "body-sm": "text-sm leading-relaxed",
  caption: "text-xs leading-normal",
};

const colorClasses = {
  default: "text-foreground",
  primary: "text-primary",
  secondary: "text-foreground/70",
  success: "text-success",
  error: "text-error",
};

const weightClasses = {
  normal: "font-normal",
  medium: "font-medium",
  bold: "font-bold",
};

const alignClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const gradientClasses: Record<TextGradient, string> = {
  none: "",
  gaming: "bg-gradient-to-r from-primary via-brand to-accent bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient",
  accent: "bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent",
  highlight: "bg-gradient-to-r from-highlight via-warning to-highlight bg-clip-text text-transparent",
  brand: "bg-gradient-to-r from-brand via-primary to-brand bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient",
};

const textVariants = {
  hidden: { 
    opacity: 0,
    y: 10
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 1
    }
  }
};

export const Text = forwardRef<HTMLDivElement, TextProps>(
  (
    {
      variant = "body",
      color = "default",
      weight,
      align = "left",
      gradient = "none",
      glass = false,
      balance = false,
      mono = false,
      animate = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const defaultWeight = variant.startsWith("h") ? "bold" : "normal";
    const finalWeight = weight || defaultWeight;

    return (
      <motion.div
        ref={ref}
        variants={animate ? textVariants : undefined}
        initial={animate ? "hidden" : undefined}
        animate={animate ? "visible" : undefined}
        className={cn(
          variantClasses[variant],
          colorClasses[color],
          weightClasses[finalWeight],
          alignClasses[align],
          gradientClasses[gradient],
          glass && "glass",
          balance && "text-balance",
          mono && "font-mono",
          "relative max-w-[70ch]",
          className
        )}
        {...props}
      >
        {glass && (
          <motion.span 
            className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-25 blur-sm"
            initial={{ opacity: 0.2 }}
            animate={{
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}
        <span className="relative">{children as React.ReactNode}</span>
      </motion.div>
    );
  }
);

Text.displayName = "Text";

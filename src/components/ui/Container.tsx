"use client";

import { HTMLMotionProps, motion } from "framer-motion";
import { ReactNode, forwardRef } from "react";
import { cn } from "~/utils/cn";

interface ContainerProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full" | "ultra";
  centered?: boolean;
  variant?: "default" | "glass" | "gaming";
  noPadding?: boolean;
  className?: string;
  innerClassName?: string;
  maxWidth?: boolean;
  gutter?: boolean;
  stagger?: boolean;
}

const containerSizes = {
  sm: "max-w-3xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  ultra: "max-w-[90rem]",
  full: "max-w-full",
};

const containerVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      mass: 1,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const childVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      mass: 1
    }
  }
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      size = "lg",
      centered = true,
      variant = "default",
      noPadding = false,
      className = "",
      innerClassName = "",
      maxWidth = true,
      gutter = true,
      stagger = false,
      children,
      ...props
    },
    ref
  ) => {
    // Base container styles
    const containerStyles = cn(
      "relative w-full",
      maxWidth && containerSizes[size],
      gutter && "px-4 sm:px-6 lg:px-8",
      centered && "mx-auto",
      className
    );

    // Content wrapper styles based on variant
    const contentStyles = cn(
      "rounded-xl",
      {
        "backdrop-blur-xl": variant !== "default",
        "bg-background/80 border border-border/50": variant === "glass",
        "bg-background/30 border border-primary/20 shadow-2xl": variant === "gaming",
        "p-6 sm:p-8 lg:p-10": !noPadding,
      },
      innerClassName
    );

    const content = variant !== "default" ? (
      <div className={contentStyles}>
        {/* Dynamic background effects */}
        <motion.div 
          className={cn(
            "absolute inset-0 rounded-xl",
            {
              "bg-gradient-to-b from-white/5 to-white/0 dark:from-black/5 dark:to-black/0": variant === "glass",
              "bg-gradient-to-br from-primary/10 via-accent/5 to-transparent": variant === "gaming",
            }
          )}
          animate={{
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {variant === "gaming" && (
          <>
            {/* Gaming variant specific effects */}
            <motion.div 
              className="absolute inset-0 bg-[repeating-linear-gradient(45deg,var(--brand)_0%,transparent_5%)] opacity-[0.03] rounded-xl"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 rounded-xl"
              animate={{
                opacity: [0, 0.1, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </>
        )}

        {/* Content with relative positioning */}
        <motion.div 
          className="relative z-10"
          variants={stagger ? childVariants : undefined}
        >
          {children}
        </motion.div>
      </div>
    ) : (
      <motion.div 
        className={innerClassName}
        variants={stagger ? childVariants : undefined}
      >
        {children}
      </motion.div>
    );

    return (
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={containerStyles}
        {...props}
      >
        {content}
      </motion.div>
    );
  }
);

Container.displayName = "Container";

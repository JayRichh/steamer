"use client";

import { HTMLMotionProps, Variants, motion } from "framer-motion";
import { ReactNode, forwardRef } from "react";
import { cn } from "~/utils/cn";

const cardVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 1
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: "elevated" | "outlined" | "filled" | "glass" | "gaming";
  interactive?: boolean;
  fullHeight?: boolean;
  noPadding?: boolean;
  children?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "elevated",
      interactive = false,
      fullHeight = false,
      noPadding = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={interactive ? "hover" : undefined}
        whileTap={interactive ? "tap" : undefined}
        className={cn(
          "rounded-xl backdrop-blur-sm",
          "flex flex-col",
          {
            "h-full": fullHeight,
            "min-h-0": !fullHeight,
            "p-6 sm:p-8": !noPadding,
            "bg-background/95 shadow-lg shadow-black/[0.03] dark:shadow-white/[0.02] border border-border/50": variant === "elevated",
            "border-2 border-border hover:border-border/80": variant === "outlined",
            "bg-background-secondary/95": variant === "filled",
            "bg-background/40 backdrop-blur-xl border border-border/30 shadow-xl": variant === "glass",
            "bg-background/30 backdrop-blur-2xl border border-primary/20 shadow-2xl": variant === "gaming",
          },
          interactive && {
            "cursor-pointer transition-all duration-300": true,
            "hover:bg-background/98": variant === "elevated",
            "hover:bg-background-secondary/98": variant === "filled",
            "hover:bg-background/50 hover:border-primary/20": variant === "glass",
            "hover:bg-background/40 hover:border-primary/30": variant === "gaming",
          },
          className
        )}
        {...props}
      >
        {(variant === "glass" || variant === "gaming") && (
          <>
            <motion.div
              className={cn(
                "absolute inset-0 bg-gradient-to-br rounded-xl",
                variant === "glass" 
                  ? "from-white/[0.08] to-transparent dark:from-white/[0.04]"
                  : "from-primary/[0.08] via-accent/[0.04] to-transparent"
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
            <motion.div 
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 rounded-xl transition-opacity duration-500",
                variant === "glass"
                  ? "from-primary/[0.03] to-transparent"
                  : "from-brand/[0.06] via-primary/[0.04] to-accent/[0.02]"
              )}
              initial={false}
              animate={interactive ? { opacity: 1 } : { opacity: 0 }}
            />
          </>
        )}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

Card.displayName = "Card";

interface CardHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className = "" }, ref) => {
    return (
      <div ref={ref} className={cn("flex justify-between items-start gap-4 mb-6", className)}>
        <div className="flex-1 min-w-0">
          <div className="text-xl font-bold text-foreground leading-tight truncate">
            {title}
          </div>
          {subtitle && (
            <div className="mt-2 text-base text-foreground/80 dark:text-foreground/75">
              {subtitle}
            </div>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

interface CardContentProps {
  children?: ReactNode;
  className?: string;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = "", children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex-1 min-h-0 w-full", "text-foreground/90 dark:text-foreground/85", className)}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = "CardContent";

interface CardFooterProps {
  children?: ReactNode;
  className?: string;
  noBorder?: boolean;
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = "", noBorder = false, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mt-6",
          {
            "pt-4 border-t border-border/50": !noBorder,
          },
          className
        )}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardContent, CardFooter };

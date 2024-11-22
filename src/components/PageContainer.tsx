"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "~/utils/cn";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={cn(
        "relative w-full min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 text-foreground overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/20 to-background/40" />
        
        {/* Brand color gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,51,234,0.15),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_120%,rgba(79,70,229,0.15),rgba(255,255,255,0))]" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark opacity-50" />
        
        {/* Accent highlights */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.1),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,211,238,0.1),rgba(255,255,255,0))]" />
      </div>
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};

export const PageSection: React.FC<PageContainerProps> = ({
  children,
  className = "",
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "m-0 flex w-full flex-col items-center justify-start p-0",
        className,
      )}
    >
      <div
        className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8"
        style={{ width: "100%" }}
      >
        {children}
      </div>
    </motion.section>
  );
};

export const PageTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => {
  return (
    <motion.h1 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        "relative text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter",
        className
      )}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent blur-2xl animate-gradient opacity-50" aria-hidden="true">
        {children}
      </span>
      <span className="relative bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient">
        {children}
      </span>
    </motion.h1>
  );
};

export const PageSubtitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className={cn(
        "text-xl sm:text-2xl font-medium text-foreground/60 tracking-tight",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const PageDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => {
  return (
    <motion.p 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={cn(
        "text-lg sm:text-xl text-foreground/70 max-w-2xl leading-relaxed tracking-tight",
        className
      )}
    >
      {children}
    </motion.p>
  );
};

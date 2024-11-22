"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { PageContainer, PageSection, PageTitle, PageDescription, PageSubtitle } from "~/components/PageContainer";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
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

const features = [
  {
    title: "Advanced Screenshot Editor",
    description: "Transform your gaming moments with our powerful editor. Add effects, filters, and annotations to create stunning visuals that tell your gaming story.",
    icon: (
      <motion.svg 
        className="w-8 h-8 text-primary"
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </motion.svg>
    )
  },
  {
    title: "Achievement Showcase",
    description: "Display your gaming accomplishments in style. Create beautiful achievement galleries and share your proudest gaming moments with the community.",
    icon: (
      <motion.svg 
        className="w-8 h-8 text-primary"
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        aria-hidden="true"
      >
        <path d="M12 8l-4 4h8l-4-4z" />
        <path d="M12 15l-2 4h4l-2-4z" />
        <path d="M20 4H4l2 3h12l2-3z" />
        <path d="M18 7H6l1.5 2h9l1.5-2z" />
        <rect x="8" y="11" width="8" height="2" rx="1" />
      </motion.svg>
    )
  },
  {
    title: "Gaming Analytics",
    description: "Dive deep into your gaming patterns with detailed statistics. Track your progress, analyze playtime trends, and discover new insights about your gaming journey.",
    icon: (
      <motion.svg 
        className="w-8 h-8 text-primary"
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        aria-hidden="true"
      >
        <path d="M12 20V10" />
        <path d="M18 20V4" />
        <path d="M6 20v-4" />
      </motion.svg>
    )
  }
];

export default function HomePage() {
  return (
    <PageContainer>
      <PageSection className="min-h-[calc(100dvh-4rem)] flex flex-col justify-center py-24">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Hero Section */}
          <motion.div 
            variants={fadeInUp}
            className="text-center max-w-4xl mx-auto mb-28"
          >
            <PageTitle className="mb-6">
              STEAMSHARE
            </PageTitle>
            <PageSubtitle className="mb-8">
              Level Up Your Gaming Experience
            </PageSubtitle>
            
            <PageDescription className="mb-12">
              Transform your Steam profile into a stunning showcase. Create beautiful galleries,
              track achievements, and gain insights into your gaming journey - all in one place.
            </PageDescription>

            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/about">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 text-white font-bold px-8 py-3"
                >
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl px-4"
            variants={staggerContainer}
            role="list"
            aria-label="Features"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp}
                role="listitem"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Card variant="glass" interactive className="p-10 transition-smooth h-full">
                  <div className="flex flex-col h-full">
                    <div className="mb-8 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center relative group">
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100"
                          transition={{ duration: 0.3 }}
                          aria-hidden="true"
                        />
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-tr from-accent/10 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100"
                          transition={{ duration: 0.3, delay: 0.1 }}
                          aria-hidden="true"
                        />
                        <div className="relative z-10">
                          {feature.icon}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-center tracking-tight text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-foreground/90 dark:text-foreground/85 text-center text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom Section */}
          <motion.div 
            variants={fadeInUp}
            className="mt-28 text-center max-w-xl mx-auto px-4"
          >
            <div className="text-sm text-foreground/80 dark:text-foreground/75 mb-3 uppercase tracking-wide font-medium">
              Built with Steam Web API
            </div>
            <div className="text-foreground/75 dark:text-foreground/70 text-sm">
              Sign in with your Steam account to start creating your ultimate gaming showcase.
              Your data is securely handled through Steam's official authentication.
            </div>
          </motion.div>
        </motion.div>
      </PageSection>
    </PageContainer>
  );
}

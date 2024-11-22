"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PageContainer } from "~/components/PageContainer";

const sections = [
  {
    title: "Manage Your Gaming Memories",
    description: "Access and organize all your Steam screenshots in one place. Our dashboard provides a clean, intuitive interface for browsing your gaming collection.",
    image: "/Screenshot-Dash.png",
    alt: "Dashboard Screenshot",
  },
  {
    title: "Powerful Screenshot Editor",
    description: "Transform your gaming moments with our feature-rich editor. Create collages, add effects, and make your screenshots truly unique.",
    image: "/Screenshot-EditorMenu.png",
    alt: "Editor Screenshot",
  },
  {
    title: "Connect with Friends",
    description: "Share your gaming highlights with friends and explore their collections. Built-in Steam integration makes sharing seamless.",
    image: "/Screenshot-Friend.png",
    alt: "Friends Screenshot",
  }
];

export default function AboutPage() {
  return (
    <PageContainer>
      <div className="space-y-24 py-24 max-w-7xl mx-auto">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            
          </h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            SteamShare transforms how you capture, edit, and share your gaming moments. 
            With powerful tools and seamless Steam integration, your screenshots have never looked better.
          </p>
        </motion.div>

        {/* Feature Sections */}
        {sections.map((section, index) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className={`flex flex-col ${
              index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            } gap-12 items-center`}
          >
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl font-bold">{section.title}</h2>
              <p className="text-xl text-foreground/80">{section.description}</p>
            </div>
            <div className="flex-1 relative">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-video rounded-xl overflow-hidden shadow-2xl"
              >
                <Image
                  src={section.image}
                  alt={section.alt}
                  width={1920}
                  height={1080}
                  className="object-cover"
                  priority={index === 0}
                  quality={90}
                />
              </motion.div>
              {/* Decorative gradient blur */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-xl blur-3xl -z-10 opacity-50" />
            </div>
          </motion.section>
        ))}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-8 py-12"
        >
          <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Sign in with Steam to start editing your screenshots.
          </p>
        </motion.div>
      </div>
    </PageContainer>
  );
}

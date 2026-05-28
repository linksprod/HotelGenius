import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, Sparkles, Globe, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

const SaaSLandingPage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] -z-10" />

      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">HotelGenius</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#demo" className="hover:text-foreground transition-colors">Live Demo</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="font-medium hidden sm:flex" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button className="font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform" onClick={() => navigate('/login')}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32 md:pt-32 text-center md:text-left">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>Next-Gen Hospitality SaaS</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
              The AI Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Modern Hotels</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto md:mx-0 leading-relaxed">
              Unify your property management, guest experience, and AI concierge into one intelligent platform. Branded to your hotel, powered by neural networks.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center md:justify-start">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1" onClick={() => navigate('/login')}>
                Create Hotel Account
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full font-bold group" onClick={() => navigate('/demo')}>
                View Live Demo
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Abstract Hero Image/Graphic */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative hidden md:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-blue-500/20 blur-3xl rounded-full" />
            <div className="relative bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Mock UI Elements */}
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="h-4 w-32 bg-muted rounded mb-2" />
                  <div className="h-3 w-24 bg-muted/60 rounded" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="h-24 w-full bg-muted/30 rounded-xl border border-border/50 flex items-center px-6">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center mr-4">
                    <Globe className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="h-3 w-20 bg-muted rounded mb-2" />
                    <div className="h-4 w-40 bg-foreground/20 rounded" />
                  </div>
                </div>
                <div className="h-24 w-full bg-muted/30 rounded-xl border border-border/50 flex items-center px-6">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
                    <Zap className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="h-3 w-24 bg-muted rounded mb-2" />
                    <div className="h-4 w-32 bg-foreground/20 rounded" />
                  </div>
                </div>
                <div className="h-24 w-full bg-muted/30 rounded-xl border border-border/50 flex items-center px-6">
                  <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
                    <ShieldCheck className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <div className="h-3 w-16 bg-muted rounded mb-2" />
                    <div className="h-4 w-48 bg-foreground/20 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      {/* Footer minimal */}
      <footer className="border-t border-border/50 py-12 mt-12 bg-muted/10">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} HotelGenius SaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SaaSLandingPage;

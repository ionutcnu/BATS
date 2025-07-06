'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Download,
  FileText,
  Shield,
  Star,
  Target,
  Upload,
  Zap,
} from 'lucide-react';
import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern';
import { Marquee } from '@/components/magicui/marquee';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { Navbar } from '@/components/navbar';
import { ResumeWorkflow } from '@/components/resume-workflow';
import { SimpleWorkflow } from '@/components/simple-workflow';
import { AIWorkflow } from '@/components/ai-workflow';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer',
    text: 'Got 3x more interviews after using BATS!',
  },
  { name: 'Mike Johnson', role: 'Product Manager', text: 'Finally passed those ATS filters.' },
  { name: 'Elena Rodriguez', role: 'Data Scientist', text: 'BATS helped me land my dream job.' },
  { name: 'David Kim', role: 'UX Designer', text: 'Simple, effective, and works perfectly.' },
  { name: 'Rachel Thompson', role: 'Marketing Lead', text: 'Increased my response rate by 200%.' },
];

const features = [
  {
    icon: Target,
    title: 'ATS Optimization',
    description:
      'Invisible keyword embedding that bypasses ATS filters while maintaining document integrity',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process your resume in seconds with our advanced PDF manipulation algorithms',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your documents are processed securely and never stored on our servers',
  },
  {
    icon: FileText,
    title: 'Format Preservation',
    description: 'Maintains original formatting while strategically placing optimization keywords',
  },
];

const stats = [
  { label: 'Success Rate', value: '98%', suffix: '' },
  { label: 'Resumes Optimized', value: '50', suffix: 'K+' },
  { label: 'Average Process Time', value: '15', suffix: 's' },
  { label: 'Happy Users', value: '10', suffix: 'K+' },
];

export default function HomePage() {
  const [workflowMode, setWorkflowMode] = useState<'scan' | 'optimize' | 'simple'>('scan');

  const handleScanResume = () => {
    setWorkflowMode('scan');
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOptimizeResume = () => {
    setWorkflowMode('optimize');
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSimpleMode = () => {
    setWorkflowMode('simple');
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <AnimatedGridPattern
        width={60}
        height={60}
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        className="opacity-30"
      />

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center px-4 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                <span className="block">Beat Every</span>
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ATS System
                </span>
              </h1>
              <p className="mx-auto max-w-3xl text-xl text-muted-foreground sm:text-2xl">
                Transform your resume with AI-powered keyword optimization. Get past ATS filters and
                land more interviews.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-8 max-w-4xl mx-auto">
              {/* Action Buttons */}
              <div className="flex flex-col items-center justify-center gap-6 w-full max-w-2xl mx-auto">
                {/* Simple Mode Button */}
                <div className="w-full flex flex-col items-center">
                  <button
                    onClick={handleSimpleMode}
                    className="w-full px-8 py-4 text-lg font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-3 bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Target className="h-5 w-5" />
                    <span>Simple ATS Boost</span>
                    <span className="px-2 py-1 text-sm rounded-full font-bold bg-white text-blue-600">
                      QUICK
                    </span>
                  </button>
                  <p className="text-sm mt-2 text-center max-w-sm text-muted-foreground">
                    Select your role and get targeted keyword analysis • Fast and focused
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {/* Scan Button */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={handleScanResume}
                      className="w-full px-6 py-3 text-base font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-3 bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Free Scan</span>
                    </button>
                    <p className="text-xs mt-2 text-center text-muted-foreground">
                      Basic compatibility check
                    </p>
                  </div>

                  {/* Optimize Button */}
                  <div className="flex flex-col items-center">
                    <div className="w-full">
                      <ShimmerButton
                        className="w-full px-6 py-3 text-base"
                        onClick={handleOptimizeResume}
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        AI Optimize
                      </ShimmerButton>
                    </div>
                    <p className="text-xs mt-2 text-center text-muted-foreground">
                      Full AI enhancement
                    </p>
                  </div>
                </div>
              </div>

              <button className="px-8 py-4 text-lg font-medium text-muted-foreground transition-colors hover:text-foreground">
                See How It Works
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-16 md:grid-cols-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-primary sm:text-4xl">
                    {stat.value}
                    <span className="text-2xl">{stat.suffix}</span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Resume Optimization Workflow */}
      <section id="upload-section" className="px-4 py-24 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background border rounded-full text-sm font-medium text-muted-foreground mb-4">
              <ArrowRight className="h-4 w-4" />
              <span>Continue from above</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              {workflowMode === 'simple' ? 'Simple ATS Boost' : 
               workflowMode === 'scan' ? 'Free ATS Analysis' : 'Resume Optimization'}
            </h2>
            <p className="text-xl text-muted-foreground">
              {workflowMode === 'simple' 
                ? 'Choose your role and get targeted keyword analysis with improvement suggestions'
                : workflowMode === 'scan' 
                ? 'Get instant feedback on your resume\'s ATS compatibility'
                : 'Follow our simple process to get an ATS-optimized resume'
              }
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {workflowMode === 'simple' ? (
              <SimpleWorkflow onUpgrade={() => setWorkflowMode('optimize')} />
            ) : workflowMode === 'optimize' ? (
              <AIWorkflow onDowngrade={() => setWorkflowMode('simple')} />
            ) : (
              <ResumeWorkflow mode={workflowMode} />
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Why Choose BATS?</h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Our advanced technology ensures your resume gets noticed by both ATS systems and
              hiring managers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of professionals who've transformed their job search.
            </p>
          </motion.div>

          <Marquee pauseOnHover className="[--duration:30s]">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="mx-4 w-80 rounded-lg border bg-card p-6 shadow-sm">
                <div className="mb-3 flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-sm">"{testimonial.text}"</p>
                <div>
                  <p className="text-sm font-medium">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary px-4 py-24 text-primary-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to Beat Every ATS?</h2>
            <p className="mx-auto max-w-2xl text-xl opacity-90">
              Join thousands of professionals who've transformed their job search with BATS.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <ShimmerButton className="border border-white/20 bg-white/10 px-8 py-4 text-lg hover:bg-white/20">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </ShimmerButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-muted-foreground">
            &copy; 2024 BATS - Beat ATS Systems. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Upload, FileText, Image, Video, ArrowRight, Shield, Brain, Network, CheckCircle, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import ThreeScene from '../components/ThreeScene';
import Logo from '../components/Logo';

const Landing = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [live, setLive] = useState(null);
  useEffect(() => {
    axios.get(`${API_BASE_URL}/stats`).then((r) => setLive(r.data)).catch(() => setLive(null));
  }, []);

  useGSAP(() => {
    gsap.from('.hero-badge', {
      y: -20,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });

    gsap.from('.hero-title', {
      y: 40,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: 'power4.out'
    });

    gsap.from('.hero-subtitle', {
      y: 30,
      opacity: 0,
      duration: 1,
      delay: 0.5,
      ease: 'power3.out'
    });

    gsap.from('.hero-buttons', {
      y: 20,
      opacity: 0,
      duration: 1,
      delay: 0.7,
      ease: 'power3.out'
    });

    gsap.to('.floating-logo', {
      y: -15,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }, []);

  const features = [
    {
      icon: FileText,
      title: 'Text and links',
      description: 'Paste an article, a post or a URL. Each claim is pulled out and scored on its own.',
      color: '#002FA7'
    },
    {
      icon: Image,
      title: 'Images',
      description: 'Looks for signs of editing or generation in a photo and explains what it found.',
      color: '#0A0A0A'
    },
    {
      icon: Video,
      title: 'Short videos',
      description: 'Samples frames from a clip and checks them for signs of manipulation.',
      color: '#002FA7'
    },
    {
      icon: Brain,
      title: 'Why it decided',
      description: 'Every result comes with the reasoning, the sentences that mattered and a confidence level.',
      color: '#0A0A0A'
    },
    {
      icon: Network,
      title: 'How claims connect',
      description: 'A small graph of the people, places and sources a claim mentions.',
      color: '#002FA7'
    },
    {
      icon: Shield,
      title: 'Source checks',
      description: 'Claims are compared with Wikipedia and published reporting, with links you can open.',
      color: '#0A0A0A'
    }
  ];

  const stats = [
    { label: 'Checks run', value: live ? live.total_analyses.toLocaleString() : '-' },
    { label: 'Claims tracked', value: live ? live.total_claims_tracked.toLocaleString() : '-' },
    { label: 'Content kinds checked', value: live ? String(live.content_type_distribution.length) : '-' },
    { label: 'Formats supported', value: '5' }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" data-testid="landing-page">
      {/* Hero Section with 3D Background */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">

        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-5xl mx-auto text-center">

            <p className="hero-badge mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Text · Links · PDFs · Images · Video</p>

            <h1 className="hero-title text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 cabinet-grotesk leading-[1.05]">
              Check a claim<br />before you share it.
            </h1>

            <p className="hero-subtitle text-base sm:text-lg text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Paste a claim, a link, a PDF, a photo or a short video. TruthLens checks it against several models and
              public sources, then shows how credible it looks and why.
            </p>

            <div className="hero-buttons flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => navigate('/analyze')}
                className="group bg-black hover:bg-gray-800 text-white px-8 py-7 text-base rounded-full"
                data-testid="analyze-content-btn"
              >
                Start Analyzing
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="border-2 border-black text-black hover:bg-black hover:text-white px-8 py-7 text-base rounded-full transition-all"
                data-testid="view-dashboard-btn"
              >
                View Dashboard
              </Button>
            </div>

            <img
              src="/illustrations/tl-hero-lens.webp" alt="" width={560} height={315}
              className="mx-auto mt-14 h-auto w-full max-w-[560px]"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold mt-3 cabinet-grotesk">So far</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-white border border-gray-200 p-8 hover:border-black transition-colors relative overflow-hidden group"
                  data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}
                >
                  <div className="text-5xl font-bold cabinet-grotesk mb-2 text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-900">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold cabinet-grotesk">What it checks</h2>
              <p className="text-base text-gray-600 mt-6 max-w-2xl mx-auto">
                Each check looks at a different part of the evidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="group relative bg-white border border-gray-200 p-8 hover:border-black transition-all overflow-hidden"
                  data-testid={`feature-${feature.title.toLowerCase().replace(' ', '-')}`}
                >
                  <div className="absolute top-0 left-0 w-full h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left bg-[#1f3a8a]" />

                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                    style={{ background: `${feature.color}15` }}
                  >
                    <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                  </div>

                  <h3 className="text-xl font-bold mb-3 cabinet-grotesk">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>

                  <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-black group-hover:gap-3 transition-all">
                    <span>Learn more</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Process</span>
              <h2 className="text-3xl sm:text-5xl font-bold mt-3 cabinet-grotesk">
                Three steps to clarity
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: '01', title: 'Upload', desc: 'Drop text, image, or video content into the analyzer', icon: Upload },
                { num: '02', title: 'Analyze', desc: 'It is checked by several models and against public sources', icon: Zap },
                { num: '03', title: 'Decide', desc: 'Get credibility score, explanation, and source verification', icon: CheckCircle }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="relative"
                  data-testid={`step-${i + 1}`}
                >
                  <div className="text-7xl font-bold cabinet-grotesk text-gray-200 mb-4">{step.num}</div>
                  <step.icon className="w-10 h-10 text-blue-900 mb-4" />
                  <h3 className="text-2xl font-bold mb-3 cabinet-grotesk">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ThreeScene />
        </div>
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 cabinet-grotesk">
            Check something now.
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            A headline, a link, a photo or a short clip is enough.
          </p>
          <Button
            onClick={() => navigate('/analyze')}
            className="bg-white text-black hover:bg-gray-100 px-10 py-7 text-base rounded-full font-semibold"
            data-testid="start-analyzing-btn"
          >
            <Upload className="mr-2 w-5 h-5" />
            Start a check
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-900 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Logo size={32} />
              <span className="text-white font-bold cabinet-grotesk text-lg">TruthLens AI</span>
            </div>
            <div className="text-sm text-gray-500">
              TruthLens
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

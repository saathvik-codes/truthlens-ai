import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { TypeAnimation } from 'react-type-animation';
import { Upload, FileText, Image, Video, ArrowRight, Shield, Brain, Network, Sparkles, CheckCircle, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import ThreeScene from '../components/ThreeScene';
import Logo from '../components/Logo';

const Landing = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);

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
      title: 'Text Intelligence',
      description: 'Detect fake news and misleading claims in articles, tweets, and social media posts with NLP ensemble analysis.',
      color: '#002FA7'
    },
    {
      icon: Image,
      title: 'Image Forensics',
      description: 'Identify manipulated photos, AI-generated imagery, and deepfake indicators using vision transformers.',
      color: '#0A0A0A'
    },
    {
      icon: Video,
      title: 'Deepfake Detection',
      description: 'Frame-by-frame video analysis with temporal anomaly detection and synthetic media identification.',
      color: '#002FA7'
    },
    {
      icon: Brain,
      title: 'Explainable AI',
      description: 'Get detailed reasoning with SHAP-style highlighting, attention visualization, and confidence metrics.',
      color: '#0A0A0A'
    },
    {
      icon: Network,
      title: 'Knowledge Graph',
      description: 'Visualize misinformation spread, source relationships, and entity connections in real-time.',
      color: '#002FA7'
    },
    {
      icon: Shield,
      title: 'Source Verification',
      description: 'Cross-reference claims against Wikipedia, trusted news sources, and fact-check databases.',
      color: '#0A0A0A'
    }
  ];

  const stats = [
    { label: 'AI Models', value: '3+', sublabel: 'Ensemble' },
    { label: 'Accuracy', value: '95%', sublabel: 'Verified' },
    { label: 'Content Types', value: '3', sublabel: 'Multimodal' },
    { label: 'Response', value: '<5s', sublabel: 'Real-time' }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" data-testid="landing-page">
      {/* Hero Section with 3D Background */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-60">
          <ThreeScene />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white z-[1]" />

        <div className="absolute inset-0 z-[1] opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: 'spring' }}
              className="floating-logo inline-block mb-8"
            >
              <Logo size={80} />
            </motion.div>

            <div className="hero-badge inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full mb-8">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">Powered by Multi-Model AI</span>
            </div>

            <h1 className="hero-title text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 cabinet-grotesk leading-[1.05]">
              See beyond the<br />
              <span className="relative inline-block">
                <TypeAnimation
                  sequence={[
                    'deception',
                    2000,
                    'manipulation',
                    2000,
                    'deepfakes',
                    2000,
                    'misinformation',
                    2000
                  ]}
                  wrapper="span"
                  speed={40}
                  style={{ color: '#002FA7' }}
                  repeat={Infinity}
                />
              </span>
            </h1>

            <p className="hero-subtitle text-base sm:text-lg text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              TruthLens is a multimodal misinformation intelligence platform. Analyze text, images, and videos with
              ensemble AI to get detailed explanations, source tracing, and credibility scores in seconds.
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

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-20 inline-flex flex-col items-center gap-2 text-gray-400"
            >
              <span className="text-xs uppercase tracking-widest">Scroll</span>
              <div className="w-px h-12 bg-gradient-to-b from-gray-400 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">By The Numbers</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-3 cabinet-grotesk">Built for Scale & Precision</h2>
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
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-900/5 to-transparent rounded-bl-full" />
                  <div className="text-5xl font-bold cabinet-grotesk mb-2 bg-gradient-to-r from-black to-blue-900 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-900">{stat.label}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{stat.sublabel}</div>
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
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Core Capabilities</span>
              <h2 className="text-3xl sm:text-5xl font-bold mt-3 cabinet-grotesk">
                Comprehensive<br />
                <span className="text-blue-900">Detection Engine</span>
              </h2>
              <p className="text-base text-gray-600 mt-6 max-w-2xl mx-auto">
                Six powerful modules working in concert to deliver research-grade misinformation intelligence.
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
                  className="group relative bg-white border border-gray-200 p-8 hover:border-black transition-all hover:shadow-xl overflow-hidden"
                  data-testid={`feature-${feature.title.toLowerCase().replace(' ', '-')}`}
                >
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-black to-blue-900 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />

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
                { num: '02', title: 'Analyze', desc: 'AI ensemble processes through multiple detection layers', icon: Zap },
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
            Ready to see the truth?
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            Join researchers, journalists, and fact-checkers using TruthLens to combat misinformation.
          </p>
          <Button
            onClick={() => navigate('/analyze')}
            className="bg-white text-black hover:bg-gray-100 px-10 py-7 text-base rounded-full font-semibold"
            data-testid="start-analyzing-btn"
          >
            <Upload className="mr-2 w-5 h-5" />
            Start Analyzing Now
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
              Multimodal Misinformation Intelligence Platform · 2026
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

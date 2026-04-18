import React from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Image, Video, ArrowRight, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: 'Text Analysis',
      description: 'Detect fake news and misleading claims in articles and social media'
    },
    {
      icon: Image,
      title: 'Image Forensics',
      description: 'Identify manipulated photos and AI-generated imagery'
    },
    {
      icon: Video,
      title: 'Deepfake Detection',
      description: 'Analyze videos frame-by-frame for synthetic media'
    }
  ];

  const stats = [
    { label: 'AI Models', value: '3+', icon: CheckCircle },
    { label: 'Content Types', value: 'Multi', icon: AlertCircle },
    { label: 'Accuracy Rate', value: '95%', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-6 py-16"
        data-testid="landing-hero"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-900">Powered by AI</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 cabinet-grotesk">
            Multimodal Misinformation
            <br />
            <span className="text-blue-900">Intelligence Platform</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Not just detection — get detailed explanations, source tracing, and credibility intelligence
            powered by OpenAI, Claude, and Gemini.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => navigate('/analyze')}
              className="bg-black hover:bg-gray-800 text-white px-8 py-6 text-base"
              data-testid="analyze-content-btn"
            >
              Analyze Content
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="border-gray-300 px-8 py-6 text-base"
              data-testid="view-dashboard-btn"
            >
              View Dashboard
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="container mx-auto px-6 py-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-6 text-center"
              data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}
            >
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-900" />
              <div className="text-3xl font-bold cabinet-grotesk mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Features */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Core Capabilities</span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-3 cabinet-grotesk">
            Comprehensive Detection Engine
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-all"
              data-testid={`feature-${feature.title.toLowerCase().replace(' ', '-')}`}
            >
              <feature.icon className="w-10 h-10 text-blue-900 mb-4" />
              <h3 className="text-xl font-medium mb-3 cabinet-grotesk">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="container mx-auto px-6 py-16"
      >
        <div className="bg-gray-900 rounded-lg p-12 text-center text-white max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 cabinet-grotesk">
            Start Detecting Misinformation Now
          </h2>
          <p className="text-base text-gray-300 mb-6 max-w-2xl mx-auto">
            Upload text, images, or videos to get instant credibility analysis
            with explainable AI insights.
          </p>
          <Button
            onClick={() => navigate('/analyze')}
            className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-base"
            data-testid="start-analyzing-btn"
          >
            <Upload className="mr-2 w-5 h-5" />
            Start Analyzing
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;
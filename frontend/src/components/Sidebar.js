import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, BarChart3, Menu, X, Sparkles } from 'lucide-react';
import Logo from './Logo';

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/analyze', icon: Search, label: 'Analyze' },
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' }
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 60 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="sidebar"
      data-testid="sidebar"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2"
              >
                <Logo size={32} />
                <span className="font-bold text-lg cabinet-grotesk" data-testid="app-title">TruthLens</span>
              </motion.div>
            )}
            {collapsed && <Logo size={32} />}
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-200 rounded-md transition-colors"
              data-testid="sidebar-toggle-btn"
            >
              {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all relative overflow-hidden group ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-black"
                      style={{ borderRadius: 6 }}
                    />
                  )}
                  <Icon className="w-5 h-5 relative z-10" />
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-medium relative z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer Badge */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 border-t border-gray-200"
          >
            <div className="bg-gradient-to-br from-black to-blue-900 rounded-lg p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">AI Ensemble</span>
              </div>
              <p className="text-xs text-gray-300">OpenAI · Claude · Gemini</p>
              <div className="mt-3 flex gap-1">
                <div className="h-1 flex-1 bg-white/20 rounded">
                  <div className="h-full bg-white rounded w-full" />
                </div>
                <div className="h-1 flex-1 bg-white/20 rounded">
                  <div className="h-full bg-white rounded w-3/4" />
                </div>
                <div className="h-1 flex-1 bg-white/20 rounded">
                  <div className="h-full bg-white rounded w-1/2" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, BarChart3, Menu, X, Shield } from 'lucide-react';

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/analyze', icon: Search, label: 'Analyze' },
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' }
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-900" data-testid="logo-icon" />
                <span className="font-bold text-lg cabinet-grotesk" data-testid="app-title">TruthLens</span>
              </div>
            )}
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-5 h-5" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p className="font-semibold">AI-Powered Detection</p>
              <p>OpenAI · Claude · Gemini</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
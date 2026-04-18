import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FileText, Image, Video, TrendingUp, Activity } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast.error('Failed to load analysis history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (prediction) => {
    if (prediction.toLowerCase().includes('reliable') || prediction.toLowerCase().includes('authentic')) {
      return 'status-reliable';
    } else if (prediction.toLowerCase().includes('suspicious')) {
      return 'status-suspicious';
    } else {
      return 'status-fake';
    }
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'text':
        return FileText;
      case 'image':
        return Image;
      case 'video':
        return Video;
      default:
        return FileText;
    }
  };

  const stats = [
    {
      label: 'Total Analyses',
      value: history.length,
      icon: Activity,
      color: 'text-blue-900'
    },
    {
      label: 'Avg. Credibility',
      value: history.length > 0
        ? `${(history.reduce((sum, item) => sum + item.credibility_score, 0) / history.length).toFixed(1)}%`
        : '0%',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Fake Detected',
      value: history.filter(item => 
        item.prediction.toLowerCase().includes('fake') || 
        item.prediction.toLowerCase().includes('manipulated')
      ).length,
      icon: Activity,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-white p-6" data-testid="dashboard-page">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold cabinet-grotesk mb-2">Analysis Dashboard</h1>
          <p className="text-base text-gray-600">Track and review your content analyses</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white border border-gray-200 rounded-lg p-6"
              data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {stat.label}
                </span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold cabinet-grotesk">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold cabinet-grotesk mb-6">Recent Analyses</h2>

          {loading ? (
            <div className="text-center py-12 text-gray-500" data-testid="loading-history">
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-500" data-testid="no-history">
              No analyses yet. Start by analyzing content!
            </div>
          ) : (
            <div className="space-y-3" data-testid="history-list">
              {history.map((item, index) => {
                const ContentIcon = getContentIcon(item.content_type);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="analysis-card p-4"
                    data-testid={`history-item-${index}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 bg-gray-100 rounded-md">
                          <ContentIcon className="w-5 h-5 text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-medium capitalize">{item.content_type}</span>
                            <span className={`status-badge ${getStatusClass(item.prediction)}`}>
                              {item.prediction}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold cabinet-grotesk">
                          {item.credibility_score.toFixed(0)}%
                        </div>
                        <p className="text-xs text-gray-500">Credibility</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FileText, Image as ImageIcon, Video, TrendingUp, Activity, AlertTriangle, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { toast } from 'sonner';
import { API_BASE_URL, getApiErrorMessage } from '../lib/api';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [historyRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/history`),
        axios.get(`${API_BASE_URL}/stats`)
      ]);
      setHistory(historyRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error(getApiErrorMessage(error, 'Failed to load dashboard data'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (prediction) => {
    const p = prediction.toLowerCase();
    if (p.includes('reliable') || p.includes('authentic')) return 'status-reliable';
    if (p.includes('suspicious')) return 'status-suspicious';
    return 'status-fake';
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'text': return FileText;
      case 'image': return ImageIcon;
      case 'video': return Video;
      default: return FileText;
    }
  };

  const avgCredibility = history.length > 0
    ? history.reduce((sum, item) => sum + item.credibility_score, 0) / history.length
    : 0;

  const fakeCount = history.filter(item => {
    const p = item.prediction.toLowerCase();
    return p.includes('fake') || p.includes('manipulated') || p.includes('deepfake');
  }).length;

  const reliableCount = history.filter(item => {
    const p = item.prediction.toLowerCase();
    return p.includes('reliable') || p.includes('authentic');
  }).length;

  const statCards = [
    {
      label: 'Total Analyses',
      value: history.length,
      icon: Activity,
      color: '#002FA7',
      bg: '#EFF6FF'
    },
    {
      label: 'Avg. Credibility',
      value: `${avgCredibility.toFixed(1)}%`,
      icon: TrendingUp,
      color: '#00C853',
      bg: '#D1FAE5'
    },
    {
      label: 'Reliable Content',
      value: reliableCount,
      icon: CheckCircle,
      color: '#00C853',
      bg: '#D1FAE5'
    },
    {
      label: 'Fake Detected',
      value: fakeCount,
      icon: XCircle,
      color: '#FF2A2A',
      bg: '#FEE2E2'
    }
  ];

  // Chart data
  const predictionChartData = stats?.prediction_distribution?.map(p => ({
    name: p.label,
    value: p.count
  })) || [];

  const contentTypeChartData = stats?.content_type_distribution?.map(c => ({
    name: c.label.charAt(0).toUpperCase() + c.label.slice(1),
    count: c.count
  })) || [];

  const PIE_COLORS = { 'Reliable': '#00C853', 'Authentic': '#00C853', 'Suspicious': '#FFC107', 'Fake': '#FF2A2A', 'Manipulated': '#FF2A2A', 'Deepfake Detected': '#FF2A2A' };

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="dashboard-page">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-blue-900" />
            <h1 className="text-4xl font-bold cabinet-grotesk">Analysis Dashboard</h1>
          </div>
          <p className="text-base text-gray-600">Real-time insights into misinformation detection patterns</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-').replace('.', '')}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: stat.bg }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {stat.label}
                </span>
              </div>
              <div className="text-3xl font-bold cabinet-grotesk" style={{ color: stat.color }}>
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Prediction Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-gray-200 rounded-lg p-6"
            data-testid="prediction-chart"
          >
            <h3 className="text-lg font-semibold cabinet-grotesk mb-4">Detection Distribution</h3>
            {predictionChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={predictionChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {predictionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || '#9CA3AF'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No data available yet
              </div>
            )}
          </motion.div>

          {/* Content Type Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-gray-200 rounded-lg p-6"
            data-testid="content-type-chart"
          >
            <h3 className="text-lg font-semibold cabinet-grotesk mb-4">Content Type Analysis</h3>
            {contentTypeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={contentTypeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#002FA7" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No data available yet
              </div>
            )}
          </motion.div>
        </div>

        {/* History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold cabinet-grotesk">Recent Analyses</h2>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Last {history.length} analyses
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500" data-testid="loading-history">
              <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-900 rounded-full animate-spin mb-3" />
              <p>Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12" data-testid="no-history">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No analyses yet. Start by analyzing content!</p>
            </div>
          ) : (
            <div className="space-y-3" data-testid="history-list">
              {history.map((item, index) => {
                const ContentIcon = getContentIcon(item.content_type);
                const scoreColor = item.credibility_score >= 70 ? '#00C853' :
                                   item.credibility_score >= 40 ? '#FFC107' : '#FF2A2A';

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.02 * index }}
                    className="analysis-card p-4"
                    data-testid={`history-item-${index}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-gray-100 rounded-lg">
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
                        <div className="text-3xl font-bold cabinet-grotesk" style={{ color: scoreColor }}>
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

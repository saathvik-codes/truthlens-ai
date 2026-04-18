import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const CredibilityScore = ({ score, prediction }) => {
  const getColor = () => {
    if (score >= 70) return '#00C853';
    if (score >= 40) return '#FFC107';
    return '#FF2A2A';
  };

  const getIcon = () => {
    if (score >= 70) return CheckCircle;
    if (score >= 40) return AlertTriangle;
    return XCircle;
  };

  const Icon = getIcon();
  const color = getColor();

  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-gray-200 rounded-lg p-6"
      data-testid="credibility-score-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold cabinet-grotesk">Credibility Score</h3>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-5xl font-bold cabinet-grotesk mb-2" style={{ color }}>
            {score.toFixed(0)}%
          </div>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
            style={{ 
              backgroundColor: `${color}20`,
              color: color
            }}
            data-testid="prediction-badge"
          >
            {prediction}
          </div>
        </div>

        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={50}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
              >
                <Cell fill={color} />
                <Cell fill="#E5E7EB" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default CredibilityScore;
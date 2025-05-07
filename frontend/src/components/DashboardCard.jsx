import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { gradients } from '../utils/theme';

const DashboardCard = ({ 
  title, 
  value, 
  icon, 
  bgColor, 
  textColor, 
  gradient, 
  trend, 
  trendValue, 
  onClick,
  className = '' 
}) => {
  // Card hover animation
  const cardVariants = {
    initial: { 
      scale: 1,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    },
    hover: { 
      scale: 1.03,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    tap: { 
      scale: 0.98 
    }
  };

  // Determine trend color and icon
  const getTrendColor = () => {
    if (!trend) return '';
    return trend === 'up' 
      ? 'text-green-500' 
      : trend === 'down' 
        ? 'text-red-500' 
        : 'text-gray-500';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' 
      ? '↑' 
      : trend === 'down' 
        ? '↓' 
        : '→';
  };

  // Determine background style (gradient or color)
  const getBgStyle = () => {
    if (gradient) {
      const gradientValue = gradients[gradient] || gradient;
      return { background: gradientValue };
    }
    return {};
  };

  return (
    <motion.div
      className={`p-6 rounded-xl shadow ${bgColor || 'bg-white'} ${className}`}
      style={getBgStyle()}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap={onClick ? "tap" : undefined}
      onClick={onClick}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-medium ${textColor || 'text-gray-700'} mb-1`}>{title}</h3>
          <div className="flex items-center">
            <p className={`text-3xl font-bold ${textColor || 'text-gray-900'}`}>{value}</p>
            
            {trend && (
              <div className={`ml-2 flex items-center ${getTrendColor()}`}>
                <span className="text-lg font-bold">{getTrendIcon()}</span>
                {trendValue && <span className="ml-1 text-sm">{trendValue}</span>}
              </div>
            )}
          </div>
        </div>
        
        {icon && (
          <motion.div 
            className="text-3xl opacity-80"
            initial={{ rotate: 0 }}
            whileHover={{ rotate: 15, scale: 1.2 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {icon}
          </motion.div>
        )}
      </div>
      
      {/* Optional progress bar or chart could go here */}
    </motion.div>
  );
};

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.element,
  bgColor: PropTypes.string,
  textColor: PropTypes.string,
  gradient: PropTypes.string,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  trendValue: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string
};

export default DashboardCard; 
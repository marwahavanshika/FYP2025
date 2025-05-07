import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', color = 'blue', fullScreen = false }) => {
  // Size variants
  const sizeMap = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  // Color variants
  const colorMap = {
    blue: 'border-blue-600',
    indigo: 'border-indigo-600',
    purple: 'border-purple-600',
    pink: 'border-pink-600',
    red: 'border-red-600',
    orange: 'border-orange-600',
    yellow: 'border-yellow-600',
    green: 'border-green-600',
    teal: 'border-teal-600',
    gray: 'border-gray-600'
  };

  // Animation variants
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        ease: "linear",
        repeat: Infinity
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  };

  // Render fullscreen spinner
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`border-4 rounded-full ${sizeMap[size]} border-gray-200 ${colorMap[color]} border-t-transparent`}
            variants={spinnerVariants}
            animate="animate"
          />
          <motion.p 
            className="mt-4 text-white font-medium"
            variants={pulseVariants}
            animate="animate"
          >
            Loading...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Render inline spinner
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`border-4 rounded-full ${sizeMap[size]} border-gray-200 ${colorMap[color]} border-t-transparent`}
        variants={spinnerVariants}
        animate="animate"
      />
    </div>
  );
};

export default LoadingSpinner; 
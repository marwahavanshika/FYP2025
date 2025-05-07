import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

// Animation variants for page transitions
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

// Animation variants for children elements
const childVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  out: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

/**
 * PageTransition component for smooth page transitions
 * Wrap your page content with this component to add transition animations
 */
const PageTransition = ({ 
  children, 
  className = "", 
  transition = "default", 
  staggerChildren = false 
}) => {
  // Different transition types
  const transitions = {
    default: pageVariants,
    fade: {
      initial: { opacity: 0 },
      in: { 
        opacity: 1,
        transition: { duration: 0.4, ease: "easeOut" }
      },
      out: { 
        opacity: 0,
        transition: { duration: 0.3, ease: "easeIn" }
      }
    },
    slide: {
      initial: { x: "100%" },
      in: { 
        x: 0,
        transition: { 
          type: "spring", 
          damping: 20, 
          stiffness: 100 
        }
      },
      out: { 
        x: "-100%",
        transition: { duration: 0.3, ease: "easeIn" }
      }
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      in: { 
        opacity: 1, 
        scale: 1,
        transition: { 
          type: "spring", 
          damping: 20, 
          stiffness: 100 
        }
      },
      out: { 
        opacity: 0, 
        scale: 1.1,
        transition: { duration: 0.3, ease: "easeIn" }
      }
    }
  };

  const selectedTransition = transitions[transition] || transitions.default;

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="in"
      exit="out"
      variants={selectedTransition}
    >
      {staggerChildren ? (
        // If staggering children, wrap each direct child in a motion div
        React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={childVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={{ delay: index * 0.1 }}
          >
            {child}
          </motion.div>
        ))
      ) : (
        // Otherwise, render children directly
        children
      )}
    </motion.div>
  );
};

PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  transition: PropTypes.oneOf(['default', 'fade', 'slide', 'scale']),
  staggerChildren: PropTypes.bool
};

export default PageTransition; 
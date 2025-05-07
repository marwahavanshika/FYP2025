import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  fadeIn, 
  slideIn, 
  zoomIn, 
  textVariant, 
  cardHoverAnimation, 
  buttonTapAnimation 
} from '../utils/animations';

// Animated section that fades in when scrolled into view
export const AnimatedSection = ({ children, direction = "up", delay = 0, className = "" }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      variants={fadeIn(direction, delay)}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Animated text that slides up when scrolled into view
export const AnimatedText = ({ children, delay = 0, className = "" }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      variants={textVariant(delay)}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Animated card with hover effect
export const AnimatedCard = ({ children, className = "" }) => {
  return (
    <motion.div
      variants={cardHoverAnimation}
      initial="rest"
      whileHover="hover"
      className={`rounded-xl overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Animated button with tap effect
export const AnimatedButton = ({ children, onClick, className = "" }) => {
  return (
    <motion.button
      onClick={onClick}
      variants={buttonTapAnimation}
      initial="rest"
      whileTap="tap"
      className={className}
    >
      {children}
    </motion.button>
  );
};

// Animated image that zooms in when scrolled into view
export const AnimatedImage = ({ src, alt, delay = 0, duration = 0.5, className = "" }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.img
      ref={ref}
      variants={zoomIn(delay, duration)}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      src={src}
      alt={alt}
      className={className}
    />
  );
};

// Animated container with staggered children animations
export const AnimatedContainer = ({ children, staggerChildren = 0.1, delayChildren = 0, className = "" }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren,
            delayChildren,
          },
        },
      }}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Animated div that slides in from a specified direction
export const AnimatedSlide = ({ 
  children, 
  direction = "left", 
  type = "spring", 
  delay = 0, 
  duration = 0.8,
  className = "" 
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      variants={slideIn(direction, type, delay, duration)}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Animated badge/tag with pulse effect
export const AnimatedBadge = ({ children, className = "" }) => {
  return (
    <motion.span
      initial={{ scale: 0.8 }}
      animate={{ 
        scale: [0.8, 1.2, 1],
        transition: { duration: 0.6 }
      }}
      className={className}
    >
      {children}
    </motion.span>
  );
};

// Animated counter that counts up to a target number
export const AnimatedCounter = ({ from = 0, to, duration = 2, className = "" }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      className={className}
    >
      {inView && (
        <motion.span
          initial={{ count: from }}
          animate={{ count: to }}
          transition={{ duration }}
          children={({ count }) => Math.floor(count)}
        />
      )}
    </motion.span>
  );
};

// Animated loader/spinner
export const AnimatedSpinner = ({ size = 40, color = "#6366f1", className = "" }) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ 
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `3px solid ${color}20`,
        borderTop: `3px solid ${color}`,
      }}
      className={className}
    />
  );
};

export default {
  AnimatedSection,
  AnimatedText,
  AnimatedCard,
  AnimatedButton,
  AnimatedImage,
  AnimatedContainer,
  AnimatedSlide,
  AnimatedBadge,
  AnimatedCounter,
  AnimatedSpinner
}; 
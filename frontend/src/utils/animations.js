// Animation variants for Framer Motion
export const fadeIn = (direction = "up", delay = 0) => {
  return {
    hidden: {
      y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
      x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
      opacity: 0
    },
    show: {
      y: 0,
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        duration: 0.8,
        delay,
        ease: [0.25, 0.25, 0.25, 0.75]
      }
    }
  };
};

export const staggerContainer = (staggerChildren, delayChildren) => {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren,
        delayChildren
      }
    }
  };
};

export const textVariant = (delay) => {
  return {
    hidden: {
      y: 50,
      opacity: 0
    },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        duration: 1.25,
        delay
      }
    }
  };
};

export const slideIn = (direction, type, delay, duration) => {
  return {
    hidden: {
      x: direction === "left" ? "-100%" : direction === "right" ? "100%" : 0,
      y: direction === "up" ? "100%" : direction === "down" ? "-100%" : 0
    },
    show: {
      x: 0,
      y: 0,
      transition: {
        type,
        delay,
        duration,
        ease: "easeOut"
      }
    }
  };
};

export const zoomIn = (delay, duration) => {
  return {
    hidden: {
      scale: 0,
      opacity: 0
    },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "tween",
        delay,
        duration,
        ease: "easeOut"
      }
    }
  };
};

export const cardHoverAnimation = {
  rest: { 
    scale: 1,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    transition: { 
      duration: 0.2, 
      type: "tween", 
      ease: "easeOut" 
    }
  },
  hover: { 
    scale: 1.03,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { 
      duration: 0.4, 
      type: "spring", 
      stiffness: 300,
      damping: 20
    }
  }
};

export const buttonTapAnimation = {
  rest: { scale: 1 },
  tap: { scale: 0.95 }
};

export const pageTransition = {
  hidden: { opacity: 0 },
  enter: { 
    opacity: 1,
    transition: { 
      duration: 0.5, 
      ease: "easeInOut"
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.3, 
      ease: "easeInOut"
    }
  }
}; 
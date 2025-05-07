import React from 'react';
import { motion } from 'framer-motion';

// Building/Hostel illustration
export const BuildingIllustration = ({ className = "", animate = true }) => {
  const buildingVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const windowVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const cloudVariants = {
    animate: {
      x: [0, 10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <motion.svg
      className={className}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial="hidden"
      animate={animate ? "visible" : "hidden"}
      variants={buildingVariants}
    >
      {/* Sky background */}
      <rect width="400" height="300" fill="#e0f2fe" />
      
      {/* Clouds */}
      <motion.g variants={cloudVariants} animate="animate">
        <circle cx="50" cy="50" r="20" fill="white" />
        <circle cx="80" cy="50" r="25" fill="white" />
        <circle cx="110" cy="50" r="20" fill="white" />
      </motion.g>
      
      <motion.g variants={cloudVariants} animate="animate" custom={1}>
        <circle cx="250" cy="70" r="15" fill="white" />
        <circle cx="280" cy="70" r="20" fill="white" />
        <circle cx="310" cy="70" r="15" fill="white" />
      </motion.g>
      
      {/* Ground */}
      <rect y="250" width="400" height="50" fill="#4ade80" />
      
      {/* Building */}
      <motion.rect x="100" y="100" width="200" height="150" fill="#3b82f6" variants={windowVariants} />
      <motion.rect x="120" y="120" width="30" height="30" fill="#bfdbfe" variants={windowVariants} />
      <motion.rect x="160" y="120" width="30" height="30" fill="#bfdbfe" variants={windowVariants} />
      <motion.rect x="200" y="120" width="30" height="30" fill="#bfdbfe" variants={windowVariants} />
      <motion.rect x="240" y="120" width="30" height="30" fill="#bfdbfe" variants={windowVariants} />
      
      <motion.rect x="120" y="160" width="30" height="30" fill="#bfdbfe" variants={windowVariants} />
      <motion.rect x="160" y="160" width="30" height="30" fill="#bfdbfe" variants={windowVariants} />
      <motion.rect x="200" y="160" width="30" height="30" fill="#bfdbfe" variants={windowVariants} />
      <motion.rect x="240" y="160" width="30" height="30" fill="#bfdbfe" variants={windowVariants} />
      
      {/* Door */}
      <motion.rect x="160" y="200" width="70" height="50" fill="#1e3a8a" variants={windowVariants} />
      <motion.rect x="190" y="225" width="10" height="10" fill="#fef08a" variants={windowVariants} />
      
      {/* Roof */}
      <motion.polygon points="100,100 200,50 300,100" fill="#1d4ed8" variants={windowVariants} />
    </motion.svg>
  );
};

// Community/Chat illustration
export const CommunityIllustration = ({ className = "", animate = true }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        damping: 15
      }
    }
  };

  const floatVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <motion.svg
      className={className}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial="hidden"
      animate={animate ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {/* Background */}
      <rect width="400" height="300" fill="#f5f3ff" />
      
      {/* Chat bubbles */}
      <motion.g variants={itemVariants}>
        <motion.rect x="50" y="100" width="120" height="80" rx="20" fill="#8b5cf6" variants={floatVariants} animate="animate" />
        <circle cx="70" cy="80" r="20" fill="#4c1d95" />
        <text x="85" y="140" fill="white" fontSize="12">Hello there!</text>
      </motion.g>
      
      <motion.g variants={itemVariants}>
        <motion.rect x="220" y="150" width="120" height="80" rx="20" fill="#6366f1" variants={floatVariants} animate="animate" custom={1} />
        <circle cx="300" cy="130" r="20" fill="#3730a3" />
        <text x="235" y="190" fill="white" fontSize="12">Hi, how are you?</text>
      </motion.g>
      
      <motion.g variants={itemVariants}>
        <motion.rect x="120" y="200" width="120" height="80" rx="20" fill="#8b5cf6" variants={floatVariants} animate="animate" custom={2} />
        <circle cx="140" cy="180" r="20" fill="#4c1d95" />
        <text x="135" y="240" fill="white" fontSize="12">I'm good, thanks!</text>
      </motion.g>
    </motion.svg>
  );
};

// Complaints/Ticket illustration
export const ComplaintsIllustration = ({ className = "", animate = true }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity
      }
    }
  };

  return (
    <motion.svg
      className={className}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial="hidden"
      animate={animate ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {/* Background */}
      <rect width="400" height="300" fill="#f0f9ff" />
      
      {/* Clipboard */}
      <motion.rect x="100" y="50" width="200" height="230" rx="10" fill="#0ea5e9" variants={itemVariants} />
      <motion.rect x="110" y="60" width="180" height="210" rx="5" fill="white" variants={itemVariants} />
      
      {/* Clip */}
      <motion.rect x="180" y="40" width="40" height="20" rx="5" fill="#0284c7" variants={itemVariants} />
      
      {/* List items */}
      <motion.g variants={itemVariants}>
        <rect x="130" y="90" width="140" height="30" rx="5" fill="#e0f2fe" />
        <circle cx="145" cy="105" r="8" fill="#0ea5e9" />
        <line x1="160" y1="105" x2="250" y2="105" stroke="#0ea5e9" strokeWidth="2" />
      </motion.g>
      
      <motion.g variants={itemVariants}>
        <rect x="130" y="130" width="140" height="30" rx="5" fill="#e0f2fe" />
        <circle cx="145" cy="145" r="8" fill="#0ea5e9" />
        <line x1="160" y1="145" x2="250" y2="145" stroke="#0ea5e9" strokeWidth="2" />
      </motion.g>
      
      <motion.g variants={itemVariants}>
        <rect x="130" y="170" width="140" height="30" rx="5" fill="#e0f2fe" />
        <circle cx="145" cy="185" r="8" fill="#0ea5e9" />
        <line x1="160" y1="185" x2="250" y2="185" stroke="#0ea5e9" strokeWidth="2" />
      </motion.g>
      
      {/* Status indicator */}
      <motion.circle cx="200" cy="230" r="15" fill="#22c55e" variants={pulseVariants} animate="animate" />
    </motion.svg>
  );
};

// Room allocation illustration
export const RoomAllocationIllustration = ({ className = "", animate = true }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 12
      }
    }
  };

  const highlightVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity
      }
    }
  };

  return (
    <motion.svg
      className={className}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial="hidden"
      animate={animate ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {/* Background */}
      <rect width="400" height="300" fill="#ecfdf5" />
      
      {/* Building outline */}
      <motion.rect x="50" y="50" width="300" height="200" rx="5" fill="#d1fae5" stroke="#10b981" strokeWidth="2" variants={itemVariants} />
      
      {/* Rooms - first row */}
      <motion.rect x="70" y="70" width="60" height="40" rx="3" fill="#a7f3d0" stroke="#10b981" variants={itemVariants} />
      <motion.rect x="140" y="70" width="60" height="40" rx="3" fill="#a7f3d0" stroke="#10b981" variants={itemVariants} />
      <motion.rect x="210" y="70" width="60" height="40" rx="3" fill="#a7f3d0" stroke="#10b981" variants={itemVariants} />
      <motion.rect x="280" y="70" width="50" height="40" rx="3" fill="#a7f3d0" stroke="#10b981" variants={itemVariants} />
      
      {/* Rooms - second row */}
      <motion.rect x="70" y="130" width="60" height="40" rx="3" fill="#a7f3d0" stroke="#10b981" variants={itemVariants} />
      <motion.rect x="140" y="130" width="60" height="40" rx="3" fill="#a7f3d0" stroke="#10b981" variants={itemVariants} />
      <motion.rect x="210" y="130" width="60" height="40" rx="3" fill="#a7f3d0" stroke="#10b981" variants={itemVariants} />
      <motion.rect x="280" y="130" width="50" height="40" rx="3" fill="#a7f3d0" stroke="#10b981" variants={itemVariants} />
      
      {/* Rooms - third row */}
      <motion.rect x="70" y="190" width="60" height="40" rx="3" fill="#a7f3d0" stroke="#10b981" variants={itemVariants} />
      <motion.rect x="140" y="190" width="60" height="40" rx="3" fill="#a7f3d0" stroke="#10b981" variants={itemVariants} />
      
      {/* Highlighted room */}
      <motion.rect 
        x="210" 
        y="190" 
        width="60" 
        height="40" 
        rx="3" 
        fill="#34d399" 
        stroke="#059669" 
        strokeWidth="2" 
        variants={highlightVariants} 
        animate="animate" 
      />
      
      <motion.rect x="280" y="190" width="50" height="40" rx="3" fill="#a7f3d0" stroke="#10b981" variants={itemVariants} />
      
      {/* Room numbers */}
      <motion.text x="95" y="95" fill="#059669" fontSize="12" fontWeight="bold" variants={itemVariants}>101</motion.text>
      <motion.text x="165" y="95" fill="#059669" fontSize="12" fontWeight="bold" variants={itemVariants}>102</motion.text>
      <motion.text x="235" y="95" fill="#059669" fontSize="12" fontWeight="bold" variants={itemVariants}>103</motion.text>
      <motion.text x="305" y="95" fill="#059669" fontSize="12" fontWeight="bold" variants={itemVariants}>104</motion.text>
      
      <motion.text x="95" y="155" fill="#059669" fontSize="12" fontWeight="bold" variants={itemVariants}>201</motion.text>
      <motion.text x="165" y="155" fill="#059669" fontSize="12" fontWeight="bold" variants={itemVariants}>202</motion.text>
      <motion.text x="235" y="155" fill="#059669" fontSize="12" fontWeight="bold" variants={itemVariants}>203</motion.text>
      <motion.text x="305" y="155" fill="#059669" fontSize="12" fontWeight="bold" variants={itemVariants}>204</motion.text>
      
      <motion.text x="95" y="215" fill="#059669" fontSize="12" fontWeight="bold" variants={itemVariants}>301</motion.text>
      <motion.text x="165" y="215" fill="#059669" fontSize="12" fontWeight="bold" variants={itemVariants}>302</motion.text>
      <motion.text x="235" y="215" fill="#059669" fontSize="12" fontWeight="bold" variants={itemVariants}>303</motion.text>
      <motion.text x="305" y="215" fill="#059669" fontSize="12" fontWeight="bold" variants={itemVariants}>304</motion.text>
    </motion.svg>
  );
};

// Mess feedback illustration
export const MessFeedbackIllustration = ({ className = "", animate = true }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  const floatVariants = {
    animate: {
      y: [0, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <motion.svg
      className={className}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial="hidden"
      animate={animate ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {/* Background */}
      <rect width="400" height="300" fill="#fff7ed" />
      
      {/* Plate */}
      <motion.circle cx="200" cy="150" r="100" fill="#fdba74" variants={itemVariants} />
      <motion.circle cx="200" cy="150" r="85" fill="#fff7ed" variants={itemVariants} />
      
      {/* Food items */}
      <motion.ellipse cx="200" cy="150" rx="70" ry="30" fill="#fbbf24" variants={itemVariants} />
      
      {/* Steam */}
      <motion.path 
        d="M180,100 Q190,80 200,100 Q210,80 220,100" 
        stroke="#fdba74" 
        strokeWidth="3" 
        fill="none" 
        variants={floatVariants} 
        animate="animate" 
      />
      
      {/* Rating stars */}
      <motion.g variants={itemVariants}>
        <polygon points="100,230 108,246 125,248 112,260 116,277 100,269 84,277 88,260 75,248 92,246" fill="#fbbf24" />
      </motion.g>
      
      <motion.g variants={itemVariants}>
        <polygon points="150,230 158,246 175,248 162,260 166,277 150,269 134,277 138,260 125,248 142,246" fill="#fbbf24" />
      </motion.g>
      
      <motion.g variants={itemVariants}>
        <polygon points="200,230 208,246 225,248 212,260 216,277 200,269 184,277 188,260 175,248 192,246" fill="#fbbf24" />
      </motion.g>
      
      <motion.g variants={itemVariants}>
        <polygon points="250,230 258,246 275,248 262,260 266,277 250,269 234,277 238,260 225,248 242,246" fill="#fbbf24" />
      </motion.g>
      
      <motion.g variants={itemVariants}>
        <polygon points="300,230 308,246 325,248 312,260 316,277 300,269 284,277 288,260 275,248 292,246" fill="#d4d4d4" />
      </motion.g>
      
      {/* Utensils */}
      <motion.path d="M140,120 L120,80" stroke="#78716c" strokeWidth="3" variants={itemVariants} />
      <motion.path d="M260,120 L280,80" stroke="#78716c" strokeWidth="3" variants={itemVariants} />
    </motion.svg>
  );
};

export default {
  BuildingIllustration,
  CommunityIllustration,
  ComplaintsIllustration,
  RoomAllocationIllustration,
  MessFeedbackIllustration
}; 
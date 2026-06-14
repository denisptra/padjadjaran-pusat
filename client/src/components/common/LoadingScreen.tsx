import React from 'react';
import { motion } from 'framer-motion';
import Logo from '../../assets/images/logo-kasepuhan.png';
const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-stone-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C9A227] opacity-20 rounded-full blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1,
            ease: "easeOut"
          }}
          className="relative"
        >
          {/* Pulsing ring around logo - only opacity pulse, no scale */}
          <motion.div
            animate={{
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -inset-8 border border-[#C9A227]/20 rounded-full"
          />

          <div className="relative w-32 h-32 md:w-40 md:h-40 overflow-hidden flex items-center justify-center">
            <img src={Logo} alt="logo" className="w-full h-full object-contain" />
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-12 text-center">
        <p className="text-stone-500 text-[10px] font-normal animate-pulse">
          Masa Lalu Sebagai Pedoman, Masa Depan Sebagai Harapan
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;


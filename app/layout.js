"use client"
import "./globals.css";
import { useState, useEffect, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Create loading context
const LoadingContext = createContext();

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Loading component
function LoadingSpinner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-lg font-semibold text-gray-700"
        >
          Φόρτωση...
        </motion.p>
      </div>
    </motion.div>
  );
}

export default function RootLayout({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  // Hide loading on pathname change
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  return (
    <html lang="el">
      <head>
        <title>Πίνακας Διαχείρισης Breathe Pilates</title>
        <meta name="description" content="Πίνακας διαχείρισης για το σύστημα κρατήσεων Breathe Pilates" />
      </head>
      <body className="antialiased">
        <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
          <AnimatePresence mode="wait">
            {isLoading && <LoadingSpinner />}
          </AnimatePresence>
          {children}
        </LoadingContext.Provider>
      </body>
    </html>
  );
}


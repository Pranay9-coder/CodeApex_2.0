import { motion, AnimatePresence } from 'framer-motion';

export default function StatusText({ state, text }) {
  // state: "idle", "listening", "speaking"
  
  return (
    <div className="flex flex-col items-center justify-center mt-4 mb-6 w-full px-4">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 w-full max-w-2xl max-h-48 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-base md:text-lg text-gray-800 font-medium text-center whitespace-pre-wrap leading-relaxed">
            {text}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <div className="relative flex h-3 w-3">
          {state !== 'idle' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${state === 'idle' ? 'bg-gray-300' : 'bg-blue-500'}`}></span>
        </div>
        <p className="text-sm font-semibold tracking-widest text-gray-500 uppercase">
          {state === 'idle' ? 'Ready' : state === 'listening' ? 'Listening...' : state === 'thinking' ? 'Processing...' : 'Speaking...'}
        </p>
      </div>
    </div>
  );
}

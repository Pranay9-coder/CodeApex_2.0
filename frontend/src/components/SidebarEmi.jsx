import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, X, ChevronRight } from 'lucide-react';
import { calculateEmi } from '../services/api';

export default function SidebarEmi() {
  const [isOpen, setIsOpen] = useState(false);
  const [principal, setPrincipal] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!principal || !duration) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const data = await calculateEmi(Number(principal), Number(duration));
      setResult(data);
    } catch (err) {
      setError(err.message || 'Error calculating EMI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed left-0 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-3 rounded-r-xl shadow-lg z-30 hover:bg-blue-700 transition-colors flex items-center justify-center group"
        whileHover={{ x: 5 }}
      >
        <Calculator className="w-5 h-5 mr-1" />
        <span className="font-semibold text-sm">EMI</span>
        <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center text-blue-600">
                <Calculator className="w-6 h-6 mr-2" />
                <h2 className="text-xl font-bold">Smart EMI</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Calculates your EMI automatically applying your profile's CIBIL score for interest rates.
            </p>

            <form onSubmit={handleCalculate} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Principal (₹)</label>
                <input
                  type="number"
                  min="1000"
                  step="100"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="e.g. 500000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Years)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  max="30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="e.g. 5"
                />
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-xl font-bold transition-colors mt-2 shadow-md"
              >
                {loading ? 'Calculating...' : 'Calculate Now'}
              </button>
            </form>

            {result && (
              <motion.div 
                className="mt-8 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <h3 className="text-sm font-semibold text-blue-800 mb-4">Your Loan Offer</h3>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                  <div className="text-gray-500">CIBIL Score:</div>
                  <div className="font-semibold text-right">{result.cibil_score}</div>
                  
                  <div className="text-gray-500">Interest Rate:</div>
                  <div className="font-semibold text-right text-green-600">{result.interest_rate}% p.a.</div>
                  
                  <div className="text-gray-500">Credit Rating:</div>
                  <div className="font-semibold text-right">{result.credit_rating}</div>
                  
                  <div className="text-gray-500 mt-2 text-lg">Monthly EMI:</div>
                  <div className="font-bold text-right text-lg mt-2 text-blue-700">₹{result.emi.toLocaleString('en-IN')}</div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

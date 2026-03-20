import React from 'react';
import { motion } from 'motion/react';
import { Heart, Activity, Shield, MapPin, ChevronRight } from 'lucide-react';
import { loginWithGoogle } from '../lib/firebase';

export function AuthHero() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side: Hero */}
      <div className="flex-1 bg-red-600 p-12 flex flex-col justify-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-700 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Heart className="w-8 h-8 fill-white" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">HeartTwin</h1>
          </div>
          
          <h2 className="text-6xl font-bold leading-[1.1] mb-8 tracking-tight">
            Your heart's <span className="text-red-200">digital twin</span> for a longer life.
          </h2>
          
          <p className="text-xl text-red-100 mb-12 leading-relaxed">
            Predict heart health timelines, get personalized warnings, and find the best care near you using advanced AI and Google Cloud.
          </p>

          <div className="space-y-6">
            {[
              { icon: Activity, text: "Real-time health monitoring" },
              { icon: Shield, text: "Secure medical data profile" },
              { icon: MapPin, text: "Find top cardiologists nearby" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  <item.icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="font-medium text-lg">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Side: Login */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <h3 className="text-3xl font-bold mb-4">Welcome Back</h3>
          <p className="text-gray-500 mb-12">Sign in to access your digital heart twin and health predictions.</p>
          
          <button 
            onClick={loginWithGoogle}
            aria-label="Continue with Google"
            className="w-full flex items-center justify-center gap-3 py-4 border-2 border-gray-100 rounded-2xl font-semibold hover:bg-gray-50 transition-all group focus:ring-2 focus:ring-red-500 outline-none"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google logo" />
            Continue with Google
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </button>
          
          <p className="mt-8 text-sm text-gray-400">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

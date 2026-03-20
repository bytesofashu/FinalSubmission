import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, History, Plus } from 'lucide-react';
import { HealthData } from '../lib/gemini';

interface HealthProfileProps {
  healthData: HealthData | null;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function HealthProfile({ healthData, showForm, setShowForm, onSave }: HealthProfileProps) {
  return (
    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8">
        <Activity className="w-24 h-24 text-red-500/5 -rotate-12" aria-hidden="true" />
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Health Profile</h2>
          <p className="text-gray-500">Your current physiological data</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          aria-label={healthData ? "Update health data" : "Add health data"}
          className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 focus:ring-2 focus:ring-red-500 outline-none"
        >
          {healthData ? <History className="w-4 h-4" aria-hidden="true" /> : <Plus className="w-4 h-4" aria-hidden="true" />}
          {healthData ? "Update Data" : "Add Data"}
        </button>
      </div>

      {healthData && !showForm ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Age", value: `${healthData.age} yrs` },
            { label: "Weight", value: `${healthData.weight} kg` },
            { label: "Height", value: `${healthData.height} cm` },
            { label: "BP", value: healthData.bloodPressure },
            { label: "Cholesterol", value: `${healthData.cholesterol} mg/dL` },
            { label: "Smoking", value: healthData.smoking ? "Yes" : "No" },
            { label: "Exercise", value: healthData.exercise },
          ].map((stat, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{stat.label}</p>
              <p className="text-lg font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          {(showForm || !healthData) && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={onSave}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="age" className="text-sm font-medium text-gray-700">Age</label>
                  <input id="age" required name="age" type="number" min="1" max="120" defaultValue={healthData?.age} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="weight" className="text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input id="weight" required name="weight" type="number" min="1" max="500" defaultValue={healthData?.weight} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="height" className="text-sm font-medium text-gray-700">Height (cm)</label>
                  <input id="height" required name="height" type="number" min="1" max="300" defaultValue={healthData?.height} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="bloodPressure" className="text-sm font-medium text-gray-700">Blood Pressure (e.g. 120/80)</label>
                  <input id="bloodPressure" required name="bloodPressure" type="text" pattern="^\d{2,3}/\d{2,3}$" placeholder="120/80" defaultValue={healthData?.bloodPressure} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="cholesterol" className="text-sm font-medium text-gray-700">Cholesterol (mg/dL)</label>
                  <input id="cholesterol" required name="cholesterol" type="number" min="1" max="1000" defaultValue={healthData?.cholesterol} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="exercise" className="text-sm font-medium text-gray-700">Exercise Frequency</label>
                  <select id="exercise" name="exercise" defaultValue={healthData?.exercise} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none">
                    <option>Sedentary</option>
                    <option>Light (1-2 days/week)</option>
                    <option>Moderate (3-4 days/week)</option>
                    <option>Active (5+ days/week)</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input id="smoking" name="smoking" type="checkbox" defaultChecked={healthData?.smoking} className="w-5 h-5 accent-red-600 rounded focus:ring-red-500" />
                <label htmlFor="smoking" className="text-sm font-medium text-gray-700">I am a smoker</label>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-500 outline-none">
                  Save & Generate Twin
                </button>
                {healthData && (
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-gray-400 outline-none">
                    Cancel
                  </button>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      )}
    </section>
  );
}

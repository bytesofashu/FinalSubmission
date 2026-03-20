import React, { Suspense, lazy } from 'react';
import { MapPin, Shield, Loader2 } from 'lucide-react';

const HeartMap = lazy(() => import('./Map'));

export function CareSidebar() {
  return (
    <div className="space-y-8">
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-50 rounded-xl">
            <MapPin className="w-6 h-6 text-red-600" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold">Nearby Care</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Find top-rated cardiologists and heart specialists in your area.
        </p>
        <div className="h-[500px] w-full relative">
          <Suspense fallback={
            <div className="h-full w-full bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          }>
            <HeartMap />
          </Suspense>
        </div>
      </section>

      <section className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
        <h3 className="text-xl font-bold mb-4 relative z-10">Secure & Private</h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-6 relative z-10">
          Your medical data is encrypted and stored securely on Google Cloud. Only you have access to your digital heart twin.
        </p>
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold relative z-10">
          <Shield className="w-4 h-4" aria-hidden="true" />
          HIPAA Compliant Infrastructure
        </div>
      </section>
    </div>
  );
}

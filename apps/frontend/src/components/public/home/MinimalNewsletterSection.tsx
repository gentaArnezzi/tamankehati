"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

export function MinimalNewsletterSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail("");
    }, 1500);
  };

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 md:p-12 lg:p-16 text-center">
            {isSubscribed ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-light text-white">
                  Terima kasih telah berlangganan
                </h3>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-400">
                  Kami akan mengirimkan update terbaru ke email Anda
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4 sm:mb-6">
                  Dapatkan Update Terbaru
                </h2>
                <div className="w-16 sm:w-24 h-1 bg-emerald-500 mx-auto rounded-full mb-4 sm:mb-6"></div>
                <p className="text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-4" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.5rem)' }}>
                  Berlangganan newsletter untuk mendapatkan informasi terbaru
                  tentang spesies, penelitian, dan konservasi
                </p>

                <form onSubmit={handleSubscribe} className="max-w-md mx-auto px-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Anda"
                      required
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-sm sm:text-base text-white placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all min-h-[44px]"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Kirim
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-gray-500 mt-4" style={{ fontSize: 'clamp(0.875rem, 1vw, 1.125rem)' }}>
                    Gratis, tanpa spam. Berhenti langganan kapan saja.
                  </p>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

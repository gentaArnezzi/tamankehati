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
    <section ref={sectionRef} className="py-24 bg-white">
      <div className="container mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gray-900 rounded-2xl p-12 md:p-16 text-center">
            {isSubscribed ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-light text-white">
                  Terima kasih telah berlangganan
                </h3>
                <p className="text-gray-400">
                  Kami akan mengirimkan update terbaru ke email Anda
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
                  Dapatkan Update Terbaru
                </h2>
                <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full mb-6"></div>
                <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                  Berlangganan newsletter untuk mendapatkan informasi terbaru
                  tentang spesies, penelitian, dan konservasi
                </p>

                <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Anda"
                      required
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                  <p className="text-sm text-gray-500 mt-4">
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

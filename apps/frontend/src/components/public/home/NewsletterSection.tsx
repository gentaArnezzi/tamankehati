'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, Sparkles } from 'lucide-react';

export function NewsletterSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('newsletter-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail('');
    }, 1500);
  };

  const benefits = [
    'Update spesies baru yang ditambahkan',
    'Artikel riset dan publikasi terkini',
    'Berita konservasi dari seluruh Indonesia',
    'Event dan workshop eksklusif',
    'Tips dan panduan konservasi',
    'Cerita sukses dan dampak nyata'
  ];

  return (
    <section id="newsletter-section" className="py-32 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 rounded-full blur-3xl" />
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-500/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * 800,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto max-w-7xl px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-3xl p-12 md:p-16 shadow-2xl relative overflow-hidden"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Sparkles className="w-64 h-64 text-white/5" />
            </div>

            <div className="relative">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={isVisible ? { scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 mx-auto border border-white/30"
              >
                <Mail className="w-10 h-10 text-white" />
              </motion.div>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Tetap Update dengan Konservasi Indonesia
                </h2>
                <p className="text-xl text-white/90 max-w-2xl mx-auto">
                  Dapatkan informasi terbaru tentang spesies baru, penelitian, dan upaya konservasi langsung di inbox Anda
                </p>
              </motion.div>

              {isSubscribed ? (
                /* Success State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Terima Kasih Sudah Berlangganan!
                  </h3>
                  <p className="text-white/80">
                    Cek email Anda untuk konfirmasi langganan
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Subscription Form */}
                  <motion.form
                    onSubmit={handleSubscribe}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-12"
                  >
                    <div className="max-w-2xl mx-auto">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
                        <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
                          <Mail className="absolute left-6 w-6 h-6 text-gray-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Masukkan email Anda..."
                            required
                            className="flex-1 px-16 py-5 text-lg bg-transparent border-none focus:outline-none text-gray-900 placeholder:text-gray-400"
                          />
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="m-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isLoading ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                Berlangganan
                                <Send className="w-5 h-5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-center text-white/70 text-sm mt-4">
                        Gratis, tanpa spam. Berhenti langganan kapan saja.
                      </p>
                    </div>
                  </motion.form>

                  {/* Benefits */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <h3 className="text-xl font-semibold text-white mb-6 text-center">
                      Apa yang Akan Anda Dapatkan:
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                      {benefits.map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={isVisible ? { opacity: 1, x: 0 } : {}}
                          transition={{ delay: 0.6 + index * 0.05 }}
                          className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span className="text-white">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center"
                  >
                    {[
                      { value: '2.5K+', label: 'Subscribers' },
                      { value: '48', label: 'Newsletter Terbit' },
                      { value: '92%', label: 'Open Rate' }
                    ].map((stat, i) => (
                      <div key={i} className="border-l border-white/30 first:border-0">
                        <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-sm text-white/70">{stat.label}</div>
                      </div>
                    ))}
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ExternalLink, Database, Network, Shield } from "lucide-react";
import Link from "next/link";

export function BalaiKliringSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const features = [
    {
      icon: Database,
      title: "Integrasi Data",
      description: "Sinkronisasi data taman kehati dengan sistem balai kliring untuk akses terpadu",
    },
    {
      icon: Network,
      title: "Jaringan Nasional",
      description: "Terhubung dengan jaringan konservasi nasional untuk kolaborasi yang lebih luas",
    },
    {
      icon: Shield,
      title: "Validasi Data",
      description: "Data terverifikasi dan terstandarisasi sesuai standar nasional",
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-slate-900 text-white">
      <div className="container mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4">
            Terintegrasi dengan Balai Kliring
          </h2>
          <div className="w-24 h-1 bg-emerald-400 rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-8">
            Taman Kehati terhubung dengan sistem Balai Kliring untuk memastikan 
            akses data yang terpadu dan terverifikasi dalam upaya konservasi keanekaragaman hayati Indonesia.
          </p>
          <Link
            href="https://kliring.menlhk.go.id"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
          >
            Kunjungi Balai Kliring
            <ExternalLink className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-emerald-500 transition-colors"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-600/20 rounded-lg">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-block bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-6 py-4">
            <p className="text-slate-300 text-sm">
              <span className="font-semibold text-white">Balai Kliring</span> adalah sistem 
              informasi keanekaragaman hayati yang dikelola oleh Kementerian Lingkungan Hidup 
              dan Kehutanan untuk mendukung konservasi dan pengelolaan sumber daya hayati Indonesia.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


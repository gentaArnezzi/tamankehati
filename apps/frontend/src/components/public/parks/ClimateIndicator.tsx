"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Thermometer, Droplets, Wind, Sun } from "lucide-react";

export function ClimateIndicator() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const indicators = [
    {
      icon: Thermometer,
      label: "Suhu Rata-rata",
      value: "26-28°C",
      description: "Suhu optimal untuk keanekaragaman hayati",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      icon: Droplets,
      label: "Curah Hujan",
      value: "2000-3000mm",
      description: "Tingkat curah hujan tahunan",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      icon: Wind,
      label: "Kelembaban",
      value: "70-85%",
      description: "Tingkat kelembaban udara",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      iconColor: "text-cyan-500",
    },
    {
      icon: Sun,
      label: "Indeks Iklim",
      value: "Stabil",
      description: "Kondisi iklim mendukung konservasi",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <section ref={ref} className="py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-slate-900 mb-4">
            Indikator Perubahan Iklim
          </h2>
          <div className="w-24 h-1 bg-emerald-500 rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Monitoring kondisi iklim untuk mendukung konservasi keanekaragaman hayati
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {indicators.map((indicator, index) => {
            const Icon = indicator.icon;
            return (
              <motion.div
                key={indicator.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${indicator.bgColor} rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${indicator.iconColor} p-2 rounded-lg bg-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className={`font-semibold ${indicator.color} text-lg`}>
                    {indicator.label}
                  </h3>
                </div>
                <div className="mb-2">
                  <div className={`text-2xl font-bold ${indicator.color} mb-1`}>
                    {indicator.value}
                  </div>
                  <p className="text-sm text-slate-600">
                    {indicator.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-600 text-sm">
            Data diperbarui secara berkala untuk memastikan akurasi monitoring iklim
          </p>
        </motion.div>
      </div>
    </section>
  );
}


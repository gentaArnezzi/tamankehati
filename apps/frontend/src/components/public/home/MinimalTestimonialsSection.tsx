'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  institution: string;
  text: string;
}

export function MinimalTestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Dr. Siti Nurhaliza',
      role: 'Peneliti Biodiversitas',
      institution: 'IPB University',
      text: 'Platform yang sangat membantu penelitian kami. Data terstruktur dengan baik dan mudah diakses.'
    },
    {
      id: 2,
      name: 'Prof. Budi Santoso',
      role: 'Dosen Ekologi',
      institution: 'Universitas Gadjah Mada',
      text: 'Mahasiswa saya sangat terbantu dengan visualisasi data yang menarik dan informatif.'
    },
    {
      id: 3,
      name: 'Rahmat Hidayat',
      role: 'Koordinator Konservasi',
      institution: 'WWF Indonesia',
      text: 'Data real-time sangat membantu perencanaan program konservasi kami di lapangan.'
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-white">
      <div className="container mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light text-slate-900 mb-6">
            Dipercaya Profesional
          </h2>
          <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-gray-600">
            Digunakan oleh peneliti, akademisi, dan pelestari di seluruh Indonesia
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white p-8 rounded-lg border border-gray-100"
            >
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>
              <div className="border-t border-gray-100 pt-4">
                <div className="font-medium text-slate-900 mb-1">
                  {testimonial.name}
                </div>
                <div className="text-sm text-gray-600">
                  {testimonial.role}
                </div>
                <div className="text-sm text-gray-500">
                  {testimonial.institution}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Apa itu Portal Taman Kehati?",
    answer:
      "Portal Taman Kehati adalah website yang menyediakan informasi lengkap tentang keanekaragaman hayati Indonesia. Anda bisa menjelajahi data flora, fauna, dan taman konservasi di seluruh Indonesia secara gratis dan mudah.",
  },
  {
    question: "Bagaimana cara mencari informasi tentang tanaman atau hewan?",
    answer:
      "Gunakan kotak pencarian di bagian atas halaman. Ketik nama tanaman atau hewan yang ingin dicari, baik nama lokal maupun nama ilmiahnya. Anda juga bisa memfilter hasil pencarian berdasarkan provinsi atau status konservasi.",
  },
  {
    question: "Apa itu 'Tanya Kehati'?",
    answer:
      "'Tanya Kehati' adalah fitur chat AI yang bisa menjawab pertanyaan Anda tentang tanaman, hewan, atau taman konservasi di Indonesia. Klik ikon chat di pojok halaman, lalu ketik pertanyaan apa saja yang ingin Anda ketahui.",
  },
  {
    question: "Bagaimana cara melihat lokasi taman konservasi?",
    answer:
      "Gulir ke bawah di halaman utama sampai menemukan bagian peta. Di peta interaktif, Anda bisa melihat lokasi semua taman konservasi di Indonesia. Klik titik biru pada peta untuk melihat informasi lengkap tentang taman tersebut.",
  },
  {
    question: "Apakah informasi yang ditampilkan bisa dipercaya?",
    answer:
      "Ya, semua data yang ditampilkan telah diverifikasi dan diperbarui secara berkala oleh tim ahli. Informasi yang Anda lihat adalah data resmi yang akurat dan dapat dijadikan referensi.",
  },
  {
    question: "Bisakah saya melihat foto-foto tanaman dan hewan?",
    answer:
      "Tentu saja! Setelah Anda membuka halaman detail tanaman atau hewan tertentu, scroll ke bawah untuk melihat galeri foto. Anda juga bisa melihat kumpulan foto di menu 'Galeri' di bagian atas website.",
  },
  {
    question: "Apakah ada informasi tentang jumlah total spesies?",
    answer:
      "Ya, di halaman utama terdapat ringkasan statistik yang menampilkan jumlah total spesies, spesies endemik, taman konservasi, dan kegiatan konservasi. Data ini diperbarui otomatis seiring bertambahnya informasi di database.",
  },
  {
    question: "Apakah perlu mendaftar untuk menggunakan website ini?",
    answer:
      "Tidak perlu! Semua fitur pencarian, peta, galeri, dan 'Tanya Kehati' bisa digunakan tanpa harus membuat akun. Website ini gratis dan terbuka untuk semua orang.",
  },
];

export function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={ref} className="bg-white py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16 md:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-slate-900 mb-4 sm:mb-6"
          >
            Pertanyaan yang Sering Diajukan
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: "6rem" } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-0.5 bg-emerald-500 mx-auto rounded-full mb-6 sm:mb-8"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-slate-500 px-4"
            style={{ fontSize: 'clamp(1rem, 1.5vw, 1.5rem)' }}
          >
            Temukan jawaban untuk pertanyaan umum tentang cara menggunakan website ini,
            mencari informasi, dan menjelajahi keanekaragaman hayati Indonesia.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-4 sm:space-y-6">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:border-slate-200 transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors min-h-[44px]"
                >
                  <h3 className="font-medium text-slate-700 pr-4" style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}>
                    {faq.question}
                  </h3>
                  <motion.svg
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-5 w-5 text-gray-500 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        ease: [0.4, 0, 0.2, 1] 
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-5 md:pb-6">
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: 0.1,
                            ease: "easeOut"
                          }}
                          className="text-slate-500 leading-relaxed" 
                          style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}
                        >
                          {faq.answer}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

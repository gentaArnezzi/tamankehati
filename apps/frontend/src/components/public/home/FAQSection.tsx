"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Apa itu Taman Kehati?",
    answer:
      "Taman Kehati adalah kawasan konservasi yang berfungsi untuk melindungi dan melestarikan keanekaragaman hayati Indonesia. Taman ini menjadi tempat penelitian, edukasi, dan konservasi flora dan fauna endemik.",
  },
  {
    question: "Bagaimana cara mengakses data flora dan fauna?",
    answer:
      "Anda dapat mengakses data flora dan fauna melalui menu pencarian di halaman utama. Gunakan filter untuk menyaring berdasarkan jenis, wilayah, atau status konservasi untuk menemukan informasi yang Anda butuhkan.",
  },
  {
    question: "Apakah data yang tersedia dapat diunduh?",
    answer:
      "Ya, sebagian data tersedia untuk diunduh dalam format yang dapat digunakan untuk penelitian dan edukasi. Silakan hubungi tim kami untuk informasi lebih lanjut tentang akses data.",
  },
  {
    question: "Bagaimana cara melaporkan temuan flora/fauna baru?",
    answer:
      "Anda dapat melaporkan temuan baru melalui formulir kontak yang tersedia di website. Tim ahli kami akan memverifikasi dan menambahkan data tersebut ke dalam sistem setelah konfirmasi.",
  },
  {
    question: "Apakah ada program edukasi yang tersedia?",
    answer:
      "Ya, kami menyediakan berbagai program edukasi termasuk webinar, workshop, dan materi pembelajaran yang dapat diakses secara online maupun offline.",
  },
  {
    question: "Bagaimana cara berkontribusi dalam konservasi?",
    answer:
      "Anda dapat berkontribusi dengan melaporkan data, berpartisipasi dalam program edukasi, atau bergabung dengan komunitas konservasi yang terdaftar di platform kami.",
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
            className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-4 sm:mb-6"
          >
            Pertanyaan yang Sering Diajukan
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: "6rem" } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-1 bg-emerald-500 mx-auto rounded-full mb-4 sm:mb-6"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-gray-500 px-4"
            style={{ fontSize: 'clamp(1rem, 1.5vw, 1.5rem)' }}
          >
            Temukan jawaban untuk pertanyaan umum tentang Taman Kehati dan
            platform konservasi kami.
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
                className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors min-h-[44px]"
                >
                  <h3 className="font-medium text-gray-900 pr-4" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.5rem)' }}>
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
                          className="text-gray-600 leading-relaxed" 
                          style={{ fontSize: 'clamp(1rem, 1.3vw, 1.375rem)' }}
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

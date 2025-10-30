"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight, User } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  institution: string;
  avatar?: string;
  rating: number;
  text: string;
  category: "researcher" | "educator" | "conservationist" | "student";
}

export function TestimonialsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    const element = document.getElementById("testimonials-section");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Dr. Siti Nurhaliza",
      role: "Peneliti Biodiversitas",
      institution: "Institut Pertanian Bogor",
      rating: 5,
      category: "researcher",
      text: "Database Taman Kehati sangat membantu penelitian kami tentang flora endemik Sumatera. Data yang akurat dan terstruktur dengan baik membuat proses riset menjadi jauh lebih efisien. Platform ini benar-benar game changer untuk konservasi Indonesia!",
    },
    {
      id: 2,
      name: "Prof. Budi Santoso",
      role: "Dosen Ekologi",
      institution: "Universitas Gadjah Mada",
      rating: 5,
      category: "educator",
      text: "Sebagai pendidik, saya sangat terbantu dengan visualisasi data yang menarik dan informasi yang komprehensif. Mahasiswa saya lebih antusias belajar konservasi dengan adanya platform ini. Fitur interactive map-nya luar biasa!",
    },
    {
      id: 3,
      name: "Rahmat Hidayat",
      role: "Koordinator Program Konservasi",
      institution: "WWF Indonesia",
      rating: 5,
      category: "conservationist",
      text: "Kami menggunakan data dari Taman Kehati untuk merencanakan program konservasi di berbagai wilayah. Informasi real-time tentang status spesies dan lokasi taman sangat membantu decision making kami. Terima kasih atas kontribusinya!",
    },
    {
      id: 4,
      name: "Maya Kusuma",
      role: "Mahasiswa Biologi",
      institution: "Universitas Indonesia",
      rating: 5,
      category: "student",
      text: "Platform yang sangat user-friendly untuk mahasiswa seperti saya. Mudah mencari referensi untuk tugas dan skripsi. Artikel-artikel edukasinya juga sangat bermanfaat dan mudah dipahami. Recommended banget!",
    },
    {
      id: 5,
      name: "Dr. Ahmad Fauzi",
      role: "Kepala Balai Konservasi",
      institution: "BKSDA Kalimantan",
      rating: 5,
      category: "conservationist",
      text: "Taman Kehati memudahkan koordinasi antar balai konservasi dalam sharing data dan best practices. Fitur publikasi penelitian juga membantu kami mendiseminasikan hasil kerja ke publik lebih luas.",
    },
  ];

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  const currentTestimonial = testimonials[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const getCategoryColor = (category: Testimonial["category"]) => {
    switch (category) {
      case "researcher":
        return "emerald";
      case "educator":
        return "blue";
      case "conservationist":
        return "green";
      case "student":
        return "teal";
    }
  };

  const getCategoryLabel = (category: Testimonial["category"]) => {
    switch (category) {
      case "researcher":
        return "Peneliti";
      case "educator":
        return "Pendidik";
      case "conservationist":
        return "Konservasionis";
      case "student":
        return "Mahasiswa";
    }
  };

  return (
    <section
      id="testimonials-section"
      className="py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      {/* Giant Quote Mark */}
      <div className="absolute top-32 left-1/2 -translate-x-1/2 opacity-5">
        <Quote className="w-96 h-96 text-emerald-600" />
      </div>

      <div className="container mx-auto max-w-7xl px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6">
            <Star className="w-4 h-4 fill-current" />
            Testimoni Pengguna
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Dipercaya oleh
            <span className="block bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Komunitas Konservasi
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ribuan peneliti, akademisi, dan pelestari menggunakan Taman Kehati
            untuk mendukung pekerjaan mereka
          </p>
        </motion.div>

        {/* Main Testimonial Slider */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="relative">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
              >
                <div className="bg-white rounded-3xl shadow-2xl p-12 md:p-16 relative border border-gray-100">
                  {/* Quote Icon */}
                  <div className="absolute top-8 left-8 w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Quote className="w-8 h-8 text-emerald-600" />
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-8 right-8">
                    <span
                      className={`px-4 py-2 bg-${getCategoryColor(currentTestimonial.category)}-100 text-${getCategoryColor(currentTestimonial.category)}-700 text-sm font-semibold rounded-full`}
                      style={{
                        backgroundColor: `${getCategoryColor(currentTestimonial.category) === "emerald" ? "#d1fae5" : getCategoryColor(currentTestimonial.category) === "blue" ? "#dbeafe" : getCategoryColor(currentTestimonial.category) === "green" ? "#dcfce7" : "#ccfbf1"}`,
                        color: `${getCategoryColor(currentTestimonial.category) === "emerald" ? "#047857" : getCategoryColor(currentTestimonial.category) === "blue" ? "#1e40af" : getCategoryColor(currentTestimonial.category) === "green" ? "#15803d" : "#0f766e"}`,
                      }}
                    >
                      {getCategoryLabel(currentTestimonial.category)}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-8 mt-12">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-6 h-6 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-2xl text-gray-700 leading-relaxed mb-10 italic">
                    "{currentTestimonial.text}"
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 border-t border-gray-200 pt-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {currentTestimonial.avatar ||
                        currentTestimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-gray-900">
                        {currentTestimonial.name}
                      </div>
                      <div className="text-gray-600">
                        {currentTestimonial.role}
                      </div>
                      <div className="text-sm text-gray-500">
                        {currentTestimonial.institution}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 z-10 border border-gray-200"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 z-10 border border-gray-200"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-12">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`transition-all ${
                  index === currentIndex
                    ? "w-12 h-3 bg-emerald-600"
                    : "w-3 h-3 bg-gray-300 hover:bg-gray-400"
                } rounded-full`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {[
            { icon: User, value: "1,200+", label: "Pengguna Aktif" },
            { icon: Star, value: "4.9/5", label: "Rating Rata-rata" },
            { icon: Quote, value: "450+", label: "Testimoni Positif" },
            { icon: Star, value: "98%", label: "Kepuasan Pengguna" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center"
            >
              <stat.icon className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
  className,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
  className?: string;
}) => {
  const [active, setActive] = useState(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index: number) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay]);

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };

  return (
    <div
      ref={containerRef}
      className={cn("w-full py-16 px-8 relative z-0", className)}
    >
      <div className="relative flex flex-row gap-0 items-center z-0">
        {/* Left: Stacked Images - Slide from left */}
        <motion.div
          className="w-1/2 pl-6"
          initial={{ opacity: 0, x: -100 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="relative h-[450px] w-full">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                    x: -100,
                    rotate: randomRotateY(),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.5,
                    scale: isActive(index) ? 1 : 0.95,
                    x: isActive(index) ? 0 : index * 12 - 24,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index)
                      ? 10
                      : testimonials.length + 2 - index,
                    y: isActive(index) ? 0 : index * 18,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                    x: 100,
                    rotate: randomRotateY(),
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0"
                >
                  <Image
                    src={testimonial.src}
                    alt={testimonial.name}
                    width={1000}
                    height={600}
                    draggable={false}
                    className="h-full w-full rounded-2xl object-cover object-center shadow-2xl"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Right: Content - Slide from right */}
        <motion.div
          className="w-1/2 flex justify-between flex-col py-4 pl-12 pr-6"
          initial={{ opacity: 0, x: 100 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <motion.div
            key={active}
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -20,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
          >
            <h3 className="text-2xl font-bold text-slate-900">
              {testimonials[active].name}
            </h3>
            <p className="text-sm text-slate-600">
              {testimonials[active].designation}
            </p>
            <motion.p className="text-lg text-slate-600 mt-8">
              {testimonials[active].quote.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{
                    filter: "blur(10px)",
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    filter: "blur(0px)",
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: 0.02 * index,
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
          <div className="flex gap-4 pt-12">
            <button
              onClick={handlePrev}
              className="h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center group/button transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-900 group-hover/button:rotate-12 transition-transform duration-300" />
            </button>
            <button
              onClick={handleNext}
              className="h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center group/button transition-colors"
            >
              <ArrowRight className="h-5 w-5 text-slate-900 group-hover/button:-rotate-12 transition-transform duration-300" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

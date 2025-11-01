"use client";

import React, { useEffect, useState, useRef } from "react";

// --- The ArcGalleryHero Component ---
type ArcGalleryHeroProps = {
  images: string[];
  startAngle?: number;
  endAngle?: number;
  // radius for different screen sizes
  radiusLg?: number;
  radiusMd?: number;
  radiusSm?: number;
  // size of each card for different screen sizes
  cardSizeLg?: number;
  cardSizeMd?: number;
  cardSizeSm?: number;
  // optional extra class on outer section
  className?: string;
};

export const ArcGalleryHero: React.FC<ArcGalleryHeroProps> = ({
  images,
  startAngle = 20,
  endAngle = 160,
  radiusLg = 480,
  radiusMd = 360,
  radiusSm = 260,
  cardSizeLg = 120,
  cardSizeMd = 100,
  cardSizeSm = 80,
  className = "",
}) => {
  const [dimensions, setDimensions] = useState({
    radius: radiusLg,
    cardSize: cardSizeLg,
  });
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Effect to handle responsive resizing of the arc and cards
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDimensions({ radius: radiusSm, cardSize: cardSizeSm });
      } else if (width < 1024) {
        setDimensions({ radius: radiusMd, cardSize: cardSizeMd });
      } else {
        setDimensions({ radius: radiusLg, cardSize: cardSizeLg });
      }
    };

    handleResize(); // Set initial size
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [radiusLg, radiusMd, radiusSm, cardSizeLg, cardSizeMd, cardSizeSm]);

  // Intersection Observer to trigger animation when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of section is visible
        rootMargin: "0px 0px -100px 0px", // Start slightly before fully in view
      },
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  // Ensure at least 2 points to distribute angles for the arc calculation
  const count = Math.max(images.length, 2);
  const step = (endAngle - startAngle) / (count - 1);

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-x-hidden bg-transparent min-h-screen flex flex-col ${className}`}
    >
      {/* Background ring container that controls geometry */}
      <div
        className="relative mx-auto w-full"
        style={{
          width: "100%",
          // Give it a bit more height to prevent clipping
          height: dimensions.radius * 1.5,
          maxWidth: "100vw",
        }}
      >
        {/* Center pivot for transforms - positioned at bottom center */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-full max-w-full">
          {/* Each image is positioned on the circle and rotated to face outward */}
          {images.map((src, i) => {
            const angle = startAngle + step * i; // degrees
            const angleRad = (angle * Math.PI) / 180;

            // Calculate x and y positions on the arc
            const x = Math.cos(angleRad) * dimensions.radius;
            const y = Math.sin(angleRad) * dimensions.radius;

            // Calculate the actual left position accounting for card width
            const cardHalfWidth = dimensions.cardSize / 2;
            
            // Use clamp to prevent overflow on mobile while keeping desktop layout
            // Clamp ensures position stays within viewport bounds
            const clampedLeft = `clamp(${cardHalfWidth}px, calc(50% + ${x}px), calc(100% - ${cardHalfWidth}px))`;

            return (
              <div
                key={i}
                className={`absolute ${isVisible ? "animate-slide-in-from-left" : ""}`}
                style={{
                  width: dimensions.cardSize,
                  height: dimensions.cardSize,
                  left: clampedLeft,
                  bottom: `${y}px`,
                  animationDelay: isVisible ? `${i * 200}ms` : "0ms",
                  opacity: isVisible ? undefined : 0,
                  transform: isVisible
                    ? undefined
                    : "translate(calc(-50% - 100px), 50%) scale(0.8)",
                  zIndex: count - i,
                  maxWidth: '100vw',
                }}
              >
                <div
                  className="rounded-3xl shadow-2xl overflow-hidden ring-2 ring-white/20 bg-white/10 transition-all duration-300 hover:scale-125 hover:shadow-3xl hover:ring-4 hover:ring-white/40 hover:z-[15] cursor-pointer group"
                  style={{
                    transform: `rotate(${angle / 6}deg)`,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <img
                    src={src}
                    alt={`Forest ${i + 1}`}
                    className="block w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    draggable={false}
                    // Add a fallback in case an image fails to load
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://placehold.co/400x400/334155/e2e8f0?text=Forest`;
                    }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {/* Hover text */}
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes slide-in-from-left {
          from {
            opacity: 0;
            transform: translate(calc(-50% - 100px), 50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 50%) scale(1);
          }
        }
        .animate-slide-in-from-left {
          animation-name: slide-in-from-left;
          animation-duration: 0.7s;
          animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
          animation-fill-mode: both;
        }
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </section>
  );
};

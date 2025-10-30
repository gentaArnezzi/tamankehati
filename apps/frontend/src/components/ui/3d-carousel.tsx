"use client";

import { memo, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion";

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type UseMediaQueryOptions = {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
};

const IS_SERVER = typeof window === "undefined";

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {},
): boolean {
  const getMatches = (query: string): boolean => {
    if (IS_SERVER) {
      return defaultValue;
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(query);
    }
    return defaultValue;
  });

  const handleChange = () => {
    setMatches(getMatches(query));
  };

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query);
    handleChange();

    matchMedia.addEventListener("change", handleChange);

    return () => {
      matchMedia.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

const duration = 0.15;
const transition = { duration, ease: "easeInOut" as const };
const transitionOverlay = { duration: 0.5, ease: "easeInOut" as const };

interface CarouselItem {
  imgUrl: string;
  name: string;
  scientificName: string;
  description: string;
  category: "flora" | "fauna";
  status: string;
  region: string;
}

const Carousel = memo(
  ({
    handleClick,
    controls,
    cards,
    isCarouselActive,
  }: {
    handleClick: (item: CarouselItem, index: number) => void;
    controls: any;
    cards: CarouselItem[];
    isCarouselActive: boolean;
  }) => {
    const isScreenSizeSm = useMediaQuery("(max-width: 640px)");
    const cylinderWidth = isScreenSizeSm ? 1400 : 2200;
    const faceCount = cards.length;
    const faceWidth = cylinderWidth / faceCount;
    const radius = cylinderWidth / (2 * Math.PI);
    const rotation = useMotionValue(0);
    const transform = useTransform(
      rotation,
      (value) => `rotate3d(0, 1, 0, ${value}deg)`,
    );

    const getStatusColor = (status: string) => {
      switch (status) {
        case "Kritis":
          return "bg-red-100 text-red-800 border-red-200";
        case "Endemik":
          return "bg-blue-100 text-blue-800 border-blue-200";
        case "Lindungi":
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    const getCategoryColor = (category: string) => {
      return category === "flora"
        ? "bg-emerald-100 text-emerald-800"
        : "bg-teal-100 text-teal-800";
    };

    return (
      <div
        className="flex h-full items-center justify-center"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <motion.div
          drag={isCarouselActive ? "x" : false}
          className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
          style={{
            transform,
            rotateY: rotation,
            width: cylinderWidth,
            transformStyle: "preserve-3d",
          }}
          onDrag={(_, info) =>
            isCarouselActive &&
            rotation.set(rotation.get() + info.offset.x * 0.05)
          }
          onDragEnd={(_, info) =>
            isCarouselActive &&
            controls.start({
              rotateY: rotation.get() + info.velocity.x * 0.05,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 30,
                mass: 0.1,
              },
            })
          }
          animate={controls}
        >
          {cards.map((item, i) => (
            <motion.div
              key={`key-${item.imgUrl}-${i}`}
              className="absolute flex h-full origin-center items-center justify-center rounded-2xl p-2"
              style={{
                width: `${faceWidth}px`,
                transform: `rotateY(${
                  i * (360 / faceCount)
                }deg) translateZ(${radius}px)`,
              }}
              onClick={() => handleClick(item, i)}
            >
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-2xl border border-slate-200 group hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all cursor-pointer">
                <motion.img
                  src={item.imgUrl}
                  alt={item.name}
                  layoutId={`img-${item.imgUrl}`}
                  className="pointer-events-none w-full h-full rounded-2xl object-cover"
                  initial={{ filter: "blur(4px)" }}
                  layout="position"
                  animate={{ filter: "blur(0px)" }}
                  transition={transition}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${getStatusColor(item.status)}`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${getCategoryColor(item.category)}`}
                  >
                    {item.category === "flora" ? "Flora" : "Fauna"}
                  </span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h3 className="text-xl font-bold mb-1.5 drop-shadow-lg">
                    {item.name}
                  </h3>
                  <p className="text-sm italic text-white/90 mb-2 drop-shadow">
                    {item.scientificName}
                  </p>
                  <p className="text-sm text-white/95 line-clamp-2 mb-3 drop-shadow">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="drop-shadow">📍 {item.region}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  },
);

Carousel.displayName = "Carousel";

interface ThreeDPhotoCarouselProps {
  items: CarouselItem[];
}

function ThreeDPhotoCarousel({ items }: ThreeDPhotoCarouselProps) {
  const [activeItem, setActiveItem] = useState<CarouselItem | null>(null);
  const [isCarouselActive, setIsCarouselActive] = useState(true);
  const controls = useAnimation();

  const handleClick = (item: CarouselItem) => {
    setActiveItem(item);
    setIsCarouselActive(false);
    controls.stop();
  };

  const handleClose = () => {
    setActiveItem(null);
    setIsCarouselActive(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Kritis":
        return "bg-red-100 text-red-800 border-red-200";
      case "Endemik":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Lindungi":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    return category === "flora"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-teal-100 text-teal-800";
  };

  return (
    <motion.div layout className="relative">
      <AnimatePresence mode="sync">
        {activeItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            layoutId={`img-container-${activeItem.imgUrl}`}
            layout="position"
            onClick={handleClose}
            className="fixed inset-0 bg-white/95 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-8 cursor-pointer"
            style={{ willChange: "opacity" }}
            transition={transitionOverlay}
          >
            <div
              className="relative max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image Side */}
                <div className="relative h-[300px] md:h-[500px]">
                  <motion.img
                    layoutId={`img-${activeItem.imgUrl}`}
                    src={activeItem.imgUrl}
                    alt={activeItem.name}
                    className="w-full h-full object-cover"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.2,
                      duration: 0.5,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    style={{
                      willChange: "transform",
                    }}
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(activeItem.status)}`}
                    >
                      {activeItem.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(activeItem.category)}`}
                    >
                      {activeItem.category === "flora" ? "Flora" : "Fauna"}
                    </span>
                  </div>
                </div>

                {/* Content Side */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="mb-6">
                    <h2 className="text-4xl font-bold text-slate-900 mb-3">
                      {activeItem.name}
                    </h2>
                    <p className="text-lg text-slate-500 italic">
                      {activeItem.scientificName}
                    </p>
                  </div>

                  <p className="text-slate-700 text-lg leading-relaxed mb-6">
                    {activeItem.description}
                  </p>

                  <div className="flex items-center gap-4 text-slate-600 mb-8">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📍</span>
                      <span className="font-medium">{activeItem.region}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative h-[600px] w-full overflow-hidden rounded-2xl">
        <Carousel
          handleClick={handleClick}
          controls={controls}
          cards={items}
          isCarouselActive={isCarouselActive}
        />
      </div>
    </motion.div>
  );
}

export { ThreeDPhotoCarousel, type CarouselItem };

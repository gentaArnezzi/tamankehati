"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Leaf,
  PawPrint,
  MapPin,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Star,
} from "lucide-react";

interface SearchResult {
  id: string;
  type: "flora" | "fauna" | "taman" | "artikel" | "galeri";
  title: string;
  description: string;
  score: number;
  url: string;
}

interface SearchResultCardProps {
  result: SearchResult;
}

const typeConfig = {
  flora: {
    icon: Leaf,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    label: "Flora",
  },
  fauna: {
    icon: PawPrint,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    label: "Fauna",
  },
  taman: {
    icon: MapPin,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    label: "Taman",
  },
  artikel: {
    icon: FileText,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    label: "Artikel",
  },
  galeri: {
    icon: ImageIcon,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    label: "Galeri",
  },
};

export function SearchResultCard({ result }: SearchResultCardProps) {
  const config = typeConfig[result.type];
  const Icon = config.icon;

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-gray-500";
  };

  const getScoreStars = (score: number) => {
    const stars = Math.round(score * 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < stars ? "fill-current text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link href={result.url}>
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
          <div className="flex items-start gap-4">
            {/* Type Icon */}
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-lg ${config.bgColor} ${config.borderColor} border flex items-center justify-center`}
            >
              <Icon
                className={`w-6 h-6 ${config.color}`}
                data-testid={`${result.type}-icon`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Type Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
                    >
                      {config.label}
                    </span>

                    {/* Relevance Score */}
                    <div className="flex items-center gap-1">
                      <div className="flex">{getScoreStars(result.score)}</div>
                      <span
                        className={`text-xs font-medium ${getScoreColor(result.score)}`}
                      >
                        {Math.round(result.score * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2">
                    {result.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-3">
                    {result.description}
                  </p>

                  {/* URL */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="truncate">{result.url}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </div>
                </div>

                {/* Action Indicator */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

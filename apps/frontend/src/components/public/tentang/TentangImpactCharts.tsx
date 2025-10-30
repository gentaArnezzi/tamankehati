"use client";

import { useState, useEffect } from "react";

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface LineChartData {
  year: string;
  value: number;
}

interface ModernChartProps {
  data: ChartData[];
  title: string;
  type: "pie" | "bar" | "line";
}

export function TentangImpactCharts() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    const element = document.getElementById("impact-charts");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  // Modern Pie Chart Component
  const ModernPieChart = ({
    data,
    title,
  }: {
    data: ChartData[];
    title: string;
  }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ["#dc2626", "#f97316", "#22c55e", "#3b82f6", "#8b5cf6"];

    let cumulativePercentage = 0;

    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
          {title}
        </h3>
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 200 200"
            >
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const startAngle = (cumulativePercentage / 100) * 360;
                const endAngle =
                  ((cumulativePercentage + percentage) / 100) * 360;

                const startAngleRad = (startAngle - 90) * (Math.PI / 180);
                const endAngleRad = (endAngle - 90) * (Math.PI / 180);

                const x1 = 100 + 80 * Math.cos(startAngleRad);
                const y1 = 100 + 80 * Math.sin(startAngleRad);
                const x2 = 100 + 80 * Math.cos(endAngleRad);
                const y2 = 100 + 80 * Math.sin(endAngleRad);

                const largeArcFlag = percentage > 50 ? 1 : 0;
                const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                cumulativePercentage += percentage;

                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={colors[index % colors.length]}
                    className="transition-all duration-1000 ease-out hover:opacity-80"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? "scale(1)" : "scale(0.8)",
                    }}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {total.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <span className="text-sm font-medium text-gray-700">
                  {item.label}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">
                  {item.value.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {((item.value / total) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Modern Bar Chart Component
  const ModernBarChart = ({
    data,
    title,
  }: {
    data: ChartData[];
    title: string;
  }) => {
    const maxValue = Math.max(...data.map((item) => item.value));
    const colors = ["#dc2626", "#f97316", "#22c55e", "#3b82f6"];

    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
          {title}
        </h3>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = (item.value / maxValue) * 100;
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {item.value.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="h-4 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: isVisible ? `${percentage}%` : "0%",
                      backgroundColor: colors[index % colors.length],
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Modern Line Chart Component
  const ModernLineChart = ({
    data,
    title,
  }: {
    data: LineChartData[];
    title: string;
  }) => {
    const maxValue = Math.max(...data.map((item) => item.value));
    const minValue = Math.min(...data.map((item) => item.value));
    const range = maxValue - minValue;

    const points = data
      .map((item, index) => {
        const x = (index / (data.length - 1)) * 300;
        const y = 150 - ((item.value - minValue) / range) * 100;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
          {title}
        </h3>
        <div className="h-64">
          <svg className="w-full h-full" viewBox="0 0 350 200">
            {/* Grid lines */}
            <defs>
              <pattern
                id="grid"
                width="50"
                height="50"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Line chart */}
            <polyline
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              points={points}
              className="transition-all duration-1000 ease-out"
              style={{
                strokeDasharray: isVisible ? "none" : "1000",
                strokeDashoffset: isVisible ? "0" : "1000",
              }}
            />

            {/* Data points */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 300;
              const y = 150 - ((item.value - minValue) / range) * 100;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#22c55e"
                  className="transition-all duration-1000 ease-out"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "scale(1)" : "scale(0)",
                  }}
                />
              );
            })}

            {/* Y-axis labels */}
            {[0, 25, 50, 75, 100].map((value, index) => {
              const y = 150 - (value / 100) * 100;
              const actualValue = minValue + (value / 100) * range;
              return (
                <text
                  key={index}
                  x="10"
                  y={y + 5}
                  className="text-xs fill-gray-500"
                >
                  {Math.round(actualValue).toLocaleString()}
                </text>
              );
            })}
          </svg>
        </div>
        <div className="mt-4 flex justify-between text-xs text-gray-500">
          {data.map((item, index) => (
            <span key={index}>{item.year}</span>
          ))}
        </div>
      </div>
    );
  };

  // Chart data
  const speciesData: ChartData[] = [
    { label: "Terancam Punah", value: 180 },
    { label: "Endemik", value: 420 },
    { label: "Berkurang", value: 350 },
    { label: "Stabil", value: 300 },
  ];

  const conservationData: ChartData[] = [
    { label: "Pemulihan Spesies", value: 95 },
    { label: "Restorasi Habitat", value: 78 },
    { label: "Keterlibatan Masyarakat", value: 92 },
    { label: "Proyek Riset", value: 85 },
  ];

  const communityData: ChartData[] = [
    { label: "Pengunjung", value: 2500000 },
    { label: "Siswa", value: 180000 },
    { label: "Relawan", value: 15000 },
    { label: "Pekerja", value: 8500 },
  ];

  const growthData: LineChartData[] = [
    { year: "2019", value: 850 },
    { year: "2020", value: 920 },
    { year: "2021", value: 1050 },
    { year: "2022", value: 1180 },
    { year: "2023", value: 1250 },
  ];

  return (
    <section id="impact-charts" className="py-20 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Dampak Taman Kehati Indonesia
          </h2>
          <div className="w-24 h-1 bg-green-800 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Data nyata yang menunjukkan kontribusi Taman Kehati dalam
            melestarikan keanekaragaman hayati Indonesia
          </p>
        </div>

        {/* Modern Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <ModernPieChart
            data={speciesData}
            title="Status Spesies yang Dilindungi"
          />
          <ModernBarChart
            data={conservationData}
            title="Tingkat Keberhasilan Konservasi (%)"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <ModernPieChart data={communityData} title="Dampak Masyarakat" />
          <ModernLineChart
            data={growthData}
            title="Pertumbuhan Spesies Dilindungi (2019-2023)"
          />
        </div>

        {/* Key Statistics */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="text-4xl font-bold text-green-800 mb-2">45,000</div>
            <div className="text-sm text-gray-600">Hektar Dilindungi</div>
          </div>
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="text-4xl font-bold text-green-800 mb-2">34</div>
            <div className="text-sm text-gray-600">Provinsi</div>
          </div>
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="text-4xl font-bold text-green-800 mb-2">2.5M</div>
            <div className="text-sm text-gray-600">Pengunjung/Tahun</div>
          </div>
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="text-4xl font-bold text-green-800 mb-2">95%</div>
            <div className="text-sm text-gray-600">Tingkat Pemulihan</div>
          </div>
        </div>

        {/* Key Achievements */}
        <div className="bg-green-800 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold text-center mb-12">
            Pencapaian Utama Taman Kehati
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-4">95%</div>
              <div className="text-lg font-medium mb-2">
                Tingkat Pemulihan Spesies
              </div>
              <div className="text-green-200">
                Spesies yang berhasil dipulihkan dari status terancam punah
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-4">2.5M</div>
              <div className="text-lg font-medium mb-2">Pengunjung Tahunan</div>
              <div className="text-green-200">
                Masyarakat yang teredukasi tentang konservasi
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-4">45K</div>
              <div className="text-lg font-medium mb-2">Hektar Dilindungi</div>
              <div className="text-green-200">
                Luas total kawasan konservasi di seluruh Indonesia
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

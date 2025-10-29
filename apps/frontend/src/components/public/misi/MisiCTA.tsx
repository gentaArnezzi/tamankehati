'use client';

import { Card, CardContent } from '@/components/ui/card';
// Minimalist design - no icons needed

export function MisiCTA() {
  const contactInfo = [
    {
      title: "Email",
      value: "info@tamankehati.id",
      description: "Kirim pertanyaan atau saran Anda"
    },
    {
      title: "Telepon",
      value: "+62 21 1234 5678",
      description: "Hubungi kami untuk informasi lebih lanjut"
    },
    {
      title: "Alamat",
      value: "Jakarta, Indonesia",
      description: "Kantor pusat Taman Kehati"
    }
  ];

  const waysToContribute = [
    {
      title: "Menjadi Relawan",
      description: "Bergabung dengan komunitas relawan konservasi kami",
      action: "Daftar Sekarang"
    },
    {
      title: "Donasi",
      description: "Dukung program konservasi dengan donasi Anda",
      action: "Donasi Sekarang"
    },
    {
      title: "Berbagi Data",
      description: "Kontribusikan data flora dan fauna yang Anda temukan",
      action: "Upload Data"
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Bergabunglah dengan Misi Kami
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mari bersama-sama melestarikan keanekaragaman hayati Indonesia 
            untuk generasi mendatang.
          </p>
        </div>

        {/* Ways to Contribute */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {waysToContribute.map((way, index) => (
            <div key={index} className="text-center p-8 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 bg-white rounded-xl animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {way.title}
              </h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                {way.description}
              </p>
              <button className="text-gray-900 text-sm font-medium hover:text-gray-600 border-b border-gray-300 hover:border-gray-900 transition-colors">
                {way.action}
              </button>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl p-12 border border-gray-200">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-light text-gray-900 mb-4">
              Hubungi Kami
            </h3>
            <p className="text-gray-600">
              Ada pertanyaan atau ingin berkolaborasi? Tim kami siap membantu Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactInfo.map((contact, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {contact.title}
                </h4>
                <p className="text-gray-600 text-sm font-medium mb-2">
                  {contact.value}
                </p>
                <p className="text-xs text-gray-500">
                  {contact.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Users,
  Heart,
  Globe,
  Send
} from 'lucide-react';

export function MisiCTA() {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "info@tamankehati.id",
      description: "Kirim pertanyaan atau saran Anda"
    },
    {
      icon: Phone,
      title: "Telepon",
      value: "+62 21 1234 5678",
      description: "Hubungi kami untuk informasi lebih lanjut"
    },
    {
      icon: MapPin,
      title: "Alamat",
      value: "Jakarta, Indonesia",
      description: "Kantor pusat Taman Kehati"
    }
  ];

  const waysToContribute = [
    {
      icon: Users,
      title: "Menjadi Relawan",
      description: "Bergabung dengan komunitas relawan konservasi kami",
      action: "Daftar Sekarang"
    },
    {
      icon: Heart,
      title: "Donasi",
      description: "Dukung program konservasi dengan donasi Anda",
      action: "Donasi Sekarang"
    },
    {
      icon: Globe,
      title: "Berbagi Data",
      description: "Kontribusikan data flora dan fauna yang Anda temukan",
      action: "Upload Data"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto max-w-7xl px-6">
        {/* Main CTA */}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-light text-gray-900 mb-6">
            Bergabunglah dengan Misi Kami
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Mari bersama-sama melestarikan keanekaragaman hayati Indonesia 
            untuk generasi mendatang. Setiap kontribusi Anda berarti.
          </p>
        </div>

        {/* Ways to Contribute */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {waysToContribute.map((way, index) => {
            const Icon = way.icon;
            return (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {way.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {way.description}
                  </p>
                  <button className="px-6 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors group">
                    {way.action}
                    <ArrowRight className="w-4 h-4 ml-2 inline group-hover:translate-x-1 transition-transform" />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Contact Information */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-light text-gray-900 mb-4">
              Hubungi Kami
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ada pertanyaan atau ingin berkolaborasi? 
              Tim kami siap membantu Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactInfo.map((contact, index) => {
              const Icon = contact.icon;
              return (
                <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {contact.title}
                    </h4>
                    <p className="text-gray-600 font-medium mb-2">
                      {contact.value}
                    </p>
                    <p className="text-sm text-gray-500">
                      {contact.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 overflow-hidden mb-20">
          <CardContent className="p-12">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl font-light mb-4">
                Dapatkan Update Terbaru
              </h3>
              <p className="text-green-100 mb-8 text-lg">
                Berlangganan newsletter kami untuk mendapatkan informasi terbaru 
                tentang konservasi keanekaragaman hayati Indonesia.
              </p>
              
              <div className="max-w-md mx-auto">
                <div className="flex gap-4">
                  <input
                    type="email"
                    placeholder="Masukkan email Anda"
                    className="flex-1 px-4 py-3 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button className="px-6 py-3 bg-white text-green-600 font-semibold rounded-full hover:bg-green-50 transition-colors flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Kirim
                  </button>
                </div>
                <p className="text-green-200 text-sm mt-4">
                  Kami menghormati privasi Anda. Tidak ada spam.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12">
            <h3 className="text-4xl font-light text-gray-900 mb-6">
              Mulai Perjalanan Konservasi Anda
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Setiap langkah kecil yang Anda ambil hari ini akan berdampak besar 
              pada masa depan keanekaragaman hayati Indonesia.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-8 py-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors text-lg">
                Jelajahi Platform
              </button>
              <button className="px-8 py-4 bg-white text-green-600 font-semibold rounded-full hover:bg-green-50 transition-colors text-lg border-2 border-green-600">
                Pelajari Lebih Lanjut
              </button>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                Bergabung dengan <span className="font-semibold text-green-600">10,000+</span> kontributor 
                yang telah membantu melestarikan keanekaragaman hayati Indonesia
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

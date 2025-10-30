"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Award,
  GraduationCap,
  Globe,
  Mail,
  Linkedin,
  Twitter,
  ArrowRight,
} from "lucide-react";

export function MisiTeam() {
  const teamMembers = [
    {
      name: "Dr. Sarah Wijaya",
      role: "Direktur Eksekutif",
      expertise: "Konservasi Keanekaragaman Hayati",
      experience: "15+ tahun",
      education: "Ph.D. Biology, Universitas Indonesia",
      image: "/team/sarah.jpg",
      bio: "Ahli konservasi dengan pengalaman luas dalam penelitian keanekaragaman hayati Indonesia dan manajemen kawasan konservasi.",
      achievements: [
        "Peneliti Utama di LIPI",
        "Penulis 50+ publikasi ilmiah",
        "Penerima Penghargaan Konservasi Nasional",
      ],
      social: {
        email: "sarah.wijaya@tamankehati.id",
        linkedin: "sarah-wijaya-conservation",
        twitter: "@sarah_wijaya",
      },
    },
    {
      name: "Prof. Ahmad Rahman",
      role: "Kepala Riset",
      expertise: "Ekologi Hutan Tropis",
      experience: "20+ tahun",
      education: "Ph.D. Forest Ecology, IPB University",
      image: "/team/ahmad.jpg",
      bio: "Profesor biologi yang fokus pada ekologi hutan tropis dan konservasi spesies. Memimpin berbagai proyek penelitian internasional.",
      achievements: [
        "Guru Besar IPB University",
        "Peneliti Utama di CIFOR",
        "Editor Jurnal Internasional",
      ],
      social: {
        email: "ahmad.rahman@tamankehati.id",
        linkedin: "ahmad-rahman-ecology",
        twitter: "@ahmad_rahman_eco",
      },
    },
    {
      name: "Dr. Maya Sari",
      role: "Koordinator Data & Teknologi",
      expertise: "Sistem Informasi Geografis",
      experience: "12+ tahun",
      education: "Ph.D. Geoinformatics, ITB",
      image: "/team/maya.jpg",
      bio: "Spesialis sistem informasi geografis dan manajemen database konservasi. Mengembangkan platform digital untuk akses data keanekaragaman hayati.",
      achievements: [
        "Lead Developer GIS Platform",
        "Penerima Penghargaan Inovasi Teknologi",
        "Speaker di Konferensi Internasional",
      ],
      social: {
        email: "maya.sari@tamankehati.id",
        linkedin: "maya-sari-gis",
        twitter: "@maya_sari_tech",
      },
    },
    {
      name: "Ir. Budi Santoso",
      role: "Lead Developer",
      expertise: "Arsitektur Teknologi",
      experience: "10+ tahun",
      education: "M.T. Computer Science, UI",
      image: "/team/budi.jpg",
      bio: "Arsitek teknologi dengan keahlian dalam pengembangan platform data besar. Memimpin pengembangan sistem backend dan API.",
      achievements: [
        "CTO di Startup Teknologi",
        "Expert dalam Big Data",
        "Open Source Contributor",
      ],
      social: {
        email: "budi.santoso@tamankehati.id",
        linkedin: "budi-santoso-tech",
        twitter: "@budi_santoso_dev",
      },
    },
    {
      name: "Dr. Lisa Putri",
      role: "Koordinator Edukasi & Komunikasi",
      expertise: "Komunikasi Sains",
      experience: "8+ tahun",
      education: "Ph.D. Science Communication, UGM",
      image: "/team/lisa.jpg",
      bio: "Ahli komunikasi sains yang mengembangkan program edukasi konservasi. Fokus pada penyampaian informasi ilmiah kepada masyarakat umum.",
      achievements: [
        "Penulis Buku Sains Populer",
        "Host Program TV Edukasi",
        "Penerima Penghargaan Jurnalisme Sains",
      ],
      social: {
        email: "lisa.putri@tamankehati.id",
        linkedin: "lisa-putri-communication",
        twitter: "@lisa_putri_sci",
      },
    },
    {
      name: "Dr. Rizki Pratama",
      role: "Ahli Botani Senior",
      expertise: "Taksonomi Tumbuhan",
      experience: "18+ tahun",
      education: "Ph.D. Plant Taxonomy, UNPAD",
      image: "/team/rizki.jpg",
      bio: "Spesialis taksonomi tumbuhan dan identifikasi spesies endemik Indonesia. Memiliki koleksi herbarium terbesar di Indonesia.",
      achievements: [
        "Kurator Herbarium Bogoriense",
        "Penemu 20+ Spesies Baru",
        "Penulis Flora Indonesia",
      ],
      social: {
        email: "rizki.pratama@tamankehati.id",
        linkedin: "rizki-pratama-botany",
        twitter: "@rizki_pratama_bot",
      },
    },
  ];

  const collaborators = [
    {
      name: "Great Blue Wall",
      description:
        "Leading the Blue Economic Revolution in the Western Indian Ocean",
      logo: "/collaborators/great-blue-wall.png",
      website: "https://greatbluewall.org",
    },
    {
      name: "Comfort Theory",
      description: "Wildlife Documentary Creatives",
      logo: "/collaborators/comfort-theory.png",
      website: "https://comforttheory.com",
    },
    {
      name: "LIPI",
      description: "Lembaga Ilmu Pengetahuan Indonesia",
      logo: "/collaborators/lipi.png",
      website: "https://lipi.go.id",
    },
    {
      name: "CIFOR",
      description: "Center for International Forestry Research",
      logo: "/collaborators/cifor.png",
      website: "https://cifor.org",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-light text-gray-900 mb-6">Tim Kami</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Dibalik Taman Kehati ada tim ahli yang berdedikasi untuk
            melestarikan keanekaragaman hayati Indonesia melalui penelitian,
            teknologi, dan aksi nyata.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  {/* Avatar */}
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-green-600 font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {member.expertise} • {member.experience}
                  </p>
                </div>

                {/* Bio */}
                <p className="text-gray-700 text-sm leading-relaxed mb-6">
                  {member.bio}
                </p>

                {/* Education */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Pendidikan
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{member.education}</p>
                </div>

                {/* Key Achievements */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Pencapaian Utama
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {member.achievements.slice(0, 2).map((achievement, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-600 flex items-start gap-2"
                      >
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Social Links */}
                <div className="flex gap-3 justify-center">
                  <a
                    href={`mailto:${member.social.email}`}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-green-100 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-gray-600" />
                  </a>
                  <a
                    href={`https://linkedin.com/in/${member.social.linkedin}`}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors"
                  >
                    <Linkedin className="w-4 h-4 text-gray-600" />
                  </a>
                  <a
                    href={`https://twitter.com/${member.social.twitter}`}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors"
                  >
                    <Twitter className="w-4 h-4 text-gray-600" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Collaborators Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-light text-gray-900 mb-4">
              Kolaborator
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Kami bekerja sama dengan berbagai institusi dan organisasi untuk
              mencapai misi konservasi keanekaragaman hayati.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {collaborators.map((collaborator, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="w-8 h-8 text-gray-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {collaborator.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {collaborator.description}
                  </p>
                  <a
                    href={collaborator.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                  >
                    Kunjungi Website
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Join Team CTA */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 overflow-hidden">
            <CardContent className="p-12">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-3xl font-light mb-4">
                  Bergabung dengan Tim Kami
                </h3>
                <p className="text-green-100 mb-8 text-lg">
                  Apakah Anda memiliki keahlian di bidang konservasi, teknologi,
                  atau edukasi? Mari bergabung dengan tim kami untuk
                  melestarikan keanekaragaman hayati Indonesia.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button className="px-8 py-3 bg-white text-green-600 font-semibold rounded-full hover:bg-green-50 transition-colors">
                    Lihat Lowongan Kerja
                  </button>
                  <button className="px-8 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-400 transition-colors">
                    Kirim Lamaran
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

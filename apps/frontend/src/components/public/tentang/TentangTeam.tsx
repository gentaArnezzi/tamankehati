export function TentangTeam() {
  const teamMembers = [
    {
      name: "Dr. Sarah Wijaya",
      role: "Direktur Eksekutif",
      image: "/team/sarah.jpg",
      description: "Ahli konservasi dengan 15 tahun pengalaman di bidang keanekaragaman hayati Indonesia."
    },
    {
      name: "Prof. Ahmad Rahman",
      role: "Kepala Riset",
      image: "/team/ahmad.jpg", 
      description: "Profesor biologi yang fokus pada ekologi hutan tropis dan konservasi spesies."
    },
    {
      name: "Dr. Maya Sari",
      role: "Koordinator Data",
      image: "/team/maya.jpg",
      description: "Spesialis sistem informasi geografis dan manajemen database konservasi."
    },
    {
      name: "Ir. Budi Santoso",
      role: "Lead Developer",
      image: "/team/budi.jpg",
      description: "Arsitek teknologi dengan keahlian dalam pengembangan platform data besar."
    },
    {
      name: "Dr. Lisa Putri",
      role: "Koordinator Edukasi",
      image: "/team/lisa.jpg",
      description: "Ahli komunikasi sains yang mengembangkan program edukasi konservasi."
    },
    {
      name: "Dr. Rizki Pratama",
      role: "Ahli Botani",
      image: "/team/rizki.jpg",
      description: "Spesialis taksonomi tumbuhan dan identifikasi spesies endemik Indonesia."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gray-900 mb-6">
            Tim Kami
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Dibalik Taman Kehati ada tim ahli yang berdedikasi untuk melestarikan keanekaragaman hayati Indonesia.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="w-24 h-24 bg-green-800 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-semibold text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                
                <p className="text-green-800 font-medium mb-3">
                  {member.role}
                </p>
                
                <p className="text-sm text-gray-600 leading-relaxed">
                  {member.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Bergabung dengan Kami
            </h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda memiliki keahlian di bidang konservasi, teknologi, atau edukasi? 
              Mari bergabung dengan tim kami untuk melestarikan keanekaragaman hayati Indonesia.
            </p>
            <button className="bg-green-800 hover:bg-green-900 text-white px-8 py-3 rounded-full font-medium transition-colors">
              Lihat Lowongan Kerja
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

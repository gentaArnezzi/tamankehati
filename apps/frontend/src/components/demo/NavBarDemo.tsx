import NavBar from "../ui/navbar-wrapper";

const menus = [
  {
    id: 1,
    title: "Beranda",
    url: "/",
    dropdown: false,
  },
  {
    id: 2,
    title: "Flora",
    url: "/flora",
    dropdown: true,
    items: [
      {
        id: 21,
        title: "Tanaman Hias",
        url: "/flora/tanaman-hias",
      },
      {
        id: 22,
        title: "Tanaman Obat",
        url: "/flora/tanaman-obat",
      },
      {
        id: 23,
        title: "Pohon Langka",
        url: "/flora/pohon-langka",
      },
    ],
  },
  {
    id: 3,
    title: "Fauna",
    url: "/fauna",
    dropdown: true,
    items: [
      {
        id: 31,
        title: "Mamalia",
        url: "/fauna/mamalia",
      },
      {
        id: 32,
        title: "Burung",
        url: "/fauna/burung",
      },
      {
        id: 33,
        title: "Reptil & Amfibi",
        url: "/fauna/reptil-amfibi",
      },
    ],
  },
  {
    id: 4,
    title: "Taman",
    url: "/taman",
    dropdown: false,
  },
  {
    id: 5,
    title: "Artikel",
    url: "/artikel",
    dropdown: false,
  },
];

export function NavBarDemo() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Taman Kehati Portal</h1>
        <p className="text-muted-foreground">
          Selamat datang di portal keanekaragaman hayati Indonesia. Jelajahi
          flora, fauna, dan kawasan konservasi nusantara untuk mendukung
          penelitian dan edukasi biodiversitas.
        </p>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-20">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm font-medium">Memuat daftar fauna...</p>
      </div>
    </div>
  );
}


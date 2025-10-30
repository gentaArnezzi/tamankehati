# apps/backend/api/v1/public/constants.py
"""
Constants for public API endpoints
"""

# Chatbot error messages
CHATBOT_ERROR_GENERAL = "Maaf, terjadi kesalahan dalam memproses pertanyaan Anda. Silakan coba lagi nanti."

CHATBOT_ERROR_WITH_CONTACT = "Maaf, terjadi kesalahan dalam memproses pertanyaan Anda. Silakan coba lagi nanti atau hubungi administrator."

CHATBOT_NO_DATA_RESPONSE = """Maaf, saya tidak memiliki data tentang pertanyaan Anda karena pada website Taman Kehati ini belum ditambahkan data tersebut.

Namun, Anda dapat:
• Mencari informasi di bagian Flora untuk data tumbuhan yang tersedia
• Mencari informasi di bagian Fauna untuk data hewan yang tersedia
• Melihat Taman Konservasi yang tersedia
• Membaca Artikel dan Berita terbaru
• Menggunakan fitur Pencarian untuk mencari informasi spesifik

Apakah ada topik lain tentang keanekaragaman hayati Indonesia yang ingin Anda ketahui?"""

CHATBOT_GREETING = """Selamat datang di Asisten Taman Kehati! 🌿

Saya dapat membantu Anda menemukan informasi tentang:
• Flora dan Fauna Indonesia
• Taman Konservasi
• Artikel dan Berita Konservasi
• Informasi Keanekaragaman Hayati

Silakan ajukan pertanyaan Anda!"""

# Rate limiting messages
RATE_LIMIT_EXCEEDED = "Terlalu banyak permintaan. Silakan tunggu beberapa saat sebelum mencoba lagi."
RATE_LIMIT_WARNING = "Anda mendekati batas permintaan. Mohon tunggu sebentar."

# Validation messages
INVALID_MESSAGE_LENGTH = "Pesan terlalu panjang. Maksimal 1000 karakter."
INVALID_MESSAGE_EMPTY = "Pesan tidak boleh kosong."
INVALID_MESSAGE_FORMAT = "Format pesan tidak valid."

# AI Provider messages
AI_PROVIDER_ERROR = "Layanan AI sedang tidak tersedia. Silakan coba lagi nanti."
AI_PROVIDER_TIMEOUT = "Permintaan memakan waktu terlalu lama. Silakan coba lagi."
AI_PROVIDER_QUOTA_EXCEEDED = "Kuota AI sudah tercapai. Silakan coba lagi nanti."

# Database error messages
DB_ERROR_CONNECTION = "Terjadi kesalahan koneksi ke database. Silakan coba lagi."
DB_ERROR_QUERY = "Terjadi kesalahan dalam mengambil data. Silakan coba lagi."

# General messages
SERVER_ERROR = "Terjadi kesalahan pada server. Silakan coba lagi nanti."
MAINTENANCE_MODE = "Sistem sedang dalam pemeliharaan. Silakan coba lagi nanti."


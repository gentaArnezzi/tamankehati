# AI Flora Fauna Automation Setup

Sistem otomatisasi pembuatan deskripsi flora dan fauna menggunakan AI lokal (Ollama) dengan model Qwen.

## 🚀 Quick Start

### 1. Install Ollama

**macOS:**

```bash
brew install ollama
```

**Linux:**

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download dari https://ollama.ai/download

### 2. Download Qwen Model

```bash
ollama pull qwen2:1.5b
```

### 3. Start Ollama Service

```bash
ollama serve
```

### 4. Test Setup

```bash
cd apps/backend
python test_ai_setup.py
```

### 5. Run Demo

```bash
# Backend
cd apps/backend
python main.py

# Frontend (in another terminal)
cd apps/frontend
npm run dev
```

Kemudian buka: http://localhost:3000/demo-ai

## 📋 API Endpoints

### Generate Flora Description

```http
POST /api/v1/ai/generate-flora-description
Content-Type: application/json
Authorization: Bearer <token>

{
  "local_name": "Pohon Jati",
  "scientific_name": "Tectona grandis",
  "family": "Lamiaceae",
  "genus": "Tectona",
  "is_endemic": false,
  "iucn_status": "LC"
}
```

### Generate Fauna Description

```http
POST /api/v1/ai/generate-fauna-description
Content-Type: application/json
Authorization: Bearer <token>

{
  "local_name": "Harimau Sumatera",
  "scientific_name": "Panthera tigris sumatrae",
  "family": "Felidae",
  "genus": "Panthera",
  "is_endemic": true,
  "iucn_status": "CR"
}
```

### Generate Flora Morphology

```http
POST /api/v1/ai/generate-flora-morphology
Content-Type: application/json
Authorization: Bearer <token>

{
  "local_name": "Pohon Jati",
  "scientific_name": "Tectona grandis",
  "family": "Lamiaceae"
}
```

### Generate Flora Benefits

```http
POST /api/v1/ai/generate-flora-benefits
Content-Type: application/json
Authorization: Bearer <token>

{
  "local_name": "Pohon Jati",
  "scientific_name": "Tectona grandis",
  "family": "Lamiaceae"
}
```

### Test Ollama Connection

```http
GET /api/v1/ai/test-ollama
```

## 🛠️ Troubleshooting

### Ollama Not Running

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama if not running
ollama serve
```

### Model Not Found

```bash
# List available models
ollama list

# Pull Qwen model
ollama pull qwen2:1.5b
```

### Connection Timeout

- Pastikan Ollama berjalan di port 11434
- Cek firewall settings
- Restart Ollama service

### Low Quality Output

- Gunakan model yang lebih besar: `ollama pull qwen2:7b`
- Pastikan data input lengkap
- Adjust prompt engineering di `flora_fauna_ai.py`

## 🔧 Configuration

### Environment Variables

```bash
# Optional: Custom Ollama URL
export OLLAMA_URL=http://localhost:11434

# Optional: Custom model
export OLLAMA_MODEL=qwen2:1.5b
```

### Model Selection

- `qwen2:1.5b` - Fast, good for basic descriptions
- `qwen2:7b` - Better quality, slower
- `qwen2:14b` - Best quality, requires more resources

## 📁 File Structure

```
apps/backend/
├── ai/
│   ├── services/
│   │   └── flora_fauna_ai.py      # AI service logic
│   └── providers/
│       └── ollama_provider.py      # Ollama integration
├── api/v1/routes/
│   └── ai_flora_fauna.py          # API endpoints
├── test_ai_setup.py               # Setup test script
├── demo_ai_flora_fauna.py         # Demo script
└── AI_SETUP_README.md            # This file

apps/frontend/src/
├── components/ai/
│   └── AIFloraFaunaGenerator.tsx   # React component
└── app/demo-ai/
    └── page.tsx                   # Demo page
```

## 🎯 Usage in Frontend

### Basic Integration

```tsx
import AIFloraFaunaGenerator from "@/components/ai/AIFloraFaunaGenerator";

export default function MyPage() {
  return (
    <div>
      <AIFloraFaunaGenerator />
    </div>
  );
}
```

### API Integration

```tsx
const generateDescription = async (data) => {
  const response = await fetch("/api/v1/ai/generate-flora-description", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  return result.description;
};
```

## 🚀 Production Deployment

### Docker Setup

```dockerfile
# Add to your Dockerfile
RUN curl -fsSL https://ollama.ai/install.sh | sh
RUN ollama pull qwen2:1.5b
```

### Environment Variables

```bash
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=qwen2:1.5b
```

## 📊 Performance Tips

1. **Model Selection**: Gunakan model yang sesuai dengan kebutuhan
2. **Caching**: Implement caching untuk hasil yang sering digunakan
3. **Batch Processing**: Process multiple requests together
4. **Resource Management**: Monitor memory usage

## 🔒 Security Notes

- AI berjalan lokal, tidak ada data yang dikirim ke server eksternal
- Pastikan Ollama service hanya accessible dari aplikasi
- Implement rate limiting untuk mencegah abuse
- Validate input data sebelum dikirim ke AI

## 📈 Monitoring

### Health Check

```bash
curl http://localhost:8000/api/v1/ai/test-ollama
```

### Logs

```bash
# Ollama logs
ollama logs

# Application logs
tail -f server.log
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Implement changes
4. Test thoroughly
5. Submit pull request

## 📞 Support

Jika mengalami masalah:

1. Check Ollama status: `ollama list`
2. Test connection: `curl http://localhost:11434/api/tags`
3. Run test script: `python test_ai_setup.py`
4. Check logs untuk error details

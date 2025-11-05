# Analisis Mendalam Sistem RAG (Retrieval-Augmented Generation)

## Executive Summary

Sistem RAG di Taman Kehati menggunakan pendekatan **hybrid retrieval** dengan fallback cascade untuk retrieve informasi flora dan fauna dari database PostgreSQL. Sistem ini terintegrasi dengan chatbot AI untuk memberikan konteks yang relevan saat menjawab pertanyaan pengguna.

**Status**: ✅ **Fungsional** dengan beberapa area untuk optimasi

---

## 1. Arsitektur Sistem RAG

### 1.1 Komponen Utama

```
┌─────────────────────────────────────────────────────────────┐
│                    User Query                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         prepare_messages_with_context()                      │
│  (apps/backend/ai/services/chat_service.py)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                        │
         ▼                        ▼
┌─────────────────┐      ┌──────────────────┐
│  Tool Execution │      │   RAG Retrieval  │
│  (Optional)     │      │   (Cascade)      │
└─────────────────┘      └────────┬─────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
          ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
          │   Hybrid    │ │   Trigram   │ │   Keyword   │
          │  Retrieval  │ │  Retrieval  │ │  Retrieval  │
          │  (Primary)  │ │  (Fallback) │ │  (Fallback) │
          └─────────────┘ └─────────────┘ └─────────────┘
                    │             │             │
                    └─────────────┴─────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │   Context Injection     │
                    │   (System Prompt)       │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   LLM Generation        │
                    │   (OpenAI/Ollama)       │
                    └─────────────────────────┘
```

### 1.2 Alur Eksekusi

1. **User mengirim query** → `send_message()`
2. **Simpan user message** → Database
3. **Prepare context** → `prepare_messages_with_context()`
   - Eksekusi tool (optional)
   - RAG retrieval (cascade)
4. **Generate AI response** → LLM dengan context
5. **Simpan assistant response** → Database

---

## 2. Metode Retrieval

### 2.1 Hybrid Retrieval (Primary) ⭐

**File**: `apps/backend/ai/rag/retriever_hybrid.py`

**Metode**: Kombinasi **Trigram Similarity** + **BM25 Full-Text Search**

**Konfigurasi**:
```python
MIN_TRGM_SIMILARITY = 0.15   # Threshold trigram
HYBRID_WEIGHT_TRGM = 0.6     # Weight untuk trigram score
HYBRID_WEIGHT_BM25 = 0.4     # Weight untuk BM25 score
```

**Cara Kerja**:
1. **Trigram Similarity** (`pg_trgm`):
   - Hitung similarity antara query dan `local_name` / `scientific_name`
   - Menggunakan `func.similarity()` dari PostgreSQL
   - Ambil nilai terbesar dari kedua kolom

2. **BM25 Full-Text Search**:
   - Buat `tsvector` dari: `local_name + scientific_name + description`
   - Query menggunakan `plainto_tsquery('simple', q)`
   - Ranking menggunakan `ts_rank()`

3. **Hybrid Score**:
   ```python
   final_score = (0.6 * trigram_score) + (0.4 * bm25_rank)
   ```

4. **Filtering**:
   - Ambil jika `trigram_score >= 0.15` **ATAU** `tsvector @@ tsquery`
   - Limit: 8 results per type (Flora/Fauna)

5. **Merging**:
   - Interleave hasil Flora dan Fauna secara bergantian
   - Truncate description ke 400 karakter

**Kelebihan**:
- ✅ Kombinasi semantic (trigram) + keyword (BM25)
- ✅ Lebih akurat untuk typo/varian nama
- ✅ Mendukung pencarian di description

**Kekurangan**:
- ⚠️ Tidak ada embedding vector (semantic similarity terbatas)
- ⚠️ Interleave sederhana (bukan score-based merge)
- ⚠️ Tidak ada re-ranking berdasarkan relevansi

---

### 2.2 Trigram Retrieval (Fallback Level 1)

**File**: `apps/backend/ai/rag/retriever_pg.py`

**Metode**: Pure **Trigram Similarity** (PostgreSQL `pg_trgm`)

**Cara Kerja**:
1. Hitung similarity untuk:
   - `Flora.local_name` vs query
   - `Flora.scientific_name` vs query
   - `Fauna.local_name` vs query
   - `Fauna.scientific_name` vs query

2. Ambil nilai terbesar per record

3. Filter: `similarity >= 0.15`

4. Limit: 6 results total

5. Truncate: 400 karakter

**Kelebihan**:
- ✅ Lebih cepat dari hybrid (tidak perlu BM25)
- ✅ Bagus untuk fuzzy matching nama

**Kekurangan**:
- ⚠️ Tidak mencari di description
- ⚠️ Hanya trigram (tidak ada keyword matching)

---

### 2.3 Keyword Retrieval (Fallback Level 2)

**File**: `apps/backend/ai/rag/retriever.py`

**Metode**: Simple **LIKE pattern matching**

**Cara Kerja**:
1. Query: `"%{query_lower}%"`
2. Search di:
   - `local_name` (LIKE)
   - `description` (LIKE)
3. Limit: 5 results total
4. Truncate: 300 karakter

**Kelebihan**:
- ✅ Sangat cepat
- ✅ Tidak bergantung extension PostgreSQL

**Kekurangan**:
- ⚠️ Tidak ada ranking/score
- ⚠️ Case-sensitive (meskipun sudah lowercase)
- ⚠️ Tidak ada fuzzy matching

---

## 3. Cascade Fallback Strategy

**File**: `apps/backend/ai/services/chat_service.py:49-58`

```python
# Try hybrid first
try:
    context_snippets = await hybrid_retrieve(db, q, limit=8)
except Exception:
    # Fallback to trigram
    try:
        context_snippets = await trigram_retrieve(db, q, limit=6)
    except Exception:
        # Final fallback to keyword
        context_snippets = await keyword_retrieve(db, q, limit=5)
```

**Analisis**:
- ✅ **Robust**: Selalu ada fallback jika method gagal
- ⚠️ **Silent failure**: Tidak ada logging untuk error
- ⚠️ **Generic exception**: Menangkap semua exception (termasuk programming error)

**Rekomendasi**:
- Tambahkan logging untuk error
- Tangkap exception spesifik (database error vs programming error)
- Monitor success rate per method

---

## 4. Context Injection

**File**: `apps/backend/ai/services/chat_service.py:59-61`

```python
if context_snippets:
    context = "\n\n".join([f"- {t}: {s}" for t, s in context_snippets])
    history.insert(0, {"role": "system", "content": f"You are a biodiversity assistant for Taman Kehati. Use this context if helpful:\n{context}"})
```

**Format Context**:
```
You are a biodiversity assistant for Taman Kehati. Use this context if helpful:
- Rafflesia arnoldii: Deskripsi bunga raksasa...
- Komodo: Deskripsi kadal besar...
- ...
```

**Analisis**:
- ✅ **Clear format**: Format list mudah dipahami LLM
- ⚠️ **No metadata**: Tidak ada informasi tentang source (Flora/Fauna)
- ⚠️ **No score**: Tidak ada informasi relevansi score
- ⚠️ **Simple prompt**: Tidak ada instruksi khusus tentang cara menggunakan context

**Rekomendasi**:
- Tambahkan metadata: `[Flora]` atau `[Fauna]`
- Tambahkan relevansi score jika perlu
- Perbaiki prompt untuk explicit instruction tentang penggunaan context

---

## 5. Public Chatbot Service (Alternative RAG)

**File**: `apps/backend/api/v1/public/services/main.py:330-603`

**Metode**: **Keyword-based search** dengan **hardcoded patterns**

**Cara Kerja**:
1. **Pattern Matching**:
   - Cek apakah query mengandung kata kunci tertentu
   - Contoh: `'flora'`, `'tumbuhan'`, `'fauna'`, `'hewan'`, dll.

2. **Database Query**:
   - Query langsung ke Flora/Fauna/Park/Article
   - Filter: `status == "approved"`, `deleted_at IS NULL`
   - Exclude: test/dummy data
   - Limit: 5 per type

3. **Context Building**:
   - Format: `"Data Flora (Tersedia di website Taman Kehati):\n- {name} ({scientific_name})"`
   - Tidak ada similarity score

4. **System Prompt**:
   - Sangat strict: "HANYA gunakan informasi yang ada dalam data"
   - "JANGAN membuat informasi yang tidak ada"
   - "JANGAN mengarang"

**Perbedaan dengan RAG utama**:
- ❌ Tidak menggunakan similarity search
- ❌ Tidak ada ranking/score
- ❌ Hardcoded keyword patterns
- ✅ Sangat strict terhadap hallucination
- ✅ Explicit filtering test data

---

## 6. Tool Integration (Disabled)

**File**: `apps/backend/ai/services/tooling.py:21-23`

```python
async def maybe_run_tool(db: AsyncSession, user_text: str) -> Optional[str]:
    """Zone tools disabled since park_zones table removed"""
    return None
```

**Status**: ⚠️ **DISABLED**

**Tools yang tersedia tapi tidak digunakan**:
- `get_zone_stats()` - Zone statistics
- `find_species_by_bbox()` - Spatial search
- `species_near_point()` - Geographic search
- `list_endemic_by_region()` - Regional filtering
- `count_by_iucn_status()` - Conservation status

**Analisis**:
- ⚠️ Tools masih ada di code tapi tidak diaktifkan
- ⚠️ Potensi fitur yang tidak dimanfaatkan
- ✅ Bisa diaktifkan kembali jika diperlukan

---

## 7. Database Indexing & Performance

### 7.1 Indexes yang Digunakan

**Dari migration file** (`apps/backend/migrations/versions/795ca4608cd2_init.py`):

**Tidak ada index khusus untuk RAG!** ⚠️

**Index yang ada**:
- Primary key indexes
- Foreign key indexes
- Unique indexes (email, slug)
- **TIDAK ADA**:
  - GIN index untuk `to_tsvector`
  - GiST index untuk `pg_trgm`
  - Index untuk `local_name`, `scientific_name`, `description`

### 7.2 Performance Impact

**Tanpa index**:
- ⚠️ `func.similarity()` akan scan full table
- ⚠️ `to_tsvector()` akan computed on-the-fly
- ⚠️ `ts_rank()` akan slow untuk large dataset

**Expected Performance**:
- ✅ **OK** untuk dataset kecil (< 10K records)
- ⚠️ **SLOW** untuk dataset besar (> 100K records)
- ⚠️ Tidak scalable untuk production besar

### 7.3 Rekomendasi Indexing

```sql
-- Trigram index untuk similarity
CREATE INDEX idx_flora_local_name_trgm ON flora USING gin(local_name gin_trgm_ops);
CREATE INDEX idx_flora_scientific_name_trgm ON flora USING gin(scientific_name gin_trgm_ops);
CREATE INDEX idx_fauna_local_name_trgm ON fauna USING gin(local_name gin_trgm_ops);
CREATE INDEX idx_fauna_scientific_name_trgm ON fauna USING gin(scientific_name gin_trgm_ops);

-- Full-text search index
CREATE INDEX idx_flora_fts ON flora USING gin(
    to_tsvector('simple', 
        coalesce(local_name, '') || ' ' || 
        coalesce(scientific_name, '') || ' ' || 
        coalesce(description, '')
    )
);
CREATE INDEX idx_fauna_fts ON fauna USING gin(
    to_tsvector('simple', 
        coalesce(local_name, '') || ' ' || 
        coalesce(scientific_name, '') || ' ' || 
        coalesce(description, '')
    )
);
```

---

## 8. Data Sources & Coverage

### 8.1 Sumber Data

**Model yang digunakan**:
- ✅ `Flora` (local_name, scientific_name, description)
- ✅ `Fauna` (local_name, scientific_name, description)
- ❌ `Park` (tidak digunakan di RAG utama)
- ❌ `Article` (tidak digunakan di RAG utama)
- ❌ `Gallery` (tidak digunakan di RAG utama)

**Analisis**:
- ✅ Fokus pada flora/fauna (sesuai domain)
- ⚠️ Tidak menggunakan Park/Article untuk context
- ⚠️ Potensi informasi yang tidak dimanfaatkan

### 8.2 Coverage

**Field yang digunakan**:
- `local_name` (primary)
- `scientific_name` (primary)
- `description` (secondary, hanya di hybrid)

**Field yang TIDAK digunakan**:
- `family`, `genus`, `species`
- `iucn_status`
- `is_endemic`
- `habitat`
- `distribution`
- `morphology`
- `benefits`

**Analisis**:
- ⚠️ Banyak metadata yang tidak digunakan
- ⚠️ Potensi untuk richer context
- ✅ Simple = fast (tapi kurang informatif)

---

## 9. Prompt Engineering

### 9.1 System Prompt (RAG Main)

**File**: `apps/backend/ai/services/chat_service.py:61`

```python
"You are a biodiversity assistant for Taman Kehati. Use this context if helpful:\n{context}"
```

**Analisis**:
- ⚠️ **Sangat simple**: Tidak ada instruksi detail
- ⚠️ **"if helpful"**: LLM bisa ignore context
- ⚠️ **No format**: Tidak ada format output yang diharapkan

### 9.2 System Prompt (Public Chatbot)

**File**: `apps/backend/api/v1/public/services/main.py:548-573`

**Sangat strict dan detailed**:
- ✅ Explicit rules: "HANYA gunakan informasi yang ada"
- ✅ Explicit rules: "JANGAN membuat informasi"
- ✅ Explicit rules: "JANGAN mengarang"
- ✅ Clear instructions tentang behavior

**Analisis**:
- ✅ Lebih baik untuk prevent hallucination
- ✅ Lebih explicit
- ⚠️ Bisa terlalu strict untuk creative answers

---

## 10. Integration dengan LLM Providers

### 10.1 Providers yang Didukung

**File**: `apps/backend/api/v1/routes/chat.py:31-46`

- ✅ **OpenAI** (GPT models)
- ✅ **Google** (Gemini) - default
- ✅ **Ollama** (Local LLM)

**RAG Context**:
- ✅ Sama untuk semua providers
- ✅ Tidak ada provider-specific optimization

### 10.2 Context Window Management

**Limit Context**:
- Hybrid: 8 results × 400 chars = ~3,200 chars
- Trigram: 6 results × 400 chars = ~2,400 chars
- Keyword: 5 results × 300 chars = ~1,500 chars

**Analisis**:
- ✅ Reasonable size untuk context window
- ⚠️ Tidak ada dynamic truncation berdasarkan model
- ⚠️ Tidak ada token counting

---

## 11. Error Handling & Resilience

### 11.1 Error Handling

**Current**:
```python
try:
    context_snippets = await hybrid_retrieve(db, q, limit=8)
except Exception:  # ⚠️ Too broad
    try:
        context_snippets = await trigram_retrieve(db, q, limit=6)
    except Exception:  # ⚠️ Too broad
        context_snippets = await keyword_retrieve(db, q, limit=5)
```

**Masalah**:
- ⚠️ Menangkap semua exception (termasuk programming error)
- ⚠️ Tidak ada logging
- ⚠️ Silent failure

**Rekomendasi**:
```python
try:
    context_snippets = await hybrid_retrieve(db, q, limit=8)
except (DatabaseError, OperationalError) as e:
    logger.warning(f"Hybrid retrieval failed: {e}, falling back to trigram")
    try:
        context_snippets = await trigram_retrieve(db, q, limit=6)
    except (DatabaseError, OperationalError) as e:
        logger.warning(f"Trigram retrieval failed: {e}, falling back to keyword")
        context_snippets = await keyword_retrieve(db, q, limit=5)
except Exception as e:
    logger.error(f"Unexpected error in RAG retrieval: {e}")
    context_snippets = []
```

---

## 12. Testing & Monitoring

### 12.1 Testing

**Status**: ❌ **Tidak ada unit test untuk RAG**

**Rekomendasi**:
- Unit test untuk setiap retrieval method
- Integration test untuk cascade fallback
- Performance test untuk large dataset

### 12.2 Monitoring

**Status**: ❌ **Tidak ada monitoring**

**Rekomendasi**:
- Log retrieval method yang digunakan
- Log success rate per method
- Log retrieval time
- Log number of results retrieved
- Alert jika semua methods fail

---

## 13. Kelebihan Sistem

1. ✅ **Hybrid approach**: Kombinasi semantic + keyword
2. ✅ **Robust fallback**: 3-level cascade
3. ✅ **Simple integration**: Mudah digunakan di chat service
4. ✅ **Database-native**: Tidak perlu external service
5. ✅ **No vector DB needed**: Tidak perlu setup tambahan
6. ✅ **Fast untuk small dataset**: Performa OK untuk dataset kecil

---

## 14. Kekurangan & Area Improvement

### 14.1 Critical Issues

1. ❌ **No database indexes**: Performance akan turun untuk dataset besar
2. ❌ **No error logging**: Sulit debug ketika ada masalah
3. ❌ **No monitoring**: Tidak tahu success rate
4. ❌ **No testing**: Tidak ada test coverage

### 14.2 Medium Priority

1. ⚠️ **Limited data sources**: Hanya Flora/Fauna, tidak Pak/Article
2. ⚠️ **Simple interleave**: Bukan score-based merge
3. ⚠️ **No re-ranking**: Tidak ada re-ranking berdasarkan relevansi
4. ⚠️ **Limited metadata**: Tidak menggunakan semua field
5. ⚠️ **No semantic search**: Tidak ada embedding vector

### 14.3 Nice to Have

1. 💡 **Vector embeddings**: Semantic similarity yang lebih baik
2. 💡 **Query expansion**: Synonym, related terms
3. 💡 **Context compression**: Summarize long descriptions
4. 💡 **Multi-lingual**: Support English/Indonesian
5. 💡 **Re-ranking**: Cross-encoder untuk re-ranking

---

## 15. Rekomendasi Prioritas

### Priority 1: Critical Fixes

1. **Add database indexes** (High Impact)
   - GIN index untuk trigram
   - GIN index untuk full-text search
   - **Impact**: 10-100x faster untuk large dataset

2. **Add error logging** (Medium Impact)
   - Log retrieval method used
   - Log errors dengan detail
   - **Impact**: Better debugging, monitoring

### Priority 2: Performance

1. **Add monitoring** (Medium Impact)
   - Success rate per method
   - Retrieval time
   - Number of results
   - **Impact**: Better observability

2. **Improve interleave algorithm** (Low Impact)
   - Score-based merge instead of simple interleave
   - **Impact**: Better relevance ordering

### Priority 3: Enhancement

1. **Add more data sources** (Medium Impact)
   - Include Park, Article, Gallery
   - **Impact**: Richer context

2. **Improve prompt engineering** (Low Impact)
   - More explicit instructions
   - Better format
   - **Impact**: Better LLM responses

3. **Add re-ranking** (Low Impact)
   - Cross-encoder untuk re-ranking
   - **Impact**: Better relevance

---

## 16. Conclusion

**Current State**: ✅ **Functional** tapi **Needs Optimization**

**Strengths**:
- Hybrid approach yang baik
- Robust fallback mechanism
- Simple integration

**Weaknesses**:
- No database indexes (performance concern)
- No monitoring/logging
- Limited data sources
- No testing

**Next Steps**:
1. Add database indexes (Priority 1)
2. Add error logging (Priority 1)
3. Add monitoring (Priority 2)
4. Improve prompt engineering (Priority 3)

---

**Dokumen ini dibuat**: 2025-11-06
**Last Updated**: 2025-11-06
**Version**: 1.0


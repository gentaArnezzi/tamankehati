# Medium-Style Article Editor ✨

**Created**: 25 Oktober 2024  
**Status**: ✅ Ready to Use

---

## 🎨 **Features (Seperti Medium.com)**

### **Clean & Minimalist Design**
- ✅ Full-width editor tanpa distraksi
- ✅ Focus mode untuk menulis
- ✅ Typography yang elegant (Georgia serif untuk content)
- ✅ Spacing yang generous untuk readability

### **Rich Text Formatting**
- ✅ **Bold** text (`**bold**`)
- ✅ *Italic* text (`*italic*`)
- ✅ Headings (`## Heading`)
- ✅ Bullet lists (`- item`)
- ✅ Blockquotes (`> quote`)
- ✅ Inline code (`` `code` ``)
- ✅ Images (`![alt](url)`)

### **Modern UI/UX**
- ✅ Sticky top bar dengan action buttons
- ✅ Large title input (42px)
- ✅ Excerpt/subtitle support
- ✅ Cover image dengan drag & drop visual
- ✅ Formatting toolbar yang accessible
- ✅ Settings sidebar untuk metadata
- ✅ Real-time preview dalam penulisan

### **Medium-Like Behaviors**
- ✅ Auto-grow textarea
- ✅ Placeholder yang hilang saat typing
- ✅ Smooth transitions
- ✅ Clean button actions (Save Draft / Publish)
- ✅ Minimal borders, maximum focus on content

---

## 📝 **Markdown Support**

Editor mendukung basic markdown:

```markdown
**Bold text**
*Italic text*
## Heading 2
### Heading 3

- Bullet list
- Another item

> Blockquote untuk kutipan

`Inline code`

![Alt text](https://example.com/image.jpg)
```

---

## 🎯 **How to Use**

### **1. Menulis Artikel**

1. **Cover Image**: Klik area dashed untuk upload cover
2. **Judul**: Large input di atas (42px font)
3. **Excerpt**: Subtitle/ringkasan di bawah judul
4. **Content**: Textarea besar dengan toolbar formatting

### **2. Formatting**

Gunakan toolbar atau markdown shortcuts:
- Bold: Click **B** button atau `**text**`
- Italic: Click *I* button atau `*text*`
- Heading: Click **T** button atau `## text`
- List: Click list button atau `- text`
- Quote: Click quote button atau `> text`
- Code: Click `<>` button atau `` `text` ``
- Image: Click image button atau `![](url)`

### **3. Settings**

Click **⋯** (More) button untuk:
- Set kategori artikel
- Edit cover image URL
- Edit excerpt/ringkasan

### **4. Save & Publish**

- **Save**: Simpan sebagai draft
- **Publish**: Langsung publikasikan artikel

---

## 🚀 **Integration**

### **File Location**
```
apps/frontend/src/components/artikel/MediumStyleArtikelPage.tsx
```

### **Usage**
```tsx
import { MediumStyleArtikelPage } from '@/components/artikel/MediumStyleArtikelPage';

// In your page component
export default function CreateArticlePage() {
  return <MediumStyleArtikelPage />;
}
```

### **Route Setup**
Create route at:
```
apps/frontend/src/app/dashboard/artikel/buat/page.tsx
```

---

## 🎨 **Design Decisions**

### **Typography**
- **Title**: 42px, Bold, System font (San Francisco/Segoe UI)
- **Content**: 20px, Georgia (serif for readability)
- **Line Height**: 1.8 (spacious untuk easy reading)

### **Colors**
- **Background**: Pure white (`#ffffff`)
- **Text**: Dark gray (`#1a1a1a`)
- **Placeholder**: Light gray (`#d1d1d1`)
- **Accent**: Green (`#16a34a`) untuk publish button

### **Spacing**
- **Max Width**: 720px untuk optimal reading
- **Padding**: 32px horizontal, 48px vertical
- **Line Height**: 1.8 untuk content

---

## 💡 **Tips Penulisan**

### **Untuk Penulis**

1. **Judul yang Menarik**
   - Maksimal 60 karakter
   - Gunakan angka jika relevant (5 Tips...)
   - Buat curiosity

2. **Excerpt yang Kuat**
   - 1-2 kalimat pembuka
   - Hook reader untuk baca lebih lanjut
   - Maksimal 200 karakter

3. **Structure Content**
   ```
   ## Introduction
   Paragraf pembuka...

   ## Main Content
   Point 1...
   Point 2...

   ## Conclusion
   Kesimpulan...
   ```

4. **Use Images**
   - 1 cover image (wajib)
   - 2-3 inline images untuk break text
   - Alt text yang descriptive

5. **Keep Paragraphs Short**
   - 2-3 kalimat per paragraf
   - Use whitespace generously
   - Break with headings

---

## 🔧 **Technical Details**

### **State Management**
```tsx
const [title, setTitle] = useState('');
const [content, setContent] = useState('');
const [excerpt, setExcerpt] = useState('');
const [category, setCategory] = useState('');
const [featuredImage, setFeaturedImage] = useState('');
```

### **API Integration**
```tsx
POST /api/v1/articles/
{
  "title": "string",
  "content": "string",
  "summary": "string",
  "category": "string",
  "featured_image": "string | null",
  "status": "draft | published"
}
```

### **Markdown Processing**
Simple markdown support dengan regex:
- `**text**` → `<strong>text</strong>`
- `*text*` → `<em>text</em>`
- `## text` → `<h2>text</h2>`
- etc.

---

## 🎯 **Future Enhancements**

### **Phase 2**
- [ ] TipTap editor integration (full WYSIWYG)
- [ ] Drag & drop image upload
- [ ] Collaborative editing
- [ ] Auto-save every 30s
- [ ] Version history
- [ ] Comments/annotations

### **Phase 3**
- [ ] AI writing assistant
- [ ] SEO suggestions
- [ ] Readability score
- [ ] Grammar check
- [ ] Image optimization

---

## 📊 **Comparison: Old vs New**

| Feature | Old Editor | Medium Style |
|---------|-----------|--------------|
| UI | Form-based | Full-page |
| Formatting | None | Rich toolbar |
| Typography | Basic | Professional |
| Focus | Multi-column | Single column |
| Experience | Admin-like | Writer-friendly |
| Mobile | OK | Excellent |

---

## 🎨 **Screenshots**

### Writing View:
```
[Top Bar: Back | Draft | Save | Publish]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Cover Image]

Judul Besar Yang Menarik
Excerpt atau subtitle artikel

[B] [I] [T] | [•] ["] [<>] | [img]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Konten artikel yang panjang dengan 
typography yang indah dan spacing 
yang generous...

```

---

## ✅ **Ready to Use**

File sudah siap! Tinggal:
1. ✅ Import component
2. ✅ Setup route
3. ✅ Test di browser

**Enjoy writing like on Medium!** ✨📝

---

**Documentation**: Complete  
**Status**: Production Ready ✅


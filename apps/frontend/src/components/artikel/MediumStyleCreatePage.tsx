"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Save,
  Eye,
  Upload,
  Image as ImageIcon,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../lib/useAuth";
import { imageUrl as buildImageUrl } from "../../lib/api-url";
import { sanitizeHtmlRich } from "../../utils/sanitizeHtml";

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { 
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "500px",
        padding: "12px",
        border: "none",
        outline: "none",
      }}
      className="bg-white"
    >
      <p className="text-gray-400">Memuat editor...</p>
    </div>
  ),
});

interface MediumStyleCreatePageProps {
  articleId?: string;
  mode?: "create" | "edit";
}

const CATEGORIES = [
  "Konservasi",
  "Penelitian",
  "Edukasi",
  "Berita",
  "Laporan Lapangan",
  "Kebijakan",
] as const;

export function MediumStyleCreatePage({
  articleId,
  mode = "create",
}: MediumStyleCreatePageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnPage = searchParams?.get('page') || '1';
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [toolbarOffset, setToolbarOffset] = useState(0);
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load Quill CSS and ensure editor is ready
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if CSS is already loaded
      const existingLink = document.querySelector('link[href*="quill.snow.css"]');
      if (!existingLink) {
        const link = document.createElement("link");
        link.href = "https://cdn.quilljs.com/1.3.6/quill.snow.css";
        link.rel = "stylesheet";
        link.type = "text/css";
        link.onload = () => {
          // Small delay to ensure CSS is fully loaded
          setTimeout(() => {
            setIsEditorReady(true);
          }, 100);
        };
        link.onerror = () => {
          // Fallback: set ready even if CDN fails (CSS might be in globals.css)
          setTimeout(() => {
            setIsEditorReady(true);
          }, 100);
        };
        document.head.appendChild(link);
        } else {
        // CSS already loaded, set ready immediately
        setIsEditorReady(true);
      }
    }
  }, []);

  // Load article if in edit mode
  useEffect(() => {
    if (mode === "edit" && articleId) {
      loadArticle();
    }
  }, [mode, articleId]);

  // Make toolbar sticky/fixed when scrolling - always stays below header
  useEffect(() => {
    if (isEditorReady && typeof window !== "undefined") {
      const updateToolbarPosition = () => {
        const header = document.querySelector('header');
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        const toolbar = document.querySelector('.quill-sticky-toolbar .ql-toolbar') as HTMLElement;
        const wrapper = editorWrapperRef.current;
        
        if (toolbar && wrapper) {
          const wrapperRect = wrapper.getBoundingClientRect();
          const scrollY = window.scrollY;
          const wrapperTop = wrapperRect.top + scrollY;
          
          // Always use fixed position when wrapper is scrolled into view
          if (scrollY > wrapperTop - headerHeight - 10) {
            // Use fixed position - toolbar stays at top below header
            toolbar.style.cssText = `
              position: fixed !important;
              top: ${headerHeight}px !important;
              width: ${wrapperRect.width}px !important;
              left: ${wrapperRect.left}px !important;
              z-index: 100 !important;
              background: #f9fafb !important;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
              border-bottom: 1px solid #e5e7eb !important;
            `;
      } else {
            // Use sticky position when wrapper is not scrolled yet
            toolbar.style.cssText = `
              position: sticky !important;
              top: 0 !important;
              z-index: 100 !important;
            `;
          }
        }
      };

      // Use requestAnimationFrame for smooth updates
      let rafId: number | null = null;
      const handleScroll = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(updateToolbarPosition);
      };

      // Initial update with delay to ensure DOM is ready
      const initTimeout = setTimeout(() => {
        updateToolbarPosition();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', updateToolbarPosition);
      }, 200);

      return () => {
        clearTimeout(initTimeout);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', updateToolbarPosition);
        if (rafId) cancelAnimationFrame(rafId);
      };
    }
  }, [isEditorReady]);

  // Ensure all images in editor have consistent styling
  useEffect(() => {
    if (isEditorReady && typeof window !== "undefined") {
      const standardizeImages = () => {
        const quillEditor = document.querySelector('.ql-editor');
        if (quillEditor) {
          const images = quillEditor.querySelectorAll('img');
          images.forEach((img) => {
            (img as HTMLImageElement).style.maxWidth = "100%";
            (img as HTMLImageElement).style.width = "100%";
            (img as HTMLImageElement).style.height = "auto";
            (img as HTMLImageElement).style.display = "block";
            (img as HTMLImageElement).style.margin = "20px auto";
            (img as HTMLImageElement).style.borderRadius = "8px";
            (img as HTMLImageElement).style.objectFit = "contain";
            (img as HTMLImageElement).style.maxHeight = "600px";
          });
        }
      };

      // Standardize images when content changes
      const timeoutId = setTimeout(standardizeImages, 200);
      
      // Also standardize on mutation (when images are added)
      const observer = new MutationObserver(standardizeImages);
      const quillEditor = document.querySelector('.ql-editor');
      if (quillEditor) {
        observer.observe(quillEditor, {
          childList: true,
          subtree: true,
        });
      }

      return () => {
        clearTimeout(timeoutId);
        observer.disconnect();
      };
    }
  }, [isEditorReady, content]);

      const loadArticle = async () => {
        try {
          const token = localStorage.getItem("auth_token");
          if (!token) {
            toast.error("Anda harus login terlebih dahulu");
            router.push("/login");
            return;
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://103.125.91.16"}/api/v1/articles/${articleId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
        }
          );

          if (response.status === 401) {
            toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
            router.push("/login");
            return;
          }

          if (response.status === 404) {
            toast.error("Artikel tidak ditemukan");
            router.push(`/dashboard/taman/berita?page=${returnPage}`);
            return;
          }

          if (!response.ok) {
            throw new Error("Failed to load article");
          }

          const data = await response.json();
          setTitle(data.title || data.judul || "");
          // Ensure content is always a string HTML for Quill
          const contentValue = data.content || data.konten || "";
          setContent(typeof contentValue === "string" ? contentValue : String(contentValue || ""));
          setExcerpt(data.summary || data.excerpt || "");
          setCategory(data.category || data.kategori || "");
          setCoverImage(data.featured_image || data.gambar_cover || "");
            setDraftId(String(data.id));
        } catch (error) {
          console.error("Error loading article:", error);
          toast.error("Gagal memuat artikel");
          router.push(`/dashboard/taman/berita?page=${returnPage}`);
        }
      };

  // Autosave functionality
  useEffect(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    if (title || content) {
      autosaveTimerRef.current = setTimeout(() => {
        handleAutosave();
      }, 2000);
    }

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [title, content, excerpt, category]);

  const handleAutosave = async () => {
    if (!title && !content) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      let url: string;
      let method: string;
      
      if (mode === "edit" && articleId) {
        url = `${process.env.NEXT_PUBLIC_API_URL || "http://103.125.91.16"}/api/v1/articles/${articleId}`;
        method = "PUT";
      } else if (draftId) {
        url = `${process.env.NEXT_PUBLIC_API_URL || "http://103.125.91.16"}/api/v1/articles/${draftId}`;
        method = "PUT";
      } else {
        url = `${process.env.NEXT_PUBLIC_API_URL || "http://103.125.91.16"}/api/v1/articles/`;
        method = "POST";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title || "Untitled",
          content: content || "",
          summary: excerpt || content.substring(0, 200) + "...",
          category: category || "Artikel",
          status: "draft",
        }),
      });

      if (!response.ok) {
        throw new Error("Autosave failed");
      }

      if (method === "POST" && !draftId) {
        const data = await response.json();
        if (data.id) {
          setDraftId(String(data.id));
        }
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error("Autosave error:", error);
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Anda harus login terlebih dahulu");
      }

      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(
          `File terlalu besar. Maksimal 10MB. File Anda: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        );
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://103.125.91.16"}/api/v1/upload/gallery-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      if (!result.url) {
        throw new Error("URL gambar tidak ditemukan dalam response");
      }

      return result.url;
    } catch (error) {
      console.error("Image upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Gagal mengupload gambar";
      toast.error(errorMessage);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = useCallback(async () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const imageUrl = await uploadFile(file);
          console.log("Uploaded image URL (raw):", imageUrl);
          console.log("Uploaded image URL (processed):", buildImageUrl(imageUrl));
          
          // Ensure we have a valid URL
          if (!imageUrl) {
            toast.error("URL gambar tidak valid");
      return;
    }

          // Insert image into Quill editor
          // Find Quill editor instance from DOM
          const quillEditor = document.querySelector('.ql-editor') as any;
          if (quillEditor && quillEditor.__quill) {
            const quill = quillEditor.__quill;
            const range = quill.getSelection(true);
            const processedUrl = buildImageUrl(imageUrl);
            // Insert image with standardized styling
            quill.insertEmbed(range ? range.index : 0, "image", processedUrl, "user");
            quill.setSelection((range ? range.index : 0) + 1);
            
            // Apply standardized styling to the inserted image
      setTimeout(() => {
              const insertedImg = quillEditor.querySelector(`img[src="${processedUrl}"]`);
              if (insertedImg) {
                insertedImg.style.maxWidth = "100%";
                insertedImg.style.width = "100%";
                insertedImg.style.height = "auto";
                insertedImg.style.display = "block";
                insertedImg.style.margin = "20px auto";
                insertedImg.style.borderRadius = "8px";
                insertedImg.style.objectFit = "contain";
                insertedImg.style.maxHeight = "600px";
              }
            }, 100);
          } else {
            // Fallback: insert as HTML with standardized styling
            const processedUrl = buildImageUrl(imageUrl);
            setContent((prevContent) => prevContent + `<img src="${processedUrl}" alt="${file.name}" style="max-width: 100%; width: 100%; height: auto; display: block; margin: 20px auto; border-radius: 8px; object-fit: contain; max-height: 600px;" />`);
          }
          
          toast.success("Gambar berhasil diupload dan ditambahkan ke artikel");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Gagal mengupload gambar");
        }
      }
    };
    input.click();
  }, [uploadFile]);

  // Quill modules configuration - use useMemo to prevent recreation
  // Store handleImageUpload in ref to prevent recreation
  const handleImageUploadRef = useRef(handleImageUpload);
  useEffect(() => {
    handleImageUploadRef.current = handleImageUpload;
  }, [handleImageUpload]);

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        ["blockquote", "code-block"],
        ["link", "image"],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["clean"],
      ],
      handlers: {
        image: () => {
          handleImageUploadRef.current();
        },
      },
    },
    clipboard: {
      matchVisual: false,
    },
  }), []);

  const quillFormats = useMemo(() => [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "blockquote",
    "code-block",
    "link",
    "image",
    "color",
    "background",
    "align",
  ], []);


  const handlePublish = async () => {
    if (!title || !content.trim()) {
      toast.error("Judul dan konten wajib diisi");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Anda harus login terlebih dahulu");
        router.push("/login");
        return;
      }

      const idToUse = draftId || (mode === "edit" && articleId ? articleId : null);
      const url = idToUse
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://103.125.91.16"}/api/v1/articles/${idToUse}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://103.125.91.16"}/api/v1/articles/`;
      const method = idToUse ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          summary: excerpt || content.substring(0, 200) + "...",
          category: category || "Artikel",
          featured_image: coverImage || null,
          status: "approved",
        }),
      });

      if (response.status === 401) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to publish article");
      }

          toast.success("Artikel berhasil dipublikasikan!");
          router.push(`/dashboard/taman/berita?page=${returnPage}`);
    } catch (error) {
      console.error("Error publishing article:", error);
      toast.error("Gagal mempublikasikan artikel");
    } finally {
      setSaving(false);
    }
  };

  const handleCoverImageUpload = async (file: File) => {
    try {
      const imageUrl = await uploadFile(file);
      setCoverImage(imageUrl);
      toast.success("Cover image berhasil diupload");
    } catch (error) {
      console.error("Error uploading cover image:", error);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const formatLastSaved = () => {
    if (!lastSaved) return "";
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 10) return "Baru saja disimpan";
    if (seconds < 60) return `Disimpan ${seconds} detik yang lalu`;
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `Disimpan ${minutes} menit yang lalu`;
    }
    return lastSaved.toLocaleTimeString();
  };

  // Render HTML content for preview (Quill already outputs HTML)
  const renderContent = (html: string): string => {
    if (!html) return "";
    
    // Process images in HTML to ensure URLs are correct and standardize sizes
    let processedHtml = html.replace(/<img[^>]+src="([^"]+)"[^>]*>/g, (match, url) => {
      const processedUrl = buildImageUrl(url);
      // Standardize image styling
      return `<img src="${processedUrl}" style="max-width: 100%; width: 100%; height: auto; display: block; margin: 20px auto; border-radius: 8px; object-fit: contain; max-height: 600px;" />`;
    });
    
    return sanitizeHtmlRich(processedHtml);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard/taman/berita")}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Kembali
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {mode === "edit" ? "Edit Artikel" : "Buat Artikel Baru"}
                </h1>
              <p className="text-sm text-gray-500">
                {saving ? (
                    <span className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                      Menyimpan...
                  </span>
                ) : lastSaved ? (
                    formatLastSaved()
                ) : (
                    "Belum disimpan"
                )}
              </p>
            </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {previewMode ? "Edit" : "Preview"}
              </Button>
            <Button
              onClick={() => setShowPublishModal(true)}
                disabled={saving || !title || !content.trim()}
                className="bg-[#00ab6c] hover:bg-[#008f56] text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  "Publish"
                )}
            </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8" style={{ position: "relative" }}>
        {previewMode ? (
          /* Preview Mode */
          <div className="max-w-4xl mx-auto">
            <article className="prose prose-lg max-w-none">
              <h1 className="text-4xl font-bold mb-4">{title || "Judul Artikel"}</h1>
              {excerpt && (
                <p className="text-xl text-gray-600 mb-8">{excerpt}</p>
              )}
              {coverImage && (
                <div className="mb-8">
                  <img
                    src={buildImageUrl(coverImage)}
                    alt={title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
          </div>
        )}
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: renderContent(content),
                }}
              />
            </article>
          </div>
        ) : (
          /* Edit Mode */
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Artikel *
              </label>
              <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul artikel..."
                className="text-2xl font-bold"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ringkasan (Excerpt)
              </label>
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Ringkasan singkat artikel (akan muncul di halaman list artikel)..."
                rows={2}
                className="resize-none"
              />
        </div>

            {/* Content Editor - Rich Text Editor like Microsoft Word */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konten Artikel *
              </label>
              <div 
                ref={editorWrapperRef}
                className="border border-gray-200 rounded-lg bg-white quill-editor-wrapper" 
                style={{ position: "relative" }}
              >
                {isEditorReady ? (
                  <ReactQuill
                    theme="snow"
                    value={content || ""}
                    onChange={(value) => {
                      setContent(value || "");
                    }}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Mulai menulis artikel Anda di sini..."
            style={{
                      minHeight: "500px",
                    }}
                    className="bg-white quill-sticky-toolbar"
                    readOnly={false}
                    preserveWhitespace={true}
                  />
                ) : (
                  <div
                    style={{
                      minHeight: "500px",
                      padding: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    className="bg-white"
                  >
                    <p className="text-gray-400">Memuat editor...</p>
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Tips: Toolbar formatting akan tetap terlihat saat scroll. Klik tombol gambar untuk upload gambar.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Publish Modal */}
      <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Publish Artikel
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              {coverImage ? (
                <div className="relative group">
                  <img
                    src={buildImageUrl(coverImage)}
                    alt="Cover"
                    className="h-48 w-full rounded-lg object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setCoverImage("")}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 hover:border-[#00ab6c] transition-colors">
                  <div className="text-center">
                    <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) handleCoverImageUpload(file);
                        };
                        input.click();
                      }}
                    >
                      Upload Cover Image
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent className="z-[200]" position="popper">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 p-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Tambah tag..."
                  className="flex-1 border-0 bg-transparent focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Publish Button */}
            <Button
              onClick={handlePublish}
              disabled={saving || !title || !content.trim() || !category}
              className="w-full bg-[#00ab6c] hover:bg-[#008f56] text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Publishing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Publish Artikel
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import {
  Image as ImageIcon,
  Video,
  Code,
  Link as LinkIcon,
  Minus,
  MoreHorizontal,
  Bold,
  Italic,
  Quote,
  Heading1,
  Loader2,
  X,
  Upload,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../lib/useAuth";
import { imageUrl as buildImageUrl } from "../../lib/api-url";

interface MediumStyleCreatePageProps {
  articleId?: string;
  mode?: "create" | "edit";
}

type BlockType = "paragraph" | "heading" | "image" | "quote" | "code";

interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
}

export function MediumStyleCreatePage({
  articleId,
  mode = "create",
}: MediumStyleCreatePageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [draftId, setDraftId] = useState<string | null>(articleId ?? null);
  const [blocks, setBlocks] = useState<ContentBlock[]>([
    { id: "1", type: "paragraph", content: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishData, setPublishData] = useState({
    coverImage: "",
    tags: [] as string[],
    summary: "",
    category: "",
  });
  const [uploading, setUploading] = useState(false);
  const [activeBlockMenu, setActiveBlockMenu] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<{
    blockId: string;
    text: string;
    start: number;
    end: number;
  } | null>(null);
  const [showFormattingToolbar, setShowFormattingToolbar] = useState(false);
  const [formattingToolbarPosition, setFormattingToolbarPosition] = useState({
    x: 0,
    y: 0,
  });
  const [tagInput, setTagInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Convert markdown to blocks
  const markdownToBlocks = useCallback((markdown: string): ContentBlock[] => {
    if (!markdown.trim()) {
      return [{ id: "1", type: "paragraph", content: "" }];
    }

    const lines = markdown.split("\n");
    const result: ContentBlock[] = [];
    let currentParagraph = "";
    let codeBlock = "";
    let inCodeBlock = false;

    lines.forEach((line, index) => {
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          result.push({
            id: `block-${result.length + 1}`,
            type: "code",
            content: codeBlock.trim(),
          });
          codeBlock = "";
          inCodeBlock = false;
        } else {
          if (currentParagraph.trim()) {
            result.push({
              id: `block-${result.length + 1}`,
              type: "paragraph",
              content: currentParagraph.trim(),
            });
            currentParagraph = "";
          }
          inCodeBlock = true;
        }
      } else if (inCodeBlock) {
        codeBlock += line + "\n";
      } else if (line.startsWith("## ")) {
        if (currentParagraph.trim()) {
          result.push({
            id: `block-${result.length + 1}`,
            type: "paragraph",
            content: currentParagraph.trim(),
          });
          currentParagraph = "";
        }
        result.push({
          id: `block-${result.length + 1}`,
          type: "heading",
          content: line.substring(3).trim(),
        });
      } else if (line.startsWith("> ")) {
        if (currentParagraph.trim()) {
          result.push({
            id: `block-${result.length + 1}`,
            type: "paragraph",
            content: currentParagraph.trim(),
          });
          currentParagraph = "";
        }
        result.push({
          id: `block-${result.length + 1}`,
          type: "quote",
          content: line.substring(2).trim(),
        });
      } else if (line.match(/^!\[.*?\]\(.*?\)$/)) {
        // Image markdown
        if (currentParagraph.trim()) {
          result.push({
            id: `block-${result.length + 1}`,
            type: "paragraph",
            content: currentParagraph.trim(),
          });
          currentParagraph = "";
        }
        result.push({
          id: `block-${result.length + 1}`,
          type: "image",
          content: line,
        });
      } else if (line.trim() === "") {
        if (currentParagraph.trim()) {
          result.push({
            id: `block-${result.length + 1}`,
            type: "paragraph",
            content: currentParagraph.trim(),
          });
          currentParagraph = "";
        }
      } else {
        currentParagraph += (currentParagraph ? " " : "") + line;
      }
    });

    if (currentParagraph.trim()) {
      result.push({
        id: `block-${result.length + 1}`,
        type: "paragraph",
        content: currentParagraph.trim(),
      });
    }

    if (result.length === 0) {
      return [{ id: "1", type: "paragraph", content: "" }];
    }

    return result;
  }, []);

  // Convert blocks to markdown content
  const blocksToMarkdown = useCallback((blocks: ContentBlock[]): string => {
    return blocks
      .map((block) => {
        switch (block.type) {
          case "heading":
            return `## ${block.content}`;
          case "quote":
            return `> ${block.content}`;
          case "code":
            return `\`\`\`\n${block.content}\n\`\`\``;
          case "image":
            return block.content; // Already in markdown format
          default:
            return block.content;
        }
      })
      .join("\n\n");
  }, []);

  // Load article if in edit mode
  useEffect(() => {
    if (mode === "edit" && articleId) {
      const loadArticle = async () => {
        try {
          const token = localStorage.getItem("auth_token");
          if (!token) {
            toast.error("Anda harus login terlebih dahulu");
            router.push("/login");
            return;
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080"}/api/v1/articles/${articleId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (response.status === 401) {
            toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
            router.push("/login");
            return;
          }

          if (response.status === 404) {
            toast.error("Artikel tidak ditemukan");
            router.push("/dashboard/taman/berita");
            return;
          }

          if (!response.ok) {
            throw new Error("Failed to load article");
          }

          const data = await response.json();
          setTitle(data.title || "");
          
          // Convert markdown content to blocks
          if (data.content) {
            const loadedBlocks = markdownToBlocks(data.content);
            setBlocks(loadedBlocks.length > 0 ? loadedBlocks : [{ id: "1", type: "paragraph", content: "" }]);
          } else {
            setBlocks([{ id: "1", type: "paragraph", content: "" }]);
          }

          setPublishData({
            coverImage: data.featured_image || "",
            tags: [],
            summary: data.summary || "",
            category: data.category || "",
          });

          setDraftId(data.id ?? articleId ?? null);
        } catch (error) {
          console.error("Error loading article:", error);
          toast.error("Gagal memuat artikel");
          router.push("/dashboard/taman/berita");
        }
      };

      loadArticle();
    }
  }, [mode, articleId, router, markdownToBlocks]);

  // Autosave functionality
  useEffect(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    const markdownContent = blocksToMarkdown(blocks);
    if (title || markdownContent) {
      autosaveTimerRef.current = setTimeout(() => {
        handleAutosave();
      }, 2000);
    }

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [title, blocks, draftId]);

  const handleAutosave = async () => {
    const markdownContent = blocksToMarkdown(blocks);
    if (!title && !markdownContent) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080";
      const isEditing = Boolean(draftId);
      const endpoint = isEditing && draftId ? `${apiBase}/api/v1/articles/${draftId}` : `${apiBase}/api/v1/articles/`;
      const method = isEditing && draftId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title || "Untitled",
          content: markdownContent || "",
          summary: publishData.summary || markdownContent.substring(0, 200) + "...",
          category: publishData.category || "Artikel",
          status: "draft",
        }),
      });

      if (!response.ok) {
        throw new Error("Autosave failed");
      }

      const saved = await response.json();
      const newId = saved?.id ?? saved?.data?.id ?? saved?.article?.id;
      if (!draftId && newId) {
        setDraftId(String(newId));
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
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080"}/api/v1/upload/gallery-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      // Return original URL from backend, don't process it here
      // It will be processed when rendering
      return result.url;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const insertBlock = (afterBlockId: string, type: BlockType, content: string = "") => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content,
    };

    // Set focused block ID immediately to prevent onBlur from clearing it
    setFocusedBlockId(newBlock.id);
    setActiveBlockMenu(null);

    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === afterBlockId);
      if (index === -1) return [...prev, newBlock];
      return [...prev.slice(0, index + 1), newBlock, ...prev.slice(index + 1)];
    });
    
    // Focus on new block after render
    setTimeout(() => {
      const newBlockElement = blockRefs.current[newBlock.id];
      if (newBlockElement) {
        const editable = newBlockElement.querySelector('[contenteditable]') as HTMLElement;
        if (editable) {
          editable.focus();
          // Ensure focusedBlockId is set after focus
          setFocusedBlockId(newBlock.id);
        }
      }
    }, 150);
  };

  const insertImage = async (blockId: string, file?: File) => {
    let fileToUpload = file;
    
    if (!fileToUpload) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e) => {
        const selectedFile = (e.target as HTMLInputElement).files?.[0];
        if (selectedFile) {
          await insertImage(blockId, selectedFile);
        }
      };
      input.click();
      return;
    }

    try {
      setUploading(true);
      const imageUrl = await uploadFile(fileToUpload);
      console.log("Uploaded image URL:", imageUrl);
      
      // Store the original URL from backend in markdown
      const imageMarkdown = `![${fileToUpload.name}](${imageUrl})`;
      console.log("Image markdown:", imageMarkdown);
      
      // Create new block ID first
      const newBlockId = `block-${Date.now()}`;
      
      setBlocks((prev) => {
        const index = prev.findIndex((b) => b.id === blockId);
        if (index === -1) return prev;
        
        // Update current block to image
        const updatedBlocks = [...prev];
        updatedBlocks[index] = { ...updatedBlocks[index], type: "image", content: imageMarkdown };
        
        // Insert new paragraph block after image
        const newBlock: ContentBlock = {
          id: newBlockId,
          type: "paragraph",
          content: "",
        };
        updatedBlocks.splice(index + 1, 0, newBlock);
        
        return updatedBlocks;
      });
      
      setActiveBlockMenu(null);
      setFocusedBlockId(newBlockId);
      
      // Focus on new block after image
      setTimeout(() => {
        const newBlockElement = blockRefs.current[newBlockId];
        if (newBlockElement) {
          const editable = newBlockElement.querySelector('[contenteditable]') as HTMLElement;
          if (editable) {
            editable.focus();
          }
        }
      }, 150);
      
      toast.success("Gambar berhasil diupload");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Gagal mengupload gambar");
    } finally {
      setUploading(false);
    }
  };

  const updateBlockContent = (blockId: string, content: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, content } : block
      )
    );
  };

  const changeBlockType = (blockId: string, newType: BlockType) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, type: newType } : block
      )
    );
    setActiveBlockMenu(null);
  };

  const deleteBlock = (blockId: string) => {
    if (blocks.length === 1) {
      // Don't delete the last block, just clear it
      setBlocks([{ id: "1", type: "paragraph", content: "" }]);
    } else {
      setBlocks((prev) => prev.filter((block) => block.id !== blockId));
    }
    setActiveBlockMenu(null);
  };

  const handleTextSelection = (blockId: string) => {
    const blockElement = blockRefs.current[blockId];
    if (!blockElement) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setSelectedText(null);
      setShowFormattingToolbar(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();

    if (selectedText && range.commonAncestorContainer.parentElement?.closest(`[data-block-id="${blockId}"]`)) {
      const rect = range.getBoundingClientRect();
      setSelectedText({
        blockId,
        text: selectedText,
        start: 0, // Will be calculated if needed
        end: selectedText.length,
      });

      setFormattingToolbarPosition({
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY - 50,
      });
      setShowFormattingToolbar(true);
    } else {
      setSelectedText(null);
      setShowFormattingToolbar(false);
    }
  };

  const applyFormatting = (format: string) => {
    if (!selectedText) return;

    const block = blocks.find((b) => b.id === selectedText.blockId);
    if (!block) return;

    let formattedText = "";

    switch (format) {
      case "bold":
        formattedText = block.content.replace(
          selectedText.text,
          `**${selectedText.text}**`
        );
        break;
      case "italic":
        formattedText = block.content.replace(
          selectedText.text,
          `*${selectedText.text}*`
        );
        break;
      case "quote":
        changeBlockType(selectedText.blockId, "quote");
        return;
      case "heading":
        changeBlockType(selectedText.blockId, "heading");
        return;
      case "link":
        const url = prompt("Masukkan URL:");
        if (url) {
          formattedText = block.content.replace(
            selectedText.text,
            `[${selectedText.text}](${url})`
          );
        } else {
          return;
        }
        break;
      default:
        return;
    }

    updateBlockContent(selectedText.blockId, formattedText);
    setSelectedText(null);
    setShowFormattingToolbar(false);
  };

  const handlePublish = async () => {
    const markdownContent = blocksToMarkdown(blocks);
    if (!title || !markdownContent) {
      toast.error("Judul dan konten wajib diisi");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Anda harus login terlebih dahulu");
        return;
      }

      let finalImageUrl = publishData.coverImage;
      if (publishData.coverImage && !publishData.coverImage.startsWith("http")) {
        finalImageUrl = buildImageUrl(publishData.coverImage);
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080";
      const targetId = draftId || articleId;
      const isEditing = Boolean(targetId);
      const url = isEditing && targetId ? `${apiBase}/api/v1/articles/${targetId}` : `${apiBase}/api/v1/articles/`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content: markdownContent,
          summary: publishData.summary || markdownContent.substring(0, 200) + "...",
          category: publishData.category || "Artikel",
          featured_image: finalImageUrl || null,
          status: "approved",
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal mempublikasikan artikel");
      }

      toast.success("Artikel berhasil dipublikasikan!");
      router.push("/dashboard/taman/berita");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal mempublikasikan artikel");
    } finally {
      setSaving(false);
      setShowPublishModal(false);
    }
  };

  const handleCoverImageUpload = async (file: File) => {
    try {
      const imageUrl = await uploadFile(file);
      setPublishData({ ...publishData, coverImage: imageUrl });
      toast.success("Gambar cover berhasil diupload");
    } catch (error) {
      toast.error("Gagal mengupload gambar cover");
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !publishData.tags.includes(tagInput.trim())) {
      setPublishData({
        ...publishData,
        tags: [...publishData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setPublishData({
      ...publishData,
      tags: publishData.tags.filter((t) => t !== tag),
    });
  };

  const formatLastSaved = () => {
    if (!lastSaved) return "";
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 10) return "Saved just now";
    if (seconds < 60) return `Saved ${seconds}s ago`;
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `Saved ${minutes}m ago`;
    }
    return lastSaved.toLocaleTimeString();
  };

  // Drag and drop handler
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith("image/"));

      if (imageFile) {
        // Insert image block at the end
        const newBlockId = `block-${Date.now()}`;
        await insertImage(newBlockId, imageFile);
      }
    },
    [],
  );

  const handleKeyDown = (blockId: string, e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const block = blocks.find((b) => b.id === blockId);
      if (block) {
        insertBlock(blockId, "paragraph", "");
      }
    } else if (e.key === "Backspace") {
      const block = blocks.find((b) => b.id === blockId);
      const blockElement = blockRefs.current[blockId];
      if (block && blockElement) {
        const editable = blockElement.querySelector('[contenteditable]') as HTMLElement;
        if (editable && editable.textContent === "" && blocks.length > 1) {
          e.preventDefault();
          deleteBlock(blockId);
        }
      }
    }
  };

  const renderBlock = (block: ContentBlock, index: number) => {
    const blockElement = blockRefs.current[block.id];
    const showMenu = activeBlockMenu === block.id;
    const isActiveBlock = focusedBlockId === block.id;
    let menuPosition = { x: 0, y: 0 };

    if (blockElement && showMenu) {
      const rect = blockElement.getBoundingClientRect();
      menuPosition = {
        x: rect.left + window.scrollX - 70,
        y: rect.top + window.scrollY + rect.height / 2,
      };
    }

    return (
      <div
        key={block.id}
        data-block-id={block.id}
        ref={(el) => {
          blockRefs.current[block.id] = el;
        }}
        className="group relative flex items-start py-3 pl-12"
        onMouseEnter={() => {
          // Show + button on hover
        }}
        onMouseLeave={() => {
          if (showMenu) {
            // Keep menu open if hovering over it
            setTimeout(() => {
              if (activeBlockMenu === block.id) {
                // Menu still active, don't close
              }
            }, 100);
          }
        }}
      >
        {/* + Button */}
        <button
          onClick={() => {
            setActiveBlockMenu(activeBlockMenu === block.id ? null : block.id);
          }}
          className={`absolute left-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#1a8917] text-[#1a8917] transition-all duration-200 hover:bg-[#1a8917] hover:text-white ${
            isActiveBlock || activeBlockMenu === block.id
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 -translate-x-2 pointer-events-none"
          }`}
        >
          <Plus className="h-4 w-4" />
        </button>

        {/* Block Content */}
        <div className="flex-1">
          {block.type === "image" ? (
            <div className="group/image relative my-4">
              {block.content.match(/!\[(.*?)\]\((.*?)\)/) ? (
                (() => {
                  const urlMatch = block.content.match(/!\[.*?\]\((.*?)\)/);
                  const imageUrl = urlMatch?.[1] || "";
                  const processedUrl = buildImageUrl(imageUrl);
                  console.log("Rendering image - Original URL:", imageUrl, "Processed URL:", processedUrl);
                  return (
                    <>
                      <img
                        src={processedUrl}
                        alt={block.content.match(/!\[(.*?)\]/)?.[1] || ""}
                        className="w-full h-auto rounded-lg"
                        onError={(e) => {
                          console.error("Image load error:", processedUrl);
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      {/* Delete button */}
                      <button
                        onClick={() => {
                          // Convert image block to paragraph block
                          setBlocks((prev) =>
                            prev.map((b) =>
                              b.id === block.id
                                ? { ...b, type: "paragraph", content: "" }
                                : b
                            )
                          );
                        }}
                        className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity hover:bg-black/90 group-hover/image:opacity-100"
                        title="Hapus gambar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  );
                })()
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500">Image block</p>
                </div>
              )}
              {/* Invisible contentEditable below image for keyboard navigation */}
              <div
                contentEditable
                suppressContentEditableWarning
                onFocus={() => {
                  setFocusedBlockId(block.id);
                }}
                onBlur={(e) => {
                  // Clear content when blur if empty
                  if (!e.currentTarget.textContent?.trim()) {
                    e.currentTarget.textContent = "";
                  }
                }}
                onInput={(e) => {
                  const target = e.currentTarget;
                  if (!target) return;
                  
                  const text = target.textContent || "";
                  if (text.trim()) {
                    // If user types, create new paragraph block after image with the content
                    setBlocks((prev) => {
                      const index = prev.findIndex((b) => b.id === block.id);
                      if (index === -1) return prev;
                      
                      const updatedBlocks = [...prev];
                      // Check if there's already a paragraph block after this image
                      const nextBlock = updatedBlocks[index + 1];
                      if (nextBlock && nextBlock.type === "paragraph" && !nextBlock.content.trim()) {
                        // Update existing empty paragraph block
                        updatedBlocks[index + 1] = {
                          ...nextBlock,
                          content: text,
                        };
                      } else {
                        // Insert new paragraph block
                        const newBlock: ContentBlock = {
                          id: `block-${Date.now()}`,
                          type: "paragraph",
                          content: text,
                        };
                        updatedBlocks.splice(index + 1, 0, newBlock);
                      }
                      return updatedBlocks;
                    });
                    
                    // Clear the contentEditable after state update
                    requestAnimationFrame(() => {
                      if (target && target.isConnected) {
                        target.textContent = "";
                      }
                    });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    insertBlock(block.id, "paragraph", "");
                  } else if (e.key === "Backspace" && !e.currentTarget.textContent) {
                    e.preventDefault();
                    // Convert image block to paragraph
                    setBlocks((prev) =>
                      prev.map((b) =>
                        b.id === block.id
                          ? { ...b, type: "paragraph", content: "" }
                          : b
                      )
                    );
                  }
                }}
                className="outline-none text-[#222] mt-2"
                style={{
                  fontFamily: "'Lora', 'Inter', serif",
                  fontSize: "18px",
                  lineHeight: "1.8",
                  minHeight: "1.8em",
                }}
                data-placeholder="Tell your story..."
              />
            </div>
          ) : (
            <div
              ref={(el) => {
                if (el && el.textContent !== block.content) {
                  el.textContent = block.content;
                }
              }}
              contentEditable
              suppressContentEditableWarning
              onFocus={() => {
                setFocusedBlockId(block.id);
              }}
              onBlur={(e) => {
                // Ensure empty blocks are truly empty for placeholder CSS
                if (!e.currentTarget.textContent?.trim()) {
                  e.currentTarget.textContent = "";
                }
                // Only clear focused block if focus is not moving to another block
                // Use longer timeout to allow focus to move to new block
                setTimeout(() => {
                  const activeElement = document.activeElement;
                  const isFocusInBlock = activeElement?.closest(`[data-block-id]`);
                  if (!isFocusInBlock) {
                    // Only clear if focus is truly lost (not moving to another block)
                    setFocusedBlockId(null);
                  } else {
                    // Focus moved to another block, update focusedBlockId
                    const newBlockId = isFocusInBlock.getAttribute('data-block-id');
                    if (newBlockId) {
                      setFocusedBlockId(newBlockId);
                    }
                  }
                }, 200);
              }}
              onInput={(e) => {
                const text = e.currentTarget.textContent || "";
                updateBlockContent(block.id, text);
              }}
              onSelect={() => handleTextSelection(block.id)}
              onKeyDown={(e) => handleKeyDown(block.id, e)}
              className={`outline-none ${
                block.type === "heading"
                  ? "text-2xl font-bold"
                  : block.type === "quote"
                    ? "border-l-4 border-gray-300 pl-4 italic"
                    : block.type === "code"
                      ? "font-mono bg-gray-100 p-4 rounded"
                      : ""
              }`}
              style={{
                fontFamily:
                  block.type === "code"
                    ? "monospace"
                    : "'Lora', 'Inter', serif",
                fontSize: block.type === "heading" ? "24px" : "18px",
                lineHeight: "1.8",
                color: "#222",
                minHeight: "1.8em",
              }}
              data-placeholder={
                block.type === "paragraph" && !block.content.trim()
                  ? "Tell your story..."
                  : block.type === "heading" && !block.content.trim()
                    ? "Heading"
                    : ""
              }
            />
          )}
        </div>

        {/* Media Menu */}
        {showMenu && (
          <div
            className="fixed z-20 flex flex-col gap-2 rounded-full border border-[#1a8917] bg-white p-2 shadow-lg"
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
              transform: "translateY(-50%)",
            }}
            onMouseEnter={() => setActiveBlockMenu(block.id)}
            onMouseLeave={() => {
              setTimeout(() => {
                if (activeBlockMenu === block.id) {
                  setActiveBlockMenu(null);
                }
              }, 200);
            }}
          >
            <button
              onClick={() => insertImage(block.id)}
              disabled={uploading}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1a8917] text-[#1a8917] hover:bg-[#1a8917] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Image"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImageIcon className="h-5 w-5" />
              )}
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-400 cursor-not-allowed"
              title="Video (Coming soon)"
              disabled
            >
              <Video className="h-5 w-5" />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-400 cursor-not-allowed"
              title="Embed (Coming soon)"
              disabled
            >
              <LinkIcon className="h-5 w-5" />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-400 cursor-not-allowed"
              title="Code (Coming soon)"
              disabled
            >
              <Code className="h-5 w-5" />
            </button>
            <div className="my-1 h-px bg-gray-300"></div>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-400 cursor-not-allowed"
              title="More (Coming soon)"
              disabled
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <div
              className="font-serif text-xl font-bold text-black"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Taman Kehati
            </div>

            {/* Center: Draft Status */}
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-500">
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </span>
                ) : lastSaved ? (
                  `Draft in ${user?.nama || "User"} — ${formatLastSaved()}`
                ) : (
                  `Draft in ${user?.nama || "User"} — Not saved`
                )}
              </p>
            </div>

            {/* Right: Publish Button */}
            <Button
              onClick={() => setShowPublishModal(true)}
              className="rounded-full bg-[#00ab6c] px-6 py-2 text-white font-medium hover:bg-[#008f56] transition-colors"
              disabled={saving}
            >
              Publish
            </Button>
          </div>
        </div>
      </header>

      {/* Main Editor Area */}
      <main
        ref={editorContainerRef}
        className="medium-article-editor mx-auto max-w-[700px] px-6 py-12"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag Overlay */}
        {isDragging && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="rounded-xl bg-white p-8 shadow-2xl border-2 border-dashed border-[#00ab6c]">
              <Upload className="mx-auto h-12 w-12 text-[#00ab6c] mb-4" />
              <p className="text-lg font-medium text-gray-900">
                Drop image here to upload
              </p>
            </div>
          </div>
        )}

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title..."
          className="mb-8 w-full border-0 bg-transparent text-[42px] leading-tight text-[#222] placeholder:text-gray-400 focus:outline-none"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 400,
          }}
        />

        {/* Block Editor */}
        <div className="space-y-4">
          {blocks.map((block, index) => renderBlock(block, index))}
        </div>

        {/* Formatting Toolbar */}
        {showFormattingToolbar && selectedText && (
          <div
            className="fixed z-30 flex gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
            style={{
              left: `${formattingToolbarPosition.x}px`,
              top: `${formattingToolbarPosition.y}px`,
              transform: "translateX(-50%)",
            }}
          >
            <button
              onClick={() => applyFormatting("bold")}
              className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 transition-colors"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => applyFormatting("italic")}
              className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 transition-colors"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              onClick={() => applyFormatting("quote")}
              className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 transition-colors"
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </button>
            <button
              onClick={() => applyFormatting("heading")}
              className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 transition-colors"
              title="Heading"
            >
              <Heading1 className="h-4 w-4" />
            </button>
            <button
              onClick={() => applyFormatting("link")}
              className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 transition-colors"
              title="Link"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>

      {/* Publish Modal */}
      <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
        <DialogContent className="max-w-2xl rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#222]">
              Publish Article
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Cover Image */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#222]">
                Cover Image
              </label>
              {publishData.coverImage ? (
                <div className="relative group">
                  <img
                    src={buildImageUrl(publishData.coverImage)}
                    alt="Cover"
                    className="h-48 w-full rounded-lg object-cover"
                  />
                  <button
                    onClick={() =>
                      setPublishData({ ...publishData, coverImage: "" })
                    }
                    className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-[#E5E7EB] p-8 hover:border-[#00ab6c] transition-colors">
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
                      className="border-[#E5E7EB] hover:border-[#00ab6c]"
                    >
                      Upload Cover Image
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#222]">
                Category
              </label>
              <select
                value={publishData.category}
                onChange={(e) =>
                  setPublishData({ ...publishData, category: e.target.value })
                }
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2 focus:border-[#00ab6c] focus:outline-none focus:ring-2 focus:ring-[#00ab6c]/20 transition-all"
              >
                <option value="">Select category</option>
                <option value="Konservasi">Konservasi</option>
                <option value="Penelitian">Penelitian</option>
                <option value="Edukasi">Edukasi</option>
                <option value="Berita">Berita</option>
                <option value="Laporan Lapangan">Laporan Lapangan</option>
                <option value="Kebijakan">Kebijakan</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#222]">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 rounded-lg border border-[#E5E7EB] p-2 focus-within:border-[#00ab6c] transition-colors">
                {publishData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-gray-500 hover:text-gray-700 transition-colors"
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
                  placeholder="Add tag..."
                  className="flex-1 border-0 bg-transparent focus:outline-none text-[#222] placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#222]">
                Summary
              </label>
              <Textarea
                value={publishData.summary}
                onChange={(e) =>
                  setPublishData({ ...publishData, summary: e.target.value })
                }
                placeholder="Write a brief summary of your article..."
                rows={4}
                className="resize-none border-[#E5E7EB] focus:border-[#00ab6c] focus:ring-2 focus:ring-[#00ab6c]/20"
              />
            </div>

            {/* Publish Button */}
            <Button
              onClick={handlePublish}
              disabled={saving || !title || blocksToMarkdown(blocks).trim() === ""}
              className="w-full rounded-lg bg-[#00ab6c] py-3 font-bold text-white hover:bg-[#008f56] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing...
                </span>
              ) : (
                "Publish Article"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

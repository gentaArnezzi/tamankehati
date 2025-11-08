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
  const [blocks, setBlocks] = useState<ContentBlock[]>([
    { id: "1", type: "paragraph", content: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null); // Store draft ID for autosave
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

  // Helper function to get first text node
  const getFirstTextNode = useCallback((node: Node | HTMLElement): Text | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node as Text;
    }
    for (let i = 0; i < node.childNodes.length; i++) {
      const textNode = getFirstTextNode(node.childNodes[i]);
      if (textNode) return textNode;
    }
    return null;
  }, []);

  // Helper function to get last text node
  const getLastTextNode = useCallback((node: Node | HTMLElement): Text | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node as Text;
    }
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      const textNode = getLastTextNode(node.childNodes[i]);
      if (textNode) return textNode;
    }
    return null;
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
          
          // Set draftId for autosave in edit mode
          if (data.id) {
            setDraftId(String(data.id));
          }
          
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
        } catch (error) {
          console.error("Error loading article:", error);
          toast.error("Gagal memuat artikel");
          router.push("/dashboard/taman/berita");
        }
      };

      loadArticle();
    }
  }, [mode, articleId, router, markdownToBlocks]);

  // Natural cross-block selection handler
  // Helps browser select across blocks naturally
  useEffect(() => {
    const editorContainer = editorContainerRef.current;
    if (!editorContainer) return;

    let isMouseDown = false;
    let startRange: Range | null = null;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const contentEditable = target.closest('[contenteditable="true"]');
      
      if (contentEditable && editorContainer.contains(contentEditable as Node)) {
        isMouseDown = true;
        // Get initial selection point immediately
        const range = document.caretRangeFromPoint?.(e.clientX, e.clientY);
        if (range) {
          startRange = range.cloneRange();
        } else {
          // Fallback: wait for browser to set selection
          setTimeout(() => {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              startRange = selection.getRangeAt(0).cloneRange();
            }
          }, 0);
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown || !startRange) return;

      const selection = window.getSelection();
      if (!selection) return;

      // Get current mouse position
      let range: Range | null = null;
      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(e.clientX, e.clientY);
      }

      if (!range) return;

      // Check if we're in a contentEditable
      const currentEditable = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
        ? range.commonAncestorContainer.parentElement?.closest('[contenteditable="true"]')
        : (range.commonAncestorContainer as HTMLElement).closest('[contenteditable="true"]');

      if (!currentEditable || !editorContainer.contains(currentEditable as Node)) return;

      // Check if selection spans multiple blocks
      const startBlock = startRange.startContainer.nodeType === Node.TEXT_NODE
        ? startRange.startContainer.parentElement?.closest('[data-block-id]')
        : (startRange.startContainer as HTMLElement).closest('[data-block-id]');
      const endBlock = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
        ? range.commonAncestorContainer.parentElement?.closest('[data-block-id]')
        : (range.commonAncestorContainer as HTMLElement).closest('[data-block-id]');

      // Only help if selection spans multiple blocks
      if (startBlock && endBlock && startBlock !== endBlock) {
        try {
          const newRange = document.createRange();
          
          // Set start point
          newRange.setStart(startRange.startContainer, startRange.startOffset);
          
          // Set end point based on mouse position
          // Try to get the actual text node and offset
          let endNode = range.startContainer;
          let endOffset = range.startOffset;
          
          // If we're at a text node, use it directly
          if (endNode.nodeType === Node.TEXT_NODE) {
            newRange.setEnd(endNode, endOffset);
          } else {
            // Try to find the text node
            const textNode = getFirstTextNode(endNode as HTMLElement);
            if (textNode) {
              newRange.setEnd(textNode, Math.min(endOffset, textNode.textContent?.length || 0));
            } else {
              newRange.setEnd(endNode, endOffset);
            }
          }
          
          selection.removeAllRanges();
          selection.addRange(newRange);
        } catch (error) {
          // Ignore range errors - browser will handle it
        }
      } else if (startBlock === endBlock) {
        // Selection is within a single block - let browser handle it naturally
        // Don't interfere
      }
    };

    const handleMouseUp = () => {
      isMouseDown = false;
      startRange = null;
    };

    editorContainer.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      editorContainer.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [blocks]);

  // Global keyboard handler for select all
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Handle Ctrl+A / Cmd+A to select all text across all blocks
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        const editorContainer = editorContainerRef.current;
        if (!editorContainer) return;
        
        // Check if focus is within the editor
        const activeElement = document.activeElement;
        const isInEditor = editorContainer.contains(activeElement);
        if (!isInEditor) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        // Get all contentEditable elements within the editor container (excluding image blocks)
        const allEditables = Array.from(
          editorContainer.querySelectorAll('[contenteditable="true"]')
        ).filter((el) => {
          const block = (el as HTMLElement).closest('[data-block-id]');
          const blockId = block?.getAttribute('data-block-id');
          if (!blockId) return false;
          const blockData = blocks.find((b) => b.id === blockId);
          return blockData && blockData.type !== "image";
        }) as HTMLElement[];
        
        if (allEditables.length === 0) return;
        
        // Create a range that spans all blocks
        const selection = window.getSelection();
        if (!selection) return;
        
        const range = document.createRange();
        
        try {
          // Set start to the first character of the first block
          const firstEditable = allEditables[0];
          const firstTextNode = getFirstTextNode(firstEditable);
          if (firstTextNode) {
            range.setStart(firstTextNode, 0);
          } else {
            range.setStart(firstEditable, 0);
          }
          
          // Set end to the last character of the last block
          const lastEditable = allEditables[allEditables.length - 1];
          const lastTextNode = getLastTextNode(lastEditable);
          if (lastTextNode) {
            range.setEnd(lastTextNode, lastTextNode.textContent?.length || 0);
          } else {
            range.setEnd(lastEditable, lastEditable.childNodes.length);
          }
          
          // Select the range
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (error) {
          console.debug("Error selecting all:", error);
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [getFirstTextNode, getLastTextNode, blocks]);

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
  }, [title, blocks]);

  const handleAutosave = async () => {
    const markdownContent = blocksToMarkdown(blocks);
    if (!title && !markdownContent) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      // Determine URL and method based on mode and draftId
      let url: string;
      let method: string;
      
      if (mode === "edit" && articleId) {
        // Edit mode: always use PUT with articleId
        url = `${process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080"}/api/v1/articles/${articleId}`;
        method = "PUT";
      } else if (draftId) {
        // Create mode with existing draft: use PUT to update
        url = `${process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080"}/api/v1/articles/${draftId}`;
        method = "PUT";
      } else {
        // Create mode without draft: use POST to create new draft
        url = `${process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080"}/api/v1/articles/`;
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
          content: markdownContent || "",
          summary: publishData.summary || markdownContent.substring(0, 200) + "...",
          category: publishData.category || "Artikel",
          status: "draft",
        }),
      });

      if (!response.ok) {
        throw new Error("Autosave failed");
      }

      // If this was a POST (new draft), save the ID for future updates
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

      // Use draftId if available, otherwise use articleId for edit mode
      const idToUse = draftId || (mode === "edit" && articleId ? articleId : null);
      
      const url = idToUse
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080"}/api/v1/articles/${idToUse}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080"}/api/v1/articles/`;

      const method = idToUse ? "PUT" : "POST";

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
    // Handle delete/backspace when there's a selection (single or cross-block)
    if ((e.key === "Delete" || e.key === "Backspace") && !e.shiftKey) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        // There's a selection, check if it spans multiple blocks
        const range = selection.getRangeAt(0);
        const editorContainer = editorContainerRef.current;
        if (!editorContainer) return;
        
        // Check if selection spans multiple blocks
        const startBlock = range.startContainer.nodeType === Node.TEXT_NODE
          ? range.startContainer.parentElement?.closest('[data-block-id]')
          : (range.startContainer as HTMLElement).closest('[data-block-id]');
        const endBlock = range.endContainer.nodeType === Node.TEXT_NODE
          ? range.endContainer.parentElement?.closest('[data-block-id]')
          : (range.endContainer as HTMLElement).closest('[data-block-id]');
        
        if (startBlock && endBlock) {
          const startBlockId = startBlock.getAttribute('data-block-id');
          const endBlockId = endBlock.getAttribute('data-block-id');
          
          if (!startBlockId || !endBlockId) return;
          
          // Check if blocks are image blocks (skip them)
          const startBlockData = blocks.find(b => b.id === startBlockId);
          const endBlockData = blocks.find(b => b.id === endBlockId);
          
          if (startBlockData?.type === "image" || endBlockData?.type === "image") {
            // Don't delete image blocks via text selection
            return;
          }
          
          if (startBlock !== endBlock) {
            // Selection spans multiple blocks - delete all selected content
            e.preventDefault();
            e.stopPropagation();
            
            // Find indices of start and end blocks
            const startIndex = blocks.findIndex(b => b.id === startBlockId);
            const endIndex = blocks.findIndex(b => b.id === endBlockId);
            
            if (startIndex === -1 || endIndex === -1) return;
            
            // Get the text content from each block in the selection
            const blocksToUpdate: { id: string; newContent: string }[] = [];
            
            // Update start block - remove text from selection start to end
            const startEditable = startBlock.querySelector('[contenteditable="true"]') as HTMLElement;
            if (startEditable) {
              const startText = startEditable.textContent || "";
              const startOffset = range.startOffset;
              const newStartContent = startText.substring(0, startOffset);
              blocksToUpdate.push({ id: startBlockId, newContent: newStartContent });
            }
            
            // Update end block - remove text from start to selection end
            const endEditable = endBlock.querySelector('[contenteditable="true"]') as HTMLElement;
            if (endEditable) {
              const endText = endEditable.textContent || "";
              const endOffset = range.endOffset;
              const newEndContent = endText.substring(endOffset);
              blocksToUpdate.push({ id: endBlockId, newContent: newEndContent });
            }
            
            // Delete all blocks between start and end
            const blocksToDelete = blocks.slice(
              Math.min(startIndex, endIndex) + 1,
              Math.max(startIndex, endIndex)
            ).filter(b => b.type !== "image").map(b => b.id);
            
            // Update blocks
            setBlocks((prev) => {
              let updated = [...prev];
              
              // Update start and end blocks
              blocksToUpdate.forEach(({ id, newContent }) => {
                const index = updated.findIndex(b => b.id === id);
                if (index !== -1) {
                  updated[index] = { ...updated[index], content: newContent };
                }
              });
              
              // Delete blocks in between (but keep image blocks)
              updated = updated.filter(b => !blocksToDelete.includes(b.id));
              
              // If all blocks are empty, ensure at least one empty block
              if (updated.length === 0 || updated.every(b => !b.content.trim() && b.type === "paragraph")) {
                return [{ id: "1", type: "paragraph", content: "" }];
              }
              
              return updated;
            });
            
            // Clear selection and focus on the start block
            selection.removeAllRanges();
            setTimeout(() => {
              const startBlockElement = blockRefs.current[startBlockId];
              if (startBlockElement) {
                const editable = startBlockElement.querySelector('[contenteditable="true"]') as HTMLElement;
                if (editable) {
                  editable.focus();
                  // Move cursor to start of selection
                  const newRange = document.createRange();
                  newRange.setStart(editable, 0);
                  newRange.collapse(true);
                  const sel = window.getSelection();
                  if (sel) {
                    sel.removeAllRanges();
                    sel.addRange(newRange);
                  }
                }
              }
            }, 0);
            
            return;
          } else {
            // Selection is within a single block - let browser handle it normally
            // But we'll update the block content after deletion
            const editable = startBlock.querySelector('[contenteditable="true"]') as HTMLElement;
            if (editable) {
              // Let browser delete the selection first
              setTimeout(() => {
                const newContent = editable.textContent || "";
                updateBlockContent(startBlockId, newContent);
              }, 0);
            }
          }
        }
      }
    }
    
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
        className="group relative flex items-start gap-4 py-0"
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
        {/* + Button - Only show when block is focused or menu is active */}
        <button
          onClick={() => {
            setActiveBlockMenu(activeBlockMenu === block.id ? null : block.id);
          }}
          className={`mt-2 flex h-8 w-8 items-center justify-center rounded-full border border-[#1a8917] text-[#1a8917] transition-opacity hover:bg-[#1a8917] hover:text-white ${
            activeBlockMenu === block.id || focusedBlockId === block.id
              ? "opacity-100"
              : "opacity-0"
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
                        className="max-w-full h-auto rounded-lg object-contain mx-auto"
                        style={{
                          maxHeight: "600px",
                          width: "auto",
                        }}
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
              {/* Alt text input for image */}
              <input
                type="text"
                value={block.content.match(/!\[(.*?)\]/)?.[1] || ""}
                onChange={(e) => {
                  const altText = e.target.value;
                  const urlMatch = block.content.match(/!\[.*?\]\((.*?)\)/);
                  const imageUrl = urlMatch?.[1] || "";
                  const newContent = `![${altText}](${imageUrl})`;
                  updateBlockContent(block.id, newContent);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    insertBlock(block.id, "paragraph", "");
                  }
                }}
                placeholder="Alt text untuk gambar..."
                className="w-full mt-2 px-2 py-1 text-sm text-gray-600 border border-transparent rounded hover:border-gray-200 focus:border-gray-300 focus:outline-none"
                style={{
                  fontFamily: "'Lora', 'Inter', serif",
                  fontSize: "14px",
                }}
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
              onKeyDown={(e) => {
                // Handle delete/backspace for cross-block selection first
                if ((e.key === "Delete" || e.key === "Backspace") && !e.shiftKey) {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                    // Let the global handler deal with it
                    handleKeyDown(block.id, e);
                    return;
                  }
                }
                handleKeyDown(block.id, e);
              }}
              className={`outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 ${
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
                outline: "none",
                border: "none",
                boxShadow: "none",
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
        className="mx-auto max-w-[700px] px-6 py-12"
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
        <div className="space-y-2">
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

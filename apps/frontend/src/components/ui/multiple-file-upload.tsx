import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./button";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";
import { cn } from "./utils";

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

interface MultipleFileUploadProps {
  onFilesSelect: (files: File[]) => void;
  onFileRemove: (fileId: string) => void;
  selectedFiles: FileWithPreview[];
  className?: string;
  maxSize?: number; // in MB
  maxFiles?: number; // maximum number of files
  acceptedTypes?: string[];
}

export function MultipleFileUpload({
  onFilesSelect,
  onFileRemove,
  selectedFiles,
  className,
  maxSize = 10,
  maxFiles = 10,
  acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
}: MultipleFileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        // Check if adding these files would exceed maxFiles
        const totalFiles = selectedFiles.length + acceptedFiles.length;
        if (totalFiles > maxFiles) {
          alert(
            `Maksimal ${maxFiles} file. Anda sudah memilih ${selectedFiles.length} file.`,
          );
          return;
        }

        onFilesSelect(acceptedFiles);
      }
    },
    [onFilesSelect, selectedFiles.length, maxFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": acceptedTypes,
    },
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple: true,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const handleRemove = (fileId: string) => {
    onFileRemove(fileId);
  };

  const handleAddMore = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = acceptedTypes.join(",");
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        const totalFiles = selectedFiles.length + files.length;
        if (totalFiles > maxFiles) {
          alert(
            `Maksimal ${maxFiles} file. Anda sudah memilih ${selectedFiles.length} file.`,
          );
          return;
        }
        onFilesSelect(files);
      }
    };
    input.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {selectedFiles.length === 0 ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive || dragActive
              ? "border-emerald-500 bg-emerald-50"
              : "border-gray-300 hover:border-gray-400",
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Upload Gambar
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Drag & drop gambar di sini, atau klik untuk memilih file
          </p>
          <Button type="button" variant="outline" size="sm">
            Pilih File
          </Button>
          <p className="text-xs text-gray-400 mt-2">
            Maksimal {maxFiles} file, {maxSize}MB per file. Format: JPG, PNG,
            GIF, WebP
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Selected Files Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedFiles.map((fileWithPreview) => (
              <div key={fileWithPreview.id} className="relative group">
                <div className="border rounded-lg p-2 bg-gray-50">
                  <div className="aspect-square relative">
                    <img
                      src={fileWithPreview.preview}
                      alt={fileWithPreview.file.name}
                      className="h-full w-full object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(fileWithPreview.id)}
                      className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="mt-2">
                    <p
                      className="text-xs font-medium text-gray-900 truncate"
                      title={fileWithPreview.file.name}
                    >
                      {fileWithPreview.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(fileWithPreview.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add More Button */}
          {selectedFiles.length < maxFiles && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMore}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Gambar ({selectedFiles.length}/{maxFiles})
              </Button>
            </div>
          )}

          {/* Upload Area for Additional Files */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
              isDragActive || dragActive
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-300 hover:border-gray-400",
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              Tambah Gambar Lainnya
            </p>
            <p className="text-xs text-gray-500">
              Drag & drop atau klik untuk menambah gambar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

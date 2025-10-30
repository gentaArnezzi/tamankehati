import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "./utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  previewUrl?: string;
  className?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  previewUrl,
  className,
  maxSize = 10,
  acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": acceptedTypes.filter((type) => type.startsWith("image/")),
      ...acceptedTypes
        .filter((type) => type.startsWith("."))
        .reduce(
          (acc, ext) => {
            acc[ext] = [];
            return acc;
          },
          {} as Record<string, string[]>,
        ),
    },
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const handleRemove = () => {
    onFileRemove();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {!selectedFile && !previewUrl ? (
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
            Maksimal {maxSize}MB. Format: JPG, PNG, GIF, WebP
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {selectedFile ? (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="h-16 w-16 object-cover rounded"
                  />
                ) : previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-16 w-16 object-cover rounded"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile?.name || "Gambar terpilih"}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedFile
                    ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                    : "File dari server"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = acceptedTypes
                  .filter((type) => type.startsWith("image/"))
                  .join(",");
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) onFileSelect(file);
                };
                input.click();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Ganti Gambar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

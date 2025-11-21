"use client";

import { useState, useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { uploadFile } from "@/modules/creative/application/actions";
import { 
  UploadCloud, 
  X, 
  Image as ImageIcon, 
  FileCheck2, 
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import Image from "next/image";

export interface UploadedImage {
  url: string;
  filename: string;
  size: number;
  type: string;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  placeholder?: string;
  className?: string;
}

export function ImageUpload({
  images,
  onImagesChange,
  multiple = false,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024,
  placeholder = "Arraste e solte arquivos aqui",
  className,
}: ImageUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    setUploadProgress({});

    const uploadPromises = acceptedFiles.map(async (file) => {
      const tempId = `${file.name}-${file.lastModified}`;
      
      try {
        setUploadProgress(prev => ({ ...prev, [tempId]: 0 }));

        const formData = new FormData();
        formData.append("file", file);

        const uploadedImageObject = await uploadFile(formData);

        setUploadProgress(prev => ({ ...prev, [tempId]: 50 }));
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress(prev => ({ ...prev, [tempId]: 100 }));
        
        return uploadedImageObject;
      } catch (error: any) {
        toast.error(`Falha no upload: ${file.name}`, {
          description: error.message,
        });
        setUploadProgress(prev => ({ ...prev, [tempId]: -1 }));
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const newImages = results.filter((img): img is UploadedImage => img !== null);
    
    if (newImages.length > 0) {
      if (multiple) {
        onImagesChange([...images, ...newImages]);
      } else {
        onImagesChange(newImages);
      }
    }
    
    setIsUploading(false);
  }, [images, multiple, onImagesChange]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          toast.error(`Erro: ${file.name}`, {
            description: error.message,
          });
        });
      });
      return;
    }
    
    handleUpload(acceptedFiles);
  }, [handleUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.webp', '.jpg'] },
    maxSize,
    maxFiles: multiple ? maxFiles : 1,
    multiple,
    disabled: isUploading,
  });

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };
  
  const imagePreviews = useMemo(() => (
    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <div key={index} className="relative group rounded-lg overflow-hidden border border-brand-gray-700 aspect-square">
          <img
            src={image.url}
            alt={image.filename}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="btn-ghost text-red-400 h-8 w-8 p-0"
              disabled={isUploading}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
            <p className="text-white text-xs font-medium truncate">{image.filename}</p>
            <p className="text-brand-gray-400 text-xs">
              {(image.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
      ))}
    </div>
  ), [images, isUploading, handleRemoveImage]);
  
  const uploadProgressIndicator = useMemo(() => (
    <div className="mt-4 space-y-2">
      {Object.entries(uploadProgress).map(([filename, progress]) => (
        <div key={filename} className="p-2 bg-brand-gray-800 rounded-lg">
          <div className="flex items-center justify-between text-sm mb-1">
            <p className="text-white truncate max-w-[200px]">{filename}</p>
            {progress === 100 && <FileCheck2 className="w-4 h-4 text-green-400" />}
            {progress === -1 && <AlertTriangle className="w-4 h-4 text-red-400" />}
            {progress > 0 && progress < 100 && <span className="text-brand-gray-400">{progress}%</span>}
          </div>
          {progress > 0 && progress < 101 && <Progress value={progress} className="h-1" />}
        </div>
      ))}
    </div>
  ), [uploadProgress]);

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "w-full p-6 border-2 border-dashed rounded-lg cursor-pointer text-center transition-colors duration-200",
          "border-brand-gray-600 hover:border-brand-neon-green/50 hover:bg-brand-gray-800/20",
          isDragActive && "border-brand-neon-green bg-brand-gray-800/50",
          isUploading && "cursor-not-allowed opacity-70"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-brand-neon-green animate-spin" />
              <p className="text-brand-gray-400">Enviando arquivos...</p>
            </>
          ) : (
            <>
              <UploadCloud className="w-8 h-8 text-brand-gray-500" />
              <p className="text-brand-gray-400">{placeholder}</p>
              <p className="text-xs text-brand-gray-500">
                {multiple ? `Até ${maxFiles} imagens, ` : '1 imagem, '}
                máx {(maxSize / 1024 / 1024).toFixed(0)}MB por arquivo.
              </p>
            </>
          )}
        </div>
      </div>
      
      {isUploading && Object.keys(uploadProgress).length > 0 && uploadProgressIndicator}
      {images.length > 0 && imagePreviews}
    </div>
  );
} 
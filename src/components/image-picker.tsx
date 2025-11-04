'use client';

import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

type ImagePickerContextValue = {
  image: string | null;
  isUploading: boolean;
  disabled: boolean;
  openFileDialog: () => void;
  removeImage: () => void;
};

const ImagePickerContext = createContext<ImagePickerContextValue | null>(null);

const useImagePickerContext = () => {
  const context = useContext(ImagePickerContext);

  if (!context) {
    throw new Error("ImagePicker components must be used within <ImagePicker>");
  }

  return context;
};

export interface ImagePickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
  accept?: string;
  uploadEndpoint?: string;
  children?: React.ReactNode;
}

const ImagePickerRoot = ({
  value,
  onChange,
  disabled = false,
  onUploadingChange,
  accept = "image/*",
  uploadEndpoint = "/api/upload",
  children,
}: ImagePickerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const setUploadingState = useCallback(
    (nextState: boolean) => {
      setIsUploading(nextState);
      onUploadingChange?.(nextState);
    },
    [onUploadingChange],
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        setUploadingState(true);
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(uploadEndpoint, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Upload failed");
        }

        if (!data.secure_url) {
          throw new Error("Upload response is missing secure_url");
        }

        onChange(data.secure_url);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Image upload failed. Please try again.");
      } finally {
        setUploadingState(false);
      }
    },
    [onChange, setUploadingState, uploadEndpoint],
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (file) {
        await handleFileUpload(file);
      }

      // Allow selecting the same file again.
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFileUpload],
  );

  const openFileDialog = useCallback(() => {
    if (disabled || isUploading) {
      return;
    }

    fileInputRef.current?.click();
  }, [disabled, isUploading]);

  const removeImage = useCallback(() => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onChange]);

  const contextValue = useMemo<ImagePickerContextValue>(
    () => ({
      image: value,
      isUploading,
      disabled,
      openFileDialog,
      removeImage,
    }),
    [value, isUploading, disabled, openFileDialog, removeImage],
  );

  return (
    <ImagePickerContext.Provider value={contextValue}>
      <input
        ref={fileInputRef}
        type="file"
        hidden
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
      {children}
    </ImagePickerContext.Provider>
  );
};

type ImagePickerTriggerProps = ButtonProps & {
  spinnerClassName?: string;
  iconClassName?: string;
};

const ImagePickerTrigger = React.forwardRef<
  HTMLButtonElement,
  ImagePickerTriggerProps
>(({ children, onClick, disabled, spinnerClassName, iconClassName, ...props }, ref) => {
  const { openFileDialog, isUploading, disabled: contextDisabled } =
    useImagePickerContext();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        openFileDialog();
      }
    },
    [onClick, openFileDialog],
  );

  const isDisabled = disabled || contextDisabled || isUploading;

  return (
    <Button
      type="button"
      ref={ref}
      onClick={handleClick}
      disabled={isDisabled}
      {...props}
    >
      {isUploading ? (
        <Loader2 className={cn("h-4 w-4 animate-spin", spinnerClassName)} />
      ) : (
        children ?? (
          <ImageIcon className={cn("h-4 w-4", iconClassName)} />
        )
      )}
    </Button>
  );
});
ImagePickerTrigger.displayName = "ImagePickerTrigger";

interface ImagePickerPreviewProps {
  className?: string;
  aspectRatioClassName?: string;
  showRemoveButton?: boolean;
  removeButtonClassName?: string;
}

const ImagePickerPreview = ({
  className,
  aspectRatioClassName = "aspect-[16/9]",
  showRemoveButton = true,
  removeButtonClassName,
}: ImagePickerPreviewProps) => {
  const { image, removeImage } = useImagePickerContext();

  if (!image) {
    return null;
  }

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <div className={cn("relative", aspectRatioClassName)}>
        <Image
          src={image}
          alt="Upload preview"
          fill
          className="object-cover"
        />
      </div>
      {showRemoveButton && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-2 top-2 rounded-full bg-black/50 text-white hover:bg-black/70",
            removeButtonClassName,
          )}
          onClick={removeImage}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

type ImagePickerComponent = React.FC<ImagePickerProps> & {
  Trigger: typeof ImagePickerTrigger;
  Preview: typeof ImagePickerPreview;
};

export const ImagePicker: ImagePickerComponent = Object.assign(
  ImagePickerRoot,
  {
    Trigger: ImagePickerTrigger,
    Preview: ImagePickerPreview,
  },
);

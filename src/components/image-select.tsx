'use client';

import { cn } from "@/lib/utils";
import { type ReactNode, useCallback, useMemo } from "react";
import { ImagePicker, ImagePickerProps } from "./image-picker";

type ImagePickerTriggerProps = React.ComponentProps<typeof ImagePicker.Trigger>;
type ImagePickerPreviewProps = React.ComponentProps<typeof ImagePicker.Preview>;

interface ImageSelectProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
  accept?: ImagePickerProps["accept"];
  uploadEndpoint?: ImagePickerProps["uploadEndpoint"];
  className?: string;
  previewProps?: Partial<ImagePickerPreviewProps>;
  triggerProps?: Partial<Omit<ImagePickerTriggerProps, "children">>;
  uploadLabel?: ReactNode;
  changeLabel?: ReactNode;
}

export function ImageSelect({
  value,
  onChange,
  onValueChange,
  disabled,
  onUploadingChange,
  accept,
  uploadEndpoint,
  className,
  previewProps,
  triggerProps,
  uploadLabel = "Upload image",
  changeLabel = "Change image",
}: ImageSelectProps) {
  const {
    className: previewClassName,
    aspectRatioClassName,
    ...restPreviewProps
  } = previewProps ?? {};

  const {
    className: triggerClassName,
    variant: triggerVariant,
    ...restTriggerProps
  } = triggerProps ?? {};

  const normalizedValue = useMemo(() => {
    return value && value !== "" ? value : null;
  }, [value]);

  const handleChange = useCallback(
    (nextValue: string | null) => {
      onChange?.(nextValue);
      onValueChange?.(nextValue ?? "");
    },
    [onChange, onValueChange],
  );

  return (
    <div className={cn("space-y-3", className)}>
      <ImagePicker
        value={normalizedValue}
        onChange={handleChange}
        disabled={disabled}
        onUploadingChange={onUploadingChange}
        accept={accept}
        uploadEndpoint={uploadEndpoint}
      >
        <ImagePicker.Preview
          aspectRatioClassName={aspectRatioClassName ?? "aspect-[16/9]"}
          className={cn("rounded-xl border border-border", previewClassName)}
          {...restPreviewProps}
        />

        <ImagePicker.Trigger
          variant={triggerVariant ?? "outline"}
          className={cn("w-full justify-center", triggerClassName)}
          {...restTriggerProps}
        >
          {normalizedValue ? changeLabel : uploadLabel}
        </ImagePicker.Trigger>
      </ImagePicker>
    </div>
  );
}

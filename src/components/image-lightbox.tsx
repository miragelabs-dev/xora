import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";

interface ImageLightboxProps {
  src: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({ src, isOpen, onClose }: ImageLightboxProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] p-0 overflow-hidden">
        <div className="relative w-full max-h-[90vh] aspect-auto">
          <Image
            src={src}
            alt="Full size image"
            className="object-contain w-full h-full"
            width={1920}
            height={1080}
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 
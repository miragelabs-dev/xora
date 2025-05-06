'use client';

import { Button } from "@/components/ui/button";
import { cn, copyToClipboard } from "@/lib/utils";
import { Share } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
    url: string;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "dark" | "light";
    size?: "default" | "sm" | "lg" | "icon";
    successMessage?: string;
    errorMessage?: string;
}

export function ShareButton({
    url,
    className,
    variant = "outline",
    size = "icon",
    successMessage = "URL copied to clipboard",
    errorMessage = "Failed to copy URL"
}: ShareButtonProps) {
    const handleShareClick = async () => {
        const success = await copyToClipboard(url);
        if (success) {
            toast.success(successMessage);
        } else {
            toast.error(errorMessage);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={cn("rounded-full", className)}
            onClick={handleShareClick}
        >
            <Share className="h-4 w-4" />
        </Button>
    );
} 
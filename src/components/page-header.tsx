import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-[25] flex h-[60px] items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-5" />
      </Button>
      <div className="flex flex-col">
        <h1 className="text-lg font-bold">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
} 
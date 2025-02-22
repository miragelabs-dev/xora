'use client';

import { Button } from "@/components/ui/button";
import { navbarMenu } from "@/config/app";
import { cn } from "@/lib/utils";
import { PenSquare, TwitterIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="relative z-[3] hidden sm:flex sm:flex-shrink-0 sm:flex-grow sm:flex-col sm:items-end">
      <div className="flex select-none flex-col items-end w-[250px]">
        <div className="fixed top-0 h-full w-[250px]">
          <nav className="flex h-full flex-col gap-6 py-6 px-4">
            <Link href="/" className="flex size-12 items-center justify-center text-primary">
              <TwitterIcon size={24} />
            </Link>

            <div className="flex flex-col gap-2">
              {navbarMenu.map(link => (
                <Link
                  key={link.name}
                  href={link.link}
                  className={cn(
                    "flex items-center gap-3 rounded p-[10px] transition-colors xl:justify-start hover:bg-neutral-800",
                    pathname === link.link ? "opacity-100" : "opacity-50"
                  )}
                >
                  {link.icon && <link.icon size={24} />}
                  <span className="hidden text-base font-semibold leading-5 xl:inline">
                    {link.name}
                  </span>
                </Link>
              ))}

              <Button
                asChild
                className="mt-4 w-full rounded-full"
              >
                <Link href="/compose/post">
                  <PenSquare className="size-5 xl:hidden" />
                  <span className="hidden xl:inline">Post</span>
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
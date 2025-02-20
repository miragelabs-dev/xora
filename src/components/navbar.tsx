'use client';

import { navbarMenu } from "@/config/app";
import { cn } from "@/lib/utils";
import { TwitterIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Navbar = () => (
  <header className="relative z-[3] hidden sm:flex sm:flex-shrink-0 sm:flex-grow sm:flex-col sm:items-end">
    <div className="flex select-none flex-col items-end w-[250px]">
      <div className="fixed top-0 h-full w-[250px]">
        <nav className="flex h-full flex-col gap-6 py-6 px-4">
          <Link href="/" className="flex size-12 items-center justify-center text-primary">
            <TwitterIcon size={24} />
          </Link>
          <div className="flex flex-col">
            {navbarMenu.map(link => (
              <div key={link.name} className="group py-1.5 text-off-white pt-0 opacity-100">
                <Link
                  href={link.link}
                  className={cn(
                    "flex items-center justify-center gap-3 rounded p-[10px] transition-colors xl:justify-start hover:cursor-pointer hover:bg-neutral-800",
                    usePathname() === link.link ? "opacity-100" : "opacity-50"
                  )}
                >
                  {link.icon && <link.icon size={24} />}
                  <span className="hidden text-base font-semibold leading-5 xl:inline">
                    {link.name}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </div>
  </header>
);
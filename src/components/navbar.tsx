'use client';

import { useSession } from "@/app/session-provider";
import { Logo } from "@/components/icons/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LogOut, Menu, PenSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavbarMenu } from "../hooks/use-navbar-menu";
import { UserAvatar } from "./user-avatar";

export function Navbar() {
  const pathname = usePathname();
  const showMobileHeader = pathname === '/home';
  const navbarMenu = useNavbarMenu();
  const { user } = useSession();

  return (
    <>
      {showMobileHeader && (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b bg-background/80 backdrop-blur-lg px-4 sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <div className="flex h-14 items-center border-b px-4">
                <UserAvatar
                  src={user?.image}
                  fallback={user?.username?.[0]}
                  className="h-9 w-9"
                />
                <div className="ml-3">
                  <p className="font-semibold">@username</p>
                  <p className="text-sm text-muted-foreground">0 followers</p>
                </div>
              </div>
              <nav className="flex flex-col py-4">
                {navbarMenu.map((link) => (
                  <SheetClose key={link.name} asChild>
                    <Link
                      href={link.link}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-base transition-colors hover:bg-muted/50",
                        pathname === link.link ? "text-primary font-medium" : "text-foreground"
                      )}
                    >
                      {link.icon && <link.icon size={24} />}
                      {link.name}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 px-4 py-3 justify-start text-base font-normal hover:bg-muted/50"
                  >
                    <LogOut size={24} />
                    Log out
                  </Button>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center justify-center text-primary">
            <Logo className="h-6 w-6" />
          </Link>

          <div className="w-9" />
        </header>
      )}

      <header className="relative z-[3] hidden sm:flex sm:flex-shrink-0 sm:flex-grow sm:flex-col sm:items-end">
        <div className="flex select-none flex-col items-end w-[250px]">
          <div className="fixed top-0 h-full w-[250px]">
            <nav className="flex h-full flex-col gap-6 py-6 px-4">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Link href="/home" className="flex size-10 items-center justify-center text-primary">
                  <Logo className="size-10" />
                </Link>
              </motion.div>

              <motion.div
                className="flex flex-col gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {navbarMenu.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <Link
                      href={link.link}
                      className={cn(
                        "flex items-center gap-3 rounded p-[10px] transition-colors xl:justify-start hover:bg-muted",
                        pathname === link.link ? "opacity-100" : "opacity-50"
                      )}
                    >
                      {link.icon && <link.icon size={24} />}
                      <span className="hidden text-base font-semibold leading-5 xl:inline">
                        {link.name}
                      </span>
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    asChild
                    className="mt-4 w-full rounded-full"
                  >
                    <Link href="/compose/post">
                      <PenSquare className="size-5 xl:hidden" />
                      <span className="hidden xl:inline">Post</span>
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </nav>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 border-t bg-background/80 backdrop-blur-lg sm:hidden">
        {navbarMenu.map((link) => (
          <Link
            key={link.name}
            href={link.link}
            className={cn(
              "flex flex-1 items-center justify-center transition-colors hover:bg-muted/50",
              pathname === link.link
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {link.icon && <link.icon size={20} />}
          </Link>
        ))}
        <Link
          href="/compose/post"
          className={cn(
            "flex flex-1 items-center justify-center transition-colors hover:bg-muted/50",
            pathname === '/compose/post' ? "text-primary" : "text-muted-foreground"
          )}
        >
          <PenSquare size={20} />
        </Link>
      </nav>
    </>
  );
}
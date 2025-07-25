'use client';

import { useSession } from "@/app/session-provider";
import { Logo } from "@/components/icons/logo";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn, copyToClipboard } from "@/lib/utils";
import { motion } from "framer-motion";
import { CopyIcon, LogOut, Menu, MoreHorizontal, PenSquare, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useLogout } from "../hooks/use-logout";
import { useNavbarMenu } from "../hooks/use-navbar-menu";
import { ThemeToggle } from "./theme-toggle";
import { UserAvatar } from "./user-avatar";

function LogoutMenuItem({ className }: { className?: string }) {
  const handleLogout = useLogout();

  return (
    <DropdownMenuItem
      className={cn("text-destructive focus:text-destructive cursor-pointer", className)}
      onClick={handleLogout}
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Logout</span>
    </DropdownMenuItem>
  );
}

function SettingsMenuItem({ className }: { className?: string }) {
  return (
    <Link href="/settings">
      <DropdownMenuItem
        className={cn("cursor-pointer")}
      >
        <SettingsIcon className="mr-2 h-4 w-4" />
        <span>Settings</span>
      </DropdownMenuItem>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const showMobileHeader = pathname === '/home';
  const navbarMenu = useNavbarMenu();

  const { user } = useSession();
  const handleLogout = useLogout();

  return (
    <>
      {showMobileHeader && (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b bg-background/80 backdrop-blur-lg px-4 lg:hidden">
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
                  <p className="font-semibold">@{user?.username}</p>
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
                  <button
                    className="flex items-center gap-3 px-4 py-3 text-base transition-colors hover:bg-muted/50 text-destructive w-full text-left"
                    onClick={handleLogout}
                  >
                    <LogOut size={24} />
                    Logout
                  </button>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center justify-center text-primary">
            <Logo className="h-6 w-6" />
          </Link>

          <ThemeToggle />
        </header>
      )}

      <header className="relative z-[3] hidden lg:flex lg:flex-shrink-0 lg:flex-grow lg:flex-col lg:items-end">
        <div className="flex select-none flex-col items-end w-[250px]">
          <div className="fixed top-0 h-full w-[250px]">
            <nav className="flex h-full flex-col gap-6 py-6 px-4">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between w-full"
              >
                <Link href="/home" className="flex size-10 items-center justify-center text-primary">
                  <Logo className="size-10" />
                </Link>
                <ThemeToggle />
              </motion.div>

              <motion.div
                className="flex flex-col gap-2 flex-1"
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
                        "flex items-center gap-3 rounded p-[10px] transition-colors xl:justify-start hover:bg-muted relative",
                        pathname === link.link ? "font-bold" : ""
                      )}
                    >
                      <div className="relative">
                        {link.icon && <link.icon size={24} />}
                        {link.unreadCount !== undefined && link.unreadCount > 0 && (
                          <div className="absolute -top-2 -right-2 min-w-[22px] h-[22px] rounded-full bg-primary font-bold text-[11px] flex items-center justify-center text-primary-foreground">
                            {link.unreadCount > 99 ? "99+" : link.unreadCount}
                          </div>
                        )}
                      </div>
                      <span className="hidden text-base leading-5 xl:inline">
                        {link.name}
                      </span>
                    </Link>
                  </motion.div>
                ))}

                {user && <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={cn(
                        "flex w-full items-center gap-3 rounded p-[10px] transition-colors xl:justify-start hover:bg-muted",
                      )}>
                        <MoreHorizontal size={24} />
                        <span className="hidden text-base font-semibold leading-5 xl:inline">
                          More
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="w-[180px]">
                      <SettingsMenuItem />
                      <LogoutMenuItem />
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      asChild
                      size='lg'
                      className="mt-4 w-full rounded-full"
                    >
                      <Link href="/compose/post">
                        <PenSquare className="size-5" />
                        <span className="hidden xl:inline">Post</span>
                      </Link>
                    </Button>
                  </motion.div>
                </>}
              </motion.div>
              {
                user && <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="justify-start gap-3 h-auto">
                      <UserAvatar
                        src={user.image}
                        fallback={user.username}
                        className="h-9 w-9"
                      />
                      <div className="text-left space-y-0.5">
                        <div className="hidden text-base font-semibold leading-5 xl:inline">
                          {user.username}
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2">
                          <div>
                            {user.address.slice(0, 6)}...{user.address.slice(-4)}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onPointerDown={(e) => {
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(user.address);

                              toast.success("Address copied to clipboard");
                            }}
                          >
                            <CopyIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[180px]">
                    <SettingsMenuItem />
                    <LogoutMenuItem />
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            </nav>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 border-t bg-background/80 backdrop-blur-lg lg:hidden">
        {navbarMenu.map((link) => (
          <Link
            key={link.name}
            href={link.link}
            className={cn(
              "flex flex-1 items-center justify-center transition-colors hover:bg-muted/50 relative",
              pathname === link.link
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <div className="relative">
              {link.icon && <link.icon size={20} />}
              {link.unreadCount !== undefined && link.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full bg-primary text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                  {link.unreadCount > 99 ? "99+" : link.unreadCount}
                </div>
              )}
            </div>
          </Link>
        ))}

        {
          user && <Link
            href="/compose/post"
            className={cn(
              "flex flex-1 items-center justify-center transition-colors hover:bg-muted/50",
              pathname === '/compose/post' ? "text-primary" : "text-muted-foreground"
            )}
          >
            <PenSquare size={20} />
          </Link>
        }
      </nav>
    </>
  );
}
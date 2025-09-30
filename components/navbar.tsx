"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon } from "@/components/icons";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <HeroUINavbar
      maxWidth="xl"
      position="sticky"
      className="backdrop-blur-md bg-background/80 border-b border-white/20"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center" href="/">
            <p className="font-bold text-inherit">Stataku</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          <NavbarItem>
            <NextLink
              className={clsx(
                linkStyles({ color: "foreground" }),
                pathname === "/browse" && "text-blue-500 font-medium",
              )}
              color="foreground"
              href="/browse"
            >
              Browse
            </NextLink>
          </NavbarItem>
          <NavbarItem>
            <NextLink
              className={clsx(
                linkStyles({ color: "foreground" }),
                pathname === "/discovery" && "text-blue-500 font-medium",
              )}
              color="foreground"
              href="/discovery"
            >
              Discovery
            </NextLink>
          </NavbarItem>
          <NavbarItem>
            <NextLink
              className={clsx(
                linkStyles({ color: "foreground" }),
                pathname === "/dashboard" && "text-blue-500 font-medium",
              )}
              color="foreground"
              href="/dashboard"
            >
              Dashboard
            </NextLink>
          </NavbarItem>
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex lg:hidden basis-1 pl-4"
        justify="end"
      >
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarContent
        className="hidden lg:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="flex">
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="flex">{searchInput}</NavbarItem>
        <NavbarItem className="flex">
          {loading ? (
            <div className="w-8 h-8 bg-default-200 rounded-full animate-pulse" />
          ) : (
            <>
              {user && profile ? (
                <UserProfileDropdown />
              ) : (
                <Button
                  as={Link}
                  className="text-sm font-normal text-default-600 bg-default-100"
                  href={siteConfig.links.signin}
                  variant="flat"
                >
                  Sign In
                </Button>
              )}
            </>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          <NavbarMenuItem>
            <Link
              color={pathname === "/browse" ? "primary" : "foreground"}
              href="/browse"
              size="lg"
              className={
                pathname === "/browse" ? "text-blue-500 font-medium" : ""
              }
            >
              Browse
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              color={pathname === "/discovery" ? "primary" : "foreground"}
              href="/discovery"
              size="lg"
              className={
                pathname === "/discovery" ? "text-blue-500 font-medium" : ""
              }
            >
              Discovery
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              color={pathname === "/dashboard" ? "primary" : "foreground"}
              href="/dashboard"
              size="lg"
              className={
                pathname === "/dashboard" ? "text-blue-500 font-medium" : ""
              }
            >
              Dashboard
            </Link>
          </NavbarMenuItem>

          {/* Authentication section in mobile menu */}
          <div className="mt-6 pt-4 border-t border-divider">
            {loading ? (
              <NavbarMenuItem>
                <div className="w-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-default-200 rounded-full animate-pulse" />
                </div>
              </NavbarMenuItem>
            ) : (
              <>
                {user && profile ? (
                  <NavbarMenuItem>
                    <div className="w-full">
                      <UserProfileDropdown isMobile={true} className="w-full" />
                    </div>
                  </NavbarMenuItem>
                ) : (
                  <NavbarMenuItem>
                    <Link
                      href={siteConfig.links.signin}
                      size="lg"
                      className="w-full text-center"
                    >
                      Sign In
                    </Link>
                  </NavbarMenuItem>
                )}
              </>
            )}
          </div>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};

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
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { siteConfig } from "@/config/site";
import { SearchIcon } from "@/components/icons";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const searchInput = (
    <Input
      readOnly
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100 cursor-pointer",
        input: "text-sm cursor-pointer",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["ctrl"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
      onClick={handleSearchClick}
    />
  );

  return (
    <HeroUINavbar
      className="backdrop-blur-md bg-background/80 border-b border-white/20"
      maxWidth="xl"
      position="sticky"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center" href="/">
            <p className="font-waterlily text-2xl text-inherit">Stataku</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          <NavbarItem>
            <NextLink
              className={clsx(
                linkStyles({ color: "foreground" }),
                pathname === "/browse" && "text-blue-500 font-medium"
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
                pathname === "/discovery" && "text-blue-500 font-medium"
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
                pathname === "/dashboard" && "text-blue-500 font-medium"
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
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarContent
        className="hidden lg:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="flex">{searchInput}</NavbarItem>
        <NavbarItem className="flex">
          {loading ? (
            <div className="w-8 h-8 bg-default-200 rounded-full animate-pulse" />
          ) : (
            <>
              {user && profile ? (
                <UserProfileDropdown />
              ) : user ? (
                <Button
                  className="text-sm font-normal text-warning-600 bg-warning-100"
                  onPress={() => window.location.reload()}
                  variant="flat"
                >
                  Profile Loading...
                </Button>
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
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          <NavbarMenuItem>
            <Link
              className={
                pathname === "/browse" ? "text-blue-500 font-medium" : ""
              }
              color={pathname === "/browse" ? "primary" : "foreground"}
              href="/browse"
              size="lg"
            >
              Browse
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              className={
                pathname === "/discovery" ? "text-blue-500 font-medium" : ""
              }
              color={pathname === "/discovery" ? "primary" : "foreground"}
              href="/discovery"
              size="lg"
            >
              Discovery
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              className={
                pathname === "/dashboard" ? "text-blue-500 font-medium" : ""
              }
              color={pathname === "/dashboard" ? "primary" : "foreground"}
              href="/dashboard"
              size="lg"
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
                      <UserProfileDropdown className="w-full" isMobile={true} />
                    </div>
                  </NavbarMenuItem>
                ) : user ? (
                  <NavbarMenuItem>
                    <Button
                      className="w-full text-warning-600 bg-warning-100"
                      onPress={() => window.location.reload()}
                      size="lg"
                      variant="flat"
                    >
                      Profile Loading...
                    </Button>
                  </NavbarMenuItem>
                ) : (
                  <NavbarMenuItem>
                    <Link
                      className="w-full text-center"
                      href={siteConfig.links.signin}
                      size="lg"
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

      {/* Search Modal */}
      <Modal
        hideCloseButton
        classNames={{
          base: "mx-4",
          backdrop: "bg-black/50 backdrop-blur-sm",
        }}
        isOpen={isSearchOpen}
        placement="top-center"
        size="2xl"
        onClose={handleSearchClose}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <SearchIcon className="text-lg text-default-400" />
              <span className="text-lg font-semibold">Search</span>
            </div>
            <p className="text-sm text-default-500">
              Search for users, content, and more
            </p>
          </ModalHeader>
          <ModalBody className="pb-6">
            <Input
              aria-label="Search"
              classNames={{
                inputWrapper: "bg-default-100 h-12",
                input: "text-base",
              }}
              endContent={
                <Kbd className="hidden sm:inline-block" keys={["escape"]}>
                  ESC
                </Kbd>
              }
              placeholder="Type to search..."
              startContent={
                <SearchIcon className="text-lg text-default-400 pointer-events-none flex-shrink-0" />
              }
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  handleSearchClose();
                }
              }}
            />

            {/* Search Results Placeholder */}
            <div className="mt-4">
              {searchQuery ? (
                <div className="text-center py-8">
                  <div className="text-default-400 text-4xl mb-2">🔍</div>
                  <p className="text-default-500">
                    Search results for &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-sm text-default-400 mt-1">
                    Search functionality coming soon...
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-default-300 text-4xl mb-2">⚡</div>
                  <p className="text-default-500">Start typing to search</p>
                  <p className="text-sm text-default-400 mt-1">
                    Press <Kbd keys={["ctrl"]}>K</Kbd> to open this search
                  </p>
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </HeroUINavbar>
  );
};

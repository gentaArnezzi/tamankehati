"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Menu as MenuIcon, X } from "lucide-react";
import * as React from "react";

export type IMenu = {
  id: number;
  title: string;
  url: string;
  dropdown?: boolean;
  items?: IMenu[];
};

type MenuProps = {
  list: IMenu[];
  currentPath?: string;
};

const Menu = ({ list, currentPath: explicitPath }: MenuProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [currentPath, setCurrentPath] = useState(explicitPath || "");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Update current path if not provided explicitly (for dynamic routing)
    if (!explicitPath) {
      const updatePath = () => setCurrentPath(window.location.pathname);
      updatePath();

      // Listen for URL changes if using client-side routing
      const handlePopState = () => updatePath();
      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [explicitPath]);

  const isActive = (url: string) => currentPath === url;

  // Mobile menu toggle handler
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <MotionConfig transition={{ bounce: 0, type: "tween" }}>
      <nav className="relative">
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center">
          <ul className="flex items-center space-x-1">
            {list?.map((item) => {
              const active = isActive(item.url);
              return (
                <li key={item.id} className="relative">
                  <a
                    className={`
                      relative flex items-center justify-center rounded-lg px-4 py-2 transition-all
                      hover:bg-foreground/5
                      ${hovered === item?.id ? "bg-foreground/5" : ""}
                      ${active ? "font-semibold text-primary bg-primary/10" : "text-foreground/80"}
                    `}
                    onMouseEnter={() => setHovered(item.id)}
                    onMouseLeave={() => setHovered(null)}
                    href={item?.url}
                  >
                    {item?.title}
                  </a>
                  {hovered === item?.id && !item?.dropdown && (
                    <motion.div
                      layout
                      layoutId={`cursor`}
                      className="absolute h-0.5 w-full bg-primary"
                      style={{ bottom: "-2px" }}
                    />
                  )}
                  {item?.dropdown && hovered === item?.id && (
                    <div
                      className="absolute left-0 top-full z-50"
                      onMouseEnter={() => setHovered(item.id)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <motion.div
                        layout
                        transition={{ bounce: 0 }}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 10, opacity: 0 }}
                        className="mt-2 flex w-64 flex-col rounded-lg bg-background border shadow-lg overflow-hidden"
                        layoutId={"dropdown"}
                      >
                        {item?.items?.map((nav) => {
                          const isDropdownActive = isActive(nav.url);
                          return (
                            <motion.a
                              key={`link-${nav?.id}`}
                              href={`${nav?.url}`}
                              className={`
                                w-full p-3 hover:bg-muted transition-colors 
                                ${isDropdownActive ? "font-semibold bg-muted text-primary" : "text-foreground/80"}
                              `}
                            >
                              {nav?.title}
                            </motion.a>
                          );
                        })}
                      </motion.div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center justify-between w-full">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-foreground hover:bg-muted focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>

          {/* Mobile menu dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-14 left-0 right-0 bg-background border-b shadow-lg z-50 rounded-b-lg"
              >
                <ul className="py-2">
                  {list?.map((item) => {
                    const active = isActive(item.url);
                    return (
                      <li key={item.id}>
                        <a
                          className={`
                            block px-6 py-3 text-left transition-colors
                            ${active ? "bg-primary/10 text-primary font-medium" : "text-foreground/80 hover:bg-muted"}
                          `}
                          href={item?.url}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item?.title}
                        </a>
                        {item?.dropdown && item?.items && (
                          <div className="pl-6 py-1 space-y-1">
                            {item.items.map((subItem) => {
                              const subActive = isActive(subItem.url);
                              return (
                                <a
                                  key={`sub-${subItem.id}`}
                                  href={subItem.url}
                                  className={`
                                    block px-4 py-2 rounded-md text-sm transition-colors
                                    ${subActive ? "bg-primary/10 text-primary font-medium" : "text-foreground/70 hover:bg-muted"}
                                  `}
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {subItem.title}
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </MotionConfig>
  );
};

export default Menu;

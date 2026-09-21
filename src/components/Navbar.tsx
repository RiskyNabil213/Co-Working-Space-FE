"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, ChevronDown, Calendar, ShieldCheck, LayoutDashboard } from "lucide-react";
import { clearAuthSession } from "@/lib/api";

interface UserProfile {
  nama: string;
  email?: string;
  role?: string;
  profesi?: string;
  perusahaan?: string;
  avatar?: string;
}

const getInitials = (name?: string) => {
  if (!name) return "JD";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isDashboard = pathname === "/dashboard";
  const isSpaces = pathname === "/spaces" || pathname === "/katalog";
  const isReservasi = pathname === "/reservasi" || pathname === "/booking";
  // const isMembership = pathname === "/membership";
  const isEvents = pathname === "/events" || pathname.startsWith("/events");
  const isAbout = pathname === "/about" || pathname === "/about-us";

  // Scroll listener for dynamic glass dynamics (>80px)
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load user from localStorage and listen to auth changes
  useEffect(() => {
    const loadUser = () => {
      try {
        setAvatarError(false);
        const stored = localStorage.getItem("uhub_user");
        if (stored) {
          if (stored === "guest") {
            setUser(null);
          } else {
            const parsed = JSON.parse(stored);
            setUser(parsed);
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    loadUser();

    const handleAuthChange = () => loadUser();
    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    window.location.href = "/";
  };

  const navLinks = mounted && user
    ? [
        {
          name: "Dashboard",
          href: user.role === "admin_space" || user.role === "admin" ? "/admin" : "/dashboard",
          active: isDashboard || (pathname === "/admin" && (user.role === "admin_space" || user.role === "admin")),
        },
        { name: "Spaces", href: "/spaces", active: isSpaces },
        { name: "My Reservasi", href: "/reservasi", active: isReservasi },
        { name: "Events", href: "/events", active: isEvents },
        { name: "About Us", href: "/about", active: isAbout },
      ]
    : [
        { name: "Home", href: "/", active: isHome },
        { name: "Spaces", href: "/spaces", active: isSpaces },
        { name: "Events", href: "/events", active: isEvents },
        { name: "About Us", href: "/about", active: isAbout },
      ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 pt-4 pb-2 z-50 sticky top-0 print:hidden"
    >
      <nav
        className={`h-[64px] px-5 sm:px-8 border rounded-full flex items-center justify-between transition-all duration-300 ${scrolled
          ? "bg-white/92 backdrop-blur-[20px] border-[#E2E2DF] shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
          : "bg-white/75 backdrop-blur-[12px] border-[#E2E2DF]/80 shadow-xs"
          }`}
      >
        {/* Brand Logo -> Direct to Dashboard if logged in, otherwise Home */}
        <Link
          href={mounted && user ? (user.role === "admin_space" || user.role === "admin" ? "/admin" : "/dashboard") : "/"}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <img
            src="/img/logo.svg"
            alt="UHUB Logo"
            className="h-[79px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Center Nav Links with Rolling Underline Indicator */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`relative py-1 text-[13px] font-bold tracking-[0.04em] uppercase transition-colors group cursor-pointer ${link.active ? "text-[#0E0F12]" : "text-[#707175] hover:text-[#0E0F12]"
                }`}
            >
              <span>{link.name}</span>
              {link.active ? (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0E0F12]"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              ) : (
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#0E0F12] transition-all duration-300 group-hover:w-full" />
              )}
            </Link>
          ))}
        </div>

        {/* Right Action: Profile or Login + Book A Space Lime Pill */}
        <div className="hidden md:flex items-center gap-3">
          {mounted && user ? (
            /* User Logged In Profile Badge with Dropdown */
            <div className="relative" ref={dropdownRef}>
              <motion.button
                suppressHydrationWarning
                whileHover={{ scale: 1.025 }}
                whileTap={{ scale: 0.975 }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 pl-1.5 pr-3 py-1 rounded-full border border-[#E5E7EB] hover:border-[#111315] bg-white transition-all duration-200 cursor-pointer group shadow-xs"
                aria-label="User Profile Menu"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E5E7EB] bg-[#0B0D0F] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                  {!avatarError && user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.nama}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span>{getInitials(user.nama)}</span>
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[13px] font-bold text-[#111315] leading-tight group-hover:text-black">
                    {user.nama}
                  </span>
                  <span className="text-[10px] text-[#6C7278] font-medium leading-tight">
                    {user.role === "admin" || user.role === "admin_space" ? "Facility Admin" : (user.profesi || "Member")}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-[#6C7278] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </motion.button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 w-[240px] bg-white border border-[#E5E7EB] rounded-[20px] shadow-xl p-3 z-50 origin-top-right"
                  >
                    <div className="px-3 py-2.5 border-b border-[#E5E7EB]/70 mb-1">
                      <p className="text-[13px] font-bold text-[#111315] truncate">
                        {user.nama}
                      </p>
                      <p className="text-[11px] text-[#6C7278] truncate mt-0.5">
                        {user.email || (user.perusahaan ? `${user.profesi} • ${user.perusahaan}` : "UHUB Verified Member")}
                      </p>
                    </div>

                    {user.role === "admin_space" || user.role === "admin" ? (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-bold text-[#0B0D0F] bg-[#D2F842]/40 hover:bg-[#D2F842] rounded-[12px] transition-colors"
                      >
                        <ShieldCheck size={15} className="text-[#0B0D0F]" />
                        <span>Admin Console</span>
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-bold text-[#0B0D0F] bg-[#D2F842]/40 hover:bg-[#D2F842] rounded-[12px] transition-colors"
                      >
                        <LayoutDashboard size={15} className="text-[#0B0D0F]" />
                        <span>Member Dashboard</span>
                      </Link>
                    )}

                    <Link
                      href="/reservasi"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-[#111315] hover:bg-[#F6F6F4] rounded-[12px] transition-colors"
                    >
                      <ShieldCheck size={15} className="text-[#10B981]" />
                      <span>My Reservations</span>
                    </Link>

                    <Link
                      href="/spaces"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[#111315] hover:bg-[#F6F6F4] rounded-[12px] transition-colors"
                    >
                      <Calendar size={15} className="text-[#6C7278]" />
                      <span>Explore Spaces</span>
                    </Link>

                    <div className="border-t border-[#E5E7EB]/70 my-1"></div>

                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[#EF4444] hover:bg-red-50 rounded-[12px] transition-colors text-left cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Log Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Logged Out State: Log In Text Link */
            <Link
              href="/login"
              className="text-[13px] font-bold text-[#111315] hover:text-black transition-colors px-3 py-2 cursor-pointer"
            >
              Log in
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center">
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#0E0F12] focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden mt-2 p-6 bg-white/95 backdrop-blur-xl border border-[#E2E2DF] rounded-[24px] shadow-lg flex flex-col gap-4"
          >
            {mounted && user && (
              <div className="flex items-center gap-3 p-3 bg-[#F6F6F4] rounded-[16px] border border-[#E2E2DF] mb-2">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E2E2DF] bg-[#0E0F12] text-white flex items-center justify-center font-bold text-[13px] shrink-0">
                  {!avatarError && user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.nama}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span>{getInitials(user.nama)}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-[#0E0F12]">
                    {user.nama}
                  </span>
                  <span className="text-[11px] text-[#707175]">
                    {user.role === "admin" ? "Facility Admin" : (user.profesi || "Member")}
                  </span>
                </div>
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-[15px] font-semibold py-2 border-b border-[#E2E2DF]/60 flex items-center justify-between ${link.active ? "text-[#0E0F12] font-bold" : "text-[#707175]"
                  }`}
              >
                <span>{link.name}</span>
                {link.active && <span className="w-2 h-2 rounded-full bg-[#0E0F12]" />}
              </Link>
            ))}

            <div className="flex flex-col gap-3 pt-2">
              {mounted && user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-center py-2.5 text-[14px] font-bold text-[#EF4444] border border-red-200 bg-red-50 rounded-full cursor-pointer"
                >
                  Log Out ({user.nama})
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-[14px] font-semibold text-[#0E0F12] border border-[#E2E2DF] rounded-full"
                >
                  Log In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}




"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Building2,
  LayoutGrid,
  Users,
  Tag,
  CalendarCheck,
  LogOut,
  Check,
  Copy,
  X,
} from "lucide-react";
import { clearAuthSession } from "@/lib/api";

interface AdminSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  currentUser?: any;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({
  activeTab = "overview",
  onTabChange,
  currentUser,
  mobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [copiedKey, setCopiedKey] = useState(false);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);

  const isDrawerOpen = mobileOpen || internalMobileOpen;

  const closeDrawer = () => {
    setInternalMobileOpen(false);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  // Listen to global open admin mobile menu event
  useEffect(() => {
    const handleOpenMobile = () => setInternalMobileOpen(true);
    window.addEventListener("openAdminMobileMenu", handleOpenMobile);
    return () => {
      window.removeEventListener("openAdminMobileMenu", handleOpenMobile);
    };
  }, []);

  const handleCopyKey = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText("mk_4ffb8c4b40a6499e890128");
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const navItems = [
    {
      id: "overview",
      label: "Overview & Reports",
      icon: TrendingUp,
      href: "/admin?tab=overview",
    },
    {
      id: "profile",
      label: "Location Profile",
      icon: Building2,
      href: "/admin?tab=profile",
    },
    {
      id: "spaces",
      label: "Manage Spaces & Desks",
      icon: LayoutGrid,
      href: "/admin?tab=spaces",
    },
    {
      id: "members",
      label: "Manage Members",
      icon: Users,
      href: "/admin?tab=members",
    },
    {
      id: "discounts",
      label: "Promo Vouchers & Diskon",
      icon: Tag,
      href: "/admin?tab=discounts",
    },
    {
      id: "reservations",
      label: "Reservations",
      icon: CalendarCheck,
      href: "/admin?tab=reservations",
    },
  ];

  const handleItemClick = (item: (typeof navItems)[0]) => {
    if (onTabChange) {
      onTabChange(item.id);
    }
    closeDrawer();
  };

  const userName =
    currentUser?.nama || currentUser?.space_owner?.nama_pemilik || "Ahmad Bidin, S.Kom";
  const userRole = currentUser?.role === "admin_space" ? "Facility Owner" : "Facility Owner";

  const renderNavContent = (isMobile = false) => (
    <div className="flex flex-col justify-between h-full">
      {/* Top Section */}
      <div className="space-y-4">
        {/* Mobile Header in Drawer */}
        {isMobile && (
          <div className="flex items-center justify-between pb-4 border-b border-[#F0F0F0]">
            <div className="flex items-center gap-3">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-[#111111] flex items-center justify-center text-[#D4F34A] font-black text-[18px] shadow-xs shrink-0">
                U
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-[15px] text-[#111111] tracking-tight leading-none uppercase">
                    UHUB
                  </span>
                  <span className="bg-[#F2F4F7] text-[#6B7280] text-[9px] font-bold px-1.5 py-0.5 rounded-[5px] border border-[#E5E7EB] tracking-wide leading-tight">
                    ADMIN
                  </span>
                </div>
                <span className="text-[9.5px] font-bold tracking-wider text-gray-400 uppercase mt-0.5 leading-none">
                  OPERATIONS CONSOLE
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={closeDrawer}
              className="p-1.5 rounded-full hover:bg-gray-100 text-[#111111] transition-colors cursor-pointer"
              aria-label="Tutup Navigasi"
            >
              <X size={19} />
            </button>
          </div>
        )}

        {/* Section Label: VENUE WORKSPACE */}
        <div>
          <div className="text-[11px] font-extrabold tracking-widest text-gray-400 px-3 mb-3 uppercase">
            VENUE WORKSPACE
          </div>

          {/* Nav Items List */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (pathname === "/admin/rekapitulasi" && item.id === "overview");

              if (onTabChange) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-[13px] transition-all cursor-pointer text-left ${
                      isActive
                        ? "bg-[#111111] text-white font-bold shadow-xs"
                        : "text-[#4B5563] font-medium hover:bg-[#F8F9FA] hover:text-[#111111]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        size={17}
                        strokeWidth={isActive ? 2.2 : 1.75}
                        className={isActive ? "text-[#D4F34A]" : "text-[#6B7280]"}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {isActive && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#CEF23F] text-[#111111] text-[9px] font-extrabold tracking-wider shrink-0 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
                        LIVE
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={closeDrawer}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-[13px] transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#111111] text-white font-bold shadow-xs"
                      : "text-[#4B5563] font-medium hover:bg-[#F8F9FA] hover:text-[#111111]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      size={17}
                      strokeWidth={isActive ? 2.2 : 1.75}
                      className={isActive ? "text-[#D4F34A]" : "text-[#6B7280]"}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {isActive && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#CEF23F] text-[#111111] text-[9px] font-extrabold tracking-wider shrink-0 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
                      LIVE
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="pt-6 space-y-3">
        {/* Multi-Tenancy Key Card */}
        <div
          onClick={handleCopyKey}
          className="bg-[#F3F4F6] rounded-[14px] p-3 border border-[#EAEAEA] relative cursor-pointer hover:border-[#D1D5DB] transition-all group"
          title="Klik untuk menyalin Multi-Tenancy Key"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
              MULTI-TENANCY KEY
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-800 font-bold tracking-tight">
              sk_4ffb8c4b14e54...
            </span>
            <span className="text-[#8C9196] group-hover:text-[#111111] transition-colors">
              {copiedKey ? (
                <Check size={12} className="text-[#10B981]" />
              ) : (
                <Copy size={11} />
              )}
            </span>
          </div>
          <div className="text-[10px] text-gray-500 font-medium mt-0.5">
            Isolated Facility Tenant #12
          </div>
        </div>

        {/* User Account Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F0F0F0]">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar Circle with Initials AS */}
            <div className="w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              AS
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-gray-900 truncate leading-tight">
                {userName}
              </div>
              <div className="text-[10px] text-gray-500 truncate mt-0.5">
                {userRole}
              </div>
            </div>
          </div>

          {/* Logout button */}
          <button
            type="button"
            onClick={() => {
              clearAuthSession();
              window.location.href = "/login";
            }}
            title="Keluar / Ganti Akun"
            className="p-1.5 rounded-lg text-[#8C9196] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. MOBILE SLIDE-OVER DRAWER (< lg screens) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeDrawer}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide Drawer Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-[290px] sm:w-[320px] max-w-[85vw] h-full bg-white shadow-2xl p-5 overflow-y-auto flex flex-col justify-between"
            >
              {renderNavContent(true)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* 2. DESKTOP PERMANENT SIDEBAR (>= lg screens) */}
      <aside className="hidden lg:flex w-[260px] bg-white border border-[#EAEAEA] rounded-[24px] shrink-0 flex-col justify-between p-5 min-h-[calc(100vh-140px)] shadow-xs select-none sticky top-[90px]">
        {renderNavContent(false)}
      </aside>
    </>
  );
}



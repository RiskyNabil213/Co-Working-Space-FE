"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Sun,
  Moon,
  X,
  Check,
} from "lucide-react";

export interface AppleDateTimeResult {
  date: Date;
  dateString: string; // YYYY-MM-DD
  time: string; // HH:MM
  ampm: "AM" | "PM";
  formatted: string; // e.g. "Aug 30, 2026 • 09:00 AM"
  fullISO: string;
}

export interface AppleCalendarPickerProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date | string;
  initialTime?: string; // e.g. "09:00" or "09:00 AM"
  onDateTimeSelect: (result: AppleDateTimeResult) => void;
  title?: string;
  minDate?: Date;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function AppleCalendarPicker({
  isOpen,
  onClose,
  initialDate,
  initialTime = "09:00",
  onDateTimeSelect,
  title = "Select Date & Time",
}: AppleCalendarPickerProps) {
  // Parse initial date
  const parseDate = (d?: Date | string): Date => {
    if (!d) return new Date(2026, 7, 30); // Default Aug 30, 2026
    if (d instanceof Date) return d;
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? new Date(2026, 7, 30) : parsed;
  };

  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    parseDate(initialDate)
  );
  const [viewYear, setViewYear] = useState<number>(() =>
    selectedDate.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(() =>
    selectedDate.getMonth()
  );

  // Time states
  const parseInitialTime = (timeStr: string) => {
    let clean = timeStr.trim();
    let isPM = clean.toUpperCase().includes("PM");
    clean = clean.replace(/AM|PM|WIB/gi, "").trim();
    const parts = clean.split(":");
    let h = parseInt(parts[0] || "9", 10);
    let m = parseInt(parts[1] || "0", 10);

    if (h > 12) {
      h = h - 12;
      isPM = true;
    } else if (h === 0) {
      h = 12;
      isPM = false;
    } else if (h === 12 && !clean.toUpperCase().includes("AM")) {
      isPM = true;
    }

    return {
      hour: String(h).padStart(2, "0"),
      minute: String(m).padStart(2, "0"),
      ampm: isPM ? ("PM" as const) : ("AM" as const),
    };
  };

  const initialTimeObj = parseInitialTime(initialTime);
  const [hour, setHour] = useState<string>(initialTimeObj.hour);
  const [minute, setMinute] = useState<string>(initialTimeObj.minute);
  const [ampm, setAmpm] = useState<"AM" | "PM">(initialTimeObj.ampm);

  // Month-Year selection drawer state
  const [showMonthGrid, setShowMonthGrid] = useState<boolean>(false);

  // Dual-theme mode (local state with dark mode toggle)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Sync when reopened
  useEffect(() => {
    if (isOpen) {
      const d = parseDate(initialDate);
      setSelectedDate(d);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      const t = parseInitialTime(initialTime);
      setHour(t.hour);
      setMinute(t.minute);
      setAmpm(t.ampm);
      setShowMonthGrid(false);
    }
  }, [isOpen, initialDate, initialTime]);

  // Handle ESC key & focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Days in month calculation
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 = Sunday
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day);
    setSelectedDate(newDate);
  };

  // Strict time input sanitation
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val === "") {
      setHour("");
      return;
    }
    let num = parseInt(val, 10);
    if (num > 12) num = 12;
    if (num < 1 && val.length === 2) num = 1;
    setHour(String(num).padStart(2, "0"));
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val === "") {
      setMinute("");
      return;
    }
    let num = parseInt(val, 10);
    if (num > 59) num = 59;
    setMinute(String(num).padStart(2, "0"));
  };

  // Confirmation handler
  const handleConfirm = () => {
    const finalHour = hour ? parseInt(hour, 10) : 9;
    const finalMinute = minute ? parseInt(minute, 10) : 0;
    let militaryHour = finalHour;
    if (ampm === "PM" && finalHour < 12) militaryHour += 12;
    if (ampm === "AM" && finalHour === 12) militaryHour = 0;

    const resultDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      militaryHour,
      finalMinute
    );

    const pad = (n: number) => String(n).padStart(2, "0");
    const dateString = `${resultDate.getFullYear()}-${pad(
      resultDate.getMonth() + 1
    )}-${pad(resultDate.getDate())}`;
    const timeString = `${pad(militaryHour)}:${pad(finalMinute)}`;
    const formatted = `${
      MONTH_SHORT[resultDate.getMonth()]
    } ${resultDate.getDate()}, ${resultDate.getFullYear()} • ${pad(
      finalHour
    )}:${pad(finalMinute)} ${ampm}`;

    onDateTimeSelect({
      date: resultDate,
      dateString,
      time: timeString,
      ampm,
      formatted,
      fullISO: resultDate.toISOString(),
    });

    onClose();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewMonth &&
      today.getFullYear() === viewYear
    );
  };

  const isSelected = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getFullYear() === viewYear
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Floating Apple-style Modal Card */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`relative z-10 w-[310px] rounded-[24px] shadow-2xl p-4.5 border transition-colors duration-200 select-none ${
              isDarkMode
                ? "bg-[#1C1C1E] text-white border-[rgba(255,255,255,0.12)] shadow-[0_25px_60px_rgba(0,0,0,0.7)]"
                : "bg-white/95 text-[#1C1C1E] border-[rgba(0,0,0,0.08)] shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
            }`}
          >
            {/* Header: Title, Theme Toggle & Close */}
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08] mb-3">
              <span className="text-[13px] font-bold tracking-tight opacity-90 truncate max-w-[170px]">
                {title}
              </span>

              <div className="flex items-center gap-1.5">
                {/* Dual-theme toggle */}
                <button
                  type="button"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isDarkMode
                      ? "bg-white/10 text-yellow-400 hover:bg-white/20"
                      : "bg-black/5 text-[#8E8E93] hover:text-[#1C1C1E]"
                  }`}
                  aria-label="Toggle picker theme"
                  title="Toggle Light/Dark Theme"
                >
                  {isDarkMode ? <Sun size={13} /> : <Moon size={13} />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isDarkMode
                      ? "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                      : "bg-black/5 text-[#8E8E93] hover:bg-black/10 hover:text-[#1C1C1E]"
                  }`}
                  aria-label="Close picker"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Month & Year Navigator / Toggle */}
            <div className="flex items-center justify-between px-1 mb-2.5">
              <button
                type="button"
                onClick={() => setShowMonthGrid(!showMonthGrid)}
                className="flex items-center gap-1.5 text-[14px] font-bold tracking-tight hover:opacity-80 transition-opacity cursor-pointer group"
                aria-expanded={showMonthGrid}
              >
                <span>
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <motion.div
                  animate={{ rotate: showMonthGrid ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown
                    size={14}
                    className="text-[#FF3B30] font-bold transition-transform"
                  />
                </motion.div>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isDarkMode
                      ? "hover:bg-white/10 text-white/80"
                      : "hover:bg-black/5 text-[#1C1C1E]"
                  }`}
                  aria-label="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isDarkMode
                      ? "hover:bg-white/10 text-white/80"
                      : "hover:bg-black/5 text-[#1C1C1E]"
                  }`}
                  aria-label="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Month / Year Matrix Drawer Overlay */}
            <AnimatePresence>
              {showMonthGrid ? (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="mb-3 p-2 rounded-[16px] border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03]"
                >
                  {/* Year Step Controls */}
                  <div className="flex items-center justify-between px-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setViewYear((y) => y - 1)}
                      className="text-[12px] font-bold text-[#FF3B30] hover:underline"
                    >
                      ← {viewYear - 1}
                    </button>
                    <span className="text-[12px] font-extrabold">
                      {viewYear}
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewYear((y) => y + 1)}
                      className="text-[12px] font-bold text-[#FF3B30] hover:underline"
                    >
                      {viewYear + 1} →
                    </button>
                  </div>

                  {/* 3-Column Month Grid */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {MONTH_SHORT.map((mShort, idx) => {
                      const isCurrentView = viewMonth === idx;
                      return (
                        <button
                          key={mShort}
                          type="button"
                          onClick={() => {
                            setViewMonth(idx);
                            setShowMonthGrid(false);
                          }}
                          className={`py-1.5 px-2 rounded-[10px] text-[12px] font-bold transition-all cursor-pointer ${
                            isCurrentView
                              ? "bg-[#FF3B30] text-white shadow-xs"
                              : isDarkMode
                              ? "bg-white/5 text-white/80 hover:bg-white/15"
                              : "bg-white text-[#1C1C1E] hover:bg-black/5 border border-black/[0.04]"
                          }`}
                        >
                          {mShort}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                /* Standard 7-Column Days Grid */
                <div className="mb-4">
                  {/* Weekday indicators */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                    {WEEKDAYS.map((wd) => (
                      <span
                        key={wd}
                        className="text-[10px] font-extrabold tracking-wider text-[#8E8E93]"
                      >
                        {wd}
                      </span>
                    ))}
                  </div>

                  {/* Day cells */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {/* Trailing days of previous month */}
                    {[...Array(firstDay)].map((_, i) => {
                      const dayNum = prevMonthDays - firstDay + i + 1;
                      return (
                        <div
                          key={`prev-${i}`}
                          className="h-[34px] flex items-center justify-center text-[12px] font-medium text-[#8E8E93]/40"
                        >
                          {dayNum}
                        </div>
                      );
                    })}

                    {/* Active days in current month */}
                    {[...Array(daysInMonth)].map((_, i) => {
                      const dayNum = i + 1;
                      const active = isSelected(dayNum);
                      const currentDay = isToday(dayNum);

                      return (
                        <motion.button
                          key={`day-${dayNum}`}
                          whileTap={{ scale: 0.93 }}
                          type="button"
                          onClick={() => handleSelectDay(dayNum)}
                          className={`relative h-[34px] w-[34px] mx-auto rounded-full text-[13px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                            active
                              ? "bg-[#FF3B30] text-white shadow-[0_4px_12px_rgba(255,59,48,0.4)] scale-105"
                              : currentDay
                              ? isDarkMode
                                ? "text-[#FF3B30] font-black bg-white/10"
                                : "text-[#FF3B30] font-black bg-red-50"
                              : isDarkMode
                              ? "text-white/90 hover:bg-white/10"
                              : "text-[#1C1C1E] hover:bg-black/5"
                          }`}
                        >
                          {dayNum}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* Time Segment Control */}
            <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#8E8E93]" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8E8E93]">
                  TIME
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* 2-Digit HH:MM Inputs */}
                <div
                  className={`flex items-center px-2 py-1 rounded-[10px] border font-mono text-[13px] font-bold ${
                    isDarkMode
                      ? "bg-[#2C2C2E] border-white/10 text-white"
                      : "bg-[#F2F2F7] border-black/[0.08] text-[#1C1C1E]"
                  }`}
                >
                  <input
                    type="text"
                    maxLength={2}
                    value={hour}
                    onChange={handleHourChange}
                    placeholder="09"
                    className="w-[20px] bg-transparent text-center focus:outline-none focus:text-[#FF3B30]"
                  />
                  <span className="px-0.5 text-[#8E8E93]">:</span>
                  <input
                    type="text"
                    maxLength={2}
                    value={minute}
                    onChange={handleMinuteChange}
                    placeholder="00"
                    className="w-[20px] bg-transparent text-center focus:outline-none focus:text-[#FF3B30]"
                  />
                </div>

                {/* Native iOS AM/PM Segmented Switch */}
                <div
                  className={`flex p-0.5 rounded-[10px] border ${
                    isDarkMode
                      ? "bg-[#2C2C2E] border-white/10"
                      : "bg-[#E3E3E8] border-black/[0.06]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setAmpm("AM")}
                    className={`px-2 py-0.5 rounded-[8px] text-[11px] font-bold transition-all cursor-pointer ${
                      ampm === "AM"
                        ? isDarkMode
                          ? "bg-[#3A3A3C] text-white shadow-xs"
                          : "bg-white text-[#1C1C1E] shadow-xs"
                        : "text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmpm("PM")}
                    className={`px-2 py-0.5 rounded-[8px] text-[11px] font-bold transition-all cursor-pointer ${
                      ampm === "PM"
                        ? isDarkMode
                          ? "bg-[#3A3A3C] text-white shadow-xs"
                          : "bg-white text-[#1C1C1E] shadow-xs"
                        : "text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions Confirmation Bar */}
            <div className="mt-3.5 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors cursor-pointer ${
                  isDarkMode
                    ? "text-white/60 hover:text-white hover:bg-white/10"
                    : "text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-black/5"
                }`}
              >
                Cancel
              </button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={handleConfirm}
                className="px-4 py-1.5 rounded-full bg-[#FF3B30] hover:bg-[#E02E24] text-white text-[12px] font-black tracking-wide flex items-center gap-1.5 shadow-[0_4px_14px_rgba(255,59,48,0.35)] transition-all cursor-pointer"
              >
                <Check size={13} className="stroke-[3]" />
                <span>Confirm Slot</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default AppleCalendarPicker;

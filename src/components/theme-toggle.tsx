/**
 * 테마 토글 버튼 컴포넌트
 *
 * Dark/Light 테마를 전환할 수 있는 버튼 컴포넌트입니다.
 * 현재 테마에 따라 아이콘이 변경되며, 부드러운 애니메이션 효과를 제공합니다.
 */

"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />
    );
  }

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-900 transition-all duration-200 hover:bg-gray-50 hover:scale-105 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
      aria-label="테마 전환"
    >
      {/* Sun 아이콘 (Light 모드일 때 표시) */}
      <Sun
        className={`h-5 w-5 transition-all duration-300 ${
          theme === "light"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        }`}
      />

      {/* Moon 아이콘 (Dark 모드일 때 표시) */}
      <Moon
        className={`absolute h-5 w-5 transition-all duration-300 ${
          theme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
      />

      {/* 호버 효과를 위한 배경 */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </button>
  );
}

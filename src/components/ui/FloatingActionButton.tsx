"use client";

import { FaPlus } from "react-icons/fa";

interface FloatingActionButtonProps {
  onClick?: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed right-6 bottom-20 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-all duration-200 hover:bg-emerald-600 active:scale-95"
      aria-label="일정 추가"
    >
      <FaPlus className="text-xl" />
    </button>
  );
}

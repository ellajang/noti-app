"use client";

import React from "react";
import clsx from "clsx";

type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  shape?: "default" | "rounded" | "pill";
  onClick?: () => void;
  className?: string;
};

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = true,
  disabled = false,
  loading = false,
  shape = "default",
  onClick,
  className,
}: ButtonProps) {
  const baseStyle =
    "font-medium transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed";

  // 버튼 크기
  const sizeStyles = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
  };

  // 색상 스타일
  const variantStyles = {
    primary: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600",
    outline: "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50",
  };

  // 모양 스타일
  const shapeStyles = {
    default: "rounded-xl",
    rounded: "rounded-full",
    pill: "rounded-3xl",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        baseStyle,
        sizeStyles[size],
        variantStyles[variant],
        shapeStyles[shape],
        fullWidth && "w-full",
        className,
      )}
    >
      {loading ? "처리 중…" : children}
    </button>
  );
}

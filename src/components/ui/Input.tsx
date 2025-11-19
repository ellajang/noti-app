"use client";

import * as React from "react";
import clsx from "clsx";

type Size = "sm" | "md" | "lg";

export interface CustomInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  size?: Size;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  fullWidth?: boolean;
}

const sizeMap: Record<Size, string> = {
  sm: "h-9 text-sm px-3",
  md: "h-12 text-[15px] px-4",
  lg: "h-14 text-base px-5",
};

const slotHeightMap: Record<Size, string> = {
  sm: "h-9",
  md: "h-12",
  lg: "h-14",
};

export const Input = React.forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      id,
      label,
      hint,
      error,
      size = "md",
      leftSlot,
      rightSlot,
      className,
      fullWidth = true,
      ...props
    },
    ref,
  ) => {
    const base =
      "w-full rounded-xl border outline-none ring-0 bg-white text-gray-900 placeholder-gray-400 transition focus:ring-2";
    const okBorder = "border-gray-300 focus:border-emerald-500 focus:ring-emerald-200";
    const errBorder = "border-red-400 focus:border-red-500 focus:ring-red-200";

    return (
      <div className={clsx(fullWidth && "w-full")}>
        {label && (
          <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div
          className={clsx(
            "flex items-stretch gap-2", // 버튼과 나란히 정렬
            fullWidth && "w-full",
          )}
        >
          {leftSlot && (
            <div className={clsx("flex shrink-0 items-stretch [&>*]:h-full", slotHeightMap[size])}>
              {leftSlot}
            </div>
          )}

          <input
            id={id}
            ref={ref}
            aria-invalid={!!error}
            className={clsx("flex-1", base, sizeMap[size], error ? errBorder : okBorder, className)}
            {...props}
          />

          {rightSlot && (
            <div className={clsx("flex shrink-0 items-stretch [&>*]:h-full", slotHeightMap[size])}>
              {rightSlot}
            </div>
          )}
        </div>

        {/* 메시지 영역 */}
        {error ? (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-green-600">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

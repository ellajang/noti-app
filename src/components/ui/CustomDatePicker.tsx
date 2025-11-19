"use client";

import dynamic from "next/dynamic";
import "@pooleno/react-mobile-datepicker/dist/main.css";

type Unit = "year" | "month" | "date" | "hour" | "minute" | "second";

const RMDatePicker = dynamic(() => import("@pooleno/react-mobile-datepicker"), { ssr: false });

type Props = {
  isOpen: boolean;
  value?: Date;
  onSelect: (d: Date) => void;
  onCancel: () => void;
  min?: Date;
  max?: Date;
};

export default function CustomDatePicker({ isOpen, value, onSelect, onCancel, min, max }: Props) {
  if (!isOpen) return null;

  const units: Unit[] = ["year", "month", "date"];

  return (
    <RMDatePicker
      value={value ?? new Date()}
      onSelect={onSelect}
      onCancel={onCancel}
      min={min ?? new Date(1950, 0, 1)}
      max={max ?? new Date()}
      dateConfig={units}
      theme="ios"
      showHeader
      showCaption
      confirmText="확인"
      cancelText="취소"
    />
  );
}

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
};

export default function CustomTimePicker({ isOpen, value, onSelect, onCancel }: Props) {
  if (!isOpen) return null;

  const units: Unit[] = ["hour", "minute"];

  return (
    <RMDatePicker
      value={value ?? new Date()}
      onSelect={onSelect}
      onCancel={onCancel}
      dateConfig={units}
      theme="ios"
      showHeader
      confirmText="확인"
      cancelText="취소"
    />
  );
}

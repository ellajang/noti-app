"use client";

import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  title?: string;
  /** 예전 방식 */
  message?: string;
  /** 새 이름 (message와 병행 지원) */
  description?: string;
  /** 확인 버튼 클릭 */
  onConfirm: () => void;
  /** 닫기(취소) 버튼/오버레이/ESC */
  onClose?: () => void;
  /** 버튼 라벨 */
  confirmText?: string;
  cancelText?: string;
  /** 버튼 개수 제어: true면 닫기+확인, false면 확인만 */
  showCancel?: boolean;
};

export function AlertDialog({
  open,
  title = "알림",
  message,
  description,
  onConfirm,
  onClose,
  confirmText = "확인",
  cancelText = "닫기",
  showCancel, // undefined면 onClose 유무로 자동 결정
}: Props) {
  if (!open) return null;

  const body = description ?? message ?? "";

  const renderCancel = typeof showCancel === "boolean" ? showCancel : Boolean(onClose); // 기본: onClose가 있으면 보임

  const overlay = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/50" onClick={() => onClose?.()} />
      <div className="relative w-[90%] max-w-[380px] rounded-2xl bg-white p-5 shadow-xl">
        {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
        <p className="mt-3 text-sm text-gray-700">{body}</p>

        <div className={`mt-5 flex ${renderCancel ? "justify-end gap-2" : "justify-center"}`}>
          {renderCancel && (
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-gray-300 px-4 text-sm"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 rounded-xl bg-emerald-500 px-4 text-sm text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined" ? createPortal(overlay, document.body) : overlay;
}

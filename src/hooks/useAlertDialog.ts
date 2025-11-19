import { useState } from "react";

export function useAlertDialog() {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [onAlertConfirm, setOnAlertConfirm] = useState<() => void>(() => () => {});

  const showAlert = (message: string, onConfirm?: () => void) => {
    setAlertMsg(message);
    setOnAlertConfirm(() => onConfirm || (() => {}));
    setAlertOpen(true);
  };

  const closeAlert = () => {
    setAlertOpen(false);
    onAlertConfirm();
  };

  return {
    alertOpen,
    alertMsg,
    showAlert,
    closeAlert,
  };
}

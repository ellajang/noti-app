import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormData } from "@/lib/schemas/signup";
import { useState } from "react";

export function useSignupForm() {
  const [openPicker, setOpenPicker] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      nickname: "",
      fullName: "",
      userId: "",
      password: "",
      confirm: "",
      birth: "",
    },
  });

  return {
    form,
    openPicker,
    setOpenPicker,
  };
}

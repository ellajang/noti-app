import { z } from "zod";

export const signupSchema = z
  .object({
    nickname: z.string().min(1, "닉네임을 입력해주세요"),
    fullName: z.string().min(2, "이름을 2자 이상 입력해주세요"),
    userId: z.string().email("올바른 이메일 형식이 아니에요"),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 해요"),
    confirm: z.string(),
    birth: z.string().min(1, "생년월일을 선택해주세요"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirm"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

import { z } from "zod";

/**
 * 이벤트 생성/수정 폼 공용 zod 스키마.
 * event_date는 <input type="datetime-local"> 값을 그대로 받는 문자열이다.
 */
export const eventFormSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요")
    .max(100, "제목은 최대 100자까지 입력할 수 있어요"),
  location: z
    .string()
    .min(1, "장소를 입력해주세요")
    .max(100, "장소는 최대 100자까지 입력할 수 있어요"),
  event_date: z.string().min(1, "날짜를 선택해주세요"),
  description: z
    .string()
    .max(1000, "설명은 최대 1000자까지 입력할 수 있어요")
    .optional()
    .or(z.literal("")),
  cover_image_url: z
    .string()
    .url("올바른 URL 형식이 아니에요")
    .optional()
    .or(z.literal("")),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

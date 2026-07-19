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

/**
 * 커버 이미지는 <Input type="file">로 전송되어 폼 액션의 FormData에 별도 필드로
 * 포함되므로(react-hook-form이 관리하지 않는 uncontrolled 필드), 텍스트 필드만
 * 검증하는 서브셋 스키마. 클라이언트 폼(react-hook-form)과 Server Action
 * (app/actions/events.ts) 양쪽에서 동일하게 재사용해 검증 로직을 일치시킨다.
 */
export const eventTextFieldsSchema = eventFormSchema.omit({
  cover_image_url: true,
});

export type EventTextFieldValues = z.infer<typeof eventTextFieldsSchema>;

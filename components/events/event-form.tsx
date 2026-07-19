"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  eventTextFieldsSchema,
  type EventTextFieldValues,
} from "@/lib/schemas/event";
import {
  createEvent,
  updateEvent,
  type EventActionState,
} from "@/app/actions/events";

interface EventFormProps {
  mode: "create" | "edit";
  eventId?: string;
  defaultValues?: Partial<EventTextFieldValues>;
  /** 수정 모드에서 기존 커버 이미지 미리보기 초기값으로 사용한다. */
  defaultCoverImageUrl?: string | null;
}

const EMPTY_VALUES: EventTextFieldValues = {
  title: "",
  location: "",
  event_date: "",
  description: "",
};

const INITIAL_STATE: EventActionState = { success: false, message: "" };

const ACCEPTED_COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_COVER_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * 이벤트 생성/수정 공용 폼.
 * 텍스트 필드는 react-hook-form + zod로 클라이언트 검증한 뒤 통과했을 때만
 * FormData를 직접 구성해 useActionState(createEvent | updateEvent)로 제출한다
 * (forms-react-hook-form.md의 LoginForm 패턴). 커버 이미지는 RHF가 관리하지
 * 않는 별도의 파일 input에서 ref로 읽어와 FormData에 수동으로 추가한다.
 */
export function EventForm({
  mode,
  eventId,
  defaultValues,
  defaultCoverImageUrl,
}: EventFormProps) {
  const action =
    mode === "create" ? createEvent : updateEvent.bind(null, eventId!);
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaultCoverImageUrl ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EventTextFieldValues>({
    resolver: zodResolver(eventTextFieldsSchema),
    defaultValues: { ...EMPTY_VALUES, ...defaultValues },
  });

  // 서버에서 반환된 필드 에러를 react-hook-form 에러로 연동한다.
  useEffect(() => {
    if (state.errors) {
      Object.entries(state.errors).forEach(([field, messages]) => {
        if (!messages?.length) return;
        form.setError(field as keyof EventTextFieldValues, {
          type: "server",
          message: messages[0],
        });
      });
    }
    if (!state.success && state.message && !state.errors) {
      toast.error(state.message);
    }
  }, [state, form]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_COVER_TYPES.includes(file.type)) {
      toast.error("jpg, png, webp 형식의 이미지만 업로드할 수 있어요");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_COVER_SIZE_BYTES) {
      toast.error("이미지 용량은 5MB 이하여야 해요");
      e.target.value = "";
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
  }

  function onSubmit(data: EventTextFieldValues) {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("location", data.location);
    formData.append("event_date", data.event_date);
    formData.append("description", data.description ?? "");

    const file = fileInputRef.current?.files?.[0];
    if (file) {
      formData.append("cover_image", file);
    }

    // useActionState의 dispatch 함수를 <form action>이 아닌 곳(핸들러 내부)에서
    // 직접 호출할 때는 반드시 startTransition으로 감싸야 한다. 그렇지 않으면
    // "async function with useActionState was called outside of a transition" 에러가 발생한다.
    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input placeholder="이벤트 제목을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>장소</FormLabel>
              <FormControl>
                <Input placeholder="이벤트 장소를 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="event_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>일시</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="이벤트에 대한 설명을 입력하세요 (선택)"
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="cover_image">커버 이미지 (선택)</Label>
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- 로컬 object URL과 기존 원격 URL을 동일하게 즉시 미리보기해야 해서 next/image 최적화 대상이 아니다.
              <img
                src={previewUrl}
                alt="커버 이미지 미리보기"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <ImageOff className="size-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <Input
            id="cover_image"
            name="cover_image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isPending || form.formState.isSubmitting}
        >
          {isPending
            ? "저장 중..."
            : mode === "create"
              ? "이벤트 만들기"
              : "저장하기"}
        </Button>
      </form>
    </Form>
  );
}

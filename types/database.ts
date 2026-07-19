/**
 * Supabase 클라이언트 제네릭 파라미터(createClient<Database>())용 타입 정의.
 * 여기 정의된 Row/Insert/Update는 DB 컬럼 그대로의 원시 타입이며,
 * 프론트엔드 도메인 타입(User, Event, EventParticipant 등)은 types/user.ts 등에 별도로 존재한다.
 */

export type UsersRow = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

export type EventsRow = {
  id: string;
  title: string;
  description: string | null;
  location: string;
  event_date: string;
  cover_image_url: string | null;
  invite_code: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type EventParticipantsRow = {
  id: string;
  event_id: string;
  user_id: string;
  role: string;
  joined_at: string;
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UsersRow;
        // id는 auth.users(id)를 그대로 참조하므로 기본값이 없어 필수, role은 DB default('user')가 있어 선택.
        Insert: Omit<UsersRow, "role" | "created_at" | "updated_at"> & {
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UsersRow, "id">>;
        Relationships: [];
      };
      events: {
        Row: EventsRow;
        // id는 gen_random_uuid() 기본값, status는 default('upcoming')가 있어 선택.
        Insert: Omit<
          EventsRow,
          "id" | "status" | "created_at" | "updated_at"
        > & {
          id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<EventsRow, "id">>;
        Relationships: [];
      };
      event_participants: {
        Row: EventParticipantsRow;
        // id는 gen_random_uuid(), joined_at은 default(now()) 기본값이 있어 선택.
        Insert: Omit<EventParticipantsRow, "id" | "joined_at"> & {
          id?: string;
          joined_at?: string;
        };
        Update: Partial<Omit<EventParticipantsRow, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

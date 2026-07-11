export type UserRole = "user" | "admin";

export type User = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

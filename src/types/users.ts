import { type UserDefaultSort } from "./base";
import { type RoleResponse } from "./roles";

export type SearchMode = "similar" | "any";

export interface UserTokenResponse {
  id: string;
  token: string;
  user_id: string;
  created_at: string;
}

export interface UserCreate {
  id: string;
  nickname?: string;
  discord_id?: string;
  is_superuser?: boolean;
}

export interface UserUpdate {
  nickname?: string;
  discord_id?: string;
  is_superuser?: boolean;
  biography?: string;
}

export interface UserUpdateRequest {
  nickname?: string;
  minecraftUuid?: string;
  biography?: string;
  lang?: string;
}

export interface UserResponse {
  id: string;
  discord_id?: string;
  nickname?: string; // New API property
  minecraftUuid?: string; // New API property
  role?: string; // New API property
  verified?: boolean; // New API property
  balance?: number; // New API property
  lang?: string; // New API property
  email?: string; // New API property
  biography?: string;
  created_at?: string;
  updated_at?: string;

  roles?: RoleResponse[];
}

export interface UserFilterParams {
  user_id?: string;
  discord_id?: string;
  nickname?: string;
  is_superuser?: boolean;
  role_name?: string;
}

export type UserSort =
  | UserDefaultSort
  | "nickname"
  | "discord_id"
  | "role_weight";

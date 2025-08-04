import { type UserDefaultSort } from "./base";

export type PunishmentType = "warn" | "mute" | "ban" | "kick" | "restriction";

export type PunishmentStatus = "active" | "expired" | "revoked";

export type PunishmentSort =
  | UserDefaultSort
  | "type"
  | "status"
  | "user_id"
  | "expires_at";

export interface PunishmentMetadata {
  reason?: string;
  admin_note?: string;
  duration?: number;
  channel_id?: string;
  role_id?: string;
  custom_data?: Record<string, string | number | boolean | null>;
}

export interface PunishmentBase {
  id: string;
  user_id: string;
  admin_id?: string;
  type: PunishmentType;
  status: PunishmentStatus;
  reason?: string;
  expires_at?: Date;
  config_id?: string;
  metadata?: PunishmentMetadata;
}

export type PunishmentCreate = PunishmentBase;

export interface PunishmentUpdate {
  status?: PunishmentStatus;
  reason?: string;
  expires_at?: Date;
  metadata?: PunishmentMetadata;
}

export interface PunishmentResponse extends PunishmentBase {
  created_at: Date;
  updated_at: Date;
}

export interface PunishmentFilterParams {
  user_id?: string;
  admin_id?: string;
  type?: PunishmentType;
  status?: PunishmentStatus;
  min_created_at?: Date;
  max_created_at?: Date;
  min_expires_at?: Date;
  max_expires_at?: Date;
  config_id?: string;
}

export interface PunishmentConfigBase {
  name: string;
  description?: string;
  is_active: boolean;
  warn_threshold: number;
  warn_decay_days: number;
  config_data: PunishmentMetadata;
}

export type PunishmentConfigCreate = PunishmentConfigBase;

export interface PunishmentConfigUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
  warn_threshold?: number;
  warn_decay_days?: number;
  config_data?: PunishmentMetadata;
}

export interface PunishmentConfigResponse extends PunishmentConfigBase {
  id: string;
  created_at: Date;
  updated_at: Date;
}

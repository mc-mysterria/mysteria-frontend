export type PunishmentType = "warn" | "mute" | "ban" | "kick" | "restriction";

export type PunishmentStatus = "active" | "expired" | "revoked";

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
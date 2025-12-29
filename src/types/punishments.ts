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


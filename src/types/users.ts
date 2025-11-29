import {type RoleResponse} from "./roles";

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
    avatarUrl?: string;

    roles?: RoleResponse[];
}
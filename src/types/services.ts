import {type UserDefaultSort} from "./base";
import {type Decimal} from "decimal.js";

export type ServiceSort = UserDefaultSort | "name" | "price";

export enum ServiceType {
    ITEM = "ITEM",
    DUNGEON_KEYS = "DUNGEON_KEYS",
    PERMISSION = "PERMISSION",
    SUBSCRIPTION = "SUBSCRIPTION",
    DISCORD_ROLE = "DISCORD_ROLE",
    APPEAL = "APPEAL",
    COSMETIC = "COSMETIC",
}

export interface ServicePoint {
    text: string;
    tooltip?: string;
}

export interface ServiceDiscount {
    user_id?: string;
    discount_percent: number;
    start_date: Date;
    end_date?: Date;
    reason?: string;
}

export interface ServerAvailability {
    mode: "all" | "specific" | "selectable";
    servers: string[] | null;
}

export interface ServiceMetadata {
    data?: Record<string, unknown>;
    features?: {
        neutral?: boolean;
        town_create?: boolean;
        town_rename?: boolean;
        map_color?: boolean;
        area_discount?: string;
        pvp_toggle?: boolean;
        fire_toggle?: boolean;
        mobs_toggle?: boolean;
        animal_revival?: string;
        cosmetic_tokens?: string;
        roleplay_commands?: string;
        colored_chat?: boolean;
        hide_on_map?: boolean;
        plants_placement?: boolean;
        mc_discord_chat?: boolean;
        bonus?: string;
        [key: string]: string | boolean | undefined;
    };
}

// New API service interface based on ServiceDto
export interface ServiceBase {
    id: number; // API uses integer ID
    name: string;
    description?: string;
    price: number; // API uses number, not Decimal
    durationDays?: number; // API uses durationDays instead of duration_months
    type: ServiceType;
    isSubscription?: boolean; // API uses isSubscription boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any>; // API uses generic metadata object
    isActive: boolean; // API uses isActive
    createdAt?: string; // API timestamp
}

// Legacy interface for compatibility with existing components
export interface ServiceResponse {
    id: string;
    name: string;
    display_name?: string;
    description?: string;
    points?: ServicePoint[];
    image?: string;
    price: Decimal;
    is_active: boolean;
    category?: string;
    type: ServiceType;
    duration_months?: number;
    is_upgradable?: boolean;
    upgrade_from?: string;
    upgrade_to?: string;
    service_metadata?: ServiceMetadata;
    discounts?: ServiceDiscount[];
    server_availability?: ServerAvailability;
    created_at?: Date;
    updated_at?: Date;
    slug_name?: string; // For consistent URL generation regardless of language
}

// New API DTOs
export interface CreateServiceDto {
    name: string;
    description?: string;
    price: number;
    durationDays?: number;
    type: ServiceType;
    isSubscription?: boolean;
    apiCallbackUrl?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any>;
}

export interface ServiceDto {
    id: number;
    name: string;
    description?: string;
    nameEn?: string;
    nameUk?: string;
    descriptionEn?: string;
    descriptionUk?: string;
    bulletPointsEn?: string[];
    bulletPointsUk?: string[];
    imageUrl?: string;
    price: number;
    durationDays?: number;
    type: ServiceType;
    isSubscription: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any>;
    isActive: boolean;
    createdAt: string;
}

// Purchase related DTOs
export interface PurchaseRequest {
    serviceId: number;
}

export interface PurchaseDto {
    id: string;
    userId: string;
    service: ServiceDto;
    paidAmount: number;
    purchaseDate: string;
    expiresAt?: string;
    delivered: boolean;
    notes?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any>;
}

export type ServiceCreate = CreateServiceDto;
export type ServiceUpdate = Partial<CreateServiceDto>;

export interface ServiceFilterParams {
    is_active?: boolean;
    category?: string;
    name?: string;
    type?: ServiceType;
    is_upgradable?: boolean;
}

// Service markdown content DTOs
export interface ServiceMarkdownDto {
    id: number;
    name: string;
    slug: string | null;
    nameEn?: string;
    nameUk?: string;
    markdownContent: string | null;
    markdownContentEn?: string;
    markdownContentUk?: string;
    imageUrl?: string;
    price: number;
    type: ServiceType;
    isSubscription: boolean;
    createdAt: string;
    updatedAt: string | null;
    publishedAt?: string | null;
}

export interface CreateServiceMarkdownDto {
    slug: string;
    markdownContentEn?: string;
    markdownContentUk?: string;
    isPublished?: boolean;
}

export interface UpdateServiceMarkdownDto {
    slug?: string;
    markdownContentEn?: string;
    markdownContentUk?: string;
    isPublished?: boolean;
}

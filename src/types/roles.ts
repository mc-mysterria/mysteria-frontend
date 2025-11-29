export interface RoleResponse {
    id: string;
    name: string;
    display_name?: string;
    permissions: Array<{ [key: string]: boolean }>;
    weight: number;
    created_at: string;
    updated_at: string;
}

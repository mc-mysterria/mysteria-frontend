import {type APIResponse, BaseCRUD} from "./base";
import type {AdjustBalanceRequest, ChangeUserRoleRequest, ChangeUserRoleResponse, TransactionDto,} from "@/types/admin";
import type {UserProfileDto} from "@/types/auth";
import type {Page} from "@/types/base";

class AdminAPI extends BaseCRUD<never, never, never, never> {
    constructor() {
        super("/admin");
    }

    /**
     * Get all users (admin only)
     *
     * Endpoint: GET /api/admin/users
     *
     * @param page - Page number (0-indexed)
     * @param size - Number of items per page
     * @param search - Optional search query
     * @param sort - Optional sort fields (e.g., "createdAt,desc")
     * @returns Paginated list of users
     */
    async getUsers(
        page: number = 0,
        size: number = 20,
        search?: string,
        sort?: string
    ): Promise<APIResponse<Page<UserProfileDto>>> {
        const params: Record<string, string | number> = {
            page,
            size,
        };

        if (search) {
            params.search = search;
        }

        if (sort) {
            params.sort = sort;
        }

        return this.request<Page<UserProfileDto>>("GET", "/users", { params });
    }

    /**
     * Get a specific user by ID (admin only)
     *
     * Endpoint: GET /api/admin/users/{userId}
     *
     * @param userId - The ID of the user to retrieve
     * @returns User profile information
     */
    async getUser(userId: string): Promise<APIResponse<UserProfileDto>> {
        return this.request<UserProfileDto>("GET", `/users/${userId}`);
    }

    /**
     * Change a user's role
     *
     * Endpoint: PUT /api/admin/users/{userId}/role
     *
     * This operation is idempotent - calling it multiple times with the same
     * role will have the same effect as calling it once.
     *
     * @param userId - The ID of the user whose role should be changed
     * @param roleName - The name of the new role (e.g., "MODERATOR", "USER", "ADMIN")
     * @returns The response containing role change details
     */
    async changeUserRole(
        userId: string,
        roleName: string
    ): Promise<APIResponse<ChangeUserRoleResponse>> {
        return this.request<ChangeUserRoleResponse>(
            "PUT",
            `/users/${userId}/role`,
            {body: {roleName} as ChangeUserRoleRequest}
        );
    }

    /**
     * Adjust a user's balance
     *
     * Endpoint: PUT /api/admin/users/{userId}/balance
     *
     * This operation is idempotent - calling it multiple times with the same
     * parameters will have the same effect as calling it once.
     *
     * @param userId - The ID of the user whose balance should be adjusted
     * @param amount - The amount to adjust (can be positive or negative)
     * @param reason - The reason for the balance adjustment
     * @returns Transaction details including the new balance
     */
    async adjustUserBalance(
        userId: string,
        amount: number,
        reason: string
    ): Promise<APIResponse<TransactionDto>> {
        return this.request<TransactionDto>(
            "PUT",
            `/users/${userId}/balance`,
            {body: {amount, reason} as AdjustBalanceRequest}
        );
    }
}

export const adminAPI = new AdminAPI();

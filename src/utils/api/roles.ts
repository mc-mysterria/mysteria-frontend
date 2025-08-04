import { BaseCRUD } from "./base";
import type { RoleResponse } from "@/types/roles";

export interface RoleCreateRequest {
  name: string;
  display_name?: string;
  weight?: number;
}

export interface RoleUpdateRequest {
  name?: string;
  display_name?: string;
  weight?: number;
}

export interface RoleFilter {
  name?: string;
  display_name?: string;
  weight?: number;
  min_weight?: number;
  max_weight?: number;
}

export class RoleAPI extends BaseCRUD<
  RoleResponse,
  RoleCreateRequest,
  RoleUpdateRequest,
  RoleFilter
> {
  constructor() {
    super("/roles");
  }

  async getAllRoles(): Promise<RoleResponse[]> {
    const response = await this.getList();
    return response.data;
  }

  async getRoleByName(name: string): Promise<RoleResponse | null> {
    try {
      const response = await this.getList("", {
        params: { name, limit: 1 },
      });
      return response.data[0] || null;
    } catch (error) {
      console.error("Error fetching role by name:", error);
      return null;
    }
  }

  async getUsersWithRole(roleId: string, page = 1, size = 50) {
    const response = await this.request<unknown[]>("GET", `/${roleId}/users`, {
      params: { page, size },
    });
    return response.data;
  }

  async getUsersByRoleNames(
    roleNames: string[],
    matchAll = false,
    page = 1,
    size = 50,
  ) {
    const response = await this.request<unknown[]>("GET", "/users-by-names", {
      params: {
        role_names: roleNames.join(","),
        match_all: matchAll,
        page,
        size,
      },
    });
    return response.data;
  }
}

export const roleAPI = new RoleAPI();

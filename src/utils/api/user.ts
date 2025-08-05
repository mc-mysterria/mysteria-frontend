import { BaseCRUD } from "./base";
import type { AuthUser } from "@/types/auth";

export interface UserCreateRequest {
  discord_id: string;
  nickname?: string;
  is_active?: boolean;
}

export interface UserUpdateRequest {
  nickname?: string;
  is_active?: boolean;
  biography?: string;
  lang?: string;
}

export interface UserFilter {
  discord_id?: string;
  nickname?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

export class UserAPI extends BaseCRUD<
  AuthUser,
  UserCreateRequest,
  UserUpdateRequest,
  UserFilter
> {
  constructor() {
    super("/users");
  }

  async getCurrentUser(): Promise<AuthUser> {
    const response = await this.request<AuthUser>("GET", "/me");
    return response.data;
  }

  async searchByNickname(nickname: string): Promise<AuthUser | null> {
    try {
      const response = await this.request<AuthUser>("GET", `/search/nickname`, {
        params: { nickname },
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  }

  async updateCurrentUser(data: UserUpdateRequest): Promise<AuthUser> {
    const response = await this.request<AuthUser>("PUT", "/me", {
      body: data,
    });
    return response.data;
  }

  async updateMinecraftNickname(
    userId: string | "me",
    nickname: string,
  ): Promise<AuthUser> {
    const response = await this.request<AuthUser>(
      "POST",
      "/me/set-minecraft-nickname",
      {
        body: { nickname: nickname },
      },
    );
    return response.data;
  }

  async searchUsers(query: string): Promise<AuthUser[]> {
    const response = await this.getList("", {
      params: {
        limit: 25,
        nickname: query,
      },
    });
    return response.data;
  }
}

export const userAPI = new UserAPI();

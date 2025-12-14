import {type APIResponse, BaseCRUD} from "./base";
import type {UserSearchDto} from "@/types/users";

class UsersAPI extends BaseCRUD<UserSearchDto, never, never, never> {
    constructor() {
        super("/user");
    }

    async searchUsers(query: string): Promise<APIResponse<UserSearchDto[]>> {
        return this.request<UserSearchDto[]>("GET", "/search", {
            params: {q: query}
        });
    }
}

export const usersAPI = new UsersAPI();

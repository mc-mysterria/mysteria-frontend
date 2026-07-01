import {type APIResponse, BaseCRUD} from "./base";
import type {StaffMember} from "@/types/staff";

class MembersAPI extends BaseCRUD<StaffMember, never, never, never> {
    constructor() {
        super("/members");
    }

    async getMembers(minPriority?: number): Promise<APIResponse<StaffMember[]>> {
        return this.request<StaffMember[]>("GET", "", {
            params: minPriority !== undefined ? {minPriority} : undefined,
            isList: true,
        });
    }
}

export const membersAPI = new MembersAPI();

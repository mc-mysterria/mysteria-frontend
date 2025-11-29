import type {APIResponse} from "./base";
import {BaseCRUD} from "./base";
import type {ServiceCreate, ServiceFilterParams, ServiceResponse, ServiceUpdate,} from "@/types/services";

class ServiceAPI extends BaseCRUD<
    ServiceResponse,
    ServiceCreate,
    ServiceUpdate,
    ServiceFilterParams
> {
    constructor() {
        super("shop/services");
    }

    async getAffordable(): Promise<APIResponse<ServiceResponse[]>> {
        return this.request<ServiceResponse[]>("GET", "/affordable");
    }
}

export const serviceAPI = new ServiceAPI();

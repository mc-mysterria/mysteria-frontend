import { BaseCRUD } from "./base";
import type {
  ServiceResponse,
  ServiceFilterParams,
  ServiceUpdate,
  ServiceCreate,
} from "@/types/services";
import type { APIResponse } from "./base";

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

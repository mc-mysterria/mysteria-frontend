import { BaseCRUD } from "./base";
import type {
  BalanceResponse,
  BalanceFilterParams,
  BalanceUpdate,
  UserTotalBalanceResponse,
} from "@/types/balance";
import type {
  TransactionResponse,
  TransactionFilterParams,
  TransactionUpdate,
  TransactionCreate,
} from "@/types/transactions";
import type {
  ServiceResponse,
  ServiceFilterParams,
  ServiceUpdate,
  ServiceCreate,
} from "@/types/services";
import type { APIResponse } from "./base";

class BalanceAPI extends BaseCRUD<
  BalanceResponse,
  BalanceResponse,
  BalanceUpdate,
  BalanceFilterParams
> {
  constructor() {
    // Update to match new API: /api/user/balance
    super("user", false);
  }

  async getCurrentUserBalance(): Promise<APIResponse<BalanceResponse>> {
    return this.request<BalanceResponse>("GET", "/api/user/balance", {}, "");
  }

  async getUserTotal(
    userId: string,
  ): Promise<APIResponse<UserTotalBalanceResponse>> {
    return this.request<UserTotalBalanceResponse>(
      "GET",
      `/user/${userId}/total`,
    );
  }

  async getByIdentifier(
    identifier: string,
  ): Promise<APIResponse<BalanceResponse>> {
    return this.request<BalanceResponse>("GET", `/identifier/${identifier}`);
  }
}

class TransactionAPI extends BaseCRUD<
  TransactionResponse,
  TransactionCreate,
  TransactionUpdate,
  TransactionFilterParams
> {
  constructor() {
    // Update to match new API: /api/user/transactions
    super("user", false);
  }

  async getUserTransactions(
    params?: any,
  ): Promise<APIResponse<TransactionResponse[]>> {
    return this.request<TransactionResponse[]>(
      "GET",
      "/api/user/transactions",
      { params },
      "",
    );
  }

  async createTransaction(
    data: TransactionCreate,
  ): Promise<APIResponse<TransactionResponse>> {
    return this.create(data);
  }
}

class ServiceAPI extends BaseCRUD<
  ServiceResponse,
  ServiceCreate,
  ServiceUpdate,
  ServiceFilterParams
> {
  constructor() {
    // Update to match new API: /api/shop/services
    super("shop/services");
  }

  async getActive(): Promise<APIResponse<ServiceResponse[]>> {
    return this.getList("", { filters: { is_active: true } });
  }

  // Add new methods to match the API docs
  async getAffordable(): Promise<APIResponse<ServiceResponse[]>> {
    return this.request<ServiceResponse[]>("GET", "/affordable");
  }
}

// New Shop API to match the purchase endpoints
class ShopAPI extends BaseCRUD<any, any, any, any> {
  constructor() {
    super("shop", false);
  }

  async purchaseService(serviceId: number): Promise<APIResponse<any>> {
    return this.request<any>(
      "POST",
      "/api/shop/purchase",
      { body: { serviceId } },
      "",
    );
  }

  async getPurchases(params?: any): Promise<APIResponse<any[]>> {
    return this.request<any[]>("GET", "/api/shop/purchases", { params }, "");
  }

  async getActivePurchases(): Promise<APIResponse<any[]>> {
    return this.request<any[]>("GET", "/api/shop/purchases/active", {}, "");
  }
}

export const balanceAPI = new BalanceAPI();
export const transactionAPI = new TransactionAPI();
export const serviceAPI = new ServiceAPI();
export const shopAPI = new ShopAPI();

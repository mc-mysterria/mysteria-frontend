import { BaseCRUD, type APIResponse } from "./base";
import type { 
  ServiceDto, 
  ServiceMarkdownDto, 
  CreateServiceDto, 
  UpdateServiceMarkdownDto, 
  CreateServiceMarkdownDto,
  PurchaseRequest,
  PurchaseDto
} from "@/types/services";

class ShopAPI extends BaseCRUD<ServiceDto, CreateServiceDto, Partial<CreateServiceDto>, Record<string, never>> {
  constructor() {
    super("/shop");
  }

  // Get all services
  async getServices(type?: string, lang: string = 'en'): Promise<APIResponse<ServiceDto[]>> {
    const params: Record<string, string> = { lang };
    if (type) {
      params.type = type;
    }
    return this.request<ServiceDto[]>("GET", "/services", { params });
  }

  // Get affordable services for authenticated user
  async getAffordableServices(lang: string = 'en'): Promise<APIResponse<ServiceDto[]>> {
    return this.request<ServiceDto[]>("GET", "/services/affordable", { 
      params: { lang } 
    });
  }

  // Get service markdown content by slug (public access)
  async getServiceContent(slug: string, lang: string = 'en'): Promise<APIResponse<ServiceMarkdownDto>> {
    if (!slug || slug.trim() === '') {
      throw new Error('Invalid slug provided');
    }
    return this.request<ServiceMarkdownDto>("GET", `/services/${slug}/content`, { 
      params: { lang } 
    });
  }

  // Purchase a service
  async purchaseService(request: PurchaseRequest): Promise<APIResponse<PurchaseDto>> {
    return this.request<PurchaseDto>("POST", "/purchase", { body: request });
  }

  // Get purchase history
  async getPurchases(params?: { page?: number; size?: number }): Promise<APIResponse<{ content: PurchaseDto[] }>> {
    return this.request<{ content: PurchaseDto[] }>("GET", "/purchases", { params });
  }

  // Get active purchases
  async getActivePurchases(): Promise<APIResponse<PurchaseDto[]>> {
    return this.request<PurchaseDto[]>("GET", "/purchases/active");
  }

  // Admin methods for service content management
  async getServiceContentAdmin(serviceId: number, lang: string = 'en'): Promise<APIResponse<ServiceMarkdownDto>> {
    return this.request<ServiceMarkdownDto>("GET", `/admin/services/${serviceId}/content`, { 
      params: { lang } 
    });
  }

  async createServiceContent(serviceId: number, data: CreateServiceMarkdownDto): Promise<APIResponse<ServiceMarkdownDto>> {
    return this.request<ServiceMarkdownDto>("POST", `/admin/services/${serviceId}/content`, { body: data });
  }

  async updateServiceContent(serviceId: number, data: UpdateServiceMarkdownDto): Promise<APIResponse<ServiceMarkdownDto>> {
    return this.request<ServiceMarkdownDto>("PUT", `/admin/services/${serviceId}/content`, { body: data });
  }

  // Admin service management
  async createService(data: CreateServiceDto): Promise<APIResponse<ServiceDto>> {
    return this.request<ServiceDto>("POST", "/admin/services", { body: data });
  }
}

export const shopAPI = new ShopAPI();
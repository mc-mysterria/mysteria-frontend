import {type APIResponse, BaseCRUD} from "./base";
import type {
    CreateServiceDto,
    CreateServiceMarkdownDto,
    PurchaseDto,
    PurchaseRequest,
    ServiceDto,
    ServiceMarkdownDto,
    UpdateServiceMarkdownDto
} from "@/types/services";

class ShopAPI extends BaseCRUD<ServiceDto, CreateServiceDto, Partial<CreateServiceDto>, Record<string, never>> {
    constructor() {
        super("/shop");
    }

    // Get affordable services for authenticated user

    // Get service markdown content by slug (public access)
    async getServiceContent(slug: string, lang: string = 'en'): Promise<APIResponse<ServiceMarkdownDto>> {
        if (!slug || slug.trim() === '') {
            throw new Error('Invalid slug provided');
        }
        return this.request<ServiceMarkdownDto>("GET", `/services/${slug}/content`, {
            params: {lang}
        });
    }

    // Purchase a service

    // Get purchase history

    // Get active purchases

    // Admin methods for service content management
    async getServiceContentAdmin(serviceId: number, lang: string = 'en'): Promise<APIResponse<ServiceMarkdownDto>> {
        return this.request<ServiceMarkdownDto>("GET", `/admin/services/${serviceId}/content`, {
            params: {lang}
        });
    }

    async createServiceContent(serviceId: number, data: CreateServiceMarkdownDto): Promise<APIResponse<ServiceMarkdownDto>> {
        return this.request<ServiceMarkdownDto>("POST", `/admin/services/${serviceId}/content`, {body: data});
    }

    async updateServiceContent(serviceId: number, data: UpdateServiceMarkdownDto): Promise<APIResponse<ServiceMarkdownDto>> {
        return this.request<ServiceMarkdownDto>("PUT", `/admin/services/${serviceId}/content`, {body: data});
    }

    // Admin service management
}

export const shopAPI = new ShopAPI();
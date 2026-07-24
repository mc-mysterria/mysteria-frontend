import {type APIResponse, BaseCRUD} from "./base";
import type {
    AdminCommissionResponseDto,
    CommissionResponseDto,
    CommissionSlotDto,
    CommissionStatus,
    SubmitCommissionRequestDto,
    UpdateCommissionReviewDto,
} from "@/types/commissions";

class CommissionsAPI extends BaseCRUD<never, never, never, never> {
    private readonly adminPrefix = "/api/admin/commissions";

    constructor() {
        super("/commissions");
    }

    /**
     * Get the authenticated player's unused (AVAILABLE) commission slots.
     *
     * Endpoint: GET /api/commissions/slots
     */
    async getSlots(): Promise<APIResponse<CommissionSlotDto[]>> {
        return this.request<CommissionSlotDto[]>("GET", "/slots", {isList: true});
    }

    /**
     * Submit a new commission request against one or more AVAILABLE slots.
     *
     * Endpoint: POST /api/commissions
     */
    async submit(body: SubmitCommissionRequestDto): Promise<APIResponse<CommissionResponseDto>> {
        return this.request<CommissionResponseDto>("POST", "", {body});
    }

    /**
     * Get all of the authenticated player's commission requests.
     *
     * Endpoint: GET /api/commissions/mine
     */
    async getMine(): Promise<APIResponse<CommissionResponseDto[]>> {
        return this.request<CommissionResponseDto[]>("GET", "/mine", {isList: true});
    }

    /**
     * Get a single commission request by id. 403 if it's not the caller's.
     *
     * Endpoint: GET /api/commissions/{id}
     */
    async getById(id: string): Promise<APIResponse<CommissionResponseDto>> {
        return this.request<CommissionResponseDto>("GET", `/${id}`);
    }

    /**
     * List commission requests for staff review. Gated by COMMISSIONS:MANAGE.
     *
     * Endpoint: GET /api/admin/commissions?status=
     */
    async adminList(status?: CommissionStatus): Promise<APIResponse<AdminCommissionResponseDto[]>> {
        const params = status ? {status} : undefined;
        return this.request<AdminCommissionResponseDto[]>(
            "GET",
            "",
            {params, isList: true},
            this.adminPrefix,
        );
    }

    /**
     * Update a commission request's review status/notes. Gated by COMMISSIONS:MANAGE.
     * Only send the fields that should change — omitted/undefined fields are left unchanged.
     *
     * Endpoint: PATCH /api/admin/commissions/{id}
     */
    async adminReview(
        id: string,
        body: UpdateCommissionReviewDto,
    ): Promise<APIResponse<AdminCommissionResponseDto>> {
        return this.request<AdminCommissionResponseDto>("PATCH", `/${id}`, {body}, this.adminPrefix);
    }
}

export const commissionsAPI = new CommissionsAPI();

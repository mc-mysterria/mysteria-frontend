export type MajorType = 'LORE_ALIGNMENT' | 'BALANCE_REWORK' | 'NEW_SPELL';

export const MAJOR_TYPES: { value: MajorType; label: string }[] = [
    {value: 'LORE_ALIGNMENT', label: 'Lore Alignment'},
    {value: 'BALANCE_REWORK', label: 'Balance Rework'},
    {value: 'NEW_SPELL', label: 'New Spell'},
];

export type CommissionStatus =
    | 'PENDING_REVIEW'
    | 'APPROVED'
    | 'REJECTED'
    | 'RESCOPE_REQUIRED'
    | 'COMPLETED';

export const COMMISSION_STATUSES: { value: CommissionStatus; label: string }[] = [
    {value: 'PENDING_REVIEW', label: 'Pending Review'},
    {value: 'APPROVED', label: 'Approved'},
    {value: 'REJECTED', label: 'Rejected'},
    {value: 'RESCOPE_REQUIRED', label: 'Rescope Required'},
    {value: 'COMPLETED', label: 'Completed'},
];

export type CommissionSlotStatus = 'AVAILABLE' | 'LINKED' | 'CONSUMED';

export interface CommissionSlotDto {
    id: string;
    status: CommissionSlotStatus;
    purchaseId: string;
    linkedRequestId: string | null;
    createdAt: string;
}

export interface MajorChangeDto {
    targetName: string;
    majorType: MajorType;
    requestedChange: string;
    motivation: string;
    loreReference: string | null;
}

export interface MinorChangeDto {
    targetName: string;
    changeDescription: string;
    motivation: string;
}

// Field limits enforced server-side – mirrored here for client-side validation/counters.
export const COMMISSION_LIMITS = {
    targetName: 128,
    majorRequestedChange: 900,
    majorMotivation: 900,
    majorLoreReference: 500,
    minorChangeDescription: 200,
    minorMotivation: 200,
    majorChangesMax: 2,
    minorChangesMax: 6,
    // Budget rule: 3 × (major count) + (minor count) ≤ budgetMax, at least one change total.
    majorCost: 3,
    minorCost: 1,
    budgetMax: 6,
} as const;

export const computeBudgetUsed = (majorCount: number, minorCount: number): number =>
    majorCount * COMMISSION_LIMITS.majorCost + minorCount * COMMISSION_LIMITS.minorCost;

export interface SubmitCommissionRequestDto {
    majorChanges: MajorChangeDto[];
    minorChanges: MinorChangeDto[];
    slotIds: string[];
    confirmLoreGrounded: boolean;
    confirmNoFundamentalRework: boolean;
    confirmNoNerfOtherCommission: boolean;
    confirmUnderstandsScope: boolean;
}

export interface CommissionResponseDto {
    id: string;
    playerIgn: string;
    majorChanges: MajorChangeDto[];
    minorChanges: MinorChangeDto[];
    status: CommissionStatus;
    commissionsRequired: number | null;
    linkedSlotCount: number;
    staffNotes?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AdminCommissionResponseDto {
    id: string;
    discordId: number;
    discordUsername: string;
    playerIgn: string;
    majorChanges: MajorChangeDto[];
    minorChanges: MinorChangeDto[];
    touchesExistingCommission: boolean;
    status: CommissionStatus;
    staffNotes: string | null;
    assignedDeveloper: string | null;
    commissionsRequired: number | null;
    linkedSlotIds: string[];
    discordTicketChannelId: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateCommissionReviewDto {
    status: CommissionStatus;
    staffNotes?: string | null;
    assignedDeveloper?: string | null;
    commissionsRequired?: number | null;
}

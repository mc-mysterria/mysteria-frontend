export type CommissionRequestType = 'MAJOR' | 'MINOR_BUNDLE';

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

export interface MinorChangeDto {
    targetName: string;
    changeDescription: string;
    motivation: string;
}

// Field limits enforced server-side — mirrored here for client-side validation/counters.
export const COMMISSION_LIMITS = {
    targetName: 128,
    majorRequestedChange: 900,
    majorMotivation: 900,
    majorLoreReference: 500,
    minorChangeDescription: 200,
    minorMotivation: 200,
    minorChangesMin: 1,
    minorChangesMax: 3,
} as const;

export interface SubmitCommissionRequestDto {
    requestType: CommissionRequestType;
    majorTargetName: string | null;
    majorType: MajorType | null;
    majorRequestedChange: string | null;
    majorMotivation: string | null;
    majorLoreReference: string | null;
    minorChanges: MinorChangeDto[] | null;
    slotIds: string[];
    confirmLoreGrounded: boolean;
    confirmNoFundamentalRework: boolean;
    confirmNoNerfOtherCommission: boolean;
    confirmUnderstandsScope: boolean;
}

export interface CommissionResponseDto {
    id: string;
    playerIgn: string;
    requestType: CommissionRequestType;
    status: CommissionStatus;
    commissionsRequired: number | null;
    linkedSlotCount: number;
    staffNotes?: string | null;
    // Not in the documented player-facing contract as of the July 2026 handoff —
    // rendered only if/when the backend starts sending them on this DTO.
    majorTargetName?: string | null;
    majorType?: MajorType | null;
    majorRequestedChange?: string | null;
    majorMotivation?: string | null;
    majorLoreReference?: string | null;
    minorChanges?: MinorChangeDto[] | null;
    createdAt: string;
    updatedAt: string;
}

export interface AdminCommissionResponseDto {
    id: string;
    discordId: number;
    discordUsername: string;
    playerIgn: string;
    requestType: CommissionRequestType;
    majorTargetName: string | null;
    majorType: MajorType | null;
    majorRequestedChange: string | null;
    majorMotivation: string | null;
    majorLoreReference: string | null;
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

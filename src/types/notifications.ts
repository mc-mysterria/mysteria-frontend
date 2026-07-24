export type NotificationType =
    | 'PURCHASE'
    | 'VERIFICATION'
    | 'UNVERIFICATION'
    | 'PUNISHMENT_ISSUED'
    | 'PUNISHMENT_REMOVED'
    | 'COMMISSION_SLOT_AVAILABLE'
    | 'COMMISSION_STATUS_CHANGED';

export type NotificationActionType = 'CREATE_COMMISSION' | 'RESUBMIT_COMMISSION';

export interface NotificationDto {
    id: string;
    type: NotificationType;
    referenceId: string;
    metadata: Record<string, unknown>;
    actionable: boolean;
    actionType?: NotificationActionType;
    read: boolean;
    createdAt: string;
}

import type {NotificationDto, NotificationType} from '@/types/notifications';

export function notificationIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
        PURCHASE: 'fa-solid fa-bag-shopping',
        VERIFICATION: 'fa-solid fa-link',
        UNVERIFICATION: 'fa-solid fa-link-slash',
        PUNISHMENT_ISSUED: 'fa-solid fa-gavel',
        PUNISHMENT_REMOVED: 'fa-solid fa-shield-halved',
        COMMISSION_SLOT_AVAILABLE: 'fa-solid fa-scroll',
        COMMISSION_STATUS_CHANGED: 'fa-solid fa-file-signature',
    };
    return icons[type] || 'fa-solid fa-bell';
}

const fill = (template: string, values: Record<string, unknown>): string =>
    Object.entries(values).reduce(
        (acc, [key, value]) => acc.split(`{${key}}`).join(String(value ?? '')),
        template,
    );

export function buildNotificationText(n: NotificationDto, t: (key: string) => string): string {
    const meta = n.metadata || {};

    switch (n.type) {
        case 'PURCHASE':
            return fill(t('notifications.types.PURCHASE'), {
                serviceName: meta.serviceName,
                amount: meta.amount,
            });
        case 'VERIFICATION':
            return t('notifications.types.VERIFICATION');
        case 'UNVERIFICATION':
            return t('notifications.types.UNVERIFICATION');
        case 'PUNISHMENT_ISSUED':
            return fill(t('notifications.types.PUNISHMENT_ISSUED'), {
                punishmentType: meta.punishmentType,
                reason: meta.reason,
            });
        case 'PUNISHMENT_REMOVED':
            return fill(t('notifications.types.PUNISHMENT_REMOVED'), {
                punishmentType: meta.punishmentType,
            });
        case 'COMMISSION_SLOT_AVAILABLE':
            return t('notifications.types.COMMISSION_SLOT_AVAILABLE');
        case 'COMMISSION_STATUS_CHANGED': {
            const statusKey = `commissions.status.${String(meta.status ?? '')}`;
            const statusLabel = t(statusKey);
            return fill(t('notifications.types.COMMISSION_STATUS_CHANGED'), {
                status: statusLabel === statusKey ? String(meta.status ?? '') : statusLabel,
            });
        }
        default:
            return n.type;
    }
}

export function notificationCtaLabel(n: NotificationDto, t: (key: string) => string): string {
    if (n.actionType === 'CREATE_COMMISSION') return t('notifications.actions.createCommission');
    if (n.actionType === 'RESUBMIT_COMMISSION') return t('notifications.actions.resubmitCommission');
    return '';
}

export function notificationTargetRoute(n: NotificationDto): { path: string; query: Record<string, string> } | null {
    if (n.actionType === 'CREATE_COMMISSION') {
        return {path: '/commissions', query: {slot: n.referenceId}};
    }
    if (n.actionType === 'RESUBMIT_COMMISSION') {
        return {path: '/commissions', query: {resubmit: n.referenceId}};
    }
    return null;
}

export function formatNotificationDate(dateString: string, locale: string): string {
    return new Date(dateString).toLocaleString(locale);
}

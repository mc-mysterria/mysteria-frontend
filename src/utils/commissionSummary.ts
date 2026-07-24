export const formatChangeSummary = (
    majorCount: number,
    minorCount: number,
    t: (key: string) => string,
): string => {
    const parts: string[] = [];
    if (majorCount > 0) parts.push(t('commissions.summary.major').replace('{count}', String(majorCount)));
    if (minorCount > 0) parts.push(t('commissions.summary.minor').replace('{count}', String(minorCount)));
    return parts.join(', ');
};

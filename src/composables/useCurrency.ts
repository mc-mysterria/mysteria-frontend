import {computed, ref, watch} from 'vue';
import {useI18n} from '@/composables/useI18n';
import {isLanguage, LOCALES, storedLanguage} from '@/locales';
import Decimal from 'decimal.js';

export type CurrencyType = 'USD' | 'EUR' | 'POINTS';

const CURRENCY_RATES = {
    USD: 40,   // 1 USD = 40 points
    EUR: 44,   // 1 EUR = 44 points
    POINTS: 1, // 1 point = 1 point
} as const;

const CURRENCY_SYMBOLS = {
    USD: '$',
    EUR: '€',
    POINTS: '',
} as const;

const STORAGE_KEY = 'mysteria-currency-preference';

/**
 * Whether a locale quotes the store in points rather than real currency.
 * Ukrainian does (it tops up through Donatello); English and both Chinese
 * locales do not - Taiwan and Hong Kong players pay by card.
 */
const isPointsOnly = (language: unknown): boolean =>
    isLanguage(language) ? LOCALES[language].pointsOnly : false;

// Initialize from localStorage or default based on language
const getInitialCurrency = (): CurrencyType => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'USD' || stored === 'EUR' || stored === 'POINTS')) {
        return stored as CurrencyType;
    }
    return isPointsOnly(storedLanguage()) ? 'POINTS' : 'USD';
};

const currentCurrency = ref<CurrencyType>(getInitialCurrency());

export function useCurrency() {
    const {currentLanguage} = useI18n();

    // Follow the locale across a points-only boundary, so a reader switching
    // into Ukrainian stops seeing USD prices and vice versa.
    watch(currentLanguage, (newLang, oldLang) => {
        const nowPoints = isPointsOnly(newLang);
        if (nowPoints === isPointsOnly(oldLang)) return;

        if (nowPoints) {
            currentCurrency.value = 'POINTS';
        } else if (currentCurrency.value === 'POINTS') {
            currentCurrency.value = 'USD';
        }
    });

    const setCurrency = (currency: CurrencyType) => {
        currentCurrency.value = currency;
        localStorage.setItem(STORAGE_KEY, currency);
    };

    const convertFromPoints = (points: Decimal | number): Decimal => {
        const pointsDecimal = points instanceof Decimal ? points : new Decimal(points);
        const rate = CURRENCY_RATES[currentCurrency.value];
        return pointsDecimal.div(rate);
    };

    const convertToPoints = (amount: Decimal | number, currency: CurrencyType): Decimal => {
        const amountDecimal = amount instanceof Decimal ? amount : new Decimal(amount);
        const rate = CURRENCY_RATES[currency];
        return amountDecimal.mul(rate);
    };

    const formatCurrency = (points: Decimal | number, options?: {
        showSymbol?: boolean;
        decimals?: number
    }): string => {
        const {showSymbol = true, decimals = 2} = options || {};
        const converted = convertFromPoints(points);
        const symbol = CURRENCY_SYMBOLS[currentCurrency.value];

        if (currentCurrency.value === 'POINTS') {
            // For points, show without decimals
            return converted.toFixed(0);
        }

        const formatted = converted.toFixed(decimals);
        return showSymbol && symbol ? `${symbol}${formatted}` : formatted;
    };

    const getCurrencySymbol = (currency?: CurrencyType): string => {
        return CURRENCY_SYMBOLS[currency || currentCurrency.value];
    };

    const getCurrencyRate = (currency?: CurrencyType): number => {
        return CURRENCY_RATES[currency || currentCurrency.value];
    };

    /** Locales that quote real money can choose between USD, EUR and points. */
    const usesRealCurrency = computed(() => !isPointsOnly(currentLanguage.value));

    return {
        currentCurrency: computed(() => currentCurrency.value),
        setCurrency,
        convertFromPoints,
        convertToPoints,
        formatCurrency,
        getCurrencySymbol,
        getCurrencyRate,
        usesRealCurrency,
        CURRENCY_RATES,
    };
}

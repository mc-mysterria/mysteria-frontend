import { ref, computed, watch } from 'vue';
import { useI18n } from '@/composables/useI18n';
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

// Initialize from localStorage or default to USD for English
const getInitialCurrency = (): CurrencyType => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (stored === 'USD' || stored === 'EUR' || stored === 'POINTS')) {
    return stored as CurrencyType;
  }
  // Default to USD for English users
  return 'USD';
};

const currentCurrency = ref<CurrencyType>(getInitialCurrency());

export function useCurrency() {
  const { currentLanguage } = useI18n();

  // Watch language changes and reset to default if switching to/from English
  watch(currentLanguage, (newLang, oldLang) => {
    if (newLang === 'en' && oldLang !== 'en') {
      // Switching to English, use USD if currently POINTS
      if (currentCurrency.value === 'POINTS') {
        currentCurrency.value = 'USD';
      }
    } else if (newLang !== 'en' && oldLang === 'en') {
      // Switching from English, use POINTS
      currentCurrency.value = 'POINTS';
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

  const formatCurrency = (points: Decimal | number, options?: { showSymbol?: boolean; decimals?: number }): string => {
    const { showSymbol = true, decimals = 2 } = options || {};
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

  const isEnglish = computed(() => currentLanguage.value === 'en');

  // For English users, show currency options. For others, always use POINTS
  const showCurrencyToggle = computed(() => isEnglish.value);

  return {
    currentCurrency: computed(() => currentCurrency.value),
    setCurrency,
    convertFromPoints,
    convertToPoints,
    formatCurrency,
    getCurrencySymbol,
    getCurrencyRate,
    showCurrencyToggle,
    isEnglish,
    CURRENCY_RATES,
  };
}

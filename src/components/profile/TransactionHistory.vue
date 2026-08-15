<template>
  <section v-if="isOwnProfile" class="ledger transaction-history myst-panel">
    <header class="ledger-head">
      <div>
        <p class="ledger-eyebrow">{{ t('profilePage.ledgerEyebrow') }}</p>
        <h3 class="ledger-title">{{ t('transactionHistoryTitle') }}</h3>
      </div>

      <div class="myst-segmented ledger-filter">
        <button
            v-for="filter in filters"
            :key="filter.id"
            :class="{ active: filter.id === activeFilter }"
            type="button"
            @click="activeFilter = filter.id"
        >
          {{ filter.label }}
        </button>
      </div>
    </header>

    <div v-if="loading" class="ledger-state">
      <div class="ledger-spinner" aria-hidden="true"></div>
      <p>{{ t('transactionHistory.loading') }}</p>
    </div>

    <div v-else-if="!visibleTransactions.length" class="ledger-state">
      <i class="fa-solid fa-file-circle-exclamation" aria-hidden="true"></i>
      <p>{{ t('transactionHistory.noTransactions') }}</p>
      <small>{{ t('transactionHistory.noTransactionsDescription') }}</small>
    </div>

    <div v-else class="ledger-rows">
      <div v-for="transaction in visibleTransactions" :key="transaction.id" class="ledger-row">
        <span class="row-date">{{ formatDate(transaction.createdAt) }}</span>
        <span class="row-body">
          <span :class="['row-type', transaction.amount >= 0 ? 'income' : 'spending']">
            {{ typeLabel(transaction.type) }}
          </span>
          <span class="row-description">{{ transaction.description }}</span>
          <span v-if="isGift(transaction)" class="row-gift">
            <i class="fa-solid fa-gift" aria-hidden="true"></i>
            {{ t('giftFrom') }} {{ giftSender(transaction) }}
          </span>
        </span>
        <span :class="['row-amount', amountClass(transaction.amount)]">
          {{ formatAmount(transaction.amount) }}
          <IconMark class="amount-mark"/>
        </span>
      </div>
    </div>

    <div v-if="hasMorePages && !loading" class="ledger-footer">
      <button :disabled="loadingMore" class="myst-btn-outline" type="button" @click="loadMore">
        {{ loadingMore ? t('loading2') : t('loadMore') }}
      </button>
    </div>
  </section>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from "vue";
import {useNotification} from "@/services/useNotification";
import {useI18n} from "@/composables/useI18n";
import {useUserStore} from "@/stores/user";
import type {UserResponse} from "@/types/users";
import IconMark from "@/assets/icons/IconMark.vue";

const props = defineProps<{
  displayedUser: UserResponse | null;
  isOwnProfile: boolean;
}>();

interface TransactionDto {
  id: string;
  userId: string;
  amount: number;
  type: "PURCHASE" | "DONATION" | "VOTE_REWARD" | "ADMIN_ADJUST" | "REFUND" | "SUBSCRIPTION" | "PENALTY" | "REWARD";
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  serverId?: string;
  createdAt: string;
}

interface TransactionPage {
  content: TransactionDto[];
  last: boolean;
}

const {show} = useNotification();
const {t, currentLanguage} = useI18n();
const userStore = useUserStore();

const PAGE_SIZE = 8;

const loading = ref(false);
const loadingMore = ref(false);
const transactions = ref<TransactionDto[]>([]);
const currentPage = ref(0);
const hasMorePages = ref(false);

type FilterId = "all" | "income" | "spending";
const activeFilter = ref<FilterId>("all");

const filters = computed<{ id: FilterId; label: string }[]>(() => [
  {id: "all", label: t("profilePage.filterAll")},
  {id: "income", label: t("profilePage.filterIncome")},
  {id: "spending", label: t("profilePage.filterSpending")},
]);

const visibleTransactions = computed(() => {
  if (activeFilter.value === "income") return transactions.value.filter(entry => entry.amount >= 0);
  if (activeFilter.value === "spending") return transactions.value.filter(entry => entry.amount < 0);
  return transactions.value;
});

const fetchTransactions = async (reset = true) => {
  if (reset) {
    loading.value = true;
    currentPage.value = 0;
    transactions.value = [];
  } else {
    loadingMore.value = true;
  }

  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      size: PAGE_SIZE.toString(),
      sort: "createdAt,desc",
    });

    const response = await fetch(`/api/user/transactions?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch transactions");

    const data: TransactionPage = await response.json();
    transactions.value = reset ? data.content : [...transactions.value, ...data.content];
    hasMorePages.value = !data.last;
    currentPage.value++;
  } catch {
    show(t("errorLoadingTransactionHistory"), {type: "error"});
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = () => fetchTransactions(false);

const typeLabel = (type: string): string => {
  const key = `transactionTypes.${type}`;
  const label = t(key);
  return label === key ? type : label;
};

const amountClass = (amount: number) => (amount > 0 ? "plus" : amount < 0 ? "minus" : "zero");
const formatAmount = (amount: number) => (amount > 0 ? `+${amount}` : amount < 0 ? `−${Math.abs(amount)}` : "0");

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(currentLanguage.value === "uk" ? "uk-UA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isGift = (transaction: any): boolean =>
    Boolean(transaction.metadata?.purchaserId) && transaction.metadata?.purchaserId !== userStore.currentUser?.id;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const giftSender = (transaction: any): string => transaction.metadata?.purchaserName || t("unknown");

onMounted(() => {
  if (props.isOwnProfile) void fetchTransactions();
});
</script>

<style scoped>
.ledger {
  padding: 32px 34px;
}

.ledger-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.ledger-eyebrow {
  margin: 0 0 8px;
  font-family: var(--myst-font-mono);
  font-size: 9.5px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.ledger-title {
  margin: 0;
  font-family: var(--myst-font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--myst-offwhite);
}

.ledger-filter {
  border-color: var(--myst-line-20);
  background: transparent;
}

.ledger-filter button {
  padding: 9px 18px;
  font-size: 10px;
  letter-spacing: 0.16em;
  border-right: none;
}

/* Rows */
.ledger-rows {
  display: flex;
  flex-direction: column;
}

.ledger-row {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 24px;
  align-items: baseline;
  padding: 17px 4px;
  border-bottom: 1px solid rgba(200, 178, 115, 0.08);
}

.row-date {
  font-family: var(--myst-font-mono);
  font-size: 11px;
  color: var(--myst-ink-muted);
}

.row-body {
  min-width: 0;
}

.row-type {
  display: inline-block;
  margin-right: 12px;
  padding: 3px 9px;
  vertical-align: middle;
  border: 1px solid var(--myst-line-28);
  font-family: var(--myst-font-mono);
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.row-type.income {
  border-color: rgba(107, 207, 127, 0.3);
  color: var(--myst-green-soft);
}

.row-description {
  color: var(--myst-offwhite);
  font-size: 14px;
}

.row-gift {
  display: block;
  margin-top: 6px;
  color: var(--myst-ink-muted);
  font-size: 12px;
}

.row-gift i {
  margin-right: 6px;
  color: var(--myst-gold);
}

.row-amount {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--myst-font-mono);
  font-size: 14.5px;
  font-weight: 700;
  white-space: nowrap;
}

/* 1em sizing on the sigil keeps it locked to the amount it annotates. */
.amount-mark {
  font-size: 13px;
  opacity: 0.8;
}

.row-amount.plus {
  color: var(--myst-green-soft);
}

.row-amount.minus {
  color: var(--myst-red-soft);
}

.row-amount.zero {
  color: var(--myst-ink-muted);
}

/* States */
.ledger-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 0;
  text-align: center;
  color: var(--myst-ink-muted);
}

.ledger-state i {
  color: rgba(200, 178, 115, 0.4);
  font-size: 28px;
}

.ledger-state p {
  margin: 0;
  font-family: var(--myst-font-mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.ledger-state small {
  max-width: 44ch;
  font-size: 13px;
  line-height: 1.6;
}

.ledger-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid var(--myst-line-20);
  border-top-color: var(--myst-gold);
  border-radius: 50%;
  animation: ledgerSpin 0.9s linear infinite;
}

@keyframes ledgerSpin {
  to {
    transform: rotate(360deg);
  }
}

.ledger-footer {
  margin-top: 26px;
  text-align: center;
}

.ledger-footer .myst-btn-outline {
  padding: 11px 34px;
  font-size: 10.5px;
  letter-spacing: 0.2em;
}

@media (max-width: 640px) {
  .ledger {
    padding: 24px 20px;
  }

  .ledger-row {
    grid-template-columns: 1fr auto;
    gap: 8px 16px;
  }

  .row-date {
    grid-column: 1 / -1;
  }
}
</style>

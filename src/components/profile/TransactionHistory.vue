<template>
  <div class="transaction-history" v-if="isOwnProfile">
    <!-- Header Section -->
    <div class="section-header">
      <h3 class="section-title">{{ t('transactionHistoryTitle') }}</h3>
      <div class="filter-container">
        <select
          v-model="selectedType"
          @change="() => fetchTransactions()"
          class="transaction-filter"
        >
          <option value="">{{ t('transactionHistory.allTypes') }}</option>
          <option value="PURCHASE">{{ t('transactionTypes.PURCHASE') }}</option>
          <option value="DONATION">{{ t('transactionTypes.DONATION') }}</option>
          <option value="VOTE_REWARD">{{ t('transactionTypes.VOTE_REWARD') }}</option>
          <option value="ADMIN_ADJUST">{{ t('transactionTypes.ADMIN_ADJUST') }}</option>
          <option value="REFUND">{{ t('transactionTypes.REFUND') }}</option>
          <option value="SUBSCRIPTION">{{ t('transactionTypes.SUBSCRIPTION') }}</option>
          <option value="PENALTY">{{ t('transactionTypes.PENALTY') }}</option>
          <option value="REWARD">{{ t('transactionTypes.REWARD') }}</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
      </div>
      <p class="loading-text">{{ t('transactionHistory.loading') }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="transactions.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      </div>
      <h4 class="empty-title">{{ t('transactionHistory.noTransactions') }}</h4>
      <p class="empty-description">
        <template v-if="selectedType">
          {{ getNoFilterResultsMessage() }}
        </template>
        <template v-else>
          {{ t('transactionHistory.noTransactionsDescription') }}
        </template>
      </p>
    </div>

    <!-- Transactions List -->
    <div v-else class="transactions-container">
      <div class="transactions-grid">
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="transaction-card"
          :class="getTransactionClass(transaction.type)"
        >
          <!-- Transaction Status Indicator -->
          <div class="transaction-indicator" :class="getIndicatorClass(transaction.type)"></div>

          <!-- Transaction Content -->
          <div class="transaction-content">
            <div class="transaction-header-row">
              <div class="transaction-type-badge" :class="getTypeBadgeClass(transaction.type)">
                {{ getTransactionTypeLabel(transaction.type) }}
              </div>
              <div class="transaction-amount" :class="getAmountClass(transaction.amount)">
                {{ formatAmount(transaction.amount) }}₴
              </div>
            </div>

            <div class="transaction-body">
              <h4 class="transaction-title">{{ transaction.description }}</h4>
              <div class="transaction-meta">
                <span class="transaction-date">{{ formatDate(transaction.createdAt) }}</span>
                <span v-if="transaction.serverId" class="transaction-server">{{ transaction.serverId }}</span>
              </div>
            </div>

            <!-- Expandable Metadata -->
            <div v-if="transaction.metadata" class="transaction-details">
              <button
                @click="toggleDetails(transaction.id)"
                class="details-toggle"
                :class="{ 'expanded': expandedTransactions.has(transaction.id) }"
              >
                <span>{{ t('transactionHistory.details') }}</span>
                <svg class="details-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>

              <div v-if="expandedTransactions.has(transaction.id)" class="metadata-content">
                <div class="metadata-json">
                  <pre>{{ formatMetadata(transaction.metadata) }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More -->
      <div v-if="hasMorePages" class="load-more-container">
        <button
          @click="loadMoreTransactions"
          :disabled="loadingMore"
          class="load-more-button"
        >
          <span v-if="loadingMore" class="button-loading">
            <div class="button-spinner"></div>
            {{ t("loading2") }}
          </span>
          <span v-else>{{ t("loadMore") }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useNotification } from "@/services/useNotification";
import { useI18n } from "@/composables/useI18n";
import type { UserResponse } from "@/types/users";

const props = defineProps<{
  displayedUser: UserResponse | null;
  isOwnProfile: boolean;
}>();

interface TransactionDto {
  id: string;
  userId: string;
  amount: number;
  type:
    | "PURCHASE"
    | "DONATION"
    | "VOTE_REWARD"
    | "ADMIN_ADJUST"
    | "REFUND"
    | "SUBSCRIPTION"
    | "PENALTY"
    | "REWARD";
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  serverId?: string;
  createdAt: string;
}

interface TransactionPage {
  content: TransactionDto[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
}

const { show } = useNotification();
const { t } = useI18n();
const loading = ref(false);
const loadingMore = ref(false);
const transactions = ref<TransactionDto[]>([]);
const selectedType = ref<string>("");
const currentPage = ref(0);
const hasMorePages = ref(false);
const expandedTransactions = ref<Set<string>>(new Set());

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
      size: reset ? "2" : "5", // Show only 3 transactions initially, then 10 more when loading more
      sort: "createdAt,desc",
    });

    if (selectedType.value) {
      params.append("type", selectedType.value);
    }

    const response = await fetch(`/api/user/transactions?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }

    const data: TransactionPage = await response.json();

    if (reset) {
      transactions.value = data.content;
    } else {
      transactions.value.push(...data.content);
    }

    hasMorePages.value = !data.last;
    currentPage.value++;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    show(t("errorLoadingTransactionHistory"), { type: "error" });
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMoreTransactions = () => {
  fetchTransactions(false);
};

const getTransactionTypeLabel = (type: string): string => {
  const labels = t("transactionTypes") as unknown as Record<string, string>;
  return labels[type] || type;
};

const getTransactionClass = (type: string): string => {
  const classes: Record<string, string> = {
    PURCHASE: "transaction-purchase",
    DONATION: "transaction-donation",
    VOTE_REWARD: "transaction-reward",
    ADMIN_ADJUST: "transaction-admin",
    REFUND: "transaction-refund",
    SUBSCRIPTION: "transaction-subscription",
    PENALTY: "transaction-penalty",
    REWARD: "transaction-reward",
  };
  return classes[type] || "";
};

const getAmountClass = (amount: number): string => {
  return amount >= 0 ? "amount-positive" : "amount-negative";
};

const formatAmount = (amount: number): string => {
  return amount >= 0 ? `+${amount}` : amount.toString();
};

const formatDate = (dateString: string): string => {
  const { currentLanguage } = useI18n();
  const locale = currentLanguage.value === 'uk' ? 'uk-UA' : 'en-US';
  return new Date(dateString).toLocaleString(locale);
};

const toggleDetails = (transactionId: string) => {
  if (expandedTransactions.value.has(transactionId)) {
    expandedTransactions.value.delete(transactionId);
  } else {
    expandedTransactions.value.add(transactionId);
  }
};

const formatMetadata = (metadata: Record<string, any>): string => {
  return JSON.stringify(metadata, null, 2);
};

const getIndicatorClass = (type: string): string => {
  const classes: Record<string, string> = {
    PURCHASE: "indicator-purchase",
    DONATION: "indicator-donation",
    VOTE_REWARD: "indicator-reward",
    ADMIN_ADJUST: "indicator-admin",
    REFUND: "indicator-refund",
    SUBSCRIPTION: "indicator-subscription",
    PENALTY: "indicator-penalty",
    REWARD: "indicator-reward",
  };
  return classes[type] || "indicator-default";
};

const getTypeBadgeClass = (type: string): string => {
  const classes: Record<string, string> = {
    PURCHASE: "badge-purchase",
    DONATION: "badge-donation",
    VOTE_REWARD: "badge-reward",
    ADMIN_ADJUST: "badge-admin",
    REFUND: "badge-refund",
    SUBSCRIPTION: "badge-subscription",
    PENALTY: "badge-penalty",
    REWARD: "badge-reward",
  };
  return classes[type] || "badge-default";
};

const getNoFilterResultsMessage = (): string => {
  const filterLabel = getTransactionTypeLabel(selectedType.value);
  const template = t('transactionHistory.noFilterResults');
  return template.replace('{filter}', filterLabel);
};

onMounted(() => {
  if (props.isOwnProfile) {
    fetchTransactions();
  }
});
</script>

<style scoped>
/* Main Container */
.transaction-history {
  width: 100%;
  margin: 0;
}

/* Header Section */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid color-mix(in srgb, white 10%, transparent);
}

.section-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--myst-ink-strong);
}

.filter-container {
  display: flex;
  gap: 12px;
}

.transaction-filter {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, white 15%, transparent);
  color: var(--myst-ink);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.transaction-filter:hover {
  background: color-mix(in srgb, white 5%, transparent);
  border-color: color-mix(in srgb, white 30%, transparent);
}

.transaction-filter option {
  background: var(--myst-bg);
  color: var(--myst-ink);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px 16px;
  text-align: center;
}

.loading-spinner {
  position: relative;
  width: 48px;
  height: 48px;
}

.spinner-ring {
  width: 48px;
  height: 48px;
  border: 3px solid color-mix(in srgb, var(--myst-gold) 20%, transparent);
  border-top-color: var(--myst-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin: 0;
  color: var(--myst-ink);
  font-size: 16px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 64px 16px;
}

.empty-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 24px;
  width: 64px;
  height: 64px;
  color: color-mix(in srgb, var(--myst-ink) 40%, transparent);
}

.empty-title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--myst-ink-strong);
}

.empty-description {
  margin: 0;
  color: var(--myst-ink-muted);
  font-size: 14px;
  line-height: 1.5;
}

/* Transactions Container */
.transactions-container {
  margin-top: 16px;
}

.transactions-grid {
  display: grid;
  gap: 16px;
}

/* Transaction Cards */
.transaction-card {
  position: relative;
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, white 10%, transparent);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.transaction-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border-color: color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

/* Transaction Indicator */
.transaction-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.indicator-purchase { background: var(--myst-gold); }
.indicator-donation { background: #22c55e; }
.indicator-reward { background: #f59e0b; }
.indicator-admin { background: #8b5cf6; }
.indicator-refund { background: #0ea5e9; }
.indicator-subscription { background: #ec4899; }
.indicator-penalty { background: #ef4444; }
.indicator-default { background: #6b7280; }

/* Transaction Content */
.transaction-content {
  padding: 20px;
  margin-left: 4px;
}

.transaction-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

/* Type Badges */
.transaction-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.badge-purchase { background: color-mix(in srgb, var(--myst-gold) 15%, transparent); color: var(--myst-gold); }
.badge-donation { background: color-mix(in srgb, #22c55e 15%, transparent); color: #22c55e; }
.badge-reward { background: color-mix(in srgb, #f59e0b 15%, transparent); color: #f59e0b; }
.badge-admin { background: color-mix(in srgb, #8b5cf6 15%, transparent); color: #8b5cf6; }
.badge-refund { background: color-mix(in srgb, #0ea5e9 15%, transparent); color: #0ea5e9; }
.badge-subscription { background: color-mix(in srgb, #ec4899 15%, transparent); color: #ec4899; }
.badge-penalty { background: color-mix(in srgb, #ef4444 15%, transparent); color: #ef4444; }
.badge-default { background: color-mix(in srgb, #6b7280 15%, transparent); color: #6b7280; }

/* Transaction Amount */
.transaction-amount {
  font-size: 18px;
  font-weight: 700;
  font-family: monospace;
  padding: 6px 12px;
  border-radius: 6px;
  text-align: right;
  flex-shrink: 0;
}

.amount-positive {
  color: #22c55e;
  background: color-mix(in srgb, #22c55e 10%, transparent);
}

.amount-negative {
  color: #ef4444;
  background: color-mix(in srgb, #ef4444 10%, transparent);
}

/* Transaction Body */
.transaction-body {
  margin-bottom: 16px;
}

.transaction-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--myst-ink-strong);
  line-height: 1.4;
}

.transaction-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.transaction-date {
  color: var(--myst-ink-muted);
  font-size: 14px;
}

.transaction-server {
  background: color-mix(in srgb, var(--myst-ink) 10%, transparent);
  color: var(--myst-ink);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* Transaction Details */
.transaction-details {
  border-top: 1px solid color-mix(in srgb, white 8%, transparent);
  padding-top: 16px;
  margin-top: 16px;
}

.details-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  border: none;
  color: var(--myst-ink);
  padding: 8px 0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.details-toggle:hover {
  color: var(--myst-ink-strong);
}

.details-icon {
  transition: transform 0.2s ease;
}

.details-toggle.expanded .details-icon {
  transform: rotate(180deg);
}

.metadata-content {
  margin-top: 12px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.metadata-json {
  background: color-mix(in srgb, var(--myst-bg) 80%, transparent);
  border: 1px solid color-mix(in srgb, white 8%, transparent);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
}

.metadata-json pre {
  margin: 0;
  font-size: 12px;
  color: var(--myst-ink);
  white-space: pre-wrap;
  word-break: break-word;
}

/* Load More */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.load-more-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 30%, transparent);
  color: var(--myst-gold);
  padding: 12px 32px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-button:hover:not(:disabled) {
  background: color-mix(in srgb, var(--myst-gold) 10%, transparent);
  border-color: var(--myst-gold);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(200, 178, 115, 0.2);
}

.load-more-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.button-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid color-mix(in srgb, var(--myst-gold) 30%, transparent);
  border-top-color: var(--myst-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Responsive Design */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .transaction-header-row {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .transaction-amount {
    text-align: left;
  }

  .transaction-meta {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .transaction-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .empty-state,
  .loading-state {
    padding: 48px 16px;
  }

  .section-title {
    font-size: 20px;
  }
}
</style>

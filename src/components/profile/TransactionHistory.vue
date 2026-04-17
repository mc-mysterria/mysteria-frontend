<template>
  <div v-if="isOwnProfile" class="ledger-of-marks transaction-history">
    <!-- Header Section -->
    <div class="ledger-header">
      <div class="header-main">
        <span class="ledger-eyebrow">Financial Ledger</span>
        <h3 class="ledger-title">{{ t('transactionHistoryTitle') }}</h3>
      </div>
      
      <div class="ledger-filters">
        <div class="filter-frame">
          <select
              v-model="selectedType"
              class="ledger-select"
              @change="() => fetchTransactions()"
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
          <i class="fa-solid fa-chevron-down select-icon"></i>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="ledger-loading">
      <div class="loading-sigil"></div>
      <p class="loading-text">{{ t('transactionHistory.loading') }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="transactions.length === 0" class="ledger-empty">
      <div class="empty-sigil">
        <i class="fa-solid fa-file-circle-exclamation"></i>
      </div>
      <h4 class="empty-title">{{ t('transactionHistory.noTransactions') }}</h4>
      <p class="empty-desc">{{ selectedType ? getNoFilterResultsMessage() : t('transactionHistory.noTransactionsDescription') }}</p>
    </div>

    <!-- Transactions List -->
    <div v-else class="ledger-entries">
      <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="ledger-entry"
          :class="getTransactionClass(transaction.type)"
      >
        <!-- Entry Indicator -->
        <div class="entry-indicator"></div>

        <!-- Entry Header -->
        <div class="entry-main">
          <div class="entry-top-row">
            <div class="entry-type">
              <span class="type-tag">{{ getTransactionTypeLabel(transaction.type) }}</span>
              <span v-if="transaction.serverId" class="server-tag">{{ transaction.serverId }}</span>
            </div>
            <div class="entry-amount" :class="getAmountClass(transaction.amount)">
              {{ formatAmount(transaction.amount) }}₴
            </div>
          </div>

          <div class="entry-body">
            <h4 class="entry-title">
              {{ transaction.description }}
              <span v-if="getTransactionQuantity(transaction) > 1" class="qty-badge">×{{ getTransactionQuantity(transaction) }}</span>
            </h4>
            
            <div v-if="isGiftTransaction(transaction)" class="gift-seal">
              <i class="fa-solid fa-gift"></i>
              <span>{{ t('giftFrom') || 'Gift from' }} {{ getGiftSenderName(transaction) }}</span>
            </div>

            <div class="entry-meta">
              <span class="entry-date">{{ formatDate(transaction.createdAt) }}</span>
              <span class="entry-id">ID: {{ transaction.id.substring(0, 8) }}</span>
            </div>
          </div>

          <!-- Metadata Details -->
          <div v-if="transaction.metadata" class="entry-details">
            <button
                class="details-trigger"
                :class="{ 'is-active': expandedTransactions.has(transaction.id) }"
                @click="toggleDetails(transaction.id)"
            >
              <span>{{ t('transactionHistory.details') }}</span>
              <i class="fa-solid fa-caret-down"></i>
            </button>

            <transition name="expand">
              <div v-if="expandedTransactions.has(transaction.id)" class="details-content">
                <pre class="metadata-scroll no-scrollbar">{{ formatMetadata(transaction.metadata) }}</pre>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- Load More -->
      <div v-if="hasMorePages" class="ledger-footer">
        <button
            :disabled="loadingMore"
            class="btn-load-entries"
            @click="loadMoreTransactions"
        >
          <span v-if="loadingMore" class="btn-loader">
            <div class="spinner-tiny"></div>
            {{ t("loading2") }}
          </span>
          <span v-else>{{ t("loadMore") }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue";
import {useNotification} from "@/services/useNotification";
import {useI18n} from "@/composables/useI18n";
import {useUserStore} from "@/stores/user";
import type {UserResponse} from "@/types/users";

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

const {show} = useNotification();
const {t} = useI18n();
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
      size: reset ? "2" : "5",
      sort: "createdAt,desc",
    });
    if (selectedType.value) params.append("type", selectedType.value);
    const response = await fetch(`/api/user/transactions?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch transactions");
    const data: TransactionPage = await response.json();
    if (reset) transactions.value = data.content;
    else transactions.value.push(...data.content);
    hasMorePages.value = !data.last;
    currentPage.value++;
  } catch (error) {
    show(t("errorLoadingTransactionHistory"), {type: "error"});
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMoreTransactions = () => fetchTransactions(false);
const getTransactionTypeLabel = (type: string): string => {
  const labels = t("transactionTypes") as unknown as Record<string, string>;
  return labels[type] || type;
};

const getTransactionClass = (type: string): string => {
  const classes: Record<string, string> = {
    PURCHASE: "entry-purchase",
    DONATION: "entry-donation",
    VOTE_REWARD: "entry-reward",
    ADMIN_ADJUST: "entry-admin",
    REFUND: "entry-refund",
    SUBSCRIPTION: "entry-subscription",
    PENALTY: "entry-penalty",
    REWARD: "entry-reward",
  };
  return classes[type] || "";
};

const getAmountClass = (amount: number): string => amount >= 0 ? "amount-plus" : "amount-minus";
const formatAmount = (amount: number): string => amount >= 0 ? `+${amount}` : amount.toString();
const formatDate = (dateString: string): string => {
  const {currentLanguage} = useI18n();
  const locale = currentLanguage.value === 'uk' ? 'uk-UA' : 'en-US';
  return new Date(dateString).toLocaleString(locale);
};
const toggleDetails = (transactionId: string) => {
  if (expandedTransactions.value.has(transactionId)) expandedTransactions.value.delete(transactionId);
  else expandedTransactions.value.add(transactionId);
};
const formatMetadata = (metadata: Record<string, any>): string => JSON.stringify(metadata, null, 2);
const getTransactionQuantity = (transaction: any): number => transaction.metadata?.amount || 1;
const isGiftTransaction = (transaction: any): boolean => {
  const userStore = useUserStore();
  return transaction.metadata?.purchaserId && transaction.metadata?.purchaserId !== userStore.currentUser?.id;
};
const getGiftSenderName = (transaction: any): string => transaction.metadata?.purchaserName || t('unknown') || 'Unknown';
const getNoFilterResultsMessage = (): string => {
  const filterLabel = getTransactionTypeLabel(selectedType.value);
  return t('transactionHistory.noFilterResults').replace('{filter}', filterLabel);
};

onMounted(() => { if (props.isOwnProfile) fetchTransactions(); });
</script>

<style scoped>
/* LEDGER OF MARKS AESTHETIC */

.ledger-of-marks {
  position: relative;
  background: rgba(13, 16, 30, 0.4);
  padding: 40px;
  border-radius: 4px;
}

/* Header */
.ledger-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 48px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.ledger-eyebrow {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--myst-gold);
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 8px;
  opacity: 0.6;
}

.ledger-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  color: var(--myst-offwhite);
  margin: 0;
}

/* Custom Select */
.filter-frame {
  position: relative;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(200, 178, 115, 0.2);
  padding: 4px 12px;
}

.ledger-select {
  background: transparent;
  border: none;
  color: var(--myst-gold);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 8px 24px 8px 8px;
  cursor: pointer;
  appearance: none;
}

.select-icon {
  position: absolute;
  right: 12px; top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: var(--myst-gold);
  pointer-events: none;
}

/* Loading / Empty */
.ledger-loading, .ledger-empty {
  padding: 80px 0;
  text-align: center;
}

.loading-sigil {
  width: 40px; height: 40px;
  border: 2px solid rgba(200, 178, 115, 0.2);
  border-top-color: var(--myst-gold);
  border-radius: 50%;
  margin: 0 auto 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Entry Styling */
.ledger-entries {
  display: grid;
  gap: 24px;
}

.ledger-entry {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.ledger-entry:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(200, 178, 115, 0.2);
}

.entry-indicator {
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 3px;
  background: #333;
}

.entry-main {
  padding: 24px 32px;
}

.entry-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.type-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 4px 10px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.05);
  color: #888;
}

.server-tag {
  font-size: 10px;
  color: #555;
  margin-left: 12px;
  text-transform: uppercase;
}

.entry-amount {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  font-weight: 700;
}

.amount-plus { color: #6bcf7f; }
.amount-minus { color: #ff6b6b; }

.entry-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: var(--myst-offwhite);
  margin: 0 0 12px;
}

.qty-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--myst-gold);
  margin-left: 12px;
}

.entry-meta {
  display: flex;
  gap: 24px;
  font-size: 12px;
  color: #555;
}

.entry-id { font-family: 'JetBrains Mono', monospace; }

/* Detail Triggers */
.entry-details {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed rgba(255, 255, 255, 0.05);
}

.details-trigger {
  background: none; border: none;
  color: #666; font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  transition: color 0.3s ease;
}

.details-trigger:hover, .details-trigger.is-active {
  color: var(--myst-gold);
}

.expand-enter-active, .expand-leave-active { transition: all 0.4s ease; }
.expand-enter-from, .expand-leave-to { opacity: 0; transform: translateY(-10px); }

.metadata-scroll {
  margin-top: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.4);
  font-size: 11px;
  color: #888;
  max-height: 200px;
  overflow-y: auto;
}

/* Entry Colors */
.entry-purchase .entry-indicator { background: var(--myst-gold); }
.entry-donation .entry-indicator { background: #6bcf7f; }
.entry-reward .entry-indicator { background: #f59e42; }
.entry-penalty .entry-indicator { background: #ff6b6b; }

/* Footer */
.ledger-footer {
  margin-top: 40px;
  text-align: center;
}

.btn-load-entries {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #888;
  padding: 12px 32px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-load-entries:hover {
  border-color: var(--myst-gold);
  color: var(--myst-gold);
}

/* Responsive */
@media (max-width: 768px) {
  .ledger-of-marks { padding: 32px 20px; }
  .ledger-header { flex-direction: column; align-items: flex-start; gap: 24px; }
  .entry-main { padding: 20px; }
}
</style>

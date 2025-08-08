<template>
  <div class="transaction-history" v-if="isOwnProfile">
    <div class="transaction-container">
      <div class="transaction-header">
        <h3>Історія транзакцій</h3>
        <div class="transaction-filters">
          <select
            v-model="selectedType"
            @change="() => fetchTransactions()"
            class="filter-select"
          >
            <option value="">Всі типи</option>
            <option value="PURCHASE">Покупки</option>
            <option value="DONATION">Донати</option>
            <option value="VOTE_REWARD">Винагороди за голоси</option>
            <option value="ADMIN_ADJUST">Корегування адміна</option>
            <option value="REFUND">Повернення</option>
            <option value="SUBSCRIPTION">Підписки</option>
            <option value="PENALTY">Штрафи</option>
            <option value="REWARD">Нагороди</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
        <p>Завантаження історії транзакцій...</p>
      </div>

      <div v-else-if="transactions.length === 0" class="no-transactions">
        <p>Історія транзакцій порожня</p>
      </div>

      <div v-else class="transactions-list">
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="transaction-item"
          :class="getTransactionClass(transaction.type)"
        >
          <div class="transaction-main">
            <div class="transaction-info">
              <h4 class="transaction-description">
                {{ transaction.description }}
              </h4>
              <p class="transaction-type">
                {{ getTransactionTypeLabel(transaction.type) }}
              </p>
              <p class="transaction-date">
                {{ formatDate(transaction.createdAt) }}
              </p>
            </div>
            <div
              class="transaction-amount"
              :class="getAmountClass(transaction.amount)"
            >
              {{ formatAmount(transaction.amount) }}₴
            </div>
          </div>

          <div v-if="transaction.metadata" class="transaction-metadata">
            <details>
              <summary>Деталі</summary>
              <pre>{{ JSON.stringify(transaction.metadata, null, 2) }}</pre>
            </details>
          </div>
        </div>
      </div>

      <div v-if="hasMorePages" class="pagination">
        <button
          @click="loadMoreTransactions"
          :disabled="loadingMore"
          class="load-more-btn"
        >
          {{ loadingMore ? t("loading2") : t("loadMore") }}
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
      size: "10",
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
  return new Date(dateString).toLocaleString("uk-UA");
};

onMounted(() => {
  if (props.isOwnProfile) {
    fetchTransactions();
  }
});
</script>

<style scoped>
.transaction-history {
  width: 100%;
  margin: 2rem auto;
}

.transaction-container {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.6s ease-out;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.transaction-header h3 {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #4ade80, #22d3ee);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.transaction-filters {
  display: flex;
  gap: 1rem;
}

.filter-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
}

.filter-select option {
  background: #1a1d23;
  color: #ffffff;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: #cccccc;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(16, 185, 129, 0.3);
  border-top: 4px solid #4ade80;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-transactions {
  text-align: center;
  padding: 3rem;
  color: #888;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transaction-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.transaction-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.transaction-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.transaction-info {
  flex: 1;
}

.transaction-description {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.transaction-type {
  color: #22d3ee;
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
}

.transaction-date {
  color: #888;
  font-size: 0.8rem;
  margin: 0;
}

.transaction-amount {
  font-size: 1.3rem;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-align: right;
}

.amount-positive {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.amount-negative {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.transaction-metadata {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.transaction-metadata details {
  color: #cccccc;
}

.transaction-metadata summary {
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.transaction-metadata pre {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  overflow-x: auto;
}

.pagination {
  margin-top: 2rem;
  text-align: center;
}

.load-more-btn {
  background: linear-gradient(135deg, #4ade80, #22d3ee);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.load-more-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Transaction type specific styling */
.transaction-purchase {
  border-left: 4px solid #4ade80;
}

.transaction-donation {
  border-left: 4px solid #22c55e;
}

.transaction-reward {
  border-left: 4px solid #f59e0b;
}

.transaction-admin {
  border-left: 4px solid #16a34a;
}

.transaction-refund {
  border-left: 4px solid #0ea5e9;
}

.transaction-subscription {
  border-left: 4px solid #059669;
}

.transaction-penalty {
  border-left: 4px solid #ef4444;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .transaction-container {
    padding: 1.5rem;
  }

  .transaction-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .transaction-main {
    flex-direction: column;
    gap: 1rem;
  }

  .transaction-amount {
    text-align: center;
  }
}
</style>

import { defineStore } from "pinia";
// import { balanceAPI, transactionAPI, serviceAPI } from "@/utils/api/payments";
import type { BalanceResponse, BalanceDto } from "@/types/balance";
import type {
  ServiceResponse,
  ServiceDto,
  ServicePoint,
} from "@/types/services";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import { watch } from "vue";
import { useNotification } from "@/services/useNotification";
import { Decimal } from "decimal.js";
import { APIError, RequestError } from "@/utils/api/errors";

// Helper function to convert new API ServiceDto to legacy ServiceResponse format
function convertServiceDtoToLegacy(service: ServiceDto, lang: string = "uk"): ServiceResponse {
  // Use internationalized fields if available, fallback to default
  const name = lang === "en" 
    ? (service.nameEn || service.name)
    : (service.nameUk || service.name);
  
  const description = lang === "en" 
    ? (service.descriptionEn || service.description)
    : (service.descriptionUk || service.description);
  
  const bulletPoints = lang === "en" 
    ? (service.bulletPointsEn || [])
    : (service.bulletPointsUk || []);

  // Create service points from bullet points or generate from metadata
  const points: ServicePoint[] = [];
  
  // Add bullet points if available
  if (bulletPoints.length > 0) {
    bulletPoints.forEach((point: string) => {
      points.push({ text: point });
    });
  } else {
    // Fallback to generate points from metadata (for backward compatibility)
    // Add duration info if available
    if (service.durationDays) {
      if (service.durationDays === 1) {
        points.push({ text: lang === "en" ? "Duration: 1 day" : "Термін дії: 1 день" });
      } else if (service.durationDays < 30) {
        points.push({ text: lang === "en" 
          ? `Duration: ${service.durationDays} days` 
          : `Термін дії: ${service.durationDays} днів` });
      } else {
        const months = Math.round(service.durationDays / 30);
        points.push({
          text: lang === "en" 
            ? `Duration: ${months} month${months > 1 ? 's' : ''}` 
            : `Термін дії: ${months} ${months === 1 ? "місяць" : "місяці"}`,
        });
      }
    } else {
      points.push({ text: lang === "en" ? "Permanent" : "Назавжди" });
    }

    // Add type-specific information
    switch (service.type) {
      case "ROLE":
        points.push({ text: lang === "en" ? "Server role" : "Роль на сервері" });
        if (service.metadata?.role) {
          points.push({ text: lang === "en" ? `Role: ${service.metadata.role}` : `Роль: ${service.metadata.role}` });
        }
        break;
      case "ITEM":
        points.push({ text: lang === "en" ? "In-game item" : "Предмет в грі" });
        if (service.metadata?.item) {
          points.push({ text: lang === "en" ? `Item: ${service.metadata.item}` : `Предмет: ${service.metadata.item}` });
        }
        if (service.metadata?.items && Array.isArray(service.metadata.items)) {
          points.push({
            text: lang === "en" 
              ? `Number of items: ${service.metadata.items.length}`
              : `Кількість предметів: ${service.metadata.items.length}`,
          });
        }
        if (service.metadata?.enchantments) {
          points.push({ text: lang === "en" ? "With enchantments" : "З зачаруваннями" });
        }
        break;
      case "PERMISSION":
        points.push({ text: lang === "en" ? "Permission/rights" : "Дозвіл/права" });
        if (service.metadata?.permission) {
          points.push({ text: lang === "en" ? `Permission: ${service.metadata.permission}` : `Дозвіл: ${service.metadata.permission}` });
        }
        break;
      case "COSMETIC":
        points.push({ text: lang === "en" ? "Cosmetic item" : "Косметичний предмет" });
        if (service.metadata?.type) {
          points.push({ text: lang === "en" ? `Type: ${service.metadata.type}` : `Тип: ${service.metadata.type}` });
        }
        break;
    }
  }

  return {
    id: service.id.toString(),
    name,
    display_name: name,
    description,
    image: service.imageUrl, // Map imageUrl to image for compatibility
    points,
    price: new Decimal(service.price),
    is_active: service.isActive,
    category: "other", // Default category for compatibility
    type: service.type,
    duration_months: service.durationDays
      ? Math.round(service.durationDays / 30)
      : undefined,
    service_metadata: service.metadata ? { data: service.metadata } : undefined,
    created_at: service.createdAt ? new Date(service.createdAt) : undefined,
  };
}

interface BalanceState {
  balance: BalanceResponse | null;
  isLoading: boolean;
  error: string | null;
  isProcessing: boolean;
  currentPurchase: {
    id: string;
    price: Decimal;
    selectedServer?: string;
    requiresServerSelection?: boolean;
  } | null;
  services: ServiceDto[];

  // Legacy compatibility getter
  legacyServices: ServiceResponse[];
  balanceCheckInterval: number | null;
}

export const useBalanceStore = defineStore("balance", {
  state: (): BalanceState => ({
    balance: null,
    isLoading: false,
    error: null,
    isProcessing: false,
    currentPurchase: null,
    services: [],
    legacyServices: [],
    balanceCheckInterval: null,
  }),

  getters: {
    currentBalance: (state) => state.balance,
    isBalanceLoading: (state) => state.isLoading,
    balanceError: (state) => state.error,
    items: (state) => state.legacyServices,
    donatelloUrl: (state) => {
      const authStore = useAuthStore();
      const user = authStore.user;
      const nickname = user?.nickname || `user_${user?.id}` || "";
      const balanceIdentifier = state.balance?.identifier || "";
      return `https://donatello.to/mysterria?c=${nickname}&m=${balanceIdentifier}`;
    },
  },

  actions: {
    async fetchBalance() {
      this.isLoading = true;
      this.error = null;

      const authStore = useAuthStore();
      
      // Check if we have a token before making the request
      if (!authStore.accessToken) {
        this.isLoading = false;
        return;
      }

      try {
        // Use new API endpoint for balance
        const response = await fetch("/api/user/balance", {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // If unauthorized, it might be a timing issue - retry once after a short delay
          if (response.status === 401 && authStore.isAuthenticated && authStore.accessToken) {
            await new Promise(resolve => setTimeout(resolve, 200));
            const retryResponse = await fetch("/api/user/balance", {
              headers: {
                Authorization: `Bearer ${authStore.accessToken}`,
                "Content-Type": "application/json",
              },
            });
            
            if (!retryResponse.ok) throw new Error("Failed to fetch balance");
            
            const balanceData: BalanceDto = await retryResponse.json();
            this.balance = {
              id: balanceData.userId,
              user_id: balanceData.userId,
              identifier: balanceData.userId,
              amount: new Decimal(balanceData.balance).toDecimalPlaces(2),
              created_at: new Date(balanceData.lastUpdated),
              updated_at: new Date(balanceData.lastUpdated),
            };
            return;
          }
          throw new Error("Failed to fetch balance");
        }

        const balanceData: BalanceDto = await response.json();
        this.balance = {
          id: balanceData.userId,
          user_id: balanceData.userId,
          identifier: balanceData.userId,
          amount: new Decimal(balanceData.balance).toDecimalPlaces(2),
          created_at: new Date(balanceData.lastUpdated),
          updated_at: new Date(balanceData.lastUpdated),
        };
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Помилка при отриманні балансу";

        const { show } = useNotification();
        show("Не вдалося завантажити баланс", {
          type: "error",
          duration: 4000,
        });
      } finally {
        this.isLoading = false;
      }
    },

    async fetchServices(requireAuth: boolean = true): Promise<void> {
      const authStore = useAuthStore();
      const userStore = useUserStore();
      const currentUser = userStore.currentUser;
      const lang = currentUser?.lang || 'uk';
      
      // Check if we have a token when authentication is required
      if (requireAuth && !authStore.accessToken) {
        return;
      }

      try {
        // Use new API endpoint for getting all services with language parameter
        const url = `/api/shop/services?lang=${lang}`;
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        // Add auth header only if token is available and auth is required
        if (authStore.accessToken && requireAuth) {
          headers.Authorization = `Bearer ${authStore.accessToken}`;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
          // If unauthorized but auth is required, retry once
          if (response.status === 401 && requireAuth && authStore.isAuthenticated && authStore.accessToken) {
            await new Promise(resolve => setTimeout(resolve, 200));
            const retryResponse = await fetch(url, {
              headers: {
                Authorization: `Bearer ${authStore.accessToken}`,
                "Content-Type": "application/json",
              },
            });
            
            if (!retryResponse.ok) {
              // If still fails with auth, try without auth for public access
              if (retryResponse.status === 401) {
                return this.fetchServices(false);
              }
              throw new Error(`Failed to fetch services: ${retryResponse.status}`);
            }
            
            const services = await retryResponse.json();
            this.services = services.filter((s: ServiceDto) => s.isActive);
            this.legacyServices = this.services.map(s => convertServiceDtoToLegacy(s, lang));
            return;
          }
          
          // If unauthorized but auth not required, this is expected for public access
          if (response.status === 401 && !requireAuth) {
            throw new Error(`Failed to fetch services: ${response.status}`);
          }
          
          throw new Error(`Failed to fetch services: ${response.status}`);
        }

        const services = await response.json();
        this.services = services.filter((s: ServiceDto) => s.isActive);

        // Convert to legacy format for compatibility with proper internationalization
        this.legacyServices = this.services.map(s => convertServiceDtoToLegacy(s, lang));
      } catch (error) {
        console.error("Помилка при отриманні послуг:", error);
        const { show } = useNotification();
        show("Помилка при отриманні списку послуг", { type: "error" });
      }
    },

    setSelectedServer(server: string) {
      if (this.currentPurchase) {
        this.currentPurchase.selectedServer = server;
      }
    },

    cancelCurrentPurchase() {
      this.currentPurchase = null;
      this.isProcessing = false;
      if (this.balanceCheckInterval) {
        clearInterval(this.balanceCheckInterval);
        this.balanceCheckInterval = null;
      }
    },

    async initiatePurchase(itemId: string) {
      console.log("initiatePurchase called with itemId:", itemId);

      if (!useAuthStore().isAuthenticated) {
        console.log("User not authenticated");
        const { show } = useNotification();
        show("Для покупки необхідно увійти в систему", {
          type: "error",
          duration: 4000,
        });
        return false;
      }

      this.isProcessing = true;
      const service = this.services.find((s) => s.id.toString() === itemId);
      console.log("Found service:", service);

      if (!service) {
        console.log("Service not found");
        const { show } = useNotification();
        show("Послуга не знайдена", { type: "error", duration: 4000 });
        this.isProcessing = false;
        return false;
      }

      try {
        // Use new API endpoint for purchase
        const response = await fetch("/api/shop/purchase", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${useAuthStore().accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceId: service.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        await this.fetchBalance();

        // Show success notification
        const { show: showSuccess } = useNotification();
        showSuccess(`Успішно придбано "${service.name}" за ${service.price}₴`, {
          type: "success",
          duration: 5000,
        });

        return true;
      } catch (error: unknown) {
        console.error("Помилка при здійсненні покупки:", error);
        console.log(
          "Error type:",
          typeof error,
          error instanceof Error ? error.constructor.name : "unknown",
        );
        const { show } = useNotification();

        if (error instanceof RequestError || error instanceof APIError) {
          // Map common errors to user-friendly messages
          let errorMessage = error.message;
          let isServerError = false;

          if (errorMessage.includes("Insufficient balance")) {
            errorMessage = "Недостатньо коштів на балансі";
          } else if (errorMessage.includes("Service not found")) {
            errorMessage = "Товар не знайдено або більше не доступний";
          } else if (errorMessage.includes("permission")) {
            errorMessage = "Недостатньо прав для здійснення покупки";
          } else if (errorMessage.includes("amount must be positive")) {
            errorMessage = "Некоректна сума транзакції";
          } else if (errorMessage.includes("already purchased")) {
            errorMessage = "Цей товар вже придбано";
          } else if (errorMessage.includes("limit exceeded")) {
            errorMessage = "Перевищено ліміт покупок для цього товару";
          } else if (
            errorMessage.includes("requires server selection") ||
            errorMessage.includes("target_servers not provided")
          ) {
            errorMessage =
              "Цей товар потребує вибору сервера. Функція буде додана незабаром.";
            isServerError = true;
          } else if (
            errorMessage.includes("Internal Server Error") ||
            error.message.includes("500")
          ) {
            errorMessage =
              "Внутрішня помилка сервера. Зверніться до адміністрації.";
            isServerError = true;

            // Log detailed error for support
            console.error("Shop purchase 500 error details:", {
              itemId,
              service: service?.name,
              error: error.message,
              timestamp: new Date().toISOString(),
            });
          }

          show(errorMessage, {
            type: "error",
            duration: isServerError ? 8000 : 5000,
          });

          // Show additional support message for server errors
          if (isServerError) {
            setTimeout(() => {
              show(
                "Якщо проблема повторюється, зверніться до адміністрації через Discord або тікет-систему",
                {
                  type: "info",
                  duration: 6000,
                },
              );
            }, 1000);
          }
        } else {
          // Log unexpected errors for debugging
          console.error("Unexpected shop purchase error:", {
            itemId,
            service: service?.name,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
          });

          show(
            "Невідома помилка при здійсненні покупки. Зверніться до адміністрації.",
            {
              type: "error",
              duration: 6000,
            },
          );

          setTimeout(() => {
            show(
              "Деталі помилки збережено в консолі браузера для діагностики",
              {
                type: "info",
                duration: 4000,
              },
            );
          }, 1000);
        }

        return false;
      } finally {
        this.isProcessing = false;
      }
    },

    async startBalanceCheck(amount: Decimal) {
      if (this.balanceCheckInterval) {
        clearInterval(this.balanceCheckInterval);
      }

      const { show } = useNotification();
      show("Очікуємо поповнення балансу...", {
        type: "info",
        duration: 5000,
      });

      this.balanceCheckInterval = window.setInterval(async () => {
        await this.fetchBalance();
        if (this.balance && this.balance.amount >= amount) {
          show("Баланс успішно поповнено!", {
            type: "success",
            duration: 4000,
          });
          this.cancelCurrentPurchase();
          return true;
        }
      }, 5000);

      setTimeout(
        () => {
          if (this.balanceCheckInterval) {
            clearInterval(this.balanceCheckInterval);
            this.balanceCheckInterval = null;
            show("Час очікування поповнення балансу вийшов", {
              type: "warn",
              duration: 4000,
            });
          }
        },
        5 * 60 * 1000,
      );
    },
  },
});

export function useBalanceWatcher() {
  const balanceStore = useBalanceStore();
  const authStore = useAuthStore();

  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        // Add a small delay to ensure token is fully available
        setTimeout(async () => {
          // Double-check authentication and token availability
          if (authStore.isAuthenticated && authStore.accessToken) {
            await balanceStore.fetchBalance();
            await balanceStore.fetchServices(true); // Re-fetch with auth for user-specific data
          }
        }, 100);
      } else {
        // When logging out, only reset balance but keep services for public viewing
        balanceStore.balance = null;
        balanceStore.currentPurchase = null;
        balanceStore.isProcessing = false;
        if (balanceStore.balanceCheckInterval) {
          clearInterval(balanceStore.balanceCheckInterval);
          balanceStore.balanceCheckInterval = null;
        }
      }
    },
    { immediate: true },
  );
}

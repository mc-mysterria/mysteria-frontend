import { defineStore } from "pinia";
import { serviceAPI } from "@/utils/api/payments";
import { useAuthStore } from "@/stores/auth";
import { watch } from "vue";
import { useNotification } from "@/services/useNotification";
import type {
  ServiceResponse,
  ServiceCreate,
  ServiceUpdate,
  ServiceFilterParams,
} from "@/types/services";

interface ServicesState {
  services: ServiceResponse[];
  currentService: ServiceResponse | null;
  isLoading: boolean;
  error: string | null;
}

export const useServicesStore = defineStore("services", {
  state: (): ServicesState => ({
    services: [],
    currentService: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    allServices: (state) => state.services,
    selectedService: (state) => state.currentService,
    isServiceLoading: (state) => state.isLoading,
    serviceError: (state) => state.error,
  },

  actions: {
    async fetchServices(type?: string) {
      this.isLoading = true;
      this.error = null;
      const { show } = useNotification();

      try {
        const response = await serviceAPI.getList("", {
          filters: type ? { type: type as any } : {},
        });
        this.services = response.data;
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Помилка при отриманні сервісів";
        show(this.error, { type: "error" });
      } finally {
        this.isLoading = false;
      }
    },

    async fetchAffordableServices() {
      this.isLoading = true;
      this.error = null;
      const { show } = useNotification();

      try {
        const response = await serviceAPI.getAffordable();
        this.services = response.data;
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Помилка при отриманні доступних сервісів";
        show(this.error, { type: "error" });
      } finally {
        this.isLoading = false;
      }
    },

    async createService(data: ServiceCreate) {
      this.isLoading = true;
      this.error = null;
      const { show } = useNotification();

      try {
        const response = await serviceAPI.create(data);
        this.services.push(response.data);
        return response.data;
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Помилка при створенні сервісу";
        show(this.error, { type: "error" });
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    reset() {
      this.services = [];
      this.currentService = null;
      this.isLoading = false;
      this.error = null;
    },
  },
});

export function useServicesWatcher() {
  const servicesStore = useServicesStore();
  const authStore = useAuthStore();

  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        servicesStore.fetchServices();
      } else {
        servicesStore.reset();
      }
    },
    { immediate: true },
  );
}

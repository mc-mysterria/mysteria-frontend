import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  Magic,
  OfflinePlayer,
  PlayerInfo,
  StatsSummary,
} from "@/types/catwalk";
import { catwalkAPI } from "@/utils/api/catwalk";

export const useCatwalkStore = defineStore("catwalk", () => {
  const magic = ref<Magic>({
    pathway: "",
    sequence: 10,
    translatedPathway: "",
  });

  const serverInfo = ref<Record<string, unknown> | null>(null);
  const allPlayers = ref<OfflinePlayer[]>([]);
  const onlinePlayers = ref<PlayerInfo[]>([]);
  const serverStats = ref<StatsSummary | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchMagic(nickname: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await catwalkAPI.getMagic(nickname);
      if (result) {
        magic.value = result;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching magic:", err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchServerInfo() {
    isLoading.value = true;
    error.value = null;

    try {
      serverInfo.value = (await catwalkAPI.getServerInfo()) as Record<
        string,
        unknown
      >;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching server info:", err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAllPlayers() {
    isLoading.value = true;
    error.value = null;

    try {
      allPlayers.value = await catwalkAPI.getAllPlayers();
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching all players:", err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchOnlinePlayers() {
    isLoading.value = true;
    error.value = null;

    try {
      onlinePlayers.value = await catwalkAPI.getOnlinePlayers();
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching online players:", err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchServerStats() {
    isLoading.value = true;
    error.value = null;

    try {
      serverStats.value = (await catwalkAPI.getServerStats()) as StatsSummary;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching server stats:", err);
    } finally {
      isLoading.value = false;
    }
  }

  async function executeCommand(command: string) {
    error.value = null;

    try {
      return await catwalkAPI.executeCommand(command);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Error executing command:", err);
      throw err;
    }
  }

  async function sendMessage(playerUuid: string, message: string) {
    error.value = null;

    try {
      return await catwalkAPI.sendMessageToPlayer(playerUuid, message);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Error sending message:", err);
      throw err;
    }
  }

  function reset() {
    magic.value = {
      pathway: "",
      sequence: 10,
      translatedPathway: "",
    };
    serverInfo.value = null;
    allPlayers.value = [];
    onlinePlayers.value = [];
    serverStats.value = null;
    isLoading.value = false;
    error.value = null;
  }

  const pathway = computed(() => magic.value.pathway);

  return {
    magic,
    serverInfo,
    allPlayers,
    onlinePlayers,
    serverStats,
    isLoading,
    error,
    fetchMagic,
    fetchServerInfo,
    fetchAllPlayers,
    fetchOnlinePlayers,
    fetchServerStats,
    executeCommand,
    sendMessage,
    reset,
    pathway,
  };
});

export async function fetchMagicDirect(nickname: string) {
  return await catwalkAPI.getMagic(nickname);
}

import {onUnmounted, readonly, ref} from "vue";

export const SERVER_IP = "mc.mysterria.net";

/* ------------------------------------------------------------------ *
 * Live status - one poller shared by every mounted consumer.
 * ------------------------------------------------------------------ */

const isOnline = ref(false);
const playerCount = ref<number | null>(null);

let pollInterval: ReturnType<typeof setInterval> | null = null;
let consumers = 0;

async function fetchStatus() {
    try {
        const response = await fetch(`https://mcapi.us/server/status?ip=${SERVER_IP}`);
        if (!response.ok) return;
        const data = await response.json();
        isOnline.value = data.online === true;
        playerCount.value = isOnline.value ? (data.players?.now ?? 0) : null;
    } catch {
        isOnline.value = false;
        playerCount.value = null;
    }
}

export function useServerStatus() {
    consumers++;
    if (!pollInterval) {
        void fetchStatus();
        pollInterval = setInterval(fetchStatus, 60_000);
    }

    onUnmounted(() => {
        consumers--;
        if (consumers <= 0 && pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    });

    return {
        isOnline: readonly(isOnline),
        playerCount: readonly(playerCount),
        refresh: fetchStatus,
    };
}

/* ------------------------------------------------------------------ *
 * Copy the server address, with the design's 1.8s confirmation window.
 * ------------------------------------------------------------------ */

export function useCopyIp() {
    const copied = ref(false);
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const copyIp = async () => {
        try {
            await navigator.clipboard.writeText(SERVER_IP);
        } catch {
            // Clipboard unavailable (insecure context / denied) - still flash the
            // confirmation so the address stays selectable on screen.
        }
        copied.value = true;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            copied.value = false;
        }, 1800);
    };

    onUnmounted(() => {
        if (timeout) clearTimeout(timeout);
    });

    return {copied, copyIp};
}

<template>
  <div v-if="isPrivileged">
    <router-view/>
  </div>
  <div v-else>
    <UnauthorizedMessage/>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {useAuthStore} from '@/stores/auth';
import UnauthorizedMessage from '@/components/ui/UnauthorizedMessage.vue';

const authStore = useAuthStore();
const isPrivileged = computed(() => authStore.isPrivilegedUser);
</script>

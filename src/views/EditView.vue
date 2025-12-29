<template>
  <div v-if="canEditContent">
    <router-view/>
  </div>
  <div v-else>
    <UnauthorizedMessage/>
  </div>
</template>

<script lang="ts" setup>
import {usePermissions} from '@/composables/usePermissions';
import UnauthorizedMessage from '@/components/ui/UnauthorizedMessage.vue';

const {canEditAnyContent} = usePermissions();
const canEditContent = canEditAnyContent;
</script>

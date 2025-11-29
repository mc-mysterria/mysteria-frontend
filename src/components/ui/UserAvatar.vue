<template>
  <div
      :class="[
      'user-avatar',
      `user-avatar--${size}`,
      { 'user-avatar--loading': isLoading }
    ]"
      :title="user?.nickname || 'User'"
  >
    <img
        v-if="user?.avatarUrl && !imageError && !isLoading"
        :src="user.avatarUrl"
        :alt="`${user.nickname || 'User'}'s avatar`"
        class="avatar-image"
        @error="handleImageError"
        @load="handleImageLoad"
    />
    <div v-else class="avatar-fallback">
      <span class="avatar-initials">
        {{ getInitials(user?.nickname) }}
      </span>
    </div>
    <div v-if="isLoading" class="avatar-loading">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import type {UserProfileDto} from '@/types/auth';
import type {UserResponse} from '@/types/users';

interface Props {
  user?: UserProfileDto | UserResponse | null;
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium'
});

const imageError = ref(false);
const isLoading = ref(false);

const getInitials = (nickname?: string) => {
  if (!nickname) return '?';
  return nickname.charAt(0).toUpperCase();
};

const handleImageError = () => {
  imageError.value = true;
  isLoading.value = false;
};

const handleImageLoad = () => {
  isLoading.value = false;
};

// Set loading state when avatar URL changes
const avatarUrl = computed(() => props.user?.avatarUrl);
</script>

<style scoped>
.user-avatar {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 2px solid color-mix(in srgb, white 15%, transparent);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  border-color: color-mix(in srgb, white 30%, transparent);
  transform: scale(1.05);
}

.user-avatar--small {
  width: 32px;
  height: 32px;
}

.user-avatar--medium {
  width: 40px;
  height: 40px;
}

.user-avatar--large {
  width: 64px;
  height: 64px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--myst-gold) 0%, color-mix(in srgb, var(--myst-gold) 80%, orange 20%) 100%);
}

.avatar-initials {
  font-weight: 600;
  color: var(--myst-bg);
  font-size: 0.8em;
  text-transform: uppercase;
}

.user-avatar--small .avatar-initials {
  font-size: 12px;
}

.user-avatar--medium .avatar-initials {
  font-size: 14px;
}

.user-avatar--large .avatar-initials {
  font-size: 20px;
}

.avatar-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--myst-bg) 90%, transparent);
}

.loading-spinner {
  width: 60%;
  height: 60%;
  border: 2px solid color-mix(in srgb, var(--myst-gold) 30%, transparent);
  border-top: 2px solid var(--myst-gold);
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

@media (max-width: 768px) {
  .user-avatar--small {
    width: 28px;
    height: 28px;
  }

  .user-avatar--medium {
    width: 36px;
    height: 36px;
  }

  .user-avatar--large {
    width: 56px;
    height: 56px;
  }
}
</style>
<template>
  <div :class="[size, { 'has-glow': glow }]" class="myst-avatar-wrapper">
    <div class="avatar-ritual-frame">
      <img
          :alt="nickname || 'User'"
          :src="avatarUrl"
          class="avatar-img"
          @error="handleError"
      />
      <div class="frame-overlay"></div>
    </div>
    <span v-if="showNickname && nickname" class="avatar-nickname">{{ nickname }}</span>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue';

const props = withDefaults(defineProps<{
  src?: string;
  nickname?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showNickname?: boolean;
  glow?: boolean;
}>(), {
  size: 'md',
  showNickname: false,
  glow: false
});

const hasError = ref(false);

const avatarUrl = computed(() => {
  if (hasError.value || !props.src) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(props.nickname || 'M')}&background=c8b273&color=05070a`;
  }
  return props.src;
});

const handleError = () => {
  hasError.value = true;
};
</script>

<style scoped>
.myst-avatar-wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
}

.avatar-ritual-frame {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  padding: 0;
  background: linear-gradient(135deg, var(--myst-gold), transparent, var(--myst-gold));
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: inset 0 0 0 2px #05070a;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  background: #05070a;
  display: block;
}

.frame-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.avatar-nickname {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #ccc;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Base Sizing on the wrapper */
.xs { width: 24px; height: 24px; }
.sm { width: 36px; height: 36px; }
.md { width: 48px; height: 48px; }
.lg { width: 64px; height: 64px; }
.xl { width: 96px; height: 96px; }
.full { width: 100%; height: 100%; }

.has-glow .avatar-ritual-frame {
  box-shadow: 0 0 20px rgba(200, 178, 115, 0.3);
}

.has-glow:hover .avatar-ritual-frame {
  box-shadow: 0 0 30px rgba(200, 178, 115, 0.5);
  transform: scale(1.05);
  transition: all 0.3s ease;
}
</style>

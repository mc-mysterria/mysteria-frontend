<template>
  <Teleport to="body">
    <Transition name="ritual-fade">
      <div v-if="localShow" class="modal-ritual-overlay" @click="handleOverlayClick">
        <div
            :class="[size, { 'has-footer': $slots.footer }]"
            class="modal-ritual-content"
            @click.stop
        >
          <div class="modal-ritual-header">
            <h3 class="ritual-title">
              <slot name="header">{{ localTitle }}</slot>
            </h3>
            <button class="modal-ritual-close" @click="close">†</button>
          </div>

          <div class="modal-ritual-body no-scrollbar">
            <slot></slot>
          </div>

          <div v-if="$slots.footer" class="modal-ritual-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import {ref, watch} from 'vue';

const props = withDefaults(defineProps<{
  show?: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
}>(), {
  show: false,
  size: 'md',
  closeOnOverlay: true
});

const emit = defineEmits(['close', 'confirm', 'cancel']);

const localShow = ref(props.show);
const localTitle = ref(props.title);
const onConfirmCallback = ref<(() => void) | null>(null);
const onCancelCallback = ref<(() => void) | null>(null);

watch(() => props.show, (newVal) => {
  localShow.value = newVal;
});

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    close();
  }
};

const showModal = (config: { title?: string, onConfirm?: () => void, onCancel?: () => void }) => {
  if (config.title) localTitle.value = config.title;
  onConfirmCallback.value = config.onConfirm || null;
  onCancelCallback.value = config.onCancel || null;
  localShow.value = true;
};

const close = () => {
  localShow.value = false;
  emit('close');
  if (onCancelCallback.value) onCancelCallback.value();
};

const onConfirm = () => {
  if (onConfirmCallback.value) onConfirmCallback.value();
  emit('confirm');
  localShow.value = false;
};

const onCancel = () => {
  close();
};

defineExpose({
  showModal,
  closeModal: close,
  isVisible: localShow,
  onConfirm,
  onCancel
});
</script>

<style scoped>
.modal-ritual-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
}

.modal-ritual-content {
  background: #080a14;
  border: 1px solid rgba(200, 178, 115, 0.2);
  width: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  position: relative;
}

.modal-ritual-header {
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ritual-title {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: var(--myst-gold);
  margin: 0;
}

.modal-ritual-close {
  background: none; border: none;
  color: #444; font-size: 24px;
  cursor: pointer; transition: color 0.3s;
}
.modal-ritual-close:hover { color: var(--myst-gold); }

.modal-ritual-body {
  padding: 32px;
  overflow-y: auto;
  max-height: calc(90vh - 140px);
}

.modal-ritual-footer {
  padding: 24px 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  background: rgba(255, 255, 255, 0.02);
}

/* Sizes */
.sm { max-width: 400px; }
.md { max-width: 600px; }
.lg { max-width: 800px; }
.xl { max-width: 1000px; }
.full { max-width: 95vw; height: 95vh; }

.no-scrollbar::-webkit-scrollbar { display: none; }

/* Transitions */
.ritual-fade-enter-active, .ritual-fade-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.ritual-fade-enter-from, .ritual-fade-leave-to { opacity: 0; transform: scale(0.95) translateY(10px); }
</style>

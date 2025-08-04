<template>
  <div class="field-container">
    <label :for="fieldId" class="field-label">{{ label }}</label>
    <div
      class="input-wrapper"
      :class="{ 'has-error': error, 'is-disabled': isDisabled || isReadonly }"
    >
      <i
        v-if="icon"
        :class="['icon', icon]"
        aria-hidden="true"
        @click="type === 'date' ? openDatePicker() : undefined"
        :style="type === 'date' ? 'cursor: pointer;' : ''"
      ></i>

      <!-- REWORKED DROPDOWN -->
      <template v-if="type === 'select'">
        <div
          v-click-outside="closeDropdown"
          class="custom-select"
          :class="{ 'is-open': dropdownOpen }"
          :tabindex="isDisabled ? -1 : 0"
          @click="toggleDropdown"
          @keydown.down.prevent="moveDown"
          @keydown.up.prevent="moveUp"
          @keydown.enter.prevent="selectHighlighted"
          @keydown.esc.prevent="closeDropdown"
          :aria-expanded="dropdownOpen"
          :aria-disabled="isDisabled"
        >
          <span
            class="selected-value"
            :class="{ 'is-placeholder': isPlaceholder }"
          >
            {{ displayValue }}
          </span>
          <i class="fa-solid fa-chevron-down select-arrow"></i>

          <Transition name="dropdown-fade">
            <div
              v-if="dropdownOpen"
              class="dropdown-list"
              ref="dropdownListRef"
            >
              <div
                v-for="(option, idx) in options"
                :key="option"
                :ref="(el) => (optionRefs[idx] = el as HTMLElement)"
                :class="[
                  'dropdown-option',
                  {
                    selected: option === modelValue,
                    highlighted: idx === highlightedIdx,
                  },
                ]"
                @mousedown.prevent="selectOption(option)"
                @mouseenter="highlightedIdx = idx"
              >
                <i
                  class="fa-solid fa-check check-icon"
                  v-if="option === modelValue"
                ></i>
                <span class="option-text">{{ option }}</span>
              </div>
            </div>
          </Transition>
        </div>
      </template>

      <!-- Other input types remain the same -->
      <template v-else-if="type === 'textarea'">
        <textarea
          :id="fieldId"
          :value="modelValue"
          @input="emitValue"
          :readonly="isReadonly"
          :maxlength="maxlength"
          class="form-input"
          v-bind="$attrs"
        ></textarea>
      </template>
      <template v-else>
        <input
          ref="dateInput"
          :id="fieldId"
          :type="type"
          :value="modelValue"
          @input="emitValue"
          :readonly="isReadonly"
          :maxlength="maxlength"
          class="form-input"
          v-bind="$attrs"
        />
        <i
          v-if="type === 'date' && !icon"
          class="fa-solid fa-calendar-day date-icon"
          @click="openDatePicker()"
          style="cursor: pointer"
        ></i>
      </template>
    </div>
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  nextTick,
  onBeforeUpdate,
  withDefaults,
} from "vue";

interface Props {
  modelValue: string | number;
  fieldId: string;
  label: string;
  type?: "text" | "date" | "textarea" | "select";
  icon?: string;
  error?: string | null;
  isReadonly?: boolean;
  isDisabled?: boolean;
  options?: string[];
  maxlength?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  icon: "",
  error: null,
  isReadonly: false,
  isDisabled: false,
  options: () => [],
});

const dateInput = ref<HTMLInputElement | null>(null);

const openDatePicker = () => {
  // The 'showPicker' method is not in the standard HTMLInputElement interface,
  // but it's supported by modern browsers for <input type="date">.
  if (dateInput.value && "showPicker" in dateInput.value) {
    (dateInput.value as unknown as HTMLInputElement).showPicker();
  }
};

const emit = defineEmits(["update:modelValue"]);

const emitValue = (event: Event) => {
  const target = event.target as
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement;
  emit("update:modelValue", target.value);
};

const vClickOutside = {
  beforeMount(
    el: HTMLElement,
    binding: { value: (event: MouseEvent) => void },
  ) {
    (
      el as HTMLElement & { clickOutsideEvent?: (event: MouseEvent) => void }
    ).clickOutsideEvent = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event);
      }
    };
    document.addEventListener(
      "click",
      (el as HTMLElement & { clickOutsideEvent?: (event: MouseEvent) => void })
        .clickOutsideEvent!,
    );
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener(
      "click",
      (el as HTMLElement & { clickOutsideEvent?: (event: MouseEvent) => void })
        .clickOutsideEvent!,
    );
  },
};

const dropdownOpen = ref(false);
const highlightedIdx = ref(-1);
const dropdownListRef = ref<HTMLElement | null>(null);
const optionRefs = ref<HTMLElement[]>([]);

onBeforeUpdate(() => {
  optionRefs.value = [];
});

const options = computed(() => props.options);
const isPlaceholder = computed(() => !props.modelValue);
const displayValue = computed(() => {
  return isPlaceholder.value ? "-- Виберіть опцію --" : props.modelValue;
});

const scrollToHighlighted = () => {
  if (highlightedIdx.value >= 0 && optionRefs.value[highlightedIdx.value]) {
    optionRefs.value[highlightedIdx.value].scrollIntoView({
      block: "nearest",
    });
  }
};

const findInitialIndex = () => {
  return options.value.findIndex((opt) => opt === props.modelValue);
};

const toggleDropdown = () => {
  if (props.isDisabled || props.isReadonly) return;
  dropdownOpen.value = !dropdownOpen.value;
  if (dropdownOpen.value) {
    highlightedIdx.value = findInitialIndex();
    nextTick(() => scrollToHighlighted());
  }
};

const closeDropdown = () => {
  dropdownOpen.value = false;
  highlightedIdx.value = -1;
};

const selectOption = (option: string) => {
  emit("update:modelValue", option);
  closeDropdown();
};

const moveDown = () => {
  if (props.isDisabled || props.isReadonly) return;
  if (!dropdownOpen.value) {
    toggleDropdown();
    return;
  }
  if (options.value.length === 0) return;
  highlightedIdx.value = (highlightedIdx.value + 1) % options.value.length;
  scrollToHighlighted();
};

const moveUp = () => {
  if (props.isDisabled || props.isReadonly) return;
  if (!dropdownOpen.value) {
    toggleDropdown();
    return;
  }
  if (options.value.length === 0) return;
  highlightedIdx.value =
    (highlightedIdx.value - 1 + options.value.length) % options.value.length;
  scrollToHighlighted();
};

const selectHighlighted = () => {
  if (dropdownOpen.value && highlightedIdx.value >= 0) {
    selectOption(options.value[highlightedIdx.value]);
  }
};

watch(
  () => props.modelValue,
  () => {
    if (!dropdownOpen.value) {
      highlightedIdx.value = findInitialIndex();
    }
  },
);
</script>

<style scoped>
/* General styles (unchanged) */
.field-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.field-label {
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #a0a0a0;
}

.input-wrapper {
  position: relative;
  display: flex;
  width: 100%;
  background-color: #1e2126;
  border: 1px solid #3a3d45;
  border-radius: 8px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.input-wrapper:hover {
  border-color: #555966;
}

.input-wrapper:focus-within {
  border-color: #ee7828;
  box-shadow: 0 0 0 3px rgba(238, 120, 40, 0.2);
}

.form-input {
  flex-grow: 1;
  width: 100%;
  padding: 12px 16px;
  background-color: transparent;
  color: #fff;
  border: none;
  outline: none;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-input:-webkit-autofill,
.form-input:-webkit-autofill:hover,
.form-input:-webkit-autofill:focus,
.form-input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px #1e2126 inset !important;
  -webkit-text-fill-color: #fff !important;
}

.icon {
  display: flex;
  align-items: center;
  padding-left: 16px;
  color: #707070;
}

.date-icon {
  display: flex;
  align-items: center;
  padding-right: 16px;
  color: #707070;
  pointer-events: none;
}

/* Hide native date picker icon */
input[type="date"]::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}

input[type="date"]::-webkit-inner-spin-button,
input[type="date"]::-webkit-outer-spin-button {
  display: none;
  -webkit-appearance: none;
}

/* Firefox date picker icon */
input[type="date"] {
  -moz-appearance: none;
  appearance: none;
  background-image: none !important;
  background-repeat: no-repeat;
  background-position: right center;
  padding-right: 16px !important;
}

input[type="date"]::-moz-calendar-picker-indicator {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
  width: 0 !important;
  height: 0 !important;
}

input[type="date"]::-moz-clear {
  display: none !important;
}

/* Additional Firefox fixes */
@-moz-document url-prefix() {
  input[type="date"] {
    background-image: none !important;
  }

  input[type="date"]::-moz-calendar-picker-indicator {
    display: none !important;
  }
}

textarea.form-input {
  resize: vertical;
  min-height: 120px;
}

.has-error {
  border-color: #ff5252;
}

.has-error:focus-within {
  border-color: #ff5252;
  box-shadow: 0 0 0 3px rgba(255, 82, 82, 0.3);
}

.error-message {
  color: #ff5252;
  font-size: 0.875rem;
  margin-top: 6px;
}

.is-disabled {
  background-color: #2a2d33;
  opacity: 0.6;
  cursor: not-allowed;
}

.is-disabled:hover {
  border-color: #3a3d45;
}

/* --- Reworked Dropdown Styles --- */
.custom-select {
  position: relative;
  width: 100%;
  cursor: pointer;
  user-select: none;
  outline: none;
}

.custom-select.is-open .input-wrapper {
  border-color: #ee7828;
  box-shadow: 0 0 0 3px rgba(238, 120, 40, 0.2);
}

.selected-value {
  display: block;
  padding: 12px 40px 12px 16px;
  font-size: 1rem;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-value.is-placeholder {
  color: #888;
}

.select-arrow {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 0 16px;
  color: #707070;
  pointer-events: none;
  transition: transform 0.2s ease-in-out;
}

.custom-select.is-open .select-arrow {
  transform: translateY(-50%) rotate(180deg);
}

.dropdown-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  background: #23262b;
  border: 1px solid #3a3d45;
  border-radius: 8px;
  z-index: 10;
  max-height: 220px;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  padding: 4px;
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.98);
}

.dropdown-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  color: #fff;
  border-radius: 6px;
  transition: background-color 0.15s ease;
}

.dropdown-option:not(:last-child) {
  margin-bottom: 2px;
}

.dropdown-option.highlighted,
.dropdown-option:hover {
  background-color: #2f333a;
}

.dropdown-option.selected {
  font-weight: 600;
  color: #ee7828;
}

.check-icon {
  width: 16px;
  font-size: 0.8rem;
  color: #ee7828;
}

.dropdown-option:not(.selected) .check-icon {
  opacity: 0;
}

/* Custom scrollbar for dropdown */
.dropdown-list::-webkit-scrollbar {
  width: 6px;
}

.dropdown-list::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-list::-webkit-scrollbar-thumb {
  background-color: #4a4f5a;
  border-radius: 10px;
}
</style>

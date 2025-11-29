<template>
  <div
      class="dropdown-wrapper"
      ref="dropdownRef"
      :class="{ 'form-field-style': formFieldStyle }"
  >
    <i
        v-if="showIcon && icon"
        :class="['dropdown-icon', icon]"
        aria-hidden="true"
    ></i>
    <div
        class="dropdown-trigger"
        @click="toggleDropdown"
        :class="{
        'is-open': isOpen,
        'is-disabled': disabled,
        'with-icon': showIcon,
      }"
    >
      <div class="dropdown-value">
        <slot
            name="selected"
            :selectedOption="selectedOption"
            :placeholder="placeholderText"
        >
          {{ selectedOption ? selectedOption[displayKey] : placeholderText }}
        </slot>
      </div>
      <div class="dropdown-arrow" :class="{ 'is-open': isOpen }">
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="isOpen" class="dropdown-overlay" @click="closeDropdown"/>
    </Teleport>

    <Teleport to="body">
      <div
          v-if="isOpen || isClosing"
          class="dropdown-menu"
          :class="{ closing: isClosing }"
          ref="menuRef"
          :style="menuStyles"
      >
        <div v-if="searchable" class="dropdown-search">
          <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholderText"
              class="dropdown-search-input"
              @click.stop
          />
        </div>

        <div class="dropdown-options" :style="{ maxHeight: `${maxHeight}px` }">
          <div
              v-for="(option, idx) in displayOptions"
              :key="getOptionKey(option)"
              class="dropdown-option"
              :class="{
              'is-selected': isSelected(option),
              'is-highlighted':
                highlightedIndex === displayOptions.indexOf(option),
            }"
              :style="{ animationDelay: `${idx * 30}ms` }"
              @click="selectOption(option)"
              @mouseenter="highlightedIndex = displayOptions.indexOf(option)"
          >
            <slot
                name="option"
                :option="option"
                :isSelected="isSelected(option)"
            >
              <div class="option-content">
                <span class="option-text">{{ option[displayKey] }}</span>
                <span v-if="option[descriptionKey]" class="option-description">
                  {{ option[descriptionKey] }}
                </span>
              </div>
            </slot>
          </div>

          <div v-if="displayOptions.length === 0" class="dropdown-no-results">
            <slot name="no-results">
              <div
                  v-if="props.allowCustomInput && searchQuery"
                  class="custom-input-option"
              >
                <button
                    @click="selectCustomInput"
                    :class="[
                    'custom-input-btn',
                    { 'is-highlighted': isCustomInputHighlighted },
                  ]"
                    type="button"
                >
                  Використати: "{{ searchQuery }}"
                </button>
              </div>
              <div v-else>
                {{ noResultsText }}
              </div>
            </slot>
          </div>

          <div
              v-if="shouldShowCustomInputOption"
              class="custom-input-option"
              style="
              padding: 8px 12px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
            "
          >
            <button
                @click="selectCustomInput"
                :class="[
                'custom-input-btn',
                { 'is-highlighted': isCustomInputHighlighted },
              ]"
                type="button"
            >
              Використати: "{{ searchQuery }}"
            </button>
          </div>
        </div>

        <div v-if="$slots.footer" class="dropdown-footer">
          <slot name="footer"/>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch,} from "vue";
import {useI18n} from "@/composables/useI18n";

interface DropdownOption {
  label: string;
  value: string | number;

  [key: string]: string | number | undefined;
}

export interface ComponentProps {
  modelValue?: string | number | string[];
  options: DropdownOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  displayKey?: string;
  valueKey?: string;
  descriptionKey?: string;
  searchable?: boolean;
  allowCustomInput?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  maxHeight?: number;
  noResultsText?: string;
  minWidth?: number;
  maxWidth?: number;
  formFieldStyle?: boolean;
  showIcon?: boolean;
  icon?: string;
}

const props = withDefaults(defineProps<ComponentProps>(), {
  placeholder: "",
  searchPlaceholder: "",
  displayKey: "label",
  valueKey: "value",
  descriptionKey: "description",
  searchable: false,
  allowCustomInput: false,
  disabled: false,
  clearable: false,
  multiple: false,
  maxHeight: 300,
  noResultsText: "",
  minWidth: 200,
  maxWidth: 600,
  formFieldStyle: false,
  showIcon: false,
  icon: "",
});

const {t} = useI18n();

// Computed properties for internationalized text
const placeholderText = computed(() => props.placeholder || t("selectOption"));
const searchPlaceholderText = computed(
    () => props.searchPlaceholder || t("search"),
);
const noResultsText = computed(
    () => props.noResultsText || t("noResultsFound"),
);

const emit = defineEmits<{
  "update:modelValue": [value: string | number | string[]];
  change: [value: string | number | string[], option: DropdownOption | null];
  open: [];
  close: [];
  search: [query: string];
}>();

const dropdownRef = ref<HTMLElement>();
const menuRef = ref<HTMLElement>();
const searchInput = ref<HTMLInputElement>();
const isOpen = ref(false);
const isClosing = ref(false);
const frozenOptions = ref<DropdownOption[]>([]);
const searchQuery = ref("");
const highlightedIndex = ref(-1);
const menuStyles = ref({});

const selectedOption = computed(() => {
  if (!props.modelValue) return null;
  const foundOption = props.options.find(
      (option) => option[props.valueKey] === props.modelValue,
  );

  if (foundOption) {
    return foundOption;
  }

  if (props.allowCustomInput && typeof props.modelValue === "string") {
    return {
      [props.displayKey]: props.modelValue,
      [props.valueKey]: props.modelValue,
    } as DropdownOption;
  }

  return null;
});

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options;
  }

  const query = searchQuery.value.toLowerCase();
  return props.options.filter((option) => {
    const text = option[props.displayKey]?.toString().toLowerCase() || "";
    const desc = option[props.descriptionKey]?.toString().toLowerCase() || "";
    return text.includes(query) || desc.includes(query);
  });
});

const displayOptions = computed(() => {
  if (isClosing.value && frozenOptions.value.length > 0) {
    return frozenOptions.value;
  }
  return filteredOptions.value;
});

const shouldShowCustomInputOption = computed(() => {
  if (!props.allowCustomInput || !searchQuery.value.trim()) {
    return false;
  }

  const exactMatch = filteredOptions.value.some((option) => {
    const optionValue = option[props.displayKey]?.toString().toLowerCase();
    return optionValue === searchQuery.value.toLowerCase();
  });

  return !exactMatch && filteredOptions.value.length > 0;
});

const totalNavigableItems = computed(() => {
  let count = displayOptions.value.length;
  if (
      shouldShowCustomInputOption.value ||
      (props.allowCustomInput &&
          searchQuery.value.trim() &&
          displayOptions.value.length === 0)
  ) {
    count += 1;
  }
  return count;
});

const isCustomInputHighlighted = computed(() => {
  const customInputIndex = displayOptions.value.length;
  return highlightedIndex.value === customInputIndex;
});

const getOptionKey = (option: DropdownOption): string => {
  return (
      option[props.valueKey]?.toString() ||
      option[props.displayKey]?.toString() ||
      ""
  );
};

const isSelected = (option: DropdownOption): boolean => {
  if (props.multiple) {
    return (
        Array.isArray(props.modelValue) &&
        props.modelValue.includes(String(option[props.valueKey]))
    );
  }
  return option[props.valueKey] === props.modelValue;
};

const toggleDropdown = () => {
  if (props.disabled) return;

  if (isOpen.value) {
    closeDropdown();
  } else {
    openDropdown();
  }
};

const openDropdown = async () => {
  if (props.disabled) return;

  isOpen.value = true;

  if (
      props.allowCustomInput &&
      props.modelValue &&
      typeof props.modelValue === "string"
  ) {
    searchQuery.value = props.modelValue;
  }

  frozenOptions.value = filteredOptions.value;
  emit("open");

  await nextTick();
  calculateMenuPosition();

  if (props.searchable && searchInput.value) {
    searchInput.value.focus({preventScroll: true});
    if (props.allowCustomInput && searchQuery.value) {
      searchInput.value.select();
    }
  }

  highlightedIndex.value = selectedOption.value
      ? displayOptions.value.indexOf(selectedOption.value)
      : displayOptions.value.length > 0
          ? 0
          : -1;
};

const closeDropdown = () => {
  if (!isOpen.value || isClosing.value) return;

  isClosing.value = true;
  frozenOptions.value = filteredOptions.value;

  setTimeout(() => {
    isOpen.value = false;
    isClosing.value = false;
    searchQuery.value = "";
    highlightedIndex.value = -1;
    frozenOptions.value = [];
    emit("close");
  }, 150);
};

const selectOption = (option: DropdownOption) => {
  if (props.multiple) {
    const currentValues = Array.isArray(props.modelValue)
        ? [...props.modelValue]
        : [];
    const optionValue = option[props.valueKey];

    if (
        optionValue !== undefined &&
        currentValues.includes(String(optionValue))
    ) {
      const newValues = currentValues.filter(
          (val) => val !== String(optionValue),
      );
      emit("update:modelValue", newValues);
      emit("change", newValues, null);
    } else if (optionValue !== undefined) {
      const newValues = [...currentValues, String(optionValue)];
      emit("update:modelValue", newValues);
      emit("change", newValues, option);
    }
  } else {
    const optionValue = option[props.valueKey];
    if (optionValue !== undefined) {
      emit("update:modelValue", optionValue);
      emit("change", optionValue, option);
    }
    closeDropdown();
  }
};

const selectCustomInput = () => {
  if (!props.allowCustomInput || !searchQuery.value.trim()) return;

  const customValue = searchQuery.value.trim();
  emit("update:modelValue", customValue);
  emit("change", customValue, null);
  closeDropdown();
};

const calculateMenuPosition = () => {
  if (!dropdownRef.value || !menuRef.value) return;

  const trigger = props.formFieldStyle
      ? dropdownRef.value
      : (dropdownRef.value.querySelector(".dropdown-trigger") as HTMLElement);
  if (!trigger) return;

  const triggerRect = trigger.getBoundingClientRect();
  const menuRect = menuRef.value.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  let top = triggerRect.bottom + window.scrollY;
  let left = triggerRect.left + window.scrollX;
  let width = Math.max(triggerRect.width, props.minWidth);

  if (props.maxWidth && width > props.maxWidth) {
    width = props.maxWidth;
  }

  const spaceBelow = viewportHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;

  if (spaceBelow < menuRect.height && spaceAbove > spaceBelow) {
    top = triggerRect.top + window.scrollY - menuRect.height;
  }

  if (left + width > viewportWidth) {
    left = triggerRect.right + window.scrollX - width;
  }

  if (left < 0) {
    left = 10;
    width = Math.min(width, viewportWidth - 20);
  }

  menuStyles.value = {
    position: "absolute",
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    zIndex: 9999,
  };
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) return;

  switch (event.key) {
    case "Escape":
      closeDropdown();
      break;
    case "ArrowDown":
      event.preventDefault();
      if (highlightedIndex.value < totalNavigableItems.value - 1) {
        highlightedIndex.value++;
      }
      break;
    case "ArrowUp":
      event.preventDefault();
      if (highlightedIndex.value > 0) {
        highlightedIndex.value--;
      }
      break;
    case "Enter":
      event.preventDefault();
      if (isCustomInputHighlighted.value) {
        selectCustomInput();
      } else if (
          highlightedIndex.value >= 0 &&
          displayOptions.value[highlightedIndex.value]
      ) {
        selectOption(displayOptions.value[highlightedIndex.value]);
      } else if (
          props.allowCustomInput &&
          searchQuery.value.trim() &&
          displayOptions.value.length === 0
      ) {
        selectCustomInput();
      }
      break;
    case "Tab":
      closeDropdown();
      break;
  }
};

const handleResize = () => {
  if (isOpen.value) {
    calculateMenuPosition();
  }
};

watch(searchQuery, (newQuery) => {
  emit("search", newQuery);
  highlightedIndex.value = 0;
});

watch(
    () => props.options,
    () => {
      if (isOpen.value) {
        nextTick(() => {
          calculateMenuPosition();
        });
      }
    },
);

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", handleResize);
  window.addEventListener("scroll", handleResize);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("scroll", handleResize);
});
</script>

<style scoped>
.dropdown-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.dropdown-wrapper.form-field-style {
  display: flex;
  background-color: #1e2126;
  border: 1px solid #3a3d45;
  border-radius: 8px;
  transition: border-color 0.2s ease,
  box-shadow 0.2s ease;
}

.dropdown-wrapper.form-field-style:hover {
  border-color: #555966;
}

.dropdown-wrapper.form-field-style:focus-within {
  border-color: #ee7828;
  box-shadow: 0 0 0 3px rgba(238, 120, 40, 0.2);
}

.dropdown-wrapper.form-field-style.has-error {
  border-color: #ff5252;
}

.dropdown-wrapper.form-field-style.has-error:focus-within {
  border-color: #ff5252;
  box-shadow: 0 0 0 3px rgba(255, 82, 82, 0.3);
}

.dropdown-wrapper.form-field-style.is-disabled {
  background-color: #2a2d33;
  opacity: 0.6;
  cursor: not-allowed;
}

.dropdown-icon {
  display: flex;
  align-items: center;
  padding-left: 16px;
  color: #707070;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  background-color: #1e212b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: auto;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:root[data-theme="parchment"] .dropdown-trigger {
  background-color: var(--myst-bg-2);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  color: var(--myst-ink);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.form-field-style .dropdown-trigger {
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
  border-radius: 0;
  flex: 1;
}

.form-field-style .dropdown-trigger:hover:not(.is-disabled),
.form-field-style .dropdown-trigger.is-open {
  background: transparent;
  border: none;
  box-shadow: none;
}

.dropdown-trigger:hover:not(.is-disabled) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

:root[data-theme="parchment"] .dropdown-trigger:hover:not(.is-disabled) {
  background: var(--myst-bg);
  border-color: var(--myst-ink-muted);
}

.dropdown-trigger.is-open {
  border-color: #4ade80;
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.1);
}

:root[data-theme="parchment"] .dropdown-trigger.is-open {
  border-color: var(--myst-gold);
  box-shadow: 0 0 0 3px rgba(184, 134, 11, 0.15);
}

.dropdown-trigger.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dropdown-value {
  flex: 1;
  text-align: left;
  color: #ffffff;
}

:root[data-theme="parchment"] .dropdown-value {
  color: var(--myst-ink);
}

.dropdown-arrow {
  color: #cccccc;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  margin-left: 8px;
}

:root[data-theme="parchment"] .dropdown-arrow {
  color: var(--myst-ink-muted);
}

.dropdown-arrow.is-open {
  transform: rotate(180deg);
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 9998;
}

.dropdown-menu {
  margin-top: 5px;
  background: linear-gradient(135deg, #1a1d23 0%, #0f1419 100%);
  border: 1px solid rgba(108, 93, 211, 0.3);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: dropdown-enter 0.2s ease-out;
}

:root[data-theme="parchment"] .dropdown-menu {
  background: var(--myst-bg-2);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08);
}

.dropdown-menu.closing {
  animation: dropdown-exit 0.15s ease-in forwards;
}

@keyframes dropdown-enter {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes dropdown-exit {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-5px) scale(0.98);
  }
}

.dropdown-search {
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown-search-input {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.dropdown-search-input:focus {
  border-color: #4ade80;
  box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.1);
}

.dropdown-search-input::placeholder {
  color: #8b8b8b;
}

.dropdown-options {
  overflow-y: auto;
  padding: 0 0;
  scrollbar-width: thin;
  scrollbar-color: #4ade80 rgba(255, 255, 255, 0.05);
}

.dropdown-option {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid transparent;
  animation: slideInOption 0.3s ease-out forwards;
  opacity: 0;
  transform: translateY(-10px);
}

.closing .dropdown-option {
  animation: slideOutOption 0.15s ease-in forwards;
}

@keyframes slideInOption {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideOutOption {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-5px);
  }
}

.dropdown-option:hover,
.dropdown-option.is-highlighted {
  background: rgba(74, 222, 128, 0.1);
}

:root[data-theme="parchment"] .dropdown-option:hover,
:root[data-theme="parchment"] .dropdown-option.is-highlighted {
  background: color-mix(in srgb, var(--myst-gold) 15%, transparent);
}

.dropdown-option.is-selected {
  background: rgba(108, 93, 211, 0.2);
  color: #22d3ee;
}

:root[data-theme="parchment"] .dropdown-option.is-selected {
  background: color-mix(in srgb, var(--myst-gold) 20%, transparent);
  color: var(--myst-ink-strong);
}

.dropdown-option.is-selected:hover {
  background: rgba(108, 93, 211, 0.3);
}

:root[data-theme="parchment"] .dropdown-option.is-selected:hover {
  background: color-mix(in srgb, var(--myst-gold) 30%, transparent);
}

.option-content {
  display: flex;
  flex-direction: column;
}

.option-text {
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 2px;
}

:root[data-theme="parchment"] .option-text {
  color: var(--myst-ink);
}

.option-description {
  color: #8b8b8b;
  font-size: 0.8rem;
  line-height: 1.3;
}

:root[data-theme="parchment"] .option-description {
  color: var(--myst-ink-muted);
}

.dropdown-no-results {
  padding: 16px;
  text-align: center;
  color: #8b8b8b;
  font-style: italic;
}

.custom-input-option {
  padding: 0;
}

.custom-input-btn {
  width: 100%;
  padding: 12px 16px;
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(108, 93, 211, 0.3);
  border-radius: 6px;
  color: #22d3ee;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-style: normal;
}

.custom-input-btn:hover,
.custom-input-btn.is-highlighted {
  background: rgba(108, 93, 211, 0.2);
  border-color: rgba(108, 93, 211, 0.5);
}

.dropdown-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

/* Scrollbar styling - inherits from global styles but with custom sizing */
.dropdown-options::-webkit-scrollbar {
  width: 8px;
}

.dropdown-options::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  margin: 1px;
}

.dropdown-options::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #4ade80, #22d3ee);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.dropdown-options::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a4bc4, #7c6ef6);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Responsive styles */
@media (max-width: 1200px) {
  .dropdown-trigger {
    padding: 11px 14px;
    min-height: 46px;
    font-size: 0.95rem;
  }

  .dropdown-option {
    padding: 11px 14px;
  }

  .option-text {
    font-size: 0.95rem;
  }

  .option-description {
    font-size: 0.75rem;
  }
}

@media (max-width: 992px) {
  .dropdown-trigger {
    padding: 10px 13px;
    min-height: 44px;
    font-size: 0.9rem;
  }

  .dropdown-option {
    padding: 10px 13px;
  }

  .option-text {
    font-size: 0.9rem;
  }

  .option-description {
    font-size: 0.72rem;
  }

  .dropdown-search-input {
    padding: 7px 11px;
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .dropdown-menu {
    max-width: calc(100vw - 20px);
  }

  .dropdown-trigger {
    padding: 10px 12px;
    min-height: 42px;
    font-size: 0.85rem;
  }

  .dropdown-option {
    padding: 12px 14px;
  }

  .option-text {
    font-size: 0.85rem;
  }

  .option-description {
    font-size: 0.7rem;
  }

  .dropdown-search-input {
    padding: 6px 10px;
    font-size: 0.8rem;
  }

  .dropdown-no-results {
    padding: 14px;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .dropdown-menu {
    max-width: calc(100vw - 16px);
    border-radius: 10px;
  }

  .dropdown-trigger {
    padding: 9px 11px;
    min-height: 40px;
    font-size: 0.8rem;
    border-radius: 10px;
  }

  .dropdown-option {
    padding: 11px 12px;
  }

  .option-text {
    font-size: 0.8rem;
  }

  .option-description {
    font-size: 0.68rem;
  }

  .dropdown-search {
    padding: 10px;
  }

  .dropdown-search-input {
    padding: 6px 9px;
    font-size: 0.75rem;
    border-radius: 8px;
  }

  .dropdown-footer {
    padding: 10px 12px;
  }

  .dropdown-no-results {
    padding: 12px;
    font-size: 0.8rem;
  }

  .loading-text {
    font-size: 0.9rem;
  }
}
</style>

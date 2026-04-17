<template>
  <div
      ref="dropdownRef"
      :class="{ 'form-field-style': formFieldStyle, 'is-open': isOpen }"
      class="dropdown-wrapper"
  >
    <i
        v-if="showIcon && icon"
        :class="['dropdown-icon', icon]"
        aria-hidden="true"
    ></i>
    <div
        :class="{
        'is-open': isOpen,
        'is-disabled': disabled,
        'with-icon': showIcon,
      }"
        class="dropdown-trigger"
        @click="toggleDropdown"
    >
      <div class="dropdown-value">
        <slot
            :placeholder="placeholderText"
            :selectedOption="selectedOption"
            name="selected"
        >
          <span v-if="selectedOption" class="selected-text">{{ selectedOption[displayKey] }}</span>
          <span v-else class="placeholder-text">{{ placeholderText }}</span>
        </slot>
      </div>
      <div :class="{ 'is-open': isOpen }" class="dropdown-arrow">
        <i class="fa-solid fa-chevron-down"></i>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="isOpen" class="dropdown-overlay" @click="closeDropdown"/>
    </Teleport>

    <Teleport to="body">
      <div
          v-if="isOpen || isClosing"
          ref="menuRef"
          :class="{ closing: isClosing }"
          :style="menuStyles"
          class="dropdown-menu"
      >
        <div v-if="searchable" class="dropdown-search">
          <input
              ref="searchInput"
              v-model="searchQuery"
              :placeholder="searchPlaceholderText"
              class="dropdown-search-input"
              type="text"
              @click.stop
          />
        </div>

        <div :style="{ maxHeight: `${maxHeight}px` }" class="dropdown-options no-scrollbar">
          <div
              v-for="(option, idx) in displayOptions"
              :key="getOptionKey(option)"
              :class="{
              'is-selected': isSelected(option),
              'is-highlighted':
                highlightedIndex === displayOptions.indexOf(option),
            }"
              class="dropdown-option"
              @click="selectOption(option)"
              @mouseenter="highlightedIndex = displayOptions.indexOf(option)"
          >
            <slot
                :isSelected="isSelected(option)"
                :option="option"
                name="option"
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
                    :class="[
                    'custom-input-btn',
                    { 'is-highlighted': isCustomInputHighlighted },
                  ]"
                    type="button"
                    @click="selectCustomInput"
                >
                   {{ t('useCustomInput').replace('{query}', searchQuery) }}
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
          >
            <button
                :class="[
                'custom-input-btn',
                { 'is-highlighted': isCustomInputHighlighted },
              ]"
                type="button"
                @click="selectCustomInput"
            >
               {{ t('useCustomInput').replace('{query}', searchQuery) }}
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

<script lang="ts" setup>
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch,} from "vue";
import {useI18n} from "@/composables/useI18n";

interface DropdownOption {
  label: string;
  value: string | number;
  icon?: string;

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

.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
}

.dropdown-trigger:hover:not(.is-disabled) {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--myst-gold);
}

.dropdown-trigger.is-open {
  border-color: var(--myst-gold);
  background: rgba(200, 178, 115, 0.05);
  box-shadow: 0 0 15px rgba(200, 178, 115, 0.1);
}

.dropdown-trigger.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.selected-text {
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  color: var(--myst-gold);
}

.placeholder-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.dropdown-arrow {
  color: #666;
  font-size: 12px;
  transition: transform 0.3s ease;
}

.dropdown-trigger.is-open .dropdown-arrow {
  transform: rotate(180deg);
  color: var(--myst-gold);
}

.dropdown-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
}

.dropdown-menu {
  background: #080a14;
  border: 1px solid rgba(200, 178, 115, 0.2);
  border-radius: 4px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  animation: ritualEnter 0.2s ease-out;
}

@keyframes ritualEnter {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-search {
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.dropdown-search-input {
  width: 100%;
  padding: 8px 12px;
  background: #05070a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  outline: none;
}

.dropdown-search-input:focus {
  border-color: var(--myst-gold);
}

.dropdown-options {
  overflow-y: auto;
}

.dropdown-option {
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 2px solid transparent;
}

.dropdown-option:hover,
.dropdown-option.is-highlighted {
  background: rgba(255, 255, 255, 0.03);
  border-left-color: var(--myst-gold);
}

.dropdown-option.is-selected {
  background: rgba(200, 178, 115, 0.05);
  border-left-color: var(--myst-gold);
}

.option-text {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #ccc;
  margin-bottom: 2px;
}

.dropdown-option.is-selected .option-text {
  color: var(--myst-gold);
  font-weight: 700;
}

.option-description {
  display: block;
  font-size: 11px;
  color: #666;
}

.dropdown-no-results {
  padding: 20px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #444;
}

.custom-input-btn {
  width: 100%;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--myst-gold);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  cursor: pointer;
  text-align: left;
}

.custom-input-btn:hover,
.custom-input-btn.is-highlighted {
  background: rgba(200, 178, 115, 0.05);
}

.no-scrollbar::-webkit-scrollbar { display: none; }
</style>

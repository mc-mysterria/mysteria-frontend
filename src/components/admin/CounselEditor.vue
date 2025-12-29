<template>
  <div>
    <h2>UN-Meeting Counsel Editor</h2>
    <select v-model="selectedSuggestionId" @change="loadSuggestion">
      <option value="">Select a suggestion to edit</option>
      <option v-for="suggestion in suggestions" :key="suggestion.id" :value="suggestion.id">
        {{ suggestion.title }} ({{ suggestion.language }})
      </option>
    </select>
    <button @click="createNewSuggestion">New Suggestion</button>
    <div v-if="selectedSuggestion">
      <input v-model="selectedSuggestion.title" placeholder="Title"/>
      <textarea v-model="selectedSuggestion.description" placeholder="Description (Markdown)"></textarea>
      <button @click="saveSuggestion">Save</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {counselAPI} from '@/utils/api/counsel';
import type {CounselSuggestionPreview} from '@/types/counsel';

const suggestions = ref<CounselSuggestionPreview[]>([]);
const selectedSuggestionId = ref<number | string>('');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedSuggestion = ref<any>(null);

onMounted(async () => {
  // Note: We'll need to add admin endpoints to counselAPI
  // For now, this is a placeholder structure
  try {
    const responseEn = await counselAPI.getAll('en');
    const responseUk = await counselAPI.getAll('uk');
    suggestions.value = [...responseEn.data, ...responseUk.data];
  } catch (error) {
    console.error('Failed to load suggestions:', error);
  }
});

const loadSuggestion = () => {
  if (selectedSuggestionId.value) {
    selectedSuggestion.value = suggestions.value.find(s => s.id === selectedSuggestionId.value) || null;
  } else {
    selectedSuggestion.value = null;
  }
};

const createNewSuggestion = () => {
  selectedSuggestionId.value = '';
  selectedSuggestion.value = {
    id: 0,
    title: '',
    slug: '',
    language: 'EN',
    description: '',
    suggesterName: '',
    suggestionDate: new Date().toISOString(),
    status: 'PROPOSED',
    votesFor: 0,
    votesAgainst: 0,
    isPublished: false,
  };
};

const saveSuggestion = async () => {
  if (selectedSuggestion.value) {
    try {
      // Note: We'll need to add create/update endpoints to counselAPI
      alert('Save functionality requires admin API endpoints');
    } catch (error) {
      console.error('Failed to save suggestion:', error);
      alert('Failed to save suggestion');
    }
  }
};
</script>

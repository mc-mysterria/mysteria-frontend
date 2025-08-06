<template>
  <div class="verification-panel" v-if="props.isOwnProfile && !props.displayedUser?.verified">
    <div class="verification-container">
      <h3>{{ t('verifyMinecraftAccount') }}</h3>
      <p class="verification-description" v-html="t('verificationDescription')">
      </p>
      
      <div class="verification-actions">
        <button 
          @click="generateCode" 
          :disabled="isGenerating || !!verificationCode"
          class="generate-btn"
        >
          {{ isGenerating ? t('generating') : t('generateCode') }}
        </button>
        
        <div v-if="verificationCode" class="code-display">
          <p class="code-label">{{ t('yourVerificationCode') }}</p>
          <div class="code-container">
            <code class="verification-code">{{ verificationCode.code }}</code>
            <button @click="copyCode" class="copy-btn">
              {{ copied ? '✓' : '📋' }}
            </button>
          </div>
          <p class="code-expires">{{ t('codeValidUntil') }} {{ formatExpiry(verificationCode.expiresAt) }}</p>
          <p class="command-hint">
            {{ t('enterOnServer') }} <code>/verify {{ verificationCode.code }}</code>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useNotification } from '@/services/useNotification';
import { useI18n } from '@/composables/useI18n';
import type { UserResponse } from '@/types/users';

const props = defineProps<{
  displayedUser: UserResponse | null;
  isOwnProfile: boolean;
}>();

interface VerificationCode {
  code: string;
  expiresAt: string;
}

const { show } = useNotification();
const { t } = useI18n();
const isGenerating = ref(false);
const verificationCode = ref<VerificationCode | null>(null);
const copied = ref(false);

const generateCode = async () => {
  isGenerating.value = true;
  
  try {
    const response = await fetch('/api/user/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate code');
    }
    
    verificationCode.value = await response.json();
    show('Код верифікації згенеровано!', { type: 'success' });
  } catch (error) {
    console.error('Failed to generate verification code:', error);
    show('Помилка при генеруванні коду верифікації', { type: 'error' });
  } finally {
    isGenerating.value = false;
  }
};

const copyCode = async () => {
  if (!verificationCode.value) return;
  
  try {
    await navigator.clipboard.writeText(verificationCode.value.code);
    copied.value = true;
    show('Код скопійовано!', { type: 'info' });
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy code:', error);
    show('Помилка при копіюванні коду', { type: 'error' });
  }
};

const formatExpiry = (expiresAt: string) => {
  return new Date(expiresAt).toLocaleString('uk-UA');
};
</script>

<style scoped>
.verification-panel {
  width: 100%;
  margin: 2rem auto;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.6s ease-out;
}

.verification-container h3 {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #4ade80, #22d3ee);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.verification-description {
  color: #cccccc;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.verification-description code {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: #22d3ee;
}

.verification-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.generate-btn {
  background: linear-gradient(135deg, #4ade80, #22d3ee);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(108, 93, 211, 0.3);
  align-self: flex-start;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(108, 93, 211, 0.4);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.code-display {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.code-label {
  color: #cccccc;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.code-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.verification-code {
  background: rgba(34, 197, 94, 0.1);
  border: 2px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 2px;
  flex: 1;
  text-align: center;
}

.copy-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.code-expires {
  color: #f59e0b;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.command-hint {
  color: #22d3ee;
  font-weight: 600;
}

.command-hint code {
  background: rgba(139, 126, 255, 0.1);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .verification-panel {
    padding: 1.5rem;
  }
  
  .code-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .verification-code {
    font-size: 1.2rem;
    width: 100%;
  }
}
</style>
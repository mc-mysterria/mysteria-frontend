<template>
  <HeaderItem />
  <div class="rules-page">
    <div class="rules-container">
      <!-- Header Section -->
      <div class="rules-header">
        <h1 class="rules-title">{{ t('rulesTitle') }}</h1>
        <p class="rules-subtitle">{{ t('rulesSubtitle') }}</p>
      </div>

      <!-- Main Rule Section -->
<!--      <div class="main-rule-section">-->
<!--        <div class="main-rule-card">-->
<!--          <h2 class="main-rule-title">{{ t('mainRule') }}</h2>-->
<!--          <p class="main-rule-description">{{ t('mainRuleDescription') }}</p>-->
<!--        </div>-->
<!--      </div>-->

      <!-- Rules List -->
      <div class="rules-list">
        <div
          v-for="(rule, ruleKey) in getRules()"
          :key="ruleKey"
          class="rule-card"
        >
          <div class="rule-number">{{ ruleKey }}</div>
          <div class="rule-content">
            <h3 class="rule-title">{{ rule.title }}</h3>
            <p class="rule-description">{{ rule.description }}</p>
          </div>
        </div>
      </div>

      <!-- Minecraft Rules Section -->
      <div class="minecraft-rules-section">
        <div class="minecraft-rules-divider"></div>

        <div class="minecraft-rules-header">
          <h1 class="minecraft-rules-title">{{ t('minecraftRulesTitle') }}</h1>
          <p class="minecraft-rules-subtitle">{{ t('minecraftRulesSubtitle') }}</p>
        </div>

        <!-- Soul Agreement Section -->
<!--        <div class="soul-agreement-section">-->
<!--          <div class="soul-agreement-card">-->
<!--            <h2 class="soul-agreement-title">{{ t('soulAgreement') }}</h2>-->
<!--            <p class="soul-agreement-description">{{ t('soulAgreementDescription') }}</p>-->
<!--          </div>-->
<!--        </div>-->

        <!-- Minecraft Rules List -->
        <div class="rules-list">
          <div
            v-for="(rule, ruleKey) in getMinecraftRules()"
            :key="ruleKey"
            class="rule-card minecraft-rule-card"
          >
            <div class="rule-number minecraft-rule-number">{{ ruleKey }}</div>
            <div class="rule-content">
              <h3 class="rule-title">{{ rule.title }}</h3>
              <p class="rule-description">{{ rule.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Warning -->
      <div class="rules-footer">
        <div class="warning-text">
          <p>{{ t('mainRuleDescription') }}</p>
        </div>
      </div>
    </div>
  </div>
  <FooterItem />
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
import HeaderItem from '@/components/layout/HeaderItem.vue'
import FooterItem from '@/components/layout/FooterItem.vue'

const { t, currentLanguage } = useI18n()


const getRules = () => {
  const lang = currentLanguage.value
  const translations = lang === 'uk' ? {
    '1.1': { title: 'Психологічний хаос', description: 'Токсичність, неадекват, флуд, спам, шантаж — неприйнятні. Місто не терпить божевілля поза Контролем.' },
    '1.2': { title: 'Язик Ворога', description: 'Будь-який прояв російської мови в текстових каналах заборонений. У голосових каналах - на розсуд його власника.' },
    '1.3': { title: 'Заборонені Артефакти', description: 'NSFW / 18+ контент, символіка війни, терористичні чи культові знаки — миттєво знищуються Церквою Сонця.' },
    '1.4': { title: 'Нелюдське слово', description: 'Расизм, сексизм, шовінізм — неприпустимі. Лише росіяни позбавлені захисту моралі.' },
    '1.5': { title: 'Несанкціоноване проникнення', description: 'Будь-яка реклама без дозволу — акт Вторгнення. Це стосується навіть ПП.' },
    '1.6': { title: 'Порушення Завіси', description: 'Розголошення особистої інформації — навіть у приваті — карається вигнанням.' },
    '1.7': { title: 'Словесна магія', description: 'Надмірна нецензурна лексика виснажує твою душу. Кожне слово — це ритуал. Користуйся з розумом.' },
    '1.8': { title: 'Обряд без вівтаря', description: 'Пиши тільки в каналі, призначеному для цього. Оффтоп — це магія без наслідків, але з покаранням.' },
    '1.9': { title: 'Порожні оболонки', description: 'Твінки, другі акаунти — заборонені. Арканічна підміна особистості — злочин.' },
    '1.10': { title: 'Фальшивий Лицар', description: 'Видавання себе за адміністрацію чи обман гравців — вічне мовчання у Тумані.' },
    '1.11': { title: 'Ритуали Підбурювання', description: 'Провокація інших до порушень — занурення в Прірву. Ти відповідаєш не тільки за дії, а й за вплив.' },
    '1.12': { title: 'Сіячі Хаосу', description: 'Створення конфліктів, нагнітання негативу — ритуали зворотної дії. Наслідки приходять раніше, ніж ти напишеш вибач...' }
  } : {
    '1.1': { title: 'Psychological Chaos', description: 'Toxicity, inadequacy, flooding, spam, blackmail are unacceptable. The City does not tolerate madness beyond Control.' },
    '1.2': { title: 'Enemy Language', description: 'Any manifestation of Russian language in text channels is prohibited. In voice channels - at the discretion of its owner.' },
    '1.3': { title: 'Forbidden Artifacts', description: 'NSFW / 18+ content, war symbols, terrorist or cult signs are instantly destroyed by the Church of the Sun.' },
    '1.4': { title: 'Inhuman Word', description: 'Racism, sexism, chauvinism are unacceptable. Only Russians are deprived of moral protection.' },
    '1.5': { title: 'Unauthorized Intrusion', description: 'Any advertising without permission is an act of Invasion. This applies even to DMs.' },
    '1.6': { title: 'Breach of the Veil', description: 'Disclosure of personal information - even in private - is punishable by exile.' },
    '1.7': { title: 'Verbal Magic', description: 'Excessive profanity drains your soul. Every word is a ritual. Use wisely.' },
    '1.8': { title: 'Ritual Without Altar', description: 'Write only in the channel designated for it. Off-topic is magic without consequences, but with punishment.' },
    '1.9': { title: 'Empty Shells', description: 'Twinks, second accounts are prohibited. Arcane identity substitution is a crime.' },
    '1.10': { title: 'False Knight', description: 'Impersonating administration or deceiving players - eternal silence in the Fog.' },
    '1.11': { title: 'Incitement Rituals', description: 'Provoking others to violate - diving into the Abyss. You are responsible not only for actions, but also for influence.' },
    '1.12': { title: 'Sowers of Chaos', description: 'Creating conflicts, escalating negativity - rituals of reverse action. Consequences come before you write sorry...' }
  }

  return translations
}

const getMinecraftRules = () => {
  const lang = currentLanguage.value
  const translations = lang === 'uk' ? {
    '2.1': { title: 'Заборонені Модифікатори', description: 'Барітон, Х-Ray, автокліки, мультиакаунти — магія поза Балансом. Її ціна — вигнання.' },
    '2.2': { title: 'Порушення Простору', description: 'Гріферство, псування ландшафту, крадіжка — вторгнення в чужу реальність. Місто цього не пробачає.' },
    '2.3': { title: 'Наруга над Домівкою', description: 'Заважання на чужій території без згоди — ритуал недовіри. Не вступай на землю без запрошення.' },
    '2.4': { title: 'Злом Тканини Світу', description: 'Лаг-машини, дюпи, експлойти — дослідження Забороненого. І це має ціну. Фатальну.' },
    '2.5': { title: 'Профанація Реліквій', description: 'Руйнування скринь у данжах — осквернення храмів. Релутінг існує — залиш іншим шанс на здобич.' },
    '2.6': { title: 'Виклик Хаосу', description: 'Провокації на порушення правил — шепіт Демона в серце іншого. За це кара подвійна.' },
    '2.7': { title: 'Бій Без Згоди', description: 'Убивство, псування броні, використання магії — лише за взаємної згоди. Інакше — це напад.' },
    '2.8': { title: 'Війна Без Пророцтва', description: 'Командні бої (війни) — лише з дозволу адмінів. Без пророцтва — лише різанина.' },
    '2.9': { title: 'Осквернення Ефіру', description: 'Реклама, NSFW, терористична символіка — забруднення Ефіру. Не буде прощення.' },
    '2.10': { title: 'Несанкціоновані Оселення', description: 'Заборонено будувати ближче 300 блоків від Спавну без дозволу Арканіста. Координація — ключ.' },
    '2.13': { title: 'Угода з Демоном', description: 'Продаж речей за реальні гроші — контракт із Безоднею. А вона завжди бере своє.' }
  } : {
    '2.1': { title: 'Forbidden Modifiers', description: 'Baritone, X-Ray, auto-clickers, multi-accounts - magic beyond Balance. Its price is exile.' },
    '2.2': { title: 'Space Violation', description: 'Griefing, landscape damage, theft - invasion of another\'s reality. The City does not forgive this.' },
    '2.3': { title: 'Desecration of Home', description: 'Interfering on someone else\'s territory without consent - a ritual of distrust. Do not enter the land without invitation.' },
    '2.4': { title: 'Breaking the World Fabric', description: 'Lag machines, dupes, exploits - research of the Forbidden. And it has a price. Fatal.' },
    '2.5': { title: 'Profanation of Relics', description: 'Destroying chests in dungeons - desecration of temples. Relooting exists - leave others a chance for loot.' },
    '2.6': { title: 'Summoning Chaos', description: 'Provoking rule violations - the Demon\'s whisper in another\'s heart. For this, the punishment is double.' },
    '2.7': { title: 'Combat Without Consent', description: 'Killing, armor damage, using magic - only by mutual consent. Otherwise - it\'s an attack.' },
    '2.8': { title: 'War Without Prophecy', description: 'Team battles (wars) - only with admin permission. Without prophecy - only slaughter.' },
    '2.9': { title: 'Desecration of Ether', description: 'Advertising, NSFW, terrorist symbols - pollution of the Ether. There will be no forgiveness.' },
    '2.10': { title: 'Unauthorized Settlements', description: 'Building closer than 300 blocks from Spawn without Arcanist permission is forbidden. Coordination is key.' },
    '2.13': { title: 'Deal with the Demon', description: 'Selling items for real money - a contract with the Abyss. And it always takes its due.' }
  }

  return translations
}
</script>

<style scoped>
.rules-page {
  min-height: calc(100vh - 80px);
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  padding: 3rem 1rem;
  color: #e8e8e8;
}


.rules-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.rules-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
  border-bottom: 2px solid rgba(139, 69, 19, 0.3);
}

.rules-title {
  font-size: 3rem;
  font-weight: 800;
  color: #d4af37;
  text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
  margin-bottom: 1rem;
  letter-spacing: 2px;
}

.rules-subtitle {
  font-size: 1.2rem;
  color: #b8860b;
  font-style: italic;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  text-shadow: 0 0 10px rgba(184, 134, 11, 0.3);
}

.main-rule-section {
  margin-bottom: 3rem;
}

.main-rule-card {
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.2) 0%, rgba(160, 82, 45, 0.1) 100%);
  border: 2px solid rgba(139, 69, 19, 0.4);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.main-rule-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #d4af37, #b8860b, #d4af37);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.main-rule-title {
  font-size: 2rem;
  font-weight: 700;
  color: #d4af37;
  margin-bottom: 1rem;
  text-align: center;
}

.main-rule-description {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #e8e8e8;
  text-align: center;
}

.rules-list {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.rule-card {
  background: linear-gradient(135deg, rgba(22, 33, 62, 0.8) 0%, rgba(26, 26, 46, 0.6) 100%);
  border: 1px solid rgba(139, 69, 19, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
}

.rule-card:hover {
  transform: translateY(-2px);
  border-color: rgba(139, 69, 19, 0.6);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.rule-number {
  background: linear-gradient(135deg, #8b4513, #a0522d);
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 0.75rem;
  border-radius: 8px;
  min-width: 60px;
  height: fit-content;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.rule-content {
  flex: 1;
}

.rule-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #d4af37;
  margin-bottom: 0.75rem;
  text-shadow: 0 0 8px rgba(212, 175, 55, 0.3);
}

.rule-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #c8c8c8;
}

.rules-footer {
  text-align: center;
  padding: 2rem;
  border-top: 2px solid rgba(139, 69, 19, 0.3);
}

.warning-text {
  background: linear-gradient(135deg, rgba(139, 0, 0, 0.2) 0%, rgba(178, 34, 34, 0.1) 100%);
  border: 1px solid rgba(178, 34, 34, 0.4);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.warning-text p {
  color: #ffcccb;
  font-weight: 500;
  margin: 0;
}

/* Minecraft Rules Section */
.minecraft-rules-section {
  margin-top: 4rem;
}

.minecraft-rules-divider {
  height: 3px;
  background: linear-gradient(90deg, transparent, #8b4513, #d4af37, #8b4513, transparent);
  border-radius: 2px;
  margin: 3rem 0;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
}

.minecraft-rules-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
}

.minecraft-rules-title {
  font-size: 3rem;
  font-weight: 800;
  color: #cd853f;
  text-shadow: 0 0 20px rgba(205, 133, 63, 0.5);
  margin-bottom: 1rem;
  letter-spacing: 2px;
}

.minecraft-rules-subtitle {
  font-size: 1.2rem;
  color: #daa520;
  font-style: italic;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  text-shadow: 0 0 10px rgba(218, 165, 32, 0.3);
}

.soul-agreement-section {
  margin-bottom: 3rem;
}

.soul-agreement-card {
  background: linear-gradient(135deg, rgba(205, 133, 63, 0.2) 0%, rgba(218, 165, 32, 0.1) 100%);
  border: 2px solid rgba(205, 133, 63, 0.4);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.soul-agreement-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #cd853f, #daa520, #cd853f);
  animation: shimmer 3s ease-in-out infinite;
}

.soul-agreement-title {
  font-size: 2rem;
  font-weight: 700;
  color: #cd853f;
  margin-bottom: 1rem;
  text-align: center;
}

.soul-agreement-description {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #e8e8e8;
  text-align: center;
}

.minecraft-rule-card {
  border-color: rgba(205, 133, 63, 0.3);
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.6) 0%, rgba(160, 82, 45, 0.4) 100%);
}

.minecraft-rule-card:hover {
  border-color: rgba(205, 133, 63, 0.6);
}

.minecraft-rule-number {
  background: linear-gradient(135deg, #cd853f, #daa520);
  border-color: rgba(205, 133, 63, 0.5);
}

@media (max-width: 768px) {
  .rules-title, .minecraft-rules-title {
    font-size: 2rem;
  }

  .rules-subtitle, .minecraft-rules-subtitle {
    font-size: 1rem;
  }

  .rule-card {
    flex-direction: column;
    gap: 1rem;
  }

  .rule-number {
    align-self: flex-start;
    min-width: 50px;
  }

  .main-rule-card, .soul-agreement-card {
    padding: 1.5rem;
  }

  .main-rule-title, .soul-agreement-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .rules-page {
    padding: 1rem 0.5rem;
  }

  .rules-container {
    padding: 0 0.5rem;
  }

  .rules-title, .minecraft-rules-title {
    font-size: 1.75rem;
  }
}
</style>

<template>
  <div class="page-container">
    <HeaderItem />

    <main class="guide-main">
      <div class="guide-container">
        <SectionTitle
          :eyebrow="t('guideEyebrow')"
          :title="t('gameGuideTitle')"
          :subtitle="t('gameGuideSubtitle')"
        />

        <div class="guide-content">
          <div class="guide-grid">
            <!-- Server Connection -->
            <div class="guide-section">
              <div class="guide-card server-card">
                <div class="card-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2L2 7L12 12L22 7L12 2Z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M2 17L12 22L22 17"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M2 12L12 17L22 12"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <h2 class="card-title">{{ t("serverConnectionTitle") }}</h2>
                <p class="card-description">{{ t("serverConnectionDescription") }}</p>

                <div class="server-details">
                  <div class="server-info-grid">
                    <div class="info-item">
                      <span class="info-label">{{ t("serverVersion") }}:</span>
                      <span class="info-value">{{ t("minecraftVersion") }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">{{ t("serverEdition") }}:</span>
                      <span class="info-value">{{ t("serverEdition") }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">{{ t("modsRequired") }}:</span>
                      <span class="info-value">{{ t("noModsRequired") }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">{{ t("serverType") }}:</span>
                      <span class="info-value">{{ t("rpgServer") }}</span>
                    </div>
                  </div>

                  <div class="server-ip-container">
                    <div class="server-ip">
                      <span class="ip-label">{{ t("serverIP") }}:</span>
                      <code class="ip-address" ref="ipAddress">{{ serverIP }}</code>
                    </div>
                    <button
                      @click="copyToClipboard"
                      class="copy-button"
                      :title="t('copyToClipboard')"
                    >
                      <svg
                        v-if="!isCopied"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                          stroke="currentColor"
                          stroke-width="2"
                          fill="none"
                        />
                        <path
                          d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012-2v1"
                          stroke="currentColor"
                          stroke-width="2"
                          fill="none"
                        />
                      </svg>
                      <svg
                        v-else
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <polyline
                          points="20,6 9,17 4,12"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      <span>{{ isCopied ? t("copySuccess") : t("copyIP") }}</span>
                    </button>
                  </div>
                </div>

                <div class="image-container server-image">
                  <img
                    src="@/assets/images/optimized/Server.webp"
                    :alt="t('serverScreenshotPlaceholder')"
                  />
                </div>
              </div>
            </div>

            <!-- Lore & Anime -->
            <div class="guide-section">
              <div class="guide-card lore-card">
                <div class="card-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <h2 class="card-title">{{ t("loreAnimeTitle") }}</h2>
                <p class="card-description">{{ t("loreAnimeDescription") }}</p>

                <div class="recommendations">
                  <div class="recommendation-item">
                    <h3>{{ t("webNovelTitle") }}</h3>
                    <p>{{ t("webNovelDescription") }}</p>
                    <a
                      href="https://www.webnovel.com/book/lord-of-mysteries_11022733006234505"
                      class="external-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ t("readWebNovel") }}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <polyline
                          points="15,3 21,3 21,9"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <line
                          x1="10"
                          y1="14"
                          x2="21"
                          y2="3"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </a>
                  </div>

                  <div class="recommendation-item">
                    <h3>{{ t("animeTitle") }}</h3>
                    <p>{{ t("animeDescription") }}</p>
                    <a
                      href="https://www.crunchyroll.com/series/GEXH3W2EZ/lord-of-mysteries"
                      class="external-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ t("watchAnime") }}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <polyline
                          points="15,3 21,3 21,9"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <line
                          x1="10"
                          y1="14"
                          x2="21"
                          y2="3"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                </div>

                <div class="image-container lore-image">
                  <img
                    src="@/assets/images/optimized/Anime.webp"
                    :alt="t('loreImagePlaceholder')"
                  />
                </div>
              </div>
            </div>

            <!-- Harmoniya Launcher -->
            <div class="guide-section">
              <div class="guide-card launcher-card">
                <div class="card-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <polyline
                      points="3.27,6.96 12,12.01 20.73,6.96"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <line
                      x1="12"
                      y1="22.08"
                      x2="12"
                      y2="12"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <h2 class="card-title">{{ t("launcherTitle") }}</h2>
                <p class="card-description">{{ t("launcherDescription") }}</p>

                <div class="launcher-features">
                  <div class="feature-item">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polyline
                        points="20,6 9,17 4,12"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <span>{{ t("launcherFeature1") }}</span>
                  </div>
                  <div class="feature-item">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polyline
                        points="20,6 9,17 4,12"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <span>{{ t("launcherFeature2") }}</span>
                  </div>
                  <div class="feature-item">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polyline
                        points="20,6 9,17 4,12"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <span>{{ t("launcherFeature3") }}</span>
                  </div>
                  <div class="feature-item">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polyline
                        points="20,6 9,17 4,12"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <span>{{ t("launcherFeature4") }}</span>
                  </div>
                  <div class="feature-item">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polyline
                        points="20,6 9,17 4,12"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <span>{{ t("launcherFeature5") }}</span>
                  </div>
                </div>

                <button
                  class="download-button"
                  @click="openLauncher"
                  :title="t('downloadLauncher')"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <polyline
                      points="7,10 12,15 17,10"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <line
                      x1="12"
                      y1="15"
                      x2="12"
                      y2="3"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  {{ t("downloadLauncher") }}
                </button>

                <div class="image-container launcher-image">
                  <img
                    src="@/assets/images/optimized/Harmoniya.webp"
                    :alt="t('launcherScreenshotPlaceholder')"
                  />
                </div>
              </div>
            </div>

            <!-- Rules -->
            <div class="guide-section">
              <div class="guide-card rules-card">
                <div class="card-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <polyline
                      points="14,2 14,8 20,8"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <line
                      x1="16"
                      y1="13"
                      x2="8"
                      y2="13"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <line
                      x1="16"
                      y1="17"
                      x2="8"
                      y2="17"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <polyline
                      points="10,9 9,9 8,9"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <h2 class="card-title">{{ t("rulesTitle") }}</h2>
                <p class="card-description">{{ t("rulesDescription") }}</p>

                <div class="main-rules-preview">
                  <h3 class="preview-title">{{ t("mainRuleConcepts") }}</h3>
                  <div class="rule-concepts">
                    <div
                      class="rule-concept"
                      v-for="(concept, index) in tArray('ruleConcepts')"
                      :key="index"
                    >
                      <div class="concept-icon">⚡</div>
                      <span>{{ concept }}</span>
                    </div>
                  </div>
                </div>

                <router-link to="/rules" class="rules-link">
                  {{ t("readRules") }}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line
                      x1="5"
                      y1="12"
                      x2="19"
                      y2="12"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <polyline
                      points="12,5 19,12 12,19"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </router-link>
              </div>
            </div>

            <!-- Discord Guild -->
            <div class="guide-section">
              <div class="guide-card discord-card">
                <div class="card-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.188.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <h2 class="card-title">{{ t("discordTitle") }}</h2>
                <p class="card-description">{{ t("discordDescription") }}</p>

                <div class="discord-benefits">
                  <div
                    class="benefit-item"
                    v-for="(benefit, index) in tArray('discordBenefits')"
                    :key="index"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polyline
                        points="20,6 9,17 4,12"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <span>{{ benefit }}</span>
                  </div>
                </div>

                <a
                  href="#"
                  class="discord-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.188.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
                      fill="currentColor"
                    />
                  </svg>
                  {{ t("joinDiscord") }}
                </a>
              </div>
            </div>

            <!-- Profile & Verification -->
            <div class="guide-section">
              <div class="guide-card profile-card">
                <div class="card-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <h2 class="card-title">{{ t("profileTitle") }}</h2>
                <p class="card-description">{{ t("profileDescription") }}</p>

                <div class="verification-steps">
                  <div class="step-item">
                    <div class="step-number">1</div>
                    <span>{{ t("verificationStep1") }}</span>
                  </div>
                  <div class="step-item">
                    <div class="step-number">2</div>
                    <span>{{ t("verificationStep2") }}</span>
                  </div>
                  <div class="step-item">
                    <div class="step-number">3</div>
                    <span>{{ t("verificationStep3") }}</span>
                  </div>
                </div>

                <router-link to="/profile" class="profile-link">
                  {{ t("goToProfile") }}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line
                      x1="5"
                      y1="12"
                      x2="19"
                      y2="12"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <polyline
                      points="12,5 19,12 12,19"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Quick Tips -->
          <div class="quick-tips">
            <h2 class="tips-title">{{ t('quickTipsTitle') }}</h2>
            <div class="tips-grid">
              <div
                class="tip-item"
                v-for="(tip, index) in tArray('quickTips')"
                :key="index"
              >
                <div class="tip-icon">💡</div>
                <p>{{ tip }}</p>
              </div>
            </div>
          </div>

          <!-- Bottom CTA -->
          <div class="bottom-cta">
            <h2>{{ t("readyToStart") }}</h2>
            <p>{{ t("readyToStartDescription") }}</p>
            <div class="cta-buttons">
              <router-link to="/profile" class="cta-button primary">
                {{ t("setupProfile") }}
              </router-link>
              <router-link to="/rules" class="cta-button secondary">
                {{ t("reviewRules") }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </main>

    <FooterItem />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "@/composables/useI18n";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
import SectionTitle from "@/components/ui/SectionTitle.vue";

const { t, tArray } = useI18n();

const serverIP = computed(() => t("serverAddress"));

const ipAddress = ref<HTMLElement | null>(null);
const isCopied = ref(false);

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(serverIP.value);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 1500);
  } catch (err) {
    console.error("Failed to copy: ", err);
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = serverIP.value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    // Show success feedback for fallback too
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 1500);
  }
};

const openLauncher = () => {
  window.open("https://harmoniya.net/", "_blank");
};
</script>

<style scoped>


/* Page Container */
.page-container {
  min-height: 100vh;
  position: relative;
}

.guide-main {
  position: relative;
  background: var(--myst-bg);
  padding: 80px 0;
}

.guide-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.guide-content {
  margin-top: 32px;
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
  align-items: stretch;
}

.guide-section {
  display: contents;
}

.guide-card {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, white 10%, transparent);
  border-radius: 8px;
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.guide-card:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 30%, transparent);
}

.card-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: var(--myst-gold);
}

.card-icon svg {
  width: 100%;
  height: 100%;
}

.card-title {
  font-size: 18px;
  font-family: "Inter", sans-serif;
  font-weight: 600;
  color: var(--myst-ink-strong);
  margin-bottom: 12px;
}

.card-description {
  color: var(--myst-ink-muted);
  line-height: 1.6;
  margin-bottom: 24px;
  min-height: 3em;
}

/* Server Details Section */
.server-details {
  flex-grow: 1;
  margin: 24px 0;
}

.server-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: color-mix(in srgb, var(--myst-bg) 40%, transparent);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, white 5%, transparent);
}

.info-label {
  color: var(--myst-ink-muted);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  color: var(--myst-gold);
  font-weight: 600;
  font-size: 14px;
}

.server-ip-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.server-ip {
  display: flex;
  align-items: center;
  gap: 12px;
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

.ip-label {
  color: var(--myst-ink);
  font-weight: 500;
}

.ip-address {
  font-family: "Minecraft", monospace;
  font-size: 16px;
  color: var(--myst-gold);
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  padding: 8px 12px;
  border-radius: 6px;
  flex: 1;
}

.copy-button {
  background: var(--myst-gold);
  border: none;
  color: var(--myst-bg);
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  width: 100%;
}

.copy-button:hover {
  background: color-mix(in srgb, var(--myst-gold) 80%, transparent);
}

.copy-button svg {
  width: 18px;
  height: 18px;
}

/* Recommendations */
.recommendations {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
  flex-grow: 1;
}

.recommendation-item {
  background: color-mix(in srgb, var(--myst-bg) 40%, transparent);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, white 5%, transparent);
}

.recommendation-item h3 {
  color: var(--myst-ink-strong);
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
}

.recommendation-item p {
  color: var(--myst-ink-muted);
  margin-bottom: 12px;
  font-size: 14px;
}

.external-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--myst-gold);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.external-link:hover {
  color: color-mix(in srgb, var(--myst-gold) 80%, transparent);
  text-decoration: underline;
}

.external-link svg {
  width: 16px;
  height: 16px;
}

/* Launcher Features */
.launcher-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  flex-grow: 1;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--myst-ink);
}

.feature-item svg {
  width: 20px;
  height: 20px;
  color: var(--myst-gold);
  flex-shrink: 0;
}

.download-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--myst-gold);
  border: none;
  color: var(--myst-bg);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
  margin-top: auto;
}

.download-button:hover {
  background: color-mix(in srgb, var(--myst-gold) 80%, transparent);
}

.download-button svg {
  width: 20px;
  height: 20px;
}

/* Discord Benefits */
.discord-benefits {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  flex-grow: 1;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--myst-ink);
}

.benefit-item svg {
  width: 20px;
  height: 20px;
  color: var(--myst-gold);
  flex-shrink: 0;
}

.discord-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #5865f2;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  margin-bottom: 16px;
  margin-top: auto;
}

.discord-link:hover {
  background: #4752c4;
}

.discord-link svg {
  width: 20px;
  height: 20px;
}

/* Main Rules Preview */
.main-rules-preview {
  flex-grow: 1;
  margin-bottom: 16px;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--myst-gold);
  margin-bottom: 16px;
  text-align: center;
}

.rule-concepts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-concept {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--myst-ink);
  font-size: 14px;
  background: color-mix(in srgb, var(--myst-bg) 40%, transparent);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, white 5%, transparent);
  transition: all 0.2s ease;
}

.rule-concept:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

.concept-icon {
  font-size: 18px;
  flex-shrink: 0;
  color: var(--myst-gold);
}

/* Links */
.rules-link,
.profile-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--myst-gold);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 8px 0;
  margin-top: auto;
}

.rules-link:hover,
.profile-link:hover {
  color: color-mix(in srgb, var(--myst-gold) 80%, transparent);
  text-decoration: underline;
}

.rules-link svg,
.profile-link svg {
  width: 18px;
  height: 18px;
}

/* Verification Steps */
.verification-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  flex-grow: 1;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--myst-ink);
}

.step-number {
  background: var(--myst-gold);
  color: var(--myst-bg);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

/* Image Containers */
.image-container {
  height: 180px;
  background: color-mix(in srgb, var(--myst-bg) 40%, transparent);
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, white 5%, transparent);
  overflow: hidden;
  margin-top: auto;
  transition: all 0.2s ease;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  opacity: 0.9;
}

.image-container:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

.image-container:hover img {
  opacity: 1;
}

/* Quick Tips */
.quick-tips {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 20%, transparent);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 32px;
}

.tips-title {
  font-family: "Inter", serif;
  font-size: 20px;
  color: var(--myst-gold);
  margin-bottom: 20px;
  text-align: center;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: color-mix(in srgb, var(--myst-bg) 40%, transparent);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, white 5%, transparent);
}

.tip-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.tip-item p {
  color: var(--myst-ink);
  margin: 0;
  line-height: 1.5;
}

/* Bottom CTA */
.bottom-cta {
  text-align: center;
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border-radius: 8px;
  padding: 32px;
  border: 1px solid color-mix(in srgb, var(--myst-gold) 20%, transparent);
  position: relative;
}

.bottom-cta h2 {
  font-size: 32px;
  font-family: "Inter", sans-serif;
  color: var(--myst-ink-strong);
  margin-bottom: 16px;
}

.bottom-cta p {
  color: var(--myst-ink-muted);
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 150px;
}

.cta-button.primary {
  background: var(--myst-gold);
  color: var(--myst-bg);
}

.cta-button.primary:hover {
  background: color-mix(in srgb, var(--myst-gold) 80%, transparent);
}

.cta-button.secondary {
  background: transparent;
  color: var(--myst-gold);
  border: 2px solid color-mix(in srgb, var(--myst-gold) 30%, transparent);
}

.cta-button.secondary:hover {
  background: color-mix(in srgb, var(--myst-gold) 10%, transparent);
  border-color: var(--myst-gold);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .guide-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 768px) {
  .guide-main {
    padding: 40px 0;
  }

  .guide-container {
    padding: 0 16px;
  }

  .guide-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .server-info-grid {
    grid-template-columns: 1fr;
  }

  .server-ip {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .recommendations {
    gap: 12px;
  }

  .tips-grid {
    grid-template-columns: 1fr;
  }

  .bottom-cta {
    padding: 24px;
  }

  .bottom-cta h2 {
    font-size: 24px;
  }
}

@media (max-width: 640px) {
  .guide-card {
    padding: 16px;
  }

  .quick-tips {
    padding: 16px;
  }

  .cta-buttons {
    gap: 12px;
  }
}
</style>

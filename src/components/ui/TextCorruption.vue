<template>
  <div class="text-corruption-container">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

const corruptionLevel = ref(0);
const isCorrupting = ref(false);
const originalText = ref("");
const corruptedText = ref("");
const currentDelay = ref(300);
const minDelay = 70;
const delayDecrease = 1;
const corruptionStep = 0.1;
const isTHEROERCorrupted = ref(false);
const isFullyCorrupted = ref(false);
const fadeLevel = ref(0);
const fadeStep = 0.5;

const exceptions = [".theroer-card h2", ".username"];

const isException = (element: Element): boolean => {
  return exceptions.some((selector) => element.matches(selector));
};

const hasTHEROEROutsideExceptions = (): boolean => {
  const container = document.querySelector(".text-corruption-container");
  if (!container) return false;

  const checkNode = (node: Node): boolean => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (text.includes("THEROER")) {
        const parentElement = node.parentElement;
        if (parentElement && isException(parentElement)) {
          return false;
        }
        return true;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (
        node instanceof HTMLTextAreaElement ||
        node instanceof HTMLInputElement
      ) {
        const text = node.value;
        if (text.includes("THEROER")) {
          return true;
        }
      }
      for (const child of Array.from(node.childNodes)) {
        if (checkNode(child)) {
          return true;
        }
      }
    }
    return false;
  };

  return checkNode(container);
};

const japaneseChars =
  "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";
const chineseChars =
  "的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严龙飞";

const corruptText = (text: string, level: number) => {
  if (level === 0) return text;

  const chars = text.split("");
  const corruptionCount = Math.floor(chars.length * (level / 100));

  for (let i = 0; i < corruptionCount; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    if (Math.random() < 0.5) {
      chars[randomIndex] =
        japaneseChars[Math.floor(Math.random() * japaneseChars.length)];
    } else {
      chars[randomIndex] =
        chineseChars[Math.floor(Math.random() * chineseChars.length)];
    }
  }

  return chars.join("");
};

const corruptSingleCharacter = (text: string, targetWord: string) => {
  const chars = text.split("");
  const targetIndices = [];

  for (let i = 0; i < chars.length - targetWord.length + 1; i++) {
    if (text.substring(i, i + targetWord.length) === targetWord) {
      for (let j = 0; j < targetWord.length; j++) {
        targetIndices.push(i + j);
      }
    }
  }

  if (targetIndices.length === 0) return text;

  const randomIndex =
    targetIndices[Math.floor(Math.random() * targetIndices.length)];

  if (Math.random() < 0.5) {
    chars[randomIndex] =
      japaneseChars[Math.floor(Math.random() * japaneseChars.length)];
  } else {
    chars[randomIndex] =
      chineseChars[Math.floor(Math.random() * chineseChars.length)];
  }

  return chars.join("");
};

watch(corruptionLevel, (newLevel) => {
  if (newLevel > 0) {
    const startColor = {
      r: 23,
      g: 26,
      b: 33,
    };

    const opacity = Math.min(newLevel / 100, 1);
    const smoothOpacity = Math.pow(opacity, 0.5);

    const newR = Math.round(startColor.r * (1 - smoothOpacity));
    const newG = Math.round(startColor.g * (1 - smoothOpacity));
    const newB = Math.round(startColor.b * (1 - smoothOpacity));

    document.body.style.backgroundColor = `rgb(${newR}, ${newG}, ${newB})`;
    document.body.style.transition =
      "background-color 1.5s cubic-bezier(0.4, 0, 0.2, 1)";
  }
});

watch(fadeLevel, (newLevel) => {
  if (newLevel > 0) {
    const container = document.querySelector(".text-corruption-container");
    if (!container) return;

    const elements = container.querySelectorAll("*");
    elements.forEach((element) => {
      if (element instanceof HTMLElement) {
        element.style.color = `rgba(0, 0, 0, ${1 - newLevel / 100})`;
        element.style.transition = "color 0.5s ease";
      }
    });
  }
});

const startCorruption = () => {
  if (isCorrupting.value) return;

  if (hasTHEROEROutsideExceptions()) {
    isCorrupting.value = true;
    const container = document.querySelector(".text-corruption-container");
    if (!container) return;

    originalText.value = container.textContent || "";
    corruptedText.value = originalText.value;
    currentDelay.value = 300;
    isTHEROERCorrupted.value = false;
    isFullyCorrupted.value = false;
    fadeLevel.value = 0;

    const corruptStep = () => {
      let hasTHEROER = false;
      let theroerCount = 0;
      let hasNormalChars = false;

      const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || "";
          if (text.includes("THEROER")) {
            hasTHEROER = true;
            const newText = corruptSingleCharacter(text, "THEROER");
            if (newText !== text) {
              node.textContent = newText;
              theroerCount++;
            }
          } else if (isTHEROERCorrupted.value && corruptionLevel.value > 0) {
            const newText = corruptText(text, corruptionLevel.value);
            if (newText !== text) {
              node.textContent = newText;
            }
          }

          if (/[a-zA-Z0-9]/.test(text)) {
            hasNormalChars = true;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          if (
            node instanceof HTMLTextAreaElement ||
            node instanceof HTMLInputElement
          ) {
            const text = node.value;
            if (text.includes("THEROER")) {
              hasTHEROER = true;
              const newText = corruptSingleCharacter(text, "THEROER");
              if (newText !== text) {
                node.value = newText;
                theroerCount++;
              }
            } else if (isTHEROERCorrupted.value && corruptionLevel.value > 0) {
              const newText = corruptText(text, corruptionLevel.value);
              if (newText !== text) {
                node.value = newText;
              }
            }

            if (/[a-zA-Z0-9]/.test(text)) {
              hasNormalChars = true;
            }
          }

          for (const child of Array.from(node.childNodes)) {
            processNode(child);
          }
        }
      };

      processNode(container);

      if (container) {
        corruptedText.value = container.textContent || "";
      }

      if (hasTHEROER) {
        if (theroerCount >= 7) {
          isTHEROERCorrupted.value = true;
          corruptionLevel.value = 0;
        }
        setTimeout(corruptStep, currentDelay.value);
      } else {
        if (!isTHEROERCorrupted.value) {
          isTHEROERCorrupted.value = true;
          corruptionLevel.value = 0;
        }

        if (hasNormalChars) {
          corruptionLevel.value += corruptionStep;
          if (currentDelay.value > minDelay) {
            currentDelay.value -= delayDecrease;
          }
          setTimeout(corruptStep, currentDelay.value);
        } else {
          isFullyCorrupted.value = true;
          fadeLevel.value += fadeStep;
          if (fadeLevel.value < 100) {
            setTimeout(corruptStep, 50);
          }
        }
      }
    };

    corruptStep();
  }
};

onMounted(() => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" || mutation.type === "characterData") {
        const container = document.querySelector(".text-corruption-container");
        if (container && hasTHEROEROutsideExceptions()) {
          startCorruption();
        }
      }
    });
  });

  const container = document.querySelector(".text-corruption-container");
  if (container) {
    observer.observe(container, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    const handleInput = (event: Event) => {
      const element = event.target as HTMLInputElement | HTMLTextAreaElement;
      if (element.value.includes("THEROER")) {
        startCorruption();
      }
    };

    const checkInputs = () => {
      const inputs = container.querySelectorAll("input, textarea");
      inputs.forEach((input) => {
        if (
          input instanceof HTMLInputElement ||
          input instanceof HTMLTextAreaElement
        ) {
          if (input.value.includes("THEROER")) {
            startCorruption();
          }
        }
      });
    };

    const inputs = container.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      if (
        input instanceof HTMLInputElement ||
        input instanceof HTMLTextAreaElement
      ) {
        input.addEventListener("input", handleInput);
        input.addEventListener("change", handleInput);
        input.addEventListener("keyup", handleInput);
        input.addEventListener("focus", handleInput);
        input.addEventListener("blur", handleInput);
      }
    });

    const inputObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (
              node instanceof HTMLInputElement ||
              node instanceof HTMLTextAreaElement
            ) {
              node.addEventListener("input", handleInput);
              node.addEventListener("change", handleInput);
              node.addEventListener("keyup", handleInput);
              node.addEventListener("focus", handleInput);
              node.addEventListener("blur", handleInput);
            }
          });
        }
      });
    });

    inputObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    const existingInputs = container.querySelectorAll("input, textarea");
    existingInputs.forEach((input) => {
      if (
        input instanceof HTMLInputElement ||
        input instanceof HTMLTextAreaElement
      ) {
        if (input.value.includes("THEROER")) {
          startCorruption();
        }
      }
    });

    document.addEventListener("click", checkInputs);
  }
});
</script>

<style scoped>
.text-corruption-container {
  display: inline;
}
</style>

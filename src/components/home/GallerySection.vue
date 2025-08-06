<template>
  <section class="gallery-section">
    <h2 class="community-title">Шедеври спільноти:</h2>
    <div class="gridContainer">
      <img
        class="grid1"
        src="/community/gallery-item1.webp"
        alt="Шедевр спільноти 1"
        loading="lazy"
      />
      <img
        class="grid2"
        src="/community/gallery-item2.webp"
        alt="Шедевр спільноти 2"
        loading="lazy"
      />
      <img
        class="grid3"
        src="/community/gallery-item3.webp"
        alt="Шедевр спільноти 3"
        loading="lazy"
      />
      <img
        class="grid4"
        src="/community/gallery-item4.webp"
        alt="Шедевр спільноти 4"
        loading="lazy"
      />
      <img
        class="grid5"
        src="/community/gallery-item5.webp"
        alt="Шедевр спільноти 5"
        loading="lazy"
      />
      <img
        class="grid6"
        src="/community/gallery-item6.webp"
        alt="Шедевр спільноти 6"
        loading="lazy"
      />
      <img
        class="grid7"
        src="/community/gallery-item7.webp"
        alt="Шедевр спільноти 7"
        loading="lazy"
      />
    </div>
  </section>
</template>

<script lang="ts">
export default {
  name: "GallerySection",
};
</script>

<style scoped>
.gallery-section {
  width: 1320px;
  margin: 0 auto;
  padding: 0 1rem;
  box-sizing: border-box;
}

.community-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin-bottom: clamp(25px, 4vw, 50px);
  text-align: center;
  font-family: "MontserratBold", system-ui, sans-serif;
  background: linear-gradient(
    160deg,
    rgba(16, 185, 129, 1) 0%,
    rgba(34, 197, 94, 1) 50%,
    rgba(5, 150, 105, 1) 100%
  );
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  word-wrap: break-word;
  hyphens: auto;
}

.gridContainer {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(2, 300px);
  gap: clamp(15px, 2vw, 25px);
  margin-bottom: clamp(80px, 8vw, 150px);
  width: 100%;
  max-width: 100%;
}

.gridContainer img {
  object-fit: cover;
  width: 100%;
  height: 100%;
  border-radius: 7px;
  filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.25));
  transition: transform 0.3s ease;
}

.gridContainer img:hover {
  transform: scale(1.05);
}

.grid1 {
  grid-column: 1;
  grid-row: 1;
}

.grid2 {
  grid-column: 2 / 4;
  grid-row: 1;
}

.grid3 {
  grid-column: 4 / 6;
  grid-row: 1;
}

.grid4 {
  grid-column: 6 / 8;
  grid-row: 1 / 3;
}

.grid5 {
  grid-column: 1 / 3;
  grid-row: 2;
}

.grid6 {
  grid-column: 3 / 5;
  grid-row: 2;
}

.grid7 {
  grid-column: 5;
  grid-row: 2;
}

@media (max-width: 1440px) {
  .gallery-section {
    width: 95%;
  }
}

@media (max-width: 1024px) {
  .gridContainer {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: auto;
    gap: clamp(10px, 2vw, 20px);
  }

  .grid1 {
    grid-column: 1 / 3;
    grid-row: 1;
  }

  .grid2 {
    grid-column: 3 / 5;
    grid-row: 1;
  }

  .grid3 {
    grid-column: 1;
    grid-row: 2;
  }

  .grid4 {
    grid-column: 2 / 4;
    grid-row: 2;
  }

  .grid5 {
    grid-column: 4;
    grid-row: 2;
  }

  .grid6 {
    grid-column: 1 / 3;
    grid-row: 3;
  }

  .grid7 {
    grid-column: 3 / 5;
    grid-row: 3;
  }
}

@media (max-width: 768px) {
  .gallery-section {
    width: 95%;
    padding: 0 1rem;
  }

  .gridContainer {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 200px);
    gap: clamp(8px, 2vw, 15px);
  }

  .grid1 {
    grid-column: 1;
    grid-row: 1;
  }

  .grid2 {
    grid-column: 2;
    grid-row: 1;
  }

  .grid3 {
    grid-column: 1;
    grid-row: 2;
  }

  .grid4 {
    grid-column: 2;
    grid-row: 2 / 4;
  }

  .grid5 {
    grid-column: 1;
    grid-row: 3;
  }

  .grid6 {
    grid-column: 1;
    grid-row: 4;
  }

  .grid7 {
    grid-column: 2;
    grid-row: 4;
  }
}

@media (max-width: 480px) {
  .gallery-section {
    width: 100%;
    padding: 0 0.75rem;
  }

  .gridContainer {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(7, 180px);
    gap: clamp(6px, 1.5vw, 12px);
  }

  .grid1,
  .grid2,
  .grid3,
  .grid4,
  .grid5,
  .grid6,
  .grid7 {
    grid-column: 1;
  }

  .grid1 {
    grid-row: 1;
  }
  .grid2 {
    grid-row: 2;
  }
  .grid3 {
    grid-row: 3;
  }
  .grid4 {
    grid-row: 4;
  }
  .grid5 {
    grid-row: 5;
  }
  .grid6 {
    grid-row: 6;
  }
  .grid7 {
    grid-row: 7;
  }

  .gridContainer img:hover {
    transform: scale(1.02);
  }
}
</style>

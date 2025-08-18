<template>
  <div class="description">
    <h2>Про наш сервер</h2>
    <p>
      Mysterria - це унікальний проект, який поєднує в собі елементи виживання
      та творчості. Наш сервер пропонує гравцям можливість створювати власні
      світи, будувати спільноти та досліджувати безмежні можливості гри.
    </p>
    <div class="features">
      <div class="feature">
        <img src="@/assets/images/joystick.svg" alt="Унікальний геймплей" />
        <h3>Унікальний геймплей</h3>
        <p>Спеціально розроблені модифікації та плагіни</p>
      </div>
      <div class="feature">
        <img src="@/assets/images/Users.svg" alt="Активна спільнота" />
        <h3>Активна спільнота</h3>
        <p>Дружня атмосфера та постійна підтримка</p>
      </div>
      <div class="feature">
        <img
          src="@/assets/images/NewspaperClipping.svg"
          alt="Регулярні оновлення"
        />
        <h3>Регулярні оновлення</h3>
        <p>Постійне вдосконалення та новий контент</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "HomeDescription",
};
</script>

<style scoped>
.description {
  padding: 80px 0;
  text-align: center;
}

.description h2 {
  font-family: "Inter", system-ui, sans-serif;
  font-size: 36px;
  margin-bottom: 24px;
}

.description p {
  font-size: 18px;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto 48px;
}

.features {
  display: flex;
  justify-content: center;
  gap: 48px;
  flex-wrap: wrap;
}

.feature {
  flex: 1;
  min-width: 250px;
  max-width: 300px;
  padding: 24px;
  background: #171a21;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.feature:hover {
  transform: translateY(-5px);
}

.feature img {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.feature h3 {
  font-family: "Inter", system-ui, sans-serif;
  font-size: 20px;
  margin-bottom: 12px;
}

.feature p {
  font-size: 16px;
  margin: 0;
}

@media (max-width: 768px) {
  .description {
    padding: 40px 0;
  }

  .description h2 {
    font-size: 28px;
  }

  .description p {
    font-size: 16px;
    padding: 0 16px;
  }

  .features {
    gap: 24px;
  }

  .feature {
    min-width: 200px;
  }
}
</style>

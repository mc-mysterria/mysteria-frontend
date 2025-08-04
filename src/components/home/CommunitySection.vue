<template>
  <div class="community">
    <div class="gridLeft">
      <div class="communityContainer">
        <h2>Підтримка</h2>
        <div class="textContainer">
          <p>
            Ми ретельно слідкуємо за
            <span class="violetText">роботою сервера</span>,<br />
            тому баги швидко виправляються.
          </p>
        </div>
        <p class="cardTextMobile">
          Ми ретельно слідкуємо за
          <span class="violetText">роботою сервера</span>, тому баги швидко
          виправляються.
        </p>
        <div class="textContainer">
          <p>
            Присутня система Тікетів, у будь-який момент ви<br />зможете
            повідомити про порушення правил чи<br />несправність — вам швидко
            прийдуть на допомогу.
          </p>
        </div>
        <p class="cardTextMobile">
          Присутня система Тікетів, у будь-який момент ви зможете повідомити про
          порушення правил чи несправність — вам швидко прийдуть на допомогу.
        </p>
        <p>
          Ваша гра на сервері буде
          <span class="orangeText">комфортною</span> завжди!
        </p>
      </div>
      <div class="communityContainer">
        <h2>Унікальність</h2>
        <div class="textContainer">
          <p>
            На сервері присутня механіка
            <span class="violetText">кастомної генерації</span><br />
            <span>світу</span>, система поліції, власна система економіки,<br />
            нові предмети, <span class="violetText">магія</span> тa ще багато<br />
            візуальних і ігрових доповнень.
          </p>
        </div>
        <p class="cardTextMobile">
          На сервері присутня механіка
          <span class="violetText">кастомної генерації</span>
          <span>світу</span>, система поліції, власна система економіки, нові
          предмети, <span class="violetText">магія</span> тa ще багато
          візуальних і ігрових доповнень.
        </p>
        <p class="lastMargin">
          Гра на сервері буде <span class="orangeText">цікава всім</span>!
        </p>
      </div>
    </div>
    <div class="communityContainer">
      <h2>Спільнота</h2>
      <div class="textContainer">
        <p>
          Гравці серверу
          <span class="violetText">допомагають один одному</span>,<br />
          об'єднуються в міста, щодня спілкуються<br />
          в нашому Discord сервері та отримують<br />
          неймовірний досвід і задоволення від гри.
        </p>
      </div>
      <p class="cardTextMobile">
        Гравці серверу <span class="violetText">допомагають один одному</span>,
        об'єднуються в міста, щодня спілкуються в нашому Discord сервері та
        отримують неймовірний досвід і задоволення від гри.
      </p>
      <p class="marginImg">
        <span class="orangeText">Адміністрація завжди допоможе</span>, дасть
        відповіді на питання та захистить.
      </p>
      <img
        src="@/assets/images/ImageCommunity.webp"
        alt="Зображення спільноти"
        loading="lazy"
      />
    </div>
  </div>
</template>

<style scoped>
.community {
  width: 1320px;
  margin: auto auto 100px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-size: 18px;
}

.gridLeft {
  display: grid;
  grid-template-rows: auto auto;
}

.community h2 {
  font-size: 48px;
}

.communityContainer {
  margin: 10px;
  background-color: #23262c;
  border-radius: 10px;
  padding: 53px 0 53px 53px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}

.communityContainer .textContainer {
  margin: 32px 0;
}

.lastMargin {
  margin-bottom: 60px;
}

.marginImg {
  margin-bottom: 84px;
}

.violetText {
  color: #6c5dd3;
}

.orangeText {
  color: #ee7828;
}

.cardTextMobile {
  display: none;
}

@media (max-width: 1440px) {
  .community {
    width: 95%;
  }
}

@media (max-width: 1024px) {
  .community {
    width: 95%;
    gap: clamp(15px, 2vw, 20px);
    font-size: clamp(16px, 2vw, 18px);
  }

  .community h2 {
    font-size: clamp(36px, 4vw, 48px);
  }

  .communityContainer {
    padding: clamp(30px, 4vw, 53px);
  }
}

@media (max-width: 768px) {
  .community {
    width: 100%;
    display: block;
    gap: clamp(20px, 3vw, 30px);
    padding: 0 1rem;
  }

  .gridLeft {
    display: block;
    gap: clamp(20px, 3vw, 30px);
  }

  .community h2 {
    font-size: clamp(32px, 5vw, 42px);
    text-align: center;
    margin-bottom: clamp(20px, 3vw, 32px);
  }

  .communityContainer {
    font-size: clamp(15px, 2.5vw, 17px);
    padding: clamp(25px, 4vw, 40px);
    margin: clamp(10px, 2vw, 15px) 0;
  }

  .communityContainer img {
    width: 100%;
    max-width: 400px;
    height: auto;
    margin: 0 auto;
    display: block;
  }
}

@media (max-width: 480px) {
  .community {
    padding: 0 0.75rem;
  }

  .community h2 {
    font-size: clamp(28px, 6vw, 36px);
    margin-bottom: clamp(15px, 2.5vw, 24px);
  }

  .communityContainer {
    font-size: clamp(14px, 3vw, 16px);
    padding: clamp(20px, 5vw, 30px);
    margin: clamp(8px, 1.5vw, 12px) 0;
  }

  .textContainer {
    display: none;
  }

  .cardTextMobile {
    display: block;
    margin: clamp(20px, 4vw, 32px) 0;
    line-height: 1.5;
  }

  .communityContainer img {
    max-width: 100%;
    border-radius: 8px;
  }

  .lastMargin {
    margin-bottom: clamp(30px, 5vw, 60px);
  }

  .marginImg {
    margin-bottom: clamp(40px, 6vw, 84px);
  }
}
</style>

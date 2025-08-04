import { ref, computed } from 'vue'

export type Language = 'en' | 'uk'

const currentLanguage = ref<Language>('en')

const translations = {
  en: {
    // Navigation
    navHome: 'Home',
    navShop: 'Shop',
    navWiki: 'Wiki',

    // Hero Section
    serverName: 'Mysterria',
    heroSubtitle: 'Step into the mystical world of\nthe Lord of Mysteries universe\nwhere pathways and ancient secrets await',
    joinServer: 'Join Server',
    lorePathways: 'Lore & Pathways',
    versionInfo: '1.21.6 · Minecraft: Java Edition · No License Required',

    // Main Description
    welcomeTitle: 'WELCOME TO MYSTERRIA',
    welcomeQuote: '"This is not just a server... It\'s a Book that writes itself in the minds of players."',
    mainDescription: 'Mysterria is a unique Ukrainian RPG server inspired by Lord of the Mysteries. Every aspect of gameplay immerses you in the world of Fog, Beyonders, and Sequences. Here, magic is not an effect, but a science and path with limitations and costs.',

    // Gameplay Features
    gameplayTitle: 'Core Gameplay',
    gameplayFeatures: [
      'You are a Beyonder walking your own Sequence',
      'Astral World, Spirit World, Spiritual Essence — more than just words',
      'Ingredients must be found, obtained, or traded',
      'Potions are prepared through real alchemical processes',
      'Mobs aren\'t just killed — each has its own tactics'
    ],

    // Guides Section
    guidesTitle: 'Guides & Help',
    guidesFeatures: [
      'The website contains many detailed guides',
      'Other players can explain mechanics, but you\'ll have to ask',
      'Learning is part of the game. In Mysterria, ignorance = danger'
    ],

    // What Awaits
    awaitsTitle: 'What Awaits You?',
    awaitsFeatures: [
      'Sequence system from 9 to 0 level',
      'Unique potions, rituals, spirit summoning',
      'Custom mobs, events, secrets and worldview',
      'Interaction with others through intriguing events',
      'Gradual updates and expansion'
    ],

    finalMessage: 'Don\'t play to "win". Play to survive and discover the truth.',

    // Authentication
    login: 'Login',
    logout: 'Logout',
    loginWithDiscord: 'Login with Discord',
    profile: 'Profile',
    welcome: 'Welcome',

    // Shop
    shop: 'Shop',
    purchase: 'Purchase',
    buy: 'Buy',
    price: 'Price',
    item: 'Item',
    items: 'Items',
    subscription: 'Subscription',
    subscriptions: 'Subscriptions',
    balance: 'Balance',
    coins: 'Coins',

    // Profile
    personalInfo: 'Personal Information',
    serverInfo: 'Server Information',
    transactions: 'Transactions',
    transactionHistory: 'Transaction History',
    moderation: 'Moderation',
    verification: 'Verification',
    nickname: 'Nickname',
    discordTag: 'Discord Tag',
    joinedDate: 'Joined Date',
    lastSeen: 'Last Seen',
    playTime: 'Play Time',

    // General UI
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading',
    error: 'Error',
    success: 'Success',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',

    // Stats
    online: 'Online',
    offline: 'Offline',
    players: 'Players',
    statistics: 'Statistics',

    // Footer
    rights: 'All rights reserved',
    copyright: '© 2024 Mysterria',

    // Notifications
    copySuccess: 'Copied to clipboard!',
    copyError: 'Failed to copy',

    // Common Actions
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',

    // Profile Additional
    role: 'Role',
    verified: 'Verified',
    notVerified: 'Not Verified',
    unknown: 'Unknown',

    // Home Stats
    stableOnline: 'Stable\nOnline',
    uniqueContent: 'Unique\nContent',
    serverAge: 'Years\nOnline',

    // 404 Page
    pageNotFoundTitle: 'Oops! Looks like you\'re lost...',
    pageNotFoundMessage: 'Unfortunately, the page you are looking for was not found. But don\'t worry, you can always go back.',
    goBack: 'Go Back',

    // Additional UI
    myProfile: 'My Profile',
    accountVerification: 'Account Verification',
    verifyMinecraftAccount: 'Verify Minecraft Account',
    processing: 'Processing...',
    unavailable: 'Unavailable',

    // Verification Panel
    verificationDescription: 'To verify your Minecraft account, generate a code below and enter the command <code>/verify &lt;code&gt;</code> on the server.',
    generating: 'Generating...',
    generateCode: 'Generate Code',
    yourVerificationCode: 'Your verification code:',
    codeValidUntil: 'Code valid until:',
    enterOnServer: 'Enter on server:',

    // Shop
    processing2: 'Processing...',

    // Language Switcher
    changeLanguage: 'Change Language',

    // Player Stats Dashboard
    networkStatistics: 'Network Statistics',
    newPlayers24h: 'New (24h)',
    avgPlaytime: 'Avg. playtime',
    playersOnline: 'Players Online',
    topPlayers: 'Top Players',
    hourlyActivity: 'Hourly Activity',
    allServers: 'All Servers',
    onlinePlayersChart: 'Online Players',
    unknownPlayer: 'Unknown Player',
    failedToLoadHourlyData: 'Failed to load hourly data',
    failedToLoadSummary: 'Failed to load summary',
    unknownError: 'Unknown error',
    server: 'Server',
    selectServer: 'Select server...',

    // Transaction History
    loading2: 'Loading...',
    loadMore: 'Load more',
    errorLoadingTransactionHistory: 'Error loading transaction history',
    transactionTypes: {
      PURCHASE: 'Purchase',
      DONATION: 'Donation',
      VOTE_REWARD: 'Vote Reward',
      ADMIN_ADJUST: 'Admin Adjustment',
      REFUND: 'Refund',
      SUBSCRIPTION: 'Subscription',
      PENALTY: 'Penalty',
      REWARD: 'Reward'
    },

    // Server Info & Profile
    magicPath: 'Magic Path on server',
    residence: 'Residence on server',
    serverInformation: 'Server Information:',
    loadingServerData: 'Loading server data...',
    timePlayedTitle: 'Time spent on server',
    timePlayed: 'Time played',
    magicPathTitle: 'Magic path on server',
    magicPathLabel: 'Magic Path',
    residenceTitle: 'Place of residence on server',
    livesIn: 'Lives in',
    magicLevel: 'Magic Level',
    experienceLevel: 'Experience Level',
    criminalRecords: 'Criminal Records',
    warnings: 'Warnings',

    // Moderation Panel
    warn: 'Issue Warning',
    mute: 'Mute Player',
    ban: 'Ban Player',
    forever: 'Forever',
    unknownUser: 'Unknown',
    failedToGetCurrentUser: 'Failed to determine current user',
    unknownError2: 'Unknown error',

    // Modal and UI
    yes: 'Yes',
    no: 'No',
    topUp: 'Top Up',
    purchaseCancelled: 'Purchase cancelled',
    nicknameCannotBeEmpty: 'Nickname cannot be empty',
    nicknameSavedSuccessfully: 'Nickname saved successfully!',
    noResultsFound: 'No results found',
    selectOption: 'Select option...',

    // Shop Confirmations
    insufficientFundsMessage: 'Insufficient funds for purchase. Would you like to top up by',
    confirmPurchaseMessage: 'Are you sure you want to purchase this item?',

    // Rules Page
    navRules: 'Rules',
    rulesTitle: 'Laws of Mysterria',
    rulesSubtitle: '"He who enters the City of Fog is bound to obey the Laws of Mysterria. Violators will be cursed by the Entity itself..."',
    mainRule: 'The Main Rule',
    mainRuleDescription: 'Participation in the server means automatic agreement to the following. Ignorance does not exempt from responsibility. And punishment will always find you...!',
    rulesSection: {
      '1.1': {
        title: 'Psychological Chaos',
        description: 'Toxicity, inadequacy, flooding, spam, blackmail are unacceptable. The City does not tolerate madness beyond Control.'
      },
      '1.2': {
        title: 'Enemy Language',
        description: 'Any manifestation of Russian language in text channels is prohibited. In voice channels - at the discretion of its owner.'
      },
      '1.3': {
        title: 'Forbidden Artifacts',
        description: 'NSFW / 18+ content, war symbols, terrorist or cult signs are instantly destroyed by the Church of the Sun.'
      },
      '1.4': {
        title: 'Inhuman Word',
        description: 'Racism, sexism, chauvinism are unacceptable. Only Russians are deprived of moral protection.'
      },
      '1.5': {
        title: 'Unauthorized Intrusion',
        description: 'Any advertising without permission is an act of Invasion. This applies even to DMs.'
      },
      '1.6': {
        title: 'Breach of the Veil',
        description: 'Disclosure of personal information - even in private - is punishable by exile.'
      },
      '1.7': {
        title: 'Verbal Magic',
        description: 'Excessive profanity drains your soul. Every word is a ritual. Use wisely.'
      },
      '1.8': {
        title: 'Ritual Without Altar',
        description: 'Write only in the channel designated for it. Off-topic is magic without consequences, but with punishment.'
      },
      '1.9': {
        title: 'Empty Shells',
        description: 'Twinks, second accounts are prohibited. Arcane identity substitution is a crime.'
      },
      '1.10': {
        title: 'False Knight',
        description: 'Impersonating administration or deceiving players - eternal silence in the Fog.'
      },
      '1.11': {
        title: 'Incitement Rituals',
        description: 'Provoking others to violate - diving into the Abyss. You are responsible not only for actions, but also for influence.'
      },
      '1.12': {
        title: 'Sowers of Chaos',
        description: 'Creating conflicts, escalating negativity - rituals of reverse action. Consequences come before you write sorry...'
      }
    },

    // Minecraft Rules
    minecraftRulesTitle: 'Arcane Codex',
    minecraftRulesSubtitle: '"The peaceful lands of Mysterria are protected not by walls, but by Laws. Break them - and the Entity will turn against you..."',
    soulAgreement: 'Soul Agreement',
    soulAgreementDescription: 'By playing on the server, you automatically agree to the Codex. Ignorance of the rules does not remove responsibility. Punishment will always find its addressee.',
    minecraftRulesSection: {
      '2.1': {
        title: 'Forbidden Modifiers',
        description: 'Baritone, X-Ray, auto-clickers, multi-accounts - magic beyond Balance. Its price is exile.'
      },
      '2.2': {
        title: 'Space Violation',
        description: 'Griefing, landscape damage, theft - invasion of another\'s reality. The City does not forgive this.'
      },
      '2.3': {
        title: 'Desecration of Home',
        description: 'Interfering on someone else\'s territory without consent - a ritual of distrust. Do not enter the land without invitation.'
      },
      '2.4': {
        title: 'Breaking the World Fabric',
        description: 'Lag machines, dupes, exploits - research of the Forbidden. And it has a price. Fatal.'
      },
      '2.5': {
        title: 'Profanation of Relics',
        description: 'Destroying chests in dungeons - desecration of temples. Relooting exists - leave others a chance for loot.'
      },
      '2.6': {
        title: 'Summoning Chaos',
        description: 'Provoking rule violations - the Demon\'s whisper in another\'s heart. For this, the punishment is double.'
      },
      '2.7': {
        title: 'Combat Without Consent',
        description: 'Killing, armor damage, using magic - only by mutual consent. Otherwise - it\'s an attack.'
      },
      '2.8': {
        title: 'War Without Prophecy',
        description: 'Team battles (wars) - only with admin permission. Without prophecy - only slaughter.'
      },
      '2.9': {
        title: 'Desecration of Ether',
        description: 'Advertising, NSFW, terrorist symbols - pollution of the Ether. There will be no forgiveness.'
      },
      '2.10': {
        title: 'Unauthorized Settlements',
        description: 'Building closer than 300 blocks from Spawn without Arcanist permission is forbidden. Coordination is key.'
      },
      '2.13': {
        title: 'Deal with the Demon',
        description: 'Selling items for real money - a contract with the Abyss. And it always takes its due.'
      }
    }
  },
  uk: {
    // Navigation
    navHome: 'Головна',
    navShop: 'Крамниця',
    navWiki: 'Вікіпедія',

    // Hero Section
    serverName: 'Містеррія',
    heroSubtitle: 'Зануртесь у містичний світ\nвсесвіту Lord of the Mysteries\nде шляхи та давні таємниці чекають',
    joinServer: 'Приєднатися',
    lorePathways: 'Лор і Шляхи',
    versionInfo: '1.21.6 · Minecraft: Java Edition · Ліцензія не обов\'язкова',

    // Main Description
    welcomeTitle: 'ВІТАЄМО У МІСТЕРРІЇ',
    welcomeQuote: '"Це не просто сервер... Це Книга, що сама пише себе у головах гравців."',
    mainDescription: 'Містеррія — унікальний український RPG-сервер, створений за мотивами Lord of the Mysteries. Кожен аспект геймплею занурює тебе у світ Туману, Бейондерів та Послідовностей. Тут магія — не ефект, а наука і шлях з обмеженнями та ціною.',

    // Gameplay Features
    gameplayTitle: 'Основа геймплею',
    gameplayFeatures: [
      'Ти — Потойбічний, що крокує власною Послідовністю',
      'Астральний світ, Вимір Духів, Духовна Сутність — це більше ніж слова',
      'Інгредієнти потрібно знаходити, здобувати або торгувати ними',
      'Зілля готуються за реальними алхімічними процесами',
      'Мобів не просто вбити — кожен із них має свою тактику'
    ],

    // Guides Section
    guidesTitle: 'Гайди та допомога',
    guidesFeatures: [
      'На сайті міститься багато детальних гайдів',
      'Інші гравці можуть пояснити механіки, але доведеться питати',
      'Вивчення — частина гри. У Містеррії незнання = небезпека'
    ],

    // What Awaits
    awaitsTitle: 'Що на тебе чекає?',
    awaitsFeatures: [
      'Система Послідовностей з 9 до 0 рівня',
      'Унікальні зілля, ритуали, покликання духів',
      'Власні моби, події, таємниці та світогляд',
      'Взаємодія з іншими через інтригуючі події',
      'Поступове оновлення і розширення'
    ],

    finalMessage: 'Грайте не для того, щоб «виграти». Грайте, щоб вижити і відкрити істину.',

    // Authentication
    login: 'Увійти',
    logout: 'Вийти',
    loginWithDiscord: 'Увійти через Discord',
    profile: 'Профіль',
    welcome: 'Ласкаво просимо',

    // Shop
    shop: 'Крамниця',
    purchase: 'Придбати',
    buy: 'Купити',
    price: 'Ціна',
    item: 'Предмет',
    items: 'Предмети',
    subscription: 'Підписка',
    subscriptions: 'Підписки',
    balance: 'Баланс',
    coins: 'Монети',

    // Profile
    personalInfo: 'Особиста інформація',
    serverInfo: 'Інформація про сервер',
    transactions: 'Транзакції',
    transactionHistory: 'Історія транзакцій',
    moderation: 'Модерація',
    verification: 'Верифікація',
    nickname: 'Нікнейм',
    discordTag: 'Discord тег',
    joinedDate: 'Дата приєднання',
    lastSeen: 'Останній візит',
    playTime: 'Час гри',

    // General UI
    close: 'Закрити',
    save: 'Зберегти',
    cancel: 'Скасувати',
    confirm: 'Підтвердити',
    loading: 'Завантаження',
    error: 'Помилка',
    success: 'Успіх',
    back: 'Назад',
    next: 'Далі',
    previous: 'Попередній',

    // Stats
    online: 'Онлайн',
    offline: 'Офлайн',
    players: 'Гравці',
    statistics: 'Статистика',

    // Footer
    rights: 'Всі права захищені',
    copyright: '© 2024 Містеррія',

    // Notifications
    copySuccess: 'Скопійовано в буфер!',
    copyError: 'Не вдалося скопіювати',

    // Common Actions
    edit: 'Редагувати',
    delete: 'Видалити',
    view: 'Переглянути',
    search: 'Пошук',
    filter: 'Фільтр',
    sort: 'Сортувати',

    // Profile Additional
    role: 'Роль',
    verified: 'Підтверджено',
    notVerified: 'Не підтверджено',
    unknown: 'Невідомо',

    // Home Stats
    stableOnline: 'Стабільного\nонлайну',
    uniqueContent: 'Унікального\nконтенту',
    serverAge: 'Існування\nсервера',

    // 404 Page
    pageNotFoundTitle: 'Ой! Схоже, ви заблукали...',
    pageNotFoundMessage: 'На жаль, сторінку, яку ви шукаєте, не знайдено. Але не хвилюйтеся, ви завжди можете повернутися назад.',
    goBack: 'Повернутись',

    // Additional UI
    myProfile: 'Мій профіль',
    accountVerification: 'Верифікація акаунту',
    verifyMinecraftAccount: 'Верифікація Minecraft акаунту',
    processing: 'Обробка...',
    unavailable: 'Недоступно',

    // Verification Panel
    verificationDescription: 'Щоб підтвердити свій Minecraft акаунт, згенеруйте код нижче і введіть команду <code>/verify &lt;код&gt;</code> на сервері.',
    generating: 'Генерую...',
    generateCode: 'Згенерувати код',
    yourVerificationCode: 'Ваш код верифікації:',
    codeValidUntil: 'Код дійсний до:',
    enterOnServer: 'Введіть на сервері:',

    // Shop
    processing2: 'Обробка...',

    // Language Switcher
    changeLanguage: 'Змінити мову',

    // Player Stats Dashboard
    networkStatistics: 'Статистика Мережі',
    newPlayers24h: 'Нові (24г)',
    avgPlaytime: 'Сер. час гри',
    playersOnline: 'Гравці Онлайн',
    topPlayers: 'Топ гравці',
    hourlyActivity: 'Активність по годинах',
    allServers: 'Всі сервери',
    onlinePlayersChart: 'Онлайн гравці',
    unknownPlayer: 'Невідомий гравець',
    failedToLoadHourlyData: 'Не вдалося завантажити погодинні дані',
    failedToLoadSummary: 'Не вдалося завантажити зводку',
    unknownError: 'Невідома помилка',
    server: 'Сервер',
    selectServer: 'Виберіть сервер...',

    // Transaction History
    loading2: 'Завантаження...',
    loadMore: 'Завантажити більше',
    errorLoadingTransactionHistory: 'Помилка при завантаженні історії транзакцій',
    transactionTypes: {
      PURCHASE: 'Покупка',
      DONATION: 'Донат',
      VOTE_REWARD: 'Винагорода за голос',
      ADMIN_ADJUST: 'Корегування адміна',
      REFUND: 'Повернення',
      SUBSCRIPTION: 'Підписка',
      PENALTY: 'Штраф',
      REWARD: 'Нагорода'
    },

    // Server Info & Profile
    magicPath: 'Шлях магії на сервері',
    residence: 'Місце проживання на сервері',
    serverInformation: 'Серверна інформація:',
    loadingServerData: 'Завантаження серверних даних...',
    timePlayedTitle: 'Час, який провели на сервері',
    timePlayed: 'Часу награно',
    magicPathTitle: 'Шлях магії на сервері',
    magicPathLabel: 'Шлях магії',
    residenceTitle: 'Місце проживання на сервері',
    livesIn: 'Проживає в',
    magicLevel: 'Рівень магії',
    experienceLevel: 'Рівень досвіду',
    criminalRecords: 'Судимостей',
    warnings: 'Попереджень',

    // Moderation Panel
    warn: 'Видати попередження',
    mute: 'Замутити гравця',
    ban: 'Забанити гравця',
    forever: 'Назавжди',
    unknownUser: 'Невідомо',
    failedToGetCurrentUser: 'Не вдалося визначити поточного користувача',
    unknownError2: 'Невідома помилка',

    // Modal and UI
    yes: 'Так',
    no: 'Ні',
    topUp: 'Поповнити',
    purchaseCancelled: 'Покупку скасовано',
    nicknameCannotBeEmpty: 'Нікнейм не може бути порожнім',
    nicknameSavedSuccessfully: 'Нікнейм успішно збережено!',
    noResultsFound: 'Нічого не знайдено',
    selectOption: 'Виберіть опцію...',

    // Shop Confirmations
    insufficientFundsMessage: 'Недостатньо коштів для покупки. Чи не бажаєте ви поповнити на',
    confirmPurchaseMessage: 'Ви впевнені, що хочете придбати цей товар?',

    // Rules Page
    navRules: 'Правила',
    rulesTitle: 'Закони Містеррії',
    rulesSubtitle: '"Той, хто входить у Місто Туману, зобов\'язаний коритись Законам Містеррії. Порушники будуть прокляті самою Сутністю..."',
    mainRule: 'Основне правило',
    mainRuleDescription: 'Участь у сервері означає автоматичну згоду з нижченаведеним. Незнання не звільняє від відповідальності. А покарання вас завжди знайде.',
    rulesSection: {
      '1.1': {
        title: 'Психологічний хаос',
        description: 'Токсичність, неадекват, флуд, спам, шантаж — неприйнятні. Місто не терпить божевілля поза Контролем.'
      },
      '1.2': {
        title: 'Язик Ворога',
        description: 'Будь-який прояв російської мови в текстових каналах заборонений. У голосових каналах - на розсуд його власника.'
      },
      '1.3': {
        title: 'Заборонені Артефакти',
        description: 'NSFW / 18+ контент, символіка війни, терористичні чи культові знаки — миттєво знищуються Церквою Сонця.'
      },
      '1.4': {
        title: 'Нелюдське слово',
        description: 'Расизм, сексизм, шовінізм — неприпустимі. Лише росіяни позбавлені захисту моралі.'
      },
      '1.5': {
        title: 'Несанкціоноване проникнення',
        description: 'Будь-яка реклама без дозволу — акт Вторгнення. Це стосується навіть ПП.'
      },
      '1.6': {
        title: 'Порушення Завіси',
        description: 'Розголошення особистої інформації — навіть у приваті — карається вигнанням.'
      },
      '1.7': {
        title: 'Словесна магія',
        description: 'Надмірна нецензурна лексика виснажує твою душу. Кожне слово — це ритуал. Користуйся з розумом.'
      },
      '1.8': {
        title: 'Обряд без вівтаря',
        description: 'Пиши тільки в каналі, призначеному для цього. Оффтоп — це магія без наслідків, але з покаранням.'
      },
      '1.9': {
        title: 'Порожні оболонки',
        description: 'Твінки, другі акаунти — заборонені. Арканічна підміна особистості — злочин.'
      },
      '1.10': {
        title: 'Фальшивий Лицар',
        description: 'Видавання себе за адміністрацію чи обман гравців — вічне мовчання у Тумані.'
      },
      '1.11': {
        title: 'Ритуали Підбурювання',
        description: 'Провокація інших до порушень — занурення в Прірву. Ти відповідаєш не тільки за дії, а й за вплив.'
      },
      '1.12': {
        title: 'Сіячі Хаосу',
        description: 'Створення конфліктів, нагнітання негативу — ритуали зворотної дії. Наслідки приходять раніше, ніж ти напишеш вибач...'
      }
    },

    // Minecraft Rules
    minecraftRulesTitle: 'Арканічний Кодекс',
    minecraftRulesSubtitle: '"Мирні землі Містеррії захищені не стінами, а Законами. Поруш їх — і Сутність обернеться проти тебе..."',
    soulAgreement: 'Угода Душі',
    soulAgreementDescription: 'Граючи на сервері, ти автоматично погоджуєшся з Кодексом. Незнання правил не знімає відповідальності. Кара завжди знайде свого адресата.',
    minecraftRulesSection: {
      '2.1': {
        title: 'Заборонені Модифікатори',
        description: 'Барітон, Х-Ray, автокліки, мультиакаунти — магія поза Балансом. Її ціна — вигнання.'
      },
      '2.2': {
        title: 'Порушення Простору',
        description: 'Гріферство, псування ландшафту, крадіжка — вторгнення в чужу реальність. Місто цього не пробачає.'
      },
      '2.3': {
        title: 'Наруга над Домівкою',
        description: 'Заважання на чужій території без згоди — ритуал недовіри. Не вступай на землю без запрошення.'
      },
      '2.4': {
        title: 'Злом Тканини Світу',
        description: 'Лаг-машини, дюпи, експлойти — дослідження Забороненого. І це має ціну. Фатальну.'
      },
      '2.5': {
        title: 'Профанація Реліквій',
        description: 'Руйнування скринь у данжах — осквернення храмів. Релутінг існує — залиш іншим шанс на здобич.'
      },
      '2.6': {
        title: 'Виклик Хаосу',
        description: 'Провокації на порушення правил — шепіт Демона в серце іншого. За це кара подвійна.'
      },
      '2.7': {
        title: 'Бій Без Згоди',
        description: 'Убивство, псування броні, використання магії — лише за взаємної згоди. Інакше — це напад.'
      },
      '2.8': {
        title: 'Війна Без Пророцтва',
        description: 'Командні бої (війни) — лише з дозволу адмінів. Без пророцтва — лише різанина.'
      },
      '2.9': {
        title: 'Осквернення Ефіру',
        description: 'Реклама, NSFW, терористична символіка — забруднення Ефіру. Не буде прощення.'
      },
      '2.10': {
        title: 'Несанкціоновані Оселення',
        description: 'Заборонено будувати ближче 300 блоків від Спавну без дозволу Арканіста. Координація — ключ.'
      },
      '2.13': {
        title: 'Угода з Демоном',
        description: 'Продаж речей за реальні гроші — контракт із Безоднею. А вона завжди бере своє.'
      }
    }
  }
}

export function useI18n() {
  const setLanguage = (lang: Language) => {
    currentLanguage.value = lang
    localStorage.setItem('mysterria-language', lang)
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: unknown = translations[currentLanguage.value]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        return key
      }
    }

    if (typeof value === 'string') {
      return value
    } else if (Array.isArray(value)) {
      return value.join(' ')
    }

    return key
  }

  const tArray = (key: string): string[] => {
    const keys = key.split('.')
    let value: unknown = translations[currentLanguage.value]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        return []
      }
    }

    return Array.isArray(value) ? value : []
  }

  // Initialize from localStorage
  const savedLang = localStorage.getItem('mysterria-language') as Language
  if (savedLang && (savedLang === 'en' || savedLang === 'uk')) {
    currentLanguage.value = savedLang
  }

  return {
    currentLanguage: computed(() => currentLanguage.value),
    setLanguage,
    t,
    tArray
  }
}

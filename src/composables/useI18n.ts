import {computed, ref} from "vue";

export type Language = "en" | "uk";

const currentLanguage = ref<Language>("en");

const translations = {
    en: {
        // Navigation
        navHome: "Home",
        navShop: "Shop",
        navWiki: "Wiki",
        navGame: "Game Guide",
        navServices: "Services",
        navForum: "Forum",

        // Services
        servicesWikiDesc: "Knowledge base & guides",
        servicesDiscord: "Discord",
        servicesDiscordDesc: "Join our community",
        servicesArchive: "Archive",
        servicesArchiveDesc: "Like a library, for new items",
        servicesMap: "Live Map",
        servicesMapDesc: "Explore the world",

        // Home Page
        home: {
            heroSubtitleHome: "A Lord of the Mysteries inspired Minecraft world",
            heroDescriptionHome: "Step through the fog and into the era of steam and divination. Join an immersive server where fate, sequences, and secret organizations intertwine.",
            readGuide: "Read the Guide",
            letsPlay: "Let's Play!",
            wiki: "Wiki",
            joinServerTitle: "How to Join Mysterria",
            step1Title: "Launch Minecraft",
            step1Description: "Start Minecraft Java Edition (version 1.21.8)",
            step2Title: "Connect to Server",
            step2Description: "Use the server IP below to join our world",
            step3Title: "Begin Your Journey",
            step3Description: "Create your character and start exploring the mysteries",
            fullGuide: "Full Game Guide",
            featureEldritchLoreTitle: "Eldritch Lore",
            featureEldritchLoreDescription: "Discover sequences, potions, and relics hidden in the fog.",
            featureVictorianCraftTitle: "Victorian Craft",
            featureVictorianCraftDescription: "Forge clockwork contraptions and mystic gadgets.",
            featureSecretSocietiesTitle: "Secret Societies",
            featureSecretSocietiesDescription: "Pledge allegiance and rise through the ranks.",
            newsEyebrow: "News",
            newsTitle: "From Behind the Fog",
            newsSubtitle: "Updates and dispatches from the Evernight.",
            pinnedNewsEyebrow: "Important",
            pinnedNewsTitle: "Pinned Announcements",
            pinnedNewsSubtitle: "Important long-term updates and announcements.",
            pinnedNews: "Pinned",
            loadMorePinned: "Show more pinned",
            readMore: "Read more",
            loadAdditional: "Show more",
        },

        // Hero Section
        serverName: "Mysterria",
        heroSubtitle:
            "Step into the mystical world of\nthe Lord of Mysteries universe\nwhere pathways and ancient secrets await",
        joinServer: "Join Server",
        lorePathways: "Lore & Pathways",
        versionInfo: "1.21.8 · Minecraft: Java Edition · No License Required",

        // Main Description
        welcomeTitle: "WELCOME TO MYSTERRIA",
        welcomeQuote:
            '"This is not just a server... It\'s a Book that writes itself in the minds of players."',
        mainDescription:
            "Mysterria is a unique Ukrainian RPG server inspired by Lord of the Mysteries. Every aspect of gameplay immerses you in the world of Fog, Beyonders, and Sequences. Here, magic is not an effect, but a science and path with limitations and costs.",

        // Gameplay Features
        gameplayTitle: "Core Gameplay",
        gameplayFeatures: [
            "You are a Beyonder walking your own Sequence",
            "Astral World, Spirit World, Spiritual Essence — more than just words",
            "Ingredients must be found, obtained, or traded",
            "Potions are prepared through real alchemical processes",
            "Mobs aren't just killed — each has its own tactics",
        ],

        // Guides Section
        guidesTitle: "Guides & Help",
        guidesFeatures: [
            "The website contains many detailed guides",
            "Other players can explain mechanics, but you'll have to ask",
            "Learning is part of the game. In Mysterria, ignorance = danger",
        ],

        // What Awaits
        awaitsTitle: "What Awaits You?",
        awaitsFeatures: [
            "Sequence system from 9 to 0 level",
            "Unique potions, rituals, spirit summoning",
            "Custom mobs, events, secrets and worldview",
            "Interaction with others through intriguing events",
            "Gradual updates and expansion",
        ],

        finalMessage:
            'Don\'t play to "win". Play to survive and discover the truth.',

        // Authentication
        login: "Login",
        logout: "Logout",
        loginWithDiscord: "Login with Discord",
        profile: "Profile",
        welcome: "Welcome",
        processing: "Processing...",
        secureLoginDisclaimer: "Secure login via Discord - your privacy is protected",

        // Shop
        shop: "Shop",
        purchase: "Purchase",
        buy: "Buy",
        price: "Price",
        item: "Item",
        items: "Items",
        subscription: "Subscription",
        subscriptions: "Subscriptions",
        balance: "Balance",
        coins: "Coins",

        // Profile
        personalInfo: "Personal Information",
        serverInfo: "Server Information",
        transactions: "Transactions",
        transactionHistoryTitle: "Transaction History",
        moderation: "Moderation",
        verification: "Verification",
        nickname: "Nickname",
        discordTag: "Discord Tag",
        joinedDate: "Joined Date",
        lastSeen: "Last Seen",
        playTime: "Play Time",

        // General UI
        close: "Close",
        save: "Save",
        cancel: "Cancel",
        confirm: "Confirm",
        loading: "Loading",
        error: "Error",
        success: "Success",
        back: "Back",
        next: "Next",
        previous: "Previous",

        // Stats
        online: "Online",
        offline: "Offline",
        players: "Players",
        statistics: "Statistics",

        // Footer
        rights: "All rights reserved",
        copyright: "© 2025 ~",

        // Notifications
        copyError: "Failed to copy",
        errorDetailsClickToCopy: "Click to copy detailed information for administrator",
        errorDetailsCopied: "Error information copied to clipboard",
        errorDetailsFailedToCopy: "Failed to copy information",
        errorLabel: "Error",
        messageLabel: "Message",
        timeLabel: "Time",
        requestIdLabel: "Request ID",
        urlLabel: "URL",
        requestParamsLabel: "Request Parameters",
        requestDataLabel: "Request Data",
        additionalInfoLabel: "Additional Information",
        errorDetailsFooter: "Please provide this information to the administrator for faster problem resolution.",

        // Common Actions
        edit: "Edit",
        delete: "Delete",
        view: "View",
        search: "Search",
        filter: "Filter",
        sort: "Sort",

        // Profile Additional
        role: "Role",
        verified: "Verified",
        notVerified: "Not Verified",
        unknown: "Unknown",

        // Home Stats
        stableOnline: "Stable\nOnline",
        uniqueContent: "Unique\nContent",
        serverAge: "Years\nOnline",

        // 404 Page
        pageNotFoundTitle: "Oops! Looks like you're lost...",
        pageNotFoundMessage:
            "Unfortunately, the page you are looking for was not found. But don't worry, you can always go back.",
        goBack: "Go Back",

        // Additional UI
        myProfile: "My Profile",
        accountVerification: "Account Verification",
        verifyMinecraftAccount: "Verify Minecraft Account",
        unavailable: "Unavailable",

        // Verification Panel
        verificationDescription:
            "To verify your Minecraft account, generate a code below and enter the command <code>/verify &lt;code&gt;</code> on the server.",
        generating: "Generating...",
        generateCode: "Generate Code",
        yourVerificationCode: "Your verification code:",
        codeValidUntil: "Code valid until:",
        enterOnServer: "Enter on server:",
        verificationCodeGenerated: "Verification code generated!",
        verificationCodeError: "Error generating verification code",

        // Shop
        processing2: "Processing...",

        // Language Switcher
        changeLanguage: "Change Language",

        // Player Stats Dashboard
        networkStatistics: "Network Statistics",
        newPlayers24h: "New (24h)",
        avgPlaytime: "Avg. playtime",
        playersOnline: "Players Online",
        topPlayers: "Top Players",
        hourlyActivity: "Hourly Activity",
        allServers: "All Servers",
        onlinePlayersChart: "Online Players",
        unknownPlayer: "Unknown Player",
        failedToLoadHourlyData: "Failed to load hourly data",
        failedToLoadSummary: "Failed to load summary",
        unknownError: "Unknown error",
        server: "Server",
        selectServer: "Select server...",

        // Transaction History
        loading2: "Loading...",
        loadMore: "Load more",
        errorLoadingTransactionHistory: "Error loading transaction history",
        transactionHistory: {
            allTypes: "All types",
            loading: "Loading transaction history...",
            noTransactions: "Transaction history is empty",
            noFilterResults: "No transactions found for the selected filter: {filter}",
            noTransactionsDescription: "Your transaction history will appear here once you make your first transaction.",
            details: "Details",
        },
        transactionTypes: {
            PURCHASE: "Purchase",
            DONATION: "Donation",
            VOTE_REWARD: "Vote Reward",
            ADMIN_ADJUST: "Admin Adjustment",
            REFUND: "Refund",
            SUBSCRIPTION: "Subscription",
            PENALTY: "Penalty",
            REWARD: "Reward",
        },

        // Server Info & Profile
        magicPath: "Magic Path on server",
        residence: "Residence on server",
        serverInformation: "Server Information:",
        loadingServerData: "Loading server data...",
        timePlayedTitle: "Time spent on server",
        timePlayed: "Time played",
        magicPathTitle: "Magic path on server",
        magicPathLabel: "Magic Path",
        residenceTitle: "Place of residence on server",
        livesIn: "Lives in",
        magicLevel: "Magic Level",
        experienceLevel: "Experience Level",
        criminalRecords: "Criminal Records",
        warnings: "Warnings",

        // Moderation Panel
        warn: "Issue Warning",
        mute: "Mute Player",
        ban: "Ban Player",
        forever: "Forever",
        unknownUser: "Unknown",
        failedToGetCurrentUser: "Failed to determine current user",
        unknownError2: "Unknown error",

        // Modal and UI
        yes: "Yes",
        no: "No",
        topUp: "Top Up",
        purchaseCancelled: "Purchase cancelled",
        nicknameCannotBeEmpty: "Nickname cannot be empty",
        nicknameSavedSuccessfully: "Nickname saved successfully!",
        noResultsFound: "No results found",
        selectOption: "Select option...",

        // Shop Confirmations
        insufficientFundsMessage:
            "Insufficient funds for purchase. Would you like to top up by",
        confirmPurchaseMessage: "Are you sure you want to purchase this item?",
        shopLoginRequired: "Log in to your account to access the Shop!",
        profileSetupRequired: "Please verify your account and set up your profile to make purchases",
        itemNotFound: "Item not found",
        itemNotAvailable: "This item is currently unavailable for purchase",

        // Shop Categories
        shopCategoryItems: "Items",
        shopCategoryItemsDesc: "In-game items and equipment",
        shopCategoryPermissions: "Permissions",
        shopCategoryPermissionsDesc: "Special permissions and abilities",
        shopCategorySubscriptions: "Subscriptions",
        shopCategorySubscriptionsDesc: "Recurring premium services",
        shopCategoryDiscordRoles: "Discord Roles",
        shopCategoryDiscordRolesDesc: "Discord server roles and benefits",
        shopCategoryCosmetics: "Cosmetics",
        shopCategoryCosmeticsDesc: "Cosmetic items and appearance customizations",
        shopCategoryAppeals: "Appeals",
        shopCategoryAppealsDesc: "Ban appeals and account recovery services",
        shopCategoryOther: "Other",
        shopCategoryOtherDesc: "Miscellaneous services",

        // Shop UI
        shopEyebrow: "Shop",
        shopTitle: "Wares of the Evernight",
        shopSubtitle: "Clean, elegant, and fair. Your support sustains the city's lamps.",
        shopLoading: "Loading shop...",
        shopLoadFailed: "Failed to load shop",
        tryAgain: "Try Again",
        viewDetails: "View Details",

        // Service Types
        serviceTypeItem: "Item",
        serviceTypePermission: "Permission",
        serviceTypeSubscription: "Subscription",
        serviceTypeDiscordRole: "Discord Role",

        // Service Page
        loadingService: "Loading service...",
        serviceNotFound: "Service Not Found",
        serviceNotFoundMessage: "This service content is not available yet or has been moved.",
        serviceContentNotCreated: "The detailed information for this service has not been created yet.",
        backToShop: "Back to Shop",
        loginToPurchase: "Please log in to purchase this service",
        purchaseError: "Failed to prepare purchase",
        purchaseSuccess: "Purchase successful!",

        // Shop Account Setup
        accountSetupRequired: "Account Verification Required",
        shopAccessDescription:
            "To access the shop, you first need to set your Minecraft nickname. This helps us link your account with Discord and ensure proper shop functionality.",
        profileSetupInstructions:
            "Go to your profile page to generate a verification code and link your Minecraft account.",
        goToProfile: "Go to Profile",
        selectServerForItem: "Select server to receive the item:",

        // Unauthorized Message
        authenticationRequired: "Authentication Required",
        accessExclusiveItems: "Access exclusive items",
        manageYourBalance: "Manage your balance",

        // Game Guide Page
        gameGuideTitle: "Getting Started Guide",
        gameGuideSubtitle:
            "Everything you need to know to begin your journey in Mysterria",

        // Server Connection
        serverConnectionTitle: "Connect to Server",
        serverConnectionDescription:
            "Join our Minecraft server to start your adventure in the Lord of Mysteries universe.",
        serverIP: "Server IP",
        serverAddress: "mc.mysterria.net",
        copyToClipboard: "Copy to clipboard",
        copyIP: "Copy IP",
        copySuccess: "Copied!",
        serverVersion: "Version",
        minecraftVersion: "1.21.8",
        serverEdition: "Java Edition",
        modsRequired: "Mods Required",
        noModsRequired: "None (Optional)",
        serverType: "Server Type",
        rpgServer: "RPG/Roleplay",
        serverScreenshotPlaceholder: "Server lobby screenshot will be placed here",

        // Lore & Anime
        loreAnimeTitle: "Understand the World",
        loreAnimeDescription:
            "Before diving into the game, we highly recommend familiarizing yourself with the source material.",
        webNovelTitle: "Web Novel",
        webNovelDescription:
            "Read the original Lord of the Mysteries web novel to understand the world better.",
        readWebNovel: "Read Web Novel",
        animeTitle: "Anime Series",
        animeDescription:
            "Watch the currently airing anime adaptation for visual storytelling.",
        watchAnime: "Watch Anime",
        loreImagePlaceholder: "Lord of Mysteries artwork will be placed here",

        // Harmoniya Launcher
        launcherTitle: "Harmoniya Launcher",
        launcherDescription:
            "Our custom launcher with pre-configured modpack for the best server experience.",
        launcherFeature1: "Pre-installed server modpack",
        launcherFeature2: "Automatic updates and configuration",
        launcherFeature3: "Optional - no mods required to play",
        launcherFeature4: "Auto-login to server, no need to enter password",
        launcherFeature5:
            "Pre-installed client mods for extended Magic system support",
        downloadLauncher: "Download Launcher",
        launcherScreenshotPlaceholder:
            "Launcher interface screenshot will be placed here",

        // Rules
        rulesDescription:
            "Familiarize yourself with our server rules before playing.",
        readRules: "Read Server Rules",
        rulesImagePlaceholder: "Rules illustration will be placed here",
        mainRuleConcepts: "Main Rule Concepts",
        ruleConcepts: [
            "No toxicity, spam, or psychological chaos",
            "Russian language prohibited in text channels",
            "No NSFW content or forbidden symbols",
            "No cheating, hacking, or exploits",
            "Respect others' property - no griefing",
        ],

        // Discord Guild
        discordTitle: "Join Our Discord",
        discordDescription:
            "Connect with the community, get help, participate in events, and stay updated on server news.",
        discordBenefits: [
            "Get help from experienced players and staff",
            "Participate in community events and giveaways",
            "Stay updated on server news and announcements",
            "Find teammates for adventures and quests",
            "Access exclusive Discord-only content",
        ],
        joinDiscord: "Join Discord Server",
        discordImagePlaceholder: "Discord server screenshot will be placed here",

        // Profile & Verification
        profileTitle: "Setup Your Profile",
        profileDescription:
            "Link your Minecraft account to Discord for verification and access to all server features.",
        verificationStep1: "Visit your profile page",
        verificationStep2: "Generate verification code",
        verificationStep3: "Use /verify <code> command in-game",
        profileImagePlaceholder: "Profile setup screenshot will be placed here",

        // Quick Tips
        quickTipsTitle: "Quick Tips for New Players",
        quickTips: [
            "Start by reading the lore to understand Beyonder pathways and sequences",
            "Join Discord to connect with other players and get help",
            "Visit the spawn area to find starter guides and tutorials",
            "Ask questions in chat - the community is helpful to newcomers",
            "Take your time to explore and learn the custom mechanics",
            "Remember: this is an RPG server focused on immersion and roleplay",
            "Check the project wiki for detailed guides and gameplay mechanics",
            "Be respectful and friendly - help create a welcoming community for everyone",
        ],

        // Bottom CTA
        readyToStart: "Ready to Begin Your Journey?",
        readyToStartDescription:
            "Set up your profile and review the rules to get started on your path as a Beyonder.",
        setupProfile: "Setup Profile",
        reviewRules: "Review Rules",

        // Guide Steps
        guideStep1Title: "Copy IP",
        guideStep1Description: "Copy server IP address",
        guideStep2Title: "Add Server",
        guideStep2Description: "Add Mysteria server",
        guideStep3Title: "Join Server",
        guideStep3Description: "Connect to server",
        guideStep4Title: "Verify",
        guideStep4Description: "Verify your account",
        guideStep5Title: "Enter World",
        guideStep5Description: "Leave lobby area",
        guideStep6Title: "Learn Lore",
        guideStep6Description: "Read about Beyonders",
        guideStep7Title: "Start Playing",
        guideStep7Description: "Begin your adventure",
        guideStep8Title: "Harmoniya Launcher",
        guideStep8Description: "Optional enhanced client",

        // Common UI
        optional: "Optional",
        launcherBenefits: "Launcher Benefits",

        // Guide Step Content - Full Titles and Descriptions
        guideStep1FullTitle: "Copy Server IP Address",
        guideStep1FullDescription: "First, copy our server IP address to connect to Mysteria.",
        guideStep2FullTitle: "Add Mysteria Server",
        guideStep2FullDescription: "Add our server to your server list using the IP address you copied.",
        guideStep3FullTitle: "Join the Server",
        guideStep3FullDescription: "Connect to Mysteria by joining the server you just added.",
        guideStep4FullTitle: "Verify Your Account",
        guideStep4FullDescription: "Get your verification code from your profile and verify in-game.",
        guideStep5FullTitle: "Enter the Open World",
        guideStep5FullDescription: "Leave the lobby area and enter the main game world to begin your adventure.",
        guideStep6FullTitle: "Learn About Beyonders",
        guideStep6FullDescription: "Read our wiki to understand the mystical system of Beyonders and how to advance.",
        guideStep7FullTitle: "Begin Your Adventure!",
        guideStep7FullDescription: "You're all set! Start your journey in the mystical world of Mysteria.",

        // Guide Step Instructions
        guideStep2Instruction1: "Click \"Add Server\" in the multiplayer menu",
        guideStep2Instruction2: "Enter \"Mysteria\" as the server name",
        guideStep2Instruction3: "Paste the server IP in the address field",
        guideStep2Instruction4: "Click \"Done\" to save the server",

        guideStep3Instruction1: "Select \"Mysteria\" from your server list",
        guideStep3Instruction2: "Click \"Join Server\" to connect",
        guideStep3Instruction3: "Wait for the connection to establish",
        guideStep3Instruction4: "Accept the server resource pack when prompted",

        guideStep4Instruction1: "Visit your profile page on our website",
        guideStep4Instruction2: "Copy your verification code",
        guideStep4Instruction3: "Type the code in chat: /verify [code]",
        guideStep4Instruction4: "Wait for verification confirmation",

        guideStep5Instruction1: "Look for the world portal in the lobby",
        guideStep5Instruction2: "Right-click or walk through the portal",
        guideStep5Instruction3: "Choose your starting location",
        guideStep5Instruction4: "Begin exploring the mystical world",

        // Guide Step 6 - Lore Content
        guideStep6LoreTitle1: "Understanding Pathways",
        guideStep6LoreDesc1: "Learn about the 22 mystical pathways and their unique abilities",
        guideStep6LoreTitle2: "Potion System",
        guideStep6LoreDesc2: "Discover how to advance through sequences using potions",
        guideStep6LoreTitle3: "Mystical Items",
        guideStep6LoreDesc3: "Explore the various artifacts and their supernatural powers",

        // Guide Step 7 - Final Tips
        guideStep7JourneyTitle: "Your Journey Begins Here",
        guideStep7Tip1: "Start as a mortal and work your way up the mystical sequences",
        guideStep7Tip2: "Choose your pathway carefully - each has unique abilities",
        guideStep7Tip3: "Join our Discord community for help and roleplay",
        guideStep7Tip4: "Read the rules to understand our roleplay guidelines",

        // Image Placeholders
        guideStep1ImagePlaceholder: "Copy IP Screenshot Placeholder",
        guideStep2ImagePlaceholder: "Add Server Screenshot Placeholder",
        guideStep3ImagePlaceholder: "Join Server Screenshot Placeholder",
        guideStep4ImagePlaceholder: "Account Verification Screenshot Placeholder",
        guideStep5ImagePlaceholder: "World Portal Screenshot Placeholder",
        guideStep6ImagePlaceholder: "Wiki/Lore Screenshot Placeholder",
        guideStep7ImagePlaceholder: "Gameplay Screenshot Placeholder",

        // Wiki Page
        wikiEyebrow: "Wiki",
        wikiTitle: "Knowledge Compendium",
        wikiSubtitle: "Discover the secrets and lore of Mysterria",
        language: "Language",
        category: "Category",
        allCategories: "All Categories",
        searchWikiPlaceholder: "Search wiki pages...",
        clearSearch: "Clear search",
        searchResults: "Found {count} results for \"{query}\"",
        categoryResults: "Showing {count} pages in {category}",
        totalPages: "Total pages: {count}",
        failedToLoadPages: "Failed to load pages",
        noPagesFound: "No pages found",
        noSearchResults: "No pages found matching your search",
        noCategoryPages: "No pages found in this category",
        noWikiPages: "No wiki pages available",
        showAllPages: "Show All Pages",

        // Guide Page
        guideEyebrow: "Guide",
        guideTitle: "Enter the Fog",
        guideSubtitle: "Your complete guide to surviving the mysteries of Mysterria.",
        gettingStartedSectionTitle: "Getting Started",
        firstStepsTitle: "First Steps",
        firstStepsDescription: "Join the server at mc.mysterria.net and begin your journey into the world of mysteries.",
        characterCreationTitle: "Character Creation",
        characterCreationDescription: "Choose your starting pathway and begin ascending the mystical sequences.",
        sequencesPathwaysSectionTitle: "Sequences & Pathways",
        foolPathwayTitle: "The Fool Pathway",
        foolPathwayDescription: "Master divination, illusion, and the power to manipulate fate itself.",
        hunterPathwayTitle: "Hunter Pathway",
        hunterPathwayDescription: "Excel in combat, tracking, and supernatural marksmanship abilities.",
        seerPathwayTitle: "Seer Pathway",
        seerPathwayDescription: "Gain foresight, prophecy, and the ability to peer through time.",
        secretOrganizationsSectionTitle: "Secret Organizations",
        tarotClubTitle: "The Tarot Club",
        tarotClubDescription: "A mysterious gathering above the gray fog where members trade knowledge and favors.",
        churchOfEvernightGoddessTitle: "Church of the Evernight Goddess",
        churchOfEvernightGoddessDescription: "One of the orthodox churches maintaining order in the supernatural world.",
        mysticalCraftingSectionTitle: "Mystical Crafting",
        potionMakingTitle: "Potion Making",
        potionMakingDescription: "Brew advancement potions to climb the sequences and gain new abilities.",
        sealedArtifactsTitle: "Sealed Artifacts",
        sealedArtifactsDescription: "Discover and wield powerful but dangerous mystical items.",
        quickTipsForNewBeyondersTitle: "Quick Tips for New Beyonders",
        quickTipsForNewBeyondersList: [
            "Always be cautious when dealing with supernatural phenomena",
            "Knowledge can be both power and danger - share wisely",
            "Join or form a team for dangerous expeditions",
            "Keep your advancement steady - rushing leads to loss of control",
            "The fog holds many secrets, but not all are meant to be uncovered",
        ],

        // Rules Page
        navRules: "Rules",
        rulesTitle: "Laws of Mysterria",
        rulesSubtitle:
            '"He who enters the City of Fog is bound to obey the Laws of Mysterria. Violators will be cursed by the Entity itself..."',
        tableOfContents: "Table of Contents",
        staffRules: "Staff Rules",
        examples: "Examples",
        playerRules: "Player Rules",
        mainRule: "The Main Rule",
        mainRuleDescription:
            "Participation in the server means automatic agreement to the following. Ignorance does not exempt from responsibility. And punishment will always find you...!",
        rulesSection: {
            "1.1": {
                title: "Psychological Chaos",
                description:
                    "Toxicity, inadequacy, flooding, spam, blackmail are unacceptable. The City does not tolerate madness beyond Control.",
            },
            "1.2": {
                title: "Enemy Language",
                description:
                    "Any manifestation of Russian language in text channels is prohibited. In voice channels - at the discretion of its owner.",
            },
            "1.3": {
                title: "Forbidden Artifacts",
                description:
                    "NSFW / 18+ content, war symbols, terrorist or cult signs are instantly destroyed by the Church of the Sun.",
            },
            "1.4": {
                title: "Inhuman Word",
                description:
                    "Racism, sexism, chauvinism are unacceptable. Only Russians are deprived of moral protection.",
            },
            "1.5": {
                title: "Unauthorized Intrusion",
                description:
                    "Any advertising without permission is an act of Invasion. This applies even to DMs.",
            },
            "1.6": {
                title: "Breach of the Veil",
                description:
                    "Disclosure of personal information - even in private - is punishable by exile.",
            },
            "1.7": {
                title: "Verbal Magic",
                description:
                    "Excessive profanity drains your soul. Every word is a ritual. Use wisely.",
            },
            "1.8": {
                title: "Ritual Without Altar",
                description:
                    "Write only in the channel designated for it. Off-topic is magic without consequences, but with punishment.",
            },
            "1.9": {
                title: "Empty Shells",
                description:
                    "Twinks, second accounts are prohibited. Arcane identity substitution is a crime.",
            },
            "1.10": {
                title: "False Knight",
                description:
                    "Impersonating administration or deceiving players - eternal silence in the Fog.",
            },
            "1.11": {
                title: "Incitement Rituals",
                description:
                    "Provoking others to violate - diving into the Abyss. You are responsible not only for actions, but also for influence.",
            },
            "1.12": {
                title: "Sowers of Chaos",
                description:
                    "Creating conflicts, escalating negativity - rituals of reverse action. Consequences come before you write sorry...",
            },
        },

        // Minecraft Rules
        minecraftRulesTitle: "Arcane Codex",
        minecraftRulesSubtitle:
            '"The peaceful lands of Mysterria are protected not by walls, but by Laws. Break them - and the Entity will turn against you..."',
        soulAgreement: "Soul Agreement",
        soulAgreementDescription:
            "By playing on the server, you automatically agree to the Codex. Ignorance of the rules does not remove responsibility. Punishment will always find its addressee.",
        minecraftRulesSection: {
            "2.1": {
                title: "Forbidden Modifiers",
                description:
                    "Baritone, X-Ray, auto-clickers, multi-accounts - magic beyond Balance. Its price is exile.",
            },
            "2.2": {
                title: "Space Violation",
                description:
                    "Griefing, landscape damage, theft - invasion of another's reality. The City does not forgive this.",
            },
            "2.3": {
                title: "Desecration of Home",
                description:
                    "Interfering on someone else's territory without consent - a ritual of distrust. Do not enter the land without invitation.",
            },
            "2.4": {
                title: "Breaking the World Fabric",
                description:
                    "Lag machines, dupes, exploits - research of the Forbidden. And it has a price. Fatal.",
            },
            "2.5": {
                title: "Profanation of Relics",
                description:
                    "Destroying chests in dungeons - desecration of temples. Relooting exists - leave others a chance for loot.",
            },
            "2.6": {
                title: "Summoning Chaos",
                description:
                    "Provoking rule violations - the Demon's whisper in another's heart. For this, the punishment is double.",
            },
            "2.7": {
                title: "Combat Without Consent",
                description:
                    "Killing, armor damage, using magic - only by mutual consent. Otherwise - it's an attack.",
            },
            "2.8": {
                title: "War Without Prophecy",
                description:
                    "Team battles (wars) - only with admin permission. Without prophecy - only slaughter.",
            },
            "2.9": {
                title: "Desecration of Ether",
                description:
                    "Advertising, NSFW, terrorist symbols - pollution of the Ether. There will be no forgiveness.",
            },
            "2.10": {
                title: "Unauthorized Settlements",
                description:
                    "Building closer than 300 blocks from Spawn without Arcanist permission is forbidden. Coordination is key.",
            },
            "2.13": {
                title: "Deal with the Demon",
                description:
                    "Selling items for real money - a contract with the Abyss. And it always takes its due.",
            },
        },
    },
    uk: {
        // Navigation
        navHome: "Головна",
        navShop: "Крамниця",
        navWiki: "Вікіпедія",
        navGame: "Почати гру",
        navServices: "Сервіси",
        navForum: "Форум",

        // Services
        servicesWikiDesc: "База знань та посібники",
        servicesDiscord: "Discord",
        servicesDiscordDesc: "Приєднуйтесь до спільноти",
        servicesArchive: "Архів",
        servicesArchiveDesc: "Як бібліотека, але для нових предметів",
        servicesMap: "Карта",
        servicesMapDesc: "Досліджуйте світ",

        // Home Page
        home: {
            heroSubtitleHome: "Minecraft світ, натхненний Lord of the Mysteries",
            heroDescriptionHome: "Пройдіть крізь туман в епоху пари та ворожіння. Приєднуйтесь до захоплюючого сервера, де переплітаються доля, послідовності та таємні організації.",
            readGuide: "Читати Гайд",
            letsPlay: "Грайте!",
            wiki: "Вікі",
            joinServerTitle: "Як приєднатися до Містеррії",
            step1Title: "Запустіть Minecraft",
            step1Description: "Запустіть Minecraft Java Edition (версія 1.21.8)",
            step2Title: "Підключіться до сервера",
            step2Description: "Використайте IP сервера нижче, щоб приєднатися до нашого світу",
            step3Title: "Почніть свою подорож",
            step3Description: "Створіть свого персонажа і почніть досліджувати таємниці",
            fullGuide: "Повний гайд по грі",
            featureEldritchLoreTitle: "Потойбічний Лор",
            featureEldritchLoreDescription: "Відкрийте послідовності, зілля та реліквії, приховані в тумані.",
            featureVictorianCraftTitle: "Вікторіанське Ремесло",
            featureVictorianCraftDescription: "Куйте годинникові механізми та містичні пристрої.",
            featureSecretSocietiesTitle: "Таємні Товариства",
            featureSecretSocietiesDescription: "Присягніть на вірність і підніміться по рангах.",
            newsEyebrow: "Новини",
            newsTitle: "З-за Туману",
            newsSubtitle: "Оновлення та повідомлення від Вічної Ночі.",
            pinnedNewsEyebrow: "Важливе",
            pinnedNewsTitle: "Закріплені Оголошення",
            pinnedNewsSubtitle: "Важливі довготривалі оновлення та оголошення.",
            pinnedNews: "Закріплено",
            loadMorePinned: "Показати більше закріплених",
            readMore: "Читати далі",
            loadAdditional: "Показати більше",
        },

        // Hero Section
        serverName: "Містеррія",
        heroSubtitle:
            "Зануртесь у містичний світ\nвсесвіту Lord of the Mysteries\nде шляхи та давні таємниці чекають",
        joinServer: "Приєднатися",
        lorePathways: "Лор і Шляхи",
        versionInfo: "1.21.8 · Minecraft: Java Edition · Ліцензія не обов'язкова",

        // Main Description
        welcomeTitle: "ВІТАЄМО У МІСТЕРРІЇ",
        welcomeQuote:
            '"Це не просто сервер... Це Книга, що сама пише себе у головах гравців."',
        mainDescription:
            "Містеррія — унікальний український RPG-сервер, створений за мотивами Lord of the Mysteries. Кожен аспект геймплею занурює тебе у світ Туману, Бейондерів та Послідовностей. Тут магія — не ефект, а наука і шлях з обмеженнями та ціною.",

        // Gameplay Features
        gameplayTitle: "Основа геймплею",
        gameplayFeatures: [
            "Ти — Потойбічний, що крокує власною Послідовністю",
            "Астральний світ, Вимір Духів, Духовна Сутність — це більше ніж слова",
            "Інгредієнти потрібно знаходити, здобувати або торгувати ними",
            "Зілля готуються за реальними алхімічними процесами",
            "Мобів не просто вбити — кожен із них має свою тактику",
        ],

        // Guides Section
        guidesTitle: "Гайди та допомога",
        guidesFeatures: [
            "На сайті міститься багато детальних гайдів",
            "Інші гравці можуть пояснити механіки, але доведеться питати",
            "Вивчення — частина гри. У Містеррії незнання = небезпека",
        ],

        // What Awaits
        awaitsTitle: "Що на тебе чекає?",
        awaitsFeatures: [
            "Система Послідовностей з 9 до 0 рівня",
            "Унікальні зілля, ритуали, покликання духів",
            "Власні моби, події, таємниці та світогляд",
            "Взаємодія з іншими через інтригуючі події",
            "Поступове оновлення і розширення",
        ],

        finalMessage:
            "Грайте не для того, щоб «виграти». Грайте, щоб вижити і відкрити істину.",

        // Authentication
        login: "Увійти",
        logout: "Вийти",
        loginWithDiscord: "Увійти через Discord",
        profile: "Профіль",
        welcome: "Ласкаво просимо",
        processing: "Обробка...",
        secureLoginDisclaimer: "Безпечний вхід через Discord - ваша конфіденційність захищена",

        // Shop
        shop: "Крамниця",
        purchase: "Придбати",
        buy: "Купити",
        price: "Ціна",
        item: "Предмет",
        items: "Предмети",
        subscription: "Підписка",
        subscriptions: "Підписки",
        balance: "Баланс",
        coins: "Монети",

        // Profile
        personalInfo: "Особиста інформація",
        serverInfo: "Інформація про сервер",
        transactions: "Транзакції",
        transactionHistoryTitle: "Історія транзакцій",
        moderation: "Модерація",
        verification: "Верифікація",
        nickname: "Нікнейм",
        discordTag: "Discord тег",
        joinedDate: "Дата приєднання",
        lastSeen: "Останній візит",
        playTime: "Час гри",

        // General UI
        close: "Закрити",
        save: "Зберегти",
        cancel: "Скасувати",
        confirm: "Підтвердити",
        loading: "Завантаження",
        error: "Помилка",
        success: "Успіх",
        back: "Назад",
        next: "Далі",
        previous: "Попередній",

        // Stats
        online: "Онлайн",
        offline: "Офлайн",
        players: "Гравці",
        statistics: "Статистика",

        // Footer
        rights: "Всі права захищені",
        copyright: "© 2025 ~",

        // Notifications
        copyError: "Не вдалося скопіювати",
        errorDetailsClickToCopy: "Натисніть щоб скопіювати детальну інформацію для адміністратора",
        errorDetailsCopied: "Інформацію про помилку скопійовано в буфер обміну",
        errorDetailsFailedToCopy: "Не вдалося скопіювати інформацію",
        errorLabel: "Помилка",
        messageLabel: "Повідомлення",
        timeLabel: "Час",
        requestIdLabel: "ID запиту",
        urlLabel: "URL",
        requestParamsLabel: "Параметри запиту",
        requestDataLabel: "Дані запиту",
        additionalInfoLabel: "Додаткова інформація",
        errorDetailsFooter: "Будь ласка, надайте цю інформацію адміністратору для швидшого вирішення проблеми.",

        // Common Actions
        edit: "Редагувати",
        delete: "Видалити",
        view: "Переглянути",
        search: "Пошук",
        filter: "Фільтр",
        sort: "Сортувати",

        // Profile Additional
        role: "Роль",
        verified: "Підтверджено",
        notVerified: "Не підтверджено",
        unknown: "Невідомо",

        // Home Stats
        stableOnline: "Стабільного\nонлайну",
        uniqueContent: "Унікального\nконтенту",
        serverAge: "Існування\nсервера",

        // 404 Page
        pageNotFoundTitle: "Ой! Схоже, ви заблукали...",
        pageNotFoundMessage:
            "На жаль, сторінку, яку ви шукаєте, не знайдено. Але не хвилюйтеся, ви завжди можете повернутися назад.",
        goBack: "Повернутись",

        // Additional UI
        myProfile: "Мій профіль",
        accountVerification: "Верифікація акаунту",
        verifyMinecraftAccount: "Верифікація Minecraft акаунту",
        unavailable: "Недоступно",

        // Verification Panel
        verificationDescription:
            "Щоб підтвердити свій Minecraft акаунт, згенеруйте код нижче і введіть команду <code>/verify &lt;код&gt;</code> на сервері.",
        generating: "Генерую...",
        generateCode: "Згенерувати код",
        yourVerificationCode: "Ваш код верифікації:",
        codeValidUntil: "Код дійсний до:",
        enterOnServer: "Введіть на сервері:",
        verificationCodeGenerated: "Код верифікації згенеровано!",
        verificationCodeError: "Помилка при генеруванні коду верифікації",

        // Shop
        processing2: "Обробка...",

        // Language Switcher
        changeLanguage: "Змінити мову",

        // Player Stats Dashboard
        networkStatistics: "Статистика Мережі",
        newPlayers24h: "Нові (24г)",
        avgPlaytime: "Сер. час гри",
        playersOnline: "Гравці Онлайн",
        topPlayers: "Топ гравці",
        hourlyActivity: "Активність по годинах",
        allServers: "Всі сервери",
        onlinePlayersChart: "Онлайн гравці",
        unknownPlayer: "Невідомий гравець",
        failedToLoadHourlyData: "Не вдалося завантажити погодинні дані",
        failedToLoadSummary: "Не вдалося завантажити зводку",
        unknownError: "Невідома помилка",
        server: "Сервер",
        selectServer: "Виберіть сервер...",

        // Transaction History
        loading2: "Завантаження...",
        loadMore: "Завантажити більше",
        errorLoadingTransactionHistory:
            "Помилка при завантаженні історії транзакцій",
        transactionHistory: {
            allTypes: "Всі типи",
            loading: "Завантаження історії транзакцій...",
            noTransactions: "Історія транзакцій порожня",
            noFilterResults: "Не знайдено транзакцій для обраного фільтра: {filter}",
            noTransactionsDescription: "Ваша історія транзакцій з'явиться тут після першої транзакції.",
            details: "Деталі",
        },
        transactionTypes: {
            PURCHASE: "Покупка",
            DONATION: "Донат",
            VOTE_REWARD: "Винагорода за голос",
            ADMIN_ADJUST: "Корегування адміна",
            REFUND: "Повернення",
            SUBSCRIPTION: "Підписка",
            PENALTY: "Штраф",
            REWARD: "Нагорода",
        },

        // Server Info & Profile
        magicPath: "Шлях магії на сервері",
        residence: "Місце проживання на сервері",
        serverInformation: "Серверна інформація:",
        loadingServerData: "Завантаження серверних даних...",
        timePlayedTitle: "Час, який провели на сервері",
        timePlayed: "Часу награно",
        magicPathTitle: "Шлях магії на сервері",
        magicPathLabel: "Шлях магії",
        residenceTitle: "Місце проживання на сервері",
        livesIn: "Проживає в",
        magicLevel: "Рівень магії",
        experienceLevel: "Рівень досвіду",
        criminalRecords: "Судимостей",
        warnings: "Попереджень",

        // Moderation Panel
        warn: "Видати попередження",
        mute: "Замутити гравця",
        ban: "Забанити гравця",
        forever: "Назавжди",
        unknownUser: "Невідомо",
        failedToGetCurrentUser: "Не вдалося визначити поточного користувача",
        unknownError2: "Невідома помилка",

        // Modal and UI
        yes: "Так",
        no: "Ні",
        topUp: "Поповнити",
        purchaseCancelled: "Покупку скасовано",
        nicknameCannotBeEmpty: "Нікнейм не може бути порожнім",
        nicknameSavedSuccessfully: "Нікнейм успішно збережено!",
        noResultsFound: "Нічого не знайдено",
        selectOption: "Виберіть опцію...",

        // Shop Confirmations
        insufficientFundsMessage:
            "Недостатньо коштів для покупки. Чи не бажаєте ви поповнити на",
        confirmPurchaseMessage: "Ви впевнені, що хочете придбати цей товар?",
        shopLoginRequired:
            "Увійдіть у свій обліковий запис, щоб мати доступ до Крамниці!",
        profileSetupRequired: "Будь ласка, підтвердіть свій акаунт і налаштуйте профіль для здійснення покупок",
        itemNotFound: "Товар не знайдено",
        itemNotAvailable: "Цей товар наразі недоступний для покупки",

        // Shop Categories
        shopCategoryItems: "Предмети",
        shopCategoryItemsDesc: "Ігрові предмети та спорядження",
        shopCategoryPermissions: "Дозволи",
        shopCategoryPermissionsDesc: "Спеціальні дозволи та здібності",
        shopCategorySubscriptions: "Підписки",
        shopCategorySubscriptionsDesc: "Регулярні преміум послуги",
        shopCategoryDiscordRoles: "Discord Ролі",
        shopCategoryDiscordRolesDesc: "Ролі Discord сервера та переваги",
        shopCategoryCosmetics: "Косметика",
        shopCategoryCosmeticsDesc: "Косметичні предмети та налаштування зовнішності",
        shopCategoryAppeals: "Апеляції",
        shopCategoryAppealsDesc: "Апеляції щодо банів та відновлення акаунтів",
        shopCategoryOther: "Інше",
        shopCategoryOtherDesc: "Різноманітні послуги",

        // Shop UI
        shopEyebrow: "Крамниця",
        shopTitle: "Товари Вічної Ночі",
        shopSubtitle: "Чисто, елегантно та справедливо. Ваша підтримка підтримує вогні міста.",
        shopLoading: "Завантаження крамниці...",
        shopLoadFailed: "Не вдалося завантажити крамницю",
        tryAgain: "Спробувати знову",
        viewDetails: "Детальніше",

        // Service Types
        serviceTypeItem: "Предмет",
        serviceTypePermission: "Дозвіл",
        serviceTypeSubscription: "Підписка",
        serviceTypeDiscordRole: "Discord Роль",

        // Service Page
        loadingService: "Завантаження сервісу...",
        serviceNotFound: "Сервіс Не Знайдено",
        serviceNotFoundMessage: "Контент цього сервісу ще недоступний або був переміщений.",
        serviceContentNotCreated: "Детальна інформація для цього сервісу ще не була створена.",
        backToShop: "Назад до Крамниці",
        loginToPurchase: "Будь ласка, увійдіть в систему, щоб придбати цей сервіс",
        purchaseError: "Не вдалося підготувати покупку",
        purchaseSuccess: "Покупка успішна!",

        // Shop Account Setup
        accountSetupRequired: "Потрібно підтвердити акаунт",
        shopAccessDescription:
            "Для доступу до крамниці спочатку потрібно встановити ваш Minecraft нікнейм. Це допоможе нам зв'язати ваш акаунт з Discord та забезпечити коректну роботу крамниці.",
        profileSetupInstructions:
            "Перейдіть на сторінку профілю, щоб створити код підтвердження та прив'язати ваш Minecraft акаунт.",
        selectServerForItem: "Оберіть сервер для отримання товару:",

        // Unauthorized Message
        authenticationRequired: "Необхідна автентифікація",
        accessExclusiveItems: "Доступ до ексклюзивних товарів",
        manageYourBalance: "Керування вашим балансом",

        // Game Guide Page
        gameGuideTitle: "Посібник з Початку Гри",
        gameGuideSubtitle:
            "Все, що потрібно знати, щоб розпочати свою подорож у Містеррії",

        // Server Connection
        serverConnectionTitle: "Підключення до Сервера",
        serverConnectionDescription:
            "Приєднайтеся до нашого Minecraft сервера, щоб розпочати пригоди у всесвіті Lord of the Mysteries.",
        serverIP: "IP Сервера",
        serverAddress: "mc.mysterria.net",
        copyToClipboard: "Скопіювати у буфер",
        copyIP: "Скопіювати IP",
        copySuccess: "Скопійовано!",
        serverVersion: "Версія",
        minecraftVersion: "1.21.8",
        serverEdition: "Java Edition",
        modsRequired: "Моди Потрібні",
        noModsRequired: "Не потрібні (Опціонально)",
        serverType: "Тип Сервера",
        rpgServer: "RPG/Рольова гра",
        serverScreenshotPlaceholder: "Тут буде розміщено скріншот лобі сервера",

        // Lore & Anime
        loreAnimeTitle: "Розуміння Світу",
        loreAnimeDescription:
            "Перед зануренням у гру ми настійно рекомендуємо ознайомитися з оригінальним матеріалом.",
        webNovelTitle: "Веб-Новела",
        webNovelDescription:
            "Прочитайте оригінальну веб-новелу Lord of the Mysteries для кращого розуміння світу.",
        readWebNovel: "Читати Веб-Новелу",
        animeTitle: "Аніме Серіал",
        animeDescription:
            "Дивіться аніме адаптацію, що зараз виходить, для візуального розповідання.",
        watchAnime: "Дивитися Аніме",
        loreImagePlaceholder: "Тут буде розміщено ілюстрації Lord of the Mysteries",

        // Harmoniya Launcher
        launcherTitle: "Лаунчер Harmoniya",
        launcherDescription:
            "Наш власний лаунчер з попередньо налаштованим модпаком для найкращого досвіду на сервері.",
        launcherFeature1: "Попередньо встановлений модпак сервера",
        launcherFeature2: "Автоматичні оновлення та налаштування",
        launcherFeature3: "Опціонально - моди не обов'язкові для гри",
        launcherFeature4: "Авто-логін на сервер, не потрібно вводити пароль",
        launcherFeature5:
            "Попередньо встановлені клієнтські моди для розширеної підтримки системи Магії",
        downloadLauncher: "Завантажити Лаунчер",
        launcherScreenshotPlaceholder:
            "Тут буде розміщено скріншот інтерфейсу лаунчера",

        // Rules
        rulesDescription: "Ознайомтеся з правилами нашого сервера перед грою.",
        readRules: "Читати Правила Сервера",
        rulesImagePlaceholder: "Тут буде розміщено ілюстрацію правил",
        mainRuleConcepts: "Основні Концепції Правил",
        ruleConcepts: [
            "Заборона токсичності, спаму та психологічного хаосу",
            "Російська мова заборонена в текстових каналах",
            "Заборона NSFW контенту та заборонених символів",
            "Заборона читів, хаків та експлойтів",
            "Повага до чужого майна - заборона гріферства",
        ],

        // Discord Guild
        discordTitle: "Приєднуйтесь до Discord",
        discordDescription:
            "Спілкуйтеся зі спільнотою, отримуйте допомогу, беріть участь у подіях та слідкуйте за новинами сервера.",
        discordBenefits: [
            "Отримуйте допомогу від досвідчених гравців та персоналу",
            "Беріть участь у спільнотних подіях та роздачах",
            "Слідкуйте за новинами та оголошеннями сервера",
            "Знаходьте товаришів для пригод та квестів",
            "Отримуйте доступ до ексклюзивного Discord контенту",
        ],
        joinDiscord: "Приєднатися до Discord",
        discordImagePlaceholder: "Тут буде розміщено скріншот Discord сервера",

        // Profile & Verification
        profileTitle: "Налаштування Профілю",
        profileDescription:
            "Зв'яжіть свій Minecraft акаунт з Discord для верифікації та доступу до всіх функцій сервера.",
        verificationStep1: "Відвідайте сторінку свого профілю",
        verificationStep2: "Згенеруйте код верифікації",
        verificationStep3: "Використайте команду /verify <код> у грі",
        goToProfile: "Перейти до Профілю",
        profileImagePlaceholder: "Тут буде розміщено скріншот налаштування профілю",

        // Quick Tips
        quickTipsTitle: "Швидкі Поради для Нових Гравців",
        quickTips: [
            "Почніть з читання лору, щоб зрозуміти шляхи Потойбічних та послідовності",
            "Приєднайтеся до Discord, щоб спілкуватися з іншими гравцями та отримувати допомогу",
            "Відвідайте зону спавну, щоб знайти посібники для початківців та туторіали",
            "Задавайте питання в чаті - спільнота дружньо ставиться до новачків",
            "Не поспішайте дослідити та вивчити власні механіки",
            "Пам'ятайте: це RPG сервер, зосереджений на зануренні та рольовій грі",
            "Перевірте вікі проекту для детальних гайдів та ігрових механік",
            "Будьте поважливими та дружніми - допоможіть створити гостинну спільноту для всіх",
        ],

        // Bottom CTA
        readyToStart: "Готові Розпочати Свою Подорож?",
        readyToStartDescription:
            "Налаштуйте свій профіль та перегляньте правила, щоб почати свій шлях як Потойбічний.",
        setupProfile: "Налаштувати Профіль",
        reviewRules: "Переглянути Правила",

        // Guide Steps
        guideStep1Title: "Скопіювати IP",
        guideStep1Description: "Скопіювати адресу сервера",
        guideStep2Title: "Додати Сервер",
        guideStep2Description: "Додати сервер Містеррії",
        guideStep3Title: "Приєднатися",
        guideStep3Description: "Підключитися до сервера",
        guideStep4Title: "Верифікація",
        guideStep4Description: "Підтвердити акаунт",
        guideStep5Title: "Увійти у Світ",
        guideStep5Description: "Покинути лобі",
        guideStep6Title: "Вивчити Лор",
        guideStep6Description: "Дізнатися про Потойбічних",
        guideStep7Title: "Почати Гру",
        guideStep7Description: "Розпочати пригоди",
        guideStep8Title: "Лаунчер Harmoniya",
        guideStep8Description: "Опціональний клієнт",

        // Common UI
        optional: "Опціонально",
        launcherBenefits: "Переваги Лаунчера",

        // Guide Step Content - Full Titles and Descriptions
        guideStep1FullTitle: "Скопіювати IP адресу сервера",
        guideStep1FullDescription: "Спочатку скопіюйте IP адресу нашого сервера для підключення до Містеррії.",
        guideStep2FullTitle: "Додати сервер Містеррії",
        guideStep2FullDescription: "Додайте наш сервер до списку серверів, використовуючи скопійовану IP адресу.",
        guideStep3FullTitle: "Приєднатися до сервера",
        guideStep3FullDescription: "Підключіться до Містеррії, приєднавшись до щойно доданого сервера.",
        guideStep4FullTitle: "Підтвердити ваш акаунт",
        guideStep4FullDescription: "Отримайте код верифікації з вашого профілю та підтвердіть в грі.",
        guideStep5FullTitle: "Увійти у відкритий світ",
        guideStep5FullDescription: "Покиньте область лобі та увійдіть у основний ігровий світ, щоб розпочати пригоди.",
        guideStep6FullTitle: "Дізнатися про Потойбічних",
        guideStep6FullDescription: "Прочитайте нашу вікі, щоб зрозуміти містичну систему Потойбічних та як прогресувати.",
        guideStep7FullTitle: "Почніть свою пригоду!",
        guideStep7FullDescription: "Все готово! Розпочніть свою подорож у містичному світі Містеррії.",

        // Guide Step Instructions
        guideStep2Instruction1: "Натисніть \"Додати сервер\" в меню мультиплеєра",
        guideStep2Instruction2: "Введіть \"Mysteria\" як назву сервера",
        guideStep2Instruction3: "Вставте IP сервера в поле адреси",
        guideStep2Instruction4: "Натисніть \"Готово\", щоб зберегти сервер",

        guideStep3Instruction1: "Виберіть \"Mysteria\" зі списку серверів",
        guideStep3Instruction2: "Натисніть \"Приєднатися до сервера\" для підключення",
        guideStep3Instruction3: "Дочекайтеся встановлення з'єднання",
        guideStep3Instruction4: "Прийміть ресурс-пак сервера при запиті",

        guideStep4Instruction1: "Відвідайте сторінку вашого профілю на нашому сайті",
        guideStep4Instruction2: "Скопіюйте ваш код верифікації",
        guideStep4Instruction3: "Введіть код у чат: /verify [код]",
        guideStep4Instruction4: "Дочекайтеся підтвердження верифікації",

        guideStep5Instruction1: "Знайдіть портал світу в лобі",
        guideStep5Instruction2: "Клікніть правою кнопкою або пройдіть крізь портал",
        guideStep5Instruction3: "Виберіть вашу початкову локацію",
        guideStep5Instruction4: "Починайте досліджувати містичний світ",

        // Guide Step 6 - Lore Content
        guideStep6LoreTitle1: "Розуміння Шляхів",
        guideStep6LoreDesc1: "Дізнайтеся про 22 містичні шляхи та їх унікальні здібності",
        guideStep6LoreTitle2: "Система Зілля",
        guideStep6LoreDesc2: "Відкрийте, як прогресувати через послідовності за допомогою зілля",
        guideStep6LoreTitle3: "Містичні Предмети",
        guideStep6LoreDesc3: "Досліджуйте різноманітні артефакти та їх надприродні сили",

        // Guide Step 7 - Final Tips
        guideStep7JourneyTitle: "Ваша подорож починається тут",
        guideStep7Tip1: "Почніть як смертний і пробивайтеся вгору містичними послідовностями",
        guideStep7Tip2: "Обирайте свій шлях обережно - кожен має унікальні здібності",
        guideStep7Tip3: "Приєднуйтесь до нашої Discord спільноти для допомоги та рольової гри",
        guideStep7Tip4: "Прочитайте правила, щоб зрозуміти наші рекомендації з рольової гри",

        // Image Placeholders
        guideStep1ImagePlaceholder: "Заповнювач скріншота копіювання IP",
        guideStep2ImagePlaceholder: "Заповнювач скріншота додавання сервера",
        guideStep3ImagePlaceholder: "Заповнювач скріншота приєднання до сервера",
        guideStep4ImagePlaceholder: "Заповнювач скріншота верифікації акаунту",
        guideStep5ImagePlaceholder: "Заповнювач скріншота порталу світу",
        guideStep6ImagePlaceholder: "Заповнювач скріншота Вікі/Лору",
        guideStep7ImagePlaceholder: "Заповнювач скріншота геймплею",

        // Wiki Page
        wikiEyebrow: "Вікі",
        wikiTitle: "Компендіум Знань",
        wikiSubtitle: "Відкрийте таємниці та лор Містеррії",
        language: "Мова",
        category: "Категорія",
        allCategories: "Всі Категорії",
        searchWikiPlaceholder: "Пошук по вікі...",
        clearSearch: "Очистити пошук",
        searchResults: "Знайдено {count} результатів для \"{query}\"",
        categoryResults: "Показано {count} сторінок в {category}",
        totalPages: "Всього сторінок: {count}",
        failedToLoadPages: "Не вдалося завантажити сторінки",
        noPagesFound: "Сторінки не знайдено",
        noSearchResults: "Не знайдено сторінок за вашим запитом",
        noCategoryPages: "Не знайдено сторінок в цій категорії",
        noWikiPages: "Вікі сторінки недоступні",
        showAllPages: "Показати Всі Сторінки",

        // Guide Page
        guideEyebrow: "Гайд",
        guideTitle: "Увійдіть у Туман",
        guideSubtitle: "Ваш повний посібник з виживання в таємницях Містеррії.",
        gettingStartedSectionTitle: "Початок",
        firstStepsTitle: "Перші кроки",
        firstStepsDescription: "Приєднуйтесь до сервера за адресою mc.mysterria.net і почніть свою подорож у світ таємниць.",
        characterCreationTitle: "Створення персонажа",
        characterCreationDescription: "Оберіть свій початковий шлях і почніть підніматися містичними послідовностями.",
        sequencesPathwaysSectionTitle: "Послідовності та Шляхи",
        foolPathwayTitle: "Шлях Блазня",
        foolPathwayDescription: "Опануйте ворожіння, ілюзії та силу маніпулювати самою долею.",
        hunterPathwayTitle: "Шлях Мисливця",
        hunterPathwayDescription: "Відзначтеся в бою, відстеженні та надприродних здібностях стрільби.",
        seerPathwayTitle: "Шлях Провидця",
        seerPathwayDescription: "Отримайте передбачення, пророцтва та здатність заглядати крізь час.",
        secretOrganizationsSectionTitle: "Таємні Організації",
        tarotClubTitle: "Клуб Таро",
        tarotClubDescription: "Таємниче зібрання над сірим туманом, де учасники обмінюються знаннями та послугами.",
        churchOfEvernightGoddessTitle: "Церква Богині Вічної Ночі",
        churchOfEvernightGoddessDescription: "Одна з ортодоксальних церков, що підтримує порядок у надприродному світі.",
        mysticalCraftingSectionTitle: "Містичне Ремесло",
        potionMakingTitle: "Виготовлення зілля",
        potionMakingDescription: "Варіть зілля просування, щоб підніматися послідовностями та отримувати нові здібності.",
        sealedArtifactsTitle: "Запечатані Артефакти",
        sealedArtifactsDescription: "Відкривайте та використовуйте потужні, але небезпечні містичні предмети.",
        quickTipsForNewBeyondersTitle: "Швидкі поради для нових Потойбічних",
        quickTipsForNewBeyondersList: [
            "Завжди будьте обережні, маючи справу з надприродними явищами",
            "Знання можуть бути як силою, так і небезпекою - діліться мудро",
            "Приєднуйтесь або створюйте команду для небезпечних експедицій",
            "Підтримуйте свій прогрес стабільним - поспіх призводить до втрати контролю",
            "Туман приховує багато таємниць, але не всі з них призначені для розкриття",
        ],

        // Rules Page
        navRules: "Правила",
        rulesTitle: "Закони Містеррії",
        rulesSubtitle:
            '"Той, хто входить у Місто Туману, зобов\'язаний коритись Законам Містеррії. Порушники будуть прокляті самою Сутністю..."',
        tableOfContents: "Зміст",
        staffRules: "Правила Персоналу",
        examples: "Приклади",
        playerRules: "Правила Гравців",
        mainRule: "Основне правило",
        mainRuleDescription:
            "Участь у сервері означає автоматичну згоду з нижченаведеним. Незнання не звільняє від відповідальності. А покарання вас завжди знайде.",
        rulesSection: {
            "1.1": {
                title: "Психологічний хаос",
                description:
                    "Токсичність, неадекват, флуд, спам, шантаж — неприйнятні. Місто не терпить божевілля поза Контролем.",
            },
            "1.2": {
                title: "Язик Ворога",
                description:
                    "Будь-який прояв російської мови в текстових каналах заборонений. У голосових каналах - на розсуд його власника.",
            },
            "1.3": {
                title: "Заборонені Артефакти",
                description:
                    "NSFW / 18+ контент, символіка війни, терористичні чи культові знаки — миттєво знищуються Церквою Сонця.",
            },
            "1.4": {
                title: "Нелюдське слово",
                description:
                    "Расизм, сексизм, шовінізм — неприпустимі. Лише росіяни позбавлені захисту моралі.",
            },
            "1.5": {
                title: "Несанкціоноване проникнення",
                description:
                    "Будь-яка реклама без дозволу — акт Вторгнення. Це стосується навіть ПП.",
            },
            "1.6": {
                title: "Порушення Завіси",
                description:
                    "Розголошення особистої інформації — навіть у приваті — карається вигнанням.",
            },
            "1.7": {
                title: "Словесна магія",
                description:
                    "Надмірна нецензурна лексика виснажує твою душу. Кожне слово — це ритуал. Користуйся з розумом.",
            },
            "1.8": {
                title: "Обряд без вівтаря",
                description:
                    "Пиши тільки в каналі, призначеному для цього. Оффтоп — це магія без наслідків, але з покаранням.",
            },
            "1.9": {
                title: "Порожні оболонки",
                description:
                    "Твінки, другі акаунти — заборонені. Арканічна підміна особистості — злочин.",
            },
            "1.10": {
                title: "Фальшивий Лицар",
                description:
                    "Видавання себе за адміністрацію чи обман гравців — вічне мовчання у Тумані.",
            },
            "1.11": {
                title: "Ритуали Підбурювання",
                description:
                    "Провокація інших до порушень — занурення в Прірву. Ти відповідаєш не тільки за дії, а й за вплив.",
            },
            "1.12": {
                title: "Сіячі Хаосу",
                description:
                    "Створення конфліктів, нагнітання негативу — ритуали зворотної дії. Наслідки приходять раніше, ніж ти напишеш вибач...",
            },
        },

        // Minecraft Rules
        minecraftRulesTitle: "Арканічний Кодекс",
        minecraftRulesSubtitle:
            '"Мирні землі Містеррії захищені не стінами, а Законами. Поруш їх — і Сутність обернеться проти тебе..."',
        soulAgreement: "Угода Душі",
        soulAgreementDescription:
            "Граючи на сервері, ти автоматично погоджуєшся з Кодексом. Незнання правил не знімає відповідальності. Кара завжди знайде свого адресата.",
        minecraftRulesSection: {
            "2.1": {
                title: "Заборонені Модифікатори",
                description:
                    "Барітон, Х-Ray, автокліки, мультиакаунти — магія поза Балансом. Її ціна — вигнання.",
            },
            "2.2": {
                title: "Порушення Простору",
                description:
                    "Гріферство, псування ландшафту, крадіжка — вторгнення в чужу реальність. Місто цього не пробачає.",
            },
            "2.3": {
                title: "Наруга над Домівкою",
                description:
                    "Заважання на чужій території без згоди — ритуал недовіри. Не вступай на землю без запрошення.",
            },
            "2.4": {
                title: "Злом Тканини Світу",
                description:
                    "Лаг-машини, дюпи, експлойти — дослідження Забороненого. І це має ціну. Фатальну.",
            },
            "2.5": {
                title: "Профанація Реліквій",
                description:
                    "Руйнування скринь у данжах — осквернення храмів. Релутінг існує — залиш іншим шанс на здобич.",
            },
            "2.6": {
                title: "Виклик Хаосу",
                description:
                    "Провокації на порушення правил — шепіт Демона в серце іншого. За це кара подвійна.",
            },
            "2.7": {
                title: "Бій Без Згоди",
                description:
                    "Убивство, псування броні, використання магії — лише за взаємної згоди. Інакше — це напад.",
            },
            "2.8": {
                title: "Війна Без Пророцтва",
                description:
                    "Командні бої (війни) — лише з дозволу адмінів. Без пророцтва — лише різанина.",
            },
            "2.9": {
                title: "Осквернення Ефіру",
                description:
                    "Реклама, NSFW, терористична символіка — забруднення Ефіру. Не буде прощення.",
            },
            "2.10": {
                title: "Несанкціоновані Оселення",
                description:
                    "Заборонено будувати ближче 300 блоків від Спавну без дозволу Арканіста. Координація — ключ.",
            },
            "2.13": {
                title: "Угода з Демоном",
                description:
                    "Продаж речей за реальні гроші — контракт із Безоднею. А вона завжди бере своє.",
            },
        },
    },
};

export function useI18n() {
    const setLanguage = (lang: Language) => {
        currentLanguage.value = lang;
        localStorage.setItem("mysterria-language", lang);
    };

    const t = (key: string): string => {
        const keys = key.split(".");
        let value: unknown = translations[currentLanguage.value];

        for (const k of keys) {
            if (value && typeof value === "object" && k in value) {
                value = (value as Record<string, unknown>)[k];
            } else {
                return key;
            }
        }

        if (typeof value === "string") {
            return value;
        } else if (Array.isArray(value)) {
            return value.join(" ");
        }

        return key;
    };

    const tArray = (key: string): string[] => {
        const keys = key.split(".");
        let value: unknown = translations[currentLanguage.value];

        for (const k of keys) {
            if (value && typeof value === "object" && k in value) {
                value = (value as Record<string, unknown>)[k];
            } else {
                return [];
            }
        }

        return Array.isArray(value) ? value : [];
    };

    // Initialize from localStorage
    const savedLang = localStorage.getItem("mysterria-language") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "uk")) {
        currentLanguage.value = savedLang;
    }

    return {
        currentLanguage: computed(() => currentLanguage.value),
        setLanguage,
        t,
        tArray,
    };
}

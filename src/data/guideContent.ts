export type GuideLanguage = "en" | "uk";

export type GuideCategory = "start" | "progression" | "world" | "community" | "help";

export interface GuideFact {
    label: string;
    value: string;
    note: string;
}

export interface GuideExpectation {
    icon: string;
    title: string;
    summary: string;
    detail: string;
}

export interface GuideTask {
    icon: string;
    title: string;
    description: string;
    topicId: string;
}

export interface GuideStep {
    title: string;
    description: string;
    topicId?: string;
}

export interface GuideChoice {
    name: string;
    eyebrow: string;
    benefit: string;
    cost: string;
    bestFor: string;
    recommended?: boolean;
}

export interface GuideDirection {
    icon: string;
    title: string;
    eyebrow: string;
    description: string;
    points: string[];
    topicId: string;
}

export interface GuideCommand {
    command: string;
    purpose: string;
}

export interface GuideTopicSection {
    title: string;
    paragraphs?: string[];
    bullets?: string[];
    steps?: string[];
    warning?: string;
    tip?: string;
    commands?: GuideCommand[];
}

export interface GuideTopic {
    id: string;
    category: GuideCategory;
    icon: string;
    title: string;
    shortTitle: string;
    summary: string;
    answer: string;
    tags: string[];
    sections: GuideTopicSection[];
    related: string[];
}

export interface GuideContent {
    ui: {
        eyebrow: string;
        title: string;
        lede: string;
        serverAddress: string;
        copyAddress: string;
        copied: string;
        startJourney: string;
        findAnswer: string;
        quickFactsLabel: string;
        expectationsEyebrow: string;
        expectationsTitle: string;
        expectationsLede: string;
        tasksEyebrow: string;
        tasksTitle: string;
        tasksLede: string;
        searchPlaceholder: string;
        clearSearch: string;
        searchResults: string;
        noResults: string;
        noResultsHint: string;
        firstHourEyebrow: string;
        firstHourTitle: string;
        firstHourLede: string;
        openStep: string;
        starterEyebrow: string;
        starterTitle: string;
        starterLede: string;
        benefit: string;
        cost: string;
        bestFor: string;
        recommended: string;
        important: string;
        starterWarning: string;
        directionEyebrow: string;
        directionTitle: string;
        directionLede: string;
        browseEyebrow: string;
        browseTitle: string;
        browseLede: string;
        topics: string;
        popularEyebrow: string;
        popularTitle: string;
        openTopic: string;
        backToGuide: string;
        quickAnswer: string;
        onThisPage: string;
        relatedTopics: string;
        commonMistake: string;
        usefulTip: string;
        screenshotsLabel: string;
        screenshotIp: string;
        screenshotPortal: string;
        screenshotJoin: string;
        profileCta: string;
        pathwaysCta: string;
        fullRulesCta: string;
        supportCta: string;
        mobileBrowse: string;
    };
    facts: GuideFact[];
    expectations: GuideExpectation[];
    tasks: GuideTask[];
    firstHour: GuideStep[];
    starterChoices: GuideChoice[];
    directions: GuideDirection[];
    categories: Record<GuideCategory, string>;
    popularQuestions: Array<{ question: string; topicId: string }>;
    topics: GuideTopic[];
}

const en: GuideContent = {
    ui: {
        eyebrow: "NEW PLAYER HANDBOOK",
        title: "Your first steps through the Fog",
        lede: "Start playing in minutes, understand the choices that matter, and find a direct answer when Mysterria does something differently from ordinary Minecraft.",
        serverAddress: "SERVER ADDRESS",
        copyAddress: "Copy address",
        copied: "Copied",
        startJourney: "Start your first hour",
        findAnswer: "Find an answer",
        quickFactsLabel: "BEFORE YOU CONNECT",
        expectationsEyebrow: "MYSTERRIA IS DIFFERENT",
        expectationsTitle: "Know these before you settle",
        expectationsLede: "The server makes a few deliberate choices that surprise players coming from conventional survival servers.",
        tasksEyebrow: "QUICK HELP",
        tasksTitle: "What are you trying to do?",
        tasksLede: "Choose a goal or search in your own words. You will only see the information needed for that task.",
        searchPlaceholder: "Try “first potion”, “teleport home”, or “missing UI”…",
        clearSearch: "Clear",
        searchResults: "Matching answers",
        noResults: "No direct answer found",
        noResultsHint: "Try a shorter phrase, browse the topics below, or ask in Discord.",
        firstHourEyebrow: "FIRST HOUR",
        firstHourTitle: "From joining to your first real objective",
        firstHourLede: "This is the shortest reliable route from the server list to knowing what you should do next.",
        openStep: "See details",
        starterEyebrow: "ONE IMPORTANT DECISION",
        starterTitle: "Choose help, not your fate",
        starterLede: "The pathway selected in the newbie menu only aims your starter bonus. You may later drink a Sequence 9 potion from a completely different pathway.",
        benefit: "You receive",
        cost: "Permanent cost",
        bestFor: "Best for",
        recommended: "FULL POWER",
        important: "Important",
        starterWarning: "The bonus choice cannot normally be changed. Staff may reset a genuine mistake through a Discord ticket, but the confirmation should be treated as final.",
        directionEyebrow: "YOUR FIRST OBJECTIVE",
        directionTitle: "Pick a direction instead of wandering",
        directionLede: "Both approaches are valid, and neither locks you out of the other later.",
        browseEyebrow: "HANDBOOK",
        browseTitle: "Browse every major system",
        browseLede: "Advanced information stays out of your way until you need it.",
        topics: "topics",
        popularEyebrow: "ASKED OFTEN",
        popularTitle: "Popular player questions",
        openTopic: "Open guide",
        backToGuide: "Back to guide home",
        quickAnswer: "QUICK ANSWER",
        onThisPage: "ON THIS PAGE",
        relatedTopics: "Continue reading",
        commonMistake: "COMMON MISTAKE",
        usefulTip: "USEFUL TIP",
        screenshotsLabel: "WHAT YOU WILL SEE",
        screenshotIp: "Add the server address",
        screenshotPortal: "Choose Mysteries in the selector",
        screenshotJoin: "The server in your list",
        profileCta: "Open profile",
        pathwaysCta: "Explore pathways",
        fullRulesCta: "Read full rules",
        supportCta: "Ask in Discord",
        mobileBrowse: "Browse topics",
    },
    facts: [
        {label: "CLIENT", value: "Java recommended", note: "Bedrock works through Geyser with limited custom UI"},
        {label: "VERSION", value: "26.1.2+", note: "Use a current client if the resource pack fails"},
        {label: "REQUIRED", value: "Accept resource pack", note: "No client mods are required"},
    ],
    expectations: [
        {
            icon: "fa-solid fa-route",
            title: "There are no teleport commands",
            summary: "No /home, /spawn, /tpa, /rtp, or /back.",
            detail: "Distance is a strategic cost, and mobility is one of the rewards offered by pathways such as Door. Choose where you settle carefully.",
        },
        {
            icon: "fa-solid fa-hourglass-half",
            title: "Progression is deliberately long",
            summary: "Early Sequences take about a week; high tiers take months.",
            detail: "Mysterria is designed around a season-long journey, not reaching maximum power over a weekend.",
        },
        {
            icon: "fa-solid fa-rotate",
            title: "The world is seasonal",
            summary: "A full reset happens roughly every six months.",
            detail: "The reset includes Beyonder progress. It keeps the world healthy and means joining in the middle of a season is still worthwhile.",
        },
        {
            icon: "fa-solid fa-shield-halved",
            title: "Exploration is normally safe",
            summary: "Wilderness PvP is disabled and griefing is banned.",
            detail: "PvP only exists in announced zones, Cosmos Incursions, or town claims where an owner intentionally enables it.",
        },
        {
            icon: "fa-solid fa-box-open",
            title: "Vanilla chests are magical loot",
            summary: "Naturally generated chests refill over time.",
            detail: "Villages, mineshafts, temples, shipwrecks, bastions, and other structures are renewable Beyonder loot sources.",
        },
    ],
    tasks: [
        {
            icon: "fa-solid fa-plug",
            title: "Join the server",
            description: "Versions, resource pack, accounts, and verification.",
            topicId: "connect"
        },
        {
            icon: "fa-solid fa-scale-balanced",
            title: "Choose my starter bonus",
            description: "Understand Shortcut, Resolve, and what the pathway choice means.",
            topicId: "starter-choice"
        },
        {
            icon: "fa-solid fa-flask",
            title: "Become Sequence 9",
            description: "Recipe, cauldron, ingredients, brewing, and drinking.",
            topicId: "first-potion"
        },
        {
            icon: "fa-solid fa-box-open",
            title: "Find recipes or ingredients",
            description: "Loot chests, focusing, creatures, nodes, and trading.",
            topicId: "loot"
        },
        {
            icon: "fa-solid fa-arrow-trend-up",
            title: "Advance my Sequence",
            description: "Acting, rituals, Spirituality, Madness, and progression.",
            topicId: "progression"
        },
        {
            icon: "fa-solid fa-dungeon",
            title: "Find a dungeon",
            description: "Use /subspace, weaken Rifts, form a party, and understand cooldowns.",
            topicId: "activities"
        },
        {
            icon: "fa-solid fa-house-flag",
            title: "Join or build a town",
            description: "Protected land, group play, nations, and going solo.",
            topicId: "towns"
        },
        {
            icon: "fa-solid fa-wand-magic-sparkles",
            title: "Fix missing custom UI",
            description: "Resource-pack, client-version, and Bedrock limitations.",
            topicId: "troubleshooting"
        },
    ],
    firstHour: [
        {
            title: "Connect and accept the resource pack",
            description: "Add mc.mysterria.net, join Mysteries through the lobby selector, and accept the server pack.",
            topicId: "connect"
        },
        {
            title: "Register only if Minecraft asks",
            description: "Offline accounts use /register and /login. Official premium accounts are authenticated automatically.",
            topicId: "connect"
        },
        {
            title: "Verify your Minecraft account",
            description: "Generate a code on your profile, then enter it in the verification window shown in-game.",
            topicId: "connect"
        },
        {
            title: "Choose your starter bonus carefully",
            description: "The pathway is only a direction for your bonus. Shortcut and Resolve have very different long-term costs.",
            topicId: "starter-choice"
        },
        {
            title: "Choose town life or self-sufficiency",
            description: "Ask for a recruiting town, or begin a solo chest-running and exploration loop.",
            topicId: "towns"
        },
        {
            title: "Work toward your first potion",
            description: "Your first Sequence needs a recipe, cauldron, ingredients, successful brew, and nothing else.",
            topicId: "first-potion"
        },
    ],
    starterChoices: [
        {
            name: "Path of Shortcut",
            eyebrow: "PLAY WITH ABILITIES NOW",
            benefit: "Instant Sequence 9 in the selected pathway.",
            cost: "−10% maximum Spirituality forever, at every Sequence.",
            bestFor: "Players who value an immediate start more than maximum long-term power.",
        },
        {
            name: "Path of Resolve",
            eyebrow: "LEARN THE FULL LOOP",
            benefit: "The next loot chest is guaranteed to contain a recipe.",
            cost: "None.",
            bestFor: "Players who want to learn brewing and retain their full potential.",
            recommended: true,
        },
    ],
    directions: [
        {
            icon: "fa-solid fa-people-roof",
            title: "Join an established town",
            eyebrow: "LOWER FRICTION",
            description: "Ask in chat or Discord for a town accepting new members.",
            points: [
                "Share cauldrons, recipes, ingredients, and protected land.",
                "Find groups for Guardians, dungeons, Wild Beyonders, and Incursions.",
                "Use an established base network in a world without teleport commands.",
            ],
            topicId: "towns",
        },
        {
            icon: "fa-solid fa-compass",
            title: "Go solo",
            eyebrow: "SELF-DIRECTED",
            description: "Entirely viable, but slower and more dependent on exploration.",
            points: [
                "Open every generated chest; their Beyonder loot regenerates.",
                "Hunt Beyonder Creatures and note renewable resource nodes.",
                "Trade surplus materials and join groups when specific content calls for it.",
            ],
            topicId: "loot",
        },
    ],
    categories: {
        start: "Start here",
        progression: "Beyonder progression",
        world: "World and activities",
        community: "Economy and society",
        help: "Help and reference",
    },
    popularQuestions: [
        {question: "How do I teleport home?", topicId: "server-basics"},
        {question: "Why does the game look like vanilla?", topicId: "troubleshooting"},
        {question: "Did choosing a pathway lock me in?", topicId: "starter-choice"},
        {question: "How do I become Sequence 9?", topicId: "first-potion"},
        {question: "Where are the special loot chests?", topicId: "loot"},
        {question: "Why is my acting progress not moving?", topicId: "progression"},
        {question: "Can someone kill me while I explore?", topicId: "server-basics"},
        {question: "How do I locate a dungeon?", topicId: "activities"},
    ],
    topics: [
        {
            id: "connect",
            category: "start",
            icon: "fa-solid fa-plug",
            title: "Connect, register, and verify",
            shortTitle: "Connect and verify",
            summary: "Everything needed to reach Mysteries with the correct client and unlock your starter bonus.",
            answer: "Join mc.mysterria.net with a current Java client, accept the resource pack, select Mysteries in the lobby, and verify through your website profile.",
            tags: ["ip", "address", "join", "java", "bedrock", "geyser", "register", "login", "verify", "discord", "resource pack", "version", "premium", "offline"],
            sections: [
                {
                    title: "Server details",
                    bullets: [
                        "Address: mc.mysterria.net.",
                        "Supported versions: 26.1.2 and newer.",
                        "Java Edition is the fully supported experience; no client mods are required.",
                        "Bedrock can connect through Geyser, but pathway icons and some custom interfaces may render incorrectly.",
                    ],
                },
                {
                    title: "Connect",
                    steps: [
                        "Open Multiplayer, add mc.mysterria.net, and join the server.",
                        "Accept the server resource pack when Minecraft asks.",
                        "In the lobby server selector, choose Mysteries.",
                        "Read the lobby NPC dialogue before leaving; it contains useful orientation.",
                    ],
                    warning: "If everything looks like plain vanilla Minecraft, the resource pack was declined or the Java client is too old. Enable server resource packs and update the client.",
                },
                {
                    title: "Account registration",
                    paragraphs: [
                        "Official premium Minecraft accounts skip registration and log in automatically.",
                        "Offline accounts register once with /register <password> <password>, then use /login <password> on future joins.",
                    ],
                },
                {
                    title: "Discord verification",
                    steps: [
                        "Sign in on the Mysterria website and open your profile.",
                        "Generate a Minecraft verification code.",
                        "Enter the code in the verification window that appears in-game.",
                        "Once confirmed, the newbie pathway and starter-bonus menu becomes available.",
                    ],
                },
            ],
            related: ["starter-choice", "troubleshooting", "server-basics"],
        },
        {
            id: "server-basics",
            category: "start",
            icon: "fa-solid fa-map",
            title: "How the Mysterria world works",
            shortTitle: "World basics",
            summary: "Travel, safety, death, seasonal resets, and the rules that differ from conventional survival servers.",
            answer: "Mysterria is a bounded seasonal world where distance matters, wilderness exploration is safe, and naturally generated chests provide renewable magical loot.",
            tags: ["home", "spawn", "tpa", "rtp", "back", "teleport", "map", "pvp", "grief", "death", "keep inventory", "reset", "season", "world border", "safe"],
            sections: [
                {
                    title: "Map and travel",
                    paragraphs: ["The Overworld is bounded at 15,000 × 15,000 blocks. Nether and special dimensions exist, but most Beyonder content lives in the Overworld."],
                    warning: "There is no /home, /sethome, /spawn, /tpa, /rtp, or /back. This preserves the value of travel planning and mobility pathways such as Door.",
                },
                {
                    title: "Safety and PvP",
                    bullets: [
                        "Wilderness PvP is disabled by default.",
                        "PvP is limited to designated PvP areas and Cosmos Incursion zones.",
                        "Town owners can intentionally enable PvP for specific roles inside their claims.",
                        "Griefing is forbidden and town claims add land protection.",
                    ],
                },
                {
                    title: "Death",
                    paragraphs: ["Death otherwise follows vanilla rules: items drop and there is no keep-inventory. Beyonders also gain a small amount of temporary Madness."],
                    tip: "Only a player carrying a Uniqueness suffers the additional accommodation penalty. Ordinary players do not lose Sequence progress from normal death.",
                },
                {
                    title: "Seasonal resets",
                    paragraphs: ["Approximately every six months, the world and Beyonder progress reset. This keeps the map healthy and allows mid-season newcomers to compete without being permanently behind."],
                },
            ],
            related: ["towns", "activities", "progression"],
        },
        {
            id: "starter-choice",
            category: "start",
            icon: "fa-solid fa-scale-balanced",
            title: "The newbie pathway and starter bonus",
            shortTitle: "Starter choice",
            summary: "What the initial pathway selection actually changes, and the permanent trade-off between Shortcut and Resolve.",
            answer: "The pathway you select does not make you a Beyonder or lock your future pathway. It only aims one of two starter bonuses.",
            tags: ["newbie", "bonus", "shortcut", "resolve", "pathway", "locked", "repick", "magic", "sequence 9", "spirituality", "recipe guarantee"],
            sections: [
                {
                    title: "Your pathway is not locked",
                    paragraphs: [
                        "You become a pathway only when you drink its Sequence 9 potion. If the newbie menu says Fool but you later drink a Door potion, you become Door.",
                        "/magic is an optional suggestion menu. Seeing a pathway there does not prove you are already a Beyonder.",
                    ],
                },
                {
                    title: "Path of Shortcut",
                    paragraphs: ["You become Sequence 9 immediately without brewing, but permanently lose 10% of maximum Spirituality at every Sequence and acting level."],
                    warning: "The Spirituality penalty is permanent. It is not recovered by advancing or completing acting.",
                },
                {
                    title: "Path of Resolve",
                    paragraphs: ["Your recipe focusing counter is moved one step below its guarantee, so the very next natural loot chest contains a recipe. There is no permanent cost."],
                    tip: "Resolve teaches the normal recipe → cauldron → ingredients → brew loop and preserves full long-term power.",
                },
                {
                    title: "Confirmation and mistakes",
                    paragraphs: ["Players cannot repick after confirming. For a genuine new-player mistake, open a Discord ticket; staff sometimes provide a reset."],
                },
            ],
            related: ["first-potion", "progression", "connect"],
        },
        {
            id: "first-potion",
            category: "progression",
            icon: "fa-solid fa-flask",
            title: "Brew and drink your first potion",
            shortTitle: "First potion",
            summary: "The complete Sequence 9 recipe and brewing loop without community myths.",
            answer: "To reach Sequence 9: obtain a recipe, build a cauldron, gather its ingredients, brew successfully, and drink. Your first potion needs no acting, ritual, or Madness cost.",
            tags: ["sequence 9", "potion", "brew", "brewing", "cauldron", "recipe", "ingredient", "char", "ritual", "altar", "expire", "slots"],
            sections: [
                {
                    title: "What you need",
                    bullets: [
                        "A complete Sequence 9 recipe, or all of its different recipe pages.",
                        "A Magic Cauldron built from an Altar Scroll blueprint.",
                        "Pathway- and Sequence-specific main and supplementary ingredients.",
                        "Beyonder Chars may replace every main ingredient in a recipe at once.",
                    ],
                    warning: "Sacrificial Altars are for Boons, not potion brewing. Their blueprints resemble cauldron blueprints.",
                },
                {
                    title: "Brewing order",
                    steps: [
                        "Place main ingredients, or Beyonder Chars, in the left slots.",
                        "Place supplementary ingredients in the right slots.",
                        "Place the recipe in the centre slot.",
                        "Keep every item in the same order shown by the recipe.",
                        "On success, drink the potion to become Sequence 9.",
                    ],
                    tip: "Failed brewing does not consume ingredients. Higher-tier cauldrons improve success chance rather than reducing loss.",
                },
                {
                    title: "Ingredients",
                    bullets: [
                        "Foundable ingredients appear only in generated loot chests.",
                        "Droppable ingredients come only from Beyonder Creatures.",
                        "Mineable ingredients grow as distinct world nodes; right-click to harvest them.",
                    ],
                },
                {
                    title: "Potion expiration",
                    paragraphs: ["A potion lasts two real-time days from the moment it exists. Brew when you are ready to drink. An expired potion changes into a matching Sealed Artifact where possible, but it no longer provides the intended advancement."],
                },
            ],
            related: ["loot", "starter-choice", "progression"],
        },
        {
            id: "loot",
            category: "progression",
            icon: "fa-solid fa-box-open",
            title: "Find loot, recipes, and ingredients",
            shortTitle: "Loot and focusing",
            summary: "Where magical materials actually come from and how the focusing guarantee reduces bad luck.",
            answer: "Every naturally generated vanilla chest is a renewable Beyonder loot container. Open them repeatedly and focus the reward category you currently need.",
            tags: ["loot", "chest", "container", "recipe", "page", "ingredient", "altar scroll", "focus", "focusing", "pity", "guarantee", "wild beyonder", "creature", "node", "energy shard"],
            sections: [
                {
                    title: "Loot containers",
                    paragraphs: ["Village, mineshaft, dungeon, temple, shipwreck, buried-treasure, bastion, and ruined-portal chests all qualify. There is no special glowing Beyonder chest."],
                    tip: "Contents regenerate over time. Previously explored structures remain valuable and should be revisited.",
                },
                {
                    title: "Reward focusing",
                    paragraphs: ["Choose one of four categories: Potions, Recipes, Pages, or Altar Scrolls. Each eligible chest without that reward advances a visible counter; the threshold chest is guaranteed to contain it."],
                    warning: "Ingredients cannot be focused. They must be found in chests, taken from creatures, harvested from resource nodes, traded for, or converted through other systems.",
                },
                {
                    title: "Targeted acquisition",
                    bullets: [
                        "Trade with a peaceful Wild Beyonder for specific pathway goods.",
                        "Use /subspace and run dungeons for repeatable materials.",
                        "Hunt Beyonder Creatures for droppable ingredients and acting points.",
                        "Trade surplus ingredients to a professionless villager for Energy Shards.",
                        "Check the rotating Brilliant Emporium inventory.",
                    ],
                },
            ],
            related: ["first-potion", "activities", "economy"],
        },
        {
            id: "progression",
            category: "progression",
            icon: "fa-solid fa-arrow-trend-up",
            title: "Acting, rituals, Spirituality, and Madness",
            shortTitle: "Advancement",
            summary: "How progression after Sequence 9 works and where to inspect your current status.",
            answer: "After becoming a Beyonder, advancement combines acting from several sources, the next potion, and increasingly important rituals. Your complete status is inside the inventory pathway interface.",
            tags: ["acting", "digestion", "ritual", "spirituality", "mana", "madness", "mutation", "health", "stats", "status", "sequence", "advance", "bounty", "bottle"],
            sections: [
                {
                    title: "Check your character",
                    steps: [
                        "Open your inventory.",
                        "Click the pathway icon in the top-left corner.",
                        "Hover over your character's head in the interface.",
                    ],
                    tip: "This displays Sequence, acting and digestion, Spirituality, and Madness. There is no status command.",
                },
                {
                    title: "Acting and digestion",
                    paragraphs: ["Simply casting spells does not necessarily advance acting. Every ability has a specific acting method, and successful acting produces an action-bar notification."],
                    bullets: [
                        "Passive play and ability-specific acting methods.",
                        "Acting Bottles and rotating bounties.",
                        "Dungeon completion for PvE acting.",
                        "Cosmos Incursions for PvP acting.",
                    ],
                    warning: "No single acting source can reach 100% by itself. Combine several sources.",
                },
                {
                    title: "Rituals",
                    bullets: [
                        "Sequence 9 never requires a ritual.",
                        "For target Sequences 8–6, rituals are optional but skipping them adds permanent seasonal Madness.",
                        "At target Sequence 5 and above, the ritual is mandatory.",
                    ],
                },
                {
                    title: "Spirituality and Madness",
                    paragraphs: [
                        "Spirituality powers abilities and regenerates over time. Maximum Spirituality grows with Sequence and acting progress.",
                        "Madness has temporary, permanent, and raw components. Death and unsafe advancement add it; rest and some mechanics reduce only recoverable parts.",
                    ],
                    warning: "High Madness has real gameplay effects and can lead to Mutation. Treat advancement warnings seriously.",
                },
            ],
            related: ["first-potion", "activities", "advanced"],
        },
        {
            id: "activities",
            category: "world",
            icon: "fa-solid fa-dungeon",
            title: "Creatures, Wild Beyonders, dungeons, and Incursions",
            shortTitle: "Activities and dungeons",
            summary: "The major repeatable activities that provide loot, acting progress, and group objectives.",
            answer: "Use /subspace to locate dungeons, hunt Beyonder Creatures while exploring, trade with compatible Wild Beyonders, and enter Cosmos Incursions only after checking the zone colour.",
            tags: ["dungeon", "subspace", "rift", "party", "cooldown", "help card", "creature", "crimson moon", "wild beyonder", "guardian", "incursion", "pvp", "black zone"],
            sections: [
                {
                    title: "Dungeons and Rifts",
                    steps: [
                        "Run /subspace to see every dungeon, its Rift location, your relative power, and cooldowns.",
                        "Walk to the Rift and contribute Energy Fragments if it still needs weakening.",
                        "Form a party with /party and enter when available.",
                    ],
                    bullets: [
                        "Real loot is available once per dungeon every three days.",
                        "Two Help Card runs are available each day without normal loot.",
                        "Low-manning is allowed when the remaining party is not overpowered, with no reward reduction.",
                    ],
                },
                {
                    title: "Creatures and the Crimson Moon",
                    paragraphs: ["Beyonder Creatures provide XP, acting points, and pathway ingredients. During the roughly weekly Crimson Moon, fishing becomes a valuable but more dangerous alternate loot stream."],
                },
                {
                    title: "Wild Beyonders and Guardians",
                    paragraphs: ["A Wild Beyonder's attitude depends on pathway relationships. Peaceful ones offer the most targeted ingredient and recipe trading in the game; hostile ones are serious fights. Guardians protect important objectives and are designed for groups."],
                },
                {
                    title: "Cosmos Incursions",
                    paragraphs: ["Incursions are announced PvP objectives. Green and Yellow zones mainly risk carried items and balance damage between Sequences. Black zones carry the serious risk of Sequence regression."],
                    warning: "Read the zone colour and rules before entering. Walking into an Incursion is a deliberate PvP choice.",
                },
            ],
            related: ["loot", "progression", "server-basics"],
        },
        {
            id: "towns",
            category: "community",
            icon: "fa-solid fa-house-flag",
            title: "Towns, nations, wars, and going solo",
            shortTitle: "Towns and nations",
            summary: "How protected settlements change the early game and what a self-sufficient route looks like.",
            answer: "Joining a town is the fastest social start, while solo play remains fully viable. Towns provide protected claims, shared infrastructure, group access, and later passive perks.",
            tags: ["town", "lands", "claim", "nation", "war", "solo", "join", "settle", "base", "grief", "role", "perk"],
            sections: [
                {
                    title: "Joining a town",
                    paragraphs: ["Ask in game chat or Discord for a town accepting newcomers. Established players can share recipes, ingredients, cauldrons, knowledge, and groups for difficult content."],
                    tip: "In a world without teleport commands, a useful settlement location and experienced neighbours are substantial advantages.",
                },
                {
                    title: "Going solo",
                    steps: [
                        "Choose a sensible base location and record important coordinates.",
                        "Open every generated chest and set reward focus to your current bottleneck.",
                        "Hunt creatures, note resource nodes, and use Wild Beyonder trades.",
                        "Join temporary dungeon or Incursion groups without giving up independence.",
                    ],
                },
                {
                    title: "Claims, levels, and nations",
                    paragraphs: ["Towns use Lands-style roles and claims. Higher town levels unlock population capacity, treasury requirements, passive perks, and architectural benefits. Domain-level towns may form Nations."],
                },
                {
                    title: "Wars",
                    paragraphs: ["Wars are structured opt-in conflicts managed through their own commands and server rules. Normal wilderness exploration remains protected outside designated combat contexts."],
                },
            ],
            related: ["server-basics", "economy", "social"],
        },
        {
            id: "economy",
            category: "community",
            icon: "fa-solid fa-coins",
            title: "Currency, Energy Shards, and the Emporium",
            shortTitle: "Economy",
            summary: "What the different currencies buy and how ordinary play turns surplus materials into useful progress.",
            answer: "Use /wallet for Coppets, Licks, and Verl d'or; convert unwanted magical materials into Energy Shards; earn separate Emporium points through community activities.",
            tags: ["money", "currency", "wallet", "coppet", "lick", "verl", "energy shard", "emporium", "daily", "vote", "income", "silk touch", "sell"],
            sections: [
                {
                    title: "Money and the Wallet",
                    paragraphs: ["The main currencies are Coppets, Licks, and Verl d'or, managed through /wallet. Item evaluation is the main income source, but only non-renewable ores mined with Silk Touch qualify."],
                },
                {
                    title: "Energy Shards",
                    paragraphs: ["Trade surplus pathway ingredients and recipes to a professionless nitwit villager. Energy Shards fund Wild Beyonder trades, Rift weakening, Secret Order upgrades, and seasonal activities."],
                },
                {
                    title: "Brilliant Emporium",
                    paragraphs: ["The Emporium rotates useful goods, including magic recipes. Emporium points are separate from normal money and come from voting, login streaks, and accepted bug reports."],
                    commands: [
                        {command: "/emporium or /emp", purpose: "Open the Brilliant Emporium"},
                        {command: "/daily", purpose: "Open the daily reward menu"},
                        {command: "/vote", purpose: "Open server voting"},
                        {command: "/wallet", purpose: "Store money, evaluate items, and make payments"},
                    ],
                },
            ],
            related: ["loot", "towns", "advanced"],
        },
        {
            id: "social",
            category: "community",
            icon: "fa-solid fa-people-group",
            title: "Couriers, Secret Orders, and social play",
            shortTitle: "Social systems",
            summary: "The systems for communication, deliveries, private groups, and shared infrastructure.",
            answer: "Use normal private messages for conversation, Couriers for physical deliveries, and Secret Orders for persistent private groups with their own upgrades and spaces.",
            tags: ["courier", "horn", "send", "message", "msg", "secret order", "order", "oc", "invite", "sos", "group"],
            sections: [
                {
                    title: "Couriers",
                    paragraphs: ["Courier horns summon different courier types for sending physical items. Deliveries have their own capacity, distance, and safety rules, so inspect the chosen courier before committing valuable cargo."],
                },
                {
                    title: "Secret Orders",
                    paragraphs: ["Orders are persistent private organizations with members, officers, chat, upgrades, and emergency tools. They can eventually provide mobility options such as Instant Summon and a Secret Lair."],
                    commands: [
                        {command: "/o invite, /o kick", purpose: "Manage Order membership"},
                        {command: "/o vice set/remove", purpose: "Manage vice leaders"},
                        {command: "/o sos", purpose: "Use the Order emergency system"},
                        {command: "/oc", purpose: "Open private Order chat"},
                    ],
                },
                {
                    title: "Private messages",
                    commands: [
                        {command: "/msg, /pm, /w", purpose: "Send a private message"},
                        {command: "/reply", purpose: "Reply to the latest private message"},
                    ],
                },
            ],
            related: ["towns", "economy", "advanced"],
        },
        {
            id: "advanced",
            category: "world",
            icon: "fa-solid fa-star-of-life",
            title: "Long-term and advanced systems",
            shortTitle: "Advanced systems",
            summary: "A concise map of the systems that become relevant later in a season.",
            answer: "Boons, Sealed Artifacts, Churches, Honorific Names, Uniquenesses, firearms, and other specialist systems are long-term layers-not requirements for your first days.",
            tags: ["boon", "sealed artifact", "church", "honorific name", "uniqueness", "sequence 0", "firearm", "beverage", "battlepass", "subscription", "store", "creator"],
            sections: [
                {
                    title: "Boons and Sacrificial Altars",
                    paragraphs: ["Boons are a separate progression track advanced through Sacrificial Altars. They do not replace your pathway and their altars cannot brew potions."],
                },
                {
                    title: "Sealed Artifacts",
                    paragraphs: ["Artifacts provide powerful effects paired with drawbacks. They can come from crafting, loot, or expired potions and are meant to be evaluated as trade-offs, not unconditional upgrades."],
                },
                {
                    title: "Churches and Honorific Names",
                    paragraphs: ["Churches are late-game institutions built around faith, anchors, prayer, land, and variable perks. Honorific Names allow ritual communication and become shorter as their owner rises in Sequence."],
                },
                {
                    title: "Uniqueness and Sequence 0",
                    paragraphs: ["A pathway's Uniqueness is part of the route to Sequence 0 and requires accommodation. Holding one adds a death penalty to accommodation progress."],
                },
                {
                    title: "Optional support",
                    paragraphs: ["The store, premium Battlepass, and subscriptions support the server and provide convenience. A free player can still reach every level of power."],
                },
            ],
            related: ["progression", "economy", "social"],
        },
        {
            id: "troubleshooting",
            category: "help",
            icon: "fa-solid fa-screwdriver-wrench",
            title: "Connection and interface troubleshooting",
            shortTitle: "Troubleshooting",
            summary: "Fast answers for missing custom UI, verification problems, incompatible clients, and Bedrock limitations.",
            answer: "Missing magical interfaces almost always mean the resource pack was declined or the Java client needs updating. Bedrock has unavoidable custom-UI limitations.",
            tags: ["problem", "broken", "missing", "vanilla", "ui", "interface", "resource pack", "verify", "code", "expired", "bedrock", "mobile", "geyser", "outdated client", "connect"],
            sections: [
                {
                    title: "The server looks like vanilla",
                    steps: [
                        "Edit the server entry and set Server Resource Packs to Enabled.",
                        "Reconnect and accept the pack.",
                        "If it still fails silently, update the Java client and reconnect.",
                    ],
                    warning: "Bedrock players may still see missing pathway icons or incorrectly rendered custom GUIs. This is a known Geyser limitation.",
                },
                {
                    title: "Verification did not complete",
                    steps: [
                        "Return to the profile and generate a fresh code.",
                        "Enter it in the in-game verification window.",
                        "If the Discord website login itself failed, retry after clearing site cookies.",
                        "Open a Discord ticket if the account remains unlinked.",
                    ],
                },
                {
                    title: "I cannot connect",
                    bullets: [
                        "Confirm the address is exactly mc.mysterria.net.",
                        "Use Minecraft 26.1.2 or newer.",
                        "Offline accounts must use /login after their first registration.",
                    ],
                },
            ],
            related: ["connect", "commands", "server-basics"],
        },
        {
            id: "commands",
            category: "help",
            icon: "fa-solid fa-terminal",
            title: "Essential command reference",
            shortTitle: "Commands",
            summary: "A focused list of commands players commonly need, plus commands intentionally unavailable.",
            answer: "Most character information is accessed through inventory interfaces. Commands primarily open menus, manage communities, or communicate.",
            tags: ["command", "magic", "daily", "vote", "wallet", "subspace", "party", "bounty", "lands", "claim", "war", "church", "home", "spawn", "tpa"],
            sections: [
                {
                    title: "Starting and progression",
                    commands: [
                        {command: "/register <pass> <pass>", purpose: "Register an offline account once"},
                        {command: "/login <pass>", purpose: "Log into an offline account"},
                        {command: "/magic", purpose: "Open the optional next-step companion"},
                        {command: "/subspace", purpose: "Browse dungeons, locations, power, and cooldowns"},
                        {command: "/party", purpose: "Create or manage a dungeon party"},
                        {command: "/bounty", purpose: "Open the acting bounty menu"},
                    ],
                },
                {
                    title: "Economy and community",
                    commands: [
                        {command: "/wallet", purpose: "Manage currency, evaluation, and payments"},
                        {command: "/daily", purpose: "Open daily rewards"},
                        {command: "/emporium or /emp", purpose: "Open the Brilliant Emporium"},
                        {command: "/vote", purpose: "Open voting options"},
                        {command: "/lands …", purpose: "Manage towns, roles, and claims"},
                        {command: "/claim and /unclaim", purpose: "Claim or release the current chunk"},
                        {command: "/wars", purpose: "Open war management"},
                    ],
                },
                {
                    title: "Commands that do not exist",
                    paragraphs: ["There is deliberately no /home, /sethome, /spawn, /tpa, /rtp, or /back. Travel and mobility are part of progression."],
                    warning: "Checking Sequence, acting, Spirituality, and Madness is not a command. Open inventory, click the top-left pathway icon, and hover over your character's head.",
                },
            ],
            related: ["server-basics", "activities", "economy"],
        },
    ],
};

const uk: GuideContent = {
    ui: {
        eyebrow: "ДОВІДНИК НОВОГО ГРАВЦЯ",
        title: "Твої перші кроки крізь Туман",
        lede: "Почни грати за кілька хвилин, зрозумій важливі рішення та швидко знаходь відповіді, коли Mysterria працює не так, як звичайний Minecraft.",
        serverAddress: "АДРЕСА СЕРВЕРА",
        copyAddress: "Копіювати адресу",
        copied: "Скопійовано",
        startJourney: "Почати першу годину",
        findAnswer: "Знайти відповідь",
        quickFactsLabel: "ПЕРЕД ПІДКЛЮЧЕННЯМ",
        expectationsEyebrow: "MYSTERRIA - ІНША",
        expectationsTitle: "Знай це до вибору домівки",
        expectationsLede: "Сервер має кілька свідомих рішень, які дивують гравців зі звичайних survival-серверів.",
        tasksEyebrow: "ШВИДКА ДОПОМОГА",
        tasksTitle: "Що ти намагаєшся зробити?",
        tasksLede: "Обери мету або напиши запит своїми словами. Ти побачиш лише потрібну для цього інформацію.",
        searchPlaceholder: "Спробуй «перше зілля», «телепорт додому» або «немає UI»…",
        clearSearch: "Очистити",
        searchResults: "Знайдені відповіді",
        noResults: "Прямої відповіді не знайдено",
        noResultsHint: "Спробуй коротший запит, переглянь теми нижче або запитай у Discord.",
        firstHourEyebrow: "ПЕРША ГОДИНА",
        firstHourTitle: "Від входу до першої справжньої мети",
        firstHourLede: "Найкоротший надійний шлях від списку серверів до розуміння наступного кроку.",
        openStep: "Докладніше",
        starterEyebrow: "ОДНЕ ВАЖЛИВЕ РІШЕННЯ",
        starterTitle: "Обирай допомогу, а не долю",
        starterLede: "Шлях у меню новачка лише спрямовує стартовий бонус. Пізніше можна випити зілля Послідовності 9 зовсім іншого Шляху.",
        benefit: "Ти отримуєш",
        cost: "Постійна ціна",
        bestFor: "Найкраще для",
        recommended: "ПОВНА СИЛА",
        important: "Важливо",
        starterWarning: "Зазвичай бонус не можна змінити. Персонал інколи скидає справжню помилку новачка через Discord-тікет, але підтвердження слід вважати остаточним.",
        directionEyebrow: "ПЕРША МЕТА",
        directionTitle: "Обери напрямок, а не блукай",
        directionLede: "Обидва підходи правильні, і жоден не закриває інший у майбутньому.",
        browseEyebrow: "ДОВІДНИК",
        browseTitle: "Переглянути всі головні системи",
        browseLede: "Складні механіки не заважають, доки вони тобі не потрібні.",
        topics: "тем",
        popularEyebrow: "ЧАСТО ЗАПИТУЮТЬ",
        popularTitle: "Популярні питання гравців",
        openTopic: "Відкрити гайд",
        backToGuide: "Назад до головної гайда",
        quickAnswer: "КОРОТКА ВІДПОВІДЬ",
        onThisPage: "НА ЦІЙ СТОРІНЦІ",
        relatedTopics: "Читати далі",
        commonMistake: "ПОШИРЕНА ПОМИЛКА",
        usefulTip: "КОРИСНА ПОРАДА",
        screenshotsLabel: "ЩО ТИ ПОБАЧИШ",
        screenshotIp: "Додай адресу сервера",
        screenshotPortal: "Обери Mysteries у селекторі",
        screenshotJoin: "Сервер у списку",
        profileCta: "Відкрити профіль",
        pathwaysCta: "Переглянути Шляхи",
        fullRulesCta: "Читати всі правила",
        supportCta: "Запитати в Discord",
        mobileBrowse: "Переглянути теми",
    },
    facts: [
        {label: "КЛІЄНТ", value: "Радимо Java", note: "Bedrock працює через Geyser з обмеженим власним UI"},
        {label: "ВЕРСІЯ", value: "26.1.2+", note: "Онови клієнт, якщо ресурс-пак не завантажується"},
        {label: "ОБОВʼЯЗКОВО", value: "Прийми ресурс-пак", note: "Клієнтські моди не потрібні"},
    ],
    expectations: [
        {
            icon: "fa-solid fa-route",
            title: "Команд телепортації немає",
            summary: "Немає /home, /spawn, /tpa, /rtp або /back.",
            detail: "Відстань має стратегічну ціну, а мобільність є нагородою Шляхів на кшталт Дверей. Уважно обирай місце для поселення.",
        },
        {
            icon: "fa-solid fa-hourglass-half",
            title: "Розвиток навмисно довгий",
            summary: "Ранні Послідовності займають близько тижня, високі - місяці.",
            detail: "Mysterria побудована навколо подорожі тривалістю в сезон, а не максимальної сили за вихідні.",
        },
        {
            icon: "fa-solid fa-rotate",
            title: "Світ сезонний",
            summary: "Повне скидання відбувається приблизно кожні шість місяців.",
            detail: "Скидання включає прогрес Потойбічного. Воно оздоровлює світ і дозволяє приєднуватися посеред сезону.",
        },
        {
            icon: "fa-solid fa-shield-halved",
            title: "Досліджувати зазвичай безпечно",
            summary: "PvP у дикій місцевості вимкнено, а гриферство заборонено.",
            detail: "PvP існує лише в оголошених зонах, Вторгненнях Космосу або клеймах міст, де власник навмисно його дозволив.",
        },
        {
            icon: "fa-solid fa-box-open",
            title: "Звичайні скрині містять магічний лут",
            summary: "Природно згенеровані скрині з часом поновлюються.",
            detail: "Села, шахти, храми, кораблі, бастіони та інші структури є відновлюваними джерелами луту Потойбічного.",
        },
    ],
    tasks: [
        {
            icon: "fa-solid fa-plug",
            title: "Зайти на сервер",
            description: "Версії, ресурс-пак, акаунти та верифікація.",
            topicId: "connect"
        },
        {
            icon: "fa-solid fa-scale-balanced",
            title: "Обрати стартовий бонус",
            description: "Різниця між Скороченням, Рішучістю та вибором Шляху.",
            topicId: "starter-choice"
        },
        {
            icon: "fa-solid fa-flask",
            title: "Стати Послідовністю 9",
            description: "Рецепт, казан, інгредієнти, варіння та зілля.",
            topicId: "first-potion"
        },
        {
            icon: "fa-solid fa-box-open",
            title: "Знайти рецепт чи інгредієнти",
            description: "Скрині, фокусування, істоти, вузли та торгівля.",
            topicId: "loot"
        },
        {
            icon: "fa-solid fa-arrow-trend-up",
            title: "Підняти Послідовність",
            description: "Відіграш, ритуали, Духовність, Божевілля та розвиток.",
            topicId: "progression"
        },
        {
            icon: "fa-solid fa-dungeon",
            title: "Знайти підземелля",
            description: "/subspace, Розломи, групи та перезарядки.",
            topicId: "activities"
        },
        {
            icon: "fa-solid fa-house-flag",
            title: "Приєднатися або створити місто",
            description: "Захищені землі, групова гра, нації та соло.",
            topicId: "towns"
        },
        {
            icon: "fa-solid fa-wand-magic-sparkles",
            title: "Виправити відсутній UI",
            description: "Ресурс-пак, версія клієнта та обмеження Bedrock.",
            topicId: "troubleshooting"
        },
    ],
    firstHour: [
        {
            title: "Підключися та прийми ресурс-пак",
            description: "Додай mc.mysterria.net, зайди в Mysteries через селектор лобі та прийми серверний пак.",
            topicId: "connect"
        },
        {
            title: "Реєструйся, лише якщо Minecraft просить",
            description: "Офлайн-акаунти використовують /register та /login. Офіційні акаунти входять автоматично.",
            topicId: "connect"
        },
        {
            title: "Підтвердь Minecraft-акаунт",
            description: "Створи код у профілі й введи його у вікні верифікації в грі.",
            topicId: "connect"
        },
        {
            title: "Уважно обери стартовий бонус",
            description: "Шлях лише визначає напрямок бонусу. Скорочення і Рішучість мають зовсім різну довгострокову ціну.",
            topicId: "starter-choice"
        },
        {
            title: "Обери міське життя або самостійність",
            description: "Знайди місто з набором або почни сольне дослідження скринь і світу.",
            topicId: "towns"
        },
        {
            title: "Працюй над першим зіллям",
            description: "Для першої Послідовності потрібні рецепт, казан, інгредієнти та вдале варіння - більше нічого.",
            topicId: "first-potion"
        },
    ],
    starterChoices: [
        {
            name: "Шлях Скорочення",
            eyebrow: "ЗДІБНОСТІ ВЖЕ ЗАРАЗ",
            benefit: "Миттєва Послідовність 9 обраного Шляху.",
            cost: "−10% максимальної Духовності назавжди, на кожній Послідовності.",
            bestFor: "Гравців, яким миттєвий старт важливіший за максимальну силу в майбутньому.",
        },
        {
            name: "Шлях Рішучості",
            eyebrow: "ПОВНИЙ ЦИКЛ РОЗВИТКУ",
            benefit: "Наступна скриня гарантовано міститиме рецепт.",
            cost: "Відсутня.",
            bestFor: "Гравців, які хочуть навчитись варінню та зберегти повний потенціал.",
            recommended: true,
        },
    ],
    directions: [
        {
            icon: "fa-solid fa-people-roof",
            title: "Приєднайся до міста",
            eyebrow: "ПРОСТІШИЙ СТАРТ",
            description: "Запитай у чаті або Discord, яке місто приймає новачків.",
            points: [
                "Спільні казани, рецепти, інгредієнти та захищена земля.",
                "Групи для Вартових, підземель, Диких Потойбічних і Вторгнень.",
                "Готова мережа баз у світі без команд телепортації.",
            ],
            topicId: "towns",
        },
        {
            icon: "fa-solid fa-compass",
            title: "Грай самостійно",
            eyebrow: "ВЛАСНИЙ ШЛЯХ",
            description: "Цілком можливо, але повільніше й більше залежить від дослідження.",
            points: [
                "Відкривай кожну згенеровану скриню - лут Потойбічного поновлюється.",
                "Полюй на Істот Потойбічного та відмічай відновлювані вузли ресурсів.",
                "Обмінюй зайві матеріали й приєднуйся до груп для окремих активностей.",
            ],
            topicId: "loot",
        },
    ],
    categories: {
        start: "Почати",
        progression: "Розвиток Потойбічного",
        world: "Світ та активності",
        community: "Економіка та спільнота",
        help: "Допомога й довідник",
    },
    popularQuestions: [
        {question: "Як телепортуватися додому?", topicId: "server-basics"},
        {question: "Чому гра виглядає як vanilla?", topicId: "troubleshooting"},
        {question: "Вибір Шляху заблокував мене?", topicId: "starter-choice"},
        {question: "Як стати Послідовністю 9?", topicId: "first-potion"},
        {question: "Де спеціальні скрині з лутом?", topicId: "loot"},
        {question: "Чому не рухається прогрес відіграшу?", topicId: "progression"},
        {question: "Мене можуть убити під час дослідження?", topicId: "server-basics"},
        {question: "Як знайти підземелля?", topicId: "activities"},
    ],
    topics: [
        {
            id: "connect",
            category: "start",
            icon: "fa-solid fa-plug",
            title: "Підключення, реєстрація та верифікація",
            shortTitle: "Підключення",
            summary: "Усе необхідне, щоб зайти в Mysteries правильним клієнтом і відкрити стартовий бонус.",
            answer: "Зайди на mc.mysterria.net актуальним Java-клієнтом, прийми ресурс-пак, обери Mysteries у лобі й пройди верифікацію через профіль сайту.",
            tags: ["ip", "адреса", "зайти", "java", "bedrock", "geyser", "register", "login", "верифікація", "discord", "ресурс пак", "версія", "premium", "offline"],
            sections: [
                {
                    title: "Дані сервера",
                    bullets: [
                        "Адреса: mc.mysterria.net.",
                        "Підтримувані версії: 26.1.2 і новіші.",
                        "Java Edition - повністю підтримуваний варіант; клієнтські моди не потрібні.",
                        "Bedrock підключається через Geyser, але іконки Шляхів та деякі інтерфейси можуть відображатися неправильно.",
                    ],
                },
                {
                    title: "Підключення",
                    steps: [
                        "Відкрий Multiplayer, додай mc.mysterria.net і зайди на сервер.",
                        "Прийми серверний ресурс-пак, коли Minecraft запитає.",
                        "У селекторі серверів лобі обери Mysteries.",
                        "Прочитай діалоги NPC у лобі перед виходом.",
                    ],
                    warning: "Якщо все виглядає як звичайний Minecraft, ресурс-пак відхилено або Java-клієнт застарів. Увімкни серверні ресурс-паки й онови клієнт.",
                },
                {
                    title: "Реєстрація акаунта",
                    paragraphs: [
                        "Офіційні premium-акаунти Minecraft пропускають реєстрацію та входять автоматично.",
                        "Офлайн-акаунти один раз вводять /register <пароль> <пароль>, а надалі - /login <пароль>.",
                    ],
                },
                {
                    title: "Discord-верифікація",
                    steps: [
                        "Увійди на сайт Mysterria та відкрий профіль.",
                        "Створи код верифікації Minecraft.",
                        "Введи код у вікні верифікації, яке зʼявиться в грі.",
                        "Після підтвердження стане доступним меню Шляху й бонусу новачка.",
                    ],
                },
            ],
            related: ["starter-choice", "troubleshooting", "server-basics"],
        },
        {
            id: "server-basics",
            category: "start",
            icon: "fa-solid fa-map",
            title: "Як працює світ Mysterria",
            shortTitle: "Основи світу",
            summary: "Подорожі, безпека, смерть, сезонні скидання й правила, відмінні від звичайних survival-серверів.",
            answer: "Mysterria - обмежений сезонний світ, де відстань важлива, дослідження дикої місцевості безпечне, а природні скрині містять відновлюваний магічний лут.",
            tags: ["home", "spawn", "tpa", "rtp", "back", "телепорт", "карта", "pvp", "гриф", "смерть", "збереження інвентарю", "скидання", "сезон", "кордон", "безпека"],
            sections: [
                {
                    title: "Карта й подорожі",
                    paragraphs: ["Верхній світ обмежений розміром 15 000 × 15 000 блоків. Нижній світ і спеціальні виміри існують, але більшість контенту Потойбічного розташована у Верхньому світі."],
                    warning: "Немає /home, /sethome, /spawn, /tpa, /rtp або /back. Це зберігає цінність планування подорожей і мобільних Шляхів на кшталт Дверей.",
                },
                {
                    title: "Безпека та PvP",
                    bullets: [
                        "PvP у дикій місцевості типово вимкнено.",
                        "PvP обмежено спеціальними зонами та Вторгненнями Космосу.",
                        "Власник міста може навмисно дозволити PvP певним ролям у своїх клеймах.",
                        "Гриферство заборонене, а міські клейми додатково захищають землю.",
                    ],
                },
                {
                    title: "Смерть",
                    paragraphs: ["Смерть працює як у vanilla: предмети випадають, keep-inventory немає. Потойбічний також отримує трохи тимчасового Божевілля."],
                    tip: "Додаткову втрату прогресу акомодації має лише власник Унікальності. Звичайна смерть не забирає Послідовність у пересічного гравця.",
                },
                {
                    title: "Сезонні скидання",
                    paragraphs: ["Приблизно кожні шість місяців світ і прогрес Потойбічного скидаються. Це підтримує карту здоровою та дозволяє новачкам долучатися посеред сезону."],
                },
            ],
            related: ["towns", "activities", "progression"],
        },
        {
            id: "starter-choice",
            category: "start",
            icon: "fa-solid fa-scale-balanced",
            title: "Шлях новачка та стартовий бонус",
            shortTitle: "Стартовий вибір",
            summary: "Що насправді змінює початковий Шлях і яка постійна різниця між Скороченням та Рішучістю.",
            answer: "Обраний Шлях не робить тебе Потойбічним і не закриває майбутній вибір. Він лише спрямовує один із двох стартових бонусів.",
            tags: ["новачок", "бонус", "скорочення", "рішучість", "шлях", "заблоковано", "перевибір", "magic", "послідовність 9", "духовність", "гарантія рецепта"],
            sections: [
                {
                    title: "Твій Шлях не заблоковано",
                    paragraphs: [
                        "Ти стаєш представником Шляху лише після зілля Послідовності 9. Якщо меню каже «Блазень», але ти випʼєш зілля Дверей, твоїм Шляхом стануть Двері.",
                        "/magic - необовʼязкове меню підказок. Назва Шляху в ньому не доводить, що ти вже Потойбічний.",
                    ],
                },
                {
                    title: "Шлях Скорочення",
                    paragraphs: ["Ти миттєво стаєш Послідовністю 9 без варіння, але назавжди втрачаєш 10% максимальної Духовності на кожній Послідовності та рівні відіграшу."],
                    warning: "Штраф Духовності постійний. Підвищення Послідовності або завершення відіграшу його не поверне.",
                },
                {
                    title: "Шлях Рішучості",
                    paragraphs: ["Лічильник фокусування рецептів переходить на крок перед гарантією, тому наступна природна скриня міститиме рецепт. Постійної ціни немає."],
                    tip: "Рішучість навчає звичайному циклу рецепт → казан → інгредієнти → варіння та зберігає повну довгострокову силу.",
                },
                {
                    title: "Підтвердження та помилки",
                    paragraphs: ["Гравець не може самостійно перевибрати бонус. Для справжньої помилки новачка відкрий Discord-тікет - персонал інколи робить скидання."],
                },
            ],
            related: ["first-potion", "progression", "connect"],
        },
        {
            id: "first-potion",
            category: "progression",
            icon: "fa-solid fa-flask",
            title: "Звари й випий перше зілля",
            shortTitle: "Перше зілля",
            summary: "Повний цикл рецепта й варіння Послідовності 9 без міфів спільноти.",
            answer: "Щоб стати Послідовністю 9: знайди рецепт, побудуй казан, збери інгредієнти, вдало звари й випий. Для першого зілля не потрібні відіграш, ритуал або Божевілля.",
            tags: ["послідовність 9", "зілля", "варити", "казан", "рецепт", "інгредієнт", "char", "ритуал", "вівтар", "термін", "слоти"],
            sections: [
                {
                    title: "Що потрібно",
                    bullets: [
                        "Повний рецепт Послідовності 9 або всі різні сторінки рецепта.",
                        "Магічний Казан, побудований із креслення Altar Scroll.",
                        "Основні й додаткові інгредієнти відповідного Шляху та Послідовності.",
                        "Beyonder Chars можуть замінити всі основні інгредієнти рецепта.",
                    ],
                    warning: "Жертовні Вівтарі потрібні для Благословень, а не для зіль. Їхні креслення схожі на креслення казанів.",
                },
                {
                    title: "Порядок варіння",
                    steps: [
                        "Поклади основні інгредієнти або Beyonder Chars у ліві слоти.",
                        "Поклади додаткові інгредієнти у праві слоти.",
                        "Поклади рецепт у центральний слот.",
                        "Зберігай той самий порядок предметів, що вказаний у рецепті.",
                        "Після успіху випий зілля та стань Послідовністю 9.",
                    ],
                    tip: "Невдале варіння не витрачає інгредієнти. Казани вищого рівня лише підвищують шанс успіху.",
                },
                {
                    title: "Інгредієнти",
                    bullets: [
                        "Foundable-інгредієнти зʼявляються лише в природних скринях.",
                        "Droppable-інгредієнти випадають лише з Істот Потойбічного.",
                        "Mineable-інгредієнти ростуть окремими вузлами у світі; збирай їх правою кнопкою.",
                    ],
                },
                {
                    title: "Термін зілля",
                    paragraphs: ["Зілля існує дві реальні доби від моменту появи. Вари, коли готовий випити. Прострочене зілля за можливості стає відповідним Запечатаним Артефактом, але вже не дає потрібного підвищення."],
                },
            ],
            related: ["loot", "starter-choice", "progression"],
        },
        {
            id: "loot",
            category: "progression",
            icon: "fa-solid fa-box-open",
            title: "Лут, рецепти та інгредієнти",
            shortTitle: "Лут і фокусування",
            summary: "Звідки беруться магічні матеріали та як гарантія фокусування зменшує невдачу.",
            answer: "Кожна природна vanilla-скриня - відновлюваний контейнер луту Потойбічного. Відкривай їх повторно та фокусуй потрібну категорію нагород.",
            tags: ["лут", "скриня", "контейнер", "рецепт", "сторінка", "інгредієнт", "altar scroll", "фокус", "фокусування", "гарантія", "дикий потойбічний", "істота", "вузол", "energy shard"],
            sections: [
                {
                    title: "Контейнери луту",
                    paragraphs: ["Скрині сіл, шахт, підземель, храмів, кораблів, скарбів, бастіонів і зруйнованих порталів підходять. Спеціальної сяючої «скрині Потойбічного» немає."],
                    tip: "Вміст поновлюється з часом. Уже досліджені структури залишаються корисними.",
                },
                {
                    title: "Фокусування нагород",
                    paragraphs: ["Обери одну з чотирьох категорій: Зілля, Рецепти, Сторінки або Altar Scrolls. Кожна скриня без потрібної нагороди просуває видимий лічильник; гранична скриня гарантовано її дає."],
                    warning: "Інгредієнти не можна фокусувати. Їх знаходять у скринях, вибивають з істот, збирають із вузлів, купують або отримують через інші системи.",
                },
                {
                    title: "Точне здобування",
                    bullets: [
                        "Торгуй із мирним Диким Потойбічним за товари конкретного Шляху.",
                        "Використовуй /subspace і проходь підземелля за відновлювані матеріали.",
                        "Полюй на Істот Потойбічного за droppable-інгредієнтами та відіграшем.",
                        "Обмінюй зайві інгредієнти у безробітного селянина-ледаря на Осколки Енергії.",
                        "Перевіряй асортимент Блискучого Емпоріуму.",
                    ],
                },
            ],
            related: ["first-potion", "activities", "economy"],
        },
        {
            id: "progression",
            category: "progression",
            icon: "fa-solid fa-arrow-trend-up",
            title: "Відіграш, ритуали, Духовність і Божевілля",
            shortTitle: "Підвищення",
            summary: "Як працює розвиток після Послідовності 9 і де переглянути стан персонажа.",
            answer: "Після становлення Потойбічним розвиток поєднує кілька джерел відіграшу, наступне зілля та дедалі важливіші ритуали. Повний стан персонажа є в інтерфейсі Шляху.",
            tags: ["відіграш", "перетравлення", "ритуал", "духовність", "мана", "божевілля", "мутація", "здоровʼя", "статус", "послідовність", "підвищення", "bounty", "bottle"],
            sections: [
                {
                    title: "Перевір стан персонажа",
                    steps: [
                        "Відкрий інвентар.",
                        "Натисни іконку Шляху у верхньому лівому куті.",
                        "Наведи курсор на голову персонажа в інтерфейсі.",
                    ],
                    tip: "Тут показані Послідовність, відіграш і перетравлення, Духовність та Божевілля. Окремої команди статусу немає.",
                },
                {
                    title: "Відіграш і перетравлення",
                    paragraphs: ["Просте використання заклинань не завжди дає прогрес. Кожна здібність має власний метод відіграшу, а успіх показує повідомлення над панеллю швидкого доступу."],
                    bullets: [
                        "Пасивна гра та методи конкретних здібностей.",
                        "Пляшки Відіграшу й змінні завдання.",
                        "Підземелля для PvE-відіграшу.",
                        "Вторгнення Космосу для PvP-відіграшу.",
                    ],
                    warning: "Жодне джерело відіграшу не може самостійно дійти до 100%. Поєднуй кілька.",
                },
                {
                    title: "Ритуали",
                    bullets: [
                        "Для Послідовності 9 ритуал ніколи не потрібен.",
                        "Для цільових Послідовностей 8–6 ритуал необовʼязковий, але пропуск додає постійне сезонне Божевілля.",
                        "Для цільової Послідовності 5 і вище ритуал обовʼязковий.",
                    ],
                },
                {
                    title: "Духовність і Божевілля",
                    paragraphs: [
                        "Духовність живить здібності й відновлюється з часом. Її максимум росте з Послідовністю та відіграшем.",
                        "Божевілля має тимчасову, постійну й сиру складові. Смерть і небезпечне підвищення додають його; відпочинок і деякі механіки зменшують лише відновлювані частини.",
                    ],
                    warning: "Високе Божевілля реально впливає на гру та може спричинити Мутацію. Стався серйозно до попереджень підвищення.",
                },
            ],
            related: ["first-potion", "activities", "advanced"],
        },
        {
            id: "activities",
            category: "world",
            icon: "fa-solid fa-dungeon",
            title: "Істоти, Дикі Потойбічні, підземелля та Вторгнення",
            shortTitle: "Активності й підземелля",
            summary: "Головні повторювані активності для луту, відіграшу та групових цілей.",
            answer: "Знаходь підземелля через /subspace, полюй на Істот Потойбічного, торгуй із сумісними Дикими Потойбічними та перевіряй колір зони перед Вторгненням.",
            tags: ["підземелля", "subspace", "розлом", "група", "перезарядка", "help card", "істота", "багряний місяць", "дикий потойбічний", "вартовий", "вторгнення", "pvp", "чорна зона"],
            sections: [
                {
                    title: "Підземелля та Розломи",
                    steps: [
                        "Введи /subspace, щоб побачити всі підземелля, місце Розлому, відносну силу й перезарядки.",
                        "Дійди до Розлому та внеси Фрагменти Енергії, якщо його ще потрібно послабити.",
                        "Створи групу через /party та зайди, коли вхід стане доступним.",
                    ],
                    bullets: [
                        "Справжній лут доступний раз на три дні для кожного підземелля.",
                        "Щодня доступні два проходження за Help Cards без звичайного луту.",
                        "Можна проходити неповним складом, якщо група не надто сильна; нагороди не зменшуються.",
                    ],
                },
                {
                    title: "Істоти й Багряний Місяць",
                    paragraphs: ["Істоти Потойбічного дають досвід, відіграш та інгредієнти Шляхів. Під час приблизно щотижневого Багряного Місяця риболовля стає цінним, але небезпечнішим джерелом луту."],
                },
                {
                    title: "Дикі Потойбічні та Вартові",
                    paragraphs: ["Ставлення Дикого Потойбічного залежить від звʼязків Шляхів. Мирні дають найточнішу торгівлю інгредієнтами й рецептами, ворожі є серйозними противниками. Вартові захищають важливі цілі та розраховані на групи."],
                },
                {
                    title: "Вторгнення Космосу",
                    paragraphs: ["Вторгнення - оголошені PvP-цілі. Зелені й Жовті зони переважно ризикують предметами та вирівнюють шкоду між Послідовностями. Чорні зони несуть ризик втрати Послідовності."],
                    warning: "Перевір колір і правила зони до входу. Вхід у Вторгнення є свідомим вибором PvP.",
                },
            ],
            related: ["loot", "progression", "server-basics"],
        },
        {
            id: "towns",
            category: "community",
            icon: "fa-solid fa-house-flag",
            title: "Міста, нації, війни та соло",
            shortTitle: "Міста й нації",
            summary: "Як захищені поселення змінюють початок гри та як виглядає самостійний шлях.",
            answer: "Місто дає найпростіший соціальний старт, але соло цілком можливе. Міста мають захищені клейми, спільну інфраструктуру, групи та майбутні пасивні переваги.",
            tags: ["місто", "lands", "claim", "нація", "війна", "соло", "приєднатися", "оселитися", "база", "гриф", "роль", "perk"],
            sections: [
                {
                    title: "Приєднання до міста",
                    paragraphs: ["Запитай у чаті гри або Discord про міста, які приймають новачків. Досвідчені гравці можуть поділитися рецептами, інгредієнтами, казанами, знаннями та групами."],
                    tip: "У світі без команд телепортації корисне розташування та досвідчені сусіди - значна перевага.",
                },
                {
                    title: "Соло",
                    steps: [
                        "Обери розумне місце для бази й запиши важливі координати.",
                        "Відкривай кожну природну скриню та фокусуй поточну нестачу.",
                        "Полюй на істот, відмічай вузли й торгуй із Дикими Потойбічними.",
                        "Долучайся до тимчасових груп для підземель і Вторгнень, не втрачаючи незалежності.",
                    ],
                },
                {
                    title: "Клейми, рівні та нації",
                    paragraphs: ["Міста використовують ролі та клейми в стилі Lands. Вищі рівні відкривають місткість, вимоги скарбниці, пасивні переваги та архітектурні бонуси. Міста рівня Domain можуть створювати Нації."],
                },
                {
                    title: "Війни",
                    paragraphs: ["Війни - структуровані добровільні конфлікти з окремими командами та правилами. Звичайне дослідження дикої місцевості залишається захищеним."],
                },
            ],
            related: ["server-basics", "economy", "social"],
        },
        {
            id: "economy",
            category: "community",
            icon: "fa-solid fa-coins",
            title: "Валюта, Осколки Енергії та Емпоріум",
            shortTitle: "Економіка",
            summary: "Для чого потрібні валюти та як перетворити зайві матеріали на корисний прогрес.",
            answer: "Використовуй /wallet для Копетів, Ліків і Верльдорів; міняй зайві магічні матеріали на Осколки Енергії; окремі очки Емпоріуму заробляй активністю спільноти.",
            tags: ["гроші", "валюта", "wallet", "копет", "лік", "верльдор", "осколок енергії", "emporium", "daily", "vote", "дохід", "silk touch", "продати"],
            sections: [
                {
                    title: "Гроші й Гаманець",
                    paragraphs: ["Основні валюти - Копети, Ліки та Верльдори, якими керує /wallet. Головний дохід - оцінювання предметів, але підходять лише невідновлювані руди, добуті Silk Touch."],
                },
                {
                    title: "Осколки Енергії",
                    paragraphs: ["Обмінюй зайві інгредієнти й рецепти Шляхів у безробітного селянина-ледаря. Осколки потрібні для торгівлі з Дикими Потойбічними, послаблення Розломів, розвитку Таємних Орденів і сезонних активностей."],
                },
                {
                    title: "Блискучий Емпоріум",
                    paragraphs: ["Емпоріум змінює асортимент корисних товарів, зокрема магічних рецептів. Його очки окремі від грошей і надходять за голосування, серії входів та прийняті звіти про помилки."],
                    commands: [
                        {command: "/emporium або /emp", purpose: "Відкрити Блискучий Емпоріум"},
                        {command: "/daily", purpose: "Відкрити щоденні нагороди"},
                        {command: "/vote", purpose: "Відкрити голосування за сервер"},
                        {command: "/wallet", purpose: "Зберігати гроші, оцінювати предмети й платити"},
                    ],
                },
            ],
            related: ["loot", "towns", "advanced"],
        },
        {
            id: "social",
            category: "community",
            icon: "fa-solid fa-people-group",
            title: "Курʼєри, Таємні Ордени та соціальна гра",
            shortTitle: "Соціальні системи",
            summary: "Системи спілкування, доставки, приватних груп і спільної інфраструктури.",
            answer: "Використовуй приватні повідомлення для розмов, Курʼєрів для фізичних доставок і Таємні Ордени для постійних приватних груп із власним розвитком.",
            tags: ["курʼєр", "ріг", "відправити", "повідомлення", "msg", "таємний орден", "орден", "oc", "invite", "sos", "група"],
            sections: [
                {
                    title: "Курʼєри",
                    paragraphs: ["Роги Курʼєрів викликають різні типи доставників фізичних предметів. Доставки мають обмеження місткості, відстані й безпеки, тому перевіряй обраного Курʼєра перед цінним вантажем."],
                },
                {
                    title: "Таємні Ордени",
                    paragraphs: ["Ордени - постійні приватні організації з учасниками, офіцерами, чатом, покращеннями та екстреними засобами. Згодом вони відкривають мобільність на кшталт Instant Summon і Secret Lair."],
                    commands: [
                        {command: "/o invite, /o kick", purpose: "Керувати учасниками Ордену"},
                        {command: "/o vice set/remove", purpose: "Керувати заступниками"},
                        {command: "/o sos", purpose: "Використати екстрену систему Ордену"},
                        {command: "/oc", purpose: "Відкрити приватний чат Ордену"},
                    ],
                },
                {
                    title: "Приватні повідомлення",
                    commands: [
                        {command: "/msg, /pm, /w", purpose: "Надіслати приватне повідомлення"},
                        {command: "/reply", purpose: "Відповісти на останнє повідомлення"},
                    ],
                },
            ],
            related: ["towns", "economy", "advanced"],
        },
        {
            id: "advanced",
            category: "world",
            icon: "fa-solid fa-star-of-life",
            title: "Довгострокові та складні системи",
            shortTitle: "Складні системи",
            summary: "Коротка карта механік, які стають важливими пізніше в сезоні.",
            answer: "Благословення, Запечатані Артефакти, Церкви, Почесні Імена, Унікальності, зброя та інші спеціальні системи - це довгострокові шари, а не вимоги перших днів.",
            tags: ["благословення", "запечатаний артефакт", "церква", "почесне імʼя", "унікальність", "послідовність 0", "зброя", "напій", "battlepass", "підписка", "магазин", "creator"],
            sections: [
                {
                    title: "Благословення та Жертовні Вівтарі",
                    paragraphs: ["Благословення - окремий шлях розвитку через Жертовні Вівтарі. Вони не замінюють Шлях Потойбічного, а їхні вівтарі не варять зілля."],
                },
                {
                    title: "Запечатані Артефакти",
                    paragraphs: ["Артефакти поєднують сильні ефекти з недоліками. Їх створюють, знаходять або отримують із прострочених зіль; це компроміси, а не безумовні покращення."],
                },
                {
                    title: "Церкви та Почесні Імена",
                    paragraphs: ["Церкви - пізня система віри, якорів, молитви, землі та змінних переваг. Почесні Імена дозволяють ритуальне спілкування й стають коротшими з підвищенням власника."],
                },
                {
                    title: "Унікальність і Послідовність 0",
                    paragraphs: ["Унікальність Шляху є частиною дороги до Послідовності 0 та потребує акомодації. Її власник втрачає частину прогресу акомодації при смерті."],
                },
                {
                    title: "Необовʼязкова підтримка",
                    paragraphs: ["Магазин, преміум Battlepass і підписки підтримують сервер та дають зручність. Безкоштовний гравець усе одно може досягнути кожного рівня сили."],
                },
            ],
            related: ["progression", "economy", "social"],
        },
        {
            id: "troubleshooting",
            category: "help",
            icon: "fa-solid fa-screwdriver-wrench",
            title: "Проблеми підключення та інтерфейсу",
            shortTitle: "Вирішення проблем",
            summary: "Швидкі відповіді для відсутнього UI, проблем верифікації, несумісного клієнта й Bedrock.",
            answer: "Відсутній магічний інтерфейс майже завжди означає відхилений ресурс-пак або застарілий Java-клієнт. Bedrock має неминучі обмеження власного UI.",
            tags: ["проблема", "зламано", "немає", "vanilla", "ui", "інтерфейс", "ресурс пак", "verify", "код", "прострочено", "bedrock", "mobile", "geyser", "застарілий клієнт", "підключення"],
            sections: [
                {
                    title: "Сервер виглядає як vanilla",
                    steps: [
                        "Відредагуй запис сервера та встанови Server Resource Packs у Enabled.",
                        "Перепідключися та прийми пак.",
                        "Якщо він знову не завантажився, онови Java-клієнт.",
                    ],
                    warning: "У Bedrock можуть усе одно бути відсутні іконки Шляхів або неправильно показані GUI. Це відоме обмеження Geyser.",
                },
                {
                    title: "Верифікація не завершилась",
                    steps: [
                        "Повернись у профіль і створи свіжий код.",
                        "Введи його у вікні верифікації в грі.",
                        "Якщо не спрацював сам вхід Discord на сайті, очисти cookies і повтори.",
                        "Відкрий Discord-тікет, якщо акаунт не привʼязується.",
                    ],
                },
                {
                    title: "Не можу підключитися",
                    bullets: [
                        "Переконайся, що адреса точно mc.mysterria.net.",
                        "Використовуй Minecraft 26.1.2 або новіший.",
                        "Офлайн-акаунти після першої реєстрації мають вводити /login.",
                    ],
                },
            ],
            related: ["connect", "commands", "server-basics"],
        },
        {
            id: "commands",
            category: "help",
            icon: "fa-solid fa-terminal",
            title: "Головні команди",
            shortTitle: "Команди",
            summary: "Стислий список потрібних команд і тих, яких навмисно не існує.",
            answer: "Більшість даних персонажа доступна через інвентар. Команди переважно відкривають меню, керують спільнотами або спілкуванням.",
            tags: ["команда", "magic", "daily", "vote", "wallet", "subspace", "party", "bounty", "lands", "claim", "war", "church", "home", "spawn", "tpa"],
            sections: [
                {
                    title: "Початок і розвиток",
                    commands: [
                        {command: "/register <пароль> <пароль>", purpose: "Один раз зареєструвати офлайн-акаунт"},
                        {command: "/login <пароль>", purpose: "Увійти в офлайн-акаунт"},
                        {command: "/magic", purpose: "Відкрити необовʼязкові підказки наступного кроку"},
                        {command: "/subspace", purpose: "Переглянути підземелля, місця, силу й перезарядки"},
                        {command: "/party", purpose: "Створити або керувати групою підземелля"},
                        {command: "/bounty", purpose: "Відкрити меню завдань відіграшу"},
                    ],
                },
                {
                    title: "Економіка та спільнота",
                    commands: [
                        {command: "/wallet", purpose: "Керувати валютою, оцінюванням і платежами"},
                        {command: "/daily", purpose: "Відкрити щоденні нагороди"},
                        {command: "/emporium або /emp", purpose: "Відкрити Блискучий Емпоріум"},
                        {command: "/vote", purpose: "Відкрити голосування"},
                        {command: "/lands …", purpose: "Керувати містами, ролями та клеймами"},
                        {command: "/claim і /unclaim", purpose: "Зайняти або звільнити поточний чанк"},
                        {command: "/wars", purpose: "Відкрити керування війнами"},
                    ],
                },
                {
                    title: "Команди, яких не існує",
                    paragraphs: ["Навмисно немає /home, /sethome, /spawn, /tpa, /rtp або /back. Подорожі й мобільність є частиною розвитку."],
                    warning: "Послідовність, відіграш, Духовність і Божевілля не перевіряються командою. Відкрий інвентар, натисни верхню ліву іконку Шляху й наведи курсор на голову персонажа.",
                },
            ],
            related: ["server-basics", "activities", "economy"],
        },
    ],
};

export const guideContent: Record<GuideLanguage, GuideContent> = {en, uk};

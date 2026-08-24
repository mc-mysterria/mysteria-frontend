/*
 * Traditional Chinese. GENERATED - do not edit.
 * Produced from src/data/guide/zh-CN.ts by scripts/build-zh-tw.mjs (OpenCC s2twp plus the
 * override lists in i18n/). Any edit here is overwritten on the next build.
 *
 * To change a string: if it is wrong in both Chinese locales, fix the
 * Simplified source (src/data/guide/zh-CN.ts); if only the Traditional form is wrong, add it
 * to i18n/zh-TW.overrides.json.
 */

import type {GuideContent} from "./types";

export const zhTW: GuideContent = {
    ui: {
        eyebrow: "新玩家手冊",
        title: "你穿過灰霧的第一步",
        lede: "幾分鐘內開始遊戲，弄清真正重要的選擇，並在 Mysterria 的機制與原版 Minecraft 不同時，直接找到答案。",
        serverAddress: "伺服器地址",
        copyAddress: "複製地址",
        copied: "已複製",
        startJourney: "開始你的第一小時",
        findAnswer: "查詢答案",
        quickFactsLabel: "連線之前",
        expectationsEyebrow: "MYSTERRIA 與眾不同",
        expectationsTitle: "定居之前先了解這些",
        expectationsLede: "伺服器有幾項刻意的設計，習慣了傳統生存服的玩家往往會感到意外。",
        tasksEyebrow: "快速幫助",
        tasksTitle: "你想做什麼？",
        tasksLede: "選擇一個目標，或用你自己的話搜尋。你只會看到完成該目標所需的資訊。",
        searchPlaceholder: "試試「第一瓶魔藥」「傳送回家」或「介面缺失」…",
        clearSearch: "清除",
        searchResults: "相關答案",
        noResults: "沒有找到直接的答案",
        noResultsHint: "換一個更短的說法，瀏覽下方的條目，或者在 Discord 裡提問。",
        firstHourEyebrow: "第一小時",
        firstHourTitle: "從進服到明確自己的第一個目標",
        firstHourLede: "這是從伺服器列表走到「知道下一步該做什麼」的最短且可靠的路線。",
        openStep: "檢視詳情",
        starterEyebrow: "一個重要的決定",
        starterTitle: "你選的是助力，不是命運",
        starterLede: "新手選單裡選擇的途徑只決定初始獎勵的方向。你之後仍然可以飲用完全不同途徑的序列9魔藥。",
        benefit: "你將獲得",
        cost: "永久代價",
        bestFor: "適合",
        recommended: "完整潛力",
        important: "重要",
        starterWarning: "獎勵一經確認通常無法更改。若確屬新手誤操作，管理組可能透過 Discord 工單重置，但請把確認當作最終決定。",
        directionEyebrow: "你的第一個目標",
        directionTitle: "選定一個方向，而不是四處遊蕩",
        directionLede: "兩種玩法都成立，選了任何一種也不會擋住之後走另一種。",
        browseEyebrow: "手冊",
        browseTitle: "瀏覽所有主要系統",
        browseLede: "進階內容在你需要之前不會來打擾你。",
        topics: "個條目",
        popularEyebrow: "高頻提問",
        popularTitle: "玩家常問的問題",
        openTopic: "開啟指南",
        backToGuide: "返回指南首頁",
        quickAnswer: "快速回答",
        onThisPage: "本頁內容",
        relatedTopics: "繼續閱讀",
        commonMistake: "常見誤區",
        usefulTip: "實用提示",
        screenshotsLabel: "你會看到的畫面",
        screenshotIp: "新增伺服器地址",
        screenshotPortal: "在選擇器中選擇 Mysteries",
        screenshotJoin: "列表中的伺服器",
        profileCta: "打開個人資料",
        pathwaysCta: "瀏覽途徑",
        fullRulesCta: "閱讀完整規則",
        supportCta: "在 Discord 提問",
        mobileBrowse: "瀏覽條目",
    },
    facts: [
        {label: "客戶端", value: "推薦 Java 版", note: "基岩版可透過 Geyser 進入，但自訂介面支援有限"},
        {label: "版本", value: "26.1.2 及以上", note: "若資源包載入失敗，請使用最新客戶端"},
        {label: "必需", value: "接受資源包", note: "不需要任何客戶端模組"},
    ],
    expectations: [
        {
            icon: "fa-solid fa-route",
            title: "沒有任何傳送指令",
            summary: "沒有 /home、/spawn、/tpa、/rtp 或 /back。",
            detail: "距離本身就是一種戰略成本，而機動性正是「門」等途徑所提供的回報之一。請謹慎選擇定居的地點。",
        },
        {
            icon: "fa-solid fa-hourglass-half",
            title: "晉升被刻意拉長",
            summary: "低序列約需一週，高序列則需數月。",
            detail: "Mysterria 的設計是一整個賽季的旅程，而不是一個週末就把力量堆到頂。",
        },
        {
            icon: "fa-solid fa-rotate",
            title: "世界是賽季制的",
            summary: "大約每六個月進行一次完全重置。",
            detail: "重置同樣包括非凡者進度。這讓世界保持健康，也意味著在賽季中途加入依然值得。",
        },
        {
            icon: "fa-solid fa-shield-halved",
            title: "探索通常是安全的",
            summary: "野外 PvP 已關閉，破壞他人建築屬違規。",
            detail: "PvP 只存在於公告過的區域、宇宙入侵，或城鎮主人主動開啟 PvP 的領地之內。",
        },
        {
            icon: "fa-solid fa-box-open",
            title: "原版箱子裡裝的是魔法戰利品",
            summary: "自然生成的箱子會隨時間重新填充。",
            detail: "村莊、廢棄礦坑、神殿、沉船、堡壘遺蹟等結構都是可再生的非凡戰利品來源。",
        },
    ],
    tasks: [
        {
            icon: "fa-solid fa-plug",
            title: "進入伺服器",
            description: "版本、資源包、帳號與驗證。",
            topicId: "connect"
        },
        {
            icon: "fa-solid fa-scale-balanced",
            title: "選擇初始獎勵",
            description: "瞭解「捷徑」與「決心」，以及途徑選擇究竟意味著什麼。",
            topicId: "starter-choice"
        },
        {
            icon: "fa-solid fa-flask",
            title: "成為序列9",
            description: "配方、坩堝、材料、煉製與飲用。",
            topicId: "first-potion"
        },
        {
            icon: "fa-solid fa-box-open",
            title: "尋找配方或材料",
            description: "戰利品箱、定向、生物、資源節點與交易。",
            topicId: "loot"
        },
        {
            icon: "fa-solid fa-arrow-trend-up",
            title: "提升我的序列",
            description: "扮演、儀式、靈性、瘋狂與晉升。",
            topicId: "progression"
        },
        {
            icon: "fa-solid fa-dungeon",
            title: "尋找地牢",
            description: "使用 /subspace、削弱裂隙、組隊，並瞭解冷卻時間。",
            topicId: "activities"
        },
        {
            icon: "fa-solid fa-house-flag",
            title: "加入或建立城鎮",
            description: "受保護的土地、組隊玩法、國家，以及獨自發展。",
            topicId: "towns"
        },
        {
            icon: "fa-solid fa-wand-magic-sparkles",
            title: "修復缺失的自訂介面",
            description: "資源包、客戶端版本與基岩版的限制。",
            topicId: "troubleshooting"
        },
    ],
    firstHour: [
        {
            title: "連線伺服器並接受資源包",
            description: "新增 mc.mysterria.net，在大廳選擇器中進入 Mysteries，並接受伺服器資源包。",
            topicId: "connect"
        },
        {
            title: "只在 Minecraft 要求時才註冊",
            description: "離線帳號使用 /register 與 /login。正版帳號會自動完成驗證。",
            topicId: "connect"
        },
        {
            title: "驗證你的 Minecraft 帳號",
            description: "在個人資料頁生成驗證碼，然後在遊戲內彈出的驗證視窗中輸入。",
            topicId: "connect"
        },
        {
            title: "謹慎選擇初始獎勵",
            description: "途徑只是獎勵的方向。「捷徑」與「決心」的長期代價截然不同。",
            topicId: "starter-choice"
        },
        {
            title: "選擇城鎮生活或自給自足",
            description: "找一個正在招人的城鎮，或者開始獨自搜刮箱子與探索的循環。",
            topicId: "towns"
        },
        {
            title: "朝你的第一瓶魔藥努力",
            description: "第一個序列只需要配方、坩堝、材料和一次成功的煉製，別無其他。",
            topicId: "first-potion"
        },
    ],
    starterChoices: [
        {
            name: "捷徑之路",
            eyebrow: "立刻用上能力",
            benefit: "在所選途徑中直接成為序列9。",
            cost: "在每一個序列都永久損失 10% 靈性上限。",
            bestFor: "更看重立刻上手、而非長期最高強度的玩家。",
        },
        {
            name: "決心之路",
            eyebrow: "完整學會整個流程",
            benefit: "下一個戰利品箱必定開出配方。",
            cost: "無。",
            bestFor: "想學會煉製流程並保留完整潛力的玩家。",
            recommended: true,
        },
    ],
    directions: [
        {
            icon: "fa-solid fa-people-roof",
            title: "加入已有的城鎮",
            eyebrow: "阻力更小",
            description: "在聊天頻道或 Discord 裡詢問哪個城鎮正在接收新成員。",
            points: [
                "共享坩堝、配方、材料與受保護的土地。",
                "更容易湊到打守護者、地牢、野生非凡者與入侵的隊伍。",
                "在沒有傳送指令的世界裡，直接用上現成的基地網路。",
            ],
            topicId: "towns",
        },
        {
            icon: "fa-solid fa-compass",
            title: "獨自發展",
            eyebrow: "自己作主",
            description: "完全可行，只是更慢，也更依賴探索。",
            points: [
                "開啟每一個自然生成的箱子，它們的非凡戰利品會再生。",
                "獵殺非凡生物，並記下可再生的資源節點。",
                "把多餘的材料拿去交易，遇到特定內容時再臨時組隊。",
            ],
            topicId: "loot",
        },
    ],
    categories: {
        start: "從這裡開始",
        progression: "非凡者晉升",
        world: "世界與活動",
        community: "經濟與社會",
        help: "幫助與速查",
    },
    popularQuestions: [
        {question: "我怎麼傳送回家？", topicId: "server-basics"},
        {question: "為什麼遊戲看起來跟原版一樣？", topicId: "troubleshooting"},
        {question: "選了途徑就鎖定了嗎？", topicId: "starter-choice"},
        {question: "我怎麼才能成為序列9？", topicId: "first-potion"},
        {question: "特殊的戰利品箱在哪裡？", topicId: "loot"},
        {question: "我的扮演進度為什麼不動？", topicId: "progression"},
        {question: "探索的時候會被人殺嗎？", topicId: "server-basics"},
        {question: "我怎麼找到地牢？", topicId: "activities"},
    ],
    topics: [
        {
            id: "connect",
            category: "start",
            icon: "fa-solid fa-plug",
            title: "連線、註冊與驗證",
            shortTitle: "連線與驗證",
            summary: "用正確的客戶端進入 Mysteries 並解鎖初始獎勵所需的全部步驟。",
            answer: "用較新的 Java 版客戶端連線 mc.mysterria.net，接受資源包，在大廳中選擇 Mysteries，然後透過網站個人資料完成驗證。",
            tags: ["ip", "地址", "進服", "java", "基岩版", "geyser", "註冊", "登入", "驗證", "discord", "資源包", "版本", "正版", "離線"],
            sections: [
                {
                    title: "伺服器資訊",
                    bullets: [
                        "地址：mc.mysterria.net。",
                        "支援版本：26.1.2 及更新版本。",
                        "Java 版是完整支援的體驗，且不需要任何客戶端模組。",
                        "基岩版可以透過 Geyser 連線，但途徑圖示和部分自訂介面可能顯示異常。",
                    ],
                },
                {
                    title: "連線",
                    steps: [
                        "開啟「多人遊戲」，新增 mc.mysterria.net，然後進入伺服器。",
                        "當 Minecraft 詢問時，接受伺服器資源包。",
                        "在大廳的伺服器選擇器中選擇 Mysteries。",
                        "離開前讀一讀大廳 NPC 的對話，裡面有不少有用的入門資訊。",
                    ],
                    warning: "如果一切看起來都像原版 Minecraft，說明資源包被拒絕了，或者 Java 客戶端版本過舊。請啟用伺服器資源包並更新客戶端。",
                },
                {
                    title: "帳號註冊",
                    paragraphs: [
                        "正版 Minecraft 帳號無需註冊，會自動登入。",
                        "離線帳號需用 /register <密碼> <密碼> 註冊一次，之後每次進服使用 /login <密碼>。",
                    ],
                },
                {
                    title: "Discord 驗證",
                    steps: [
                        "在 Mysterria 網站登入並打開個人資料。",
                        "生成 Minecraft 驗證碼。",
                        "在遊戲內出現的驗證視窗中輸入該驗證碼。",
                        "確認之後，新手途徑與初始獎勵選單便會開放。",
                    ],
                },
            ],
            related: ["starter-choice", "troubleshooting", "server-basics"],
        },
        {
            id: "server-basics",
            category: "start",
            icon: "fa-solid fa-map",
            title: "Mysterria 的世界如何運作",
            shortTitle: "世界基礎",
            summary: "移動、安全、死亡、賽季重置，以及與傳統生存服不同的規則。",
            answer: "Mysterria 是一個有邊界的賽季制世界：距離有意義，野外探索是安全的，自然生成的箱子提供可再生的魔法戰利品。",
            tags: ["home", "spawn", "tpa", "rtp", "back", "傳送", "地圖", "pvp", "破壞", "死亡", "保留物品欄", "重置", "賽季", "世界邊界", "安全"],
            sections: [
                {
                    title: "地圖與移動",
                    paragraphs: ["主世界的邊界為 15,000 × 15,000 格。下界與特殊維度同樣存在，但絕大多數非凡內容都在主世界。"],
                    warning: "沒有 /home、/sethome、/spawn、/tpa、/rtp 或 /back。這樣才能保住規劃路線的價值，以及「門」這類機動途徑的意義。",
                },
                {
                    title: "安全與 PvP",
                    bullets: [
                        "野外 PvP 預設關閉。",
                        "PvP 僅限於指定的 PvP 區域和宇宙入侵區域。",
                        "城鎮主人可以在自己領地內為特定身份主動開啟 PvP。",
                        "破壞他人建築是被禁止的，城鎮領地還會額外提供土地保護。",
                    ],
                },
                {
                    title: "死亡",
                    paragraphs: ["除此之外，死亡遵循原版規則：物品會掉落，且不保留物品欄。非凡者還會額外獲得少量臨時瘋狂。"],
                    tip: "只有攜帶唯一性的玩家才會受到額外的適應懲罰。普通玩家不會因為正常死亡而損失序列進度。",
                },
                {
                    title: "賽季重置",
                    paragraphs: ["大約每六個月，世界與非凡者進度會一併重置。這既讓地圖保持健康，也讓賽季中途加入的新人不會永遠落在後面。"],
                },
            ],
            related: ["towns", "activities", "progression"],
        },
        {
            id: "starter-choice",
            category: "start",
            icon: "fa-solid fa-scale-balanced",
            title: "新手途徑與初始獎勵",
            shortTitle: "初始選擇",
            summary: "最初選擇的途徑實際改變了什麼，以及「捷徑」與「決心」之間的永久取捨。",
            answer: "你選擇的途徑既不會讓你成為非凡者，也不會鎖定你未來的途徑。它只決定兩種初始獎勵之一的方向。",
            tags: ["新手", "獎勵", "捷徑", "決心", "途徑", "鎖定", "重選", "magic", "序列9", "靈性", "配方保底"],
            sections: [
                {
                    title: "你的途徑並沒有被鎖定",
                    paragraphs: [
                        "只有飲下某條途徑的序列9魔藥，你才真正走上這條途徑。如果新手選單裡寫的是「愚者」，而你之後喝了「門」的魔藥，那你就是「門」途徑。",
                        "/magic 只是一個可選的建議選單。在那裡看到某條途徑，並不證明你已經是非凡者。",
                    ],
                },
                {
                    title: "捷徑之路",
                    paragraphs: ["你無需煉製便立刻成為序列9，但在每一個序列與每一級扮演上，都永久損失 10% 的靈性上限。"],
                    warning: "靈性懲罰是永久的。晉升或完成扮演都無法把它補回來。",
                },
                {
                    title: "決心之路",
                    paragraphs: ["你的配方定向計數會被推進到保底的前一步，因此下一個自然戰利品箱必定開出配方。此選擇沒有任何永久代價。"],
                    tip: "「決心」能讓你學會「配方 → 坩堝 → 材料 → 煉製」的正常流程，同時保住全部的長期強度。",
                },
                {
                    title: "確認與失誤",
                    paragraphs: ["確認之後玩家無法重選。若確實是新手誤操作，可以開一張 Discord 工單，管理組有時會予以重置。"],
                },
            ],
            related: ["first-potion", "progression", "connect"],
        },
        {
            id: "first-potion",
            category: "progression",
            icon: "fa-solid fa-flask",
            title: "煉製並飲下你的第一瓶魔藥",
            shortTitle: "第一瓶魔藥",
            summary: "完整的序列9配方與煉製流程，不含社群裡流傳的各種誤解。",
            answer: "抵達序列9需要：拿到配方、搭好坩堝、收集材料、成功煉製、然後飲用。你的第一瓶魔藥不需要扮演、儀式，也沒有瘋狂代價。",
            tags: ["序列9", "魔藥", "煉製", "坩堝", "配方", "材料", "非凡特性", "儀式", "祭壇", "過期", "槽位"],
            sections: [
                {
                    title: "你需要什麼",
                    bullets: [
                        "一份完整的序列9配方，或者它全部不同的配方書頁。",
                        "一座依照祭壇卷軸藍圖搭建的魔法坩堝。",
                        "與途徑和序列對應的主材料與輔助材料。",
                        "非凡特性可以一次性替換配方中的全部主材料。",
                    ],
                    warning: "獻祭祭壇用於恩賜，不能煉製魔藥。它的藍圖與坩堝藍圖長得很像。",
                },
                {
                    title: "煉製順序",
                    steps: [
                        "把主材料或非凡特性放入左側槽位。",
                        "把輔助材料放入右側槽位。",
                        "把配方放入中央槽位。",
                        "所有物品都要嚴格按照配方給出的順序擺放。",
                        "成功之後，飲下魔藥即可成為序列9。",
                    ],
                    tip: "煉製失敗不會消耗材料。更高階的坩堝提升的是成功率，而不是減少損失。",
                },
                {
                    title: "材料",
                    bullets: [
                        "可搜尋類材料只會出現在自然生成的戰利品箱中。",
                        "可掉落類材料只能從非凡生物身上獲得。",
                        "可採集類材料以獨立的世界節點形式生長，右鍵即可採集。",
                    ],
                },
                {
                    title: "魔藥過期",
                    paragraphs: ["魔藥從存在的那一刻起，只能儲存兩個現實日。請在準備好飲用時再煉製。過期的魔藥在條件允許時會變成對應的封印物，但不再提供原本的晉升效果。"],
                },
            ],
            related: ["loot", "starter-choice", "progression"],
        },
        {
            id: "loot",
            category: "progression",
            icon: "fa-solid fa-box-open",
            title: "尋找戰利品、配方與材料",
            shortTitle: "戰利品與定向",
            summary: "魔法材料究竟從哪裡來，以及定向保底如何降低運氣的影響。",
            answer: "每一個自然生成的原版箱子都是可再生的非凡戰利品容器。反覆搜刮它們，並把獎勵定向到你當前缺的那一類。",
            tags: ["戰利品", "箱子", "容器", "配方", "書頁", "材料", "祭壇卷軸", "定向", "保底", "野生非凡者", "生物", "節點", "能量碎片"],
            sections: [
                {
                    title: "戰利品容器",
                    paragraphs: ["村莊、廢棄礦坑、地牢、神殿、沉船、埋藏的寶藏、堡壘遺蹟和廢棄傳送門裡的箱子都算。並不存在什麼會發光的特殊非凡箱子。"],
                    tip: "箱子內容會隨時間再生。已經探索過的結構依然有價值，值得回頭再去。",
                },
                {
                    title: "獎勵定向",
                    paragraphs: ["從四類中選擇一類：魔藥、配方、書頁或祭壇卷軸。每一個沒開出該獎勵的合格箱子都會推進一個可見的計數，達到閾值的那個箱子必定開出它。"],
                    warning: "材料無法定向。它們只能從箱子裡找到、從生物身上取得、從資源節點採集、透過交易換取，或者經由其他系統轉化而來。",
                },
                {
                    title: "定向獲取",
                    bullets: [
                        "與態度平和的野生非凡者交易，換取特定途徑的物資。",
                        "使用 /subspace 並反覆打地牢，獲得可重複產出的材料。",
                        "獵殺非凡生物，獲取可掉落材料與扮演點數。",
                        "把多餘的材料交給無職業的傻子村民，換取能量碎片。",
                        "留意璀璨商行輪換的貨品。",
                    ],
                },
            ],
            related: ["first-potion", "activities", "economy"],
        },
        {
            id: "progression",
            category: "progression",
            icon: "fa-solid fa-arrow-trend-up",
            title: "扮演、儀式、靈性與瘋狂",
            shortTitle: "晉升",
            summary: "序列9之後的晉升如何運作，以及在哪裡檢視自己的當前狀態。",
            answer: "成為非凡者之後，晉升需要來自多個來源的扮演、下一瓶魔藥，以及越來越重要的儀式。你的完整狀態都在物品欄內的途徑介面裡。",
            tags: ["扮演", "消化", "儀式", "靈性", "法力", "瘋狂", "異變", "生命", "屬性", "狀態", "序列", "晉升", "懸賞", "瓶"],
            sections: [
                {
                    title: "檢視你的角色",
                    steps: [
                        "開啟物品欄。",
                        "點選左上角的途徑圖示。",
                        "把滑鼠懸停在介面中角色的頭部上。",
                    ],
                    tip: "這裡會顯示序列、扮演與消化、靈性以及瘋狂。沒有檢視狀態的指令。",
                },
                {
                    title: "扮演與消化",
                    paragraphs: ["單純地釋放法術並不一定推進扮演。每種能力都有其特定的扮演方式，扮演成功時會在物品欄上方出現提示。"],
                    bullets: [
                        "日常遊玩與各能力專屬的扮演方式。",
                        "扮演之瓶與輪換的懸賞任務。",
                        "完成地牢，獲得 PvE 扮演。",
                        "參與宇宙入侵，獲得 PvP 扮演。",
                    ],
                    warning: "任何單一的扮演來源都無法獨自達到 100%。請把多種來源結合起來。",
                },
                {
                    title: "儀式",
                    bullets: [
                        "序列9從不需要儀式。",
                        "晉升至序列8–6時，儀式是可選的，但跳過會帶來永久的賽季瘋狂。",
                        "晉升至序列5及以上時，儀式是強制的。",
                    ],
                },
                {
                    title: "靈性與瘋狂",
                    paragraphs: [
                        "靈性驅動能力，並會隨時間恢復。靈性上限隨序列與扮演進度而增長。",
                        "瘋狂分為臨時、永久與原始三部分。死亡與不安全的晉升會增加瘋狂；休息和某些機制只能降低其中可恢復的部分。",
                    ],
                    warning: "高瘋狂會帶來實際的遊戲影響，並可能導致異變。請認真對待晉升時的警告。",
                },
            ],
            related: ["first-potion", "activities", "advanced"],
        },
        {
            id: "activities",
            category: "world",
            icon: "fa-solid fa-dungeon",
            title: "生物、野生非凡者、地牢與入侵",
            shortTitle: "活動與地牢",
            summary: "提供戰利品、扮演進度與團隊目標的主要可重複活動。",
            answer: "用 /subspace 定位地牢，在探索途中獵殺非凡生物，與途徑相合的野生非凡者交易，並且務必先看清區域顏色再進入宇宙入侵。",
            tags: ["地牢", "subspace", "裂隙", "隊伍", "冷卻", "協助卡", "生物", "血月", "野生非凡者", "守護者", "入侵", "pvp", "黑色區域"],
            sections: [
                {
                    title: "地牢與裂隙",
                    steps: [
                        "執行 /subspace，檢視所有地牢、其裂隙位置、你的相對強度以及冷卻時間。",
                        "走到裂隙處，若它仍需削弱，則投入能量碎塊。",
                        "用 /party 組隊，並在可進入時進入。",
                    ],
                    bullets: [
                        "每座地牢每三天可獲得一次真實戰利品。",
                        "每天另有兩次協助卡挑戰，但不產出正常戰利品。",
                        "只要剩下的隊伍不算超模，減員挑戰是允許的，且獎勵不會減少。",
                    ],
                },
                {
                    title: "生物與血月",
                    paragraphs: ["非凡生物提供經驗、扮演點數與途徑材料。在大約每週一次的血月期間，釣魚會變成一條價值可觀但更危險的額外戰利品來源。"],
                },
                {
                    title: "野生非凡者與守護者",
                    paragraphs: ["野生非凡者的態度取決於途徑之間的關係。態度平和的能提供全服最有針對性的材料與配方交易；抱有敵意的則是硬仗。守護者守護著重要目標，是為團隊設計的。"],
                },
                {
                    title: "宇宙入侵",
                    paragraphs: ["入侵是公告過的 PvP 目標。綠色與黃色區域主要只危及隨身物品，並會平衡不同序列之間的傷害。黑色區域則帶有序列跌落的嚴重風險。"],
                    warning: "進入之前請先讀清區域顏色與規則。走進入侵，就是主動選擇了 PvP。",
                },
            ],
            related: ["loot", "progression", "server-basics"],
        },
        {
            id: "towns",
            category: "community",
            icon: "fa-solid fa-house-flag",
            title: "城鎮、國家、戰爭與獨自發展",
            shortTitle: "城鎮與國家",
            summary: "受保護的聚落如何改變前期體驗，以及自給自足的路線是什麼樣的。",
            answer: "加入城鎮是最快的社交開局，而獨自遊玩同樣完全可行。城鎮提供受保護的領地、共享的基礎設施、組隊渠道，以及後期的被動加成。",
            tags: ["城鎮", "lands", "領地", "國家", "戰爭", "單人", "加入", "定居", "基地", "破壞", "身份", "加成"],
            sections: [
                {
                    title: "加入城鎮",
                    paragraphs: ["在遊戲聊天或 Discord 裡詢問哪個城鎮在接收新人。老玩家可以分享配方、材料、坩堝、經驗，以及挑戰困難內容所需的隊伍。"],
                    tip: "在一個沒有傳送指令的世界裡，一個位置好的聚落和一群有經驗的鄰居，是相當可觀的優勢。",
                },
                {
                    title: "獨自發展",
                    steps: [
                        "選一個合理的基地位置，並記下重要座標。",
                        "開啟每一個自然生成的箱子，並把獎勵定向到你當前最缺的東西。",
                        "獵殺生物、記錄資源節點，並利用野生非凡者的交易。",
                        "臨時加入地牢或入侵隊伍，同時不必放棄獨立性。",
                    ],
                },
                {
                    title: "領地、等級與國家",
                    paragraphs: ["城鎮採用 Lands 風格的身份與領地。城鎮等級越高，越能解鎖人口上限、金庫要求、被動加成與建築收益。達到領域級別的城鎮可以組成國家。"],
                },
                {
                    title: "戰爭",
                    paragraphs: ["戰爭是自願參與的結構化衝突，透過專門的指令和伺服器規則來管理。在指定的戰鬥場合之外，正常的野外探索依然受到保護。"],
                },
            ],
            related: ["server-basics", "economy", "social"],
        },
        {
            id: "economy",
            category: "community",
            icon: "fa-solid fa-coins",
            title: "貨幣、能量碎片與璀璨商行",
            shortTitle: "經濟",
            summary: "不同貨幣各自能買什麼，以及日常遊玩如何把多餘的材料變成實際進度。",
            answer: "用 /wallet 管理科佩、里克與因蒂費爾；把不需要的魔法材料轉化為能量碎片；透過社群活動賺取獨立的商行點數。",
            tags: ["金錢", "貨幣", "錢包", "科佩", "里克", "因蒂費爾", "能量碎片", "商行", "每日", "投票", "收入", "絲綢之觸", "出售"],
            sections: [
                {
                    title: "金錢與錢包",
                    paragraphs: ["主要貨幣為科佩、里克與因蒂費爾，透過 /wallet 管理。物品估價是主要收入來源，但只有用絲綢之觸開採的不可再生礦石才符合條件。"],
                },
                {
                    title: "能量碎片",
                    paragraphs: ["把多餘的途徑材料與配方交給無職業的傻子村民。能量碎片可用於野生非凡者交易、削弱裂隙、秘密組織升級以及賽季活動。"],
                },
                {
                    title: "璀璨商行",
                    paragraphs: ["商行輪換各類實用貨品，其中包括魔藥配方。商行點數與普通貨幣彼此獨立，來自投票、連續登入以及被採納的錯誤報告。"],
                    commands: [
                        {command: "/emporium 或 /emp", purpose: "開啟璀璨商行"},
                        {command: "/daily", purpose: "開啟每日獎勵選單"},
                        {command: "/vote", purpose: "開啟伺服器投票"},
                        {command: "/wallet", purpose: "存放金錢、估價物品與進行支付"},
                    ],
                },
            ],
            related: ["loot", "towns", "advanced"],
        },
        {
            id: "social",
            category: "community",
            icon: "fa-solid fa-people-group",
            title: "信使、秘密組織與社交玩法",
            shortTitle: "社交系統",
            summary: "用於交流、寄送、私密團體與共享設施的各項系統。",
            answer: "日常交流用普通私聊，寄送實物用信使，長期的私密團體則用秘密組織——它有自己的升級與專屬空間。",
            tags: ["信使", "號角", "寄送", "訊息", "msg", "秘密組織", "組織", "oc", "邀請", "sos", "團體"],
            sections: [
                {
                    title: "信使",
                    paragraphs: ["信使號角可以召來不同型別的信使，用於寄送實物。每種寄送在容量、距離和安全性上都有自己的規則，所以在託運貴重貨物之前，請先查清所選的信使。"],
                },
                {
                    title: "秘密組織",
                    paragraphs: ["組織是長期存在的私密團體，擁有成員、幹部、聊天頻道、升級與緊急工具。發展到後期還能提供「即時召喚」和秘密巢穴之類的機動手段。"],
                    commands: [
                        {command: "/o invite、/o kick", purpose: "管理組織成員"},
                        {command: "/o vice set/remove", purpose: "管理副首領"},
                        {command: "/o sos", purpose: "使用組織緊急求援系統"},
                        {command: "/oc", purpose: "開啟組織私密頻道"},
                    ],
                },
                {
                    title: "私聊",
                    commands: [
                        {command: "/msg、/pm、/w", purpose: "傳送私聊訊息"},
                        {command: "/reply", purpose: "回覆最近一條私聊"},
                    ],
                },
            ],
            related: ["towns", "economy", "advanced"],
        },
        {
            id: "advanced",
            category: "world",
            icon: "fa-solid fa-star-of-life",
            title: "長期與進階系統",
            shortTitle: "進階系統",
            summary: "簡要梳理那些在賽季後期才變得重要的系統。",
            answer: "恩賜、封印物、教會、尊名、唯一性、火器等專門系統都屬於長期的額外層次，而不是你頭幾天的必修課。",
            tags: ["恩賜", "封印物", "教會", "尊名", "唯一性", "序列0", "火器", "飲品", "戰鬥通行證", "訂閱", "商店", "創作者"],
            sections: [
                {
                    title: "恩賜與獻祭祭壇",
                    paragraphs: ["恩賜是一條獨立的成長線，透過獻祭祭壇推進。它不會取代你的途徑，而它的祭壇也無法煉製魔藥。"],
                },
                {
                    title: "封印物",
                    paragraphs: ["封印物提供強大的效果，同時伴隨負面影響。它們可以來自制作、戰利品或過期的魔藥，應當被當作取捨來權衡，而不是無條件的升級。"],
                },
                {
                    title: "教會與尊名",
                    paragraphs: ["教會是圍繞信仰、錨點、祈禱、土地與可變加成建立的後期機構。尊名允許進行儀式性的溝通，並且隨著持有者序列的提升而變短。"],
                },
                {
                    title: "唯一性與序列0",
                    paragraphs: ["一條途徑的唯一性是通往序列0的路上的一環，並且需要適應。持有唯一性會讓死亡額外懲罰適應進度。"],
                },
                {
                    title: "可選的支援方式",
                    paragraphs: ["商店、付費戰鬥通行證與訂閱用於支援伺服器並提供便利。免費玩家依然可以抵達每一個層級的力量。"],
                },
            ],
            related: ["progression", "economy", "social"],
        },
        {
            id: "troubleshooting",
            category: "help",
            icon: "fa-solid fa-screwdriver-wrench",
            title: "連線與介面問題排查",
            shortTitle: "問題排查",
            summary: "針對自訂介面缺失、驗證失敗、客戶端不相容與基岩版限制的快速解答。",
            answer: "魔法介面缺失，幾乎總是意味著資源包被拒絕，或者 Java 客戶端需要更新。基岩版在自訂介面上存在無法迴避的限制。",
            tags: ["問題", "損壞", "缺失", "原版", "介面", "ui", "資源包", "驗證", "驗證碼", "過期", "基岩版", "手機", "geyser", "客戶端過舊", "連線"],
            sections: [
                {
                    title: "伺服器看起來像原版",
                    steps: [
                        "編輯伺服器條目，把「伺服器資源包」設為「啟用」。",
                        "重新連線並接受資源包。",
                        "如果仍然靜默失敗，請更新 Java 客戶端後重連。",
                    ],
                    warning: "基岩版玩家仍可能看到途徑圖示缺失或自訂介面顯示錯亂。這是 Geyser 的已知限制。",
                },
                {
                    title: "驗證沒有完成",
                    steps: [
                        "回到個人資料頁，重新生成一個驗證碼。",
                        "在遊戲內的驗證視窗中輸入它。",
                        "如果是 Discord 網站登入本身失敗，請清除站點 Cookie 後重試。",
                        "若帳號始終無法綁定，請開一張 Discord 工單。",
                    ],
                },
                {
                    title: "我連不上伺服器",
                    bullets: [
                        "確認地址完全是 mc.mysterria.net。",
                        "使用 Minecraft 26.1.2 或更新版本。",
                        "離線帳號首次註冊之後，每次都必須使用 /login。",
                    ],
                },
            ],
            related: ["connect", "commands", "server-basics"],
        },
        {
            id: "commands",
            category: "help",
            icon: "fa-solid fa-terminal",
            title: "核心指令速查",
            shortTitle: "指令",
            summary: "玩家常用指令的精簡清單，以及那些被刻意取消的指令。",
            answer: "絕大多數角色資訊都透過物品欄介面檢視。指令主要用於開啟選單、管理團體或進行交流。",
            tags: ["指令", "magic", "daily", "vote", "wallet", "subspace", "party", "bounty", "lands", "claim", "war", "church", "home", "spawn", "tpa"],
            sections: [
                {
                    title: "開局與晉升",
                    commands: [
                        {command: "/register <密碼> <密碼>", purpose: "為離線帳號註冊一次"},
                        {command: "/login <密碼>", purpose: "登入離線帳號"},
                        {command: "/magic", purpose: "開啟可選的下一步指引"},
                        {command: "/subspace", purpose: "瀏覽地牢、位置、強度與冷卻"},
                        {command: "/party", purpose: "建立或管理地牢隊伍"},
                        {command: "/bounty", purpose: "開啟扮演懸賞選單"},
                    ],
                },
                {
                    title: "經濟與社群",
                    commands: [
                        {command: "/wallet", purpose: "管理貨幣、估價與支付"},
                        {command: "/daily", purpose: "開啟每日獎勵"},
                        {command: "/emporium 或 /emp", purpose: "開啟璀璨商行"},
                        {command: "/vote", purpose: "開啟投票選項"},
                        {command: "/lands …", purpose: "管理城鎮、身份與領地"},
                        {command: "/claim 與 /unclaim", purpose: "圈定或釋放當前區塊"},
                        {command: "/wars", purpose: "開啟戰爭管理"},
                    ],
                },
                {
                    title: "不存在的指令",
                    paragraphs: ["伺服器刻意沒有 /home、/sethome、/spawn、/tpa、/rtp 或 /back。移動與機動性本身就是晉升的一部分。"],
                    warning: "檢視序列、扮演、靈性與瘋狂不是靠指令。請開啟物品欄，點選左上角的途徑圖示，然後把滑鼠懸停在角色頭部上。",
                },
            ],
            related: ["server-basics", "activities", "economy"],
        },
    ],
};

export default zhTW;

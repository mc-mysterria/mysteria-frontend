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


export type Jsonified<T> =
    T extends string ? string
        : T extends readonly (infer U)[] ? Jsonified<U>[]
            : T extends object ? { [K in keyof T]: Jsonified<T[K]> }
                : T;

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

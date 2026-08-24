/**
 * Ambient types for app-level globals registered in main.ts.
 * (`window.$cookies` is declared separately in src/shims-vue.d.ts.)
 */

export {};

declare module "vue" {
    interface ComponentCustomProperties {
        /**
         * Prefixes an absolute internal path with the active locale, e.g.
         * `$lp('/guide')` -> `/zh-TW/guide`. External URLs and bare fragments
         * pass through untouched. See src/composables/useLocalePath.ts.
         */
        $lp: (path: string) => string;
    }
}

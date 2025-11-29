declare module "*.vue" {
    import {DefineComponent} from "vue";
    const component: DefineComponent<
        Record<string, never>,
        Record<string, never>,
        unknown
    >;
    export default component;
}

import {VueCookies} from "vue-cookies";

declare global {
    interface Window {
        $cookies: VueCookies;
    }
}


import "./assets/main.css";

import {createApp} from "vue";
import {createPinia} from "pinia";
import VueCookies from "vue-cookies";
import VueDOMPurifyHTML from 'vue-dompurify-html';

import App from "./App.vue";
import router from "./router";
import {useAuthStore} from "@/stores/auth";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(VueCookies);
app.use(VueDOMPurifyHTML);

window.$cookies = VueCookies.VueCookies;

const authStore = useAuthStore(pinia);
authStore.init();

app.mount("#app");

// Performance monitoring in development
if (import.meta.env.DEV) {
    console.log('🚀 Performance monitoring enabled in development mode');

    // Monitor long tasks that could cause jank
    if ('PerformanceObserver' in window) {
        try {
            const longTaskObserver = new PerformanceObserver((entries) => {
                entries.getEntries().forEach((entry) => {
                    if (entry.duration > 50) {
                        console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`, {
                            startTime: entry.startTime.toFixed(2),
                            duration: entry.duration.toFixed(2),
                            name: entry.name
                        });
                    }
                });
            });
            longTaskObserver.observe({entryTypes: ['longtask']});

            // Monitor largest contentful paint
            const lcpObserver = new PerformanceObserver((entries) => {
                const lcpEntry = entries.getEntries()[entries.getEntries().length - 1];
                console.log(`📊 LCP: ${lcpEntry.startTime.toFixed(2)}ms`);
            });
            lcpObserver.observe({entryTypes: ['largest-contentful-paint']});

            // Monitor cumulative layout shift
            const clsObserver = new PerformanceObserver((entries) => {
                let clsValue = 0;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                entries.getEntries().forEach((entry: any) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                if (clsValue > 0) {
                    console.log(`📏 CLS: ${clsValue.toFixed(4)}`);
                    if (clsValue > 0.1) {
                        console.warn(`⚠️ High CLS detected: ${clsValue.toFixed(4)} (should be < 0.1)`);
                    }
                }
            });
            clsObserver.observe({entryTypes: ['layout-shift']});

            // Monitor first input delay
            const fidObserver = new PerformanceObserver((entries) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                entries.getEntries().forEach((entry: any) => {
                    console.log(`⚡ FID: ${entry.processingStart - entry.startTime}ms`);
                    if (entry.processingStart - entry.startTime > 100) {
                        console.warn(`⚠️ High FID detected: ${(entry.processingStart - entry.startTime).toFixed(2)}ms (should be < 100ms)`);
                    }
                });
            });
            fidObserver.observe({entryTypes: ['first-input']});

        } catch (error) {
            console.log('Performance monitoring setup failed:', error);
        }
    }

    // Monitor memory usage (Chrome only)
    if ('memory' in performance) {
        const logMemory = () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const memory = (performance as any).memory;
            console.log(`💾 Memory: ${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB used / ${(memory.totalJSHeapSize / 1048576).toFixed(2)}MB total`);
        };

        // Log memory usage every 30 seconds
        setInterval(logMemory, 30000);

        // Initial memory log
        setTimeout(logMemory, 2000);
    }

    // Log application startup time
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            console.log(`🕐 App startup metrics:`, {
                'DNS Lookup': `${(perfData.domainLookupEnd - perfData.domainLookupStart).toFixed(2)}ms`,
                'TCP Connection': `${(perfData.connectEnd - perfData.connectStart).toFixed(2)}ms`,
                'Server Response': `${(perfData.responseEnd - perfData.requestStart).toFixed(2)}ms`,
                'DOM Interactive': `${perfData.domInteractive.toFixed(2)}ms`,
                'DOM Complete': `${perfData.domComplete.toFixed(2)}ms`,
                'Load Event': `${perfData.loadEventEnd.toFixed(2)}ms`,
                'Total Load Time': `${perfData.loadEventEnd.toFixed(2)}ms`
            });
        }, 1000);
    });
}

import { createApp } from "vue";
import App from "./App.vue";
import "./assets/styles.css";

import router from "./router/routes";

import 'primeicons/primeicons.css'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

import { createPinia } from "pinia";



const app = createApp(App);

// Pinia
const pinia = createPinia();
app.use(pinia);

// PrimeVue
app.use(PrimeVue, {
  theme: {
    ripple: true,
    preset: Aura,
    options: {
        cssLayer: {
            name: 'primevue',
            order: 'theme, base, primevue'
        }
    }
  },
});

// Router
app.use(router);

// Mount
app.mount("#app");

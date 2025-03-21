import { createApp } from "vue";
import App from "./App.vue";
import "./assets/styles.css";
import { createPinia } from "pinia";
import router from "./router/routes";

import 'primeicons/primeicons.css'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

// Select
import Select from 'primevue/select'

// Toast
import ToastService from 'primevue/toastservice';

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

// Toast
app.use(ToastService);

// Select
app.component('Select', Select);

// Router
app.use(router);

// Mount
app.mount("#app");

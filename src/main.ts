import { createApp } from "vue";
import App from "./App.vue";
import "./assets/styles.css";
import { createPinia } from "pinia";
import router from "./router/routes";

import 'primeicons/primeicons.css'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

// primevue
import Select from 'primevue/select'
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import ToggleSwitch from 'primevue/toggleswitch';
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import Toast from 'primevue/toast'

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

// primevue components
app.component('Select', Select);
app.component('ToggleSwitch', ToggleSwitch);
app.component('Accordion', Accordion);
app.component('AccordionPanel', AccordionPanel);
app.component('AccordionHeader', AccordionHeader);
app.component('AccordionContent', AccordionContent);
app.component('Toast', Toast)

// primevue directives
app.directive('tooltip', Tooltip);

// Router
app.use(router);

// Mount
app.mount("#app");

import './assets/main.css';
import App from '@/App.vue';
import {createApp} from 'vue';
import {autoAnimatePlugin} from '@formkit/auto-animate/vue'

const app = createApp(App);
app.use(autoAnimatePlugin);
app.mount('#app');

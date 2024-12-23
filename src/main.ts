import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import SvgIcon from '@jamescoyle/vue-icon'
import { TinyEmitter } from 'tiny-emitter'
import VueSelect from "vue-select";



export const emitter = new TinyEmitter();

const app = createApp(App)

app.component("svg-icon", SvgIcon);
app.component("v-select", VueSelect);

app.mount("#app");

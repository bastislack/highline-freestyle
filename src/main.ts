import { createApp } from 'vue'
import './tailwind.css'
import App from './App.vue'
import router from './routes/router'
import { createI18n } from "vue-i18n"
import { getPreferredLocale } from './util/locale'

createApp(App)
  .use(createI18n({
    fallbackLocale: "en",
    locale: getPreferredLocale(),
    legacy: false
  }))
  .use(router)
  .mount('#app')

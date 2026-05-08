import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { router } from "@/app/router";
import themeService from "@/core/theme/themeService";

// Apply saved/system theme before mounting so initial render matches
themeService.apply();

createApp(App).use(router).mount("#app");

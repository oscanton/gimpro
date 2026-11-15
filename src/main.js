import "./ui/styles.css";
import { GimproApp } from "./ui/app.js";
import { registerServiceWorker } from "./pwa/register.js";

const root = document.querySelector("#app");
if (!root) throw new Error("No se encontró el contenedor principal.");

const app = new GimproApp(root);
app.start();
registerServiceWorker();

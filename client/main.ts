import { Meteor } from "meteor/meteor";
import App from "../imports/ui/App.svelte";

Meteor.startup(() => {
  new App({
    target: document.getElementById("app"),
  });
  document.documentElement.setAttribute("data-theme", "light");
});

Meteor.startup(async function () {
  // if(typeof navigator.serviceWorker !== "undefined"){
  //   Meteor.serviceWorker = await navigator.serviceWorker.register('/sw.js')
  // }
});

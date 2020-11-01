import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { sync } from "vuex-router-sync";

// Import the extension
import Extension from "../assets/index";

// Import the Design System
import ODS from "owncloud-design-system";
import "owncloud-design-system/dist/system/system.css";

Vue.config.productionTip = false;
Vue.use(ODS);

const registerStoreModule = app => {
  if (app.store.default) {
    return store.registerModule(app.appInfo.name, app.store.default);
  }

  return store.registerModule(app.appInfo.name, app.store);
};

const mount = () => {
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount("#app");
};

(() => {
  // Redirect to default path
  const routes = [
    Extension.navItems && {
      path: "/",
      redirect: () => Extension.navItems[0].route
    }
  ];

  if (!Extension.appInfo) {
    console.error("Tried to load an extension with missing appInfo");
  }

  if (Extension.routes) {
    // rewrite relative app routes by adding their corresponding appId as prefix
    Extension.routes.forEach(
      r => (r.path = `/${encodeURI(Extension.appInfo.id)}${r.path}`)
    );

    // adjust routes in nav items
    if (Extension.navItems) {
      Extension.navItems.forEach(nav => {
        const r = Extension.routes.find(function(element) {
          return element.name === nav.route.name;
        });

        if (r) {
          r.meta = r.meta || {};
          r.meta.pageTitle = nav.name;
          nav.route.path = nav.route.path || r.path;
        } else {
          console.error(`Unknown route name ${nav.route.name}`);
        }
      });
    }

    routes.push(Extension.routes);
  }

  if (Extension.store) {
    registerStoreModule(Extension);
  }

  router.addRoutes(routes.flat());
  sync(store, router);
  mount();
})();

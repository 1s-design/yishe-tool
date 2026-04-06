import { hasValidToken, useLoginStatusStore } from "@/store/stores/login";

export const blockLoginPage = (router) => {
  router.beforeEach((to, from, next) => {
    const loginStatusStore = useLoginStatusStore();
    const loggedIn = loginStatusStore.isLogin || hasValidToken(loginStatusStore.token);
    if (to.name === "Login" && loggedIn) {
      next({ name: "Home" });
    } else if (!loggedIn && to.name !== "Login" && to.name !== "Signup") {
      next({ name: "Login" });
    } else {
      next();
    }
  });
};

/**
 * 进管理员可进入
*/
export const blockAdminPage = (router) => {
  router.beforeEach((to, from, next) => {
    let loginStatusStore = useLoginStatusStore();

    if (to.name === "Admin") {
      if (!loginStatusStore.userInfo?.isAdmin) {
        return next({ name: "Home" });
      }
    }

    next()
  });
};


export const initDocumentTitle = (router) => {
  router.beforeEach((to, from, next) => {
    document.title = to.meta.title ? '1s 衣设网- ' + to.meta.title : '1s 衣设网'
    next()
  })
}

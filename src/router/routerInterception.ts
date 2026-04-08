import { publicAppConfig } from "@/config/public";

export const initDocumentTitle = (router) => {
  router.beforeEach((to, from, next) => {
    document.title = to.meta.title
      ? `${publicAppConfig.appName} - ${to.meta.title}`
      : publicAppConfig.appName
    next()
  })
}

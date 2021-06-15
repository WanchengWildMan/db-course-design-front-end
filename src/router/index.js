import Vue from 'vue'
import Router from 'vue-router'
import Commodity from "../pages/commodity/Commodity";


Vue.use(Router)

function route(path, file, name, children) {
  return {
    exact: true,
    path,
    name,
    children,
    component: () => import('../pages' + file)
  }
}

export default new Router({
  routes: [
    route("/login", '/Login', "Login"),// /login路径，路由到登录组件
    {
      path: "/", // 根路径，路由到 Layout组件
      component: () => import('../pages/Layout'),
      redirect: "/index/dashboard",
      children: [ // 其它所有组件都是 Layout的子组件
        route("/index/dashboard", "/Dashboard", "Dashboard"),
        route("/item/category", '/item/Category', "Category"),
        route("/item/brand", '/item/Brand', "Brand"),
        route("/item/list", '/item/Goods', "Goods"),
        route("/item/specification", '/item/specification/Specification', "Specification"),
        route("/user/statistics", '/item/Statistics', "Statistics"),
        route("/trade/promotion", '/trade/Promotion', "Promotion"),
        route("/commodity/totalview", '/commodity/Commodity', "Commodity"),
        route("/commodity/category", '/commodity/Category', "Category"),
        route("/commodity/unit", '/commodity/Unit', "Unit"),
        route("/commodity/inventory", '/commodity/Inventory', "Inventory"),
        route("/trade/billInfo", '/bill/Bill', "Bill"),
        route("/trade/purchase", '/purchase/Purchase', "Purchase"),
        route("trade/provider", "/purchase/Provider", "Provider"),
        route("/cashier", '/Cashier', "Cashier"),
        route("/user/employee", "/user/Employee", "Employee"),
        route("/user/role", "/user/Role", "Role"),
      ]
    },


  ]
})

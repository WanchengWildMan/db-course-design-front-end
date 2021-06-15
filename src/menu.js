var menus = [
  {
    action: "home",
    title: "首页",
    path: "/index",
    items: [{ title: "统计", path: "/dashboard" }]
  },
  {
    action: "apps",
    title: "商品管理",
    path: "/commodity",
    items: [
      { title: "总览", path: "/totalview" },
      { title: "分类管理", path: "/category" },
      { title: "商品单位管理", path: "/unit" },
      { title: "库存管理", path: "/inventory" },
      { title: "供应商管理", path: "/provider" }
    ]
  },

  {
    action: "attach_money",
    title: "销售管理",
    path: "/trade",
    items: [
      { title: "收银单管理", path: "/billInfo" },
      { title: "进货单管理", path: "/purchase" },///!!!

    ]
  },
  {
    action: "attach_money",
    title: "收银台",
    path: "/cashier",
    items: [
      { title: "收银台", path: "/" },

    ]
  },
  {
    action: "people",
    title: "人员管理",
    path: "/user",
    items: [

      { title: "权限种类管理", path: "/role" },
      { title: "员工信息管理", path: "/employee" }
    ]
  }
]

export default menus;

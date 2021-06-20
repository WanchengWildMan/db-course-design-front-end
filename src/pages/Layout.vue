<template>
  <v-app :dark="dark">
    <!-- 左侧导航条 -->
    <v-navigation-drawer
      :dark="dark"
      :mini-variant.sync="miniVariant"
      v-model="drawer"
      enable-resize-watcher
      app
    >
      <v-toolbar flat class="transparent">
        <v-list class="pa-0">
          <v-list-item avatar>
            <v-list-item-avatar>
              <img src="../assets/2.jpeg" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>XX商店</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-toolbar>
      <v-divider />
      <!-- 左侧菜单 -->
      <v-list class="pt-0" dense>
        <v-list-group
          v-model="item.active"
          v-for="item in items"
          :key="item.title"
          :prepend-icon="item.action"
          no-action
        >
          <!--一级菜单 -->
          <v-list-item slot="activator">
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <!-- 二级菜单 -->
          <v-list-item
            v-for="subItem in item.items"
            :key="subItem.title"
            :to="item.path + subItem.path"
          >
            <v-list-item-content>
              <v-list-item-title>{{ subItem.title }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon>{{ subItem.action }}</v-icon>
            </v-list-item-action>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
    <!-- 顶部工具条 -->
    <v-toolbar app dark :color="dark ? 'secondary' : 'primary'">
      <!-- 收起左侧菜单的按钮-->
      <v-btn icon @click.native="drawer = !drawer">
        <v-icon v-html="drawer ? 'chevron_right' : 'chevron_left'" />
      </v-btn>
      <!-- 切换黑暗主题 -->
      <v-flex xs1>
        <v-switch
          :label="dark ? '暗黑' : '明亮'"
          v-model="dark"
          color="dark"
          hide-details
        />
      </v-flex>
      <!-- 顶部导航标题 -->
      <v-flex xs3></v-flex>
      <v-toolbar-title v-text="title" />
      <v-spacer />

        <!-- 调色板 -->
        <v-btn icon @click.stop="dark = !dark">
          <v-icon>invert_colors</v-icon>
          配色
        </v-btn>

      <!-- 顶部导航用户菜单 -->
      <v-content>
        <v-btn icon @click.stop="showUserInfo = !showUserInfo">
          <v-icon>account_box</v-icon>
          {{ "用户 " + username }}
        </v-btn>
      </v-content>
      <v-content>
        <v-btn icon @click.stop="logout">
          <v-icon>mdi-door-open</v-icon>
          退出
        </v-btn>
      </v-content>
    </v-toolbar>
    <!--中间内容主体-->
    <v-content>
      <v-breadcrumbs>
        <!-- <template v-slot:divider>
        <v-icon>mdi-forward</v-icon>
      </template> -->
        <!-- <v-icon slot="divider">chevron_right</v-icon> -->
        <v-breadcrumbs-item>{{ item1 }}/</v-breadcrumbs-item>
        <v-breadcrumbs-item>{{ item2 }}</v-breadcrumbs-item>
      </v-breadcrumbs>
      <v-dialog v-model="showUserInfo">
        <v-list>
          <v-list-item>
            <v-list-item-content>姓名</v-list-item-content>
            <v-list-item-content class="align-end"
              >{{ user.name }}
            </v-list-item-content>
          </v-list-item>
                    <v-list-item>
            <v-list-item-content>编号</v-list-item-content>
            <v-list-item-content class="align-end"
              >{{ user.employeeId }}
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>职位</v-list-item-content>
            <v-list-item-content class="align-end"
              >{{ user.position }}
            </v-list-item-content>
          </v-list-item>

           <v-list-item>
            <v-list-item-content>权限</v-list-item-content>
            <v-list-item-content class="align-end"
              >{{ user.role.roleName }}
            </v-list-item-content>
          </v-list-item>
           <v-list-item>
            <v-list-item-content>权限等级</v-list-item-content></v-list-item-content>
            <v-list-item-content class="align-end"
              >{{ user.role.roleLevel }}
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-dialog>
      <div>
        <!--定义一个路由锚点，Layout的子组件内容将在这里展示-->
        <router-view />
      </div>
    </v-content>
  </v-app>
</template>

<script>
import menus from "../menu";

export default {
  data() {
    return {
      dark: false, // 是否暗黑主题
      drawer: true, // 左侧导航是否隐藏
      miniVariant: false, // 左侧导航是否收起
      title: "XX商店后台管理", // 顶部导航条名称,
      showUserInfo: false,
      menuMap: {},
    };
  },
  computed: {
    items() {
      return menus;
    },
    item1() {
      const arr = this.$route.path.split("/");
      return this.menuMap[arr[1]].name;
    },
    item2() {
      const arr = this.$route.path.split("/");
      return this.menuMap[arr[1]][arr[2]];
    },
    username() {
      return JSON.parse(sessionStorage.getItem("user")).name;
    },
    user() {
      return JSON.parse(sessionStorage.getItem("user"));
    },
  },
  name: "App",
  watch: {},
  created() {
    menus.forEach((m) => {
      const p1 = m.path.slice(1);
      this.menuMap[p1] = { name: m.title };
      m.items.forEach((i) => {
        this.menuMap[p1][i.path.slice(1)] = i.title;
      });
    });
  },
  methods: {
    logout() {
      this.$http.get("/user/employee/logout").then((r) => {
        if (r.data.result == "已退出系统") this.$message.success("已退出系统");
        sessionStorage.removeItem("user");
        console.log(sessionStorage);
        this.$router.push({ name: "Login" });
      });
    },
  },
};
</script>

<style scoped>
.box {
  width: 90%;
}
</style>

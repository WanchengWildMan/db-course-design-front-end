<template>
  <v-app>
    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-card class="elevation-12">
              <v-toolbar dark color="primary">
                <v-toolbar-title>商店管理</v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-card-text>
                <v-form>
                  <v-text-field
                    required
                    prepend-icon="person"
                    v-model="username"
                    label="用户名"
                    type="text"
                  />
                  <v-text-field
                    required
                    prepend-icon="lock"
                    v-model="password"
                    label="密码"
                    id="password"
                    :append-icon="e1 ? 'visibility' : 'visibility_off'"
                    :append-icon-cb="() => (e1 = !e1)"
                    :type="e1 ? 'text' : 'password'"
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="doLogin">登录</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <v-dialog v-model="dialog" width="300px">
      <v-alert icon="warning" color="error" :value="true">
        用户名和密码不能为空
      </v-alert>
    </v-dialog>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    username: "",
    password: "",
    dialog: false,
    e1: false,
  }),
  methods: {
    async doLogin() {
      if (!this.username || !this.password) {
        this.dialog = true;
        return false;
      }
      try {
        const res = await this.$http.request({
          url: "/user/employee/login",
          params: {
            username: this.username,
            password: this.password,
          },
        });
        console.log(res);
        // JSON.parse(sessionStorage.getItem('user'))=.user;
        // sessionStorage.setItem("employeeId", res.session);
        console.log("session", sessionStorage);
        this.$router.push("/");
        sessionStorage.setItem("user", JSON.stringify(res.data.result.user));
        console.log(sessionStorage);
      } catch (e) {
        console.log(e.message);
        if (e.message.includes("403"))
          // if (response.status == 403) {
          this.$message.error("用户名或密码错误！！！");
        // }
      }
    },
  },
};
</script>

<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: "App",
  data: {
    username: null,
  },
  mounted: function () {
    sessionStorage.setItem(
      "employeeId",
      "53851eea-148d-455f-b26f-0da2f14d6de9"
    );
    sessionStorage.setItem("roleId", "1");
    sessionStorage.setItem("roleLevel", "1");
    console.log(sessionStorage,"sessionStorge")
    // if (!sessionStorage.user) {
    //   this.$router.push({
    //     name: "Login",
    //   });
    // } else {
    //   this.username = this.$session.user.username;
    // }
  },
};
</script>

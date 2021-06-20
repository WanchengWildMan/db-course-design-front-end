<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: "App",
  data:()=>( {
     username: null,
  }),
  mounted()  {
    // sessionStorage.setItem(
    //   "employeeId",
    //   "53851eea-148d-455f-b26f-0da2f14d6de9"
    // );
    // console.log(sessionStorage, "sessionStorage");
    console.log(sessionStorage,"sessionStorage");
    if (!JSON.parse(sessionStorage.getItem("user"))) {
      this.$router.push({
        name: "Login",
      });
    } else {
      this.username = JSON.parse(sessionStorage.getItem("user")).name;
    }
  },
};
</script>

<template>
  <v-row>
    <v-col
      cols="12"
      sm="6"
      md="4"
    >
      <v-menu
        :ref="menuRefName"
        v-model="menu"
        :close-on-content-click="false"
        :return-value.sync="dateRange"
        transition="scale-transition"
        offset-y
        min-width="auto"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-model="dateRange.join('~')"
            label="时间范围"
            prepend-icon="mdi-calendar"
            readonly
            v-bind="attrs"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker
          range
          v-model="dateRange"
          no-title
          scrollable
        >
          <v-spacer></v-spacer>
          <v-btn
            text
            color="primary"
            @click="menu = false"
          >
            取消
          </v-btn>
          <v-btn
            text
            color="primary"
            @click="save"
          >
            确定
          </v-btn>
        </v-date-picker>
      </v-menu>
    </v-col>
  </v-row>

</template>
<script>
export default {
  name: "MyDatePicker",
  props: {menuRefName: String},
  data: () => ({
    today: "",
    dateRange: [new Date(), new Date()],
    menu: false,
  }),
  created() {
    this.initialize()
  },
  mounted() {
    console.log("searchCriteriaSaved")
    this.$emit("searchCriteriaSaved", Object.assign([], this.dateRange));
  },
  methods: {
    initialize() {
      this.today = new Date().toISOString().substr(0, 10);
      this.dateRange[0].setDate(this.dateRange[0].getDate() - 1);
      this.dateRange[0] = new Date(this.dateRange[0]).toISOString().substr(0, 10);
      this.dateRange[1] = this.today;
    },
    close() {
      this.menu = false;
    },
    save() {
      this.$refs[this.menuRefName].save(this.dateRange)
      console.log("searchCriteriaSaved")
      console.log(this)
      // this.dateRange=dr;
      this.$emit("searchCriteriaSaved", Object.assign([], this.dateRange));
      this.close();
    }
  }

}
</script>

<template>
  <v-col cols="12" sm="6" md="4">
    <v-menu
      :ref="menuRefName"
      v-model="menu"
      :close-on-content-click="false"
      :return-value.sync="dateRangeStr"
      transition="scale-transition"
      offset-y
      min-width="auto"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-text-field
          v-model="
            dateRangeStr
              .map((e) => new Date(e).toISOString().substr(0, 10))
              .join('~')
          "
          prepend-icon="mdi-calendar"
          readonly
          label="时间范围"
          hide-details

          v-bind="attrs"
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker range v-model="dateRangeStr" no-title scrollable>
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="menu = false"> 取消 </v-btn>
        <v-btn text color="primary" @click="save"> 确定 </v-btn>
      </v-date-picker>
    </v-menu>
  </v-col>
</template>
<script>
export default {
  name: "MyDatePicker",
  props: { menuRefName: String },
  data: () => ({
    today: "",
    dateRangeStr: [new Date(), new Date()],
    menu: false,
  }),
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      this.today = new Date();
      this.dateRangeStr[0].setDate(this.dateRangeStr[0].getDate() - 30);
      this.dateRangeStr[1] = this.today;
      this.dateRangeStr[1].setDate(this.dateRangeStr[1].getDate() + 1);
      this.dateRangeStr[1].setHours(24);
      this.dateRangeStr[1] = this.dateRangeStr[1].toISOString();
    },
    close() {
      this.menu = false;
    },
    save() {
      this.$refs[this.menuRefName].save(this.dateRangeStr.sort());
      // this.dateRangeStr=dr;
      this.close();
    },
  },
  computed: {
    dateRange() {
      console.log(this.dateRangeStr);
      return this.dateRangeStr.map((e) => {
        let el = e;
        return new Date(el);
      });
    },
  },
};
</script>

<template>
  <v-container>
    <v-flex xs3>
      状态：
      <v-btn-toggle mandatory v-model.lazy="showDeleted">
        <v-btn flat :value="2"> 全部 </v-btn>
        <v-btn flat :value="0"> 正常 </v-btn>
        <v-btn flat :value="1"> 删除 </v-btn>
      </v-btn-toggle>
    </v-flex>
    <my-data-table
      :title="title"
      :fields="fields"
      :search="search"
      :table-data="tableDataProcessed"
      :default-item="defaultItem"
      :actions="actions"
      :key1="itemKey"
      :date-col="dateCol"
      class="elevation-1"
      @itemSaved="saveItem"
      @itemDeleted="deleteItem"
    >
    </my-data-table>
  </v-container>
</template>

<script>
import MyDataTable from "../../components/DataTable";

export default {
  name: "Category",
  components: {
    MyDataTable,
  },
  data: () => ({
    title: "商品类别管理",
    dialog: false,
    dialogDelete: false,
    showDeleted: 2,
    itemKey: "categoryId",
    search: "",
    actions: ["addInto", "remove", "edit"],
    filterBy: 0,
    dateColArr: [],
    fields: [
      {
        text: "商品种类编号",
        align: "start",
        value: "categoryId",
        cols: 6,
        autoAdd: true,
      },
      {
        text: "商品种类名称",
        value: "name",
        cols: 3,
        rules: [(v) => !!v || "必须填写!"],
      },

      {
        text: "状态",
        value: "Status",
        displayVal: { "-1": "删除", 1: "正常" },
        readonly: true,
      },
    ],
    tableData: [],
    editedIndex: -1,
    editedItem: {},
    defaultItem: {
      //必须undefined
      categoryId: undefined,
      name: "",
      Status: 1,
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "新商品类别" : "编辑商品类别";
    },
    dateCol() {
      if (this.dateColArr.length == 0) return ""; //！！！！！！！！！
      return this.dateColArr[this.filterBy];
    },
    tableDataProcessed() {
      return this.tableData
        .map((el) => {
          let e = el;
          // e.quantityLowerLimit = e.quantityLowerLimit == 0 ? '无' : e.quantityLowerLimit;
          // e.quantityUpperLimit = e.quantityUpperLimit ? e.quantityUpperLimit : '无';
          // console.log(e.Status)
          return e;
        })
        .filter((e) => this.showDeleted || e.Status != -1);
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  created() {
    this.initialize();
    for (let i in this.fields) {
      let field = this.fields[i];
      if (!field.groupable) this.fields[i].groupable = false;
      if (
        field.value.toLowerCase().includes("time") ||
        field.value.toLowerCase().includes("date")
      ) {
        this.dateColArr.push(field.value);
      }
    }
  },

  methods: {
    hasError(res) {
      return res.data.errors && res.data.errors.length > 0;
    },
    initialize() {
      let self = this;
      this.$http
        .request({
          method: "GET",
          url: "/commodity/findCategoryByPage",
          params: { all: true },
        })
        .then((res) => {
          if (this.$http.hasError(res)) {
            this.$message.error("数据获取失败！请检查网络状态！");
          }
          self.tableData = res.data.result;
          console.log(self.tableData);
        })
        .catch((e) => {
          this.$message.error("数据获取失败！请检查网络状态！");
        });
    },
    deleteItem(item) {
      console.log(item);
      this.$http
        .request({
          method: "delete",
          url: "/commodity/deleteCategoryById",
          params: { commodityId: item.commodityId },
        })
        .then((res) => {
          if (this.$http.hasError(res)) {
            this.$message.error("删除失败！该商品类别不存在或无法删除！");
          } else {
            this.$message.success("删除成功！");
          }
        });
    },
    async saveItem(item) {
      try {
        let res = await this.$http.post("/commodity/saveCategory", {
          category: item,
        });
        if (this.$http.hasError(res)) {
          this.$message.error("商品类别保存失败！");
        } else {
          if (!item[this.itemKey]) {
            item[this.itemKey] = res.data.result[this.itemKey];
            this.$message.success("商品类别添加成功！");
          } else {
            this.initialize();
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
  },
};
</script>

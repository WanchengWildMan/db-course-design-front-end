<template>

  <v-container>

    <my-data-table
      :title="title"
      :fields="fields"
      :search="search"
      :table-data="tableDataProcessed"
      :default-item="defaultItem"
      :actions="actions"
      :key1="key1"
      :key2="key2"
      :date-col="dateCol"
      class="elevation-1"
      @itemSaved="saveItem"
      @itemDeleted="deleteItem"
    >
    </my-data-table>
  </v-container>
</template>
<script>
import MyDataTable from "../../components/DataTable.vue"

export default {
  name: "Unit",
  components: {
    MyDataTable
  },
  data: () => ({
    title: '收银单管理',
    dialog: false,
    dialogDelete: false,
    showDeleted: false,
    key1: "billId",//!!!
    key2: "commodityId",
    search: "",
    actions: ['delete', 'edit'],
    filterBy: 0,
    dateColArr: [],
    fields: [//!!!
      //只允许修改外键而非对象，对象必须后端清空
      {
        text: "收银单编号",
        value: "billId",
        groupable: true
      },
      {
        text: "收银员",
        value: "billUser.name",
        readonly: true
      },
      {
        text: "收银员编号",
        value: "employeeId",
        cols: 12,

      },
      {
        text: "顾客编号或姓名",
        value: "customerId"
      },
      {
        text: "商品名称",
        value: "commodity.name",
        readonly: true
      },
      {
        text: "商品编号",
        value: "commodityId",
        cols: 12,
      },
      {
        text: "商品数量",
        value: "commodityNum",
      },
      {
        text: "商品类别",
        value: "commodity.category.name",
        readonly: true
      },
      {
        text: "总金额",
        value: "totalMoney"
      },
      {
        text: "收银时间",
        value: "billTime",
        readonly: true
      },

    ],
    tableData: [],
    editedIndex: -1,
    editedItem: {},
    defaultItem: {
      //必须undefined
      billId: undefined,

    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? '新收银单' : '编辑收银单';
    },
    dateCol() {
      if (this.dateColArr.length == 0) return "";
      return this.dateColArr[this.filterBy];
      // return //"createdDate";
    },
    tableDataProcessed() {
      let ans = [];
      console.log("tableProc", this.tableData)
      // for (let row of this.tableData) {
      //   for (let ci in row.commodityInfos) {
      //     ans.push(Object.assign({billId: row.billId}, ci));
      //   }
      // }
      return this.tableData;
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
      if (field.value.toLowerCase().includes("time") || field.value.toLowerCase().includes("date")) {
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
      this.$http.request({
        method: 'GET',
        url: '/bill/findBillByPage',
        params: {notGroup: true},
      }).then(async res => {
          if (this.hasError(res)) {
            this.$message.error('数据获取失败！请检查网络状态！');
            return;//!!!
          }
          self.tableData = res.data.result;
          for (let i in self.tableData) {
            for (let j in self.tableData[i].commodityInfos) {
              let commodityId = self.tableData[i].commodityInfos[j].commodityId;
            }
          }
        }
      ).catch(e => {
        console.log(e)
        this.$message.error('数据获取失败！请检查网络状态！');
      });

    },
    deleteItem(item) {
      console.log(item)
      this.$http.request({
        method: 'delete',
        url: '/bill/deleteBillByBillId',
        params: {billId: item.billId},
      }).then(res => {
        if (this.hasError(res)) {
          this.$message.error('删除失败！该收银单不存在或无法删除！');
        } else {
          this.$message.success('删除成功！');
        }
      });
    },
    async saveItem(item) {
      try {
        let res = await this.$http.post("/bill/saveOneBillInfo", {billInfo: item});//!!!
        if (this.hasError(res)) {
          this.$message.error("收银单保存失败！");
        } else {
          if (!item.billId) {
            item.billId = res.data.result.billId;
            this.$message.success("收银单添加成功！");
          } else {
            this.$message.success("收银单保存成功！");
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

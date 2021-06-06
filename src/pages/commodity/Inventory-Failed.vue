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
      :date-col="dateCol"
      :readonly="true"
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
  name: "Inventory",
  components: {
    MyDataTable
  },
  data: () => ({
    title: '库存管理',
    dialog: false,
    dialogDelete: false,
    showDeleted: false,
    key1: "commodityId",//!!!
    search: "",
    actions: [],
    filterBy: 0,
    dateColArr: [],
    fields: [//!!!
      {
        text: "商品名称",
        value: "commodity.name",
        readonly: true
      },
      {
        text: "商品编号",
        value: "commodityId",
      },
      {
        text: "库存数量",
        value: "inventoryNum",
      },
      {
        text: "商品类别",
        value: "commodity.category.name",
        readonly: true
      },
      {
        text: "入库时间",
        value: "inventoryTime",
        readonly: true
      },
      {
        text: "库存上限",
        value: "quantityUpperLimit",
        readonly: true
      },
      {
        text: "库存下限",
        value: "quantityLowerLimit",
        readonly: true
      },
      {
        text: "入库时间",
        value: "inventoryTime",
        readonly: true
      },
      {

        text: "状态",
        value: "Status",
      }
    ],
    tableData: [],
    editedIndex: -1,
    editedItem: {},
    defaultItem: {//！！！
      //必须undefined
      commodityId: undefined
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? '新库存' : '编辑库存';
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
        url: '/inventory/findInventoryByPage',
        params: {notGroup: true},
      }).then(async res => {
          if (this.hasError(res)) {
            this.$message.error('数据获取失败！请检查网络状态！');
            return;//!!!
          }
          self.tableData = res.data.result;
          for (let i in self.tableData) {
            let lowLim = self.tableData[i].quantityLowerLimit;
            if (!lowLim) lowLim = 0;
            let upLim = self.tableData[i].quantityUpperLimit;
            if (!upLim) upLim = 10000000
            let nowNum = self.tableData[i].inventoryNum;
            if (nowNum < lowLim) self.tableData[i].Status = "将要售空";
            else if (nowNum - lowLim < 0.1 * (upLim - lowLim)) self.tableData[i].Status = "缺货";
            //大于90%则接近上限，小于0.1售空
            else if (upLim - nowNum < 0.1 * upLim) self.tableData[i].Status = "接近爆仓";
            else self.tableData[i].Status = "正常";
          }
        }
      ).catch(e => {
        console.log(e);
        this.$message.error('数据获取失败！请检查网络状态！');
      });

    },
    deleteItem(item) {//!!!
      console.log(item)
      this.$http.request({
        method: 'delete',
        url: '/bill/deleteBillByBillId',
        params: {billId: item.billId},
      }).then(res => {
        if (this.hasError(res)) {
          this.$message.error('删除失败！该库存不存在或无法删除！');
        } else {
          this.$message.success('删除成功！');
        }
      });
    },
    async saveItem(item) {
      try {
        //TODO item剔除部分字段
        item.Status = undefined;
        let res = await this.$http.post("/bill/saveOneBillInfo", {billInfo: item});//!!!
        if (this.hasError(res)) {
          this.$message.error("库存保存失败！");
        } else {
          if (!item.billId) {
            item.billId = res.data.result.billId;
            this.$message.success("库存添加成功！");
          } else {
            this.$message.success("库存保存成功！");
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

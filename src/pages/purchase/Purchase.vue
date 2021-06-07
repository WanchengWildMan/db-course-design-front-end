<template>

  <v-container>

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
import MyDataTable from "../../components/DataTable.vue"

export default {
  name: "Purchase",
  components: {
    MyDataTable
  },
  data: () => ({
    title: '进货单管理',
    dialog: false,
    dialogDelete: false,
    showDeleted: false,
    itemKey: "purchaseId",
    search: "",
    actions: ['delete', 'edit'],
    filterBy: 0,
    dateColArr: [],
    fields: [
      {
        text: '进货单编号',
        align: 'start',
        value: 'purchaseId',
        cols: 6,
        readonly: true,
      },
      {
        text: "进货员",
        value: "purchaseUser.name",
        readonly: true
      },
      {
        text: "进货员编号",
        value: "employeeId"
      },
      // {
      //   text: '商品名称', value: 'commodity.name', cols: 6, rules: [
      //     v => !!v || "必须填写商品单名称!"
      //   ],
      // },
      {
        text: '商品编号',
        align: 'start',
        value: 'commodityId',
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
      // {
      //   text: '单位',
      //   value: 'commodity.unit.unitName',
      // },
      // {text: '售价', value: 'commodity.costPrice'},

      {text: "库存量", value: 'commodity.inventoryInfo.inventoryNum', readonly: true},
      {text: "库存下限", value: "commodity.inventoryInfo.quantityLowerLimit", readonly: true},
      {text: '库存上限', value: 'commodity.inventoryInfo.quantityUpperLimit', readonly: true},
      // {
      //   text: '供应商',
      //   value: 'commodity.provide.name',
      //   select: true,
      //   selectItemsURL: "/provide/findProvideByPage",
      //   selectItemLabel: "name",
      //   selectItemValue: "provideId"
      // },
      {
        text: "总金额",
        value: "totalMoney"
      },
      {text: '创建日期', value: 'createDate', autoAdd: true},
      {text: '修改日期', value: 'updateDate', autoAdd: true},
      {text: '备注', value: 'remark'},
    ],
    tableData: [],
    editedIndex: -1,
    editedItem: {},
    defaultItem: {
      //必须undefined
      purchaseId: undefined,
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? '新进货单' : '编辑进货单';
    },
    dateCol() {
      if (this.dateColArr.length == 0) return "";
      return this.dateColArr[this.filterBy];
      // return //"createdDate";
    },
    tableDataProcessed() {
      console.log("tableProc", this.tableData)
      return this.tableData.map(el => {
        let e = el;
        // e.quantityLowerLimit = e.quantityLowerLimit == 0 ? '无' : e.quantityLowerLimit;
        // e.quantityUpperLimit = e.quantityUpperLimit ? e.quantityUpperLimit : '无';
        // console.log(e.Status)
        return e;
      }).filter(e => {
        return this.showDeleted || e.Status != -1;
      })
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
        url: '/purchase/findPurchaseByPage',
        params: {},

      }).then(res => {
        if (this.hasError(res)) {
          this.$message.error('数据获取失败！请检查网络状态！');
        }
        self.tableData = res.data.result;
      }).catch(e => {
        this.$message.error('数据获取失败！请检查网络状态！');
      });

    },
    deleteItem(item) {
      console.log(item)
      this.$http.request({
        method: 'delete',
        url: '/purchase/deletePurchaseById',
        params: {purchaseId: item.purchaseId},
      }).then(res => {
        if (this.hasError(res)) {
          this.$message.error('删除失败！该进货单不存在或无法删除！');
        } else {
          this.$message.success('删除成功！');
        }
      });
    },
    async saveItem(item) {
    console.log("item",item)
      for (let f of this.fields) {
        if (f.value.includes(".")) item[f.value.split(".")[0]] = undefined;
      }
      try {
        let res = await this.$http.post("/purchase/saveOnePurchase", {purchase: item});
        if (this.hasError(res)) {
          throw new Error("进货单保存失败！")
        } else {
          if (!item.purchaseId) {
            item.purchaseId = res.data.result.purchaseId;
            this.$message.success("进货单添加成功！");
          } else {
            this.initialize();
            this.$message.success("进货单保存成功！");

          }
        }
      } catch (e) {
        console.log(e);
        this.$message.error("进货单保存失败！" + ",请检查输入！");
        this.initialize();

      }
    },
  },
};
</script>

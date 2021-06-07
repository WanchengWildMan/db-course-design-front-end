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

      <v-flex xs3>
        状态：
        <v-btn-toggle mandatory v-model.lazy="showDeleted">
          <v-btn flat>
            全部
          </v-btn>
          <v-btn flat :value="false">
            上架
          </v-btn>
          <v-btn flat :value="true">
            下架
          </v-btn>
        </v-btn-toggle>
      </v-flex>
    </my-data-table>
  </v-container>
</template>
<script>
import MyDataTable from "../../components/DataTable.vue"

export default {
  name: "Commodity",
  components: {
    MyDataTable
  },
  data: () => ({
    title: '商品管理',
    dialog: false,
    dialogDelete: false,
    showDeleted: false,
    itemKey: "commodityId",
    search: "",
    actions: ['delete', 'edit'],
    filterBy: 0,
    dateColArr: [],
    fields: [
      {
        text: '商品条形码',
        align: 'start',
        value: 'barcode',
        cols: 6,
        rules: [
          v => !!v || "必须填写商 品条形码!",
          v => (v && v.length === 13) || ("长度必须为13！"),
          v => (v && v.length === 13 && /^6[0-9]{12}$/.test(v)) || "格式错误"
        ],
      },
      {
        text: '商品名称', value: 'name', cols: 6, rules: [
          v => !!v || "必须填写商品名称!"
        ],
      },
      {
        text: '商品编号', value: 'commodityId', readonly: true
      },
      {
        text: '商品种类',
        value: 'category.name',
        cols: 3,
        select: true,
        selectItemsURL: "/commodity/findCategoryByPage",
        selectItemLabel: "name",
        selectItemValue: "categoryId"
      },
      {text: '规格型号', value: 'format', cols: 3},
      {
        text: '单位',
        value: 'unit.unitName',
        select: true,
        selectItemsURL: "/commodity/findUnitByPage",
        selectItemLabel: "unitName",
        selectItemValue: "unitId"
      },
      {text: '售价', value: 'costPrice'},
      {text: '折扣率', value: 'discountRate'},
      {text: "库存量", value: 'inventoryInfo.inventoryNum', readonly: true},
      {text: "库存下限", value: "inventoryInfo.quantityLowerLimit", readonly: true},
      {text: '库存上限', value: 'inventoryInfo.quantityUpperLimit', readonly: true},
      {
        text: '供应商',
        value: 'provide.name',
        select: true,
        selectItemsURL: "/provide/findProvideByPage",
        selectItemLabel: "name",
        selectItemValue: "provideId"
      },
      {
        text: "状态",
        value: "Status",
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
      commodityId: undefined,
      name: '',
      barcode: '',
      category: {name: ''},
      format: '',
      unit: {unitName: ''},
      costPrice: 0,
      discountRate: 1,
      inventoryInfo: {
        quantityUpperLimit: null,
        quantityLowerLimit: 0
      },
      provide: {name: ''},
      Status: 1,
      createDate: new Date(),
      updateDate: new Date(),
      remark: '',
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? '新商品' : '编辑商品';
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
        for (let col of this.dateColArr) {
          if (!e[col]) continue;
          let d = new Date(e[col])
          e[col]=new Date(d).format("yyyy-MM-dd hh:mm:ss");
          // e[col].setHours(d.getHours())
        }
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
        url: '/commodity/findCommodityByPage',
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
        url: '/commodity/deleteCommodityById',
        params: {commodityId: item.commodityId},
      }).then(res => {
        if (this.hasError(res)) {
          this.$message.error('删除失败！该商品不存在或无法删除！');
        } else {
          this.$message.success('删除成功！');
        }
      });
    },
    async saveItem(item) {
      console.log(item, "sace");
      // for(let f of this.fields){
      //   if(f.value.includes("."))item[f.value.split(".")[0]]=undefined;
      // }
      item.unit = undefined;
      item.category = undefined;
      item.provide = undefined;
      // item.inventoryInfo=undefined;
      try {
        let res = await this.$http.post("/commodity/saveCommodity", {commodity: item});
        if (this.hasError(res)) {
          throw new Error("商品保存失败！")
        } else {
          if (!item.commodityId) {
            item.commodityId = res.data.result.commodityId;
            this.$message.success("商品添加成功！");
          } else {
            this.initialize();
            this.$message.success("商品保存成功！");

          }
        }
      } catch (e) {
        console.log(e);
        this.$message.error(e.message + ",请检查输入！")
      }
    },
  },
};
</script>

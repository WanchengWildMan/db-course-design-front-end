<template>


  <!--    <v-date-picker min="2000-01-01" :max="Date.now().toString()" color="blue" v-model="dateRange.endDate"></v-date-picker>-->
  <my-data-table
    :title="title"
    :fields="fields"
    :search="search"
    :table-data="tableDataProcessed"
    :default-item="defaultItem"
    :actions="actions"
    :key1="'commodityId'"
    :date-col="dateCol"
    class="elevation-1"
    @itemSaved="saveCommodity"
    @itemDeleted="deleteItem"
  >
  </my-data-table>

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
        cols: 6
      },
      {text: '商品名称', value: 'name', cols: 6},
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
      {text: "库存量", value: 'inventory.inventoryNum'},
      {text: "库存下限", value: "inventory.quantityLowerLimit"},
      {text: '库存上限', value: 'inventory.quantityUpperLimit'},
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
        displayVal: {"-1": "删除", "1": "正常"}
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
        return e.Status != -1;
      })
    },
    categoryNames() {
      catego
      return this.categorysAll.map(el => el.name);
    }
  },
  asyncComputed: {
    categorysAll() {
      return this.$http.request({
        url: "/commodity/findCategoryByPage",
        method: 'get',
        params: {findInfo: {}}
      }).then(res => res.data.result);
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
    for (let field of this.fields) {

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
    async saveCommodity(item) {
      try {
        let res = await this.$http.post("/commodity/saveCommodity", {commodity: item});
        if (this.hasError(res)) {
          this.$message.error("商品保存失败！");
        } else {
          if (!item.commodityId) {
            item.commodityId = res.data.result.commodityId;
            this.$message.success("商品添加成功！");
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

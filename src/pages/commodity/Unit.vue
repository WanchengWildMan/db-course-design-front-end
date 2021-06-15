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
  name: "Unit",
  components: {
    MyDataTable
  },
  data: () => ({
    title: '商品单位管理',
    dialog: false,
    dialogDelete: false,
    showDeleted: false,
    itemKey: "unitId",//!!!
    search: "",
    actions: ["addInto",'remove', 'edit'],
    filterBy: 0,
    dateColArr: [],
    fields: [//!!!
      {
        text: '商品单位名称', value: 'unitName', cols: 6, rules: [
          v => !!v || "必须填写商品单位名称!"
        ],
      },
    ],
    tableData: [],
    editedIndex: -1,
    editedItem: {},
    defaultItem: {
      //必须undefined
      unitId: undefined,
      unitName: '',
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? '新商品单位' : '编辑商品单位';
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
      if (!field.groupable) this.fields[i].groupable=false;
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
        url: '/commodity/findUnitByPage',
        params: {},

      }).then(res => {
        if (this.$http.hasError(res)) {
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
        url: '/commodity/deleteUnitById',
        params: {unitId: item.unitId},
      }).then(res => {
        if (this.$http.hasError(res)) {
          this.$message.error('删除失败！该商品单位不存在或无法删除！');
        } else {
          this.$message.success('删除成功！');
        }
      });
    },
    async saveItem(item) {
      try {
      let res = await this.$http.post("/commodity/saveUnit", {unit: item});//!!!
        if (this.$http.hasError(res)) {
          this.$message.error("商品单位保存失败！");
        } else {
          if (!item.unitId) {
            item.unitId = res.data.result.unitId;
            this.$message.success("商品单位添加成功！");
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

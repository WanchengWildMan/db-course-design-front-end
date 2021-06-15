<template>
  <v-data-table
    :headers="headers"
    :search="search"
    :items="displayTableData"
    :sort-by="dateCol ? dateCol : fields[0].value"
    show-group-by
    color="#4FC3F7"
    class="elevation-1"
    ref="table"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-text-field
          hide-details
          v-model="filterInfo.morethan"
          label="库存大于"
        >
        </v-text-field>
        <v-spacer></v-spacer>
        <v-text-field
          hide-details
          v-model="filterInfo.lessthan"
          label="库存小于"
        >
        </v-text-field>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="搜索"
          single-line
          hide-details
        ></v-text-field>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-if="!isreadonly"
              color="primary"
              dark
              class="mb-2"
              v-bind="attrs"
              v-on="on"
            >
              添加
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col
                    :cols="col.cols ? col.cols : 6"
                    v-for="(col, i) in fields"
                    v-if="
                      col.readonly != true &&
                      col.autoAdd != true &&
                      !col.value.includes('.')
                    "
                    v-bind:key="col.value"
                  >
                    <v-text-field
                      v-if="!col.select"
                      v-model="
                        col.value.includes('.')
                          ? editedItem[col.value.split('.')[0]][
                              col.value.split('.')[1]
                            ]
                          : editedItem[col.value]
                      "
                      :label="col.text"
                      :counter-value="col.length"
                      :rules="col.rules"
                    >
                    </v-text-field>
                    <v-select
                      v-else
                      v-model="editedItem[col.selectItemValue]"
                      :items="col.selectItems"
                      :item-text="
                        col.selectItemLabel ? col.selectItemLabel : 'name'
                      "
                      :item-value="
                        col.selectItemValue ? col.selectItemValue : 'id'
                      "
                      :label="col.text"
                    ></v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close"> 取消 </v-btn>
              <v-btn color="blue darken-1" text @click="save"> 保存 </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">确认删除？</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDelete"
                >取消</v-btn
              >
              <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                >确认</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template
      v-if="selectEnabled"
      v-slot:header.data-table-select="{ on, props }"
    >
      <v-simple-checkbox
        color="purple"
        v-bind="props"
        v-on="on"
      ></v-simple-checkbox>
    </template>
    <template v-slot:inventory></template>
    <template v-if="actions" v-slot:[`item.actions`]="{ item }">
      <v-icon
        v-if="actions.includes('edit')"
        small
        class="mr-2"
        @click="editItem(item)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        v-if="actions.includes('delete') != undefined"
        small
        @click="deleteItem(item)"
      >
        mdi-delete
      </v-icon>
    </template>
    <template v-slot:no-data>
      没有数据
      <v-btn color="primary" @click="initialize()"> 刷新 </v-btn>
    </template>
    <template v-slot:footer style="display: flex">
      <v-toolbar>
        <my-date-picker
          menu-ref-name="datePickerMenu"
          ref="datePicker"
          v-if="dateCol.length > 0"
        >
        </my-date-picker>
        <v-card
          color="green"
          min-height="30px"
          min-width="120px"
          style="
            margin: 5px;
            padding: 5px;
            text-align: center;
            line-height: 30px;
          "
        >
          总金额：{{ sumTotalMoney }}元
        </v-card>

        <v-card
          color="blue"
          min-height="30px"
          min-width="120px"
          style="
            margin: 5px;
            padding: 5px;
            text-align: center;
            line-height: 30px;
          "
        >
          总数量{{ sumTotalNum }}
        </v-card>
      </v-toolbar>
    </template>
  </v-data-table>
</template>

<script>
import MyDataTable from "@/components/DataTable.vue";
import MyDatePicker from "@/components/MyDatePicker.vue";

export default {
  name: "Purchase",
  components: {
    MyDataTable,
    MyDatePicker,
  },
  data: () => ({
    title: "进货单管理",
    dialog: false,
    dialogDelete: false,
    showDeleted: false,
    selectEnabled: false,
    headers: [],
    isreadonly: false, //+++
    itemKey: "purchaseId",
    search: "",
    actions: ["addInto", "remove", "edit"],
    filterBy: 0,
    filterInfo: {
      morethan: 0,
      lessthan: 10000000,
    },
    dateColArr: [],
    fields: [
      {
        text: "进货单编号",
        align: "start",
        value: "purchaseId",
        cols: 6,
        readonly: true,
      },
      {
        text: "进货员",
        value: "purchaseUser.name",
        readonly: true,
      },
      {
        text: "进货员编号",
        value: "employeeId",
      },
      // {
      //   text: '商品名称', value: 'commodity.name', cols: 6, rules: [
      //     v => !!v || "必须填写商品单名称!"
      //   ],
      // },
      {
        text: "商品编号",
        align: "start",
        value: "commodityId",
        cols: 12,
      },
            {
        text: "商品名称",
        align: "start",
        value: "commodity.name",
        readonly:true,
      },
      {
        text: "进货数量",
        value: "commodityNum",
      },
      {
        text: "商品类别",
        value: "commodity.category.name",
        readonly: true,
      },
      // {
      //   text: '单位',
      //   value: 'commodity.unit.unitName',
      // },
      // {text: '售价', value: 'commodity.costPrice'},

      {
        text: "库存量",
        value: "commodity.inventoryInfo.inventoryNum",
        readonly: true,
      },
      {
        text: "库存下限",
        value: "commodity.inventoryInfo.quantityLowerLimit",
        readonly: true,
      },
      {
        text: "库存上限",
        value: "commodity.inventoryInfo.quantityUpperLimit",
        readonly: true,
      },
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
        value: "totalMoney",
      },
      { text: "创建日期", value: "createDate", autoAdd: true },
      { text: "修改日期", value: "updateDate", autoAdd: true },
      { text: "备注", value: "remark" },
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
      return this.editedIndex === -1 ? "新进货单" : "编辑进货单";
    },
    dateCol() {
      if (this.dateColArr.length == 0) return null;
      return this.dateColArr[this.filterBy];
      // return //"createdDate";
    },
    sumTotalMoney() {
      let ans = 0;
      for (let row of this.$refs.table.selectableItems) {
        ans += row["totalMoney"];
      }
      return ans;
    },
    sumTotalNum() {
      let ans = 0;
      for (let row of this.$refs.table.selectableItems) {
        ans += row["commodityNum"];
      }
      return ans;
    },
    tableDataProcessed() {
      console.log("tableProc", this.tableData);
      return this.tableData
        .map((el) => {
          let e = el;
          // e.quantityLowerLimit = e.quantityLowerLimit == 0 ? '无' : e.quantityLowerLimit;
          // e.quantityUpperLimit = e.quantityUpperLimit ? e.quantityUpperLimit : '无';
          // console.log(e.Status)
          return e;
        })
        .filter((e) => {
          return this.showDeleted || e.Status != -1;
        });
    },
    tableDataFiltered() {
      //---
      console.log(this.tableData, "preFilter");
      let self = this;
      let dateRangeFilter = (el) => {
        try {
          let dateRange = self.$refs.datePicker.dateRange;
          let d = new Date(el[this.dateCol]);
          //!!!
          if (!dateRange || dateRange.length < 2) dateRange = [0, Date.now()];
          console.log("dateRange el", dateRange, el[this.dateCol], d);
          if (dateRange[0] <= d && d <= dateRange[1]) {
            return true;
          }
          return false;
        } catch (e) {
          console.log(e);
          return true;
        }
      };
      let inventoryFilter = (elCom) => {
        console.log(elCom, this.filterInfo.morethan);

        return (
          elCom.inventoryInfo.inventoryNum >= this.filterInfo.morethan &&
          elCom.inventoryInfo.inventoryNum <= this.filterInfo.lessthan
        );
      };
      return this.tableData
        .filter(dateRangeFilter)
        .filter((el) => {
          return inventoryFilter(el.commodity);
        })
        .map((el) => {
          // console.log(el[this.dateCol])

          // console.log(new Date(el[this.dateCol]).toLocaleDateString());
          // el[this.dateCol] = new Date(el[this.dateCol]).format("yyyy-MM-dd hh:mm:ss");
          // console.log(el[this.dateCol])
          return el;
        });
    },
    displayTableData() {
      console.log(this.tableDataFiltered, "tableDataFiltered");
      return this.tableDataFiltered.map((e, i) => {
        let el = {};
        Object.assign(el, {});
        console.log(el, e);
        Object.assign(el, e);
        for (let h of this.fields) {
          if (h.displayVal) {
            let path = h.value;

            // let o=path.split(".");
            // let l=o.length;
            // let obj=o.splice(l-1,1);
            // console.log(el,path)
            //TODO lodash的原理
            let originVal = _.get(e, path); ///？？？？
            // let originVal = _.get(this.tableDataFiltered[i].path)
            console.log(path, originVal, "origin");
            // console.log(eval(path),h.displayVal[originVal])
            let mappedVal = h.displayVal[originVal];
            console.log(mappedVal);
            // Object.assign(eval(path), mappedVal);
            if (mappedVal) _.set(el, path, mappedVal);
          }
          // el.Status=el.Status=1?"正常":"删除"
        }
        return el;
      });
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
      this.headers = [];
      Object.assign(this.headers, this.fields);
      if (this.actions != null) {
        this.headers.push({
          text: "操作",
          value: "actions",
          sortable: false,
          align: "start",
        });
      }
      this.$http
        .request({
          method: "GET",
          url: "/purchase/findPurchaseByPage",
          params: {},
        })
        .then((res) => {
          if (this.$http.hasError(res)) {
            this.$message.error("数据获取失败！请检查网络状态！");
          }
          self.tableData = res.data.result;
        })
        .catch((e) => {
          this.$message.error("数据获取失败！请检查网络状态！");
        });
    },
    close() {
      //---
      console.log(this.editedItem);
      this.dialog = false;
      this.$nextTick(() => {
        // this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
      // console.log(this.defaultItem)
    },

    closeDelete() {
      //---
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    deleteItem(item) {
      let criteria = {};
      criteria[this.key1] = item[this.key1];
      if (this.key2) criteria[this.key2] = item[this.key2];
      this.editedIndex = this.tableData.findIndex((e) => {
        return (
          e[this.key1] == criteria[this.key1] &&
          (!this.key2 || e[this.key2] == criteria[this.key2])
        );
      });
      this.editedItem = Object.assign({}, this.tableData[this.editedIndex]);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      // console.log(this.tableData[this.editedIndex],this.editedIndex.toString())
      // this.$emit("itemDeleted", Object.assign({}, this.tableData[this.editedIndex]));
      this.afterDeleteItemConfirm(
        Object.assign({}, this.tableData[this.editedIndex])
      );
      this.tableData.splice(this.editedIndex, 1);
      this.closeDelete();
    },
    afterDeleteItemConfirm(item) {
      console.log(item);
      this.$http
        .request({
          method: "delete",
          url: "/purchase/deletePurchaseById",
          params: { purchaseId: item.purchaseId },
        })
        .then((res) => {
          if (this.$http.hasError(res)) {
            this.$message.error("删除失败！该进货单不存在或无法删除！");
          } else {
            this.$message.success("删除成功！");
          }
        });
    },
    editItem(item) {
      //---
      let criteria = {};
      criteria[this.key1] = item[this.key1];
      if (this.key2) criteria[this.key2] = item[this.key2];
      this.editedIndex = this.tableData.findIndex((e) => {
        return (
          e[this.key1] == criteria[this.key1] &&
          (!this.key2 || e[this.key2] == criteria[this.key2])
        );
      });
      this.editedItem = Object.assign({}, this.tableData[this.editedIndex]);
      this.dialog = true;
      console.log("editedItem", this.editedItem);
    },

    save(isAdd) {
      console.log("SAVE", this.editedItem);
      console.log(this);
      // this.$emit("itemSaved", this.editedItem)
      this.saveItem(this.editedItem);
      if (this.editedIndex > -1) {
        Object.assign(this.tableData[this.editedIndex], this.editedItem);
      } else {
        this.editedItem[this.key1] = undefined;
        if (this.key2) this.editedItem[this.key2] = undefined;
        console.log(this.editedItem);
        this.$nextTick(() => {
          if (this.editedItem != undefined) {
            this.tableData.push(this.editedItem);
          }
        });
      }
      this.close();
    },
    async saveItem(item) {
      console.log("item", item);
      for (let f of this.fields) {
        if (f.value.includes(".")) item[f.value.split(".")[0]] = undefined;
      }
      console.log(item);
      try {
        let res = await this.$http.post("/purchase/saveOnePurchase", {
          purchaseInfo: item,
        });
        if (this.$http.hasError(res)) {
          throw new Error("进货单保存失败！");
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

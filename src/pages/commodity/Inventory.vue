<template>
  <v-container>
    <v-flex xs3>
      状态：
      <v-btn-toggle mandatory v-model="showStatus">
        <v-btn flat :value="2"> 全部 </v-btn>
        <v-btn flat :value="1"> 正常 </v-btn>
        <v-btn flat :value="0"> 缺货 </v-btn>
        <v-btn flat :value="4"> 接近爆仓 </v-btn>
        <v-btn flat :value="3"> 将要售空 </v-btn>
      </v-btn-toggle>
    </v-flex>
    <v-data-table
      :headers="headers"
      :search="search"
      :items="displayTableData"
      :show-select="selectEnabled"
      :sort-by="dateCol ? dateCol : headers[0].value"
      show-group-by
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
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
                      v-for="col in fields"
                      v-if="col.readonly != true && col.autoAdd != true"
                      v-bind:key="col.value"
                    >
                      <v-text-field
                        v-if="!col.select"
                        v-model="editedItem[col.value]"
                        :label="col.text"
                        :counter-value="col.length"
                        :rules="col.rules"
                      ></v-text-field>
                      <v-select
                        v-else
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
      <template v-slot:item.quantityUpperLimit="{ item }">
        {{ !item.quantityUpperLimit ? "无" : item.quantityUpperLimit }}
      </template>
      <template v-slot:item.inventoryInfo.quantityUpperLimit="{ item }">
        {{
          !item.inventoryInfo.quantityUpperLimit
            ? "无"
            : item.inventoryInfo.quantityUpperLimit
        }}
      </template>
      <template v-slot:item.Status="{ item }">
        <v-chip
          :color="
            getStatusColor(
              item.inventoryNum,
              item.quantityLowerLimit,
              item.quantityUpperLimit
            )
          "
        >
          {{ item.Status }}
        </v-chip>
      </template>
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
          v-if="actions.includes('remove')"
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
      <template v-slot:footer>
        <my-date-picker
          menu-ref-name="datePickerMenu"
          ref="datePicker"
          v-if="dateCol.length > 0"
        >
        </my-date-picker>
      </template>
    </v-data-table>
  </v-container>
</template>


<script>
import MyDatePicker from "@/components/MyDatePicker";

export default {
  name: "Inventory",
  components: { MyDatePicker },
  props: {
    title: String,
    defaultItem: Object,
    dataURL: String,

    key2: String,
    showSelect: Object,
  },
  data: () => ({
    dialog: false,
    dialogDelete: false,
    search: "",
    readonly: true,
    key1: "commodityId",
    dateCol: "inventoryTime", //!!!
    isreadonly: false,
    selectEnabled: false,
    editedIndex: -1,
    showStatus:2,
    editedItem: {},
    headers: [],
    actions: ["addInto","edit"],
    tableData: [],
    fields: [
      //!!!
      {
        text: "商品名称",
        value: "commodity.name",
        readonly: true,
      },
      {
        text: "商品编号",
        value: "commodityId",
        readonly: true,
      },
      {
        text: "商品条形码",
        value: "commodity.barcode",
        readonly: true,
      },
      {
        text: "库存数量",
        value: "inventoryNum",
      },
      {
        text: "商品类别",
        value: "category.name",
        readonly: true,
      },

      {
        text: "库存上限",
        value: "quantityUpperLimit",
        readonly: true,
      },
      {
        text: "库存下限",
        value: "quantityLowerLimit",
        readonly: true,
      },
      {
        text: "入库时间",
        value: "inventoryTime",
        readonly: true,
      },
      {
        text: "状态",
        value: "Status",
        groupable: false,
        readonly: true,
      },
    ],
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "新建条目" : "编辑条目";
    },
    tableDataFiltered() {
      let self = this;
      let dateRangeFilter = (el) => {
        try {
          let dateRange = self.$refs.datePicker.dateRange;
          let d = new Date(el[this.dateCol]);
          //!!!
          if (!dateRange || dateRange.length < 2) dateRange = [0, Date.now()];
          // console.log(dateRange,el[this.dateCol])
          if (dateRange[0] <= d && d <= dateRange[1]) {
            return true;
          }
          return false;
        } catch (e) {
          console.log(e);
          return true;
        }
      };
      return this.tableData.filter(dateRangeFilter).map((el) => {
        el[this.dateCol] = new Date(el[this.dateCol]).format(
          "yyyy-MM-dd hh:mm:ss"
        );
        return el;
      });
    },
    displayTableData() {
      console.log(this.tableDataFiltered, "tableDataFiltered");
      return this.tableDataFiltered
        .map((e, i) => {
          let el = {};
          Object.assign(el, {});
          console.log(el, e);
          e.Status = this.getStatusName(
            e.inventoryNum,
            e.quantityLowerLimit,
            e.quantityUpperLimit
          );
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
              _.set(el, path, mappedVal);
            }
            // el.Status=el.Status=1?"正常":"删除"
          }
          return el;
        })
        .filter((e) => {
          console.log(this.showStatus,e, e.Status, e.Status === "正常");
          if (this.showStatus == 2) return true;
          if (this.showStatus == 1) return e.Status === "正常";
          if (this.showStatus == 0) return e.Status === "缺货";

          if (this.showStatus == 3) return e.Status === "将要售空";
          if (this.showStatus == 4) return e.Status === "接近爆仓";
          return true;
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
    searchCriteria(val) {
      if (!val) return;
      for (let field of this.fields) {
        if (field.fil) this.tableDataFiltered = this.tableData.filter();
      }
    },
  },

  created() {
    this.initialize();
    this.key1 = this.key1 ? this.key1 : "id";
    if (this.readonly) this.isreadonly = true;
  },
  mounted() {
    this.mountSelectItems();
  },
  methods: {
    hasError(res) {
      return res.data.errors && res.data.errors.length > 0;
    },

    initialize() {
      this.headers = [];
      Object.assign(this.headers, this.fields);
      if (this.actions && this.actions.length > 0) {
        this.headers.push({
          text: "操作",
          value: "actions",
          sortable: false,
          align: "start",
        });
      }
      console.log(this.actions);
      this.editedItem = Object.assign({}, this.defaultItem);
      let self = this;
      this.$http
        .request({
          method: "GET",
          url: "/inventory/findInventoryByPage",
          params: { notGroup: true },
        })
        .then(async (res) => {
          if (this.$http.hasError(res)) {
            this.$message.error("数据获取失败！请检查网络状态！");
            return; //!!!
          }
          self.tableData = res.data.result;
        })
        .catch((e) => {
          console.log(e);
          this.$message.error("数据获取失败！请检查网络状态！");
        });
    },
    mountSelectItems() {
      let self = this;
      for (let i in this.fields) {
        if (this.fields[i].select && !this.fields[i].selectItems) {
          this.$http
            .request({
              url: self.fields[i].selectItemsURL,
              method: "get",
            })
            .then((res) => {
              self.fields[i].selectItems = res.data.result;
            })
            .catch((err) => {
              this.$message.error("选项数据获取失败！");
            });
        }
      }
      console.log(this.fields);
    },
    editItem(item) {
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
      //!!!
      // console.log(item)
      //!!!不能删除
      // this.$http.request({
      //   method: 'delete',
      //   params: {billId: item.billId},
      // }).then(res => {
      //   if (this.$http.hasError(res)) {
      //     this.$message.error('删除失败！该库存不存在或无法删除！');
      //   } else {
      //     this.$message.success('删除成功！');
      //   }
      // });
    },
    close() {
      console.log(this.editedItem);
      this.dialog = false;
      this.$nextTick(() => {
        //!!! this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
      // console.log(this.defaultItem)
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    save() {
      console.log(this.editedItem);
      console.log(this);
      this.saveItem(this.editedItem);
      if (this.editedIndex > -1) {
        Object.assign(this.tableData[this.editedIndex], this.editedItem);
      } else {
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
      try {
        //TODO item剔除部分字段
        const updateFields = ["commodityId", "inventoryNum"];
        for (let k of Object.keys(item)) {
          if (!updateFields.includes(k)) {
            item[k] = undefined;
          }
        }

        let res = await this.$http.post("/admin/forceUpdateInventory", {
          inventoryInfo: item,
        }); //!!!
        if (this.$http.hasError(res)) {
          this.$message.error("库存保存失败！");
        } else {
          if (!item.commodityId) {
            item.commodityId = res.data.result.commodityId;
            this.$message.success("库存添加成功！");
          } else {
            this.$message.success("库存保存成功！");
            this.initialize();
          }
        }
      } catch (e) {
        console.log(e);
        this.$message.error("库存保存失败！请检查网络连接");
      }
    },
    getStatusColor(nowNum, lowLim, upLim) {
      if (!lowLim) lowLim = 0;
      let upLim0 = upLim;
      if (!upLim) upLim = 10000000;

      if (nowNum < lowLim) return "orange";
      else if (upLim0 && nowNum - lowLim < 0.1 * (upLim - lowLim))
        return "gray";
      //大于90%则接近上限，小于0.1售空
      else if (upLim - nowNum < 0.1 * upLim) return "red";
      else return "green";
    },
    getStatusName(nowNum, lowLim, upLim) {
      if (!lowLim) lowLim = 0;
      let upLim0 = upLim;
      if (!upLim) upLim = 10000000;
      if (nowNum < lowLim * 1.1) return "将要售空";
      else if (upLim0 && nowNum - lowLim < 0.1 * (upLim - lowLim))
        return "缺货";
      //大于90%则接近上限，小于0.1售空
      else if (upLim - nowNum < 0.1 * upLim) return "接近爆仓";
      else return "正常";
    },
  },
};
</script>


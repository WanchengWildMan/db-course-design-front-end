<template>
  <v-container>
    <v-flex xs3>
      状态：
      <v-btn-toggle mandatory v-model.lazy="showDeleted">
        <!-- TODO -->
        <v-btn flat :value="2"> 全部 </v-btn>
        <v-btn flat :value="0"> 可用 </v-btn>
        <v-btn flat :value="1"> 禁用 </v-btn>
      </v-btn-toggle>
    </v-flex>
    <v-data-table
      ref="myDataTable"
      :headers="headers"
      :search="search"
      :items="displayTableData"
      :sort-by="dateCol ? dateCol : fields[0].value"
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
                      v-for="(col, i) in fields"
                      v-if="col.readonly != true && col.autoAdd != true"
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
                        :label="`${col.text}(${col.value})`"
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
                        :label="`${col.text}(${col.value})`"
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

      <template v-slot:item.Status="{ item }">
        <v-chip :color="getStatusColor(item.Status)">
          {{ getStatusName(item.Status) }}
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
import MyDataTable from "@/components/DataTable.vue";
import MyDatePicker from "@/components/MyDatePicker";

export default {
  name: "Provider",
  components: { MyDatePicker },
  data: () => ({
    title: "供应商管理",
    dialog: false,
    dialogDelete: false,
    showDeleted: 2,
    selectEnabled: false,
    showAll: true,
    key1: "provideId",
    isreadonly: false,
    search: "",
    actions: ["addInto", "remove", "edit"],
    filterBy: 0,
    dateColArr: [],
    headers: [], //!!!
    fields: [
      {
        text: "供应商ID",
        align: "start",
        value: "provideId",
        cols: 6,
        readonly: true,
        rules: [
          (v) => !!v || "必须填写供应商ID!",
          (v) => (v && v.length === 13) || "长度必须为13！",
          (v) => (v && v.length === 13 && /^6[0-9]{12}$/.test(v)) || "格式错误",
        ],
      },
      {
        text: "供应商名称",
        value: "name",
        cols: 6,
        rules: [(v) => !!v || "必须填写供应商名称!"],
      },

      {
        text: "联系地址",
        value: "contactAddress",
        cols: 6,
        rules: [(v) => !!v || "必须填写联系地址!"],
      },
      {
        text: "联系电话",
        value: "contactPhone",
      },
      {
        text: "邮箱",
        value: "contactEmail",
        cols: 6,
        rules: [
          (v) => !!v || "必须填写邮箱!",
          (v) =>
            (v &&
              /^[A-Za-z0-9-_\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(
                v
              )) ||
            "邮箱格式不正确!",
        ],
      },

      {
        text: "状态",
        value: "Status",
        select: true,
        selectItemLabel: "name",
        selectItemValue: "Status",
        selectItems: [
          { Status: -1, name: "已删除" },
          { Status: 1, name: "正常" },
        ],
      },
      { text: "备注", value: "remark" },
    ],
    tableData: [],
    editedIndex: -1,
    editedItem: {},
    defaultItem: {
      //必须undefined
      provideId: undefined,
      name: "",
      password: "",
      position: "",
      sex: 1,
      Status: 1,
      createDate: new Date(),
      updateDate: new Date(),
      remark: "",
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "新供应商" : "编辑供应商";
    },
    dateCol() {
      if (this.dateColArr.length == 0) return "";
      return this.dateColArr[this.filterBy];
      // return //"createdDate";
    },
    tableDataFiltered() {
      console.log(this.tableData, "preFilter");
      let self = this;
      let dateRangeFilter = (el) => {
        try {
          let dateRange = self.$refs.datePicker.dateRange;
          let d = new Date(el[this.dateCol]);
          //!!!
          if (!dateRange || dateRange.length < 2) dateRange = [0, Date.now()];
          console.log("dateRange el", dateRange, el[this.dateCol]);
          if (dateRange[0] <= d && d <= dateRange[1]) {
            return true;
          }
          return false;
        } catch (e) {
          console.log(e);
          return true;
        }
      };
      return this.tableDataProcessed
        .filter(dateRangeFilter)
        .map((el) => {
          // console.log(el[this.dateCol])

          // console.log(new Date(el[this.dateCol]).toLocaleDateString());
          el[this.dateCol] = new Date(el[this.dateCol]).format(
            "yyyy/MM/dd hh:mm:ss"
          );
          // console.log(el[this.dateCol])
          return el;
        })
        .filter((e) => {
          console.log(e, e.Status);
          if (this.showDeleted == 0) return e.Status != -1;
          if (this.showDeleted == 1) return e.Status == -1;
          return true;
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
    tableDataProcessed() {
      console.log("tableProc", this.tableData);
      return this.tableData.map((el) => {
        let e = el;
        // e.quantityLowerLimit = e.quantityLowerLimit == 0 ? '无' : e.quantityLowerLimit;
        // e.quantityUpperLimit = e.quantityUpperLimit ? e.quantityUpperLimit : '无';
        // console.log(e.Status)
        for (let col of this.dateColArr) {
          if (!e[col]) continue;
          console.log("col", e[col]);
          let d = new Date(e[col]);
          el[col] = new Date(d).format("yyyy/MM/dd hh:mm:ss");
          console.log("col", el[col]);
          // e[col].setHours(d.getHours())
        }
        return e;
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
  mounted() {
    this.mountSelectItems();
  },
  created() {
    this.initialize();
    this.editedItem = Object.assign({}, this.defaultItem);
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
          url: "/provide/findProvideByPage",
          params: { all: true },
        })
        .then((res) => {
          if (this.$http.hasError(res)) {
            this.$message.error("数据获取失败！请检查网络状态！");
          }
          console.log(res.data.result, "result");
          self.tableData = res.data.result;
          console.log(self.tableDataFiltered, "tableDataFiltered");
        })
        .catch((e) => {
          this.$message.error("数据获取失败！请检查网络状态！");
        });
    },
    mountSelectItems() {
      //---
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
    close() {
      console.log(this.editedItem);
      this.dialog = false;
      this.$nextTick(() => {
        // this.editedItem = Object.assign({}, this.defaultItem);
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
      console.log(item);
      this.$http
        .request({
          method: "delete",
          url: "/provide/deleteProvideById",
          params: { findInfo: { provideId: item.provideId } },
        })
        .then((res) => {
          if (this.$http.hasError(res)) {
            this.$message.error("删除失败！该供应商不存在或无法删除！");
          } else {
            this.$message.success("删除成功！");
          }
        });
    },
    async saveItem(item) {
      console.log(item, "save");
      // for(let f of this.fields){
      //   if(f.value.includes("."))item[f.value.split(".")[0]]=undefined;
      // }
      // item.inventoryInfo=undefined;
      try {
        let res = await this.$http.post("/provide/saveProvide", {
          provide: item,
        });
        if (this.$http.hasError(res)) {
          let msg = this.$http.getOneError(res).message;
          console.log(msg, "msg");
          if (msg.includes("Duplicate")) {
            msg = msg.split(" ")[3] + "重复！";
          }
          throw new Error("供应商" + msg + "供应商保存失败！");
        } else {
          if (!item.provideId) {
            item.provideId = res.data.result.provideId;
            this.$message.success("供应商添加成功！");
          } else {
            this.initialize();
            this.$message.success("供应商保存成功！");
          }
        }
      } catch (e) {
        console.log(e);
        let msg = e.message;
        if (msg.includes("undefined") || msg.includes("null")) {
          msg = "信息填写不完整！";
        }
        this.$message.error(msg + "请检查输入！");
      }
    },
    save(isAdd) {
      console.log(this.editedItem);
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
    getStatusColor(Status) {
      if (Status == -1) return "red";
      else return "green";
    },
    getStatusName(Status) {
      let ans = "";
      console.log(Status);
      if (Status == -1) ans += "已禁用";
      else ans += "正常";
      return ans;
    },
  },
};
</script>

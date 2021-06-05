<template>
  <v-card>
    <my-date-picker
      menu-ref-name="datePickerMenu"
      ref="datePicker"
      @searchCriteriaSaved="updateFilteredData"
    >

    </my-date-picker>
    <v-data-table
      :headers="headers"
      :search="search"
      :items="displayTableData"
      class="elevation-1"
    >

      <template v-slot:top>
        <v-toolbar
          flat
        >
          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <v-divider
            class="mx-4"
            inset
            vertical
          ></v-divider>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="搜索"
            single-line
            hide-details
          ></v-text-field>
          <v-dialog
            v-model="dialog"
            max-width="500px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
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
                    <v-col :cols="col.cols?col.cols:6" v-for="col in fields"
                           v-if="col.readonly!=true&&col.autoAdd!=true"
                           v-bind:key="col.value">
                      <v-text-field
                        v-if="!col.select"
                        v-model="editedItem[col.value]"
                        :label="col.text"
                      ></v-text-field>
                      <v-select v-else :items="col.selectItems"
                                :item-text="col.selectItemLabel?col.selectItemLabel:'name'"
                                :item-value="col.selectItemValue?col.selectItemValue:'id'"></v-select>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="close"
                >
                  取消
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="save"
                >
                  保存
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">确认删除？</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">取消</v-btn>
                <v-btn color="blue darken-1" text @click="deleteItemConfirm">确认</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
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
          v-if="actions.includes('delete') != undefined"
          small
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>
      <template v-slot:no-data>
        <v-btn
          color="primary"
          @click="initialize()"
        >
          Reset
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>


<script>
import MyDatePicker from "./MyDatePicker";

export default {
  name: "MyDataTable",
  components: {MyDatePicker},
  props: {
    title: String,
    fields: Array,
    defaultItem: Object,
    dataURL: String,
    actions: Array,
    tableData: Array,
    key1: String,
    key2: String,
    dateCol: String,
  },
  data: () => ({
    dialog: false,
    dialogDelete: false,
    search: "",
    editedIndex: -1,
    editedItem: {},
    headers: [],
    tableDataFiltered: [],
  }),

  computed: {

    formTitle() {
      return this.editedIndex === -1 ? '新建条目' : '编辑条目';
    },

    displayTableData() {
      return this.tableDataFiltered.map(e => {
        let el = {};
        Object.assign(el, e);
        for (let h of this.fields) {
          if (h.displayVal) {
            let path = h.value;

            // let o=path.split(".");
            // let l=o.length;
            // let obj=o.splice(l-1,1);
            // console.log(el,path)
            console.log(el, "1")
            let originVal = _.get(el, path);
            console.log(originVal)
            // console.log(eval(path),h.displayVal[originVal])
            let mappedVal = h.displayVal[originVal];
            console.log(mappedVal)
            // Object.assign(eval(path), mappedVal);
            _.set(el, path, mappedVal);
            console.log(el, "2")
          }
          // el.Status=el.Status=1?"正常":"删除"
        }
        return el;
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
    searchCriteria(val) {
      if (!val) return;
      for (let field of this.fields) {
        if (field.fil)
          this.tableDataFiltered = this.tableData.filter()
      }
    }
  },

  created() {
    this.initialize();
    this.key1 = this.key1 ? this.key1 : "id"
  },
  mounted() {
    this.mountSelectItems();
  },
  methods: {
    hasError(res) {
      return res.data.errors && res.data.errors.length > 0;
    },
    updateFilteredData(dateRange) {
      let dateRangeFilter = (el) => {
        if (dateRange[0] <= el[this.dateCol] && el[this.dateCol] <= dateRange[1]) {
          return true;
        }
        return false;
      }
      this.tableDataFiltered = this.tableData.filter(dateRangeFilter);
    },
    initialize() {
      this.headers = []
      Object.assign(this.headers, this.fields);
      if (this.actions != null) {
        this.headers.push({
          text: "操作",
          value: "actions",
          sortable: false,
          align: "start",
        });
      }
      console.log(this.actions)
      this.editedItem = Object.assign({}, this.defaultItem);
      //刷新子组件
      this.$refs.datePicker.initialize();
    },
    mountSelectItems() {
      let self = this;
      for (let i in this.fields) {
        if (this.fields[i].select && !this.fields[i].selectItems) {
          this.$http.request({
            url: self.fields[i].selectItemsURL,
            method: "get"
          }).then(res => {
            self.fields[i].selectItems = res.data.result;
          }).catch(err => {
            this.$message.error("选项数据获取失败！")
          })
        }

      }
      console.log(this.fields)
    },
    editItem(item) {
      let criteria = {};
      criteria[this.key1] = item[this.key1];
      if (this.key2) criteria[this.key2] = item[this.key2];
      this.editedIndex = this.tableData.findIndex(e => {
        return e[this.key1] == criteria[this.key1] && (!this.key2 || e[this.key2] == criteria[this.key2])
      });
      this.editedItem = Object.assign({}, this.tableData[this.editedIndex]);
      this.dialog = true;
      console.log("first", this.editedItem)
    },

    deleteItem(item) {
      let criteria = {};
      criteria[this.key1] = item[this.key1];
      if (this.key2) criteria[this.key2] = item[this.key2];
      this.editedIndex = this.tableData.findIndex(e => {
        return e[this.key1] == criteria[this.key1] && (!this.key2 || e[this.key2] == criteria[this.key2])
      });
      this.editedItem = Object.assign({}, this.tableData[this.editedIndex]);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      // console.log(this.tableData[this.editedIndex],this.editedIndex.toString())
      this.$emit("itemDeleted", Object.assign({}, this.tableData[this.editedIndex]));
      this.tableData.splice(this.editedIndex, 1);
      this.closeDelete();
    },

    close() {
      // console.log(this.defaultItem)
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
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
      console.log(this.editedItem)
      console.log(this)
      this.$emit("itemSaved", this.editedItem)
      if (this.editedIndex > -1) {
        Object.assign(this.tableData[this.editedIndex], this.editedItem);
      } else {
        console.log(this.editedItem)
        this.$nextTick(() => {
          if (this.editedItem != undefined) {
            this.tableData.push(this.editedItem);
          }
        });
      }
      this.close();
    },
  },
};
</script>


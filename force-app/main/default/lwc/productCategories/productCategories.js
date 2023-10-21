import { LightningElement, api, wire, track } from "lwc";
import getCategoryTree from "@salesforce/apex/ProductCategoriesController.getCategoryTree";
const columns = [{ type: "text", fieldName: "name", label: "Category Name" }];

export default class ProductCategories extends LightningElement {
  columns = columns;
  @track error;
   // list of names for rows that are expanded
  @track gridExpandedRows = [];
  @track categoryTree = [];
  @track selectedRows = [];
  @track currentSelectedRows;
  @track childCategories = [];  // used to track changes

  @wire(getCategoryTree)
  generateCategoryTree({ error, data }) {
    if (data) {
      console.log("JSON Data : " + JSON.stringify(data));
      this.categoryTree = JSON.parse(JSON.stringify(data));
      //console.log("categoryTree: " + this.categoryTree[1].category.Name);
      this.categoryTree = this.createTreeFromList(this.categoryTree);
      console.log('this.categoryTree : ' + this.categoryTree);
    } else if (error) {
      this.error = error;
      debugger;
    }
  }

  connectedCallback(){
    console.log('connected Callback');
    this.selectAll();
  }
  createTreeFromList(categoryObject) {
    console.log('categoryObject.length' + categoryObject.length);
    if(categoryObject.length !== 0 ){
      for (let i = 0; i < categoryObject.length; i++) {
        if (categoryObject[i] != null) {
          console.log('categoryObject[i].name : ' + categoryObject[i].name);
          
          if(categoryObject[i].children.length !== 0){
            categoryObject[i]._children = [];
            categoryObject[i]._children = this.createTreeFromList(categoryObject[i].children);

            delete categoryObject[i].children;
            console.log('children deleted');

          }
        }
      }
    }
    console.log("formattedData : " + JSON.stringify(categoryObject));
    return categoryObject;
  }


  handleRowSelection (event){
    var selectRows = event.detail.selectedRows;

    console.log('Selected Rows : ' + JSON.stringify(selectRows));
      if(selectRows.length > 0){
        selectRows.forEach(selectedCategory =>{
            if (selectedCategory.hasChildren){
              console.log('call selectChildCategories method!');
              this.selectChildCategories(selectedCategory);
              console.log('this.childCategories after selectChildCategories method' + this.childCategories);
            }
        })

      }
      debugger;
  }

  selectChildCategories(selectedCategory){
    console.log('selectChildCategories Entry');
    console.log('Category Tree : ' + JSON.stringify(this.categoryTree));
    console.log('category in selectChildCategories : ' + JSON.stringify(selectedCategory));
   /* if (selectedCategory.hasChildren){
     // let childCategories = this.categoryTree.filter(childCategory => childCategory.parentCategoryId === selectedCategory.id);
     let childCategories = [];
     childCategories.push(this.findChildCategories(selectedCategory.id));
     console.log('new childCategories : ' + JSON.stringify(childCategories));
*/
     if(selectedCategory.hasChildren){

      this.categoryTree.forEach(category => {
        if (category.parentcategoryid == selectedCategory.id) {
          console.log('push new category : ' + JSON.stringify(category));
            this.childCategories.push(category);

            if (category._children && category._children.length > 0){
              this.selectChildCategories(category);
            }
          }
        });
      }
    
  }

  findChildCategories(parentCategory) {
    let tempchildCategories = [];
      for (const category of this.categoryTree) {
          if (category.parentcategoryid == parentId) {
            console.log('push child category');
            tempchildCategories.push(category);
              if (category._children && category._children.length > 0) {
                tempchildCategories.push(this.findChildCategories(category.id));
              }
          }
      }
      return tempchildCategories;
  }


  handleToggle (event){
    console.log('Toggled Category Name: ' + event.detail.name);
  }

} 

import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { ItemSubCategoryModel } from '../shared/item-subcategory.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";

import { SecurityService } from '../../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { AccountHeadModel } from "../shared/account-head.model";
import { isNumber } from "util";
import { isNumeric } from "rxjs/internal-compatibility";


@Component({
      selector: 'itemsubcategory-add',
      templateUrl: './item-subcategory-add.html',
      host: { '(window:keyup)': 'hotkeys($event)' }

})
export class ItemSubCategoryAddComponent {
      public showAddPage: boolean = false;
      @Input("selectedItemSubCategory")
      public selectedItemSubCategory: ItemSubCategoryModel;
      @Output("callback-add")
      callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
      public update: boolean = false;
      public loading: boolean = false;

      public currentItemSubCategory: ItemSubCategoryModel;
      public itemsubcategorylist: Array<ItemSubCategoryModel> = new Array<ItemSubCategoryModel>();
      public accountHeadList: Array<any> = new Array<any>();
      public showAddAccountHeadPopUp: boolean = false;
      public showAddLedgerBox: boolean = false;
      public ledgerType:string="";
      public ledReferenceId:any;
      public ledgerId:number=0;
      constructor(
            public invSettingBL: InventorySettingBLService,
            public securityService: SecurityService,
            public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService) {
           // this.GetAccountHead();
            this.getMappedledgerlist();
      }
      @Input("showAddPage")
      public set value(val: boolean) {
          this.showAddPage = val;
          console.log(this.selectedItemSubCategory);
            if (this.selectedItemSubCategory) {
                  this.update = true;
                  this.currentItemSubCategory = Object.assign(this.currentItemSubCategory, this.selectedItemSubCategory);
                  this.currentItemSubCategory.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                  this.ledgerId = (this.selectedItemSubCategory.LedgerId !=null ) ? this.selectedItemSubCategory.LedgerId : 0;
            }
            else {
                  this.currentItemSubCategory = new ItemSubCategoryModel();
                  this.currentItemSubCategory.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                  this.currentItemSubCategory.Code = null;
                  this.update = false;
            }
      }
      //get subcategorylist
      public getItemSubCategoryList() {
            this.invSettingBL.GetItemSubCategory()
                  .subscribe(res => {
                        if (res.Status == "OK") {
                              this.itemsubcategorylist = res.Results;
                              if (this.itemsubcategorylist.length > 0) {
                              // this.itemsubcategorylist.map(a => a.AccountHeadName = this.accountHeadList.find(b => b.AccountHeadId == a.AccountHeadId).AccountHeadName);

                                this.itemsubcategorylist.forEach(itm => {
                                       var led = this.accountHeadList.filter(b => b.LedgerReferenceId == itm.SubCategoryId);
                                       itm.LedgerName = (led.length>0) ? led[0].LedgerName : null;
                                       itm.LedgerId = (led.length>0) ? led[0].LedgerId : null;
                                 })
                              }
                        }
                        else {
                              this.msgBoxServ.showMessage("Failed ! ", [res.ErrorMessage]);
                        }

                  });
      }
      //Get Account Head List
       public GetAccountHead() {
             this.invSettingBL.GetAccountHead(true)
                   .subscribe(res => {
                         if (res.Status == "OK") {
                               this.accountHeadList = res.Results;
                               this.getItemSubCategoryList();
                         }
                   });
       }
       //Get Account ledger List
       public getMappedledgerlist() {
            this.invSettingBL.getMappedledgerlist('inventorysubcategory')
                  .subscribe(res => {
                        if (res.Status == "OK") {
                              this.accountHeadList = res.Results;
                              this.getItemSubCategoryList();
                        }
                  });
      }
      //to check for numeric
      public static isNumeric(strNum: string): boolean {
            try {
                  var d = Number.parseInt(strNum);
            } catch (ex) {
                  return false;
            }
            return true;
      }
      CreateSubCategoryCode() {
            var num: number = 0;
            if ((this.currentItemSubCategory.Code == null || this.currentItemSubCategory.Code == "") && !!this.currentItemSubCategory.SubCategoryName) {
                  this.itemsubcategorylist.map(a => {
                        if (isNumeric(a.Code)) {
                              num = Number.parseInt(a.Code);
                        }
                  });
                  num = num + 1;
                  var formattednumber = "000" + num;
                  formattednumber = formattednumber.substr(formattednumber.length - 4);
                  this.currentItemSubCategory.Code = formattednumber;
            }
      }
      //adding new department
      AddItemSubCategory() {       
            //for checking validations, marking all the fields as dirty and checking the validity.
            for (var i in this.currentItemSubCategory.ItemSubCategoryValidator.controls) {
                  this.currentItemSubCategory.ItemSubCategoryValidator.controls[i].markAsDirty();
                  this.currentItemSubCategory.ItemSubCategoryValidator.controls[i].updateValueAndValidity();
            }
            if (this.currentItemSubCategory.IsValidCheck(undefined, undefined)) {
                  this.loading = true;
                  //logic to create SubCategoryCode if left blank.
                  if (this.currentItemSubCategory.Code == null) {
                        this.CreateSubCategoryCode();
                  }
                  this.invSettingBL.AddItemSubCategory(this.currentItemSubCategory)
                        .subscribe(
                              res => {
                                    this.showMessageBox("success", "Item SubCategory Added");
                                    this.currentItemSubCategory = new ItemSubCategoryModel();
                                    this.CallBackAddItemCategory(res)
                                    this.loading = false;
                              },
                              err => {
                                    this.logError(err);
                                    this.loading = false;
                                    this.FocusElementById('ItemSubCategoryName');
                              });
            }
            this.FocusElementById('ItemSubCategoryName');
      }
      //adding new department
      Update() {
            //for checking validations, marking all the fields as dirty and checking the validity.
            for (var i in this.currentItemSubCategory.ItemSubCategoryValidator.controls) {
                  this.currentItemSubCategory.ItemSubCategoryValidator.controls[i].markAsDirty();
                  this.currentItemSubCategory.ItemSubCategoryValidator.controls[i].updateValueAndValidity();
            }
            if (this.currentItemSubCategory.IsValidCheck(undefined, undefined)) {
                  this.loading = true;
                  this.invSettingBL.UpdateItemSubCategory(this.currentItemSubCategory)
                        .subscribe(
                              res => {
                                    this.showMessageBox("success", "Item SubCategory List Updated");
                                    this.currentItemSubCategory = new ItemSubCategoryModel();
                                    this.CallBackAddItemCategory(res)
                                    this.loading = false;
                              },
                              err => {
                                    this.logError(err);
                                    this.loading = false;
                                    this.FocusElementById('ItemSubCategoryName');
                              });
            }
            this.FocusElementById('ItemSubCategoryName');
      }

      Close() {
            this.selectedItemSubCategory = null;
            this.update = false;
            this.showAddPage = false;
            this.ledgerId=0;
      }

      //after adding Vendor is succesfully added  then this function is called.
      CallBackAddItemCategory(res) {
            if (res.Status == "OK") {
                  this.callbackAdd.emit({ itemsubcategory: res.Results });
                  this.Close();
            }
            else {
                  this.showMessageBox("error", "Check log for details");
                  console.log(res.ErrorMessage);
            }
      }
      showMessageBox(status: string, message: string) {
            this.msgBoxServ.showMessage(status, [message]);
      }

      logError(err: any) {
            console.log(err);
      }

      // AddAccountHeadPopUp() {
      //       this.showAddAccountHeadPopUp = false;
      //       this.changeDetector.detectChanges();
      //       this.showAddAccountHeadPopUp = true;
      // }
      // OnNewAccountHeadAdded($event) {
      //       this.showAddAccountHeadPopUp = false;
      //       var AccountHead = $event.accounthead;
      //       this.accountHeadList.push(AccountHead);
      //       this.accountHeadList.slice();
      // }
      AddAccountHeadPopUp() {
            this.ledReferenceId = this.currentItemSubCategory.SubCategoryId;
            this.showAddLedgerBox = false;
            this.changeDetector.detectChanges();
            this.ledgerType= "inventorysubcategory";  
            this.showAddLedgerBox = true;     
      }
      OnNewLedgerAdded($event){
            var data = $event.ledger;
            this.accountHeadList.push(data);
            var led = this.accountHeadList.filter(l=>l.LedgerId==data.LedgerId);
            this.ledgerId = (led.length>0) ? led[0].LedgerId : null;
            this.currentItemSubCategory.LedgerId = this.ledgerId;
            this.ledgerType="";
      }
      changeLedger(){
            this.currentItemSubCategory.LedgerId = +this.ledgerId;
      }
      FocusElementById(id: string) {
            window.setTimeout(function () {
              let itmNameBox = document.getElementById(id);
              if (itmNameBox) {
                itmNameBox.focus();
              }
            }, 600);
          }
        hotkeys(event){
            if(event.keyCode==27){
                this.Close()
            }
        }
}

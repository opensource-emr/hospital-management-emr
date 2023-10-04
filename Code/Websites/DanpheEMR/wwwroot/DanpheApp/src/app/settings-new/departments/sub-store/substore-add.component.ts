
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SecurityService } from '../../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CoreService } from "../../../core/shared/core.service";
import * as _ from 'lodash';
import { CommonFunctions } from "../../../shared/common.functions";
import { PHRMStoreModel } from "../../../pharmacy/shared/phrm-store.model";
import { Role } from "../../../security/shared/role.model";
import { StoreVerificationMapModel } from "../../shared/store-role-map.model";
import { trigger, transition, style, animate } from "@angular/animations";
import { DanpheHTTPResponse } from "../../../shared/common-models";



@Component({
  selector: "substore-add",
  animations: [
    trigger(
      'enterAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(10%)', opacity: 0 }),
        animate('500ms', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate('500ms', style({ transform: 'translateY(10%)', opacity: 0 }))
      ])
    ]
    )
  ],
  templateUrl: "./substore-add.html"

})

export class SubstoreAddComponent {


  public showAddPage: boolean = false;
  @Input("selectedStore")
  public selectedStore: PHRMStoreModel;

  @Input("rbac-roles-list")
  public rbacRoleList_Ip: Array<Role> = null;

  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  public update: boolean = false;

  public CurrentStore: PHRMStoreModel;

  public completeStoreList: Array<PHRMStoreModel> = new Array<PHRMStoreModel>();
  public storeList: Array<PHRMStoreModel> = new Array<PHRMStoreModel>();
  public isCodeDuplicate: boolean = false;
  public RoleList: Array<Role> = new Array<Role>();
  public StoreVerificationMapList: Array<StoreVerificationMapModel> = new Array<StoreVerificationMapModel>();
  constructor(public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService,
    public coreService: CoreService) {
    this.GetStore();
    //this.GetAllRole();//now we're receiving list of role from parent component.
  }

  ngOnInit() {
    this.RoleList = this.rbacRoleList_Ip;

    if (this.selectedStore) {
      this.update = true;
      this.CurrentStore = new PHRMStoreModel;
      this.CurrentStore = Object.assign(this.CurrentStore, this.selectedStore);
      this.CurrentStore.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.storeList = this.storeList.filter(store => (store.StoreId != this.selectedStore.StoreId));
      if (this.CurrentStore.MaxVerificationLevel > 0) {
        this.settingsBLService.GetStoreVerifiers(this.CurrentStore.StoreId)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.StoreVerificationMapList = res.Results;
              this.StoreVerificationMapList = this.AssignRoleToStoreVerifiers(this.StoreVerificationMapList);
            }
          })
      }
      this.setFocusById("StoreName");

    }
    else {
      this.CurrentStore = new PHRMStoreModel();
      this.CurrentStore.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.update = false;
      this.setFocusById("StoreName");
    }
  }
  public AssignRoleToStoreVerifiers(StoreVerificationMapList: StoreVerificationMapModel[]) {
    var i = 0;
    StoreVerificationMapList.forEach(sv => {
      if (sv.RoleId > 0) {
        sv.selectedRole = new Role();
        sv.NewRoleName = "";
        sv.selectedRole = this.RoleList.find(r => r.RoleId == sv.RoleId);
        this.AssignRoleId(sv.selectedRole, i++);
      }
    })
    return StoreVerificationMapList.slice();
  }

  public GetStore() {
    this.settingsBLService.GetStoreList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.storeList = res.Results;
            CommonFunctions.SortArrayOfObjects(this.storeList, "Name");//this sorts the substorelist by Name.
            this.storeList.forEach(store => {
              //needs review to get parent substore name
              this.storeList.forEach(parStore => {
                if (store.ParentStoreId == parStore.StoreId)
                  store.ParentName = parStore.Name;
              });
            });
            this.completeStoreList = this.storeList;
          }
        }
        else {
          this.showMessageBox("error", "Check log for error message.");
          this.logError(res.ErrorMessage);
        }
      },
        err => {
          this.showMessageBox("error", "Failed to get wards. Check log for error message.");
          this.logError(err.ErrorMessage);
        });
  }

  // GetAllRole() {
  //   this.settingsBLService.GetRoleList()
  //     .subscribe(res => {
  //       if (res.Status == "OK") {
  //         this.RoleList = res.Results;
  //       }
  //     })
  // }

  //adding new Substore
  AddStore() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.CurrentStore.StoreValidator.controls) {
      this.CurrentStore.StoreValidator.controls[i].markAsDirty();
      this.CurrentStore.StoreValidator.controls[i].updateValueAndValidity();
    }

    if (this.CurrentStore.IsValidCheck(undefined, undefined) && !this.isCodeDuplicate) {

      this.CurrentStore.StoreVerificationMapList = this.StoreVerificationMapList;
      this.settingsBLService.AddStore(this.CurrentStore)
        .subscribe(
          res => {
            this.CurrentStore = new PHRMStoreModel();
            this.CallBackAddSubstore(res)
          },
          err => {
            this.logError(err);
            this.Close();
          });
    }
  }
  //Update Existing Substore
  Update() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.CurrentStore.StoreValidator.controls) {
      this.CurrentStore.StoreValidator.controls[i].markAsDirty();
      this.CurrentStore.StoreValidator.controls[i].updateValueAndValidity();
    }

    if (this.CurrentStore.IsValidCheck(undefined, undefined) && !this.isCodeDuplicate) {
      this.CurrentStore.StoreVerificationMapList = this.StoreVerificationMapList;
      this.settingsBLService.UpdateStore(this.CurrentStore)
        .subscribe(
          res => {
            if (res.Status == "OK" && res.Results) {
              this.showMessageBox("success", "Substore Updated");
              this.CurrentStore = new PHRMStoreModel();
              this.CallBackAddSubstore(res)
            }
          },
          err => {
            this.logError(err);
            this.Close();
          });
    }
  }


  Close() {
    this.selectedStore = null;
    this.update = false;
    this.storeList = this.completeStoreList;
    this.showAddPage = false;

    this.callbackAdd.emit({ action: "close" });
  }

  //after adding department is succesfully added  then this function is called.
  CallBackAddSubstore(res: DanpheHTTPResponse) {
    if (res.Status == "OK") {
      this.showMessageBox("Success", "Task Completed Succesfully.");
      for (let store of this.completeStoreList) {
        if (store.StoreId == res.Results.ParentStoreId) {
          res.Results.ParentName = store.Name;
          break;
        }
      };

      if (this.update) {
        this.callbackAdd.emit({ action: "update", store: res.Results });
      }
      else {
        this.callbackAdd.emit({ action: "add", store: res.Results });
      }

    }
    else {
      this.showMessageBox("error", "Check log for details");
      console.log(res.ErrorMessage);
      this.Close();
    }
  }
  showMessageBox(status: string, message: string) {
    this.msgBoxServ.showMessage(status, [message]);
  }

  logError(err: any) {
    console.log(err);
  }

  CheckCodeDuplication() {
    if (this.CurrentStore.Code != "") {
      this.isCodeDuplicate = this.storeList.some(a => a.Code == this.CurrentStore.Code && a.StoreId != this.CurrentStore.StoreId);
    }
  }

  InitializeVerifiersArray() {
    if (this.CurrentStore.MaxVerificationLevel < 0 || this.CurrentStore.MaxVerificationLevel > 3 || this.CurrentStore.MaxVerificationLevel == null) {
      this.CurrentStore.MaxVerificationLevel = 0;
    }
    this.StoreVerificationMapList = new Array<StoreVerificationMapModel>();
    //initialize verifier List
    for (var i = 1; i <= this.CurrentStore.MaxVerificationLevel; i++) {
      var StoreVerificationMapObject = new StoreVerificationMapModel();
      StoreVerificationMapObject.MaxVerificationLevel = this.CurrentStore.MaxVerificationLevel;
      StoreVerificationMapObject.StoreId = this.CurrentStore.StoreId;
      StoreVerificationMapObject.VerificationLevel = i;
      this.StoreVerificationMapList.push(StoreVerificationMapObject);
    }
  }

  AssignRoleId($event, index) {
    if (typeof ($event) == "object") {
      this.StoreVerificationMapList[index].NewRoleName = "";
      this.StoreVerificationMapList[index].RoleId = $event.RoleId;
      this.StoreVerificationMapList[index].MaxVerificationLevel = this.CurrentStore.MaxVerificationLevel;
    }
    else if (typeof ($event) == "string") {
      this.StoreVerificationMapList[index].RoleId = 0;
      this.StoreVerificationMapList[index].NewRoleName = CommonFunctions.CapitalizeFirstLetter($event);
    }
  }
  //used to format display of item in ng-autocomplete.
  myRoleListFormatter(data: any): string {
    let html = data["RoleName"];
    return html;
  }

  setFocusById(targetId: string, waitingTimeinMS: number = 10) {
    if(targetId === "verifier0"){
      if(this.StoreVerificationMapList.length==0){
        targetId = 'AddDepartment'
      }
    }
    if(targetId === "verifier" + this.StoreVerificationMapList.length){
      targetId = 'AddDepartment'
    }
    if(targetId === 'AddDepartment'){
      if(this.update){
        targetId = 'UpdateDepartment'
      }
    }
    var timer = window.setTimeout(function () {
      let htmlObject = document.getElementById(targetId);
      if (htmlObject) {
        htmlObject.focus();
      }
      clearTimeout(timer);
    }, waitingTimeinMS);
  }
}

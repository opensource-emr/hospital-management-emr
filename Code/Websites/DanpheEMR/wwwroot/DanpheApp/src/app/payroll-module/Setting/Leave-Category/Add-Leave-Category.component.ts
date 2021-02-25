
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { SecurityService } from '../../../security/shared/security.service';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PayrollSettingBLService } from '../shared/PayrollSettingBLService';
import { LeaveCategories } from "../../Shared/Payroll-Leave-Category.model";


@Component({
  selector: 'Add-Leave-Category',
  templateUrl: './Add-Leave-Category.html'
})
export class AddLeaveCategoryComponent {

  @Input("selectedLeave")
  public selectedLeave: LeaveCategories;

  public showAddPage: boolean = false;
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  public update: boolean;
  public CurrentLeave: LeaveCategories;
  public SavedLeaveCategory: Array<LeaveCategories> = new Array<LeaveCategories>();
  public LeaveCategoryList: Array<LeaveCategories> = new Array<LeaveCategories>();

  constructor(public payrollSettingsBLService: PayrollSettingBLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService) {
    this.getLeaveCategoryList();
  }
  ngOnInit() {
    this.update = false;
  }
  @Input("showAddPage")
  public set value(val: boolean) {
    this.update = false;
    this.changeDetector.detectChanges();
    this.showAddPage = val;
    this.CurrentLeave = new LeaveCategories();
    this.CurrentLeave.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    this.getLeaveCategoryList();
    if (this.selectedLeave) {
      this.update = false;
      this.changeDetector.detectChanges();
      this.CurrentLeave.LeaveCategoryName = this.selectedLeave.LeaveCategoryName;
      this.CurrentLeave.CategoryCode = this.selectedLeave.CategoryCode;
      this.CurrentLeave.Description = this.selectedLeave.Description;
      this.CurrentLeave.LeaveCategoryId = this.selectedLeave.LeaveCategoryId;
      this.CurrentLeave.CreatedOn = this.selectedLeave.CreatedOn;
      this.update = true;
    
    }
  }


  Close() {
    this.CurrentLeave = null;
    this.LeaveCategoryList = null;
    this.showAddPage = false;
    this.update = false;
    this.selectedLeave = null;
    this.changeDetector.detectChanges();
  }

  public getLeaveCategoryList() {
    try {
      this.payrollSettingsBLService.getLeaveCategory().subscribe(res => {
        if (res.Status == "OK") {
          this.LeaveCategoryList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
      });
    }
    catch (ex) {
      console.log(ex);
    }
  }
  AddLeaveCategory() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.CurrentLeave.LeaveCategoryValidator.controls) {
      this.CurrentLeave.LeaveCategoryValidator.controls[i].markAsDirty();
      this.CurrentLeave.LeaveCategoryValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentLeave.IsValidCheck(undefined, undefined)) {
      this.CurrentLeave.CreatedOn = moment().format('YYYY-MM-DD');
      this.payrollSettingsBLService.AddLeaveCategory(this.CurrentLeave)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("Leave Category Added Successfully", []);
              this.CallBackAddLeaveCategory(res)
            }
            else {
              this.msgBoxServ.showMessage("error", ["Leave is aleady added in the database.."]);
              //this.loading = false;
            }

          },
          err => {
            this.logError(err);
          });
    }
  }
  logError(err: any) {
    console.log(err);
  }
  CallBackAddLeaveCategory(res) {
    if (res.Status == "OK" && res.Results != null) {
      let temp = new LeaveCategories();
      temp = Object.assign(temp, res.Results);
      temp.CategoryCode = this.CurrentLeave.CategoryCode;
      temp.LeaveCategoryName = this.CurrentLeave.LeaveCategoryName;
      temp.Description = this.CurrentLeave.Description;
      temp.IsActive = this.CurrentLeave.IsActive;
      this.LeaveCategoryList = new Array<LeaveCategories>();
      this.callbackAdd.emit({ leave: temp });
      this.CurrentLeave = new LeaveCategories();
      this.update = false;
      this.changeDetector.detectChanges();
      this.selectedLeave = new LeaveCategories();
    }
  }
  UpdateLeaveCategory() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.CurrentLeave.LeaveCategoryValidator.controls) {
        this.CurrentLeave.LeaveCategoryValidator.controls[i].markAsDirty();
        this.CurrentLeave.LeaveCategoryValidator.controls[i].updateValueAndValidity();
      }
      if (this.CurrentLeave.IsValidCheck(undefined, undefined)) {
       this.payrollSettingsBLService.UpdateLeaveCategory(this.CurrentLeave)
          .subscribe(
            res => {
              if (res.Status == "OK") {
                this.msgBoxServ.showMessage("Leave Category Updated Successfully", []);
                this.CallBackAddLeaveCategory(res)
                this.update = false;
              }
              else {
                this.msgBoxServ.showMessage("error", ["Duplicate Leave Category is not allowed"]);
                
              }
  
            },
            err => {
              this.logError(err);
            });
        }
    
      }
  }

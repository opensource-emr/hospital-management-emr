import { Component } from '@angular/core'
import PayrollGridColumns from '../../Shared/payroll-grid.component';
import { PayrollBLService } from '../../Shared/payroll.bl.service';
import { HolidayModel } from '../../Shared/payroll-holiday.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../../security/shared/security.service';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import * as moment from 'moment/moment';
@Component({

  templateUrl: "./holiday.html",

})
export class HolidayComponent {

  public payrollHolidayGridColoumns: any;
  public holidayList:any;
  public holidayDetails:HolidayModel=new HolidayModel();
  public showAddHoliday:boolean=false;

  constructor (public payrollBlServices:PayrollBLService,
               public msgBoxServ: MessageboxService,
               public securityService: SecurityService) {
        this.payrollHolidayGridColoumns= PayrollGridColumns.HolidayList;
        this.GetHolidayList();
  }

  GetHolidayList(){
    this.payrollBlServices.GetHolidaylist()
    .subscribe(res=>{
          if(res.Status=='OK'){
            this.holidayList=res.Results;
          }
    });

  }
  showAddHolidayPage() {
   this.showAddHoliday=true;
  }
  Close(){
    this.showAddHoliday=false;
    this.holidayDetails=new HolidayModel();
  }
  AddNewHoliday(){  
          for (var i in this.holidayDetails.holidayValidator.controls) {
            this.holidayDetails.holidayValidator.controls[i].markAsDirty();
            this.holidayDetails.holidayValidator.controls[i].updateValueAndValidity();
          }

          if (this.holidayDetails.IsValidCheck(undefined, undefined)) {

              this.holidayDetails.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
              this.payrollBlServices.postHolidayListDetails(this.holidayDetails)
              .subscribe(res=>{
                if(res.Status=="OK"){
                  this.msgBoxServ.showMessage("success", ["Holiday Details Added."]);
                  this.holidayDetails=new HolidayModel();
                  this.GetHolidayList();
                }
                else{       
                    this.msgBoxServ.showMessage("error", ["Something Wrong " + res.ErrorMessage]);              
                }
              });        
          }   
  }
  gridAction($event:GridEmitModel){
    try {
      switch ($event.Action) {
          case "edit": {

                    this.holidayDetails.HolidayId=$event.Data.HolidayId;                    
                    this.holidayDetails.Title=$event.Data.Title;
                    this.holidayDetails.Date=$event.Data.Date;
                    this.holidayDetails.Date=moment().format('MM-DD-YYYY');
                    this.holidayDetails.Description=$event.Data.Description;
                    this.holidayDetails.IsActive=$event.Data.IsActive;
                    this.showAddHoliday=true;
          }
          break;
          case "delete": {

          }
          break;
          default:
          break;
      }
  }
  catch (exception) {
    
  }
  }

  UpdateHoliday(){

    
  }
}

import { Component, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from 'moment/moment';

import { EditDoctorFeatureViewModel } from "../shared/edit-doctor-feature-view.model";
import { BillingTransaction } from '../shared/billing-transaction.model';


import { BillingBLService } from '../shared/billing.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../security/shared/security.service';


import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { APIsByType } from "../../shared/search.service";
import { CoreService } from "../../core/shared/core.service";

@Component({
  templateUrl: "./edit-doctor.html"
})


export class EditDoctorFeatureComponent {
  //binding with moel
  currentEditDocotorModel: EditDoctorFeatureViewModel = new EditDoctorFeatureViewModel();
  editDoctorModels: Array<EditDoctorFeatureViewModel> = new Array<EditDoctorFeatureViewModel>();

  //start: for angular-grid
  editDoctorGridColumns: Array<any> = null;

  //use to show pop up
  showEditDoctorPage: boolean = null;


  enableDateFilter: boolean = false;//default false, load this from parameter.
  public dateRange: string = "last1Week";//by default show last 1 week data.

  //this mostly for counter part
  public billTxn: BillingTransaction = new BillingTransaction();
  public patGirdDataApi: string = "";
  constructor(public billingBLService: BillingBLService,
    public changeDetector: ChangeDetectorRef, public messageService: MessageboxService,
    public securityService: SecurityService, public router: Router, public coreService:CoreService) {

    this.enableDateFilter = this.GetEnableDateParam(); 

    //for grid
    this.editDoctorGridColumns = GridColumnSettings.EditDoctorItemList;
    //giving default to the to and from date 
    //this.currentEditDocotorModel.ToDate = moment().format('YYYY-MM-DD');
    //this.currentEditDocotorModel.FromDate = moment().add(-1, 'days').format('YYYY-MM-DD');
    this.patGirdDataApi = APIsByType.BillingEditDoctor;

    if (!this.enableDateFilter) {
      this.LoadTxnItem();
    }
    
  }


  GetEnableDateParam(): boolean {
    let retVal: boolean = false;

    //getting emergency name from the parameterized data
    let dateParam = this.coreService.Parameters.find(p => p.ParameterGroupName.toLowerCase() == "billing" && p.ParameterName == "EnableDateFilterInEditDoctor");
    if (dateParam && dateParam.ParameterValue && dateParam.ParameterValue.toLowerCase()=="true") {
      retVal = true;
    }
    return retVal;
  }

  public FromDate: string = moment().add(-1, 'months').format('YYYY-MM-DD');
  public ToDate: string = moment().format('YYYY-MM-DD');

  //getting the transactionitem details
  SearchItemByDate($event) {

    this.FromDate = $event ? $event.fromDate : this.FromDate;
    this.ToDate = $event ? $event.toDate : this.ToDate;

    if (this.FromDate != null && this.ToDate != null) {
      if (moment(this.FromDate).isBefore(this.ToDate) || moment(this.FromDate).isSame(this.ToDate)) {
        this.billingBLService.GetTxnItemsForEditDoctorByDate(this.FromDate, this.ToDate)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.Callback(res.Results);
            }
            else {
              this.messageService.showMessage("error", ["Not able to Load Transaction Item"]);
              console.log(res.ErrorMessage)
            }

          });
      } else {
        this.messageService.showMessage("failed", ['Please enter valid From date and To date']);
      }
    }

    

  }

  //getting the transactionitem details
  LoadTxnItem() {

    this.billingBLService.GetTxnItemsForEditDoctor()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.Callback(res.Results);
        }
        else {
          this.messageService.showMessage("error", ["Not able to Load Transaction Item"]);
          console.log(res.ErrorMessage)
        }

      });

  }




  //mapping the result from the server to the client models
  Callback(res: Array<EditDoctorFeatureViewModel>) {
    this.editDoctorModels = new Array<EditDoctorFeatureViewModel>();
    //this.changeDetector.detectChanges();
    if (res.length != 0) {

      for (var i = 0; i < res.length; i++) {
        var editDoctorModel: EditDoctorFeatureViewModel = new EditDoctorFeatureViewModel();
        editDoctorModel.Date = moment(res[i].Date).format("YYYY-MM-DD");
        editDoctorModel.ItemId = res[i].ItemId;
        editDoctorModel.ItemName = res[i].ItemName;
        editDoctorModel.PatientId = res[i].PatientId;
        editDoctorModel.ProviderId = res[i].ProviderId;
        editDoctorModel.PatientName = res[i].PatientName
        editDoctorModel.Gender = res[i].Gender;
        editDoctorModel.DateOfBirth = res[i].DateOfBirth;
        editDoctorModel.PhoneNumber = res[i].PhoneNumber;
        editDoctorModel.ProviderName = res[i].ProviderName;
        editDoctorModel.ServiceDepartmentId = res[i].ServiceDepartmentId;
        editDoctorModel.ServiceDepartmentName = res[i].ServiceDepartmentName;
        editDoctorModel.PatientCode = res[i].PatientCode;
        editDoctorModel.BillingTransactionItemId = res[i].BillingTransactionItemId;
        editDoctorModel.BillingTransactionId = res[i].BillingTransactionId;
        editDoctorModel.ReceiptNo = res[i].ReceiptNo;
        this.editDoctorModels.push(editDoctorModel);

      }

    }

  }

  EditDoctorGridActions($event: GridEmitModel) {

    switch ($event.Action) {

      case "edit":
        {
          this.EditDoctor(null, $event.Data)
        }
        break;
      default:
        break;
    }
    
  }

  //this function getting the data from pop up model as event
  UpdateDoctor(event) {
    //this.currentEditDocotorModel.ToDate = event.SelectedItem.ToDate;
    /// this.currentEditDocotorModel.FromDate = event.SelectedItem.FromDate;
    this.changeDetector.detectChanges();
    if (this.enableDateFilter) {
      this.SearchItemByDate(null);
    }
    else {
      this.LoadTxnItem();
    }

  }
  //this function is called from the grid 
  //and in this function data is passed to the popup model(edit-component)
  EditDoctor(event, data) {
    // to detect the change 
    this.showEditDoctorPage = false;
    //assigning the value
    var selectedItem = Object.create(data);
    this.currentEditDocotorModel = selectedItem;
    this.changeDetector.detectChanges();
    //calling the pop up model ..if showedtdoctorPage = true the pop up is called
    this.showEditDoctorPage = true;
    this.changeDetector.detectChanges();

  }

}

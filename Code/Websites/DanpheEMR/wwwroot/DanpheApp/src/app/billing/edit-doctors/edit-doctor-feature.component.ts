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
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../shared/danphe-grid/NepaliColGridSettingsModel";

@Component({
  templateUrl: "./edit-doctor.html"
})


export class EditDoctorFeatureComponent {
  //binding with moel
  currentEditDocotorModel: EditDoctorFeatureViewModel = new EditDoctorFeatureViewModel();
  editDoctorModels: Array<EditDoctorFeatureViewModel> = new Array<EditDoctorFeatureViewModel>();

  //start: for angular-grid
  editDoctorGridColumns: Array<any> = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  //use to show pop up
  showEditDoctorPage: boolean = false;


  enableDateFilter: boolean = false;//default false, load this from parameter.
  public dateRange: string = "last1Week";//by default show last 1 week data.

  //this mostly for counter part
  public billTxn: BillingTransaction = new BillingTransaction();
  public patGirdDataApi: string = "";
  searchText: string = '';
  public enableServerSideSearch: boolean = false;
  constructor(public billingBLService: BillingBLService, public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef, public messageService: MessageboxService,
    public securityService: SecurityService, public router: Router, public coreService: CoreService) {
    this.GetProviderList();
    this.enableDateFilter = this.GetEnableDateParam();

    //for grid
    this.editDoctorGridColumns = GridColumnSettings.EditDoctorItemList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('Date', true));

    //giving default to the to and from date 
    //this.currentEditDocotorModel.ToDate = moment().format('YYYY-MM-DD');
    //this.currentEditDocotorModel.FromDate = moment().add(-1, 'days').format('YYYY-MM-DD');
    this.patGirdDataApi = APIsByType.BillingEditDoctor;
    this.getParamter();
    if (!this.enableDateFilter) {
      this.LoadTxnItem("");
    }

  }
  getParamter() {
    let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "ServerSideSearchComponent").ParameterValue;
    var data = JSON.parse(parameterData);
    this.enableServerSideSearch = data["BillingEditDoctor"];
  }
  serverSearchTxt(searchTxt) {
    this.searchText = searchTxt;
    this.LoadTxnItem(this.searchText)
  }


  GetEnableDateParam(): boolean {
    let retVal: boolean = false;

    //getting emergency name from the parameterized data
    let dateParam = this.coreService.Parameters.find(p => p.ParameterGroupName.toLowerCase() == "billing" && p.ParameterName == "EnableDateFilterInEditDoctor");
    if (dateParam && dateParam.ParameterValue && dateParam.ParameterValue.toLowerCase() == "true") {
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
  LoadTxnItem(searchTxt) {

    this.billingBLService.GetTxnItemsForEditDoctor(searchTxt)
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
        editDoctorModel.DoctorMandatory = res[i].DoctorMandatory;
        if (this.doctorList && res[i].ReferredById) {
          var docObj = this.doctorList.find(a => a.EmployeeId == res[i].ReferredById);
          if (docObj) {
            editDoctorModel.ReferredByName = docObj.EmployeeName;
            editDoctorModel.ReferredById = docObj.EmployeeId;
          }

        }
        editDoctorModel.BillStatus = res[i].BillStatus;
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
      this.LoadTxnItem("");
    }

    this.showEditDoctorPage = false;
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

  public doctorList: any;
  //load doctor  
  GetProviderList(): void {
    this.billingBLService.GetAllReferrerList()
      .subscribe(res => this.CallBackGenerateDoctor(res));
  }

  ////this is a success callback of GenerateDoctorList function.
  CallBackGenerateDoctor(res) {
    //"EmployeeId": 112,
    //  "EmployeeName": "Dr. Badri Paudel"
    //EmployeeId
    //"FullName": "Dr. Badri Paudel",
    if (res.Status == "OK") {
      this.doctorList = [];
      //format return list into Key:Value form, since it searches also by the property name of json.
      if (res && res.Results) {
        res.Results.forEach(a => {
          //referral list has different property names than what's used in this page, so changing accordingly.
          this.doctorList.push({ EmployeeId: a.EmployeeId, EmployeeName: a.FullName });
        });
      }
    }
    else {
      this.msgBoxServ.showMessage("error", ["Not able to get Doctor list"]);
      console.log(res.ErrorMessage)
    }
  }

}

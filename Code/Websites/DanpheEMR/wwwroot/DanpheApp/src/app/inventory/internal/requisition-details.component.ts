import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { RequisitionItems } from "../shared/requisition-items.model";
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { RouteFromService } from "../../shared/routefrom.service";
import { InventoryService } from '../shared/inventory.service';
import { CoreService } from "../../core/shared/core.service"
import * as moment from 'moment/moment';
import { Requisition } from '../shared/requisition.model';
import { SecurityService } from '../../security/shared/security.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { CommonFunctions } from '../../shared/common.functions';
import { trigger, transition, style, animate } from '@angular/animations';
import { VerificationActor } from '../../verification/inventory/requisition-details/inventory-requisition-details.component';
import { InventoryFieldCustomizationService } from '../../shared/inventory-field-customization.service';
import { GeneralFieldLabels } from '../../shared/DTOs/general-field-label.dto';
@Component({
  animations: [
    trigger(
      'enterAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(0)', opacity: 0 }),
        animate('500ms', style({ transform: 'translateY(10%)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateY(10%)', opacity: 1 }),
        animate('500ms', style({ transform: 'translateY(0)', opacity: 0 }))
      ])
    ]
    )
  ],
  selector: 'requisition-details',
  templateUrl: "./requisition-details.html"
})
export class RequisitionDetailsComponent implements OnInit {
  //public requisitionItemsDetails: Array<RequisitionItems> = new Array<RequisitionItems>();
  public requisition: Requisition = new Requisition();

  public requisitionId: number = 0;
  public requisitionDate: string = null;
  public requisitionNo: number = null;
  public issueNo: number = null;
  public dispatchNo: number = null;
  public ShowOutput: number = 0;
  public header: any = null;
  public createdby: string = "";
  public dispatchedby: string = "";
  public receivedby: string = "";
  public cancelRemarks: string = "";
  public mainRemarks: string = ""; //for the whole requisition
  msgBoxServ: any;
  // checkboxes: boolean[];
  public showCancelButton: boolean = false;

  public isVerificationProcess: boolean = false;
  public CurrentVerificationLevel = 0;

  public requestingStoreName: string = null;
  public requestingQRCodeInfo: string = "";
  public showNepaliReceipt: boolean;
  public printDetaiils: HTMLElement;
  public showPrint: boolean;
  showSpecification: boolean = false;
  @Output('call-back-requisition-details-popup-close') callBackPopupClose: EventEmitter<Object> = new EventEmitter<Object>();

  public GeneralFieldLabel = new GeneralFieldLabels();

  constructor(
    public InventoryBLService: InventoryBLService,
    public securityService: SecurityService,
    public inventoryService: InventoryService,
    public messageBoxService: MessageboxService,
    public router: Router,
    public routeFrom: RouteFromService,
    public coreservice: CoreService,
    public inventoryFieldCustomizationService: InventoryFieldCustomizationService) {

    this.requestingStoreName = this.inventoryService.StoreName;
    //set properties to requisition variable from service.// These should mandatorily be assigned from earlier page.
    this.requisition.RequisitionId = this.inventoryService.RequisitionId;
    this.requisition.RequestFromStoreId = this.inventoryService.StoreId;
    this.GetInventoryBillingHeaderParameter();;
    this.GeneralFieldLabel = coreservice.GetFieldLabelParameter();
  }
  ngOnInit() {
    //check for english or nepali receipt style
    let receipt = this.coreservice.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
    this.showNepaliReceipt = (receipt == "true");
    this.requisitionId = this.inventoryService.RequisitionId;
    if (this.showNepaliReceipt == false) {
      this.LoadRequisitionDetails(this.inventoryService.RequisitionId);//sud:3Mar'20
    }


  }
  LoadRequisitionDetails(RequisitionId: number) {
    if (RequisitionId != null) {
      this.requisitionId = RequisitionId;
      this.InventoryBLService.GetRequisitionItemsForViewByReqId(RequisitionId) //sud:19Feb'20
        .subscribe(res => {
          this.ShowRequisitionDetails(res);
          this.SetValueForQR();
          document.getElementById('printButton').focus();
        }
        );
    }
    else {
      this.messageBoxService.showMessage("notice-message", ['Please, Select Requisition for Details.']);
      this.requisitionList();
    }
  }

  //sud:19Feb'20-for separating requisition items and dispatch
  public reqItemsDetail: RequisitionItemInfoVM = new RequisitionItemInfoVM();


  private SetValueForQR() {
    this.requestingQRCodeInfo = `Requisition No: ` + this.requisitionNo + `Request From : ` + this.requestingStoreName;
  }

  ShowRequisitionDetails(res: DanpheHTTPResponse) {
    if (res.Status == "OK") {
      this.reqItemsDetail = res.Results;
      if (this.reqItemsDetail && this.reqItemsDetail.RequisitionItemsInfo && this.reqItemsDetail.RequisitionItemsInfo.length > 0) {
        this.reqItemsDetail.RequisitionItemsInfo.forEach(itm => {
          itm.CreatedOn = moment(itm.CreatedOn).format('YYYY-MM-DD HH:mm:ss');
        });

        this.requisitionDate = this.reqItemsDetail.RequisitionItemsInfo[0].CreatedOn;
        this.requisitionNo = this.reqItemsDetail.RequisitionItemsInfo[0].RequisitionNo;
        this.issueNo = this.reqItemsDetail.RequisitionItemsInfo[0].IssueNo;
        this.dispatchNo = this.reqItemsDetail.RequisitionItemsInfo[0].DispatchNo;
        this.createdby = this.reqItemsDetail.RequisitionItemsInfo[0].CreatedByName;
        this.mainRemarks = this.reqItemsDetail.RequisitionItemsInfo[0].Remarks;
        this.receivedby = null;
        // we may have multiple dispatch, we have to handle differently.. 
        if (this.reqItemsDetail.DispatchInfo && this.reqItemsDetail.DispatchInfo.length > 0) {
          let allDispatchedByArray = this.reqItemsDetail.DispatchInfo.map(dis => {
            return dis.DispatchedByName;
          })
          let allReceivedByArray = this.reqItemsDetail.DispatchInfo.map(dis => {
            return dis.ReceivedBy;
          })

          let uniqueDispatchByNameArr = CommonFunctions.GetUniqueItemsFromArray(allDispatchedByArray);
          let uniqueReceivedByNameArr = CommonFunctions.GetUniqueItemsFromArray(allReceivedByArray);

          this.dispatchedby = uniqueDispatchByNameArr.join(";");
          this.receivedby = uniqueReceivedByNameArr.join(";");

        }

      }
      else {
        this.messageBoxService.showMessage("notice-message", ["Selected Requisition is without Items"]);
        this.requisitionList();
      }
    }
    else {
      this.messageBoxService.showMessage("notice-message", ["There is no Requisition details !"]);
      this.requisitionList();

    }
  }

  //this is used to print the receipt
  print() {
    this.printDetaiils = document.getElementById("printpage");
    const style = document.createElement('style');
    style.textContent = `<style>
        .printStyle {
          border: dotted 1px;
          margin: 10px 100px;
        }
        table,td {
          border: solid 1px;
        }
        .border-up-down {
          border-top: dotted 1px;
          border-bottom: dotted 1px;
        }
          </style>`
    document.getElementById('printpage').appendChild(style)
    this.showPrint = true;
  }
  callBackPrint() {
    this.printDetaiils = null;
    this.showPrint = false;
  }
  //route back
  requisitionList() {
    this.routeFrom.RouteFrom = "RequisitionDetails"
    this.router.navigate(['/Inventory/InternalMain/Requisition/RequisitionList']);
  }

  public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };

  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreservice.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }
  ShowCancelButtonOnCkboxChange() {
    this.showCancelButton = this.reqItemsDetail.RequisitionItemsInfo.filter(a => a.IsSelected == true).length > 0;
  }

  CancelSelectedItems() {
    if (!this.cancelRemarks || this.cancelRemarks.trim() == '') {
      this.messageBoxService.showMessage("failed", ["Remarks is Compulsory for cancelling items."]);
    }
    else {
      let cancelItmsArr: RequisitionItems[] = this.reqItemsDetail.RequisitionItemsInfo.filter(a => a.IsSelected);
      cancelItmsArr.forEach(t => {
        t.CancelQuantity = (t.IsSelected == true) ? t.PendingQuantity : 0;
        t.PendingQuantity = (t.IsSelected == true) ? 0 : t.PendingQuantity;
        t.CancelBy = this.securityService.GetLoggedInUser().EmployeeId;
        t.CancelRemarks = this.cancelRemarks;
      });
      this.requisition.CancelledItems = cancelItmsArr;
      this.InventoryBLService.CancelRequisitionItems(this.requisition).
        subscribe(res => {
          if (res.Status == 'OK') {
            this.messageBoxService.showMessage("success", ["Requisition is Cancel and Saved"]);
            this.router.navigate(['/Inventory/InternalMain/Requisition/RequisitionList']);
          }
          else {
            this.messageBoxService.showMessage("failed", ['failed to cancel items.. please check log for details.']);
          }
        },
          err => {
            this.messageBoxService.showMessage("failed", ['failed to cancel items.. please check log for details.']);
            this.logError(err.ErrorMessage);
          });
    }
  }
  logError(err: any) {
    console.log(err);
  }
  GetInventoryFieldCustomization(): void {
    let parameter = this.inventoryFieldCustomizationService.GetInventoryFieldCustomization();
    this.showSpecification = parameter.showSpecification;
  }

  Close() {
    this.callBackPopupClose.emit();
  }

}



//sud: 19Feb'20--for complex property returning from server. 
class RequisitionItemInfoVM {
  public RequisitionItemsInfo: Array<RequisitionItems> = [];
  public DispatchInfo: Array<any> = [];
  public Verifiers: VerificationActor[] = null; // by default, this will be null
  public Dispatchers: VerificationActor[] = []; // by default, this will be empty array.
}

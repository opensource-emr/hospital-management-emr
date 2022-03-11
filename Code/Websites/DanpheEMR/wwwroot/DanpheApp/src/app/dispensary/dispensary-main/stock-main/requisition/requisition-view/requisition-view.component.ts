import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '../../../../../core/shared/core.service';
import { PharmacyBLService } from '../../../../../pharmacy/shared/pharmacy.bl.service';
import { PharmacyService } from '../../../../../pharmacy/shared/pharmacy.service';
import { MessageboxService } from '../../../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../../../shared/routefrom.service';
import { DispensaryRequisitionService } from '../dispensary-requisition.service'
@Component({
  selector: 'app-requisition-view',
  templateUrl: './requisition-view.component.html',
  styleUrls: ['./requisition-view.component.css']
})
export class RequisitionViewComponent implements OnInit {
  public requisition: GetRequisitionViewDto = new GetRequisitionViewDto();
  public requisitionId: number = 0;
  public headerDetail: { hospitalName, address, email, PANno, tel, DDA };
  printDetails: HTMLElement;
  showPrint: boolean;
  @Input("requisitionId") RequisitionId: number;
  public showNepaliReceipt: boolean;

  constructor(public dispensaryRequisitionService: DispensaryRequisitionService,
    public pharmacyBLService: PharmacyBLService,
    public pharmacyService: PharmacyService,
    public messageBoxService: MessageboxService,
    public router: Router,
    public routeFrom: RouteFromService,
    public coreservice: CoreService) {
    this.LoadRequisitionView(this.pharmacyService.Id);
    this.GetPharmacyBillingHeaderParameter();;
  }
  ngOnInit(): void {
    //check for english or nepali receipt style
    let receipt = this.coreservice.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
    this.showNepaliReceipt = (receipt == "true");
  }

  LoadRequisitionView(RequisitionId: number) {
    if (RequisitionId != null) {
      this.requisitionId = RequisitionId;
      this.dispensaryRequisitionService.GetRequisitionView(this.requisitionId)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.requisition = res.Results.requisition;
          }
          else {
            this.messageBoxService.showMessage("notice-message", ['Please, Select Requisition for Details.']);
            this.routeToRequisitionList();
          }
        });
    }
  }
  print() {
    this.printDetails = document.getElementById("printpage");
    this.showPrint = true;
  }
  callBackPrint() {
    this.printDetails = null;
    this.showPrint = false;
  }


  //this is used to print the receipt
  // print() {
  //   let popupWinindow;
  //   var printContents = document.getElementById("printpage").innerHTML;
  //   popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
  //   popupWinindow.document.open();
  //   popupWinindow.document.write('<html><head><style>.img-responsive{ position: relative;left: -65px;top: 10px;}.qr-code{position: absolute; left: 1001px;top: 9px;}</style><link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" /></head><style>.printStyle {border: dotted 1px;margin: 10px 100px;}.print-border-top {border-top: dotted 1px;}.print-border-bottom {border-bottom: dotted 1px;}.print-border {border: dotted 1px;}.center-style {text-align: center;}.border-up-down {border-top: dotted 1px;border-bottom: dotted 1px;}</style><body onload="window.print()">' + printContents + '</html>');
  //   popupWinindow.document.close();
  // }
  //route back
  routeToRequisitionList() {
    this.routeFrom.RouteFrom = "View"
    this.router.navigate(['/Dispensary/Stock/Requisition/List']);
  }


  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetPharmacyBillingHeaderParameter() {
    var paramValue = this.coreservice.Parameters.find(a => a.ParameterName == 'Pharmacy Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.messageBoxService.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }
}
class GetRequisitionViewDto {
  RequisitionNo: number;
  RequisitionDate: string;
  RequisitionStatus: string;
  RequestedBy: string;
  DispatchedBy: string;
  ReceivedBy: string;
  RequestedStoreName: string;
  RequisitionItems: GetRequisitionItemViewDto[] = [];
}
class GetRequisitionItemViewDto {
  ItemName: string;
  GenericName: string;
  RequestedQuantity: number;
  ReceivedQuantity: number;
  PendingQuantity: number;
  RequestedItemStatus: string;
  Remarks: string;
}
import { Component, Input, OnInit } from '@angular/core';
import { CoreService } from '../../../core/shared/core.service';
import { MessageboxService } from '../../messagebox/messagebox.service';
import { NepaliReceiptEndpointService } from '../nepali-receipt-endpoint.service';
@Component({
  selector: 'app-requisition-np-view',
  templateUrl: './requisition-np-view.component.html',
  styleUrls: ['./requisition-np-view.component.css']
})
export class RequisitionNpViewComponent implements OnInit {
  @Input("requisition-id") RequisitionId: number;
  @Input("module-type") ModuleType: string = "inventory-substore";

  public requisition: NepaliRequisitionDto = new NepaliRequisitionDto();
  public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };

  constructor(public NepaliReceiptService: NepaliReceiptEndpointService, public coreservice: CoreService, public msgBox: MessageboxService) {
  }
  
  ngOnInit(): void {
    this.GetModuleWiseHeaderParameter();
    this.LoadNepaliRequisitionView();
  }

  GetModuleWiseHeaderParameter() {
    if (this.ModuleType == 'inventory-substore') {
      var paramValue = this.coreservice.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
      if (paramValue)
        this.headerDetail = JSON.parse(paramValue);
      else
        this.msgBox.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }
    else if (this.ModuleType == 'pharmacy-dispensary') {
      var paramValue = this.coreservice.Parameters.find(a => a.ParameterName == 'Pharmacy Receipt Header').ParameterValue;
      if (paramValue)
        this.headerDetail = JSON.parse(paramValue);
      else
        this.msgBox.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }
  }

  private LoadNepaliRequisitionView() {
    this.NepaliReceiptService.GetNepaliRequisitionView(this.RequisitionId, this.ModuleType)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.requisition = res.Results.requisition;
        }
        else {
          console.log(res);
          this.msgBox.showMessage("failed", ["Failed to get Requisition View"]);
        }
      },
        (err) => {
          console.log(err);
          this.msgBox.showMessage("failed", ["Failed to get Requisition View"]);
        }
      );
  }
}

class NepaliRequisitionDto {
  FiscalYear: string;
  RequisitionId: number;
  RequisitionNo: number;
  RequisitionDate: string;
  RequestedByName: string;
  RequestingRemarks: string;
  RequisitionItems: NepaliRequisitionItemDto[] = [];
}

class NepaliRequisitionItemDto {
  RequisitionItemId: number;
  ItemId: number;
  ItemName: string;
  UOMName: string;
  Quantity: number;
  Remarks: string;
}
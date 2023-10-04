import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreService } from '../../../core/shared/core.service';
import { PharmacyBLService } from '../../../pharmacy/shared/pharmacy.bl.service';
import { InventoryFieldCustomizationService } from '../../inventory-field-customization.service';
import { MessageboxService } from '../../messagebox/messagebox.service';
import { NepaliReceiptEndpointService } from '../nepali-receipt-endpoint.service';


@Component({
  selector: 'app-dispatch-np-view',
  templateUrl: './dispatch-np-view.component.html',
  styleUrls: ['./dispatch-np-view.component.css']
})
export class DispatchNpViewComponent implements OnInit {
  public dispatchListbyId: any;
  public Sum: number;
  @Input("dispatch-id") DispatchId: number;
  @Input("requisition-id") RequisitionId: number;
  @Input("module-type") ModuleType: string = "inventory-substore";
  public DispatchDetails: NepaliDispatchDTO = new NepaliDispatchDTO();
  public dispatchitemDetails: Array<any>;
  @Output("call-back-close") callbackClose: EventEmitter<Object> = new EventEmitter<Object>();
  printDetaiils: HTMLElement;
  showPrint: boolean;
  public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };
  showSpecification: boolean = false;
  constructor(public PharmacyBLService: PharmacyBLService, public coreservice: CoreService, public msgBoxServ: MessageboxService,
    public NepaliReceiptService: NepaliReceiptEndpointService, public inventoryFieldCustomizationService: InventoryFieldCustomizationService) {
  }
  ngOnInit() {
    this.LoadNepaliDispatchView();
    this.GetModuleWiseHeaderParameter();
    this.GetInventoryFieldCustomization();
  }

  ngDestroy() {
    this.callbackClose.emit(false);
  }
  private LoadNepaliDispatchView() {
    this.NepaliReceiptService.GetNepaliDispatchView(this.DispatchId, this.RequisitionId, this.ModuleType)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.DispatchDetails = res.Results.DispatchDetail;
        }
        else {
          console.log(res);
          this.msgBoxServ.showMessage("failed", ["Failed to get Dispatch View"]);
        }
      },
        (err) => {
          console.log(err);
          this.msgBoxServ.showMessage("failed", ["Failed to get Dispatch View"]);
        }
      );
  }

  GetModuleWiseHeaderParameter() {
    if (this.ModuleType == 'inventory-substore') {
      var paramValue = this.coreservice.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
      if (paramValue)
        this.headerDetail = JSON.parse(paramValue);
      else
        this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }
    else if (this.ModuleType == 'pharmacy-dispensary') {
      var paramValue = this.coreservice.Parameters.find(a => a.ParameterName == 'Pharmacy Receipt Header').ParameterValue;
      if (paramValue)
        this.headerDetail = JSON.parse(paramValue);
      else
        this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }
  }
  print() {
    this.printDetaiils = document.getElementById("printpage");
    this.showPrint = true;
  }
  callBackPrint() {
    this.printDetaiils = null;
    this.showPrint = false;
  }
  GetInventoryFieldCustomization(): void {
    let parameter = this.inventoryFieldCustomizationService.GetInventoryFieldCustomization();
    this.showSpecification = parameter.showSpecification;
  }
}

export class NepaliDispatchDTO {
  DispatchId: number | null;
  RequisitionId: number | null;
  DispatchedDate: string | null;
  Remark: string;
  FiscalYear: string;
  DispatchItems: NepaliDispatchItemDTO[];
}

export class NepaliDispatchItemDTO {
  ItemId: number;
  ItemName: string;
  BatchNo: string;
  UOMName: string;
  Quantity: number;
  MRP: number | null;
  Price: number | null;
  SubTotal: number;
  Remark: string;
  IsDirectDispatched: boolean;
  RegisterPageNo: string;
}
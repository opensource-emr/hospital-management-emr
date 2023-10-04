import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryBLService } from '../../shared/inventory.bl.service';
import { InventoryService } from '../../shared/inventory.service';
import { TrackRequisitionVM } from '../../shared/track-requisition-vm.model';

@Component({
  selector: 'app-track-requisition',
  templateUrl: './track-requisition.component.html',
  styleUrls: ['./track-requisition.component.css']
})
export class TrackInventoryRequisitionComponent implements OnInit {

  @Input("RequisitionId")
  public RequisitionId: number;

  @Input("enableDispatch")
  public isDispatchAllowed: boolean = false;

  public loading: boolean = false;
  public requisitionVM: TrackRequisitionVM;
  public showDispatchWarning: boolean = false;
  constructor(public inventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public router: Router,
    public msgBoxServ: MessageboxService) {
  }

  ngOnInit() {
    if (this.RequisitionId > 0) {
      this.LoadRequisitionDetails(this.RequisitionId);
    }
  }

  public LoadRequisitionDetails(RequisitionId: number) {
    this.inventoryBLService.TrackRequisitionById(RequisitionId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.requisitionVM = res.Results;
          if (this.requisitionVM.Verifiers) {
            if (this.requisitionVM.Verifiers.some(v => v.VerificationStatus === 'pending')) {
              this.isDispatchAllowed = false;
            }
          }

        }
        this.loading = false;
      }, () => {
        console.log("Something went wrong with requisition track component.");
      }, () => { this.loading = false; })
  }



  public DispatchDetail() {
    if (this.isDispatchAllowed) {
      if (this.showDispatchWarning) {
        this.msgBoxServ.showMessage("Warning", ["Verifiers has not verified. Remarks is mandatory."]);
      }
      if (this.isDispatchAllowed && ["active", "partial"].includes(this.requisitionVM.Status)) {
        if (confirm("This requisition has not been dispatched. Do you want to dispatch?")) {
          this.inventoryService.RequisitionId = this.RequisitionId;
          this.inventoryService.StoreId = this.requisitionVM.StoreId;
          this.inventoryService.StoreName = this.requisitionVM.StoreName;
          this.router.navigate(["Inventory/InternalMain/Dispatch"]);
        }
      }
      else {
        this.msgBoxServ.showMessage("Notice", ["This requisition is completed. Dispatch is not available."]);
      }
    }
  }
}

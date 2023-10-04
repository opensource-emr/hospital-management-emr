import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import ProcurementGridColumns from '../../../../procurement/shared/procurement-grid-column';
import GridColumnSettings from '../../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from '../../../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { OtherChargesService } from '../other-charges.service';

@Component({
  selector: 'app-other-charges-list',
  templateUrl: './other-charges-list.component.html',
  styleUrls: ['./other-charges-list.component.css']
})
export class OtherChargesListComponent implements OnInit {
  subscription = new Subscription();
  otherChargesGridColumns: Array<any> = null;
  otherChargesList: any;
  showAddPage: boolean = false;
  showEditPage: boolean = false;
  ChargeId: any;
  constructor(private _router: Router,
    private ref: ChangeDetectorRef, private _msgBox: MessageboxService,
    private _otherChargesService: OtherChargesService) {
    this.otherChargesGridColumns = ProcurementGridColumns.OtherChargesList;
  }

  ngOnInit() {
    this.ref.detectChanges();
    this.getOtherChargesList();
  }


  private getOtherChargesList() {
    this.otherChargesList = [];
    this.subscription.add(this._otherChargesService.GetOtherChargesList()
      .subscribe(result => {
        this.otherChargesList = result.Results;
        this.ref.detectChanges();
      },
        err => this.showFailedMessage()
      )
    );
  }

  showFailedMessage(): void {
    this._msgBox.showMessage("Notice-Message", ["No data found."])
  }

  OtherChargesGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "edit": {
        this.ChargeId = $event.Data.ChargeId
        // this._router.navigate('other-charges-edit', $event.Data.ChargeId]);
        this.showEditPage = true;
        break;
      }
      default:
        break;
    }
  }
  AddOtherCharges() {
    this.showAddPage = true;
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  AddToChargesList(event) {
    this.getOtherChargesList();
    this.ref.detectChanges();
    this.showAddPage = false;
  }
  UpdateToChargesList(event){
    this.getOtherChargesList();
    this.ref.detectChanges();
    this.showEditPage = false;
  }

  Close() {
    this.showAddPage = false;
    this.showEditPage = false;
  }
}

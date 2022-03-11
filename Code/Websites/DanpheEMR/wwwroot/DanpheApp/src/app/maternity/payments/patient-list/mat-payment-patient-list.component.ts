import { ChangeDetectorRef, Component, HostListener } from '@angular/core'
import MaternityGridColumnSettings from '../../shared/maternity.grid.settings';
import { MaternityBLService } from '../../shared/maternity.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CoreService } from '../../../core/shared/core.service';
import { NepaliDateInGridParams,NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { Router } from '@angular/router';
import { MaternityService } from '../../shared/maternity.service';


@Component({
  templateUrl: "./mat-payment-patient-list.html"
})
export class Maternity_PatientListComponent {
  public matPaymentPatientGridColumns: any;
  public MatPaymentPatientsList: Array<any> = new Array<any>();
  public IsSearchAll : boolean = false;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  
  constructor(public maternityBLService: MaternityBLService,
    public msgBoxServ: MessageboxService,public coreService: CoreService,
    public router:Router,public matService:MaternityService){
    this.matPaymentPatientGridColumns = MaternityGridColumnSettings.MaternityPaymentPatientColSettings;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(...[new NepaliDateInGridColumnDetail('DischargeDate', false)]);
    this.LoadPatListForAllowance();
  }

  searchText: string = null;
  SearchPatientFromGrid(searchTxt) {
    this.searchText = searchTxt;
    this.LoadPatListForAllowance();
  }

  LoadPatListForAllowance(): void {
    this.maternityBLService.SearchPatListForAllowance(this.searchText,this.IsSearchAll)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.MatPaymentPatientsList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      });
  }
  MaternityPatientGridActions($event) {
    switch ($event.Action) {
      case "payment":
        {
          var data = $event.Data;
          this.matService.SetPatientForPayment(data);
          this.router.navigate(['/Maternity/Payments/PaymentDetails']);
        }
        break;

      default:
        break;
    }
  }
}

import { ChangeDetectorRef, Component } from "@angular/core";
import { Router } from "@angular/router";
import { DispensaryService } from "../../../dispensary/shared/dispensary.service";
import { SecurityService } from "../../../security/shared/security.service";
import { CallbackService } from "../../../shared/callback.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import GridColumnSettings from "../../../shared/danphe-grid/grid-column-settings.constant";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { RouteFromService } from "../../../shared/routefrom.service";
import { ENUM_DanpheHTTPResponses } from "../../../shared/shared-enums";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { PharmacyPatientConsumptionInfo_DTO } from "../shared/phrm-patient-consumption-info.dto";
import { PHRMPatientConsumption_DTO } from "../shared/phrm-patient-consumption.dto";
import { PHRMPatientConsumption } from "../shared/phrm-patient-consumption.model";
@Component({
    selector: 'phrm-patient-consumption-list',
    templateUrl: "./phrm-patient-consumption-list.html",
    host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PHRMPatientConsumptionListComponent {

    public patientConsumptionGridColumns: Array<any> = null;
    public ShowPatientConsumptionAdd: boolean = false;
    public currentCounterId: number = null;
    public CurrentCounterName: string = null;
    public PatientConsumptions: Array<PHRMPatientConsumption> = new Array<PHRMPatientConsumption>();
    public PatientConsumption: PHRMPatientConsumption = new PHRMPatientConsumption();
    public showFinalizeWrapper: boolean = false;
    public showPrintPage: boolean = false;
    public isConsumptionPrint: boolean = false;
    public PatientConsumptionList: PHRMPatientConsumption_DTO[] = [];
    public patientConsumptionListColumn: Array<any> = null;
    PatientConsumptionInfo: PharmacyPatientConsumptionInfo_DTO = new PharmacyPatientConsumptionInfo_DTO();
    showPatientConsumptionList: boolean;
    PatientConsumptionId: number = null;
    currentStoreId: number = null;
    constructor(
        public securityService: SecurityService,
        public callBackService: CallbackService,
        public messageboxService: MessageboxService,
        public router: Router,
        public changeDetector: ChangeDetectorRef,
        public routeFromService: RouteFromService,
        public pharmacyBLService: PharmacyBLService,
        public dispensaryService: DispensaryService
    ) {
        this.patientConsumptionGridColumns = GridColumnSettings.PatientConsumptionColumn;
        this.patientConsumptionListColumn = GridColumnSettings.PatientConsumptionListColumn;

        try {
            this.currentStoreId = this.dispensaryService.activeDispensary.StoreId;
            this.currentCounterId = this.securityService.getPHRMLoggedInCounter().CounterId;
            this.CurrentCounterName = this.securityService.getPHRMLoggedInCounter().CounterName;
            if (this.currentCounterId < 1) {
                this.callBackService.CallbackRoute = '/Dispensary/PatientConsumption'
                this.router.navigate(['/Dispensary/ActivateCounter']);
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
        this.GetPatientConsumptionList();
    }
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            this.routeFromService.RouteFrom = null;
            this.messageboxService.showMessage("error", ["Check error in Console log !"]);
            console.log("Error Messsage =>  " + ex.message);
        }
    }
    AddNewConsumptionItem() {
        this.ShowPatientConsumptionAdd = true;
    }
    CallBackAdd($event) {
        this.changeDetector.detectChanges();
        this.ShowPatientConsumptionAdd = false;
        this.showFinalizeWrapper = false;
        this.GetPatientConsumptionList();
    }

    CallBackPopupClose() {
        this.showFinalizeWrapper = false;
        this.GetPatientConsumptionList();
    }
    ClosePatientConsumptionEntryPage() {
        this.ShowPatientConsumptionAdd = false;
    }
    GetPatientConsumptionList() {
        this.pharmacyBLService.GetPatientConsumptions().subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.PatientConsumptions = res.Results;
            }
            else {
                this.messageboxService.showMessage(ENUM_DanpheHTTPResponses.Failed, ['Failed to get patient consumption list']);
            }
        },
            err => {
                this.messageboxService.showMessage(ENUM_DanpheHTTPResponses.Failed, ['Failed to get patient consumption list']);
            }
        );
    }
    PatientConsumptionGridActions($event: GridEmitModel) {
        this.PatientConsumption = $event.Data;
        switch ($event.Action) {
            case "showDetails":
                {
                    this.showFinalizeWrapper = true;
                    break;
                }
            case "view": {
                if ($event.Data != null) {
                    this.GetConsumptionsOfPatient($event.Data.PatientId, $event.Data.PatientVisitId)
                    this.showPatientConsumptionList = true;
                }
                break;
            }
            default:
                break;
        }
    }
    ClosePrintPage() {
        this.showPrintPage = false;
        this.PatientConsumptionId = null;
        this.GetPatientConsumptionList();
    }

    GetConsumptionsOfPatient(PatientId: number, PatientVisitId: number) {
        this.pharmacyBLService.GetPatientConsumptionsOfPatient(PatientId, PatientVisitId).subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.PatientConsumptionList = res.Results;
            }
            else {
                this.messageboxService.showMessage(ENUM_DanpheHTTPResponses.Failed, ['Failed to get patient consumption list']);
            }
        },
            err => {
                this.messageboxService.showMessage(ENUM_DanpheHTTPResponses.Failed, ['Failed to get patient consumption list']);
            })
    }

    PatientConsumptionListGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "view": {
                if ($event.Data != null) {
                    this.PatientConsumptionId = $event.Data.PatientConsumptionId;
                    this.showPrintPage = true;
                }
                break;
            }
            default:
                break;
        }
    }
    GetPatientConsumptionInfo(PatientConsumptionId: number) {
        this.pharmacyBLService.GetPatientConsumptionInfo(PatientConsumptionId).subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.PatientConsumptionInfo = res.Results;
            }
            else {
                this.messageboxService.showMessage(ENUM_DanpheHTTPResponses.Failed, ['Failed to get consumption information']);
            }
        },
            err => {
                this.messageboxService.showMessage(ENUM_DanpheHTTPResponses.Failed, ['Failed to get consumption information']);
            })
    }

    ClosePatientConsumptionList() {
        this.showPatientConsumptionList = false;
    }
    public hotkeys(event) {
        if (event.keyCode === 27) {
            //For ESC key => close the pop up
            this.ClosePrintPage();
        }
    }

}
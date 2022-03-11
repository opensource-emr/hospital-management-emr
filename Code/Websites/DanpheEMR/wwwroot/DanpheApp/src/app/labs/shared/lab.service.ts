import { Injectable, Directive } from '@angular/core';
import { LabTest } from "./lab-test.model";
//import { LabReportTemplateInfo } from "./lab-report-template-info.model";
import { LabTestViewResult, LabPendingResultVM } from "./lab-view.models";

@Injectable()
export class LabService {
    defaultPrinterName: string = null;
    routeNameAfterverification: string = '';
}

@Injectable()
export class LabTestResultService {
    requisitionId: number = 0;
    globalLabTestResult: Array<LabTestViewResult> = new Array<LabTestViewResult>();
    labBillItems: Array<any>;

    public CreateNewGlobalLabTestResult(): LabTestViewResult[] {
        this.globalLabTestResult = new Array<LabTestViewResult>();
        return this.globalLabTestResult;
    }
    public getGlobalLabTestResult(): LabTestViewResult[] {
        return this.globalLabTestResult;
    }





}

@Injectable()
export class LabReportService {
    globalLabReport: LabPendingResultVM = new LabPendingResultVM();
    public CreateNewGlobalLabReport(): LabPendingResultVM {
        this.globalLabReport = new LabPendingResultVM();
        return this.globalLabReport;
    }

    public getGlobalLabReportTemplateInfo(): LabPendingResultVM {
        return this.globalLabReport;
    }
}

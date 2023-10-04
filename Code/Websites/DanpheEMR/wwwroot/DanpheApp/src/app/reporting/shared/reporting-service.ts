import { Injectable, Directive } from '@angular/core';
import { ReportGridColumnSettings } from "../../shared/danphe-grid/report-grid-column-settings.constant";
import { CoreService } from "../../core/shared/core.service";
@Injectable()
export class ReportingService {
    public reportGridCols: ReportGridColumnSettings;

    constructor(public coreService: CoreService) {
        this.reportGridCols = new ReportGridColumnSettings(this.coreService.taxLabel)
    }
    

}
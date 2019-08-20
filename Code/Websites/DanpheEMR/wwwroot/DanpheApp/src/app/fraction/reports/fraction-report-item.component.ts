import {Component} from '@angular/core';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { FractionCalculationService } from '../shared/fraction-calculation.service';
import * as moment from 'moment/moment';
import { FractionReportViewModel } from '../shared/fraction-report.viewmodel';
@Component({
    templateUrl: "./fraction-report-item.html",
})
export class FractionReportbyItemComponent{
    public FractionReportGridColumns: Array<any> = null;
    public fractionReportByItemList: Array<FractionReportViewModel>= new Array<FractionReportViewModel>();
constructor(public fractionCalculationService: FractionCalculationService) {
    this.FractionReportGridColumns = GridColumnSettings.FractionReportByItem;
    this.getFractionReportByItemList();
}
getFractionReportByItemList(){
    this.fractionCalculationService.GetFractionReportByItemList()
    .subscribe(res => {              
        this.fractionReportByItemList = res;
    });
 
}
gridExportOptions = {
    fileName: 'FractionReportByItemList_' + moment().format('YYYY-MM-DD') + '.xls',
};
}
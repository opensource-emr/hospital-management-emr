import {Component} from '@angular/core';
import { FractionCalculationComponent } from '../calculation/fraction-calculation.component';
import { FractionCalculationModel } from '../shared/fraction-calculation.model';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { FractionCalculationService } from '../shared/fraction-calculation.service';
import * as moment from 'moment/moment';
import { FractionReportViewModel } from '../shared/fraction-report.viewmodel';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../shared/common.functions';
@Component({
    templateUrl: "./fraction-report-doctor.html",
})
export class FractionReportbyDoctorComponent{
    public FractionReportGridColumns: Array<any> = null;
    public fractionReportByDoctorList: Array<FractionReportViewModel>= new Array<FractionReportViewModel>();
    public currentDoctorFraction: FractionReportViewModel = new FractionReportViewModel();
constructor(public fractionCalculationService: FractionCalculationService,
    public msgBoxServ: MessageboxService) {
    // this.FractionReportGridColumns = GridColumnSettings.FractionReportByDoctor;
    this.currentDoctorFraction.FromDate = moment().format('YYYY-MM-DD');
    this.currentDoctorFraction.ToDate = moment().format('YYYY-MM-DD');
}
// getFractionReportByDoctorList(){
//     this.fractionCalculationService.GetFractionReportByDoctorList(this.currentDoctorFraction.FromDate, this.currentDoctorFraction.ToDate)
//     .subscribe(res => {              
//         this.fractionReportByItemList = res;
//     });
 
// }
gridExportOptions = {
    fileName: 'FractionReportByDoctorList_' + moment().format('YYYY-MM-DD') + '.xls',
};
Load() {
    this.fractionCalculationService.GetFractionReportByDoctorList(this.currentDoctorFraction.FromDate, this.currentDoctorFraction.ToDate)
                .subscribe(
                    res => {
                        this.fractionReportByDoctorList = res;
                        this.FractionReportGridColumns = GridColumnSettings.FractionReportByDoctor;
                        this.CalculateNetAmount();
                    },
                    err => {
                        this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
                    });
}
public CalculateNetAmount(){
this.fractionReportByDoctorList.forEach(i=>{
    i.TDS = CommonFunctions.parseAmount(i.FractionAmount * 5/100),
    i.NetAmount= CommonFunctions.parseAmount(i.FractionAmount - i.TDS)  
});
}
}
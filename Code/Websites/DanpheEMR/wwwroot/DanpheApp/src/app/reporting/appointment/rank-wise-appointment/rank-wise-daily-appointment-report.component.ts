import { Component } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RPT_APPT_RankwiseDailyAppointmentReportModel } from "./rank-wise-appointment-report.model"
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MembershipType } from "../../../patients/shared/membership-type.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import * as _ from 'lodash';
import { IGridFilterParameter } from "../../../shared/danphe-grid/grid-filter-parameter.interface";

@Component({
  templateUrl: "./rank-wise-daily-appointment-report.html"
})
export class RPT_APPT_RankwiseDailyAppointmentReportComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public memberships: string | any = ""; //"7,6,5,9,8,4"; 'any' is used here as we are unable to use replaceAll() method, it requires es2021 as per suggestion by the compiler -Rusha/Krishna-24th jan 2023
  public ranks: string | any = "";//"CON,SI,HC,AHC,SHC,ASI"; 'any' is used here as we are unable to use replaceAll() method, it requires es2021 as per suggestion by the compiler -Rusha/Krishna-24th jan 2023
  public AppointmentType: string | any = "";// 'any' is used here as we are unable to use replaceAll() method, it requires es2021 as per suggestion by the compiler -Rusha/Krishna-24th jan 2023
  public allMemberships = new Array<MembershipType>();
  public preSelectedMemberships = [];
  public allRanks = [];
  public preSelectedRanks = [];
  public allUsers = [];
  public preSelectedUsers = [];
  RankwiseDailyAppointmentReportColumns: Array<any> = null;
  RankwiseDailyAppointmentReportData: Array<RPT_APPT_RankwiseDailyAppointmentReportModel> = new Array<RPT_APPT_RankwiseDailyAppointmentReportModel>();
  public currentdailyappointment: RPT_APPT_RankwiseDailyAppointmentReportModel = new RPT_APPT_RankwiseDailyAppointmentReportModel();
  dlService: DLService = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public filterParameters: IGridFilterParameter[] = [];

  gridExportOptions = {
    fileName: 'RankwiseDailyAppointmentReport' + moment().format('YYYY-MM-DD') + '.xls',
  };

  public loading: boolean = false;
  footer: any;
  constructor(
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService) {
    this.dlService = _dlService;
    this.currentdailyappointment.fromDate = moment().format('YYYY-MM-DD');
    this.currentdailyappointment.toDate = moment().format('YYYY-MM-DD');
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", true));
    this.RankwiseDailyAppointmentReportColumns = this.reportServ.reportGridCols.RankwiseDailyAppointmentReport;
    this.LoadRanks();
    this.LoadMembershipList();
  }

  public LoadRanks(): void {
    this.dlService.GetRank().subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
            let ranks = [];
            ranks = res.Results;
            ranks.forEach(x => {
                x['Rank'] = x.RankName;
            });
            ranks.forEach(p => {
                let val = _.cloneDeep(p);
                this.preSelectedRanks.push(val);
            });
            this.MapPreSelectedRanks(this.preSelectedRanks);
            this.allRanks = ranks;
        }
        else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["Couldn't load Ranks"]);
        }
    });
}

  public LoadMembershipList(): void {
    this.dlService.GetAllMembershipType()
        .subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                let membershipList = [];
                membershipList = res.Results;
                membershipList.forEach(p => {
                    let val = _.cloneDeep(p);
                    this.preSelectedMemberships.push(val);
                });
                this.MapPreSelectedMemberships(this.preSelectedMemberships);
                this.allMemberships = membershipList;
            } else {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["Couldn't load memberships"]);
            }
        });
}

setFilterParamters(): void{
  // we need to pass membership types name to filter parameters, below logic will help us create string of membership types name -Rusha/Krishna : 24th Jan,2023
  let membershipIdsinstring = this.memberships.split(','); 
  const selectedMembershipsIds = membershipIdsinstring.map(a => Number(a));
  let selectedMembershipsList = this.allMemberships.filter((a) => selectedMembershipsIds.includes(a.MembershipTypeId));
  let selectedMembershipTypesNames = selectedMembershipsList.map(a => a.MembershipTypeName);
  let membershipsString: any = selectedMembershipTypesNames.join(',');

        // setting the filter parameters for printing and exporting purpose
        this.filterParameters = [
          {
            DisplayName: "Date Range",
            Value: `<strong>${this.fromDate}</strong> to <strong>${this.toDate}</strong>`,
          },
          {
            DisplayName: "Memberships",
            Value: membershipsString.replaceAll(",", ", "),
          },
          { 
            DisplayName: "Ranks", 
            Value: this.ranks.replaceAll(",", ", ") 
          },
          { 
            DisplayName: "AppointmentType", 
            Value: this.AppointmentType.replaceAll(",", ", ") 
          },
        ];
}

  Load(): void {
    this.loading = true;//this disables the button until we get response from the api.
    this.setFilterParamters();
    if (this.currentdailyappointment.fromDate != null && this.currentdailyappointment.toDate != null) {
      this.dlService.Read("/Reporting/RankwiseDailyAppointmentReport?FromDate="
        + this.currentdailyappointment.fromDate + "&ToDate=" + this.currentdailyappointment.toDate
        + "&Rank=" + this.ranks + "&Membership=" + this.memberships
        + "&AppointmentType=" + this.currentdailyappointment.AppointmentType)
        .map(res => res)
        .finally(() => { this.loading = false; })//re-enable the show-report button.
        .subscribe(res => this.Success(res),
          res => this.Error(res)
        );
    } else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Dates Provided is not Proper']);
    }

  }
  Error(err): void {
    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [err.ErrorMessage]);
}
  Success(res): void {
    if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results.length > 0) {
        this.RankwiseDailyAppointmentReportData = res.Results;
      }
      else if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results.length === 0){
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Data is Not Available Between Selected Parameters...Try Different']);
      }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
    }
  }

  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelRankwiseDailyAppointment?FromDate="
      + this.currentdailyappointment.fromDate + "&ToDate=" + this.currentdailyappointment.toDate
      + "&Rank=" + this.ranks + "&Membership=" + this.memberships 
      + "&AppointmentType=" + this.currentdailyappointment.AppointmentType)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "RankwiseDailyAppointment_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },
        res => this.ErrorMsg(res));
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }


  myListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event): void {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentdailyappointment.fromDate = this.fromDate;
    this.currentdailyappointment.toDate = this.toDate;
  }

  MembershipsChanged($event): void {
    let defMemberships = [];
    $event.forEach(x => {
        defMemberships.push(x.MembershipTypeId);
    });
    let membershipList = defMemberships.join(",");
    this.memberships = membershipList;
 }

 RanksChanged($event): void {
    let defRanks = [];
    $event.forEach(x => {
        defRanks.push(x.RankName);
    });
    let rankList = defRanks.join(",");
    this.ranks = rankList;
 }


 MapPreSelectedRanks(preSelectedRanks): void{
    let defRanks = [];
    preSelectedRanks.forEach(x => {
        defRanks.push(x.RankName);
    });
    let rankList = defRanks.join(",");
    this.ranks = rankList;
 }

 MapPreSelectedMemberships(preSelectedMemberships): void{
    let defMemberships = [];
    preSelectedMemberships.forEach(x => {
        defMemberships.push(x.MembershipTypeId);
    });
    let membershipList = defMemberships.join(",");
    this.memberships = membershipList;
 }

}

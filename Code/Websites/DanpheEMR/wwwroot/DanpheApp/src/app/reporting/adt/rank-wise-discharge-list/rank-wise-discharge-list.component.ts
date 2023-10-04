import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { DLService } from "../../../shared/dl.service";
import { ReportingService } from '../../shared/reporting-service';
import * as _ from 'lodash';
import { IGridFilterParameter } from '../../../shared/danphe-grid/grid-filter-parameter.interface';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
@Component({
  selector: 'app-rankwisedischargelist',
  templateUrl: './rank-wise-discharge-list.component.html',
  styleUrls: ['./rank-wise-discharge-list.component.css']
})
export class RankWiseDischargeListComponent {
  public filterParameters: IGridFilterParameter[] = [];
  FromDate: string = moment().format('YYYY-MM-DD');
  ToDate: string = moment().format('YYYY-MM-DD');
  MembershipId: number = null;
  RankMembershipWiseDischargePatientReportData: Array<RankWiseDischargeModel> = new Array<RankWiseDischargeModel>();
  RankMembershipWiseDischargePatientReportGridColumns: any;
  selectedMembership: Membership;
  RankList: Array<Rank> = new Array<Rank>();
  selectedRank: Rank;
  public pharmacy: string = "pharmacy";
  preSelectedMemberships: Array<Membership> = new Array<Membership>();
  dateRange: string = '';
  Memberships: Array<Membership> = new Array<Membership>();
  memberships: string = "";
  MembershipTypeNames: Array<string> = new Array<string>();
  MembershipTypeName: any;
  preSelectedRanks: Array<Rank> = new Array<Rank>();
  Ranks: Array<Rank> = new Array<Rank>();
  ranks: string | any = "";
  loading: boolean = false;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(public dlService: DLService, public reportServ: ReportingService, public messageBoxService: MessageboxService) {
    this.RankMembershipWiseDischargePatientReportGridColumns = this.reportServ.reportGridCols.RankMembershipWiseDischargePatientCols;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("AdmissionDate", false), new NepaliDateInGridColumnDetail("DischargedDate", false));
    this.GetMembershipType();
    this.GetRanks();
  }




  ngOnInit() {

  }

  OnFromToDateChange($event) {
    this.FromDate = $event ? $event.fromDate : this.FromDate;
    this.ToDate = $event ? $event.toDate : this.ToDate;
    this.dateRange = this.FromDate + "&nbsp;<b>To</b>&nbsp;" + this.ToDate;


  }
  LoadRankMembershipWiseDischargePatientReport() {
    this.filterParameters = [
      { DisplayName: "DateRange:", Value: this.dateRange },
      { DisplayName: "Rank:", Value: this.ranks == undefined || null ? 'All' : this.ranks.replaceAll(',', ', ') },
      { DisplayName: "Membership:", Value: this.memberships == undefined || null ? 'All' : this.MembershipTypeName.replaceAll(',', ', ') },
    ]

    this.dlService.Read(`/BillingReports/RankMembershipWiseDischargePatientReport?FromDate=${this.FromDate} &ToDate=${this.ToDate} &Membership=${this.memberships} &Rank=${this.ranks}`).map(res => res).subscribe(res => {
      if (res.Status === 'OK') {
        this.RankMembershipWiseDischargePatientReportData = res.Results;
      }
      else {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed To Load Data']);
      }
    },
      err => {
        console.log(err);
      })

  }
  MapPreSelectedMemberships(preSelectedMemberships): void {
    let defMemberships = [];
    preSelectedMemberships.forEach(x => {
      defMemberships.push(x.MembershipTypeId);
      this.MembershipTypeNames.push(x.MembershipTypeName);

    });
    let membership = this.MembershipTypeNames.join(",");
    this.MembershipTypeName = membership;
    let membershipList = defMemberships.join(",");
    this.memberships = membershipList;
  }
  gridExportOptions = {
    fileName: 'RankMembershipWiseDischargePatientReport' + moment().format('YYYY-MM-DD') + '.xls',
  };

  MembershipsChanged($event): void {
    let defMemberships = [];
    this.MembershipTypeNames = [];
    $event.forEach(x => {
      defMemberships.push(x.MembershipTypeId);
      this.MembershipTypeNames.push(x.MembershipTypeName);
    });
    let membershipList = defMemberships.join(",");
    let membership = this.MembershipTypeNames.join(",");
    this.MembershipTypeName = membership;
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
  MembershipFormatter(data: Membership) {
    return data["MembershipTypeName"];
  }

  public GetMembershipType() {
    this.dlService.Read('/api/Billing/MembershipTypes').subscribe(res => {
      if (res.Status == 'OK') {
        let MembershipList = [];
        MembershipList = res.Results;
        MembershipList.forEach(p => {
          let val = _.cloneDeep(p);
          this.preSelectedMemberships.push(val);
        });
        this.MapPreSelectedMemberships(this.preSelectedMemberships);
        this.Memberships = MembershipList;

      }
    });
  }
  GetRanks(): void {
    this.dlService.Read('/api/Visit/GetRank').subscribe(res => {
      if (res.Status === 'OK') {
        let Rank: Array<Rank> = new Array<Rank>();

        Rank = res.Results;

        Rank.forEach(x => {
          x['Rank'] = x.RankName;
        });
        Rank.forEach(p => {
          let val = _.cloneDeep(p);
          this.preSelectedRanks.push(val);
        });
        this.MapPreSelectedRanks(this.preSelectedRanks);
        this.Ranks = Rank;
      }
    });
  }
  MapPreSelectedRanks(preSelectedRanks): void {
    let defRanks = [];
    preSelectedRanks.forEach(x => {
      defRanks.push(x.RankName);
    });
    let rankList = defRanks.join(",");
    this.ranks = rankList;
  }

  RankFormatter(data: any): string {
    return data["RankName"];
  }

}




class Membership {
  public MembershipTypeId: number = null;
  public MembershipTypeName: string = '';
}

export class Rank {
  RankId: number = null;
  RankName: string = '';
}

class RankWiseDischargeModel {
  HospitalNo: string = '';
  IPNumber: string = '';
  Rank: string = '';
  Membership: string = '';
  PatientName: string = '';
  AgeSex: string = '';
  Address: string = '';
  PhoneNumber: string = '';
  AddmissionDate: string = '';
  DischargeDate: string = '';
}
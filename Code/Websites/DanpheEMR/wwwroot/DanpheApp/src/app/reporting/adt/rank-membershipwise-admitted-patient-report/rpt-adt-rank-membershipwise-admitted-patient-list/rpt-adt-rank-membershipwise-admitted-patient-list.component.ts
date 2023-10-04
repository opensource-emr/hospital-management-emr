import * as moment from "moment";
import { Component } from "@angular/core";
import { DanpheHTTPResponse } from "../../../../../app/shared/common-models";
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";
import {
  ENUM_DanpheHTTPResponseText,
  ENUM_MessageBox_Status,
} from "../../../../../app/shared/shared-enums";
import {
  NepaliDateInGridColumnDetail,
  NepaliDateInGridParams,
} from "../../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { DLService } from "../../../../shared/dl.service";
import {
  MembershipModel,
  RankMembershipwiseAdmittedPatientVM,
  RankModel,
} from "./RankMembershipwiseAdmittedPatientVM";
import { ReportingService } from "../../../shared/reporting-service";
import { MembershipType } from "../../../../patients/shared/membership-type.model";
import { SettingsBLService } from "../../../../settings-new/shared/settings.bl.service";
import { BillingBLService } from "../../../../billing/shared/billing.bl.service";

import * as _ from "lodash";
import { IGridFilterParameter } from "../../../../shared/danphe-grid/grid-filter-parameter.interface";

@Component({
  selector: "app-rpt-adt-rank-membershipwise-admitted-patient-list",
  templateUrl:
    "./rpt-adt-rank-membershipwise-admitted-patient-list.component.html",
  styleUrls: [
    "./rpt-adt-rank-membershipwise-admitted-patient-list.component.css",
  ],
})
export class RankMembershipwiseAdmittedPatientReportComponent {
  public fromDate: string = "";
  public toDate: string = "";
  public dateRange: string = "";
  TotalAdmittedPatientReport: Array<RankMembershipwiseAdmittedPatientVM> =
    new Array<RankMembershipwiseAdmittedPatientVM>();
  TotalAdmittedPatientReportGridColumns: Array<any> = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams =
    new NepaliDateInGridParams();
  public memberships: string | any = "";
  public ranks: string | any = "";
  public loading = false;
  public allMemberships = new Array<MembershipModel>();
  public preSelectedMemberships = [];
  public allRanks = new Array<RankModel>();
  public preSelectedRanks = [];
  public showGrid: boolean = false;
  gridExportOptions = {
    fileName:
      "RankMembershipwiseAdmittedPatientReport" +
      moment().format("YYYY-MM-DD") +
      ".xls",
  };
  public footerContent = "";
  public filterParameters: IGridFilterParameter[] = [];
  membershipNames: string | any = "";
  membershipList: string = "";

  constructor(
    private dlService: DLService,
    private msgBoxServ: MessageboxService,
    private reportServ: ReportingService,
    private settingsBLService: SettingsBLService,
    private billingBLService: BillingBLService
  ) {
    this.TotalAdmittedPatientReportGridColumns =
      this.reportServ.reportGridCols.RankMembershipwiseAdmittedPatientReport;
    this.LoadRanks();
    this.LoadMembershipList();
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(
      new NepaliDateInGridColumnDetail("AdmissionDate", false)
    );
  }

  public LoadRanks(): void {
    this.billingBLService.GetRank().subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
        let ranks = [];
        ranks = res.Results;
        ranks.forEach((x) => {
          x["Rank"] = x.RankName;
        });
        ranks.forEach((p) => {
          let val = _.cloneDeep(p);
          this.preSelectedRanks.push(val);
        });
        this.MapPreSelectedRanks(this.preSelectedRanks);
        this.allRanks = ranks;
      } else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, [
          "Couldn't load Ranks",
        ]);
      }
    });
  }

  public LoadMembershipList(): void {
    this.settingsBLService
      .GetMembershipType()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          let membershipList = [];
          membershipList = res.Results;
          membershipList.forEach((p) => {
            let val = _.cloneDeep(p);
            this.preSelectedMemberships.push(val);
          });
          this.MapPreSelectedMemberships(this.preSelectedMemberships);
          this.allMemberships = membershipList;
        } else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, [
            "Couldn't load memberships",
          ]);
        }
      });
  }

  LoadReport(): void {
    this.loading = true;
    this.TotalAdmittedPatientReport = [];

    // setting the filter parameters for printing and exporting purpose
    this.filterParameters = [
      {
        DisplayName: "Date Range",
        Value: `<strong>${this.fromDate}</strong> to <strong>${this.toDate}</strong>`,
      },
      {
        DisplayName: "Memberships",
        Value: this.membershipNames.replaceAll(",", ", "),
      },
      { DisplayName: "Ranks", Value: this.ranks.replaceAll(",", ", ") },
    ];

    this.dlService
      .Read(
        `/Reporting/RankMembershipwiseAdmittedPatientReport?fromDate=${this.fromDate}&toDate=${this.toDate}&memberships=${this.memberships}&ranks=${this.ranks}`
      )
      .map((res: DanpheHTTPResponse) => res)
      .finally(() => {
        this.loading = false;
      }) //re-enable button after response comes back.
      .subscribe(
        (res) => this.Success(res),
        (res) => this.Error(res)
      );
  }

  Success(res): void {
    if (
      res.Status === ENUM_DanpheHTTPResponseText.OK &&
      res.Results.length > 0
    ) {
      this.showGrid = true;
      this.TotalAdmittedPatientReport = res.Results;
    } else if (
      res.Status === ENUM_DanpheHTTPResponseText.OK &&
      res.Results.length === 0
    )
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, [
        "Data is Not Available Between Selected Parameters...Try Different",
      ]);
    else
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
        res.ErrorMessage,
      ]);
  }
  Error(err): void {
    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [
      err.ErrorMessage,
    ]);
  }

  OnFromToDateChange($event): void {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
    this.dateRange =
      "<b>Date:</b>&nbsp;" +
      this.fromDate +
      "&nbsp;<b>To</b>&nbsp;" +
      this.toDate;
  }

  MembershipsChanged($event): void {
    let defMemberships = [];
    let defMembershipNames = [];
    $event.forEach((x) => {
      defMemberships.push(x.MembershipTypeId);
      defMembershipNames.push(x.MembershipTypeName);
    });
    let membershipList = defMemberships.join(",");
    this.memberships = membershipList;
    let MembershipNames = defMembershipNames.join(",");
    this.membershipNames = MembershipNames;
  }

  RanksChanged($event): void {
    let defRanks = [];
    $event.forEach((x) => {
      defRanks.push(x.RankName);
    });
    let rankList = defRanks.join(",");
    this.ranks = rankList;
  }

  MapPreSelectedRanks(preSelectedRanks): void {
    let defRanks = [];
    preSelectedRanks.forEach((x) => {
      defRanks.push(x.RankName);
    });
    let rankList = defRanks.join(",");
    this.ranks = rankList;
  }

  MapPreSelectedMemberships(preSelectedMemberships): void {
    let defMemberships = [];
    preSelectedMemberships.forEach((x) => {
      defMemberships.push(x.MembershipTypeId);
    });
    let membershipList = defMemberships.join(",");
    this.memberships = membershipList;
  }
}

import { Component, Input } from "@angular/core";
import * as moment from "moment";
import { IGridFilterParameter } from "../../../shared/danphe-grid/grid-filter-parameter.interface";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMGridColumns from "../../shared/phrm-grid-columns";
import * as _ from 'lodash';

@Component({
    templateUrl: "RankMembershipwiseSalesReport.component.html"
})
export class RankMembershipwiseSalesReportComponent {
    RankMembershipwiseSalesColumn: Array<any> = null;
    RankMembership: Array<string> = new Array<string>();
    RankMembershipwiseSales: Array<RankMembershipwiseSales> = new Array<RankMembershipwiseSales>();
    FilteredRankMembershipSales: Array<RankMembershipwiseSales> = new Array<RankMembershipwiseSales>()
    public FromDate: string = null;
    public ToDate: string = null;
    public Membership: Array<Membership> = new Array<Membership>();
    public Rank: Array<Rank> = new Array<Rank>();

    @Input('filter-parameters')
    public filterParameters: IGridFilterParameter[] = [];
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public pharmacy: string = "pharmacy";
    public loading: boolean = false;
    dateRange: string;
    IsRankchanged: boolean = false;
    IsMembershipchanged: boolean = false;
    MembershipTypeName: string;
    MembershipsTypeName: string[] = [];
    public preSelectedRanks = [];
    public preSelectedMemberships = [];
    public memberships: string = "";
    public ranks: string = "";

    constructor(public pharmacyBLService: PharmacyBLService,
        public msgBoxServ: MessageboxService) {
        this.FromDate = moment().format("YYYY-MM-DD");
        this.ToDate = moment().format("YYYY-MM-DD");
        this.RankMembershipwiseSalesColumn = PHRMGridColumns.RankMembershipwiseSales;
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("InvoiceDate", false));
        this.GetAllMembership();
        this.GetAllRank();
    }
    public GetRankMembershipwiseSalesData(): void {
        this.filterParameters = [
            { DisplayName: "Rank:", Value: this.ranks == undefined || null ? 'All' : this.ranks },
            { DisplayName: "Membership:", Value: this.memberships == undefined || null ? 'All' : this.MembershipTypeName },
            { DisplayName: "DateRange:", Value: this.dateRange },
        ]
        this.pharmacyBLService.GetRankMembershipwiseSalesData(this.FromDate, this.ToDate, this.ranks, this.memberships)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results) {
                        this.RankMembershipwiseSales = res.Results;
                        this.FilteredRankMembershipSales = res.Results;
                    }
                }
                else {

                    this.msgBoxServ.showMessage("failed", ['failed to get items..']);
                }
            })
    }
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }
    OnFromToDateChange($event) {
        if ($event) {
            this.FromDate = $event.fromDate != null ? $event.fromDate : this.FromDate;
            this.ToDate = $event.toDate != null ? $event.toDate : this.ToDate;
            this.dateRange = "<b>Date:</b>&nbsp;" + this.FromDate + "&nbsp;<b>To</b>&nbsp;" + this.ToDate;
        }
    }
    public GetAllMembership(): void {
        try {
            this.pharmacyBLService.GetAllMembership()
                .subscribe(res => {
                    if (res.Status == 'OK') {
                        let membershipList: Array<Membership> = new Array<Membership>();
                        membershipList = res.Results;
                        membershipList.forEach(p => {
                            let val = _.cloneDeep(p);
                            this.preSelectedMemberships.push(val);
                        });
                        this.MapPreSelectedMemberships(this.preSelectedMemberships);
                        this.Membership = membershipList;
                    }
                },
                    err => {
                        this.msgBoxServ.showMessage("failed", ['failed to get Membership..']);
                    }
                );
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    } MapPreSelectedMemberships(preSelectedMemberships): void {
        let defMemberships = [];
        preSelectedMemberships.forEach(x => {
            defMemberships.push(x.MembershipTypeId);
            this.MembershipsTypeName.push(x.MembershipTypeName);

        });
        let membership = this.MembershipsTypeName.join(",");
        this.MembershipTypeName = membership;
        let membershipList = defMemberships.join(",");
        this.memberships = membershipList;
    }
    MembershipsChanged($event): void {
        let defMemberships = [];
        this.MembershipsTypeName = [];
        $event.forEach(x => {
            defMemberships.push(x.MembershipTypeId);
            this.MembershipsTypeName.push(x.MembershipTypeName);
        });
        let membershipList = defMemberships.join(",");
        let membership = this.MembershipsTypeName.join(",");
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
    myMembershipListFormatter(data: any): string {
        let html = data["MembershipTypeName"];
        return html;
    }
    myRankListFormatter(data: any): string {
        let html = data["RankName"];
        return html;
    }
    public GetAllRank(): void {
        try {
            this.pharmacyBLService.GetAllRankList()
                .subscribe(res => {
                    if (res.Status == 'OK') {
                        let ranks: Array<Rank> = new Array<Rank>();
                        ranks = res.Results;
                        ranks.forEach(x => {
                            x['Rank'] = x.RankName;
                        });
                        ranks.forEach(p => {
                            let val = _.cloneDeep(p);
                            this.preSelectedRanks.push(val);
                        });
                        this.MapPreSelectedRanks(this.preSelectedRanks);
                        this.Rank = ranks;
                    }
                },
                    err => {
                        this.msgBoxServ.showMessage("failed", ['failed to get Membership..']);
                    }
                );
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    MapPreSelectedRanks(preSelectedRanks): void {
        let defRanks = [];
        preSelectedRanks.forEach(x => {
            defRanks.push(x.RankName);
        });
        let rankList = defRanks.join(",");
        this.ranks = rankList;
    }

    gridExportOptions = {
        fileName:
            "RankMembershipwiseSalesReport" + moment().format("YYYY-MM-DD") + ".xls",
    };
}
export class RankMembershipwiseSales {
    InvoiceDate: string = "";
    InvoiceNo: string | number = "";
    Subtotal: number = null;
    DiscountAmount: number = null;
    TotalAmount: number = null;
    PaymentMode: string = "";
    Rank: string = "";
    PatientName: string = "";
    HospitalNo: string = "";
    MembershipTypeName: string = "";
    Store: string = "";
    User: string = "";

}
export class Membership {
    MembershipTypeId: number = null;
    MembershipTypeName: string = "";
}
class Rank {
    RankId: number = null;
    RankName: string = "";
}
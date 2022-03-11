import { CodeDetailsModel } from "../../shared/code-details.model";
import { AuditTrailModel } from "../../../app/system-admin/shared/audit-trail-model";
import { FiscalYearModel } from "../settings/shared/fiscalyear.model";
import { LedgerModel } from "../settings/shared/ledger.model";
import { ledgerGroupModel } from "../settings/shared/ledgerGroup.model";
import { SectionModel } from "../settings/shared/section.model";
import { ChartofAccountModel } from "../settings/shared/chart-of-account.model";
import { PrimaryGroupModel } from "../settings/shared/primary-group.model";
import { Voucher } from "../transactions/shared/voucher";
import { VoucherHeadModel } from "../settings/shared/voucherhead.model";
//this class is to reuse inside accounting for hospital related information.
//created: 21Jun'20- Sud/Nagesh
//We can extend this model to fill up other information of current hospital whenever required.

export class AccHospitalInfoVM {
    public ActiveHospitalId: number = 0;
    public FiscalYearList: Array<FiscalYearModel> = [];
    public SectionList: Array<SectionModel> = [];
    public TodaysDate: string = null;

    //below properties are only for client side..
    public HospitalShortName: string = null;
    public HospitalLongName: string = null;
    public TotalHospitalPermissionCount: number = 0;
    public CurrFiscalYear: FiscalYearModel = new FiscalYearModel();
}

//mumbai-team-june2021-danphe-accounting-cache-change
export class AccCacheDataVM {
public VoucherType: Array<Voucher> = new Array<Voucher>();
public COA: Array<ChartofAccountModel> = new Array<ChartofAccountModel>();
public PrimaryGroup: Array<PrimaryGroupModel> = new Array<PrimaryGroupModel>();
public VoucherHead: Array<VoucherHeadModel> = new Array<VoucherHeadModel>();
public FiscalYearList: Array<FiscalYearModel> = new Array<FiscalYearModel>();
public Sections: Array<SectionModel> = new Array<SectionModel>();
public CodeDetails: Array<CodeDetailsModel> = new Array<CodeDetailsModel>();
public AuditReportType: Array<AuditTrailModel> = new Array<AuditTrailModel>();
public LedgerGroups: Array<ledgerGroupModel> = new Array<ledgerGroupModel>();
public Ledgers: Array<LedgerModel> = new Array<LedgerModel>();
public LedgersALL: Array<LedgerModel> = new Array<LedgerModel>();
}
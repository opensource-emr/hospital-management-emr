import { FiscalYearModel } from "../settings/shared/fiscalyear.model";
import { SectionModel } from "../settings/shared/section.model";
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
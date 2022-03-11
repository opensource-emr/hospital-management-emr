import * as moment from "moment";

export class FixedAssetFaultHistoryModel {
    // pk  
    public FaultHistoryId: number = 0;
    public FixedAssetStockId: number = 0;

    public FaultDate: string = moment().format("YYYY-MM-DD");;
    public FaultDescription: string;

    public FaultResolvedDate: string = moment().format("YYYY-MM-DD");;
    public FaultResolvedRemarks: string;

    public CreatedBy: number;
    public CreatedOn: string;
    public ModefiedBy: number;
    public ModefiedOn: string;
    public CreatedName: string;

    public IsFaultResolved: boolean = false;


}
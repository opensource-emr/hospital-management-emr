import * as moment from "moment";
import { DispatchItems } from "./dispatch-items.model";

export class Dispatch {
    DispatchId: number = 0;
    RequisitionId: number = 0;
    FiscalYearId: number = 0;
    DispatchNo: number = 0;
    SourceStoreId: number = 0;
    TargetStoreId: number = 0;
    CreatedBy: number = 0;
    CreatedOn: string = moment().format('YYYY-MM-DD');
    Remarks: string = '';
    DispatchItems: DispatchItems[] = [];
    ReqDisGroupId: number = null;
}
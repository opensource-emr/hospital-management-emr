export class RequisitionDispatch_DTO {
    RequisitionNo: number = 0;
    TargetStoreName: string = '';
    SourceStoreName: string = '';
    RequisitionDate: string = '';
    RequestedByName: string = '';
    IssueNo: number = null;
    DispatchNo: number = null;
    DispatchedByName: string = '';
    DispatchedDate: string = '';
    ReceivedBy: string = '';
    ReceivedDate: string = '';
    Remarks: string = '';
    IsDirectDispatched: boolean = false;
}
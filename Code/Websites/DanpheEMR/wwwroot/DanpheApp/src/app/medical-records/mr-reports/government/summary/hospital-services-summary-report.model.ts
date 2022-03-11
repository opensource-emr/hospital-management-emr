export class HospitalServiceSummaryReportModel{
    public InpatientReferredOut : Array<InpatientReferredOutModel> = new Array<InpatientReferredOutModel>();
}

export class InpatientReferredOutModel{
    public IpRO_MaleCount : number;
    public IpRO_FemaleCount : number;
}
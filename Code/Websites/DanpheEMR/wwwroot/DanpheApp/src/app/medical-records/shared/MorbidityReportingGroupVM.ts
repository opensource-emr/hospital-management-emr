
export class MorbidityReportingGroupVM {
    public ReportingGroupId: string;
    public ReportingGroupName: string;
    public GroupCode: string;
    public SerialNumber: string;
    public DiseasesGroup: Array<MorbidityDiseaseGroupVM> = new Array<MorbidityDiseaseGroupVM>()
}


export class MorbidityDiseaseGroupVM {    
    public SerialNumber: number;
    public ICDCode: string;
    public DiseaseGroupName: string;
    public NumberOfMale: number;
    public NumberOfFemale: number;
    public NumberOfOtherGender: number;
}


export class MorbidityReportingGroupVM {
    public ReportingGroupId: string;
    public ReportingGroupName: string;
    public IcdVersion: string;
    public DiseasesGroup: string | MorbidityDiseaseGroupVM[];
}


export class MorbidityDiseaseGroupVM {
    public SerialNumber: number;
    public ICDCode: string;
    public DiseaseGroupName: string;
    public NumberOfMale: number;
    public NumberOfFemale: number;
    public NumberOfOtherGender: number;
}

export class EMERMorbidityReportingGroupVM {
    public ReportingGroupId: string;
    public ReportingGroupName: string;
    public IcdVersion: string;
    public DiseasesGroup: string | EMERMorbidityDiseaseGroupVM[];
}

export class EMERMorbidityDiseaseGroupVM {
    public SerialNumber: number;
    public ICDCode: string;
    public DiseaseGroupName: string;
    public NumberOfMale: number;
    public NumberOfFemale: number;
    public NumberOfOtherGender: number;
}

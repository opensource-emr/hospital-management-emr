export class EmergencyPatientCases_DTO {
    PatientCaseId: number = 0;
    ERPatientId: number = 0;
    MainCase: number = 0;
    SubCase: number = 0;
    OtherCaseDetails: string = null;
    BitingSite: number = 0;
    DateTimeOfBite: string = null;
    BitingAnimal: number = 0;
    FirstAid: number = 0;
    FirstAidOthers: string = null;
    BitingAnimalOthers: string = null;
    BitingSiteOthers: string = null;
    BitingCountry: number;
    BitingMunicipality: number;
    BitingAddress: string = null;
    IsActive: boolean = false;
    CreatedBy: number = 0;
    CreatedOn: string = null;
    ModifiedBy: number = 0;
    ModifiedOn: string = null;
    BitingAnimalName: string = null;
}
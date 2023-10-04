export class PharmacyPatientConsumptionReturnInfo_DTO {
    ReturnReceiptNo: number = null;
    HospitalNo: number = null;
    PatientName: string = null;
    PatientId: number = 0;
    Address: string = null;
    CountrySubDivisionName: number = null;
    Sex: string = '';
    Age: string = '';
    ContactNo: string = '';
    IpNo: string = null;
    CreatedOn: string = '';
    PrescriberName: string = '';
    PrescriberNMCNo: string = '';
    CurrentFiscalYearName: string = '';
    SubTotal: number = 0;
    TotalAmount: number = 0;
    UserName: string = '';
    PatientConsumptionReturnItems: PharmacyPatientConsumptionReturnItem_DTO[] = [];
}

export class PharmacyPatientConsumptionReturnItem_DTO {
    ItemName: string = '';
    GenericName: string = '';
    ItemDisplayName: string = '';
    Quantity: number = 0;
    ExpiryDate: string = '';
    BatchNo: string = '';
    RackNo: string = '';
    SalePrice: number = 0;
    SubTotal: number = 0;
    TotalAmount: number = 0;

}

export class CardCalculationModel {
    TransactionType: string = "";
    TotalAmount: number = 0;
    TotalUnit: number = 0;
}

export class BarchartModel {
    Names: Array<Store> = new Array<Store>();
    DispatchValues: Array<DispatchValue> = new Array<DispatchValue>();
}

class Store {
    Name: string = '';
}
class DispatchValue {
    TotalDispatchValue: number = 0;
}

export class MembershipwiseMedicineSaleModel {
    MembershipTypeName: string = '';
    TotalSales: number = 0;
    QuantitySold: number = 0;
}
export class MedicineSaleModel {
    ItemName: string = '';
    SoldQuantity: number = 0;
}
export class DateRange {
    fromDate: string;
    toDate: string;
    range: string;
};
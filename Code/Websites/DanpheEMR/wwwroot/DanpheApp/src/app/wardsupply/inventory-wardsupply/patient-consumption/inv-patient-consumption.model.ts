import * as moment from "moment";
import { WardInventoryConsumptionModel } from "../../shared/ward-inventory-consumption.model";

export class InvPatientConsumptionModel {
    public ConsumptionReceiptId: number = 0;
    public ConsumptionReceiptNo: number = 0;
    public ConsumptionDate: string = moment().format("YYYY-MM-DD");
    public PatientId: number;
    public StoreId: number;
    public Remarks: string;
    public IsCancel: boolean = false;

    public CreatedBy: number = 0;
    public CreatedOn: string = moment().format("YYYY-MM-DD");
    public ModifiedBy: number;
    public ModifiedOn: string;

    public ConsumptionList: Array<WardInventoryConsumptionModel> = new Array<WardInventoryConsumptionModel>();
}
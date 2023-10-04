
import { DrugsRequisitonModel } from "../../nursing/shared/drugs-requsition.model"
import { PHRMInvoiceItemsModel } from "./phrm-invoice-items.model"

export class PHRMProvisionalItemVMModel{

    public proItem: PHRMInvoiceItemsModel = new PHRMInvoiceItemsModel();
    public drugsRequest: DrugsRequisitonModel = new DrugsRequisitonModel();

}
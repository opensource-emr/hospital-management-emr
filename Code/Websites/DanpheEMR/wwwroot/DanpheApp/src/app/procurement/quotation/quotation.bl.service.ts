import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { InventoryDLService } from '../../inventory/shared/inventory.dl.service';
import { QuotationUpLoadFileModel } from './quotation-upload-file.model';
import { QuotationModel } from './quotation.model';
import { RequestForQuotationModel } from './request-for-quotaion.model';

@Injectable()
export class QuotationBLService {
    constructor(public inventoryDLService: InventoryDLService) {
    }
    public GetQuotationList(ReqForQuotationId) {
        return this.inventoryDLService.GetQuotationList(ReqForQuotationId)
            .map((responseData) => {
                return responseData;
            });
    }
    public GetReqForQuotationList() {
        return this.inventoryDLService.GetReqForQuotationList()
            .map((responseData) => {
                return responseData;
            });
    }
    public getQuotationBySelected(ReqForQuotationId) {
        return this.inventoryDLService.getQuotationBySelected(ReqForQuotationId)
            .map((responseData) => {
                return responseData;
            });
    }
    public GetReqForQuotationById(ReqForQuotationId) {
        return this.inventoryDLService.GetReqForQuotationById(ReqForQuotationId)
            .map((responseData) => {
                return responseData;
            });
    }
    public GetQuotationItemsById(QuotationId) {
        return this.inventoryDLService.GetQuotationItemsById(QuotationId)
            .map((responseData) => {
                return responseData;
            });
    }
    //GET requested quotation list
    GetRequestedQuotationList() {
        return this.inventoryDLService.GetRequestedQuotationList()
            .map(res => { return res });
    }

    //Get Quotaion details
    GetQuotationDetails(ReqForQuotationId: number) {
        return this.inventoryDLService.GetQuotationDetails(ReqForQuotationId)
            .map((responseData) => {
                return responseData;
            });
    }
    //get item list
    public GetRFQItemsList(ReqForQuotationId: number) {
        return this.inventoryDLService.GetRFQItemsList(ReqForQuotationId)
            .map((responseData) => {
                return responseData;
            });
    }
    //get rfq vendors list
    public GetRFQVendorsList(ReqForQuotationId: number) {
        return this.inventoryDLService.GetRFQVendorsList(ReqForQuotationId)
            .map((responseData) => {
                return responseData;
            });
    }
    //get view files list
    public loadQuotationAttachedFiles(ReqForQuotationId) {
        return this.inventoryDLService.loadQuotationAttachedFiles(ReqForQuotationId)
            .map((responseData) => {
                return responseData;
            });
    }

    //get view files list
    public getPreviousQuotationDetailsByVendorId(ReqForQuotationId, VendorId) {
        return this.inventoryDLService.getPreviousQuotationDetailsByVendorId(ReqForQuotationId, VendorId)
            .map((responseData) => {
                return responseData;
            });
    }
    //Save Return to vendor Item
    public PostQuotationDetails(quoDetails: Array<any>) {
        //let formToPost = new FormData();
        //var omited = _.omit(quoDetails, ['QuotationValidator']);
        // let newPoItems = quoDetails.push(quoDetails.).map(item => {
        //     return _.omit(item, ['QuotationItemsValidator']);
        // });

        //omited.quotationItems = newPoItems;
        //let data = JSON.stringify(omited);
        //  formToPost.append("quotationDetails", quotationDetails);

        return this.inventoryDLService.PostQuotationDetails(quoDetails)
            .map(res => { return res })
    }

    public AddQuotationFiles(filesToUpload, reqQuotation: QuotationUpLoadFileModel) {
        try {
            let formToPost = new FormData();
            var fileName: string;
            var omited = _.omit(reqQuotation, ['QuotationFileValidator']);

            var quotationFileDetails = JSON.stringify(omited);//encodeURIComponent();


            let uploadedImgCount = 0;

            for (var i = 0; i < filesToUpload.length; i++) {
                //to get the imagetype
                let splitImagetype = filesToUpload[i].name.split(".");
                let imageExtension = splitImagetype[1];

                fileName = "Quotation" + "_" + moment().format('DDMMYYHHmmss') + "." + imageExtension;
                // reqQuotation.FileName = fileName;
                formToPost.append("uploadQuotationFiles", filesToUpload[i], fileName);
            }

            formToPost.append("quotationFileDetails", quotationFileDetails);

            return this.inventoryDLService.PostQuotationFiles(formToPost)
                .map(res => res);

        } catch (exception) {
            throw exception;
        }
    }

    //Post:posting the request for quotation in requestforquotation table
    PostToReqForQuotation(PO: RequestForQuotationModel) {

        //omiting the validators during post because it causes cyclic error during serialization in server side.
        //omit validator from inputPO (this will give us object)
        let newPO: any = _.omit(PO, ['ReqForQuotationValidator']);
        let newPoItems = PO.ReqForQuotationItems.map(item => {
            return _.omit(item, ['ReqForQuotationItemValidator']);
        });
        //assign items to above 'newPO' with exact same propertyname : 'PurchaseOrderItems'
        newPO.ReqForQuotationItems = newPoItems;

        let data = JSON.stringify(newPO);
        return this.inventoryDLService.PostToReqForQuotation(data)
            .map(res => { return res })
    }

    //PUT:update Selected Quotation and RequestedQuotation
    public UpdateVendorForPO(selectedVendor: QuotationModel) {

        var omit = _.omit(selectedVendor, ['QuotationValidator']);

        let data = JSON.stringify(omit);
        return this.inventoryDLService.UpdateVendorForPO(data)
            .map(res => { return res });

    }
}

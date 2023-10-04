import { Component, ViewChild, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import * as moment from "moment";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { FixedAssetContractModel } from "./fixed-asset-contract.model";
import { FixedAssetStockModel } from "../../shared/fixed-asset-stock.model";
import { Lightbox } from "angular2-lightbox";
import { FixedAssetBLService } from "../../shared/fixed-asset.bl.service";
@Component({
  selector: 'asset-contract-upload',
  templateUrl: './asset-contract-upload.html'
})

export class AssetContractUploadComponent {


  @ViewChild("fileInput") fileInput;


  public selectedAsset: FixedAssetStockModel = new FixedAssetStockModel();

  public AssetContractFileDetails: FixedAssetContractModel;

  public fileSrc: any = null;
  public editMode: boolean = false;
  public loading: boolean;
  public reUploadContractFlag: boolean = false;
  @Output('call-back')
  public callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

  public isFileValid: boolean = true;
  public showFilePreview: boolean = false;

  constructor
    (public fixedAssetBLService: FixedAssetBLService,
      public msgBoxSrv: MessageboxService,
      public lightBox: Lightbox,
  ) { }

  @Input('selectedAsset')
  public set Value(val) {
    this.selectedAsset = val;
    this.AssetContractFileDetails = new FixedAssetContractModel();
    this.AssetContractFileDetails.FixedAssetStockId = this.selectedAsset.FixedAssetStockId;
  }

  ngOnInit() {
    if (this.AssetContractFileDetails.FixedAssetStockId) {
      this.GetAssetContract();
    }
  }
  public GetAssetContract() {
    this.fixedAssetBLService.GetAssetContract(this.selectedAsset.FixedAssetStockId)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results) {
          this.editMode = true;
          this.AssetContractFileDetails = res.Results;
        }
      });
  }
  SubmitHeader() {
    try {
      this.loading = true;
      let file = null;
      file = this.fileInput.nativeElement.files[0];

      //file Validation
      if (file) {
        this.isFileValid = this.ValidateFileSize(file)
      }
      else {
        this.isFileValid = false;
        this.loading = false;
        this.msgBoxSrv.showMessage("error", ["No File Selected!"]);
      }

      if (this.isFileValid) {

        let formDataToPost = new FormData();
        var fileName: string = "";
        if (file) {
          let splitImagetype = file.name.split(".");
          let fileExtension = splitImagetype[1];
          fileName = this.selectedAsset.FixedAssetStockId + "_Contract_" + moment() + "." + fileExtension;

          this.AssetContractFileDetails.ContractFileName = fileName;
          this.AssetContractFileDetails.FileExtention = fileExtension;

          var fileDetails = JSON.stringify(this.AssetContractFileDetails);

          formDataToPost.append("uploads", file, fileName);
          formDataToPost.append("fileDetails", fileDetails);
        }

        if (!this.editMode) {
          this.PostInvoiceHeader(formDataToPost);

        } else if (this.editMode) {
          this.PutInvoiceHeader(formDataToPost);
        }
        else {
          this.msgBoxSrv.showMessage("error", ["Error"]);
          this.loading = false;
        }
      }
    } catch (ex) {
      console.log(ex);
      //this.msgBoxSrv.showMessage("error", [ex]);
    }
  }

  public ValidateFileSize(file) {
    let flag = true;
    if (file.size < 10485000) {
      flag = true;
    } else {
      this.msgBoxSrv.showMessage("error", ["Size of file must be less than 10 MB !"]);
      flag = false;
      this.loading = false;
    }
    return flag;
  }

  PostInvoiceHeader(formToPost): void {
    try {
      this.fixedAssetBLService.PostAssetContract(formToPost)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              //this.Close();
              this.msgBoxSrv.showMessage("success", ['file is Uploded']);
              this.callbackAdd.emit({ data: res.Results, status: "Ok" });
              this.editMode = false;
              //this.SendCallBack(res);
            }
            else if (res.Status == "Failed") {
              this.msgBoxSrv.showMessage("error", ['Failed']);
            }
            else {
              this.msgBoxSrv.showMessage("failed", [res.ErrorMessage]);
            }
            this.loading = false;
          },
          err => {
            console.log(err);
          });

    } catch (exception) {
      console.log(exception);
    }

  }

  public PutInvoiceHeader(formToPost): void {
    try {
      this.fixedAssetBLService.PutAssetContract(formToPost)
        .subscribe(
          res => {
            if (res.Status == "OK") {

              this.msgBoxSrv.showMessage("success", ['file is Updated']);
              this.callbackAdd.emit({ data: res.Results, status: "Ok" });
              this.editMode = false;
            }
            else if (res.Status == "Failed") {
              this.msgBoxSrv.showMessage("error", ['Failed']);
            }
            else {
              this.msgBoxSrv.showMessage("failed", [res.ErrorMessage]);
            }
            this.loading = false;
          },
          err => {
            console.log(err);
          });

    } catch (exception) {
      console.log(exception);
    }
  }

  public OnFileSelected(files) {

    if (files.length > 0) {
      var file = files[0];
      var valid = this.ValidateFileSize(file);
      if (valid) {
        this.isFileValid = true;
      } else {
        this.isFileValid = false;
      }
    }
  }


  Close() {
    this.AssetContractFileDetails = new FixedAssetContractModel();
    this.loading = false;
    this.editMode = false;
    this.callbackAdd.emit({ data: null, status: null });
  }

  public ViewContractFile() {
    if (this.AssetContractFileDetails.FileBinaryData) {

      // var byteArray = new Uint8Array(atob(this.AssetContractFileDetails.FileBinaryData).split('').map(char=>char.charCodeAt(0)));
      // var blob = new Blob([byteArray],{type:'application/pdf'});
      // this.fileSrc = window.URL.createObjectURL(blob);

      // base64 shows Binary data (Bytes) of file in ASCII (i.e. string form)
      var base64 = this.AssetContractFileDetails.FileBinaryData;

      const binaryString = window.atob(base64); // Comment this if not using base64
      const bytes = new Uint8Array(binaryString.length);
      const arrayBuffer = bytes.map((byte, i) => binaryString.charCodeAt(i)); // base64 into array buffer

      // creating blob object 
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

      // getting file source from blob
      this.fileSrc = URL.createObjectURL(blob);

      this.showFilePreview = true;
    } else {
      this.showFilePreview = false;
      alert("File Data Corrupted !!");
    }
  }

  public DownloadContractFile() {
    if (this.AssetContractFileDetails.FileBinaryData) {

      var base64 = this.AssetContractFileDetails.FileBinaryData; // base64 shows Binary data (Bytes) of file in ASCII (i.e. string form)

      const binaryString = window.atob(base64); // Comment this if not using base64
      const bytes = new Uint8Array(binaryString.length);
      const arrayBuffer = bytes.map((byte, i) => binaryString.charCodeAt(i)); // base64 into array buffer

      // creating blob object 
      const blob = new Blob([arrayBuffer]);
      const fileName = this.AssetContractFileDetails.ContractFileName;

      // Download file 
      if (navigator.msSaveBlob) {
        // IE 10+
        navigator.msSaveBlob(blob, fileName);
      } else {
        const link = document.createElement('a');
        // Browsers that support HTML5 download attribute
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', fileName);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } else {
      alert("File Data Corrupted !!");
    }
  }

}

import { Component, ViewChild, Input, Output, EventEmitter, ChangeDetectorRef, OnInit } from "@angular/core";
import { InvoiceHeaderModel } from "../invoice-header.model";
import { SecurityService } from "../../security/shared/security.service";
import { MessageboxService } from "../messagebox/messagebox.service";
import { Lightbox } from "angular2-lightbox";
import { DLService } from "../dl.service";
import * as moment from "moment";
import { HttpClient } from "@angular/common/http";
import * as _ from 'lodash';
import { Renderer2 } from "@angular/core";
@Component({
  selector: 'add-invoice-header',
  templateUrl: './add-invoice-header.html'
})

export class AddInvoiceHeaderComponent implements OnInit {


  @ViewChild("fileInput") fileInput;

  public showAddPage: boolean = false;
  @Input('selectedInvoiceHeader')
  public eidtableHeader: InvoiceHeaderModel;

  public imgURL: any = null;
  public selectedInvoiceHeader: InvoiceHeaderModel = new InvoiceHeaderModel();
  public editMode: boolean = false;
  public module: string = "";
  public loading: boolean;
  @Output('call-back')
  public callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  public isFileValid: boolean = true;
  public globalListenFunc: Function;
  public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.

  @Input('Module')
  public set moduleValue(value) {
    this.module = value;

  }

  constructor(private _http: HttpClient,
    public securityService: SecurityService,
    public msgBoxSrv: MessageboxService,
    public dlService: DLService,
    public lightbox: Lightbox,
    public changeDetector: ChangeDetectorRef, public renderer2: Renderer2) {
  }

  @Input('showAddPage')
  public set value(val) {
    this.showAddPage = val;
    if (this.eidtableHeader && this.eidtableHeader.InvoiceHeaderId > 0) {
      this.editMode = true;
      this.selectedInvoiceHeader = Object.assign(this.selectedInvoiceHeader, this.eidtableHeader);
      this.selectedInvoiceHeader.Module = this.module;
      if (this.selectedInvoiceHeader.FileBinaryData) {
        this.imgURL = 'data:image/jpeg;base64,' + this.selectedInvoiceHeader.FileBinaryData;
      }
    }
    else {
      this.editMode = false;
      this.selectedInvoiceHeader = new InvoiceHeaderModel();
      this.selectedInvoiceHeader.Module = this.module;
      this.changeDetector.detectChanges();
      this.setFocusById('hospital');
    }
  }

  ngOnInit() {
    this.globalListenFunc = this.renderer2.listen('document', 'keydown', e => {
      if (e.keyCode == this.ESCAPE_KEYCODE) {
        this.Close()
      }
    });
  }
  SubmitHeader() {
    try {
      this.loading = true;
      this.selectedInvoiceHeader.Module = this.module;
      let file = null;
      file = this.fileInput.nativeElement.files[0];

      //Header details Validation
      var isValid = true;
      if (this.selectedInvoiceHeader) {
        var isValid = this.CheckValidation();
      }

      // Logo Image file Validation
      if (file) {
        this.isFileValid = this.ValidateImageSize(file)
      }
      else if (!file && this.editMode) { // Not showing file error in edit mode, file may not be changed. 
        this.isFileValid = true;
        file = null;
      } else {
        this.isFileValid = false;
        this.loading = false;
        this.msgBoxSrv.showMessage("error", ["No File Selected!"]);
      }

      if (isValid && this.isFileValid) {
        this.selectedInvoiceHeader.CreatedOn = moment().format("YYYY-MM-DD");
        var headerDetails: any = this.selectedInvoiceHeader;

        // Drafting Data for post (Logo Image file detais and Header details)
        let formToPost = new FormData();
        if (headerDetails) {
          var fileName: string = "";
          if (file) {
            let splitImagetype = file.name.split(".");
            let fileExtension = splitImagetype[1];
            fileName = headerDetails.Module + "_InvoiceLogo_" + moment() + "." + fileExtension;
            headerDetails.LogoFileName = fileName;
            headerDetails.LogoFileExtention = fileExtension;
            formToPost.append("uploads", file, fileName);
          }
          var tempFD: any = _.omit(headerDetails, ['HeaderValidators']);
          var tempHeaderDetails = JSON.stringify(tempFD);
          formToPost.append("fileDetails", tempHeaderDetails);
        }

        if (!this.editMode) {
          this.PostInvoiceHeader(formToPost);

        } else if (this.editMode) {
          this.PutInvoiceHeader(formToPost);
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

  public ValidateImageSize(file) {
    let flag = true;
    if (file.size < 10485000) {
      flag = true;
    } else {
      this.msgBoxSrv.showMessage("error", ["Size of file must be less than 10 MB !"]);
      flag = false;
    }
    return flag;
  }

  PostInvoiceHeader(formToPost): void {
    try {
      /*Bikash: 12July'20 :
         * this component can be used billing, inventory and pharmacy and
         * there is no service that is shared by these modules,
         * hence, the api call has been made directly here.
        */
      this._http.post<any>("/api/Pharmacy/postInvoiceHeader", formToPost)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.Close();
              this.msgBoxSrv.showMessage("success", ['Image is Uploded']);
              this.SendCallBack(res);
            }
            else if (res.Status == "Failed") {
              this.msgBoxSrv.showMessage("error", ['Failed']);
              this.loading = false;
            }
            else {
              this.loading = false;
              this.msgBoxSrv.showMessage("failed", [res.ErrorMessage]);
            }
          },
          err => {
            console.log(err);
          });

    } catch (exception) {
      // this.ShowCatchErrMessage(exception);
    }

  }

  PutInvoiceHeader(formToPost): void {
    try {
      /*Bikash: 12July'20 :
       * this component can be used billing, inventory and pharmacy and
       * there is no service that is shared by these modules,
       * hence, the api call has been made directly here.
      */
      this._http.put<any>("/api/Pharmacy/putInvoiceHeader", formToPost)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.Close();
              this.msgBoxSrv.showMessage("success", ['Image is Uploded']);
              this.SendCallBack(res);
            }
            else if (res.Status == "Failed") {
              this.msgBoxSrv.showMessage("error", ['Failed']);
              this.loading = false;
            }
            else
              this.msgBoxSrv.showMessage("failed", [res.ErrorMessage]);
          },
          err => {
            console.log(err);
          });

    } catch (exception) {
      // this.ShowCatchErrMessage(exception);
    }
  }
  public CheckValidation(): boolean {
    var isValid: boolean = true;

    for (var i in this.selectedInvoiceHeader.HeaderValidators.controls) {
      this.selectedInvoiceHeader.HeaderValidators.controls[i].markAsDirty();
      this.selectedInvoiceHeader.HeaderValidators.controls[i].updateValueAndValidity();
    }
    if (this.selectedInvoiceHeader.IsValidCheck(undefined, undefined)) {
      isValid = true
    }
    else {
      isValid = false;
      this.loading = false;
      this.msgBoxSrv.showMessage("Notice-Message", ["Please insert all required details.."]);
    }
    return isValid;
  }

  public ShowLogoPreview(files) {
    this.imgURL = null;
    if (files.length > 0) {
      var mimeType = files[0].type;
      if (mimeType.match(/image\/*/) == null) {
        this.msgBoxSrv.showMessage("error", ["Only images are supported."]);
        return;
      }

      var reader = new FileReader();
      reader.readAsDataURL(files[0]);
      reader.onload = (_event) => {
        this.imgURL = reader.result;
      }
      this.isFileValid = true;
    } else {
      var reader = new FileReader();
    }
  }
  Close() {
    this.selectedInvoiceHeader = new InvoiceHeaderModel();
    this.loading = false;
    this.editMode = false;
    this.imgURL = null;
    this.showAddPage = false;
  }
  SendCallBack(res) {
    if (res.Status == "OK") {
      this.callbackAdd.emit({ invoiceHeader: res.Results });
    }
    else {
      this.msgBoxSrv.showMessage("error", ['Check log for details']);
    }
  }
  setFocusById(IdToBeFocused) {
    window.setTimeout(function () {
      document.getElementById(IdToBeFocused).focus();
    }, 20);
  }

}

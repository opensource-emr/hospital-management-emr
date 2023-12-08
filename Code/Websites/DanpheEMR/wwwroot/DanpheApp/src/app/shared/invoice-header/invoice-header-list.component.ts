import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Lightbox } from "angular2-lightbox";
import { CoreService } from '../../core/shared/core.service';
import { GeneralFieldLabels } from '../DTOs/general-field-label.dto';
import GridColumnSettings from '../danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from '../danphe-grid/grid-emit.model';
import { InvoiceHeaderModel } from '../invoice-header.model';
import { MessageboxService } from '../messagebox/messagebox.service';

@Component({
  templateUrl: './invoice-header-list.html',
})

export class InvoiceHeaderListComponent {
  [x: string]: any;

  public InvoiceHeaderGridColumns: Array<any> = [];
  public index: number;
  public showAddPage: boolean = false;
  public allInvoiceHeaderList: Array<InvoiceHeaderModel> = [];
  public selectedInvoiceHeader: InvoiceHeaderModel = new InvoiceHeaderModel();

  public module: string = "";
  //showInvoiceLogo: boolean;
  //logoSource: string;
  public GeneralFieldLabel = new GeneralFieldLabels();
  constructor(public changeDetector: ChangeDetectorRef,
    public messageBoxService: MessageboxService,
    private _route: ActivatedRoute,
    public coreservice: CoreService,
    private _http: HttpClient,
    public lightBox: Lightbox) {
    this.InvoiceHeaderGridColumns = GridColumnSettings.InvoiceHeaderList;
    this.GeneralFieldLabel = coreservice.GetFieldLabelParameter();
    this.InvoiceHeaderGridColumns[4].headerName = `${this.GeneralFieldLabel.PANNo} `;
  }
  ngOnInit() {
    this._route.params.subscribe(params => {
      this.module = params['module'];
      this.getInvoiceHeaderList();
    });
  }

  /*Bikash: 20July'20 : this component can be used in Billing, inventory and pharmacy and there is no service that is shared by these modules,
  hence, api has been called directly here.*/
  public getInvoiceHeaderList() {
    this._http.get<any>(`/api/PharmacySettings/InvoiceHeader?Module=${this.module}`)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results && res.Results.length > 0) {
          this.allInvoiceHeaderList = res.Results;
        }
        else {
          this.allInvoiceHeaderList = [];
          this.messageBoxService.showMessage("Information", ["No Invoice Header Found!"])
        }

      }, err => {
        this.messageBoxService.showMessage("Failed", [err.message])
      });
  }

  showAddInvoiceHeader() {
    this.selectedInvoiceHeader = new InvoiceHeaderModel();
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }


  InvoiceHeaderGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "edit": {
        this.selectedInvoiceHeader = null;
        this.index = $event.RowIndex;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedInvoiceHeader = $event.Data;
        this.showAddPage = true;
        break;
      }
      case "view-logo": {
        //this.showInvoiceLogo = true;
        if ($event.Data.FileBinaryData) {
          var logoSource = 'data:image/jpeg;base64,' + $event.Data.FileBinaryData;
          var album = [];
          const image = {
            src: logoSource,
            caption: null,
            thumb: null
          };
          album.push(image);
          this.lightBox.open(album, 0);
        } else {
          alert("Logo Image Not Found!");
        }
        break;
      }
      default:
        break;
    }
  }

  CallBackAdd($event) {
    if ($event != null) {
      this.getInvoiceHeaderList();
    }
    this.showAddPage = false;
    this.selectedInvoiceHeader = null;
    this.index = null;
  }

}

import { Component, EventEmitter, Input, Output, Renderer2 } from "@angular/core";
import * as moment from "moment";
import { SecurityService } from '../../security/shared/security.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_MessageBox_Status } from "../../shared/shared-enums";
import { PhrmRackModel } from '../shared/rack/phrm-rack.model';
import { PhrmRackService } from "../shared/rack/phrm-rack.service";
import { Store } from "./phrm-rack.component";


@Component({
    selector: "phrm-rack-add",
    templateUrl: "./phrm-rack-add.html",
})
export class PhrmRackAddComponent {

    @Input("selected-rack")
    public CurrentRack: PhrmRackModel = new PhrmRackModel();
    public showAddPage: boolean = false;
    public globalListenFunc: Function;
    public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.
    @Input("store-list")
    public StoreList: Array<Store> = new Array<Store>();
    @Input("parent-rack-list")
    public ParentRackList: Array<PhrmRackModel> = new Array<PhrmRackModel>();
    @Input("selectedStore")
    public selectedStore: Store = new Store();
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    SelectedParentRack: PhrmRackModel = new PhrmRackModel();
    loading: boolean = false;
    public ParentRackListFiltered: Array<PhrmRackModel> = new Array<PhrmRackModel>();
    @Input('showAddPage')
    public set ShowAdd(_showAdd) {
        this.showAddPage = _showAdd;
        if (this.showAddPage) {
            this.AssignRackDetail();
        }
    }

    constructor(public phrmRackService: PhrmRackService, public securityService: SecurityService,
        public msgBoxServ: MessageboxService, public renderer2: Renderer2) {
    }

    private AssignRackDetail(): void {
        this.FilterStoreList();
        if (this.CurrentRack && this.CurrentRack.RackId) {
            let rack = new PhrmRackModel();
            this.CurrentRack = Object.assign(rack, this.CurrentRack);
            this.selectedStore = this.StoreList.find(s => s.StoreId === this.CurrentRack.StoreId);
            if (this.ParentRackList.length) {
                this.ParentRackListFiltered = this.ParentRackList.filter(pr => pr.StoreId === this.CurrentRack.StoreId || pr.StoreId === null);
                this.SelectedParentRack = this.ParentRackList.find(r => r.RackId === this.CurrentRack.ParentId);
            }
        }
        else {
            this.selectedStore = null;
            this.SelectedParentRack = null;
            this.CurrentRack = new PhrmRackModel();
            this.ParentRackListFiltered = this.ParentRackList;
            this.setFocusById('store');
        }
    }
    FilterStoreList(): void {
        this.StoreList = this.StoreList.filter(store => store.StoreId !== null);
    }

    ngOnInit() {
        this.globalListenFunc = this.renderer2.listen('document', 'keydown', e => {
            if (e.keyCode === this.ESCAPE_KEYCODE) {
                this.Close()
            }
        });
    }

    AddRack(): void {
        for (let i in this.CurrentRack.RackValidator.controls) {
            this.CurrentRack.RackValidator.controls[i].markAsDirty();
            this.CurrentRack.RackValidator.controls[i].updateValueAndValidity();
        }

        if (this.CurrentRack.IsValidCheck(undefined, undefined)) {
            this.loading = true;
            this.CurrentRack.CreatedOn = moment().format('YYYY-MM-DD');
            this.phrmRackService
                .AddRack(this.CurrentRack)
                .finally(() => this.loading = false)
                .subscribe(
                    res => {
                        this.showMessageBox(ENUM_MessageBox_Status.Success, "Rack Added");
                        this.CurrentRack = new PhrmRackModel();
                        this.callbackAdd.emit({ 'newRack': res });
                        this.Close();
                    },
                    err => {
                        this.logError(err);
                    });
        }
    }

    UpdateRack(): void {
        for (let i in this.CurrentRack.RackValidator.controls) {
            this.CurrentRack.RackValidator.controls[i].markAsDirty();
            this.CurrentRack.RackValidator.controls[i].updateValueAndValidity();
        }

        if (this.CurrentRack.IsValidCheck(undefined, undefined)) {
            this.loading = true;
            this.CurrentRack.CreatedOn = moment().format('YYYY-MM-DD');
            this.phrmRackService
                .UpdateRack(this.CurrentRack.RackId, this.CurrentRack)
                .finally(() => this.loading = false)
                .subscribe(
                    res => {
                        this.showMessageBox(ENUM_MessageBox_Status.Success, "Rack Updated");
                        this.showAddPage = false;
                        this.callbackAdd.emit({ 'newRack': res });
                        this.Close();
                    },
                    err => {
                        this.logError(err);
                    });
        }
    }

    Close(): void {
        this.showAddPage = false;
    }

    showMessageBox(status: string, message: string): void {
        this.msgBoxServ.showMessage(status, [message]);
    }

    logError(err: any): void {
        console.log(err);
    }

    OnStoreChange(): void {
        if (this.selectedStore.StoreId) {
            this.CurrentRack.StoreId = this.selectedStore.StoreId;
            if (this.ParentRackList.length > 0) {
                this.ParentRackListFiltered = this.ParentRackList.filter(pr => pr.StoreId === this.CurrentRack.StoreId || pr.StoreId === null);
            }
        }
    }
    AssignParentRack(): void {
        if (this.SelectedParentRack.RackId) {
            this.CurrentRack.ParentId = this.SelectedParentRack.RackId;
            if (!this.CurrentRack.StoreId) {
                this.CurrentRack.StoreId = this.ParentRackList.find(PR => PR.RackId === this.CurrentRack.ParentId).StoreId;
            }
        }
        else {
            this.CurrentRack.ParentId = null
        }
    }
    setFocusById(IdToBeFocused): void {
        window.setTimeout(function () {
            document.getElementById(IdToBeFocused).focus();
        }, 20);
    }
}
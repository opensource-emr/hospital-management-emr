import { Component, Input, Output, ChangeDetectorRef, EventEmitter } from "@angular/core";
import { OPD_OrthoModel } from "./opd-ortho.model";

@Component({
    selector: "opd-ortho-note",
    templateUrl: "./opd-ortho-note.html"
})

export class OPDOrthoNoteComponent {
    public numOfRow: Array<any> = ['1', '1'];
    nameId: number;
    public show: boolean = false;
    public class: string = 'fa-plus qtn-plus';
    public allRows: Array<any> = ['1'];
    public investigations = ["X-Ray", "CT Scan", "MRI", "Blood Investigation", "Urine Investigation", "Biopsy", "Others"];
    public allImage: Array<any> = [{ url: "/app/media/images/anatomy3.jpg", name: "Anatomy3" },
    { url: "/app/media/images/anis2.jpg", name: "anish" },
    { url: "/app/media/images/anatomy1.jpg", name: "Anatomy" },
    { url: "/app/media/images/ent-1.jpg", name: "Ent" },
    { url: "/app/media/images/yellow.jpg", name: "Yellow" },
    { url: "/app/media/images/black.jpg", name: "Black" }
    ];
    public imageUrl: string = "/app/media/images/anatomy3.jpg";
    public values = [{
        "id": 1,
        "name": "Upper Extremity",
        "allOptions": ["Clavicle", "Scapula", "Shoulder", "Arm", "Elbow", "ForeArm", "Wrist", "Hand"]
    },
    {
        "id": 2,
        "name": "Lower Extremity",
        "allOptions": ["Hip", "Thigh", "Knee", "Leg", "Ankle", "Foot"]
    },
    {
        "id": 3,
        "name": "Spine",
        "allOptions": ["Cervical", "Tohracic", "Lumbar", "Sacro-Iliac Joint", "Sacrum", "Coccyx"]
    }];



    public allData = [
        {
            "id": 1,
            "allCheckBox": [],
            "selected": [],
            "values": [{
                "id": 1,
                "name": "Upper Extremity",
                "allOptions": ["Clavicle", "Scapula", "Shoulder", "Arm", "Elbow", "ForeArm", "Wrist", "Hand"]
            },
            {
                "id": 2,
                "name": "Lower Extremity",
                "allOptions": ["Hip", "Thigh", "Knee", "Leg", "Ankle", "Foot"]
            },
            {
                "id": 3,
                "name": "Spine",
                "allOptions": ["Cervical", "Tohracic", "Lumbar", "Sacro-Iliac Joint", "Sacrum", "Coccyx"]
            }]
        }
    ];



    selectName(str, index) {
        this.allData[index].selected = [];
    }

    OnSitesItemChanged(ev, idx) {
        this.allData[idx].allCheckBox;
        let itemIndex = this.allData[idx].allCheckBox.indexOf(ev);
        if ((itemIndex > -1)) {
            let updateItemIndex = this.allData[idx].selected.indexOf(ev);
            if ((updateItemIndex > -1)) {
                this.allData[idx].selected.splice(updateItemIndex, 1);
            }
            else {
                this.allData[idx].selected.push(ev);
            }
        }
        //alert(this.allData[idx].selected);
    }

    AddNewRow_Sites() {
        if (this.allData.length > 0 && this.allData.length < 3) {
            let i = this.allData.length - 1;
            var data = this.allData[i];
            let id = data.id + 1;
            this.allData.push({ "id": id, "allCheckBox": [], "selected": [], "values": this.values });
            this.allData = this.allData.slice();
        }
    }

    RemoveRow_Sites(i) {
        if (this.allData.length > 1 && this.allData.length < 4) {
            // let length = this.allData.length - 1;
            this.allData.splice(i, 1);
            this.allData = this.allData.slice();
        }
    }

    showHide() {
        this.show = !this.show;
        if (this.show) {
            this.class = 'fa-minus qtn-minus';
        }
        else {
            this.class = 'fa-plus qtn-plus';
        }
    }

    AddNew_Investigation() {
        if (this.allRows.length < 7) {
            this.allRows.push('1');
        }
        this.allRows = this.allRows.slice();
    }

    Remove_Investigation(i) {
        if (this.allRows.length > 1 && this.allRows.length < 8) {
            // let length = this.allData.length - 1;
            this.allRows.splice(i, 1);
            this.allRows = this.allRows.slice();
        }
    }

    CanvasImageChanged(ev) {
        this.imageUrl = ev;
    }



    //start: modified by sud: 7Aug'18+
    public model: OPD_OrthoModel = new OPD_OrthoModel();
    constructor(public ref: ChangeDetectorRef) {
        this.model.History_Past = "Some History";
        this.model.History_Family = "Some Family History";
        this.model.History_Duration = "10";
        this.model.History_Onset = "";
        this.model.History_Treatment = "Some Treatment History";
    }


    //public sites = ["sites_upper", "sites_lower", "sites_spine"];

    public sites_mappings =
        [{
            Name: "sites_upper",
            IsVisible: false,
            SelectedValues: "",
            AllValues:
                [{ Text: "Clavicle", IsSelected: false },
                { Text: "Scapula", IsSelected: false },
                { Text: "Shoulder", IsSelected: false },
                { Text: "Arm", IsSelected: false },
                { Text: "Elbow", IsSelected: false },
                { Text: "ForeArm", IsSelected: false },
                { Text: "Wrist", IsSelected: false },
                { Text: "Hand", IsSelected: false }]
        },
        {
            Name: "sites_lower",
            IsVisible: false,
            SelectedValues: "",
            AllValues:
                [{ Text: "Hip", IsSelected: false },
                { Text: "Thigh", IsSelected: false },
                { Text: "Knee", IsSelected: false },
                { Text: "Leg", IsSelected: false },
                { Text: "Ankle", IsSelected: false },
                { Text: "Foot", IsSelected: false },
                { Text: "Wrist", IsSelected: false }]
        },
        {
            Name: "sites_spine",
            IsVisible: false,
            SelectedValues: "",
            AllValues: [{ Text: "Cervical", IsSelected: false },
            { Text: "Tohracic", IsSelected: false },
            { Text: "Lumbar", IsSelected: false },
            { Text: "Sacro-Iliac Joint", IsSelected: false },
            { Text: "Sacrum", IsSelected: false },
            { Text: "Coccyx", IsSelected: false }]
        }];

    public sitesVisible = [];

    //end: modified by sud: 7Aug'18+
}


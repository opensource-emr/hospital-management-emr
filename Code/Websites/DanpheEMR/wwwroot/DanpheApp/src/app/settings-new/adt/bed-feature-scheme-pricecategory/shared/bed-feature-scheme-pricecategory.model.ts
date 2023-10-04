import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export class BedFeatureSchemePriceCategoryModel {
    BedFeatureSchemePriceCategoryMapId: number = 0;
    BedFeatureId: number = 0;
    BedFeatureName: string = '';
    SchemeId: number = 0;
    SchemeName: string = '';
    PriceCategoryId: number = 0;
    PriceCategoryName: string = '';
    IsActive: boolean = false;
    BedFeatureSchemePriceCategoryValidator: FormGroup = null;
    constructor() {
        var _formBuilder = new FormBuilder();
        this.BedFeatureSchemePriceCategoryValidator = _formBuilder.group({
            'BedFeatureId': ['', Validators.compose([Validators.required])],
            'SchemeId': ['', Validators.compose([Validators.required])],
            'PriceCategoryId': ['', Validators.compose([Validators.required])],
        });

    }
}
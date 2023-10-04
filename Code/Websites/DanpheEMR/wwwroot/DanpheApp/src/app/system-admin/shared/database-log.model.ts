import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'
import * as moment from 'moment/moment';

export class DatabaseLogModel {
        public  DBLogId :number=0;
        public FileName: string = null;
        public FolderPath: string = null;
        public DatabaseName: string = null;
        public DatabaseVersion: string = null;
        public IsDBRestorable: boolean = false;
        public Action: string = null;
        public ActionType: string = null;
        public Status: string = null;
        public MessageDetail: string = null;
        public Remarks: string = null;
        public CreatedBy: number = null;
        public CreatedOn: string = null;
        public IsActive: boolean = null;

        public DBLogValidator: FormGroup = null;

        public IsDirty(fieldname): boolean {
            if (fieldname == undefined) {
                return this.DBLogValidator.dirty;
            }
            else {
                return this.DBLogValidator.controls[fieldname].dirty;
            }

        }

        public IsValid():boolean{if(this.DBLogValidator.valid){return true;}else{return false;}} 
        public IsValidCheck(fieldname, validator): boolean {            
            if (this.DBLogValidator.valid) {
                return true;
            }
          
            if (fieldname == undefined) {
                return this.DBLogValidator.valid;
            }
            else {

                return !(this.DBLogValidator.hasError(validator, fieldname));
            }
        }

        constructor() {
            var _formBuilder = new FormBuilder();
            this.DBLogValidator = _formBuilder.group({
                'Remarks': ['', Validators.compose([Validators.required, Validators.maxLength(300)])],              
            });
        }
           
}

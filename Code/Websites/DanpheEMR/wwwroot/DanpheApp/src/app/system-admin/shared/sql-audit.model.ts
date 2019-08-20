
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';
export class SqlAuditModel {
    public DateTime: Date = null;
    public Server_Instance_Name: string = "";
    public Database_Name: string = "";
    public Statement: string = "";
    public Server_Principal_Name: string = "";
    public Action_Id: string = "";
    public Object_Name: string = "";
    public Session_Id: string = "";
    public Schema_Name: string = "";
}

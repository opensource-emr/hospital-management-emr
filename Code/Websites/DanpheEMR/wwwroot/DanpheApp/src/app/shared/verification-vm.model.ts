import { Employee } from "../employee/shared/employee.model";

export class VerificationVM {
  public VerificationId: number = 0;
  public PermissionId: number = 0;
  public PermissionName: string;
  public VerifiedBy: Employee;
  public VerifiedOn: Date;
  public CurrentVerificationLevel: number;
  public VerificationStatus: string = "";
  public VerificationRemarks: string = "";
}

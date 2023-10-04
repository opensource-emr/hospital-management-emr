export class CreditOrganization_DTO {
  public OrganizationId: number = 0;
  public OrganizationName: string = '';
  public IsActive: string = '';
  public CreatedOn: string = '';
  public CreatedBy: number = null;
  public ModifiedOn: string = '';
  public ModifiedBy: number = null;
  public IsDefault: boolean = false;
  public IsClaimManagementApplicable: boolean = false;
  public IsClaimCodeCompulsory: boolean = false;
  public IsClaimCodeAutoGenerate: boolean = false;
  public DisplayName: string = '';
  public SchemeApiIntegrationName: string = '';
}

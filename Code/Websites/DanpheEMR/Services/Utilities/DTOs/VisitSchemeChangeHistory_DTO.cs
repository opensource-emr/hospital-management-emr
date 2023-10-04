namespace DanpheEMR.Services.Utilities.DTOs
{
    public class VisitSchemeChangeHistory_DTO
    {
        public string ChangeAction { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public int OldSchemeId { get; set; }
        public int OldPriceCategoryId { get; set; }
        public int NewSchemeId { get; set; }
        public int NewPriceCategoryId { get; set; }
        public string Remarks { get; set; }
        public string PatientCode { get; set; }
        public string PolicyNo { get; set; }

        public long LatestClaimCode { get; set; }
        public string PriceCategoryName { get; set; }

        public string VisitType { get; set; }

        public string VisitCode { get; set; }
        public string SchemeName { get; set; }
    }
}


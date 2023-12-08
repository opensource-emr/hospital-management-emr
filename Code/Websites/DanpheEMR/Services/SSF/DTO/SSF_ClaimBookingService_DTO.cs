using DanpheEMR.Enums;
using DanpheEMR.ServerModel.PatientModels;

namespace DanpheEMR.Services.SSF.DTO
{
    public class SSF_ClaimBookingService_DTO
    {
        public float bookedAmount { get; set; }
        public string Patient { get; set; }
        public string scheme { get; set; }
        public int? subProduct { get; set; }
        public string client_claim_id { get; set; }
        public string client_invoice_no { get; set; }

        public static SSF_ClaimBookingService_DTO GetMappedToBookClaim(SSF_ClaimBookingBillDetail_DTO billObj, PatientSchemeMapModel patientSchemeMap)
        {
            int? subProduct = null;
            if (patientSchemeMap.RegistrationCase.ToLower() == "medical")
            {
                subProduct = 1;
            }
            SSF_ClaimBookingService_DTO claimBookingObject = new SSF_ClaimBookingService_DTO()
            {
                bookedAmount = (float)billObj.TotalAmount, //(int)billObj.TotalAmount,
                Patient = patientSchemeMap.PolicyHolderUID,
                scheme = patientSchemeMap.RegistrationCase.ToLower() == "accident" ? ENUM_SSF_SchemeTypes.Accident : ENUM_SSF_SchemeTypes.Medical,
                subProduct = subProduct,
                client_claim_id = billObj.ClaimCode.ToString(),
                client_invoice_no = billObj.InvoiceNoFormatted
            };

            return claimBookingObject;
        }
    }

    public class SSF_ClaimBookingBillDetail_DTO
    {
        public string InvoiceNoFormatted { get; set; }
        public decimal TotalAmount { get; set; }
        public long ClaimCode { get; set; }
    }
}

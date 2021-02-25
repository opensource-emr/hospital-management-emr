using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;


namespace DanpheEMR.Enums
{

    //Don't get confused with naming convention, we're using static class + constants instead of enums because enum gave issues while using in LINQ.
    //Also We're using strings in our database, where enum gives number values, so..
    //sud:9Aug'19

    public static class ENUM_BillingStatus
    {
        public static readonly string paid = "paid";
        public static readonly string unpaid = "unpaid";
        public static readonly string provisional = "provisional";
        public static readonly string cancel = "cancel";
        public static readonly string returned = "returned";
        public static readonly string free = "free";
        public static readonly string adtCancel = "adtCancel";//this needs review on what it's impacts are.
    }

    public static class ENUM_BillingType
    {
        public static readonly string inpatient = "inpatient";
        public static readonly string outpatient = "outpatient";
    }


    public static class ENUM_BillPaymentMode
    {
        public static readonly string cash = "cash";
        public static readonly string credit = "credit";
    }

    public static class ENUM_BillDepositType
    {
        public static readonly string Deposit = "Deposit";
        public static readonly string ReturnDeposit = "ReturnDeposit";
        public static readonly string DepositDeduct = "depositdeduct";
        public static readonly string DepositCancel = "depositcancel";
    }


    public static class ENUM_VisitType
    {
        public static readonly string inpatient = "inpatient";
        public static readonly string outpatient = "outpatient";
        public static readonly string emergency = "emergency";
    }

    public static class ENUM_AppointmentType
    {
        public static readonly string New = "New"; //In client side, this property name is : new  (with small 'n')
        public static readonly string followup = "outpatient";
        public static readonly string transfer = "Transfer";
        public static readonly string referral = "Referral";
    }

    public static class ENUM_VisitStatus
    {
        public static readonly string initiated = "initiated";
        public static readonly string cancel = "cancel";
    }

    public static class ENUM_PriceCategory
    {
        public static readonly string Normal = "Normal";
        public static readonly string EHS = "EHS";
        public static readonly string Foreigner = "Foreigner";
        public static readonly string SAARCCitizen = "SAARCCitizen";
    }

    public static class ENUM_LabOrderStatus
    {
        public static readonly string Active = "active";
        public static readonly string Pending = "pending";
        public static readonly string ResultAdded = "result-added";
        public static readonly string ReportGenerated = "report-generated";
    }

    public static class ENUM_LabTemplateType
    {
        public static readonly string normal = "normal";
        public static readonly string html = "html";
        public static readonly string culture = "culture";
    }
    public static class ENUM_LabRunNumType
    {
        public static readonly string histo = "histo";
        public static readonly string cyto = "cyto";
        public static readonly string normal = "normal";
    }

    public static class ENUM_LabUrgency
    {
        public static readonly string Urgent = "urgent";
        public static readonly string Normal = "normal";
        public static readonly string STAT = "STAT";
    }

    public static class ENUM_NoteType
    {
        public static readonly string HAndP = "H&P";
        public static readonly string ProgressNote = "ProgressNote";
        public static readonly string ConsultNote = "ConsultNote";
        public static readonly string DischargeNote = "DischargeNote";
        public static readonly string EmergencyNote = "EmergencyNote";
        public static readonly string Procedure = "Procedure";
    }
    public static class ENUM_StockLocation
    {
        public static readonly int Dispensary = 1;
        public static readonly int Store = 2;
    }
    //TODO: This is incomplete. Need to identify all transactions and complete this enum.
    public static class ENUM_INV_StockTransactionType
    {
        public static readonly string GoodReceiptItem = "goodsreceipt-items";
        public static readonly string CancelledGR = "goodsreceipt-items";
        public static readonly string StockManaged = "goodsreceipt-items";
        public static readonly string DispatchedItem = "goodsreceipt-items";
    }

    public static class ENUM_BillingOrderStatus
    {
        public static readonly string Active = "active";
        public static readonly string Pending = "pending";
        public static readonly string Final = "final";
    }
}
//public enum ENUM_LabOrderStatus_Test
//{
//    [Description("active")]
//    Active = 1,
//    [Description("pending")]
//    Pending = 2,
//    [Description("result-added")]
//    ResultAdded = 3,
//    [Description("report-generated")]
//    ReportGenerated = 4
//}
//public static class DanpheEnumExtensions
//{
//    //Below function will return Description string from Enum value or any other value.
//    //Currently Tested and Used only for ENUMS, we can extend this for other classes as well.
//    public static string GetEnumDescription<T>(this T val)
//    {
//        DescriptionAttribute[] attributes = (DescriptionAttribute[])val
//           .GetType()
//           .GetField(val.ToString())
//           .GetCustomAttributes(typeof(DescriptionAttribute), false);
//        return attributes.Length > 0 ? attributes[0].Description : string.Empty;
//    }
//}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace DanpheEMR.ServerModel
{
    public class PHRMStoreModel
    {
        [Key]
        public int StoreId { get; set; }
        public string Category { get; set; }
        public string SubCategory { get; set; }
        public int ParentStoreId { get; set; }
        public string Name { get; set; }
        public string StoreDescription { get; set; }
        public int PermissionId { get; set; }
        public int MaxVerificationLevel { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public Boolean IsActive { get; set; }
        public string StoreLabel { get; set; }
        public string PanNo { get; set; }
        public string Code { get; set; }
        public string Address { get; set; }
        public string ContactNo { get; set; }
        public string Email { get; set; }
        public bool UseSeparateInvoiceHeader { get; set; }
        [NotMapped]
        public List<StoreVerificationMapModel> StoreVerificationMapList { get; set; }
        [NotMapped]
        public bool IsDispensary { get => Category == "dispensary"; }

        #region Payment Modes
        public string AvailablePaymentModesJSON { get; private set; }
        public string DefaultPaymentMode { get; private set; }

        [NotMapped]
        public virtual ICollection<PaymentModesSettings> AvailablePaymentModes
        {
            get
            {
                if (string.IsNullOrWhiteSpace(AvailablePaymentModesJSON))
                {
                    if (IsDispensary)
                        return new List<PaymentModesSettings>() { new PaymentModesSettings("cash") };
                    else
                        return new List<PaymentModesSettings>();
                }
                return JsonConvert.DeserializeObject<List<PaymentModesSettings>>(AvailablePaymentModesJSON);
            }
        }

        public void AddPaymentMode(string PaymentModeName, bool IsRemarksMandatory = false)
        {
            if (!IsDispensary) throw new InvalidOperationException("Payment Mode feature is only available for Disensary.");
            if (string.IsNullOrWhiteSpace(PaymentModeName)) throw new ArgumentException($"'{nameof(PaymentModeName)}' cannot be null or whitespace.", nameof(PaymentModeName));

            AvailablePaymentModes.Add(new PaymentModesSettings(PaymentModeName, IsRemarksMandatory));
            AvailablePaymentModesJSON = JsonConvert.SerializeObject(AvailablePaymentModes);
        }
        public void RemovePaymentMode(string PaymentModeName)
        {
            if (!IsDispensary) throw new InvalidOperationException("Payment Mode feature is only available for Disensary.");
            if (string.IsNullOrWhiteSpace(PaymentModeName)) throw new ArgumentException($"'{nameof(PaymentModeName)}' cannot be null or whitespace.", nameof(PaymentModeName));

            var paymentModeToRemove = AvailablePaymentModes.FirstOrDefault(a => a.PaymentModeName == PaymentModeName);
            if (paymentModeToRemove == null) throw new ArgumentNullException($"'{nameof(PaymentModeName)}' was not found in Available Payment Modes.", nameof(PaymentModeName));
            AvailablePaymentModes.Remove(paymentModeToRemove);
            AvailablePaymentModesJSON = JsonConvert.SerializeObject(AvailablePaymentModes);
        }
        public void SetDefaultPaymentMode(string PaymentMode)
        {
            if (!IsDispensary) throw new InvalidOperationException("Payment Mode feature is only available for Disensary.");
            if (string.IsNullOrWhiteSpace(PaymentMode)) throw new ArgumentException($"'{nameof(PaymentMode)}' cannot be null or whitespace.", nameof(PaymentMode));
            if (!AvailablePaymentModes.Any(a => a.PaymentModeName == PaymentMode)) throw new ArgumentException($"'{nameof(PaymentMode)}' cannot be default if it is not in Available Payment Modes.", nameof(PaymentMode));

            DefaultPaymentMode = PaymentMode;
        }
        #endregion Payment Modes

        #region Inventory Receipt Numbers Settings
        public int? INV_GRGroupId { get; set; }
        public int? INV_POGroupId { get; set; }
        public int? INV_PRGroupId { get; set; }
        public int? INV_ReqDisGroupId { get; set; }
        public int? INV_RFQGroupId { get; set; }
        public string INV_ReceiptDisplayName { get; set; }
        public string INV_ReceiptNoCode { get; set; }
        #endregion
    }

    public class PaymentModesSettings
    {
        public string PaymentModeName { get; set; }
        public bool IsRemarksMandatory { get; set; }

        public PaymentModesSettings(string paymentModeName, bool isRemarksMandatory = false)
        {
            PaymentModeName = paymentModeName ?? throw new ArgumentNullException(nameof(paymentModeName));
            IsRemarksMandatory = isRemarksMandatory;
        }
    }
}
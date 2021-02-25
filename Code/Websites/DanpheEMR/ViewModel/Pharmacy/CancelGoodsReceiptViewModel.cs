using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using System;

namespace DanpheEMR.ViewModel.Pharmacy
{
    public class CancelGoodsReceiptViewModel
    {
        public int GoodsReceiptId { get; set; }
    }

    public static class CancelGoodsReceiptFunction
    {
        public static int CancelGoodsReceipt(this PharmacyDbContext db, int GoodsReceiptId, string CancelRemarks, RbacUser currentUser)
        {
            try
            {
                var goodsReceiptToBeCancelled = db.PHRMGoodsReceipt.Find(GoodsReceiptId);
                goodsReceiptToBeCancelled.IsCancel = true;
                goodsReceiptToBeCancelled.CancelledBy = currentUser.EmployeeId;
                goodsReceiptToBeCancelled.CancelledOn = DateTime.Now;
                goodsReceiptToBeCancelled.CancelRemarks = CancelRemarks;
                db.SaveChanges();
                return goodsReceiptToBeCancelled.GoodReceiptId;
            }
            catch (Exception ex)
            {

                throw ex;
            }
            
        }
    }
}

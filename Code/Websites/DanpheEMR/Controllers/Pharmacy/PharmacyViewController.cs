using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{
    public class PharmacyViewController : Controller
    {
        //[DanpheViewFilter("pharmacymain-view")]
        public IActionResult PharmacyMain()
        {
            try
            {
                return View("~/Views/PharmacyView/PharmacyMain.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PharmacyCounter()
        {
            try
            {
                return View("~/Views/PharmacyView/Counter/CounterActivate.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [DanpheViewFilter("pharmacy-billingmain-view")]
        public IActionResult BillingMain()
        {
            try
            {
                return View("~/Views/PharmacyView/Billing/BillingMain.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        /////[DanpheViewFilter("pharmacy-ordermain-view")]
        public IActionResult OrderMain()
        {
            try
            {
                return View("~/Views/PharmacyView/Order/OrderMain.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #region Pharmacy/Patient Action Methods for call view
        [DanpheViewFilter("pharmacy-patientmain-view")]
        public IActionResult PatientMain()
        {
            try
            {
                return View("~/Views/PharmacyView/Patient/PatientMain.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //[DanpheViewFilter("pharmacy-patientlist-view")]
        public IActionResult PHRMPatientList()
        {
            try
            {
                return View("~/Views/PharmacyView/Patient/PHRMPatientList.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //[DanpheViewFilter("pharmacy-patient-view")]
        public IActionResult PHRMPatient()
        {
            try
            {
                return View("~/Views/PharmacyView/Patient/PHRMPatient.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Pharmacy/Prescription Action Methods for call view
        [DanpheViewFilter("pharmacy-prescriptiongmain-view")]
        public IActionResult PrescriptionMain()
        {
            try
            {
                return View("~/Views/PharmacyView/Prescription/PrescriptionMain.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        //[DanpheViewFilter("pharmacy-prescription-view")]
        public IActionResult PHRMPrescription()
        {
            try
            {
                return View("~/Views/PharmacyView/Prescription/PHRMPrescription.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //[DanpheViewFilter("pharmacy-prescription-list-view")]
        public IActionResult PHRMPrescriptionList()
        {
            try
            {
                return View("~/Views/PharmacyView/Prescription/PHRMPrescriptionList.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Pharmacy/Sale Action Methods for call view
        [DanpheViewFilter("pharmacy-salemain-view")]
        public IActionResult SaleMain()
        {
            try
            {
                return View("~/Views/PharmacyView/Sale/SaleMain.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //[DanpheViewFilter("pharmacy-sale-view")]
        public IActionResult PHRMSale()
        {
            try
            {
                return View("~/Views/PharmacyView/Sale/PHRMSale.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //[DanpheViewFilter("pharmacy-sale-list-view")]
        public IActionResult PHRMSaleList()
        {
            try
            {
                return View("~/Views/PharmacyView/Sale/PHRMSaleList.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PHRMSaleReturnList()
        {
            try
            {
                return View("~/Views/PharmacyView/Sale/PHRMSaleReturnList.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //[DanpheViewFilter("pharmacy-sale-return-view")]
        public IActionResult PHRMSaleReturn()
        {
            try
            {
                return View("~/Views/PharmacyView/Sale/PHRMSaleReturn.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        [DanpheViewFilter("pharmacy-stockmain-view")]
        public IActionResult StockMain()
        {
            try
            {
                return View("~/Views/PharmacyView/Stock/StockMain.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #region Pharmacy/Setting all Action Method for calling view

        //[DanpheViewFilter("pharmacy-settingmain-view")]
        public IActionResult SettingMain()
        {
            try
            {
                return View("~/Views/PharmacyView/Setting/SettingMain.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //[DanpheViewFilter("pharmacy-suppliermanage-view")]
        public IActionResult PHRMSupplierManage()
        {
            try
            {
                return View("~/Views/PharmacyView/Setting/PHRMSupplierManage.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PHRMCompanyManage()
        {
            try
            {
                return View("~/Views/PharmacyView/Setting/PHRMCompanyManage.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PHRMCategoryManage()
        {
            try
            {
                return View("~/Views/PharmacyView/Setting/PHRMCategoryManage.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PHRMUnitOfMeasurementManage()
        {
            try
            {
                return View("~/Views/PharmacyView/Setting/PHRMUnitOfMeasurementManage.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PHRMItemTypeManage()
        {
            try
            {
                return View("~/Views/PharmacyView/Setting/PHRMItemTypeManage.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PHRMItemManage()
        {
            try
            {
                return View("~/Views/PharmacyView/Setting/PHRMItemManage.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PHRMTAXManage()
        {
            try
            {
                return View("~/Views/PharmacyView/Setting/PHRMTAXManage.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PHRMGenericManage()
        {
            try
            {
                return View("~/Views/PharmacyView/Setting/PHRMGenericManage.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        public IActionResult PHRMABCVEDReport()
        {
            try
            {
                return View("~/Views/PharmacyView/Report/PHRMABCVEDReport.cshtml");
            }
            catch(Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PHRMPurchaseOrderItems()
        {
            try
            {
                return View("~/Views/PharmacyView/Order/PHRMPurchaseOrderItems.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult UserwiseCollectionReport()
        {

            return View("~/Views/PharmacyView/Report/PHRMUserwiseCollectionReport.cshtml");
        }

        public IActionResult PHRMPurchaseOrderList()
        {
            try
            {
                return View("~/Views/PharmacyView/Order/PHRMPurchaseOrderList.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }               
        public IActionResult CounterwiseCollectionReport()
        {
            try
            {
                return View("~/Views/PharmacyView/Report/PHRMCounterwiseCollectionReport.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult SaleReturnReport()
        {
            try
            {
                return View("~/Views/PharmacyView/Report/PHRMSaleReturnReport.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult BreakageItemReport()
        {
            try
            {
                return View("~/Views/PharmacyView/Report/PHRMBreakageItemReport.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult StockManageDetailReport()
        {
            try
            {
                return View("~/Views/PharmacyView/Report/PHRMStockManageDetailReport.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult GoodsReceiptProductReport()
        {
            try
            {
                return View("~/Views/PharmacyView/Report/PHRMGoodsReceiptProductReport.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult PHRMGoodsReceiptList()
        {
            try
            {
                return View("~/Views/PharmacyView/Order/PHRMGoodsReceiptList.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult PHRMGoodsReceiptItems()
        {
            try
            {
                return View("~/Views/PharmacyView/Order/PHRMGoodsReceiptItems.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult PHRMReturnItemsToSupplier()
        {
            try
            {
                return View("~/Views/PharmacyView/Stock/PHRMReturnItemsToSupplier.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult PHRMStockDetails()
        {
            try
            {
                return View("~/Views/PharmacyView/Stock/PHRMStockDetails.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult PHRMReturnItemsToSupplierList()
        {
            try
            {
                return View("~/Views/PharmacyView/Stock/PHRMReturnItemsToSupplierList.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult PHRMWriteOffItem()
        {
            try
            {
                return View("~/Views/PharmacyView/Stock/PHRMWriteOffItem.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult PHRMWriteOffList()
        {
            try
            {
                return View("~/Views/PharmacyView/Stock/PHRMWriteOffList.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        
        public IActionResult PHRMStockManage()
        {
            try
            {
                return View("~/Views/PharmacyView/Stock/PHRMStockManage.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PHRMStockBatchItemList()
        {
            try
            {
                return View("~/Views/PharmacyView/Stock/PHRMStockBatchItemList.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PHRMSaleCredit()
        {
            try
            {
                return View("~/Views/PharmacyView/Sale/PHRMSaleCredit.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

       public IActionResult PHRMReceiptPrint()
        {
            try
            {
               return View("~/Views/PharmacyView/Sale/PHRMReceiptPrint.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PHRMStockTxnItemsManage()
        {
            try
            {
                return View("~/Views/PharmacyView/Setting/PHRMStockTxnItemsManage.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult Rack()
        {
            try
            {
                return View("~/Views/PharmacyView/Rack/phrm-rack.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult ProvisionalItems()
        {
            try
            {
                return View("~/Views/PharmacyView/Provisional/ProvisionalItems.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult Dispatch()
        {
            try
            {
                return View("~/Views/PharmacyView/Sale/PHRMDispatch.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult WardRequisition()
        {
            try
            {
                return View("~/Views/PharmacyView/WardRequisition/WardRequisition.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}

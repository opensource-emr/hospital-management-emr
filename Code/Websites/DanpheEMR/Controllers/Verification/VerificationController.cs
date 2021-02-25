
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.Services;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DanpheEMR.Controllers
{
    [Route("api/[controller]")]
    public class VerificationController : CommonController
    {
        public IVerificationService _verificationService;
        public IInventoryGoodReceiptService _goodReceiptService;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

        public VerificationController(IOptions<MyConfiguration> _config, IVerificationService verificationService, IInventoryGoodReceiptService goodReceiptService) : base(_config)
        {
            _verificationService = verificationService;
            _goodReceiptService = goodReceiptService;
        }
        [HttpGet]
        public string Get(string reqType)
        {
            var responseData = new DanpheHTTPResponse<object>();
            var inventoryDbContext = new InventoryDbContext(connString);
            var rbacDbContext = new RbacDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                #region This part is in comment because I have separated this function into a separate call.
                //if (reqType == "GetRequisitionListBasedOnUser")
                //{
                //    List<RequisitionModel> RequisitionList = VerificationBL.GetRequisitionListBasedOnUser(inventoryDbContext, rbacDbContext, currentUser);
                //    responseData.Results = RequisitionList;
                //    responseData.Status = "OK";
                //}
                #endregion
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }
        #region Inventory Requisition List APIs
        [HttpGet]
        [Route("~/api/Verification/GetInventoryRequisitionListBasedOnUser/{FromDate}/{ToDate}")]
        public IActionResult GetInventoryRequisitionListBasedOnUser([FromRoute] DateTime FromDate, [FromRoute] DateTime ToDate)
        {
            try
            {
                var inventoryDbContext = new InventoryDbContext(connString);
                var rbacDbContext = new RbacDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                List<RequisitionModel> RequisitionList = VerificationBL.GetInventoryRequisitionListBasedOnUser(FromDate, ToDate, inventoryDbContext, rbacDbContext, currentUser);

                responseData.Results = RequisitionList;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }
            return Ok(responseData);
        }

        [HttpGet]
        [Route("~/api/Verification/GetInventoryRequisitionDetails/{RequisitionId}")]
        public IActionResult GetInventoryRequisitionDetails([FromRoute] int RequisitionId)
        {
            try
            {
                var inventoryDbContext = new InventoryDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                InventoryRequisitionViewModel RequisitionList = VerificationBL.GetInventoryRequisitionDetails(RequisitionId, inventoryDbContext);

                responseData.Results = RequisitionList;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }
            return Ok(responseData);
        }

        [HttpPost]
        [Route("~/api/Verification/ApproveRequisition/")]
        [Route("~/api/Verification/ApproveRequisition/{VerificationRemarks}")]
        public IActionResult ApproveRequisition(string VerificationRemarks = "")
        {
            var responseData = new DanpheHTTPResponse<object>();
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            var data = this.ReadPostData();
            RequisitionModel requisition = DanpheJSONConvert.DeserializeObject<RequisitionModel>(data);
            var dbContext = new InventoryDbContext(connString);

            try
            {
                var Status = "approved"; //verificationStatus is different than Requisition Status.
                var CurrentVerificationLevel = requisition.CurrentVerificationLevel;
                var CurrentVerificationLevelCount = requisition.CurrentVerificationLevelCount;
                var MaxVerificationLevel = requisition.MaxVerificationLevel;
                int? ParentVerificationId = requisition.VerificationId;
                var VerificationId = this._verificationService.CreateVerification(currentUser.EmployeeId, CurrentVerificationLevel, CurrentVerificationLevelCount, MaxVerificationLevel, Status, VerificationRemarks, ParentVerificationId);
                VerificationBL.UpdateRequisitionAfterApproved(dbContext, requisition, VerificationId, currentUser);

                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }

            return Ok(responseData);
        }
        [HttpPost]
        [Route("~/api/Verification/RejectRequisition/{RequisitionId}/{CurrentVerificationlevel}/{CurrentVerificationlevelCount}/{MaxVerificationLevel}")]
        public IActionResult RejectRequisition([FromRoute] int RequisitionId, int CurrentVerificationlevel, int CurrentVerificationLevelCount, int MaxVerificationLevel)
        {
            try
            {
                var inventoryDbContext = new InventoryDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                var VerificationRemarks = this.ReadPostData();
                var CancelRemarks = "Rejected by " + currentUser.UserName;
                var VerificationStatus = "rejected";
                int? ParentVerificationId = null;
                if (CurrentVerificationlevel > 0)
                {
                    ParentVerificationId = inventoryDbContext.Requisitions.Where(req => req.RequisitionId == RequisitionId)
                        .Select(req => req.VerificationId).FirstOrDefault();
                }
                var VerificationId = _verificationService.CreateVerification(currentUser.EmployeeId, CurrentVerificationlevel, CurrentVerificationLevelCount, MaxVerificationLevel, VerificationStatus, VerificationRemarks, ParentVerificationId);
                bool flag = InventoryBL.CancelSubstoreRequisition(inventoryDbContext, RequisitionId, CancelRemarks, currentUser, VerificationId);


                responseData.Results = RequisitionId;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }
            return Ok(responseData);
        }
        #endregion
        #region Inventory Purchase Request APIs
        [HttpGet]
        [Route("~/api/Verification/GetInventoryPurchaseRequestsBasedOnUser/{FromDate}/{ToDate}")]
        public IActionResult GetInventoryPurchaseRequestsBasedOnUser([FromRoute] DateTime FromDate, [FromRoute] DateTime ToDate)
        {
            try
            {
                var inventoryDbContext = new InventoryDbContext(connString);
                var rbacDbContext = new RbacDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                List<PurchaseRequestModel> PurchaseRequestsList = VerificationBL.GetInventoryPurchaseRequestsBasedOnUser(FromDate, ToDate, inventoryDbContext, rbacDbContext, currentUser);

                responseData.Results = PurchaseRequestsList;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }
            return Ok(responseData);
        }
        [HttpGet]
        [Route("~/api/Verification/GetInventoryPurchaseRequestDetails/{PurchaseRequestId}")]
        public IActionResult GetInventoryPurchaseRequestDetails([FromRoute] int PurchaseRequestId)
        {
            try
            {
                var inventoryDbContext = new InventoryDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                InventoryPurchaseRequestViewModel PurchaseRequestDetails = VerificationBL.GetInventoryPurchaseRequestDetails(PurchaseRequestId, inventoryDbContext);

                responseData.Results = PurchaseRequestDetails;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }
            return Ok(responseData);
        }

        [HttpPost]
        [Route("~/api/Verification/ApprovePurchaseRequest/")]
        [Route("~/api/Verification/ApprovePurchaseRequest/{VerificationRemarks}")]
        public IActionResult ApprovePurchaseRequest(string VerificationRemarks = "")
        {
            var responseData = new DanpheHTTPResponse<object>();
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            var data = this.ReadPostData();
            PurchaseRequestModel PurchaseRequest = DanpheJSONConvert.DeserializeObject<PurchaseRequestModel>(data);
            var dbContext = new InventoryDbContext(connString);

            try
            {
                var Status = "approved"; //verificationStatus is different than Requisition Status.
                var CurrentVerificationLevel = PurchaseRequest.CurrentVerificationLevel;
                var CurrentVerificationLevelCount = PurchaseRequest.CurrentVerificationLevelCount;
                var MaxVerificationLevel = PurchaseRequest.MaxVerificationLevel;
                int? ParentVerificationId = PurchaseRequest.VerificationId;
                var VerificationId = this._verificationService.CreateVerification(currentUser.EmployeeId, CurrentVerificationLevel, CurrentVerificationLevelCount, MaxVerificationLevel, Status, VerificationRemarks, ParentVerificationId);
                if (CurrentVerificationLevelCount == MaxVerificationLevel)
                {
                    PurchaseRequest.RequestStatus = "pending";
                }
                InventoryBL.UpdatePurchaseRequestWithItems(dbContext, PurchaseRequest, VerificationId, currentUser);

                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }

            return Ok(responseData);
        }

        [HttpPost]
        [Route("~/api/Verification/RejectPurchaseRequest/{PurchaseRequestId}/{CurrentVerificationlevel}/{CurrentVerificationlevelCount}/{MaxVerificationLevel}")]
        public IActionResult RejectPurchaseRequest([FromRoute] int PurchaseRequestId, int CurrentVerificationlevel, int CurrentVerificationLevelCount, int MaxVerificationLevel)
        {
            try
            {
                var inventoryDbContext = new InventoryDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                var VerificationRemarks = this.ReadPostData();
                var CancelRemarks = "Rejected by " + currentUser.UserName;
                var VerificationStatus = "rejected";
                int? ParentVerificationId = null;
                if (CurrentVerificationlevel > 0)
                {
                    ParentVerificationId = inventoryDbContext.PurchaseRequest.Where(req => req.PurchaseRequestId == PurchaseRequestId)
                        .Select(req => req.VerificationId).FirstOrDefault();
                }
                var VerificationId = _verificationService.CreateVerification(currentUser.EmployeeId, CurrentVerificationlevel, CurrentVerificationLevelCount, MaxVerificationLevel, VerificationStatus, VerificationRemarks, ParentVerificationId);
                bool flag = InventoryBL.CancelPurchaseRequestById(inventoryDbContext, PurchaseRequestId, CancelRemarks, currentUser, VerificationId);


                responseData.Results = PurchaseRequestId;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }
            return Ok(responseData);
        }
        #endregion

        #region Inventory Purchase Order APIs
        [HttpGet]
        [Route("~/api/Verification/GetInventoryPurchaseOrdersBasedOnUser/{FromDate}/{ToDate}")]
        public IActionResult GetInventoryPurchaseOrdersBasedOnUser([FromRoute] DateTime FromDate, [FromRoute] DateTime ToDate)
        {
            try
            {
                var db = new InventoryDbContext(connString);
                var rbacDb = new RbacDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                List<PurchaseOrderModel> PurchaseOrdersList = VerificationBL.GetInventoryPurchaseOrdersBasedOnUser(FromDate, ToDate, db, rbacDb, currentUser);

                responseData.Results = PurchaseOrdersList;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }
            return Ok(responseData);
        }
        [HttpGet]
        [Route("~/api/Verification/GetInventoryPurchaseOrderDetails/{PurchaseOrderId}")]
        public IActionResult GetInventoryPurchaseOrderDetails([FromRoute] int PurchaseOrderId)
        {
            try
            {
                var inventoryDbContext = new InventoryDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                InventoryPurchaseOrderViewModel PurchaseOrderDetail = VerificationBL.GetInventoryPurchaseOrderDetails(PurchaseOrderId, inventoryDbContext);

                responseData.Results = PurchaseOrderDetail;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }
            return Ok(responseData);
        }
        [HttpPost]
        [Route("~/api/Verification/ApprovePurchaseOrder/")]
        [Route("~/api/Verification/ApprovePurchaseOrder/{VerificationRemarks}")]
        public IActionResult ApprovePurchaseOrder(string VerificationRemarks = "")
        {
            var responseData = new DanpheHTTPResponse<object>();
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            var data = this.ReadPostData();
            PurchaseOrderModel PurchaseOrder = DanpheJSONConvert.DeserializeObject<PurchaseOrderModel>(data);
            var dbContext = new InventoryDbContext(connString);

            try
            {
                var Status = "approved"; //verificationStatus is different than Requisition Status.
                var CurrentVerificationLevel = PurchaseOrder.CurrentVerificationLevel;
                var CurrentVerificationLevelCount = PurchaseOrder.CurrentVerificationLevelCount;
                var MaxVerificationLevel = PurchaseOrder.MaxVerificationLevel;
                int? ParentVerificationId = PurchaseOrder.VerificationId;
                var VerificationId = this._verificationService.CreateVerification(currentUser.EmployeeId, CurrentVerificationLevel, CurrentVerificationLevelCount, MaxVerificationLevel, Status, VerificationRemarks, ParentVerificationId);
                if (CurrentVerificationLevelCount == MaxVerificationLevel)
                {
                    PurchaseOrder.POStatus = "active";
                }
                InventoryBL.UpdatePurchaseOrderWithItems(dbContext, PurchaseOrder, VerificationId, currentUser);

                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }

            return Ok(responseData);
        }

        [HttpPost]
        [Route("~/api/Verification/RejectPurchaseOrder/{PurchaseOrderId}/{CurrentVerificationlevel}/{CurrentVerificationlevelCount}/{MaxVerificationLevel}")]
        public IActionResult RejectPurchaseOrder([FromRoute] int PurchaseOrderId, int CurrentVerificationlevel, int CurrentVerificationLevelCount, int MaxVerificationLevel)
        {
            try
            {
                InventoryDbContext db = new InventoryDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                string VerificationRemarks = this.ReadPostData();
                string CancelRemarks = "Rejected by " + currentUser.UserName;
                string VerificationStatus = "rejected";
                string POStatus = "cancelled";
                int? ParentVerificationId = null;
                if (CurrentVerificationlevel > 0)
                {
                    ParentVerificationId = db.PurchaseOrders.Where(req => req.PurchaseOrderId == PurchaseOrderId)
                        .Select(req => req.VerificationId).FirstOrDefault();
                }
                var VerificationId = _verificationService.CreateVerification(currentUser.EmployeeId, CurrentVerificationlevel, CurrentVerificationLevelCount, MaxVerificationLevel, VerificationStatus, VerificationRemarks, ParentVerificationId);
                bool flag = InventoryBL.CancelPurchaseOrderById(db, PurchaseOrderId, CancelRemarks, currentUser, POStatus, VerificationId);


                responseData.Results = PurchaseOrderId;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }
            return Ok(responseData);
        }
        #endregion
        #region Inventory Goods Receipt APIs
        [HttpGet]
        [Route("~/api/Verification/GetInventoryGRBasedOnUser/{FromDate}/{ToDate}")]
        public IActionResult GetInventoryGRBasedOnUser([FromRoute] DateTime FromDate, [FromRoute] DateTime ToDate)
        {
            try
            {
                var db = new InventoryDbContext(connString);
                var rbacDb = new RbacDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                List<GoodsReceiptModel> GoodsReceiptList = VerificationBL.GetInventoryGRBasedOnUser(FromDate, ToDate, db, rbacDb, currentUser);

                responseData.Results = GoodsReceiptList;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }
            return Ok(responseData);
        }
        [HttpGet]
        [Route("~/api/Verification/GetInventoryGRDetails/{GoodsReceiptId}")]
        public IActionResult GetInventoryGRDetails([FromRoute] int GoodsReceiptId)
        {
            try
            {
                var inventoryDbContext = new InventoryDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                InventoryGoodsReceiptViewModel GoodsReceiptDetail = VerificationBL.GetInventoryGRDetails(GoodsReceiptId, inventoryDbContext);

                responseData.Results = GoodsReceiptDetail;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }
            return Ok(responseData);
        }
        [HttpPost]
        [Route("~/api/Verification/ApproveGoodsReceipt/")]
        [Route("~/api/Verification/ApproveGoodsReceipt/{VerificationRemarks}")]
        public IActionResult ApproveGoodsReceipt(string VerificationRemarks = "")
        {
            var responseData = new DanpheHTTPResponse<object>();
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            var data = this.ReadPostData();
            GoodsReceiptModel GoodsReceipt = DanpheJSONConvert.DeserializeObject<GoodsReceiptModel>(data);
            var dbContext = new InventoryDbContext(connString);

            try
            {
                var Status = "approved"; //verificationStatus is different than Requisition Status.
                var CurrentVerificationLevel = GoodsReceipt.CurrentVerificationLevel;
                var CurrentVerificationLevelCount = GoodsReceipt.CurrentVerificationLevelCount;
                var MaxVerificationLevel = GoodsReceipt.MaxVerificationLevel;
                int? ParentVerificationId = GoodsReceipt.VerificationId;
                var VerificationId = this._verificationService.CreateVerification(currentUser.EmployeeId, CurrentVerificationLevel, CurrentVerificationLevelCount, MaxVerificationLevel, Status, VerificationRemarks, ParentVerificationId);
                if (CurrentVerificationLevelCount == MaxVerificationLevel)
                {
                    GoodsReceipt.GRStatus = "active";
                    //directly add stock to inventory --later can be changed to some receive or add to inventory mechanism
                    GoodsReceipt.GoodsReceiptItem.Where(gritem => gritem.IsActive == true).ToList().ForEach(grItem =>
                    {
                        _goodReceiptService.AddtoInventoryStock(grItem);
                    });
                }
                InventoryBL.UpdateGRAfterVerification(dbContext, GoodsReceipt, VerificationId, currentUser);

                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }

            return Ok(responseData);
        }

        [HttpPost]
        [Route("~/api/Verification/RejectGoodsReceipt/{GoodsReceiptId}/{CurrentVerificationlevel}/{CurrentVerificationlevelCount}/{MaxVerificationLevel}")]
        public IActionResult RejectGoodsReceipt([FromRoute] int GoodsReceiptId, int CurrentVerificationlevel, int CurrentVerificationLevelCount, int MaxVerificationLevel)
        {
            try
            {
                InventoryDbContext db = new InventoryDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                string VerificationRemarks = this.ReadPostData();
                string CancelRemarks = "Rejected by " + currentUser.UserName;
                string VerificationStatus = "rejected";
                string GRStatus = "cancelled";
                int? ParentVerificationId = null;
                if (CurrentVerificationlevel > 0)
                {
                    ParentVerificationId = db.GoodsReceipts.Where(req => req.PurchaseOrderId == GoodsReceiptId)
                        .Select(req => req.VerificationId).FirstOrDefault();
                }
                var VerificationId = _verificationService.CreateVerification(currentUser.EmployeeId, CurrentVerificationlevel, CurrentVerificationLevelCount, MaxVerificationLevel, VerificationStatus, VerificationRemarks, ParentVerificationId);
                bool flag = InventoryBL.CancelGoodsReceipt(db, GoodsReceiptId, CancelRemarks, currentUser, GRStatus, VerificationId);

                if (flag == false) { throw new Exception("Failed to reject the goods receipt."); }
                responseData.Results = GoodsReceiptId;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }
            return Ok(responseData);
            #endregion
        }
    }
}

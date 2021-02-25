
----------------Rusha: 22nd Sept 2020: Merged Phrm_Return to DEV branch--------------

--START: Sanjesh: 18 Aug'20 --added column OldItemPrice and ReturnStatus in PHRM_ReturnToSupplierItems  and  PHRM_ReturnToSupplier table
ALTER TABLE PHRM_ReturnToSupplierItems 
ADD OldItemPrice decimal(16,4) null
GO

ALTER TABLE PHRM_ReturnToSupplier 
ADD ReturnStatus int null
GO
--END: Sanjesh:  18 Aug'20 --added column OldItemPrice and ReturnStatus in PHRM_ReturnToSupplierItems  and  PHRM_ReturnToSupplier table

--START: Sanjesh: 19 Aug'20 --added GoodReceiptId in StoredProcedure [dbo].[SP_PHRMStoreStock] 
/****** Object:  StoredProcedure [dbo].[SP_PHRMStoreStock]    Script Date: 8/19/2020 12:42:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_PHRMStoreStock]
	@Status varchar(200) = NULL
AS
/*
FileName: [SP_PHRMStore]
CreatedBy/date: Shankar/04-03-2019
Description: To get the Details of store Items
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/04-08-2019						Add From and to Date for date filter
2.		Sanjit/04-09-2019						StoreName has been added.
3.      Shankar/04-15-2019                      IsActive added.
4.		Rusha/05-23-2019						Remove From and to Date for date filter and handled quantity not equals to zero
5.		Rusha/06-11-2019						Updated script
6.		Naveed/24-11-2019						Get GR CreatedOn date as Date in Store details List
7.		Ramavtar/04-Jan-2020					Filtered out Quantity > 0
8.		Sanjit/03-Jan-2020						Generic Name added.
9.      Sanjesh/19-Aug-2020                     GoodReceiptId added.
----------------------------------------------------------------------------
*/
BEGIN
	IF(@Status IS NOT NULL)
		BEGIN
				SELECT  x1.ItemName,x1.GenericName,x1.BatchNo, x1.ExpiryDate,Round(x1.MRP,2,0) AS MRP,x1.GoodReceiptId,
			    (SELECT CreatedOn FROM PHRM_GoodsReceiptItems where GoodReceiptItemId= x1.GoodsReceiptItemId )AS 'Date',
				SUM(FInQty + InQty - FOutQty - OutQty) AS 'AvailableQty',x1.StoreName,x1.ItemId,x1.StoreId,x1.GoodsReceiptItemId,x1.Price
				FROM(SELECT stk.ItemName,gen.GenericName, stk.BatchNo, stk.ExpiryDate, stk.MRP,stk.StoreName,
				stk.StoreId,stk.ItemId,stk.GoodsReceiptItemId,stk.Price,gritm.GoodReceiptId,
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.Quantity ELSE 0 END) AS 'InQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.Quantity ELSE 0 END) AS 'OutQty',
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
				FROM [dbo].[PHRM_StoreStock] AS stk
				join PHRM_GoodsReceiptItems as gritm on gritm.GoodReceiptItemId = stk.GoodsReceiptItemId
				join PHRM_MST_Item as itm on stk.ItemId = itm.ItemId
				join PHRM_MST_Generic gen on itm.GenericId = gen.GenericId
				GROUP BY stk.ItemName,gen.GenericName, stk.BatchNo , stk.ExpiryDate, stk.MRP,stk.StoreName,stk.StoreId,stk.ItemId,stk.GoodsReceiptItemId,stk.Price,gritm.GoodReceiptId)as x1
				WHERE (@Status=x1.ItemName or x1.ItemName like '%'+ISNULL(@Status,'')+'%')
				GROUP BY x1.ItemName,x1.GenericName, x1.BatchNo, x1.ExpiryDate, x1.MRP,x1.StoreName,x1.ItemId,x1.StoreId,x1.GoodsReceiptItemId,x1.Price,x1.GoodReceiptId
				HAVING SUM(FInQty + InQty - FOutQty - OutQty) > 0	-- filtering out quantity > 0
				ORDER BY x1.ItemName
		END		
END
GO
--END: Sanjesh: 19 Aug'20 --added GoodReceiptId in StoredProcedure [dbo].[SP_PHRMStoreStock] 


--START:VIKAS:24th Aug 2020:  added strip rate column into table.
	--------------------------
	IF NOT EXISTS(SELECT 1 FROM sys.columns 
	 WHERE Name = N'StripRate'
	 AND Object_ID = Object_ID(N'dbo.PHRM_GoodsReceiptItems'))
	 BEGIN
	ALTER TABLE PHRM_GoodsReceiptItems ADD StripRate decimal(18, 2) NULL;
	END
	GO
--END:VIKAS:24th Aug 2020:  added strip rate column into table.

--START: Sanjesh:28th Aug 2020 created PHRM_TXN_InvoiceReturn and added ItemID and InvoiceReturnId column in PHRM_TXN_InvoiceReturnItems table
ALTER table  PHRM_TXN_InvoiceReturnItems
ADD ItemId int null
GO

ALTER TABLE [PHRM_Mst_Item]
ADD CONSTRAINT PK_PHRM_Mst_Item PRIMARY KEY ([ItemId]);
GO

ALTER TABLE [dbo].[PHRM_TXN_InvoiceReturnItems]  
ADD  CONSTRAINT [FK_PHRM_TXN_InvoiceReturnItems_ItemId_PHRM_MST_Item_ItemId] FOREIGN KEY (ItemId) REFERENCES [dbo].[PHRM_MST_Item](ItemId);
GO


/****** Object:  Table [dbo].[PHRM_TXN_InvoiceReturn]    Script Date: 8/26/2020 5:15:07 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PHRM_TXN_InvoiceReturn](
	[InvoiceReturnId] [int] IDENTITY(1,1) NOT NULL,
	[InvoiceId] [int] NULL,
	[PatientId] [int] NULL,
	[CounterId] [int] NULL,
	[CreditNoteID] [int] NULL,
	[SubTotal] [decimal](16, 4) NULL,
	[DiscountAmount] [decimal](16, 4) NULL,
	[VATAmount] [decimal](16, 4) NULL,
	[TotalAmount] [decimal](16, 4) NULL,
	[PaidAmount] [decimal](16, 4) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[Tender] [decimal](16, 4) NULL,
	[Change] [decimal](16, 4) NULL,
	[PrintCount] [int] NULL,
	[Adjustment] [decimal](10, 2) NULL,
	[IsRealtime] [bit] NULL,
	[IsRemoteSynced] [bit] NULL,
	[FiscalYearId] [int] NULL,
	[IsTransferredToACC] [bit] NULL,
	[PaymentMode] [varchar](50) NULL)
	Go
ALTER TABLE [PHRM_TXN_InvoiceReturn]
ADD CONSTRAINT PKPHRM_TXN_InvoiceReturn PRIMARY KEY ([InvoiceReturnId]);
GO
ALTER TABLE [dbo].[PHRM_TXN_InvoiceReturn]   ADD  CONSTRAINT [FK_PHRM_TXN_InvoiceReturn_CreatedBy_EMP_Employee_EmployeeId] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[EMP_Employee] ([EmployeeId])
GO

ALTER TABLE [dbo].[PHRM_TXN_InvoiceReturn]   ADD  CONSTRAINT [FK_PHRM_TXN_InvoiceReturn_InvoiceId_PHRM_TXN_Invoice_InvoiceId] FOREIGN KEY([InvoiceId])
REFERENCES [dbo].[PHRM_TXN_Invoice] ([InvoiceId])
GO

ALTER TABLE PHRM_TXN_InvoiceReturnItems
      ADD [InvoiceReturnId] [int] NULL
Go
ALTER TABLE [dbo].[PHRM_TXN_InvoiceReturnItems]   ADD  CONSTRAINT [FK_PHRM_TXN_InvoiceReturnItems_InvoiceReturnId_PHRM_TXN_InvoiceReturn_InvoiceReturnId] FOREIGN KEY([InvoiceReturnId])
REFERENCES [dbo].[PHRM_TXN_InvoiceReturn] ([InvoiceReturnId])
Go
--END: Sanjesh:28th Aug 2020 created PHRM_TXN_InvoiceReturn and added ItemID and InvoiceReturnId column in PHRM_TXN_InvoiceReturnItems table

--START: ashish : 26 August  2020 Added column for add item discount in Phrm sale
ALTER TABLE PHRM_TXN_InvoiceItems
ADD TotalDisAmt decimal(16, 4) NULL
GO

ALTER TABLE PHRM_TXN_InvoiceItems
ADD PerItemDisAmt decimal(16, 4) NULL
GO
--END: ashish : 26 August  2020 Added column for add item discount in Phrm sale

--START: Sanjesh :  1st Sep. 2020 Added column Remarks in PHRM_TXN_InvoiceReturn table
ALTER TABLE PHRM_TXN_InvoiceReturn
ADD  Remarks varchar(200) null
GO
 --END: Sanjesh : 1st Sep. 2020 Added column Remarks in PHRM_TXN_InvoiceReturn table

 --START:VIKAS: 1st Sep 2020: update IsActive status for  pharmacy duplicateprints tab permission.
UPDATE RBAC_Routeconfig
SET IsActive=0
WHERE urlfullpath ='pharmacy/duplicateprints' and routerlink='DuplicatePrints'
GO

UPDATE RBAC_RouteConfig
SET ParentRouteId= (select RouteId from RBAC_RouteConfig where UrlFullPath='Pharmacy/Sale' and RouterLink='Sale' ),
UrlFullPath='Pharmacy/Sale/ProvisionalReturn'
WHERE UrlFullPath='Pharmacy/DuplicatePrints/ProvisionalReturn' and RouterLink='ProvisionalReturn'
GO

-------------------
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_TXNS_PHRM_SettlementSummary] 
AS
/*
FileName: [SP_TXNS_PHRM_SettlementSummary]
CreatedBy/date: sanjit:24Nov2019
Description: to get CreditTotal, DepositBalance of patients
Remarks:   We're selecting only those patients, who has balance amount in any of above types.
       : I've kept amount > 1 in filter list, otherwise it'll show a lot of un-necessary data.. 
Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
1.		Shankar/28thFeb2020				Added provisional amount as well
2.		VIKAS/1st Sep 2020				Added BilStatus, and SettlementId and get paid and unpaid credit bills data
-----------------------------------------------------------------------------------------			
*/
BEGIN
 
Select pat.PatientId, pat.PatientCode, 
       pat.FirstName+' '+ISNULL(pat.MiddleName+' ','')+ pat.LastName 'PatientName', 
	   pat.DateOfBirth,
	   pat.Gender,pat.PhoneNumber,	   
     ISNULL( credit.CreditTotal,0) 'CreditTotal',
	 CAST(ROUND(ISNULL(provisional.ProvisionalTotal,0),2) as numeric(16,2)) 'ProvisionalTotal',
	 CAST(
	      ROUND( 
	           (ISNULL(dep.TotalDeposit,0)- ISNULL(dep.DepositDeduction,0) - ISNULL(dep.DepositReturn,0))
	         ,2) as numeric(16,2)) 'DepositBalance',
			 credit.CreatedOn 'CreditDate' ,dep.CreatedOn 'DepositDate',
	credit.BilStatus, credit.SettlementId -- VIKAS:1st Sep 2020: added BilStatus , and  SettlementId
	
from PAT_Patient pat
LEFT JOIN
( 
  Select txn.PatientId, max(txn.CreateOn) CreatedOn, txn.BilStatus,txn.SettlementId,
  SUM(txn.PaidAmount) 'CreditTotal'  from PHRM_TXN_Invoice txn
  where --txn.BilStatus ='unpaid' 
   txn.PaymentMode = 'credit' 
  AND ISNULL(txn.IsReturn,0) != 1
  Group by txn.PatientId,txn.BilStatus, txn.SettlementId
) credit on pat.PatientId = credit.PatientId
LEFT JOIN
(--select * from PHRM_TXN_Invoice where BilStatus = 'provisional'
  Select invitms.PatientId, max(invitms.CreatedOn) CreatedOn,
  SUM(invitms.TotalAmount) 'ProvisionalTotal' from PHRM_TXN_InvoiceItems invitms
  where invitms.BilItemStatus='provisional' or invitms.BilItemStatus='wardconsumption' 
  Group by invitms.PatientId
) provisional on pat.PatientId = provisional.PatientId
LEFT JOIN
( 
  Select dep.PatientId,max(dep.CreatedOn) CreatedOn,
    SUM(Case WHEN dep.DepositType='deposit' THEN ISNULL(dep.DepositAmount,0) ELSE 0  END ) AS 'TotalDeposit',
    SUM(Case WHEN dep.DepositType='depositdeduct' THEN ISNULL(dep.DepositAmount,0) ELSE 0  END ) AS 'DepositDeduction',
	SUM(Case WHEN dep.DepositType='depositreturn' THEN ISNULL(dep.DepositAmount,0) ELSE 0  END ) AS 'DepositReturn'
   FROM PHRM_Deposit dep
   Group by dep.PatientId
) dep
ON dep.PatientId = pat.PatientId

---show only those patients which has either amount > 0
where ISNULL(credit.CreditTotal,0) > 1 
	  OR ( dep.TotalDeposit-dep.DepositDeduction - dep.DepositReturn) > 1
--to get the latest first
	  order by
  CASE
      WHEN ISNULL(dep.CreatedOn,0) >= ISNULL(credit.CreatedOn,0)
          THEN  dep.CreatedOn
      ELSE  credit.CreatedOn 
  END
 DESC
END
GO
--END:VIKAS: 1st Sep 2020: update IsActive status for  pharmacy duplicateprints tab permission.

---START: Shankar: Decimal problem in userwisecashcollection------
GO
/****** Object:  UserDefinedFunction [dbo].[FN_PHRM_PharmacyTxn_ByBillingType_UserCollection]    Script Date: 08/20/2020 1:50:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--select * from FN_PHRM_PharmacyTxn_ByBillingType_UserCollection('2020-03-16','2020-03-16')
-- =============================================
-- Author:		Salakha
-- Create date: 26/08/2019
-- Description:	calculates daily sales for pharmacy
-- =============================================

/* Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Dinesh/Abhishek 2nd Sept 2019          Credit logic, credit return logic optimized 
2		Vikas	10th Jan 2020				   Credit sales, and credit received query modified.
3       Shankar  23rd March 2020               depositdeduct included 
4		Shankar  20th Aug 2020				   Cash return query optimized
5       Shankar 27th Aug 2020                  Cash collection taken from Paid amount to remove decimal issue in report
--------------------------------------------------------

*/
ALTER FUNCTION [dbo].[FN_PHRM_PharmacyTxn_ByBillingType_UserCollection]
(@FromDate Date, @ToDate Date)
RETURNS TABLE

AS
RETURN
(

		SELECT * FROM 
		(
				--Cash Invoices (Same Day)--
				Select   Convert(Date,CreateOn) 'Date', 
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 Patientid,
						 InvoiceId,
						 'CashInvoice' AS 'TransactionType',
						 SubTotal,
						 DiscountAmount,
						 VATAmount,
						 TotalAmount, 
						 PaidAmount AS 'CashCollection', 
						 0 AS 'DepositReceived', 
						 0 AS 'DepositRefund', 
						 0 AS 'DepositDeduct',
						 0 AS 'CreditReceived',  
						 0 AS 'CreditAmount',
						 CounterId, 
						 CreatedBy 'EmployeeId',
						 Remark 'Remarks',  
						 1 as DisplaySeq
				from PHRM_TXN_Invoice
				Where PaymentMode ='cash' and Convert(Date,CreateOn) = Convert(Date,CreateOn)

				UNION ALL

				--Credit Sales (Same Day)--
				SELECT COnvert(Date,CreateOn) 'Date', 
					   'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
					   Patientid,
					   InvoiceId,
					   'CreditInvoice' AS 'TransactionType',
					   SubTotal,
					   DiscountAmount,
					   TotalAmount,
					   VATAmount, 
					   0 AS 'CashCollection', 
					   0 AS 'DepositReceived', 
					   0 AS 'DepositRefund', 
					   0 AS 'DepositDeduct',
					   0 AS 'CreditReceived',
					   TotalAmount  AS 'CreditAmount',
					   CounterId, 
					   CreatedBy 'EmployeeId',
					   Remark 'Remarks', 
					   2 as DisplaySeq 
				FROM PHRM_TXN_Invoice
				WHERE (PaymentMode = 'credit' and BilStatus='unpaid') 
				--and(Convert(Date,CreateOn) = Convert(Date,CreateOn))  --VIKAS:10th Jan 2020

				UNION ALL

				--Credit Received (from previous day)
				Select  Convert(Date,PaidDate) 'Date',  
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 Patientid,
						 InvoiceId,
						'CreditInvoiceReceived' AS 'TransactionType',
						 0 AS SubTotal, 
						 0 AS DiscountAmount, 
						 0 AS VATAmount,  
						 0 AS TotalAmount, 
					     PaidAmount AS 'CashCollection', 
						 0 AS 'DepositReceived', 
						 0 AS 'DepositRefund', 
						 0 AS 'DepositDeduct',
					   	 TotalAmount AS 'CreditReceived',  
						 0  AS 'CreditAmount',
					     CounterId AS 'CounterId', 
						 CreatedBy AS 'EmployeeId', 
						 Remark 'Remarks', 
						 3 as DisplaySeq 
				from PHRM_TXN_Invoice
				Where (PaymentMode='credit'and BilStatus='paid')  
				--and Convert(Date,PaidDate) != Convert(Date,CreditDate) --VIKAS:10th Jan 2020

				UNION ALL
				--Cash Return---
				select * from
				(
						select top 1 with ties  Convert(Date,ret.CreatedOn) 'Date',  
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						  inv.PatientId,
						  inv.InvoiceId,
						 'CashInvoiceReturn' AS 'TransactionType',
						 (-inv.SubTotal) 'SubTotal', 
						 inv.DiscountAmount as 'DiscountAmount', 
						 inv.VATAmount as 'VATAmount', 
						 (-inv.TotalAmount) 'TotalAmount', 
	  					 (-inv.PaidAmount) AS 'CashCollection', 
						 0 AS 'DepositReceived', 
						 0 AS 'DepositRefund', 
						 0 AS 'DepositDeduct',
						 0 AS 'CreditReceived', 
						 0 AS 'CreditAmount',
						 ret.CounterId, 
						 ret.CreatedBy 'EmployeeId', 
						 ret.Remark 'Remarks', 
						 4 as DisplaySeq 
						 from PHRM_TXN_Invoice as inv
						join PHRM_TXN_InvoiceReturnItems as ret on inv.InvoiceId= ret.InvoiceId  
						order by row_number() over (partition by inv.InvoiceId order by inv.InvoiceId desc))
						x
						--order by x.InvoiceId desc
				 --If billstatus is paid, regardless it was Credit + Settled, it should come in Cash Return--
				  
				UNION ALL
				--Credit Return---
				SELECT   Convert(Date,ret.CreatedOn) 'Date', 
					    'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 txn.PatientId,
						 ret.InvoiceId,
						 'CreditInvoiceReturn' AS 'TransactionType',
						 (-ret.SubTotal) 'SubTotal', 
						 (-txn.DiscountAmount) 'DiscountAmount', 
						 (-txn.VATAmount) 'VATAmount', 
						 (-ret.TotalAmount) 'TotalAmount', 
	  					 (0) AS 'CashCollection',  
						 0 AS 'DepositReceived', 
						 0 AS 'DepositRefund', 
						 0 AS 'DepositDeduct',
						 0 AS 'CreditReceived', 
						 (-ret.TotalAmount) 'CreditAmount',
						 ret.CounterId, 
						 ret.CreatedBy 'EmployeeId', 
						 ret.Remark 'Remarks', 
						 5 as DisplaySeq
				FROM PHRM_TXN_InvoiceReturnItems ret, PHRM_TXN_Invoice txn
				where ret.InvoiceId=txn.InvoiceId
				and txn.PaymentMode='credit' and settlementId is null
			) A
			WHERE A.Date BETWEEN @FromDate and @ToDate
) -- end of return
GO
---END: Shankar: Decimal problem in userwisecashcollection-------

--START: ashish : 2 sept  2020 Added column for add item discount amount in Phrm return to supplier
ALTER TABLE PHRM_ReturnToSupplierItems
ADD DiscountedAmount decimal(16, 4) NULL
GO
--END: ashish : 2 sept  2020 Added column for add item discount amount in Phrm return to supplier

--START: Sanjesh: 05th Sept,20 add column in invoice return items
 ALTER TABLE PHRM_TXN_InvoiceReturnItems
 ADD  ReturnedQty  int null
 GO
--END: Sanjesh: 05th Sept,20 add column in invoice return items

--START:Sanjesh:11th Sept,20 add GoodReceiptId  column in PHRM_ReturnToSupplier
ALTER TABLE PHRM_ReturnToSupplier
ADD GoodReceiptId int null
Go

ALTER TABLE [dbo].[PHRM_ReturnToSupplier]   ADD  CONSTRAINT [FK_PHRM_ReturnToSupplier_GoodReceiptId_PHRM_GoodsReceipt_GoodReceiptId] FOREIGN KEY([GoodReceiptId])
REFERENCES [dbo].[PHRM_GoodsReceipt] ([GoodReceiptId])
Go
--END:Sanjesh:11th Sept,20 add GoodReceiptId  column in PHRM_ReturnToSupplier

--START: Sanjesh : 14th  Sept  2020 Added column  DiscountedAmount in PHRM_TXN_InvoiceReturnItems
ALTER TABLE PHRM_TXN_InvoiceReturnItems
ADD DiscountAmount decimal(16, 4) NULL
GO
--END: Sanjesh : 14th  Sept  2020 Added column  DiscountedAmount in PHRM_TXN_InvoiceReturnItems

--START: ashish : 15th sept 2020 Added column for add item discount in Phrminvoicereturnitem
ALTER TABLE PHRM_TXN_InvoiceReturnItems
ADD TotalDisAmt decimal(16, 4) NULL
GO

ALTER TABLE PHRM_TXN_InvoiceReturnItems
ADD PerItemDisAmt decimal(16, 4) NULL
GO
--END: ashish : 15th sept 2020 Added column for add item discount in Phrminvoicereturnitem

--START: ashish : 21th sept 2020 Show direct to Dispensary Option Parameterize 
INSERT INTO CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType,ValueLookUpList)
VALUES ('Pharmacy','ShowDispensaryOption','true','boolean','set parameter for Show and hide Send Directly to Dispensary Option','custom','NULL');
GO
--END: ashish : 21th sept 2020 direct to Dispensary Option Parameterize 

----------------Rusha: 22nd Sept 2020: Merged Phrm_Return to DEV branch--------------


----------------Rusha: 29th Sept 2020: Merged Beta_V1.46X to DEV branch--------------

----Anish:Start 17 Sept,2020 showing the provisional items for cancellation for Outpatient----
/****** Object:  StoredProcedure [dbo].[SP_Inpatient_Provisional_Items_List]    Script Date: 9/17/2020 1:13:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Anish Bhattarai>
-- Create date: <18 August>
-- Description:	<Get all the Provisional Items List>
-- =============================================
ALTER PROCEDURE [dbo].[SP_Inpatient_Provisional_Items_List] (
	@FromDate DATETIME = NULL,
    @ToDate DATETIME = NULL	
) 
AS
BEGIN
	SELECT pat.ShortName,pat.Age,pat.Gender,pat.DateOfBirth,pat.PatientCode,srv.IntegrationName,item.* FROM BIL_TXN_BillingTransactionItems item
	JOIN PAT_Patient pat on pat.PatientId=item.PatientId
	LEFT JOIN BIL_MST_ServiceDepartment srv on srv.ServiceDepartmentId=item.ServiceDepartmentId
	WHERE (LOWER(VisitType)='inpatient' OR LOWER(VisitType)='outpatient') AND LOWER(BillStatus)='provisional'
	ORDER BY item.RequisitionDate desc
END
GO
----Anish:End 17 Sept,2020----

--START: NageshBB: 18 Sep 2020: Merged INV_Reports_Sep2020 branch to Beta_V1.46x branch------------------

----START: NageshBB: 09 Sep 2020-- Inventory Summary report txn get sp and insert core parameter for decide consumption or dispatch

--Insert script for insert parameter in core_parameter table Whether to use Consumption or Dispatch to calculate inventory summary and also for Accounting Integration
IF NOT EXISTS(Select  top 1 * from CORE_CFG_Parameters Where ParameterGroupName='Inventory' and ParameterName='ConsumptionOrDispatchForReports')
BEGIN
Insert into CORE_CFG_Parameters(ParameterGroupName, ParameterName, ParameterValue,ValueDataType
      ,Description
    ,ParameterType,ValueLookUpList)
VALUES('Inventory','ConsumptionOrDispatchForReports','consumption','value-lookup'
      ,'Whether to use Consumption or Dispatch to calculate inventory summary and also for Accounting Integration'
     ,'system','["consumption","dispatch"]')
   END
GO

--Store procedure creation for Inventory Summary report data get
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[SP_INV_RPT_GetInventorySummary]			
@FiscalYearId int, @FromDate datetime, @ToDate datetime
AS

/************************************************************************
FileName: [SP_INV_RPT_GetInventorySummary]
CreatedBy/date: NageshBB/09Sep2020
Description: Get Inventory summary report data
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1       NageshBB/09Sep2020						script created
												OpeningTxnQty and OpeningTxnValue
												Transaction Records= StockManageIN+ GRReceipt   -StockManageOut -dispatch (if dispatch )
												Transaction Records= StockManageIN+ GRReceipt   -StockManageOut-Consumption (if consumption)
												Closing bal= Opening + Purchase +stockmanagein -stockmanageout -dispatch (if dispatch )
												Closing bal= Opening + Purchase +stockmanagein -stockmanageout -consumption (if consumption)

*************************************************************************/
BEGIN
   Declare @FiscalYearStartDate datetime=(select top 1 StartDate from INV_CFG_FiscalYears where FiscalYearId=@FiscalYearId),
   @DispatchOrConsumption varchar(20)=(Select top 1 ParameterValue from CORE_CFG_Parameters Where ParameterGroupName='Inventory' and ParameterName='ConsumptionOrDispatchForReports')
if(@DispatchOrConsumption='dispatch')
Begin
select itm.Code as ItemCode,itm.ItemName,sub_Itm.SubCategoryName as SubCategory,unit_m.UOMName as Unit, TblTwo.*from (
select  ItemId 
,Sum(OpeningQty)+Sum(OpeningTxnQty) OpeningQty,sum(OpeningValue)+sum(OpeningTxnValue) OpeningValue
,sum(PurchaseQty) PurchaseQty,sum(PurchaseValue) PurchaseValue,sum(DispatchQty) DispatchQty, sum(DispatchValue) DispatchValue,
sum(ConsumptionQty) ConsumptionQty,sum(ConsumptionValue) ConsumptionValue
, sum(StockManageOutQty) StockManageOutQty,sum(StockManageOutValue) StockManageOutValue,sum (StockManageInQty) StockManageInQty, 
sum(StockManageInValue) StockManageInValue
,(Sum(OpeningQty)+Sum(OpeningTxnQty)+sum(PurchaseQty) +sum (StockManageInQty))- (sum(StockManageOutQty)- sum(DispatchQty))  ClosingQty	,
(Sum(OpeningValue)+sum(OpeningTxnValue)+sum(PurchaseValue) +sum (StockManageInValue))- (sum(StockManageOutValue)-sum(DispatchValue)) ClosingValue

from (

--OpeningQty and OpeningValue get from fiscal year stock table
select 
FYStock.ItemId ,sum(FYStock.OpeningQty) 'OpeningQty',sum(FYStock.OpeningQty*FYStock.Price)  'OpeningValue'
,0 PurchaseQty,0 PurchaseValue,0 DispatchQty,0 DispatchValue,0 ConsumptionQty,0 ConsumptionValue
, 0 StockManageOutQty,0 StockManageOutValue,0 StockManageInQty, 0 StockManageInValue,0 OpeningTxnQty,0 OpeningTxnValue
from INV_FiscalYearStock FYStock 
join INV_TXN_GoodsReceiptItems grItm on FYStock.GRItemId= grItm.GoodsReceiptItemId
join INV_TXN_GoodsReceipt gr on gr.GoodsReceiptID=grItm.GoodsReceiptId
where FYStock.FiscalYearId=@FiscalYearId 
and   gr.IsCancel=0 
group by FYStock.ItemId 


union

Select 
ItemId,0 OpeningQty,0 OpeningValue, 0 PurchaseQty, 0 PurchaseValue
,0 DispatchQty,0 DispatchValue,0 ConsumptionQty,0 ConsumptionValue, 0 StockManageOutQty,0 StockManageOutValue,0 StockManageInQty, 0 StockManageInValue,
(PurchaseQty+StockManageInQty)-(StockManageOutQty-DispatchQty) OpeningTxnQty,
(PurchaseValue+StockManageInValue)-(StockManageOutValue-DispatchValue) OpeningTxnValue
from 
(
select ItemId,Sum(0) OpeningQty,sum(0) OpeningValue,sum(PurchaseQty) PurchaseQty,Sum(PurchaseValue) PurchaseValue,
sum(DispatchQty) DispatchQty, sum(DispatchValue) DispatchValue,sum(0) ConsumptionQty,sum(0) ConsumptionValue,
sum(StockManageOutQty) StockManageOutQty,sum(StockManageOutValue) StockManageOutValue,sum(StockManageInQty) StockManageInQty,sum(StockManageInValue) StockManageInValue
from (
select ItemId,0 OpeningQty,0 OpeningValue, 
case when TransactionType in ('goodreceipt-items','opening-gr-items') Then Quantity else 0 end PurchaseQty,
case when TransactionType in ('goodreceipt-items','opening-gr-items') then (Quantity*Price) else 0 end PurchaseValue,
case when TransactionType='dispatched-items'  then Quantity else 0 end DispatchQty,
case when TransactionType='dispatched-items'  then (Quantity*price) else 0 end DispatchValue,
0 ConsumptionQty,0 ConsumptionValue,
case when (TransactionType in ('stockmanaged-items','fy-managed-items') and InOut='out')  then Quantity else 0 end StockManageOutQty,
case when (TransactionType in ('stockmanaged-items','fy-managed-items') and InOut='out')  then (Quantity*price) else 0 end StockManageOutValue,
case when (TransactionType='stockmanaged-items' and InOut='in') then Quantity else 0 end StockManageInQty,
case when (TransactionType='stockmanaged-items' and InOut='in') then (Quantity*Price) else 0 end StockManageInValue
from INV_TXN_StockTransaction
where  Convert(date,TransactionDate) >= Convert(date,@FiscalYearStartDate) and Convert(date,TransactionDate)< Convert(date,@FromDate)
) OpeTxnRecords
group by ItemId
) OpTxnOut


union

--PurchaseQty,PurchaseValue,
select ItemId,0 OpeningQty,0 OpeningValue, sum(Quantity) 'PurchaseQty', sum(Quantity* Price) PurchaseValue
,0 DispatchQty,0 DispatchValue,0 ConsumptionQty,0 ConsumptionValue, 0 StockManageOutQty,0 StockManageOutValue,0 StockManageInQty, 0 StockManageInValue,0 OpeningTxnQty,0 OpeningTxnValue
from INV_TXN_StockTransaction 
where TransactionType in ('goodreceipt-items','opening-gr-items')  and Convert(date,TransactionDate) between Convert(date,@FromDate) and Convert(date,@ToDate)
group by  ItemId

union

--DispatchQty, DispatchValue,
select ItemId
,0 OpeningQty,0 OpeningValue
,0 PurchaseQty,0 PurchaseValue,Sum(Quantity) 'DispatchQty', Sum(Quantity* Price) DispatchValue,0 ConsumptionQty,0 ConsumptionValue
, 0 StockManageOutQty,0 StockManageOutValue,0 StockManageInQty, 0 StockManageInValue,0 OpeningTxnQty,0 OpeningTxnValue
from INV_TXN_StockTransaction 
where TransactionType in ('dispatched-items')   and Convert(date,TransactionDate) between Convert(date,@FromDate) and Convert(date,@ToDate)
group by ItemId

union

--ConsumptionQty,ConsumptionValue
select ward_txn.ItemId
,0 OpeningQty,0 OpeningValue
,0 PurchaseQty,0 PurchaseValue,0 DispatchQty, 0 DispatchValue,Sum(Quantity) 'ConsumptionQty', Sum(Quantity* Price) ConsumptionValue
, 0 StockManageOutQty,0 StockManageOutValue,0 StockManageInQty, 0 StockManageInValue,0 OpeningTxnQty,0 OpeningTxnValue
from Ward_INV_Transaction ward_txn
join INV_TXN_GoodsReceiptItems grItm on ward_txn.GoodsReceiptItemId= grItm.GoodsReceiptItemId
join INV_TXN_GoodsReceipt gr on gr.GoodsReceiptID=grItm.GoodsReceiptId
where TransactionType ='consumption-items' and gr.IsCancel=0 and Convert(date,TransactionDate) between Convert(date,@FromDate) and Convert(date,@ToDate)
group by ward_txn.ItemId

union

--StockManageOutQty,StockManageOutValue,
select ItemId
,0 OpeningQty,0 OpeningValue
,0 PurchaseQty,0 PurchaseValue,0 DispatchQty, 0 DispatchValue,0 ConsumptionQty,0 ConsumptionValue
, Sum(Quantity) 'StockManageOutQty', Sum(Quantity* Price) StockManageOutValue,0 StockManageInQty, 0 StockManageInValue,0 OpeningTxnQty,0 OpeningTxnValue
from INV_TXN_StockTransaction 		
where TransactionType in ('stockmanaged-items','fy-managed-items')  and InOut='out'
and Convert(date,TransactionDate) between Convert(date,@FromDate) and Convert(date,@ToDate)
group by ItemId

union

--StockManageInQty,StockManageInValue
select Stock_txn.ItemId
,0 OpeningQty,0 OpeningValue
,0 PurchaseQty,0 PurchaseValue,0 DispatchQty, 0 DispatchValue,0 ConsumptionQty,0 ConsumptionValue
, 0 StockManageOutQty,0 StockManageOutValue
, Sum(Quantity) 'StockManageInQty', Sum(Quantity* Price) StockManageInValue,0 OpeningTxnQty,0 OpeningTxnValue
from INV_TXN_StockTransaction Stock_txn	
where TransactionType ='stockmanaged-items' and InOut='in'
and Convert(date,TransactionDate) between Convert(date,@FromDate) and Convert(date,@ToDate)
group by Stock_txn.ItemId

) TblOne
group by ItemId 
) TblTwo 

join INV_MST_Item itm on TblTwo.ItemId = itm.ItemId
join INV_MST_ItemSubCategory sub_Itm on sub_Itm.SubCategoryId =itm.SubCategoryId
left join INV_MST_UnitOfMeasurement unit_m on unit_m.UOMId=itm.UnitOfMeasurementId
order by TblTwo.ItemId
End

Else 

Begin
select itm.Code as ItemCode,itm.ItemName,sub_Itm.SubCategoryName as SubCategory,unit_m.UOMName as Unit, TblTwo.*from (
select  ItemId 
,Sum(OpeningQty)+Sum(OpeningTxnQty) OpeningQty,sum(OpeningValue)+sum(OpeningTxnValue) OpeningValue
,sum(PurchaseQty) PurchaseQty,sum(PurchaseValue) PurchaseValue,sum(DispatchQty) DispatchQty, sum(DispatchValue) DispatchValue,
sum(ConsumptionQty) ConsumptionQty,sum(ConsumptionValue) ConsumptionValue
, sum(StockManageOutQty) StockManageOutQty,sum(StockManageOutValue) StockManageOutValue,sum (StockManageInQty) StockManageInQty, 
sum(StockManageInValue) StockManageInValue
,(Sum(OpeningQty)+Sum(OpeningTxnQty)+sum(PurchaseQty) +sum (StockManageInQty))- (sum(StockManageOutQty)- sum(ConsumptionQty))  ClosingQty	,
(Sum(OpeningValue)+sum(OpeningTxnValue) +sum(PurchaseValue) +sum (StockManageInValue))- (sum(StockManageOutValue)-sum(ConsumptionValue)) ClosingValue

from (
--OpeningQty and OpeningValue get from fiscal year stock table
select 
FYStock.ItemId ,sum(FYStock.OpeningQty) 'OpeningQty',sum(FYStock.OpeningQty*FYStock.Price)  'OpeningValue'
,0 PurchaseQty,0 PurchaseValue,0 DispatchQty,0 DispatchValue,0 ConsumptionQty,0 ConsumptionValue
, 0 StockManageOutQty,0 StockManageOutValue,0 StockManageInQty, 0 StockManageInValue,0 OpeningTxnQty,0 OpeningTxnValue
from INV_FiscalYearStock FYStock 
join INV_TXN_GoodsReceiptItems grItm on FYStock.GRItemId= grItm.GoodsReceiptItemId
join INV_TXN_GoodsReceipt gr on gr.GoodsReceiptID=grItm.GoodsReceiptId
where FYStock.FiscalYearId=@FiscalYearId 
and   gr.IsCancel=0 
group by FYStock.ItemId 


union

Select 
ItemId,0 OpeningQty,0 OpeningValue, 0 PurchaseQty, 0 PurchaseValue
,0 DispatchQty,0 DispatchValue,0 ConsumptionQty,0 ConsumptionValue, 0 StockManageOutQty,0 StockManageOutValue,0 StockManageInQty, 0 StockManageInValue,
(PurchaseQty+StockManageInQty)-(StockManageOutQty-ConsumptionQty) OpeningTxnQty,
(PurchaseValue+StockManageInValue)-(StockManageOutValue-ConsumptionValue) OpeningTxnValue
from 
(
select ItemId,Sum(0) OpeningQty,sum(0) OpeningValue,sum(PurchaseQty) PurchaseQty,Sum(PurchaseValue) PurchaseValue,
sum(DispatchQty) DispatchQty, sum(DispatchValue) DispatchValue,sum(ConsumptionQty) ConsumptionQty,sum(ConsumptionValue) ConsumptionValue,
sum(StockManageOutQty) StockManageOutQty,sum(StockManageOutValue) StockManageOutValue,sum(StockManageInQty) StockManageInQty,sum(StockManageInValue) StockManageInValue
from (

select ItemId,0 OpeningQty,0 OpeningValue, 
case when TransactionType in ('goodreceipt-items','opening-gr-items') Then Quantity else 0 end PurchaseQty,
case when TransactionType in ('goodreceipt-items','opening-gr-items') then (Quantity*Price) else 0 end PurchaseValue,
0 DispatchQty,0 DispatchValue,
0 ConsumptionQty,0 ConsumptionValue,
0  StockManageOutQty,
0 StockManageOutValue,
case when (TransactionType='stockmanaged-items' and InOut='in') then Quantity else 0 end StockManageInQty,
case when (TransactionType='stockmanaged-items' and InOut='in') then (Quantity*Price) else 0 end StockManageInValue
from INV_TXN_StockTransaction
where  Convert(date,TransactionDate) >= Convert(date,@FiscalYearStartDate) and Convert(date,TransactionDate)< Convert(date,@FromDate)

union 

select ward_txn.ItemId,0 OpeningQty,0 OpeningValue, 
0 PurchaseQty,
0 PurchaseValue,
0 DispatchQty,0 DispatchValue,
case when TransactionType='consumption-items'  then Quantity else 0 end ConsumptionQty,
case when TransactionType='consumption-items'  then Quantity*Price else 0 end ConsumptionValue,
case when TransactionType ='fy-stock-manage' and InOut='out'  then Quantity else 0 end StockManageOutQty,
case when TransactionType ='fy-stock-manage' and InOut='out'  then Quantity*Price else 0 end StockManageOutValue,
0 StockManageInQty,0 StockManageInValue
from Ward_INV_Transaction ward_txn
join INV_TXN_GoodsReceiptItems grItm on ward_txn.GoodsReceiptItemId= grItm.GoodsReceiptItemId
join INV_TXN_GoodsReceipt gr on gr.GoodsReceiptID=grItm.GoodsReceiptId
where  gr.IsCancel=0 and Convert(date,TransactionDate) >= Convert(date,@FiscalYearStartDate) and Convert(date,TransactionDate)< Convert(date,@FromDate)

) OpeTxnRecords
group by ItemId
) OpTxnOut

union

--PurchaseQty,PurchaseValue,
select ItemId,0 OpeningQty,0 OpeningValue, sum(Quantity) 'PurchaseQty', sum(Quantity* Price) PurchaseValue
,0 DispatchQty,0 DispatchValue,0 ConsumptionQty,0 ConsumptionValue, 0 StockManageOutQty,0 StockManageOutValue,0 StockManageInQty, 0 StockManageInValue,0 OpeningTxnQty,0 OpeningTxnValue
from INV_TXN_StockTransaction 
where TransactionType in ('goodreceipt-items','opening-gr-items') and Convert(date,TransactionDate) between Convert(date,@FromDate) and Convert(date,@ToDate)
group by  ItemId

union

--DispatchQty, DispatchValue,
select ward_txn.ItemId
,0 OpeningQty,0 OpeningValue
,0 PurchaseQty,0 PurchaseValue,Sum(Quantity) 'DispatchQty', Sum(Quantity* Price) DispatchValue,0 ConsumptionQty,0 ConsumptionValue
, 0 StockManageOutQty,0 StockManageOutValue,0 StockManageInQty, 0 StockManageInValue,0 OpeningTxnQty,0 OpeningTxnValue
from Ward_INV_Transaction ward_txn
join INV_TXN_GoodsReceiptItems grItm on ward_txn.GoodsReceiptItemId= grItm.GoodsReceiptItemId
join INV_TXN_GoodsReceipt gr on gr.GoodsReceiptID=grItm.GoodsReceiptId
where TransactionType ='dispatched-items' and gr.IsCancel=0  and Convert(date,TransactionDate) between Convert(date,@FromDate) and Convert(date,@ToDate)
group by ward_txn.ItemId


union

--ConsumptionQty,ConsumptionValue
select ward_txn.ItemId
,0 OpeningQty,0 OpeningValue
,0 PurchaseQty,0 PurchaseValue,0 DispatchQty, 0 DispatchValue,Sum(Quantity) 'ConsumptionQty', Sum(Quantity* Price) ConsumptionValue
, 0 StockManageOutQty,0 StockManageOutValue,0 StockManageInQty, 0 StockManageInValue,0 OpeningTxnQty,0 OpeningTxnValue
from Ward_INV_Transaction ward_txn
join INV_TXN_GoodsReceiptItems grItm on ward_txn.GoodsReceiptItemId= grItm.GoodsReceiptItemId
join INV_TXN_GoodsReceipt gr on gr.GoodsReceiptID=grItm.GoodsReceiptId
where TransactionType ='consumption-items' and gr.IsCancel=0 and Convert(date,TransactionDate) between Convert(date,@FromDate) and Convert(date,@ToDate)
group by ward_txn.ItemId


union

--StockManageOutQty,StockManageOutValue,
select ward_txn.ItemId
,0 OpeningQty,0 OpeningValue
,0 PurchaseQty,0 PurchaseValue,0 DispatchQty, 0 DispatchValue,0 ConsumptionQty,0 ConsumptionValue
, Sum(Quantity) 'StockManageOutQty', Sum(Quantity* Price) StockManageOutValue,0 StockManageInQty, 0 StockManageInValue,0 OpeningTxnQty,0 OpeningTxnValue
from Ward_INV_Transaction ward_txn 	
join INV_TXN_GoodsReceiptItems grItm on ward_txn.GoodsReceiptItemId= grItm.GoodsReceiptItemId
join INV_TXN_GoodsReceipt gr on gr.GoodsReceiptID=grItm.GoodsReceiptId
where TransactionType ='fy-stock-manage' and InOut='out' and gr.IsCancel=0
and Convert(date,TransactionDate) between Convert(date,@FromDate) and Convert(date,@ToDate)
group by ward_txn.ItemId


union

--StockManageInQty,StockManageInValue
select Stock_txn.ItemId
,0 OpeningQty,0 OpeningValue
,0 PurchaseQty,0 PurchaseValue,0 DispatchQty, 0 DispatchValue,0 ConsumptionQty,0 ConsumptionValue
, 0 StockManageOutQty,0 StockManageOutValue
, Sum(Quantity) 'StockManageInQty', Sum(Quantity* Price) StockManageInValue,0 OpeningTxnQty,0 OpeningTxnValue
from INV_TXN_StockTransaction Stock_txn	
where TransactionType ='stockmanaged-items' and InOut='in'
and Convert(date,TransactionDate) between Convert(date,@FromDate) and Convert(date,@ToDate)
group by Stock_txn.ItemId
) TblOne
group by ItemId 
) TblTwo 

join INV_MST_Item itm on TblTwo.ItemId = itm.ItemId
join INV_MST_ItemSubCategory sub_Itm on sub_Itm.SubCategoryId =itm.SubCategoryId
left join INV_MST_UnitOfMeasurement unit_m on unit_m.UOMId=itm.UnitOfMeasurementId
order by TblTwo.ItemId
End

END
GO

----END: NageshBB: 09 Sep 2020-- Inventory Summary report txn get sp and insert core parameter for decide consumption or dispatch

-- START: VIKAS:10th Sep 2020: INV Purchase Items report routing permission and sp 
-- 1. Routing and permission script

	declare @ApplicationId INT
	SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Inventory' and ApplicationCode='INV');

	Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
	values ('inventory-reports-purchase-items-view',@ApplicationId,1,GETDATE(),1);
	GO

	declare @PermissionId INT
	SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='inventory-reports-purchase-items-view')

	declare @RefParentRouteId INT
	SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Inventory/Reports')

	Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, css, DefaultShow, IsActive)
	values ('Purchase Items', 'Inventory/Reports/PurchaseItems','PurchaseItems',@PermissionId,@RefParentRouteId,'fa fa-shopping-cart fa-stack-1x text-white',1,1);
	GO
	
-- 2. SP Script Created for Inventory Purchase Items report
	
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create PROCEDURE [dbo].[SP_Report_Inventory_PurchaseItemsReport]  
@FromDate Date = null,
@ToDate Date = null,
@FiscalYearId INT = null
as

/*
 FileName: [SP_Report_Inventory_PurchaseItemsReport] 
 Created: 9th Sep 2020/VIKAS
 Description: To Get the summary of inventory
 Remarks: 
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.		VIKAS:10th Sep2020		Sp for purchase items summary
 2.		NageshBB: 17 sep 2020	updated column list and remove unwanted code, excluing cancel gr
 -------------------------------------------------------------------------
*/
BEGIN	   
	select 
		CONVERT(date,gr.GoodsReceiptDate) as 'Dates',
		gr.GoodsReceiptNo,
		v.VendorName,
		v.ContactNo as 'VendorContact',
		sb.SubCategoryName, 
		itm.ItemName, 
		(gritm.ReceivedQuantity+gritm.FreeQuantity) as 'TotalQty',
		gritm.ItemRate, 
		gritm.SubTotal, 
		gritm.DiscountAmount,
		gritm.VATAmount,
		gritm.TotalAmount,
		gritm.BatchNO,
		gritm.MRP,
		gritm.ItemId,
		itm.ItemType
	FROM INV_TXN_GoodsReceipt gr 
		join INV_TXN_GoodsReceiptItems gritm   on gr.GoodsReceiptID= gritm.GoodsReceiptId
		join INV_MST_Item itm on gritm.ItemId = itm.ItemId
		join INV_MST_Vendor v on v.VendorId = gr.VendorId
		join INV_MST_ItemSubCategory sb on itm.SubCategoryId = sb.SubCategoryId
	WHERE (CONVERT(date,gr.GoodsReceiptDate) Between CONVERT(date,@FromDate) and CONVERT(date,@ToDate))
	and gr.IsCancel!=1
	
END
Go
-- END: VIKAS:10th Sep 2020: INV Purchase Items report routing permission and sp 

--START: NageshBB: 13 Sep 2020: alter table and store proceure altered for get cancelled po and GR get

IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CancelledBy'AND Object_ID = Object_ID(N'dbo.INV_TXN_GoodsReceipt'))
BEGIN
	ALTER TABLE INV_TXN_GoodsReceipt
	ADD CancelledBy int null;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CancelledOn'AND Object_ID = Object_ID(N'dbo.INV_TXN_GoodsReceipt'))
BEGIN
	ALTER TABLE INV_TXN_GoodsReceipt
	ADD CancelledOn datetime null;
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_Inventory_CancelGoodsReceiptReport]
@FromDate DateTime=null,
@ToDate DateTime=null
AS
/*
FileName: [SP_Report_Inventory_CancelGoodsReceiptReport] 
CreatedBy/date: Shankar/2019-09-26
Description: report for cancelled GR in inventory
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1.		NageshBB/13 Sep 2020			Column list updated for gr cancelled 
-------------------------------------------------------
*/
BEGIN
--GR No, VendorBillDate, VendorName, BillNo, TotalAmount, CancelledDate, CancelledBy, CancelRemarks
		If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL or LEN(@FromDate)>=0 OR LEN(@ToDate)>=0)
				BEGIN
					SELECT  
					gr.GoodsReceiptID,
					gr.GoodsReceiptNo,
					CONVERT(date,gr.GoodsReceiptDate) as GoodsReceiptDate,
					v.VendorName, 
					GR.BillNo,
					gr.TotalAmount,
					gr.CancelledOn,
					gr.CancelledBy,
					gr.CancelRemarks
					FROM    INV_TXN_GoodsReceipt gr				
					INNER JOIN INV_MST_Vendor v ON v.VendorId = gr.VendorId
				    WHERE CONVERT(date,gr.CancelledOn) BETWEEN convert(date,@FromDate) and convert(date,@ToDate)
			     	and gr.IsCancel = 1										
				END
	
END
Go


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_Inventory_CancelPurchaseOrderReport] 
@FromDate DateTime=null,
@ToDate DateTime=null

AS
/*
FileName: [SP_Report_Inventory_CancelPurchaseOrderReport] 
CreatedBy/date: Shankar/2019-09-26
Description: report for cancelled PO in inventory
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1.		NageshBB/13 Sep 2020			column list updated for cancel po
-------------------------------------------------------
*/
BEGIN
--PO Id, PO-Date, VendorName, TotalAmount, CancelledDate, CancelledBy, CancelRemarks
		If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL or LEN(@FromDate)>=0 OR LEN(@ToDate)>=0)
				BEGIN
					SELECT  
					po.PurchaseOrderId,
					CONVERT(date,po.PoDate) as PoDate,							
					v.VendorName,							
					po.TotalAmount,
					po.CancelledOn,
					po.CancelledBy,
					po.CancelRemarks
					FROM    INV_TXN_PurchaseOrder po
					INNER JOIN INV_MST_Vendor v on v.VendorId = po.VendorId					 
				    WHERE CONVERT(date,po.CancelledOn) BETWEEN convert(date,@FromDate) and convert(date,@ToDate)
			     	and po.IsCancel = 1							
				END
END
Go 
--END: NageshBB: 13 Sep 2020: alter table and store proceure altered for get cancelled po and GR get


--START:VIKAS:15th Sep 2020: EMR-2525 : Current stock levels report 

/****** Object:  StoredProcedure [dbo].[SP_Report_INV_CurrentStockLevel]    Script Date: 15-09-2020 10:58:42 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_Report_INV_CurrentStockLevel] 
@StoreIds NVARCHAR(400) = ''  
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------

---------------------------------------------------------------------
*/
  DECLARE @mainStoreId INT=null;
  SET @mainStoreId = (select StoreId from PHRM_MST_Store where [Name]='Main Store')
  IF(@mainStoreId IN (SELECT value FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> ''))
  BEGIN

	SELECT 
		x.ItemName, 
		x.Code,x.ItemId, 
		SUM(x.AvailableQuantity) as AvailableQuantity,
		SUM(x.Price*x.AvailableQuantity) as StockValue,
		x.ItemType,
		STRING_AGG(X.StoreId, ',') AS StoreIds
	FROM (SELECT 
				itm.ItemName, itm.ItemId,
				itm.Code, 
				stk.AvailableQuantity,
				stk.Price,
				itm.ItemType,
			(select top(1)StoreId from PHRM_MST_Store where [Name]='Main Store') as StoreId
			FROM INV_TXN_Stock stk
				join INV_MST_Item itm on stk.ItemId = itm.ItemId
			WHERE  AvailableQuantity>0 
		 UNION ALL

		 SELECT 
			itm.ItemName, itm.ItemId,
			itm.Code, 
			stk.AvailableQuantity,
			stk.Price,
			itm.ItemType,
			stk.StoreId
		FROM WARD_INV_Stock stk
			join INV_MST_Item itm on stk.ItemId = itm.ItemId
		WHERE  AvailableQuantity>0 AND stk.StoreId IN (SELECT value FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> '')
		) as x
		GROUP BY x.ItemName, x.Code,x.ItemType,x.ItemId
	
	END

	ELSE
	BEGIN
		SELECT 
			itm.ItemName, 
			itm.ItemId,
			itm.Code, 
			SUM(stk.AvailableQuantity) as AvailableQuantity,
			SUM(stk.Price*stk.AvailableQuantity) as StockValue,
			itm.ItemType,
			STRING_AGG(stk.StoreId, ',') AS StoreIds
		FROM WARD_INV_Stock stk
			join INV_MST_Item itm on stk.ItemId = itm.ItemId
		WHERE  AvailableQuantity>0 AND stk.StoreId IN (SELECT value FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> '')
		GROUP BY itm.ItemName, itm.ItemId,itm.Code,itm.ItemType
		ORDER BY itm.ItemName asc
	END
 
GO
------------------

/****** Object:  StoredProcedure [dbo].[SP_Report_INV_CurrentStockItemDetails_By_StoreId]    Script Date: 15-09-2020 10:59:47 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_Report_INV_CurrentStockItemDetails_By_StoreId] 
@StoreIds NVARCHAR(400) = '', @ItemId INT=null  
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------

---------------------------------------------------------------------
*/
DECLARE @mainStoreId INT=null;
SET @mainStoreId = (select StoreId from PHRM_MST_Store where [Name]='Main Store')	

IF(@mainStoreId IN (SELECT DISTINCT(value) FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> ''))

BEGIN
	SELECT 
	X.GoodsReceiptNo,
	GoodsReceiptDate,
	x.Quantity,
	X.ItemRate
	FROM (
			select 
			gr.GoodsReceiptDate, 
			gr.GoodsReceiptNo,
			--stk.AvailableQuantity,
			gritm.ReceivedQuantity+gritm.FreeQuantity Quantity ,
			gritm.ItemRate
		from INV_TXN_Stock stk
			join INV_TXN_GoodsReceiptItems gritm on stk.GoodsReceiptItemId = gritm.GoodsReceiptItemId
			join INV_TXN_GoodsReceipt gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
		where stk.ItemId=@ItemId --and stk.AvailableQuantity>0
		UNION 
		SELECT 
			gr.GoodsReceiptDate, 
			gr.GoodsReceiptNo,
			--stk.AvailableQuantity,
			gritm.ReceivedQuantity+gritm.FreeQuantity,
			stk.MRP as ItemRate
		FROM WARD_INV_Stock stk
			join INV_TXN_GoodsReceiptItems gritm on stk.GoodsReceiptItemId = gritm.GoodsReceiptItemId
			join INV_TXN_GoodsReceipt gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
		WHERE  --stk.AvailableQuantity>0 AND 
		  stk.ItemId=@ItemId AND stk.StoreId IN (SELECT DISTINCT(value) FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> '')

		) as X
GROUP BY GoodsReceiptDate,X.GoodsReceiptNo,X.ItemRate,x.Quantity
	
END

ELSE
	BEGIN
		SELECT 
			gr.GoodsReceiptDate, 
			gr.GoodsReceiptNo,
			--stk.AvailableQuantity,
			(gritm.ReceivedQuantity)+ (gritm.FreeQuantity) as Quantity,
			gritm.ItemRate
		FROM WARD_INV_Stock stk
			join INV_TXN_GoodsReceiptItems gritm on stk.GoodsReceiptItemId = gritm.GoodsReceiptItemId
			join INV_TXN_GoodsReceipt gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
		WHERE  --stk.AvailableQuantity>0 AND 
		stk.ItemId=@ItemId AND stk.StoreId IN (SELECT DISTINCT(value) FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> '')
		GROUP BY GoodsReceiptDate,gr.GoodsReceiptNo,gritm.ItemRate,gritm.ReceivedQuantity,gritm.FreeQuantity--,stk.AvailableQuantity
	
	END
GO

--END:VIKAS:15th Sep 2020: EMR-2525 : Current stock levels report 

--START: NageshBB: 16 sep 2020 inventory purchase summary report permission and routing details insertion with sp script 

-- 1. Routing and permission script for inventory PurchaseSummary report
	declare @ApplicationId INT
	SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Inventory' and ApplicationCode='INV');

	Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
	values ('inventory-reports-purchase-summary-view',@ApplicationId,1,GETDATE(),1);
	GO

	declare @PermissionId INT
	SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='inventory-reports-purchase-summary-view')

	declare @RefParentRouteId INT
	SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Inventory/Reports')

	Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, css, DefaultShow, IsActive)
	values ('Purchase Summary', 'Inventory/Reports/PurchaseSummary','PurchaseSummary',@PermissionId,@RefParentRouteId,'fa fa-shopping-cart fa-stack-1x text-white',1,1);
	GO
	
--2 Stored procedure for report 

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[SP_Report_Inventory_PurchaseSummary]
@FromDate DateTime=null,
@ToDate DateTime=null
AS
/*
FileName: [SP_Report_Inventory_PurchaseSummary] 
CreatedBy/date: NageshBB/16 Sep 2020
Description: get records for inventory purchase summary report
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1.		NageshBB/16 Sep 2020			created sp for get records for inventory purchase summary report
-------------------------------------------------------
*/
BEGIN
		If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL or LEN(@FromDate)>=0 OR LEN(@ToDate)>=0)
				BEGIN
				select 
				gr.GoodsReceiptID,
				gr.GoodsReceiptNo,
				CONVERT(date,gr.GoodsReceiptDate) as GoodsReceiptDate,
				gr.PurchaseOrderId,
				gr.GRCategory,
				v.VendorName,
				v.ContactNo,
				gr.BillNo,
				gr.TotalAmount,
				gr.SubTotal,
				gr.DiscountAmount,
				gr.VATTotal,
				gr.PaymentMode,
				gr.Remarks,
				gr.CreatedOn

				from INV_TXN_GoodsReceipt gr
				join INV_MST_Vendor v on v.VendorId=gr.VendorId
				where
				CONVERT(date,gr.GoodsReceiptDate) BETWEEN convert(date,@FromDate) and convert(date,@ToDate)
				and gr.IsCancel !=1 														
				END	
END
Go	

--rename display name of Current stock level report 
update RBAC_RouteConfig
set DisplayName='Current Stock Level'
where DisplayName='Stock Level' and UrlFullPath='Inventory/Reports/StockLevel'
go

update RBAC_RouteConfig
set DisplayName='Payroll',Css='payroll-management.png'
where DisplayName='PayrollMain' and UrlFullPath='PayrollMain'
go
--END: NageshBB: 16 sep 2020 inventory purchase summary report permission and routing details insertion with sp script 

--END: NageshBB: 18 Sep 2020: Merged INV_Reports_Sep2020 branch to Beta_V1.46x branch------------------

---ANish: 18 Sept:START: Parameter for Using First Signatory detail(ProviderId and ProviderName) in the BillTxnItem table in Radiology Add Report and Edit Page-----
Insert Into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,[Description],ParameterType)
Values('Radiology','Rad_UpdateAssignedToDoctorOnAddReport','false','boolean','Enable/Disable to take the Signatory Doctor (Reporting Doctor) from Radiology Add Report page and update that doctor’s ID/Name as ProviderId for Radiology Items','custom');
Go

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Anish>
-- Create date: <18 Sept>
-- Description:	<Update Provider detail for Radiology Item in BillTransactionItem Table>
-- =============================================
CREATE PROCEDURE [dbo].[SP_Update_RadiologyProvider_In_BillTransactionItem] (
	@RequisitionId INT,
	@ProviderId INT NULL,
	@ProviderName varchar(100)
)  
AS
BEGIN
	
	Update BIL_TXN_BillingTransactionItems set ProviderId=@ProviderId, ProviderName=@ProviderName where BillingTransactionItemId =(
	Select item.BillingTransactionItemId from BIL_TXN_BillingTransactionItems item
	Join BIL_MST_ServiceDepartment srvDept on srvDept.ServiceDepartmentId=item.ServiceDepartmentId
	where LOWER(srvDept.IntegrationName)='radiology' and item.RequisitionId=@RequisitionId
	)

END
GO
---ANish: 18 Sept:END: Parameter for Using First Signatory detail(ProviderId and ProviderName) in the BillTxnItem table in Radiology Add Report and Edit Page-----

--START: NageshBB: 19 Sep 2020: INV- current stock level report item details by storeid sp changes

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_INV_CurrentStockItemDetails_By_StoreId] 
@StoreIds NVARCHAR(400) = '', @ItemId INT=null  
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Nagesh/19 Sep 2020			 updated script for available quantity column
---------------------------------------------------------------------
*/
DECLARE @mainStoreId INT=null;
SET @mainStoreId = (select StoreId from PHRM_MST_Store where [Name]='Main Store')	

IF(@mainStoreId IN (SELECT DISTINCT(value) FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> ''))

BEGIN
	SELECT 
	X.GoodsReceiptNo,
	GoodsReceiptDate,
	x.Quantity,
	X.ItemRate,
	X.AvailableQuantity
	FROM (
			select 
			gr.GoodsReceiptDate, 
			gr.GoodsReceiptNo,
			stk.AvailableQuantity,
			gritm.ReceivedQuantity+gritm.FreeQuantity Quantity ,
			gritm.ItemRate
		from INV_TXN_Stock stk
			join INV_TXN_GoodsReceiptItems gritm on stk.GoodsReceiptItemId = gritm.GoodsReceiptItemId
			join INV_TXN_GoodsReceipt gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
		where stk.ItemId=@ItemId --and stk.AvailableQuantity>0
		UNION 
		SELECT 
			gr.GoodsReceiptDate, 
			gr.GoodsReceiptNo,
			stk.AvailableQuantity,
			gritm.ReceivedQuantity+gritm.FreeQuantity,
			stk.MRP as ItemRate
		FROM WARD_INV_Stock stk
			join INV_TXN_GoodsReceiptItems gritm on stk.GoodsReceiptItemId = gritm.GoodsReceiptItemId
			join INV_TXN_GoodsReceipt gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
		WHERE  --stk.AvailableQuantity>0 AND 
		  stk.ItemId=@ItemId AND stk.StoreId IN (SELECT DISTINCT(value) FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> '')

		) as X
GROUP BY GoodsReceiptDate,X.GoodsReceiptNo,X.ItemRate,x.Quantity,x.AvailableQuantity
	
END

ELSE
	BEGIN
		SELECT 
			gr.GoodsReceiptDate, 
			gr.GoodsReceiptNo,
			stk.AvailableQuantity,-- AvailableQuantity,
			(gritm.ReceivedQuantity)+ (gritm.FreeQuantity) as Quantity,
			gritm.ItemRate
		FROM WARD_INV_Stock stk
			join INV_TXN_GoodsReceiptItems gritm on stk.GoodsReceiptItemId = gritm.GoodsReceiptItemId
			join INV_TXN_GoodsReceipt gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
		WHERE  --stk.AvailableQuantity>0 AND 
		stk.ItemId=@ItemId AND stk.StoreId IN (SELECT DISTINCT(value) FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> '')
		GROUP BY GoodsReceiptDate,gr.GoodsReceiptNo,gritm.ItemRate,gritm.ReceivedQuantity,gritm.FreeQuantity,stk.AvailableQuantity
	
	END
	Go

--END: NageshBB: 19 Sep 2020: INV- current stock level report item details by storeid sp changes


--start: sud:23Sept'20--For Incentive Correction--
Alter Table INCTV_CFG_ItemGroupDistribution
ADD Constraint UK_INCTV_ItemGroupDistribution UNIQUE(BillItemPriceId, EmployeeBillItemsMapId, DistributeToEmployeeId)
GO
--end: sud:23Sept'20--For Incentive Correction--

-- START:VIKAS:24th Sep 2020:Added parameter for create all ledger from Default ledger tab. 
Insert into CORE_CFG_Parameters ([ParameterGroupName],[ParameterName],[ParameterValue],[ValueDataType],[Description],[ParameterType])
values('Accounting','AllowToCreateAllLedgers','true','boolean','Allow or not to create ledgers for different types of Ledger Group from Default Ledger tab. Default value is true. If value is true then allow to create all ledgers.','custom');
Go
-- END:VIKAS:24th Sep 2020:Added parameter for create all ledger from Default ledger tab. 

---Start: Anjana:23Sept,2020: New column for Police Case-----
Alter Table ADT_PatientAdmission
Add IsPoliceCase bit default null;
Go
---End: Anjana:23Sept,2020: New column for Police Case-----

--start: sud:24Sept'20--For Incentive Correction--
Alter Table INCTV_TXN_IncentiveFractionItem
Add IsReturnTxn BIT Constraint DEF_Inctv_FractionItem_IsReturn Default(0)
GO
Update INCTV_TXN_IncentiveFractionItem
set IsReturnTxn=0
GO

ALTER TABLE [dbo].[INCTV_TXN_IncentiveFractionItem] DROP CONSTRAINT [UK_IncentiveFractionItems]
GO
ALTER TABLE [dbo].[INCTV_TXN_IncentiveFractionItem] ADD  CONSTRAINT [UK_IncentiveFractionItems] UNIQUE NONCLUSTERED 
(
	[BillingTransactionItemId],
	[IncentiveReceiverId],
	[IncentiveType],
	IsReturnTxn
)
GO

/****** Object:  StoredProcedure [dbo].[SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange]    Script Date: 2020-09-24 2:59:26 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange] 
 ( @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL)
AS
/*
 File: SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange '2020-02-14','2020-02-14'
 Description: 
 Remarks:  
     * MainDoctor=1 for Assigned and is 0 for Referral.
     * Check for CreatedBy and CreatedOn value. 
	 * We're excluding the fraction where RequestsedBy(ReferredBy) and AssignedToId are there in BillingTxnItem but those doctors don't have any configuration in Incentive-Profile

 Revision Needed ON: 
    * We may need undo functionality of this feature.
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By            Remarks
 --------------------------------------------------
 1.      15Feb'20/Sud              Initial Draft (Needs Revision)
 2.      15Mar'20/Sud              Added TDSPercentage and TDSAmount calculation in the query
3.       4Apr'20/Sud               Excluding Already Added BillingTransactionItem during Bill Sync.
                                   earlier it was at BillingTransactionId level, now it's BillingTransactionItemId
4.       11June                    TDSpercentage from Employee Incentive Info
5.       17Jul'20/Sud/Pratik       Updated for Group Distribution 
6.       10Aug'20/Sud              Removed HardCoded Date Range from Group Distribution
7.       17Sept'20                 Temporary solution to avoid Syncing Returned items
                                   ToDate <= GetDate()-5days or less.. if not then make that from here..
8.       24Sept'20                 Returned items not excluded anymore, it will be handled by another StoredProcedure as Negative billing
 -----------------------------------------------------------------
*/
BEGIN

IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL)
BEGIN


INSERT INTO INCTV_TXN_IncentiveFractionItem
   ( InvoiceNoFormatted, TransactionDate, PriceCategory, BillingTransactionId, BillingTransactionItemId, PatientId, 
    BillItemPriceId, ItemName, TotalBillAmount, IncentiveType, IncentiveReceiverId, IncentiveReceiverName, IncentivePercent, IncentiveAmount, 
	IsPaymentProcessed, PaymentInfoId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive, IsMainDoctor, TDSPercentage, TDSAmount, IsReturnTxn)

Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'referral' as IncentiveType, 
   txnItm.RequestedBy 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.ReferredByPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	0 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercent,
	( txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100
	, 0 AS IsReturnTxn
  -----2. Secondary Columns:
  -- ,txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN FN_INCTV_GetIncentiveSettings_Normal () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.RequestedBy = sett.EmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	--AND ISNULL(txnItm.ReturnStatus,0)= 0 -- Not Required Anymore
	AND ISNULL(sett.ReferredByPercent,0) !=0

	and txnItm.BillingTransactionItemId NOT IN 
	    (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem  WHERE IsReturnTxn=0) 
---End: For Referral Incentive-----------

UNION ALL

---2.1-- Start: For Assigned Incentive (No Group Distribution)-----------
Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'assigned' as IncentiveType, 
   txnItm.ProviderId 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.AssignedToPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	1 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercentage,
	( txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100
	, 0 AS IsReturnTxn
  -----2. Secondary Columns:
  --, txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN FN_INCTV_GetIncentiveSettings_Normal () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.ProviderId = sett.EmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(sett.AssignedToPercent,0) !=0
		---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN 
	  (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem WHERE IsReturnTxn=0) -- remove this condition once daily upload is enabled..
---End: 2.1 For Assigned Incentive (No Group Distribution)-----------

UNION ALL

---2.2-- Start: For Assigned Incentive (Group Distribution Only)-----------
 
Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'assigned' as IncentiveType, 
  -- incentive goes to:  ToEmployeeId----
   sett.ToEmployeeId 'IncentiveReceiverId', sett.ToEmployeeName 'IncentiveReceiverName',
    sett.DistributionPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.DistributionPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	1 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercentage,
	( txnitm.TotalAmount* ISNULL(sett.DistributionPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100
	, 0 AS IsReturnTxn

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      ON txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
      ON TXN.FiscalYearId = fyear.FiscalYearId
  INNER JOIN 
	 FN_INCTV_GetIncentiveSettings_GroupDistribution() sett  -- this gives us group distribution settings only.. 
  
  --[FN_INCTV_GetIncentiveSettings] () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.ProviderId = sett.FromEmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate -- sud:10Aug'20-- this dates were hardcoded earlier.
	-- AND ISNULL(txnItm.ReturnStatus,0)= 0 -- Not Required Anymore
	AND ISNULL(sett.DistributionPercent,0) !=0
		---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN 
	  (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem WHERE IsReturnTxn=0) -- remove this condition once daily upload is enabled..

---2.2-- End: For Assigned Incentive (Group Distribution Only)-----------


END--end of IF.. 

--by default returning something so that we understand it has been executed..
Select 'success' as 'status' 

END--end of SP--
GO
GO
GO
Create PROCEDURE [dbo].[SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_Return_InDateRange] 
 ( @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL)
AS
/*
 File: SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_Return_InDateRange '2020-02-14','2020-02-14'
 Description: To insert negative amount for Invoice Return Cases.
           -- Negative Amount for:  TotalBillAmount, IncentiveAmount and TDS
		   -- IncentivePercent will remain same
 Remarks:  
     * MainDoctor=1 for Assigned and is 0 for Referral.
     * Check for CreatedBy and CreatedOn value. 
	 * We're excluding the fraction where RequestsedBy(ReferredBy) and AssignedToId are there in BillingTxnItem but those doctors don't have any configuration in Incentive-Profile

 Revision Needed ON: 
    * We may need undo functionality of this feature.
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By            Remarks
 --------------------------------------------------
1.      24Sept'20                 This handles only Returned Items.
 -----------------------------------------------------------------
*/
BEGIN

IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL)
BEGIN

INSERT INTO INCTV_TXN_IncentiveFractionItem
   ( InvoiceNoFormatted, TransactionDate, PriceCategory, BillingTransactionId, BillingTransactionItemId, PatientId, 
    BillItemPriceId, ItemName, TotalBillAmount, IncentiveType, IncentiveReceiverId, IncentiveReceiverName, IncentivePercent, IncentiveAmount, 
	IsPaymentProcessed, PaymentInfoId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive, IsMainDoctor, TDSPercentage, TDSAmount
	, IsReturnTxn)

Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   rettxn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,
   - txnItm.TotalAmount 'TotalBillAmount',
    'referral' as IncentiveType, 
   txnItm.RequestedBy 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.ReferredByPercent 'IncentivePercent', 
	- txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 'IncentiveAmount', 
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	0 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercent,
	- ( txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100
	, 1 AS IsReturnTxn
  -----2. Secondary Columns:
  -- ,txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
    BIL_TXN_InvoiceReturn retTxn ON txn.BillingTransactionId = retTxn.BillingTransactionId 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN FN_INCTV_GetIncentiveSettings_Normal () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.RequestedBy = sett.EmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(sett.ReferredByPercent,0) !=0
	and txnItm.BillingTransactionItemId  NOT IN 
	  (SELECT DISTINCT BillingTransactionItemId  FROM INCTV_TXN_IncentiveFractionItem  WHERE IsReturnTxn=1) 
---End: For Referral Incentive-----------

UNION ALL

---2.1-- Start: For Assigned Incentive (No Group Distribution)-----------
Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
    rettxn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,
   - txnItm.TotalAmount 'TotalBillAmount',
    'assigned' as IncentiveType, 
   txnItm.ProviderId 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.AssignedToPercent 'IncentivePercent', 
	- txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	1 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercentage,
	- ( txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100
	, 1 AS IsReturnTxn



from BIL_TXN_BillingTransaction txn 
   INNER JOIN
    BIL_TXN_InvoiceReturn retTxn ON txn.BillingTransactionId = retTxn.BillingTransactionId 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN FN_INCTV_GetIncentiveSettings_Normal () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.ProviderId = sett.EmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(sett.AssignedToPercent,0) !=0
		---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN 
	    (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem  WHERE IsReturnTxn=1) 
---End: 2.1 For Assigned Incentive (No Group Distribution)-----------

UNION ALL

---2.2-- Start: For Assigned Incentive (Group Distribution Only)-----------
 
Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   rettxn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,
   - txnItm.TotalAmount 'TotalBillAmount',
    'assigned' as IncentiveType, 
  -- incentive goes to:  ToEmployeeId----
   sett.ToEmployeeId 'IncentiveReceiverId', sett.ToEmployeeName 'IncentiveReceiverName',
    sett.DistributionPercent 'IncentivePercent', 
	- txnitm.TotalAmount* ISNULL(sett.DistributionPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	1 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercentage,
	- ( txnitm.TotalAmount* ISNULL(sett.DistributionPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100
	, 1 AS IsReturnTxn

from BIL_TXN_BillingTransaction txn 
  INNER JOIN
    BIL_TXN_InvoiceReturn retTxn ON txn.BillingTransactionId = retTxn.BillingTransactionId 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      ON txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
      ON TXN.FiscalYearId = fyear.FiscalYearId
  INNER JOIN 
	 FN_INCTV_GetIncentiveSettings_GroupDistribution() sett  -- this gives us group distribution settings only.. 
  
  --[FN_INCTV_GetIncentiveSettings] () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.ProviderId = sett.FromEmployeeId
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate 
	AND ISNULL(sett.DistributionPercent,0) !=0
		---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN 
	    (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem  WHERE IsReturnTxn=1) 

---2.2-- End: For Assigned Incentive (Group Distribution Only)-----------

END--end of IF.. 

--by default returning something so that we understand it has been executed..
Select 'success' as 'status' 

END--end of SP--

GO

--end: sud:24Sept'20--For Incentive Correction--


--START:VIKAS: 25th Sep 2020: changed table name for inventory section consumption transaction records from WARD_INV_Consumption to WARD_INV_Transaction.
/****** Object:  StoredProcedure [dbo].[SP_ACC_GetTransactionDates]    Script Date: 25-09-2020 10:37:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-----------------------------------------------------------
	
	ALTER PROCEDURE [dbo].[SP_ACC_GetTransactionDates]
		@FromDate DATETIME = null ,
		@ToDate DATETIME = null,
		@HospitalId INT = null,
		@SectionId INT = null
	AS
	/************************************************************************
	FileName: [SP_ACC_GetTransactionDates]
	CreatedBy/date: 
	Description: Get section wise all transactions date which is not synced with accounting
	Change History
	-------------------------------------------------------------------------
	S.No.    UpdatedBy/Date                        Remarks
	-------------------------------------------------------------------------
	1.      Vikas:25th Sep 2020				changed table for consumptions transactions from WARD_INV_Consumption to WARD_INV_Transaction
	*************************************************************************/
	BEGIN
		-- check rules are mapped or not with transaction types
		DECLARE @Rules TABLE (GroupMappingId INT, Description varchar(200),TransferRuleId INT)
		Insert into @Rules(GroupMappingId, Description, TransferRuleId)
		select [GroupMappingId], [Description],[TransferRuleId]
		from (select gm.GroupMappingId,gm.Description,TransferRuleId from ACC_MST_GroupMapping gm
		join ACC_MST_MappingDetail mp on gm.GroupMappingId = mp.GroupMappingId
		join ACC_MST_Hospital_TransferRules_Mapping r on mp.GroupMappingId = r.TransferRuleId
		group by gm.GroupMappingId ,gm.Description,TransferRuleId) x
		
		IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL AND @HospitalId IS NOT NULL AND @SectionId IS NOT NULL) 
		BEGIN
			IF(@SectionId=1) -- Inventory 
			BEGIN
			  --Table1: GoodReceipt
				SELECT CONVERT(DATE, gr.GoodsReceiptDate)  as 'TransactionDate',
					       CONVERT(DATE, gr.CreatedOn)  as 'Date'
					FROM INV_TXN_GoodsReceipt gr 
						join INV_TXN_GoodsReceiptItems gritm on gr.GoodsReceiptID = gritm.GoodsReceiptId					
					WHERE (gritm.IsTransferredToACC IS NULL OR gritm.IsTransferredToACC = 0) 
						AND (CONVERT(DATE, gr.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))				
						AND ((select count([Description]) from @Rules where [Description]='INVCashGoodReceiptFixedAsset1' 
								or [Description]='INVCashGoodReceipt1' or [Description]='INVCreditGoodReceiptFixedAsset' or [Description]='INVCreditGoodReceipt') > 0)
				                            
				UNION
					--Table2: WriteOffItems
					SELECT CONVERT(DATE, wr.WriteOffDate) as 'TransactionDate',
					  CONVERT(DATE, wr.CreatedOn)  as 'Date'
					FROM INV_TXN_WriteOffItems wr
					WHERE (IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
					AND (CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
					AND ((select count([Description]) from @Rules where [Description]='INVWriteOff') > 0)
				UNION
					--Table3: ReturnToVendor
					SELECT CONVERT(DATE,rv.CreatedOn) as 'TransactionDate',
					  CONVERT(DATE, rv.CreatedOn)  as 'Date'
					FROM INV_TXN_ReturnToVendorItems rv 
					WHERE (rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
						AND (CONVERT(DATE, rv.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
						AND ((select count([Description]) from @Rules where [Description]='INVReturnToVendorCashGR' OR [Description]='INVReturnToVendorCreditGR') > 0)
				UNION
					--Table4: DispatchToDept
					SELECT
						CONVERT(DATE,st.CreatedOn) as 'TransactionDate',
						CONVERT(DATE, st.CreatedOn)  as 'Date'	
					FROM
					INV_TXN_StockTransaction st
					JOIN INV_TXN_Stock s ON st.StockId = s.StockId 
					JOIN INV_TXN_GoodsReceiptItems gri ON s.GoodsReceiptItemId = gri.GoodsReceiptItemId 
					WHERE
					(st.IsTransferredToACC IS NULL OR st.IsTransferredToACC = 0) 
					AND (st.TransactionType IN ('dispatch', 'Sent From WardSupply')) 
					AND (CONVERT(DATE, st.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
					AND ((select count([Description]) from @Rules where [Description]='INVDispatchToDept') > 0)
				UNION
					-- Table 5 :INVDeptConsumedGoods
					-- Vikas:25th sep 2020: changed table for consumptions transactions. WARD_INV_Consumption to WARD_INV_Transaction
					SELECT CONVERT(DATE,csm.TransactionDate) as 'TransactionDate',
					   CONVERT(DATE, csm.CreatedOn)  as 'Date'
					FROM WARD_INV_Transaction csm										
					WHERE (csm.IsTransferToAcc IS NULL OR csm.IsTransferToAcc=0)  
						AND csm.TransactionType='consumption-items'
						AND CONVERT(DATE, csm.CreatedOn) BETWEEN   CONVERT(DATE, @FromDate) AND  CONVERT(DATE, @ToDate)
						AND ((select count([Description]) from @Rules where [Description]='INVDeptConsumedGoods') > 0)
			END
			---------------- 
			IF(@SectionId=2) -- Billing 
			BEGIN
				IF((select top 1 CONVERT(bit, ParameterValue) from CORE_CFG_Parameters where ParameterGroupName='accounting'and ParameterName='GetBillingFromSyncTable')=1) 
					BEGIN
  
					SELECT 
					CONVERT(date, TransactionDate) as 'TransactionDate',CONVERT(DATE, TransactionDate)  as 'Date'
					from BIL_SYNC_BillingAccounting 
					WHERE IsTransferedToAcc IS NULL AND CONVERT(date, TransactionDate) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
					END
					ELSE
					BEGIN 
					------Cash Bill-------
								Select CONVERT(date, itm.PaidDate) as 'TransactionDate',CONVERT(DATE, itm.PaidDate)  as 'Date'  
								from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
								Where txn.BillingTransactionId = itm.BillingTransactionId
									AND Convert(Date,itm.PaidDate) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
									and itm.BillingTransactionId IS NOT NULL
									and ( txn.PaymentMode='cash' OR txn.PaymentMode='card' OR txn.PaymentMode='cheque')
									AND ISNULL(itm.IsCashBillSync,0) = 0  
							UNION 
			
				------Credit Bill-----
							Select CONVERT(date, itm.CreatedOn) as 'TransactionDate',CONVERT(DATE, itm.CreatedOn)  as 'Date'
							from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
							Where txn.BillingTransactionId = itm.BillingTransactionId
								AND Convert(Date,itm.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
								and itm.BillingTransactionId IS NOT NULL
								and txn.PaymentMode='credit'
								AND ISNULL(itm.IsCreditBillSync,0) = 0  
							UNION 
			
				------Cash Bill Return--
							Select	CONVERT(date, ret.CreatedOn) as 'TransactionDate',CONVERT(DATE, ret.CreatedOn)  as 'Date'
							from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
							Where txn.BillingTransactionId = itm.BillingTransactionId
								and ret.BillingTransactionId=txn.BillingTransactionId
								and Convert(Date,ret.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
								and ISNULL(itm.ReturnStatus,0) != 0  
								and itm.BillingTransactionId IS NOT NULL
								and  ( txn.PaymentMode='cash' OR txn.PaymentMode='card' OR txn.PaymentMode='cheque') 
								AND ISNULL(itm.IsCashBillReturnSync,0) = 0  
							UNION 
			
				------CreditBillReturn--- 
							Select CONVERT(date, ret.CreatedOn) as 'TransactionDate',CONVERT(DATE, ret.CreatedOn)  as 'Date'
							from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
							Where txn.BillingTransactionId = itm.BillingTransactionId
								and ret.BillingTransactionId=txn.BillingTransactionId
								and Convert(Date,ret.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
								and ISNULL(itm.ReturnStatus,0) != 0  -- take only returned items..
								and itm.BillingTransactionId IS NOT NULL
								and txn.PaymentMode='credit'
								AND ISNULL(itm.IsCreditBillReturnSync,0) = 0  
								UNION 
			
				------Deposit Add---
							Select	CONVERT(date, CreatedOn) as 'TransactionDate',CONVERT(DATE, CreatedOn)  as 'Date'
							from BIL_TXN_Deposit
							Where Convert(Date,CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
							and DepositType ='Deposit'AND ISNULL(IsDepositSync,0) = 0 
							UNION 
			
				-------Deposit Return/Deduct---
							Select	CONVERT(date, CreatedOn) as 'TransactionDate',CONVERT(DATE, CreatedOn)  as 'Date'
							from BIL_TXN_Deposit
							Where Convert(Date,CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
							AND DepositType IN ('ReturnDeposit', 'depositdeduct') AND ISNULL(IsDepositSync,0) = 0  		
			
				END
			END
			---------------- 
			IF(@SectionId=3) -- Pharmacy 			
			BEGIN
				--Table1: CashInvoice
					SELECT 
					CONVERT(date, inv.CreateOn) as 'TransactionDate',
					CONVERT(DATE, inv.CreateOn)  as 'Date'
						from PHRM_TXN_Invoice inv WHERE inv.IsTransferredToACC IS NULL  AND CONVERT(date, inv.CreateOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
				UNION
				--Table3: CashInvoiceReturn
					SELECT 
					CONVERT(date, invRet.CreatedOn) as 'TransactionDate',
					CONVERT(DATE, invRet.CreatedOn)  as 'Date'
					from  PHRM_TXN_InvoiceReturnItems invRet WHERE invRet.IsTransferredToACC IS NULL AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)  
				UNION
				--Table4: goodsReceipt
					select 
					CONVERT(date, gr.CreatedOn) as 'TransactionDate',
					CONVERT(DATE, gr.CreatedOn)  as 'Date'
					from PHRM_GoodsReceipt gr WHERE gr.IsTransferredToACC IS NULL AND gr.IsCancel=0  AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
				UNION
				--Table5: writeoff
				select CONVERT(date, wrOff.CreatedOn) as 'TransactionDate',
					CONVERT(DATE, wrOff.CreatedOn)  as 'Date'
					from PHRM_WriteOff wrOff WHERE wrOff.IsTransferredToACC IS NULL AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
 
				UNION
				--Table6: dispatchToDept && dispatchToDeptRet
				select 
					CONVERT(date, stkItm.CreatedOn) as 'TransactionDate',
					CONVERT(DATE, stkItm.CreatedOn)  as 'Date'
				from PHRM_StockTxnItems stkItm WHERE stkItm.IsTransferredToACC IS NULL AND stkItm.TransactionType='wardsupply' AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
  
			END
			---------------- 
			IF(@SectionId=5) -- Incetives 
			BEGIN
				select 
				CONVERT(date, inc.TransactionDate) as 'TransactionDate',CONVERT(DATE, inc.TransactionDate)  as 'Date'
				from INCTV_TXN_IncentiveFractionItem inc 
				Where CONVERT(date, inc.TransactionDate) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
				AND ISNULL(IsTransferToAcc,0) = 0
				Group by CONVERT(date, TransactionDate)
			END
			----------------
  		END			
	END
GO
--END:VIKAS: 25th Sep 2020: changed table name for inventory section consumption transaction records from WARD_INV_Consumption to WARD_INV_Transaction.

---start:sud:28Sept'20--hiding unused/faulty inventory reports from the view--

Update RBAC_RouteConfig
set IsActive=0
where UrlFullPath IN
(
'Inventory/Reports/DailyItemDispatch',
'Inventory/Reports/PurchaseOrder',
'Inventory/Reports/InventoryValuation',
'Inventory/Reports/ComparisonPOGR',
'Inventory/Reports/PurchaseReports',
'Inventory/Reports/WriteOff',
'Inventory/Reports/ReturnToVendor',
'Inventory/Reports/FixedAssets',
'Inventory/Reports/GoodReceiptEvaluation',
'Inventory/Reports/VendorTransaction',
'Inventory/Reports/ItemMgmtDetail',
'Inventory/Reports/SubstoreStock'
)
GO
---end:sud:28Sept'20--hiding unused/faulty inventory reports from the view--

----Start: Anjana: 28/09/2020: Permission for different buttons-------
Declare @ApplicationId INT set @ApplicationId = (Select TOP (1) ApplicationId from RBAC_Application 
	where ApplicationName = 'Inventory' and ApplicationCode= 'INV');

Insert into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
Values ('btn-inventory-goodsreceipt-create',@ApplicationId,1,GETDATE(),1)
Go

Delete from RBAC_RouteConfig where UrlFullPath ='SystemAdmin/DatabaseExport';
Go


Declare @ApplicationId INT set @ApplicationId = (Select TOP (1) ApplicationId from RBAC_Application 
	where ApplicationName = 'Billing' and ApplicationCode= 'BIL');

Insert into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
Values ('btn-opbilling-provisional',@ApplicationId,1,GETDATE(),1)
Go
----End: Anajana: 28/09/2020: Permission for different buttons-------

----------------Rusha: 29th Sept 2020: Merged Beta_V1.46X to DEV branch--------------
-----Start Anjana: 29/09/2020: Permissions for different buttons in IPBilling----
Declare @ApplicationId INT set @ApplicationId = (Select TOP (1) ApplicationId from RBAC_Application 
	where ApplicationName = 'Billing' and ApplicationCode= 'BIL');

Insert into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
Values ('btn-ipdbilling-newitem',@ApplicationId,1,GETDATE(),1), 
	   ('btn-ipdbilling-estimationbill',@ApplicationId,1,GETDATE(),1),
	   ('btn-ipdbilling-deposit',@ApplicationId,1,GETDATE(),1),
	   ('btn-ipdbilling-groupdiscount',@ApplicationId,1,GETDATE(),1),
	   ('btn-ipdbilling-edititems',@ApplicationId,1,GETDATE(),1),
	   ('btn-ipdbilling-partialclearance',@ApplicationId,1,GETDATE(),1),
	   ('btn-ipdbilling-confirmdischarge',@ApplicationId,1,GETDATE(),1) 
Go
-----End Anjana: 29/09/2020: Permissions for different buttons in IPBilling----

--START: NageshBB: 30 Sep Inventory report correction

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_INV_CurrentStockLevel] 
@StoreIds NVARCHAR(400) = ''  
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		NageshBB/22 Sep 2020			updated script for get subcategory name column
---------------------------------------------------------------------
*/
  DECLARE @mainStoreId INT=null;
  SET @mainStoreId = (select StoreId from PHRM_MST_Store where [Name]='Main Store')
  IF(@mainStoreId IN (SELECT value FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> ''))
  BEGIN

	SELECT 
	    x.SubCategoryName,
		x.ItemName, 
		x.Code,x.ItemId, 
		SUM(x.AvailableQuantity) as AvailableQuantity,
		SUM(x.Price*x.AvailableQuantity) as StockValue,
		x.ItemType,
		STRING_AGG(X.StoreId, ',') AS StoreIds
	FROM (SELECT 
				subCat.SubCategoryName,
				itm.ItemName, itm.ItemId,
				itm.Code, 
				stk.AvailableQuantity,
				stk.Price,
				itm.ItemType,
			(select top(1)StoreId from PHRM_MST_Store where [Name]='Main Store') as StoreId
			FROM INV_TXN_Stock stk
				join INV_MST_Item itm on stk.ItemId = itm.ItemId
				join INV_MST_ItemSubCategory subCat on subCat.SubCategoryId=itm.SubCategoryId
			WHERE  AvailableQuantity>0 
		 UNION ALL

		 SELECT 
		    subCat.SubCategoryName,
			itm.ItemName, itm.ItemId,
			itm.Code, 
			stk.AvailableQuantity,
			stk.Price,
			itm.ItemType,
			stk.StoreId
		FROM WARD_INV_Stock stk
			join INV_MST_Item itm on stk.ItemId = itm.ItemId
			join INV_MST_ItemSubCategory subCat on subCat.SubCategoryId=itm.SubCategoryId
		WHERE  AvailableQuantity>0 AND stk.StoreId IN (SELECT value FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> '')
		) as x
		GROUP BY x.ItemName, x.Code,x.ItemType,x.ItemId,x.SubCategoryName
	
	END

	ELSE
	BEGIN
		SELECT 
		   subCat.SubCategoryName,
			itm.ItemName, 
			itm.ItemId,
			itm.Code, 
			SUM(stk.AvailableQuantity) as AvailableQuantity,
			SUM(stk.Price*stk.AvailableQuantity) as StockValue,
			itm.ItemType,
			STRING_AGG(stk.StoreId, ',') AS StoreIds
		FROM WARD_INV_Stock stk
			join INV_MST_Item itm on stk.ItemId = itm.ItemId
				join INV_MST_ItemSubCategory subCat on subCat.SubCategoryId=itm.SubCategoryId
		WHERE  AvailableQuantity>0 
		--AND stk.StoreId IN (SELECT value FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> '')
		GROUP BY itm.ItemName, itm.ItemId,itm.Code,itm.ItemType,subCat.SubCategoryName
		ORDER BY itm.ItemName asc
	END

	Go
 

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_INV_CurrentStockItemDetails_By_StoreId] 
@StoreIds NVARCHAR(400) = '', @ItemId INT=null  
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Nagesh/19 Sep 2020			 updated script for available quantity column
2		NageshBB/22 sep 2020			exclued items which available quantity is 0 and added storename column
---------------------------------------------------------------------
*/
DECLARE @mainStoreId INT=null;
SET @mainStoreId = (select StoreId from PHRM_MST_Store where [Name]='Main Store')	

IF(@mainStoreId IN (SELECT DISTINCT(value) FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> ''))

BEGIN
	SELECT 
	X.GoodsReceiptNo,
	GoodsReceiptDate,
	x.Quantity,
	X.ItemRate,
	X.AvailableQuantity
	FROM (
			select 

			gr.GoodsReceiptDate, 
			gr.GoodsReceiptNo,
			stk.AvailableQuantity,
			gritm.ReceivedQuantity+gritm.FreeQuantity Quantity ,
			gritm.ItemRate	,
			'Main Store' as StoreName
		from INV_TXN_Stock stk
			join INV_TXN_GoodsReceiptItems gritm on stk.GoodsReceiptItemId = gritm.GoodsReceiptItemId
			join INV_TXN_GoodsReceipt gr on gritm.GoodsReceiptId = gr.GoodsReceiptID			
		where stk.ItemId=@ItemId and stk.AvailableQuantity>0
		UNION 
		SELECT 
			gr.GoodsReceiptDate, 
			gr.GoodsReceiptNo,
			stk.AvailableQuantity,
			gritm.ReceivedQuantity+gritm.FreeQuantity,
			stk.MRP as ItemRate,
			store.Name as StoreName			
		FROM WARD_INV_Stock stk
			join INV_TXN_GoodsReceiptItems gritm on stk.GoodsReceiptItemId = gritm.GoodsReceiptItemId
			join INV_TXN_GoodsReceipt gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
			join PHRM_MST_Store store on store.StoreId =stk.StoreId
		WHERE  stk.AvailableQuantity>0 AND 
		  stk.ItemId=@ItemId AND stk.StoreId IN (SELECT DISTINCT(value) FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> '')

		) as X
		
GROUP BY GoodsReceiptDate,X.GoodsReceiptNo,X.ItemRate,x.Quantity,x.AvailableQuantity,x.StoreName
	order by x.StoreName,convert(date,x.GoodsReceiptDate)
END

ELSE
	BEGIN
		SELECT 
			gr.GoodsReceiptDate, 
			gr.GoodsReceiptNo,
			stk.AvailableQuantity,-- AvailableQuantity,
			(gritm.ReceivedQuantity)+ (gritm.FreeQuantity) as Quantity,
			gritm.ItemRate,
			store.Name as StoreName
		FROM WARD_INV_Stock stk
			join INV_TXN_GoodsReceiptItems gritm on stk.GoodsReceiptItemId = gritm.GoodsReceiptItemId
			join INV_TXN_GoodsReceipt gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
			join PHRM_MST_Store store on store.StoreId =stk.StoreId
		WHERE  stk.AvailableQuantity>0 AND 
		stk.ItemId=@ItemId AND stk.StoreId IN (SELECT DISTINCT(value) FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> '')
		GROUP BY GoodsReceiptDate,gr.GoodsReceiptNo,gritm.ItemRate,gritm.ReceivedQuantity,gritm.FreeQuantity,stk.AvailableQuantity,store.Name
	    order by store.Name, convert(date,gr.GoodsReceiptDate)
	END
Go

--END: NageshBB: 30 Sep Inventory report correction

------Start Anjana 9/30/2020: SP, Permission and RouteConfig for Police Case Report--------
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_Report_PoliceCasePatient] 
	@FromDate Date=null ,
	@ToDate Date=null	
AS
/*
FileName: [SP_Report_PoliceCasePatient]
CreatedBy/date: Anjana (2020-09-30) 
Description: to get the count of total police case patient between Given Date

Change History
--------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------------
1.     Anjana (2020-09-30)					Initial Draft
-------------------------------------------------------------------------------
*/

BEGIN
If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL)
	BEGIN 
			select 
			  (Cast(ROW_NUMBER() OVER (ORDER BY  DischargeDate desc)  as int)) as SN,
			  	P.ShortName,
		      --(P.Firstname+''+P.LastName) 'PatientName',
              convert(varchar(20),CONVERT(date,DischargeDate)) 'DischargedDate', 
              convert(varchar(20),CONVERT(date,AdmissionDate)) 'AdmissionDate',
			  V.VisitCode 'IpNumber',
			  P.PatientCode 'HospitalNumber',
			  A.PatientId,
			  A.AdmissionStatus
		    from ADT_PatientAdmission A join PAT_PatientVisits V
                on A.PatientVisitId = V.PatientVisitId
               Join PAT_Patient P on P.PatientId=V.PatientId
		    where A.IsPoliceCase=1 and CONVERT(date,AdmissionDate) between @FromDate and @ToDate
			Order By convert(varchar(20),CONVERT(date,AdmissionDate)) desc
	
	END	
END
Go

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationID from RBAC_Application where ApplicationName = 'Reports' and ApplicationCode='RPT');

Insert into RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive) values ('policecase-report-view', @ApplicationId, 1, GETDATE(),1);
GO

declare @RefParentRouteId INT 
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Reports');

declare @PermissionId INT 
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='policecase-report-view');

Insert into RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive) values('Police Case','Reports/PoliceCaseMain','PoliceCase',@PermissionId,@RefParentRouteId,1,NULL,1);
GO

------End Anjana 9/30/2020: SP, Permission and RouteConfig for Police Case Report--------

-- START: VIKAS: 30-Sep-2020: dates mismatch from tables correction.
/****** Object:  StoredProcedure [dbo].[SP_ACC_GetTransactionDates]    Script Date: 30-09-2020 08:48:20 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-----------------------------------------------------------
	
	ALTER PROCEDURE [dbo].[SP_ACC_GetTransactionDates]
		@FromDate DATETIME = null ,
		@ToDate DATETIME = null,
		@HospitalId INT = null,
		@SectionId INT = null
	AS
	/************************************************************************
	FileName: [SP_ACC_GetTransactionDates]
	CreatedBy/date: 
	Description: Get section wise all transactions date which is not synced with accounting
	Change History

	NOTE: All sections records table depends on their main transactions loading sp
		  For Inventory => SP_ACC_GetInventoryTransactions
			  Billing   => SP_ACC_Bill_GetBillingDataForAccTransfer
			  Pharmacy  => SP_ACC_GetPharmacyTransactions
			  Incentive => SP_INCTV_ACC_GetTransactionInfoForAccTransfer

		 - use tables which is used in above sectionwise stored procedure to get below section wise transaction dates.
		   If table modify in above stored procedure also modify in this sp.
	-------------------------------------------------------------------------
	S.No.    UpdatedBy/Date                        Remarks
	-------------------------------------------------------------------------
	1.      Vikas:25th Sep 2020				changed table for consumptions transactions from WARD_INV_Consumption to WARD_INV_Transaction
	2.      Vikas:30 Sep 2020				transaction dates mismatched and some other bugs correction from all tables.
	*************************************************************************/
	BEGIN
		-- check rules are mapped or not with transaction types
		DECLARE @Rules TABLE (GroupMappingId INT, Description varchar(200),TransferRuleId INT)
		Insert into @Rules(GroupMappingId, Description, TransferRuleId)
		select [GroupMappingId], [Description],[TransferRuleId]
		from (select gm.GroupMappingId,gm.Description,TransferRuleId from ACC_MST_GroupMapping gm
		join ACC_MST_MappingDetail mp on gm.GroupMappingId = mp.GroupMappingId
		join ACC_MST_Hospital_TransferRules_Mapping r on mp.GroupMappingId = r.TransferRuleId
		group by gm.GroupMappingId ,gm.Description,TransferRuleId) x
		
		IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL AND @HospitalId IS NOT NULL AND @SectionId IS NOT NULL) 
		BEGIN
			IF(@SectionId=1) -- Inventory Section 
			BEGIN
			  --Table1: GoodReceipt
				SELECT 
					CONVERT(DATE, gr.GoodsReceiptDate) as 'TransactionDate'		
				FROM INV_TXN_GoodsReceipt gr 
					JOIN INV_TXN_GoodsReceiptItems gritm on gr.GoodsReceiptID = gritm.GoodsReceiptId
					JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
					JOIN INV_MST_Item itm on gritm.ItemId = itm.ItemId
				WHERE (gritm.IsTransferredToACC IS NULL OR gritm.IsTransferredToACC = 0) 
					AND (CONVERT(DATE, gr.GoodsReceiptDate) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))	
					AND itm.ItemType !='Capital Goods' and gr.IsCancel!=1 --excluded cancel gr		
					AND ((select count([Description]) from @Rules where [Description]='INVCashGoodReceiptFixedAsset1' 
					OR [Description]='INVCashGoodReceipt1' or [Description]='INVCreditGoodReceiptFixedAsset' or [Description]='INVCreditGoodReceipt') > 0)
				UNION
				 --Table2: WriteOffItems
					SELECT 
						CONVERT(DATE, wr.CreatedOn) as 'TransactionDate'
					FROM INV_TXN_WriteOffItems wr
					WHERE (IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
					AND (CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
					AND ((select count([Description]) from @Rules where [Description]='INVWriteOff') > 0)
				UNION
				--Table3: ReturnToVendor
					SELECT CONVERT(DATE,rv.CreatedOn) as 'TransactionDate'
					FROM INV_TXN_ReturnToVendorItems rv 
					WHERE (rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
					AND (CONVERT(DATE, rv.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
					AND ((select count([Description]) from @Rules where [Description]='INVReturnToVendorCashGR' OR [Description]='INVReturnToVendorCreditGR') > 0)
			   UNION
			   --Table4: DispatchToDept

					SELECT CONVERT(DATE,wardTxn.TransactionDate) AS 'TransactionDate'				
					FROM WARD_INV_Transaction wardTxn JOIN INV_MST_Item itm on wardTxn.ItemId=itm.ItemId
					WHERE (wardTxn.IsTransferToAcc IS NULL OR wardTxn.IsTransferToAcc =0) 
					AND wardTxn.TransactionType='dispatched-items' AND itm.ItemType='consumables'
					AND (convert(date, wardTxn.TransactionDate) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
					AND ((select count([Description]) from @Rules where [Description]='INVDispatchToDept') > 0)	
			   UNION
				-- Table 5 :INVDeptConsumedGoods
					SELECT CONVERT(DATE,wardTxn.TransactionDate) as 'TransactionDate'
					FROM WARD_INV_Transaction wardTxn
					JOIN INV_MST_Item itm on wardTxn.ItemId= itm.ItemId					
					WHERE (wardTxn.IsTransferToAcc IS NULL OR wardTxn.IsTransferToAcc=0)  
					AND wardTxn.TransactionType='consumption-items' AND itm.ItemType='consumables'
					AND (CONVERT(DATE, wardTxn.TransactionDate) BETWEEN  CONVERT(DATE, @FromDate) AND  CONVERT(DATE, @ToDate))	
					AND ((select count([Description]) from @Rules where [Description]='INVDeptConsumedGoods') > 0)
			   UNION
			   -- Table 6 :INVStockManageOut	
					---StockManage-Out from MainStore---
					SELECT X.TransactionDate
					FROM (
							SELECT CONVERT(DATE,StkTxn.TransactionDate) as 'TransactionDate'
							FROM INV_TXN_StockTransaction StkTxn
							JOIN INV_MST_Item itm on StkTxn.ItemId= itm.ItemId
							JOIN INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId						
							WHERE (StkTxn.IsTransferredToACC IS NULL OR StkTxn.IsTransferredToACC=0)  
							AND StkTxn.TransactionType in ('fy-managed-items','stockmanaged-items') and InOut='out'
							AND ((CONVERT(DATE, StkTxn.TransactionDate) between CONVERT(DATE, @FromDate) AND  CONVERT(DATE, @ToDate) )) 
							AND itm.ItemType='consumables'
							---StockManage-Out from SubStore---
							UNION
							SELECT CONVERT(DATE,wardTxn.TransactionDate) as 'TransactionDate'
							FROM WARD_INV_Transaction wardTxn
							JOIN INV_MST_Item itm on wardTxn.ItemId= itm.ItemId
							JOIN INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId						
							WHERE (wardTxn.IsTransferToAcc IS NULL OR wardTxn.IsTransferToAcc=0)  
							AND wardTxn.TransactionType in ('fy-stock-manage') and InOut='out'
							AND ((CONVERT(DATE, wardTxn.TransactionDate) between CONVERT(DATE, @FromDate) AND  CONVERT(DATE, @ToDate) )) 	
							AND itm.ItemType='consumables'
						) AS X		
						WHERE (select count([Description]) from @Rules where [Description]='INVStockManageOut') > 0

			END
			---------------- 			
			IF(@SectionId=2) -- Billing Section
			BEGIN
				IF((select top 1 CONVERT(bit, ParameterValue) from CORE_CFG_Parameters where ParameterGroupName='accounting'and ParameterName='GetBillingFromSyncTable')=1) 
					BEGIN 
						SELECT CONVERT(date, TransactionDate) as 'TransactionDate'
						FROM BIL_SYNC_BillingAccounting 
						WHERE IsTransferedToAcc IS NULL AND CONVERT(date, TransactionDate) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
					END

				ELSE
					BEGIN 
						--Cash Bill--
							SELECT CONVERT(date, itm.PaidDate) as 'TransactionDate'  
							FROM BIL_TXN_BillingTransactionItems itm, BIL_TXN_BillingTransaction txn
							WHERE txn.BillingTransactionId = itm.BillingTransactionId
							AND Convert(Date,itm.PaidDate) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
							AND itm.BillingTransactionId IS NOT NULL
							AND ( txn.PaymentMode='cash' OR txn.PaymentMode='card' OR txn.PaymentMode='cheque')
							AND ISNULL(itm.IsCashBillSync,0) = 0  
							AND ((select count([Description]) from @Rules where [Description]='CashBill') > 0)
						UNION 			
						--Credit Bill--
							Select CONVERT(date, itm.CreatedOn) as 'TransactionDate'
							from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
							Where txn.BillingTransactionId = itm.BillingTransactionId
							AND Convert(Date,itm.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
							and itm.BillingTransactionId IS NOT NULL
							and txn.PaymentMode='credit'
							AND ISNULL(itm.IsCreditBillSync,0) = 0  
							AND ((select count([Description]) from @Rules where [Description]='CreditBill') > 0)

						UNION 
			
						--Cash Bill Return--
							Select	CONVERT(date, ret.CreatedOn) as 'TransactionDate'
							from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
							Where txn.BillingTransactionId = itm.BillingTransactionId
							AND ret.BillingTransactionId=txn.BillingTransactionId
							AND Convert(Date,ret.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
							AND ISNULL(itm.ReturnStatus,0) != 0  
							AND itm.BillingTransactionId IS NOT NULL
							AND  ( txn.PaymentMode='cash' OR txn.PaymentMode='card' OR txn.PaymentMode='cheque') 
							AND ISNULL(itm.IsCashBillReturnSync,0) = 0 
							AND ((select count([Description]) from @Rules where [Description]='CashBill') > 0) 
						UNION 
			
						--CreditBillReturn--
							Select CONVERT(date, ret.CreatedOn) as 'TransactionDate'
							from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
							Where txn.BillingTransactionId = itm.BillingTransactionId
							AND ret.BillingTransactionId=txn.BillingTransactionId
							AND CONVERT(Date,ret.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
							AND ISNULL(itm.ReturnStatus,0) != 0  -- take only returned items..
							AND itm.BillingTransactionId IS NOT NULL
							AND txn.PaymentMode='credit'
							AND ISNULL(itm.IsCreditBillReturnSync,0) = 0  
							AND ((select count([Description]) from @Rules where [Description]='CreditBillReturn') > 0)
						UNION 
			
						--Deposit Add--
							Select	CONVERT(date, CreatedOn) as 'TransactionDate'
							from BIL_TXN_Deposit
							Where CONVERT(Date,CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
							and DepositType ='Deposit'AND ISNULL(IsDepositSync,0) = 0 
							AND ((select count([Description]) from @Rules where [Description]='DepositAdd') > 0)
						UNION 
			
						--Deposit Return/Deduct--
							Select	CONVERT(date, CreatedOn) as 'TransactionDate'
							from BIL_TXN_Deposit
							Where CONVERT(Date,CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
							AND DepositType IN ('ReturnDeposit', 'depositdeduct') AND ISNULL(IsDepositSync,0) = 0  	
							AND ((select count([Description]) from @Rules where [Description]='DepositReturn') > 0)	
			
					END
			END
			----------------
			IF(@SectionId=3) -- Pharmacy Section			
			BEGIN
				--Table1: CashInvoice
					SELECT CONVERT(DATE, inv.CreateOn) AS 'TransactionDate' 
					FROM PHRM_TXN_Invoice inv 
					WHERE inv.IsTransferredToACC IS NULL 
					AND CONVERT(DATE, inv.CreateOn)BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate) 
					AND ((select count([Description]) from @Rules where [Description]='PHRMCreditInvoice1'OR [Description]='PHRMCashInvoice1') > 0)
				UNION
				--Table3: CashInvoiceReturn
					SELECT CONVERT(DATE, CreatedOn) AS 'TransactionDate' 
					FROM  PHRM_TXN_InvoiceReturnItems invRet 
					WHERE invRet.IsTransferredToACC IS NULL 
					AND CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate) 
					AND ((select count([Description]) from @Rules where [Description]='PHRMCreditInvoiceReturn1'OR [Description]='PHRMCashInvoiceReturn1') > 0)
				UNION
				--Table4: goodsReceipt
					SELECT CONVERT(DATE, CreatedOn) AS 'TransactionDate' 
					FROM PHRM_GoodsReceipt gr 
					WHERE gr.IsTransferredToACC IS NULL 
					AND gr.IsCancel=0  AND CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate) 					
					AND ((select count([Description]) from @Rules where [Description]='PHRMCreditGoodReceipt'OR [Description]='PHRMCashGoodReceipt') > 0)
				UNION
				--Table5: writeoff
					SELECT CONVERT(DATE, CreatedOn) AS 'TransactionDate' 
					FROM PHRM_WriteOff wrOff 
					WHERE wrOff.IsTransferredToACC IS NULL 
					AND CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate)  
					AND ((select count([Description]) from @Rules where [Description]='PHRMWriteOff') > 0)
				UNION
				--Table6: dispatchToDept && dispatchToDeptRet
					SELECT CONVERT(DATE,CreatedOn) AS 'TransactionDate' 
					FROM PHRM_StockTxnItems stkItm 
					WHERE stkItm.IsTransferredToACC IS NULL 
					AND  CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate) 
					AND ((select count([Description]) from @Rules where [Description]='PHRMDispatchToDept'OR [Description]='PHRMDispatchToDeptReturn') > 0)
  

		
			END
			---------------- 
			IF(@SectionId=5) -- Incetives Section
			BEGIN
				SELECT CONVERT(DATE, TransactionDate) AS 'TransactionDate'
				FROM INCTV_TXN_IncentiveFractionItem outerTbl 
				WHERE Convert(DATE,outerTbl.TransactionDate) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate) 
				AND ISNULL(IsTransferToAcc,0) = 0 AND ISNULL(outerTbl.IsActive,0) = 1
				AND ((select count([Description]) from @Rules where [Description]='ConsultantIncentive') > 0)
				GROUP BY Convert(DATE, TransactionDate)				
			END
  		END			
	END
GO
-- END: VIKAS: 30-Sep-2020: dates mismatch from tables correction.

---start: Sud: 1-Oct'20--Incentive--
Update RBAC_RouteConfig
set IsActive=0
WHERE UrlFullPath IN ('Incentive/Setting/ProfileManage','Incentive/Setting/EmployeeProfileMap')
GO
---end: Sud: 1-Oct'20--Incentive--


-- START : VIKAS: 1-Oct-2020: Correction for storeName, price column. 
ALTER PROCEDURE [dbo].[SP_Report_INV_CurrentStockItemDetails_By_StoreId] 
@StoreIds NVARCHAR(400) = '', @ItemId INT=null  
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Nagesh/19 Sep 2020			 updated script for available quantity column
2		NageshBB/22 sep 2020		 exclued items which available quantity is 0 and added storename column
3. 		Vikas/1-Oct-2020 			 Added missed column storeName and Price.
---------------------------------------------------------------------
*/
DECLARE @mainStoreId INT=null;
SET @mainStoreId = (select StoreId from PHRM_MST_Store where [Name]='Main Store')	

IF(@mainStoreId IN (SELECT DISTINCT(value) FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> ''))

BEGIN
	SELECT 
	X.GoodsReceiptNo,
	GoodsReceiptDate,
	x.Quantity,
	X.Price,
	X.AvailableQuantity,
	X.StoreName
	FROM (
			select 

			gr.GoodsReceiptDate, 
			gr.GoodsReceiptNo,
			stk.AvailableQuantity,
			gritm.ReceivedQuantity+gritm.FreeQuantity Quantity ,
			stk.Price,
			'Main Store' as StoreName
		from INV_TXN_Stock stk
			join INV_TXN_GoodsReceiptItems gritm on stk.GoodsReceiptItemId = gritm.GoodsReceiptItemId
			join INV_TXN_GoodsReceipt gr on gritm.GoodsReceiptId = gr.GoodsReceiptID			
		where stk.ItemId=@ItemId and stk.AvailableQuantity>0
		UNION 
		SELECT 
			gr.GoodsReceiptDate, 
			gr.GoodsReceiptNo,
			stk.AvailableQuantity,
			gritm.ReceivedQuantity+gritm.FreeQuantity,
			stk.Price,
			store.Name as StoreName			
		FROM WARD_INV_Stock stk
			join INV_TXN_GoodsReceiptItems gritm on stk.GoodsReceiptItemId = gritm.GoodsReceiptItemId
			join INV_TXN_GoodsReceipt gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
			join PHRM_MST_Store store on store.StoreId =stk.StoreId
		WHERE  stk.AvailableQuantity>0 AND 
		  stk.ItemId=@ItemId AND stk.StoreId IN (SELECT DISTINCT(value) FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> '')

		) as X
		
GROUP BY GoodsReceiptDate,X.GoodsReceiptNo,X.Price,x.Quantity,x.AvailableQuantity,x.StoreName
	order by x.StoreName,convert(date,x.GoodsReceiptDate)
END

ELSE
	BEGIN
		SELECT 
			gr.GoodsReceiptDate, 
			gr.GoodsReceiptNo,
			stk.AvailableQuantity,
			(gritm.ReceivedQuantity)+ (gritm.FreeQuantity) as Quantity,
			stk.Price,
			store.Name as StoreName
		FROM WARD_INV_Stock stk
			join INV_TXN_GoodsReceiptItems gritm on stk.GoodsReceiptItemId = gritm.GoodsReceiptItemId
			join INV_TXN_GoodsReceipt gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
			join PHRM_MST_Store store on store.StoreId =stk.StoreId
		WHERE  stk.AvailableQuantity>0 AND 
		stk.ItemId=@ItemId AND stk.StoreId IN (SELECT DISTINCT(value) FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> '')
		GROUP BY GoodsReceiptDate,gr.GoodsReceiptNo,stk.Price,gritm.ReceivedQuantity,gritm.FreeQuantity,stk.AvailableQuantity,store.Name
	    order by store.Name, convert(date,gr.GoodsReceiptDate)
	END
Go
-- END : VIKAS: 1-Oct-2020: Correction for storeName, price column. 
---Start: Anjana:2020/10/02: Hide unused reports from the billing reports list--------
Update RBAC_RouteConfig
Set IsActive = 0
Where UrlFullPath 
IN('Reports/BillingMain/DoctorRevenue',
	'Reports/BillingMain/DoctorReport',
	'Reports/BillingMain/PatientBillHistory',
	'Reports/BillingMain/DailyAppointmentReport',
	'Reports/BillingMain/TotalAdmittedPatient',
	'Reports/BillingMain/DepartmentSalesDaybook',
	'Reports/BillingMain/PackageSales',
	'Reports/BillingMain/CustomReport',
	'Reports/BillingMain/DischargedPatient',
	'Reports/BillingMain/Denomination',
	'Reports/BillingMain/DoctorReferral',
	'Reports/BillingMain/DepartmentRevenue',
	'Reports/BillingMain/PatientNeighbourhoodCardDetails')
Go
---End: Anjana:2020/10/02: Hide unused reports from the billing reports list--------	

--start: sud: 05-Oct'20--Billing reports etc..--

--correction on earlier script by anjana.. 
Update RBAC_RouteConfig
SET UrlFullPath='Reports/BillingMain/DepartmentRevenue', IsActive=0
WHERE UrlFullPath='Reports/BillingMain/DepartmentRevenueReport'
GO
--hide database-audit page-- we have another page (audit trail for that)
Update RBAC_RouteConfig
SET IsActive=0
WHERE UrlFullPath='SystemAdmin/DatabaseAudit'
GO

ALTER PROCEDURE [dbo].[SP_Report_Deposit_Balance]   
    
AS
/*
FileName: [SP_Report_Deposit_Balance]
CreatedBy/date: dinesh/2017-07-19
Description: To get the deposit Balance of the Patient
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Umed/2017-05-25                     created the script
2       Umed/2018-04-23                  Apply Round Off on Deposit Balance Because During Export it Dont Require
3.     Ramavtar/2018-06-05              change the whole SP.. bring deposit amount of patients
4.     Narayan/2019-09-16               added  DepositId column.
5.     Arpan/Shankar/2020-03-24         deduct both depositdeduct and returndeposit from deposit
6.     Sud/5-oct-2020                   Adding PhoneNumber to deposit balance report
--------------------------------------------------------
*/
BEGIN
select ROW_NUMBER() over(order by DepositId desc)  as SN
        ,Deposit.PatientId
		,P.PatientCode
		,p.PhoneNumber
		,p.ShortName 'PatientName'
		,Deposit.DepositBalance
		,DepositId
from (
	  select PatientId,DepositId,(Deposit-(depositdeduct+ReturnDeposit)) as DepositBalance from
	  (
			select PatientId
			,sum(case when d.DepositType = 'Deposit' then ISNULL(d.Amount,0) else 0 end) as 'Deposit'
			,sum(case when d.DepositType = 'depositdeduct' then ISNULL(d.Amount,0) else 0 end) as 'depositdeduct'
			,sum(case when d.DepositType = 'ReturnDeposit' then ISNULL(d.Amount,0) else 0 end) as 'ReturnDeposit'
			,Max(d.DepositId) as 'DepositId'
			from BIL_TXN_Deposit as d
			group by d.PatientId
	  ) as a
	   where (Deposit-(depositdeduct+ReturnDeposit)) > 0) 
Deposit
join
PAT_Patient as P
on
Deposit.PatientId = P.PatientId

END
GO

--end: sud: 05-Oct'20--Billing reports etc..--

-- START:VIKAS:5th Oct 2020: Added GoodsReceipt No. for remarks.

/****** Object:  StoredProcedure [dbo].[SP_ACC_GetInventoryTransactions]    Script Date: 05-10-2020 20:50:57 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_ACC_GetInventoryTransactions]			
@TransactionDate DATE, @HospitalId INT
AS
--EXEC [dbo].[SP_ACC_GetInventoryTransactions] @TransactionDate = '2020-05-06 07:49:19.017' , @HospitalId=3

/************************************************************************
FileName: [SP_ACC_GetInventoryTransactions]
CreatedBy/date: Ajay/05Jul'19
Description: getting records of inventory transactions for accounting
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1       Ajay/05Jul'19						created the script
2.		Vikas / 01-Jun-2020					update table 1 data -> exculde 'Capital Goods' Item type from table1
3.		NageshBB 23 Jul 2020				replaced createdOn by GoodsReceiptDate column
4.		Vikas 11th Aug 2020					replaced parameter @FromDate and @ToDate into @TransactionDate
5.      Sud:11Aug'20                        Date changed to GoodsReceiptDate. Voucher should be created on this date.
6.		NageshBB: 12Aug2020					Changes for get Consumed and dispatched items for accounting
											Now dispatch and consumption records taking from WARD_INV_Transaction table
7.		NageshBB: 19Aug2020					changes for inventory Consumption TotalAmount ,new tranfer rule which record get for StockManageOut
											, exclude cancel good receipt
8.		NageshBB: 20Aug2020					StockManageOut transaction get only on fiscal Year END date
9.      Vikas: 5th Oct 2020				    Added GoodsReceiptNo for remarks.
*************************************************************************/
BEGIN
	Declare @FYStartDate datetime=(select top 1 StartDate from ACC_MST_FiscalYears where convert(date,@TransactionDate)
	between convert(date,Startdate) and convert(date,EndDate)),
	@FYEndDate datetime=(select top 1 EndDate from ACC_MST_FiscalYears where convert(date,@TransactionDate)
	between convert(date,Startdate) and convert(date,EndDate))
	--Table1: GoodReceipt
		SELECT 
			--gr.CreatedOn,
			gr.GoodsReceiptDate as 'CreatedOn',
			v.VendorName,
			gr.VendorId,
			 gr.PaymentMode,
			 itm.ItemCategoryId,
			 itm.ItemType,
			 itm.ItemName,
			 gr.TDSAmount,
			 gr.BillNo,									-- 26 March 2020:Vikas: added for invetory integration, mapping with accounting as per charak requirements.
			 gr.GoodsReceiptID,							-- 30 march 2020:Vikas: added GoodsReceiptID column
			 gritm.*,
			 gr.GoodsReceiptNo							-- 5th Oct 2020: Vikas: Added GoodsReceiptNo for remarks.
		FROM
			INV_TXN_GoodsReceipt gr 
			join INV_TXN_GoodsReceiptItems gritm on gr.GoodsReceiptID = gritm.GoodsReceiptId
			JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
			join INV_MST_Item itm on gritm.ItemId = itm.ItemId
		WHERE
			(gritm.IsTransferredToACC IS NULL OR gritm.IsTransferredToACC = 0) 
			---sud:11Aug'20--changed to gr.GoodsReceiptDate from gr.CreatedOn
			AND (CONVERT(DATE, gr.GoodsReceiptDate)= CONVERT(DATE, @TransactionDate))  -- BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
			AND itm.ItemType !='Capital Goods' and gr.IsCancel!=1 --excluded cancel gr	
	--Table2: WriteOffItems
		SELECT * 
		FROM
			INV_TXN_WriteOffItems 
		WHERE
			(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
			AND (CONVERT(DATE, CreatedOn)= CONVERT(DATE, @TransactionDate))-- BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
	--Table3: ReturnToVendor
		SELECT
			rv.*, 
			v.VendorName, 
			gr.PaymentMode 
		FROM
			INV_TXN_ReturnToVendorItems rv 
			JOIN INV_MST_Vendor v ON rv.VendorId = v.VendorId 
			JOIN INV_TXN_GoodsReceipt gr ON rv.GoodsReceiptId = gr.GoodsReceiptID 
		WHERE
			(rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
			AND (CONVERT(DATE, rv.CreatedOn)= CONVERT(DATE, @TransactionDate))-- BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
	
	--Table4: DispatchToDept
	--NageshBB: 12Aug2020: changed table name for get dispatched records StockTransaction to WARD_INV_Transaction						
			Select 
			wardTxn.TransactionId,
			CreatedOn=convert(date, wardTxn.TransactionDate),
			TransactionType='INVDispatchToDept',					
			wardTxn.Price, 
			wardTxn.Quantity					
			from WARD_INV_Transaction wardTxn join INV_MST_Item itm 
			on wardTxn.ItemId=itm.ItemId
			where (wardTxn.IsTransferToAcc IS NULL OR wardTxn.IsTransferToAcc =0) 
			AND wardTxn.TransactionType='dispatched-items' AND itm.ItemType='consumables'
			and (convert(date, wardTxn.TransactionDate)= convert(date, @TransactionDate))	
			
	-- Table 5 :INVDeptConsumedGoods
	--NageshBB: 12Aug2020: changed table name for get consumed records. WARD_INV_Consumption to WARD_INV_Transaction
		SELECT 
				wardTxn.TransactionId,
				sb.SubCategoryId,
				sb.SubCategoryName,   
				CreatedOn=convert(date,wardTxn.TransactionDate),											
				TotalAmount= wardTxn.Quantity * wardTxn.Price
			FROM WARD_INV_Transaction wardTxn
				join INV_MST_Item itm on wardTxn.ItemId= itm.ItemId
				join INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId						
			WHERE (wardTxn.IsTransferToAcc IS NULL OR wardTxn.IsTransferToAcc=0)  
			AND wardTxn.TransactionType='consumption-items' AND itm.ItemType='consumables'
		    AND (CONVERT(DATE, wardTxn.TransactionDate)= CONVERT(DATE, @TransactionDate))	
		
		-- Table 6 :INVStockManageOut	
		--NageshBB: asper discussion we need single voucher for whole year txn items 
		--so here we will get data as per fiscal year enddate and transaction date will be fiscal year end date		
		--Declare @TransactionDate datetime='2020-05-13 12:59:22.307'

		---StockManage-Out from MainStore---
		SELECT 
					0 'TransactionId',
					StkTxn.StockTxnId,
					sb.SubCategoryId,
					sb.SubCategoryName, 
					TransactionType='INVStockManageOut',
					CreatedOn=  convert(date,@FYEndDate),											
					TotalAmount= StkTxn.Quantity * StkTxn.Price
			FROM INV_TXN_StockTransaction StkTxn
					join INV_MST_Item itm on StkTxn.ItemId= itm.ItemId
					join INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId						
				WHERE (StkTxn.IsTransferredToACC IS NULL OR StkTxn.IsTransferredToACC=0)  
				AND StkTxn.TransactionType in ('fy-managed-items','stockmanaged-items') and InOut='out'
			    AND ((CONVERT(DATE, StkTxn.TransactionDate) between CONVERT(DATE, @FYStartDate) and CONVERT(DATE, @FYEndDate) )) 
				AND convert(date,@FYEndDate)=convert(date,@TransactionDate)
				AND itm.ItemType='consumables'
		---StockManage-Out from SubStore---
		--temp update date '2020-08-09 07:49:19.017' to '2020-08-09 07:49:19.017'
		--update WARD_INV_Transaction set TransactionDate='2020-05-06 07:49:19.017'
		--where TransactionType in ('fy-stock-manage') and InOut='out'
		union
		SELECT 
					wardTxn.TransactionId,
					0  'StockTxnId',
					sb.SubCategoryId,
					sb.SubCategoryName,  
					TransactionType='INVStockManageOut',
					CreatedOn= convert(date,@FYEndDate),											
					TotalAmount= wardTxn.Quantity * wardTxn.Price
				FROM WARD_INV_Transaction wardTxn
					join INV_MST_Item itm on wardTxn.ItemId= itm.ItemId
					join INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId						
				WHERE (wardTxn.IsTransferToAcc IS NULL OR wardTxn.IsTransferToAcc=0)  
				AND wardTxn.TransactionType in ('fy-stock-manage') and InOut='out'
			    AND ((CONVERT(DATE, wardTxn.TransactionDate) between CONVERT(DATE, @FYStartDate) and CONVERT(DATE, @FYEndDate) )) 					
				AND convert(date,@FYEndDate)=convert(date,@TransactionDate)
				AND itm.ItemType='consumables'
END

GO
-- END:VIKAS:5th Oct 2020: Added GoodsReceipt No. for remarks.----


---Merged from Lab Government Branch on 6 OCt 2020: STart-------------
---Anish: 27 Aug Start---

-----DisplayName[to display in report],InnerTestGroupName[testname if multiple inner component]-----
CREATE TABLE Lab_Mst_Gov_Report_Items(
	ReportItemId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ItemId_Of_TestName_In_Lab_GovReport PRIMARY KEY,
	SerialNumber INT,
	TestName VARCHAR(50),
	GroupName VARCHAR(50),
	DisplayName VARCHAR(50),
	HasInnerItems BIT null,
	InnerTestGroupName VARCHAR(50)
);
GO

---LabItemId[may be testId or ComponentId], IsComponentBased[by default search for testName], PositiveIndicator[works if IsComponentBased is true] ----
---IF IsResultCount is False then use total count else use Indicator----
CREATE TABLE Lab_Gov_Report_Mapping(
	ReportMapId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_MapID_Lab_Gov_TestReport PRIMARY KEY,
	ReportItemId INT,
	LabItemId INT NULL,
	IsActive BIT,
	IsComponentBased BIT null,
	ComponentName varchar(80),
	IsResultCount BIT null,
	PositiveIndicator VARCHAR(50)
);
GO

ALTER TABLE Lab_Gov_Report_Mapping  WITH CHECK ADD  CONSTRAINT [FK_LAB_Gov_ReportMapping_Gov_Report_Items] FOREIGN KEY([ReportItemId])
REFERENCES [dbo].[Lab_Mst_Gov_Report_Items] ([ReportItemId])
GO

ALTER TABLE Lab_Mst_Gov_Report_Items 
ADD CONSTRAINT Unique_Gov_Lab_ReportItem_Name UNIQUE(TestName), 
CONSTRAINT Unique_Gov_Lab_ReportItem_SerialNumber UNIQUE(SerialNumber)
GO



/****** Object:  StoredProcedure [dbo].[SP_LAB_TestCount_GovernmentReport]    Script Date: 8/27/2020 11:32:17 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<ANish Bhattarai>
-- Create date: <27 August 2020>
-- Description:	<Get the count of each test of Government Lab Report>
-- =============================================
CREATE PROCEDURE [dbo].[SP_LAB_TestCount_GovernmentReport] 
( @FromDate DATETIME = NULL,
      @ToDate DATETIME = NULL)
AS
BEGIN
	
---Case 1: Is Items are Testbased i.e.NOT Component Based(IsComponentBased == false)----
(Select masterData.SerialNumber,masterData.GroupName,masterData.TestName,masterData.DisplayName,masterData.HasInnerItems,masterData.InnerTestGroupName,Count(*) as 'Total' from 
(select LabItemId,IsComponentBased,PositiveIndicator,IsResultCount,SerialNumber,TestName,GroupName,DisplayName,HasInnerItems,InnerTestGroupName 
from Lab_Gov_Report_Mapping map join Lab_Mst_Gov_Report_Items item 
on map.ReportItemId=item.ReportItemId where map.IsComponentBased=0 and map.IsActive=1 and map.IsResultCount=1) 
masterData
join LAB_TestRequisition req on req.LabTestId=masterData.LabItemId where req.IsActive=1 and Convert(date,req.OrderDateTime) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
and (req.BillingStatus NOT IN ('returned','cancel')) 
group by masterData.SerialNumber,masterData.TestName,masterData.GroupName,masterData.DisplayName,masterData.HasInnerItems,masterData.InnerTestGroupName
)
UNION
---Case 2: Is Items are Component Based and IsResultCount<>0----
(Select masterData.SerialNumber,masterData.GroupName,masterData.TestName,masterData.DisplayName,masterData.HasInnerItems,masterData.InnerTestGroupName,Count(*) as 'Total' from 
(select LabItemId,IsComponentBased,PositiveIndicator,IsResultCount,SerialNumber,TestName,GroupName,DisplayName,HasInnerItems,InnerTestGroupName,ComponentName,ReportMapId,map.ReportItemId
from Lab_Gov_Report_Mapping map join Lab_Mst_Gov_Report_Items item 
on map.ReportItemId=item.ReportItemId where map.IsComponentBased=1 and map.IsActive=1 and map.IsResultCount=1) masterData
join (select res.RequisitionId,res.ComponentName,res.Value,res.LabTestId from LAB_TXN_TestComponentResult res 
join LAB_TestRequisition req on res.RequisitionId=req.RequisitionId
where res.IsActive=1 and Convert(date,req.OrderDateTime) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) and req.BillingStatus NOT IN ('returned','cancel')) labData
on LTRIM(RTRIM((LOWER(labData.ComponentName))))=LTRIM(RTRIM((LOWER(masterData.ComponentName)))) 
where LabTestId NOT IN (Select mapinner.LabItemId from Lab_Gov_Report_Mapping mapinner where (mapinner.ReportMapId<>masterData.ReportMapId) and (mapinner.ReportItemId=masterData.ReportItemId))
group by masterData.SerialNumber,masterData.TestName,masterData.GroupName,masterData.DisplayName,masterData.HasInnerItems,masterData.InnerTestGroupName
)
UNION
---Case 3: Is Items are Component Based and IsResultCount=0----
(Select masterData.SerialNumber,masterData.GroupName,masterData.TestName,masterData.DisplayName,masterData.HasInnerItems,masterData.InnerTestGroupName,Count(*) as 'Total' from 
(select LabItemId,IsComponentBased,PositiveIndicator,IsResultCount,SerialNumber,TestName,GroupName,DisplayName,HasInnerItems,InnerTestGroupName,ComponentName 
from Lab_Gov_Report_Mapping map join Lab_Mst_Gov_Report_Items item 
on map.ReportItemId=item.ReportItemId where map.IsComponentBased=1 and map.IsActive=1 and map.IsResultCount=0 and map.PositiveIndicator IS NOT NULL) 
masterData
join (select res.RequisitionId,res.ComponentName,res.Value,res.LabTestId from LAB_TXN_TestComponentResult res 
join LAB_TestRequisition req on res.RequisitionId=req.RequisitionId
where res.IsActive=1 and Convert(date,req.OrderDateTime) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) and req.BillingStatus NOT IN ('returned','cancel')) labData
on LTRIM(RTRIM((LOWER(labData.ComponentName))))=LTRIM(RTRIM((LOWER(masterData.ComponentName)))) and LTRIM(RTRIM((LOWER(labData.Value))))=LTRIM(RTRIM((LOWER(masterData.PositiveIndicator))))
group by masterData.SerialNumber,masterData.TestName,masterData.GroupName,masterData.DisplayName,masterData.HasInnerItems,masterData.InnerTestGroupName
)
END
GO

Update CORE_CFG_Parameters
set ValueDataType='arrayobj' where ParameterName IN ('OrderStatusSettingB4Discharge','CancellationRules')
Go
---Anish: 27 Aug END---



---Anish: 2 Sept Start-----
----Note make SerialNumber NOT NULL----
Insert Into Lab_Mst_Gov_Report_Items (SerialNumber,TestName,GroupName,DisplayName,HasInnerItems,InnerTestGroupName) 
Values 
(1,'Hb','Hematology','Hb',0,null),
(2,'RBC Count','Hematology','RBC Count',0,null),
(3,'TLC','Hematology','TLC',0,null),
(4,'Platelets Count','Hematology','Platelets Count',0,null),
(5,'DLC','Hematology','DLC',0,null),
(6,'ESR','Hematology','ESR',0,null),
(7,'PCV/Hct','Hematology','PCV/Hct',0,null),
(8,'MCV','Hematology','MCV',0,null),
(9,'MCH','Hematology','MCH',0,null),
(10,'MCHC','Hematology','MCHC',0,null),
(11,'RDW','Hematology','RDW',0,null),
(12,'Blood Group And Rh Type','Hematology','Blood Group & Rh Type',0,null),
(13,'Coombs test','Hematology','Coombs test',0,null),
(14,'Retics','Hematology','Retics',0,null),
(15,'PBS/PBF','Hematology','PBS/PBF',0,null),
(16,'HbA1c','Hematology','HbA1c',0,null),
(17,'SpecialStainMPO','Hematology','MPO',1,'Special Stain'),
(18,'SpecialStainPAS','Hematology','PAS',1,'Special Stain'),
(19,'Sickling Test','Hematology','Sickling Test',0,null),
(20,'Urine for Hemosiderin','Hematology','Urine for Hemosiderin',0,null),
(21,'BT','Hematology','BT',0,null),
(22,'CT','Hematology','CT',0,null),
(23,'PT-INR','Hematology','PT-INR',0,null),
(24,'APTT','Hematology','APTT',0,null),
(25,'Bone Marrow Analysis','Hematology','Bone Marrow Analysis',0,null),
(26,'Aldehyde test','Hematology','Aldehyde test',0,null),
(27,'MP Total','Hematology','MP Total',0,null),
(28,'Smear MP Pos_PF','Hematology','PF',1,'Smear MP Pos'),
(29,'Smear MP Pos_PV','Hematology','PV',1,'Smear MP Pos'),
(30,'Smear MP Pos_PMIX','Hematology','P- MIX',1,'Smear MP Pos'),
(31,'MF_Total','Hematology','Total',1,'MF'),
(32,'MF_Pos','Hematology','Pos.',1,'MF'),
(33,'LD Bodies','Hematology','LD Bodies',0,null),
(34,'Hb Electrophoresis','Hematology','Electrophoresis',0,null),
(35,'LE cell','Hematology','LE cell',0,null),
(36,'ALC','Hematology','PV',0,null),
(37,'AEC','Hematology','AEC',0,null),
(38,'FDP','Hematology','FDP',0,null),
(39,'D-dimer','Hematology','D-dimer',0,null),
(40,'Fac VIII','Hematology','Fac VIII',0,null),
(41,'Fac IX','Hematology','Fac IX',0,null),
(42,'HematologyOthers','Hematology','Others',0,null),
(43,'Pregnancy Test','Immunology','Pregnancy Test(UPT)',0,null),
(44,'ASO','Immunology','ASO',0,null),
(45,'CRP','Immunology','CRP',0,null),
(46,'RA Factor','Immunology','RA Factor',0,null),
(47,'TPHA Total','Immunology','Total',1,'TPHA'),
(48,'TPHA Positive','Immunology','+ve',1,'TPHA'),
(49,'ANA','Immunology','ANA',0,null),
(50,'Anti-dsDNA','Immunology','Anti-dsDNA',0,null),
(51,'RPR/VDRL_Total','Immunology','Total',1,'RPR/VDRL'),
(52,'RPR/VDRL_Positive','Immunology','+ve',1,'RPR/VDRL'),
(53,'CEA','Immunology','CEA',0,null),
(54,'CA-125','Immunology','CA-125',0,null),
(55,'CA-19.9','Immunology','CA-19.9',0,null),
(56,'CA-15.3','Immunology','CA-15.3',0,null),
(57,'Toxo','Immunology','Toxo',0,null),
(58,'Rubella','Immunology','Rubella',0,null),
(59,'CMV','Immunology','CMV',0,null),
(60,'HSV','Immunology','HSV',0,null),
(61,'Measles','Immunology','Measles',0,null),
(62,'Echinococcus','Immunology','Echinococcus',0,null),
(63,'Amoebiasis','Immunology','Amoebiasis',0,null),
(64,'PSA','Immunology','PSA',0,null),
(65,'Ferritin','Immunology','Ferritin',0,null),
(66,'Cysticercosis','Immunology','Cysticercosis',0,null),
(67,'Brucella','Immunology','Brucella',0,null),
(68,'Thyroglobulin','Immunology','Thyroglobulin',0,null),
(69,'Anti TPO','Immunology','Anti TPO',0,null),
(70,'Protein Electrophoresis','Immunology','Protein Electrophoresis',0,null),
(71,'Anti-CCP','Immunology','Anti-CCP',0,null),
(72,'RK-29Total','Immunology','Total',1,'RK-39'),
(73,'RK-29Positive','Immunology','+Ve',1,'RK-39'),
(74,'JE Total','Immunology','Total.',1,'JE'),
(75,'JE Posiive','Immunology','+Ve',1,'JE'),
(76,'Dengue Total','Immunology','Total',1,'Dengue'),
(77,'Dengue Positive','Immunology','+Ve',1,'Dengue'),
(78,'RapidMP Total','Immunology','Total',1,'Rapid MP test'),
(79,'RapidMP Positive PV','Immunology','+Ve PV',1,'Rapid MP test'),
(80,'RapidMP Positive PF','Immunology','+Ve PF',1,'Rapid MP test'),
(81,'Mantoux test','Immunology','Mantoux test',0,null),
(82,'Chikungunya Total','Immunology','Total',1,'Chikungunya'),
(83,'Chikungunya Positive','Immunology','P+ve',1,'Chikungunya'),
(84,'Scrub Typhus Total','Immunology','Total',1,'Scrub Typhus'),
(85,'H Pylori','Immunology','H. Pylori',0,null),
(86,'Leptospira','Immunology','Leptospira',0,null),
(87,'ImmunologyOthers','Immunology','Others',0,null),
(88,'Sugar','Biochemistry','Sugar',0,null),
(89,'Blood Urea','Biochemistry','Blood Urea',0,null),
(90,'Creatinine','Biochemistry','Creatinine',0,null),
(91,'Sodium','Biochemistry','Sodium (Na)',0,null),
(92,'Potassium','Biochemistry','Potassium (K)',0,null),
(93,'Calcium','Biochemistry','Calcium',0,null),
(94,'Phosphorus','Biochemistry','Phosphorus',0,null),
(95,'Magnesium','Biochemistry','Magnesium',0,null),
(96,'Uric acid','Biochemistry','Uric acid',0,null),
(97,'Total Cholestrol','Biochemistry','Total Cholestrol',0,null),
(98,'Triglycerides','Biochemistry','Triglycerides',0,null),
(99,'HDL','Biochemistry','HDL',0,null),
(100,'LDL','Biochemistry','LDL',0,null),
(101,'Amylase','Biochemistry','Amylase',0,null),
(102,'Micro albumin','Biochemistry','Micro albumin',0,null),
(103,'Bilirubin','Biochemistry','Bilirubin',0,null),
(104,'SGPT','Biochemistry','SGPT',0,null),
(105,'ALK Phos','Biochemistry','Alk Phos',0,null),
(106,'SGOT','Biochemistry','SGOT',0,null),
(107,'Total Protein','Biochemistry','Total Protein',0,null),
(108,'Albumin','Biochemistry','Albumin',0,null),
(109,'Gamma GT','Biochemistry','Gamma GT',0,null),
(110,'24hr urine protein','Biochemistry','24hr urine protein',0,null),
(111,'24hr urine U/A','Biochemistry','24hr urine U/A',0,null),
(112,'Creatinine Clearance','Biochemistry','Creatinine Clearance',0,null),
(113,'Iron','Biochemistry','Iron',0,null),
(114,'TIBC','Biochemistry','TIBC',0,null),
(115,'CPK-MB','Biochemistry','CPK-MB',0,null),
(116,'CPK-NAC','Biochemistry','CPK-NAC',0,null),
(117,'LDH','Biochemistry','LDH',0,null),
(118,'Iso-Trop-I','Biochemistry','Iso-Trop-I',0,null),
(119,'BiochemistryOthers','Biochemistry','Others',0,null),
(120,'Gram stain','Bacteriology','Gram stain',0,null),
(121,'Culture Blood','Bacteriology','Blood',1,'Culture'),
(122,'Culture Urine','Bacteriology','Urine',1,'Culture'),
(123,'Culture Body Fluid','Bacteriology','Body Fluid',1,'Culture'),
(124,'Culture Swab','Bacteriology','Swab',1,'Culture'),
(125,'Culture Stool','Bacteriology','Stool',1,'Culture'),
(126,'Culture Water','Bacteriology','Water',1,'Culture'),
(127,'Culture Pus','Bacteriology','Pus',1,'Culture'),
(128,'Culture Sputum','Bacteriology','Sputum',1,'Culture'),
(129,'Culture CSF','Bacteriology','CSF',1,'Culture'),
(130,'Culture Others','Bacteriology','Others',1,'Culture'),
(131,'Sputum AFB','Bacteriology','Sputum AFB',0,null),
(132,'Other AFB','Bacteriology','Other AFB',0,null),
(133,'Leprosy Smear','Bacteriology','Leprosy Smear',0,null),
(134,'India Ink Test','Bacteriology','India Ink Test',0,null),
(135,'Fungus KOH','Bacteriology','KOH Test',1,'Fungus'),
(136,'Fungus Culture','Bacteriology','Culture',1,'Fungus'),
(137,'BacteriologyOthers','Bacteriology','Others',0,null),
(138,'HIV Total','Virology','Total',1,'HIV'),
(139,'HIV Positive','Virology','+Ve',1,'HIV'),
(140,'HAV Total','Virology','Total',1,'HAV'),
(141,'HAV Positive','Virology','+Ve',1,'HAV'),
(142,'HBsAg Total','Virology','Total',1,'HBsAg'),
(143,'HBsAg Positive','Virology','+Ve',1,'HBsAg'),
(144,'HCV Total','Virology','Total',1,'HCV'),
(145,'HCV Positive','Virology','+Ve',1,'HCV'),
(146,'HEV Total','Virology','Total',1,'HEV'),
(147,'HEV Positive','Virology','+Ve',1,'HEV'),
(148,'Anti-HBs','Virology','Anti-HBs',0,null),
(149,'HBeAg','Virology','HBeAg',0,null),
(150,'Anti-HBe','Virology','Anti-HBe',0,null),
(151,'HBcAg','Virology','HBcAg',0,null),
(152,'Anti-HBcAg','Virology','Anti-HBcAg',0,null),
(153,'Western blot','Virology','Western blot',0,null),
(154,'CD4 count','Virology','CD4 count',0,null),
(155,'Viral Load','Virology','Viral load',0,null),
(156,'VirologyOthers','Virology','Others',0,null),
(157,'Stool R/E','Parasitology','Stool R/E',0,null),
(158,'Occult Blood','Parasitology','Occult blood',0,null),
(159,'Reducing Sugar','Parasitology','Reducing sugar',0,null),
(160,'Urine R/E','Parasitology','Urine R/E',0,null),
(161,'Bile Salts','Parasitology','Bile salts',0,null),
(162,'Bile Pigments','Parasitology','Bile pigments',0,null),
(163,'Urobilinogen','Parasitology','Urobilinogen',0,null),
(164,'Porphobilinogen','Parasitology','Porphobilinogen',0,null),
(165,'Acetone','Parasitology','Acetone',0,null),
(166,'Chyle','Parasitology','Chyle',0,null),
(167,'Specific Gravity','Parasitology','Specific Gravity',0,null),
(168,'Bence Jones Protein','Parasitology','Bence Jones protein',0,null),
(169,'Semen Analysis','Parasitology','Semen analysis',0,null),
(170,'ParasitologyOthers','Parasitology','Others',0,null),
(171,'T3','Hormone/Endocrine','T3',0,null),
(172,'T4','Hormone/Endocrine','T4',0,null),
(173,'TSH','Hormone/Endocrine','TSH',0,null),
(174,'Cortisol','Hormone/Endocrine','Cortisol',0,null),
(175,'AFP','Hormone/Endocrine','AFP',0,null),
(176,'B-HCG','Hormone/Endocrine','B-HCG',0,null),
(177,'LH','Hormone/Endocrine','LH',0,null),
(178,'LSH','Hormone/Endocrine','LSH',0,null),
(179,'Prolactin','Hormone/Endocrine','Prolactin',0,null),
(180,'Oestrogen','Hormone/Endocrine','Oestrogen',0,null),
(181,'Progesterone','Hormone/Endocrine','Progesterone',0,null),
(182,'Testosterone','Hormone/Endocrine','Testosterone',0,null),
(183,'Vit D','Hormone/Endocrine','Vit.D',0,null),
(184,'Vit B12','Hormone/Endocrine','Vit.B12',0,null),
(185,'HormoneOrEndocrineOthers','Hormone/Endocrine','Others',0,null),
(186,'Carbamazepine','Drug Analysis','Carbamazepine',0,null),
(187,'Cyclosporine','Drug Analysis','Cyclosporine',0,null),
(188,'Valporic Acid','Drug Analysis','Valporic acid',0,null),
(189,'Phenytoin','Drug Analysis','Phenytoin',0,null),
(190,'Digoxine','Drug Analysis','Digoxine',0,null),
(191,'Tacrolimus','Drug Analysis','Tacrolimus',0,null),
(192,'DrugAnalysisOthers','Drug Analysis','Others',0,null),
(193,'HistoCyto HE','Histopathology/Cytology','HE',1,'Biopsy'),
(194,'Histo Others','Histopathology/Cytology','Other',1,'Biopsy'),
(195,'Pap','Histopathology/Cytology','Pap',1,'Cytology'),
(196,'Giemsa','Histopathology/Cytology','Giemsa',1,'Cytology'),
(197,'Cyto Others','Histopathology/Cytology','Others',1,'Cytology'),
(198,'ER','Immuno-Histo Chemistry','ER',0,null),
(199,'PR','Immuno-Histo Chemistry','PR',0,null),
(200,'G-FAP','Immuno-Histo Chemistry','G-FAP',0,null),
(201,'S-100','Immuno-Histo Chemistry','s-100',0,null),
(202,'Vimentin','Immuno-Histo Chemistry','Vimentin',0,null),
(203,'Cytokeratin','Immuno-Histo Chemistry','Cytokeratin',0,null),
(204,'ImmunoHistoOthers','Immuno-Histo Chemistry','Others',0,null)
GO
--Anish: 2 Sept End------------

------END: Merged from Lab Government Report Branch---------------------



------Start: Merged from Clinical Prescription Report Branch, 6 Oct 2020---------------------
---Anish: 14 Sept, 2020: Start-----------
Create Table CLN_Notes_PrescriptionNote(
PrescriptionNoteId INT CONSTRAINT PK_CLN_Note_PrescriptionNote PRIMARY KEY IDENTITY(1,1),
NotesId INT,
PatientId INT,
PatientVisitId INT,
PrescriptionNoteText NVARCHAR(Max),
OldMedicationStopped NVARCHAR(Max),
NewMedicationStarted NVARCHAR(Max),
ICDRemarks NVARCHAR(max),
ICDSelected NVARCHAR(max),
OrdersSelected NVARCHAR(max),
CreatedBy INT NULL,
CreatedOn DATETIME NULL,
ModifiedBy INT NULL,
ModifiedOn DATETIME NULL,
IsActive BIT NULL
)
GO

Insert Into CLN_MST_NoteType(NoteType,CreatedBy,CreatedOn,IsActive) Values('Prescription Note',1,GETDATE(),1)
GO
Insert Into CLN_Template(TemplateName,CreatedBy,CreatedOn,IsActive) Values('Prescription Note',1,GETDATE(),1)
GO
---Anish: 14 Sept, 2020: End-----------

------END: Merged from Clinical Prescription Report Branch,  6 Oct 2020---------------------

--Start: pratik: oct 6,2020--Add unique key constraint in INCTV_EmployeeIncentiveInfo table--
ALTER TABLE INCTV_EmployeeIncentiveInfo
ADD CONSTRAINT UK_INCTV_EmployeeIncentiveInfo_EmployeeId UNIQUE (EmployeeId);
Go
--End: pratik: oct 6,2020--Add unique key constraint in INCTV_EmployeeIncentiveInfo table--

---START: 06 Oct,2020 Rusha: -----to upload image from doctor -> scanned images ->upload image--
ALTER TABLE CLN_PAT_Images 
ALTER COLUMN DepartmentId int NULL;
GO

---END: 06 Oct,2020 Rusha: -----to upload image from doctor -> scanned images ->upload image--

---start: sud 07/Oct/20---
--param not required after we have Date(BS) feature in Grid--
Delete from CORE_CFG_Parameters
where ParameterName='IpBillingDateSettings' AND ParameterGroupName='Billing' 
GO
---param not required since we have button level permission for this..
Delete from CORE_CFG_Parameters
where ParameterName='EnablePartialClearanceInIpBilling' AND ParameterGroupName='Billing' 
GO
---end: sud 07/Oct/20---
-----START: NageshBB: 08 Oct 2020: inv record get issue fixed

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-----------------------------------------------------------
	
	ALTER PROCEDURE [dbo].[SP_ACC_GetTransactionDates]
		@FromDate DATETIME = null ,
		@ToDate DATETIME = null,
		@HospitalId INT = null,
		@SectionId INT = null
	AS
	/************************************************************************
	FileName: [SP_ACC_GetTransactionDates]
	CreatedBy/date: 
	Description: Get section wise all transactions date which is not synced with accounting
	Change History

	NOTE: All sections records table depends on their main transactions loading sp
		  For Inventory => SP_ACC_GetInventoryTransactions
			  Billing   => SP_ACC_Bill_GetBillingDataForAccTransfer
			  Pharmacy  => SP_ACC_GetPharmacyTransactions
			  Incentive => SP_INCTV_ACC_GetTransactionInfoForAccTransfer

		 - use tables which is used in above sectionwise stored procedure to get below section wise transaction dates.
		   If table modify in above stored procedure also modify in this sp.
	-------------------------------------------------------------------------
	S.No.    UpdatedBy/Date                        Remarks
	-------------------------------------------------------------------------
	1.      Vikas:25th Sep 2020				changed table for consumptions transactions from WARD_INV_Consumption to WARD_INV_Transaction
	2.      Vikas:30 Sep 2020				transaction dates mismatched and some other bugs correction from all tables.
	3.      Nagesh:01 Oct 2020              stockmanag out record date logic changed . Stock ManageOut only once in year on Fiscal Year end date and whole year data will show fiscal year enddate as transaction date
	*************************************************************************/
	BEGIN
		-- check rules are mapped or not with transaction types
		DECLARE @Rules TABLE (GroupMappingId INT, Description varchar(200),TransferRuleId INT)
		Insert into @Rules(GroupMappingId, Description, TransferRuleId)
		select [GroupMappingId], [Description],[TransferRuleId]
		from (select gm.GroupMappingId,gm.Description,TransferRuleId from ACC_MST_GroupMapping gm
		join ACC_MST_MappingDetail mp on gm.GroupMappingId = mp.GroupMappingId
		join ACC_MST_Hospital_TransferRules_Mapping r on mp.GroupMappingId = r.TransferRuleId
		group by gm.GroupMappingId ,gm.Description,TransferRuleId) x
		
		Declare 
		@FYStartDate datetime=(select top 1 StartDate from ACC_MST_FiscalYears where convert(date,@FromDate)
		between convert(date,Startdate) and convert(date,EndDate)),
		@FYEndDate datetime=(select top 1 EndDate from ACC_MST_FiscalYears where convert(date,@FromDate)
		between convert(date,Startdate) and convert(date,EndDate))
		IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL AND @HospitalId IS NOT NULL AND @SectionId IS NOT NULL) 
		BEGIN
			IF(@SectionId=1) -- Inventory Section 
			BEGIN
			  --Table1: GoodReceipt
				SELECT 
					CONVERT(DATE, gr.GoodsReceiptDate) as 'TransactionDate'		
				FROM INV_TXN_GoodsReceipt gr 
					JOIN INV_TXN_GoodsReceiptItems gritm on gr.GoodsReceiptID = gritm.GoodsReceiptId
					JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
					JOIN INV_MST_Item itm on gritm.ItemId = itm.ItemId
				WHERE (gritm.IsTransferredToACC IS NULL OR gritm.IsTransferredToACC = 0) 
					AND (CONVERT(DATE, gr.GoodsReceiptDate) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))	
					AND itm.ItemType !='Capital Goods' and gr.IsCancel!=1 --excluded cancel gr		
					AND ((select count([Description]) from @Rules where [Description]='INVCashGoodReceiptFixedAsset1' 
					OR [Description]='INVCashGoodReceipt1' or [Description]='INVCreditGoodReceiptFixedAsset' or [Description]='INVCreditGoodReceipt') > 0)
				UNION
				 --Table2: WriteOffItems
					SELECT 
						CONVERT(DATE, wr.CreatedOn) as 'TransactionDate'
					FROM INV_TXN_WriteOffItems wr
					WHERE (IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
					AND (CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
					AND ((select count([Description]) from @Rules where [Description]='INVWriteOff') > 0)
				UNION
				--Table3: ReturnToVendor
					SELECT CONVERT(DATE,rv.CreatedOn) as 'TransactionDate'
					FROM INV_TXN_ReturnToVendorItems rv 
					WHERE (rv.IsTransferredToACC IS NULL OR rv.IsTransferredToACC = 0)
					AND (CONVERT(DATE, rv.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
					AND ((select count([Description]) from @Rules where [Description]='INVReturnToVendorCashGR' OR [Description]='INVReturnToVendorCreditGR') > 0)
			   UNION
			   --Table4: DispatchToDept

					SELECT CONVERT(DATE,wardTxn.TransactionDate) AS 'TransactionDate'				
					FROM WARD_INV_Transaction wardTxn JOIN INV_MST_Item itm on wardTxn.ItemId=itm.ItemId
					WHERE (wardTxn.IsTransferToAcc IS NULL OR wardTxn.IsTransferToAcc =0) 
					AND wardTxn.TransactionType='dispatched-items' AND itm.ItemType='consumables'
					AND (convert(date, wardTxn.TransactionDate) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
					AND ((select count([Description]) from @Rules where [Description]='INVDispatchToDept') > 0)	
			   UNION
				-- Table 5 :INVDeptConsumedGoods
					SELECT CONVERT(DATE,wardTxn.TransactionDate) as 'TransactionDate'
					FROM WARD_INV_Transaction wardTxn
					JOIN INV_MST_Item itm on wardTxn.ItemId= itm.ItemId					
					WHERE (wardTxn.IsTransferToAcc IS NULL OR wardTxn.IsTransferToAcc=0)  
					AND wardTxn.TransactionType='consumption-items' AND itm.ItemType='consumables'
					AND (CONVERT(DATE, wardTxn.TransactionDate) BETWEEN  CONVERT(DATE, @FromDate) AND  CONVERT(DATE, @ToDate))	
					AND ((select count([Description]) from @Rules where [Description]='INVDeptConsumedGoods') > 0)
			   UNION
			   -- Table 6 :INVStockManageOut	
					---StockManage-Out from MainStore---
					SELECT X.TransactionDate
					FROM (
							SELECT CONVERT(DATE,@FYEndDate) 
							--CONVERT(DATE,StkTxn.TransactionDate) 
							as 'TransactionDate'
							FROM INV_TXN_StockTransaction StkTxn
							JOIN INV_MST_Item itm on StkTxn.ItemId= itm.ItemId
							JOIN INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId						
							WHERE (StkTxn.IsTransferredToACC IS NULL OR StkTxn.IsTransferredToACC=0)  
							AND StkTxn.TransactionType in ('fy-managed-items','stockmanaged-items') and InOut='out'
							AND 
							(
							(CONVERT(DATE, StkTxn.TransactionDate) between CONVERT(DATE, @FYStartDate) AND  CONVERT(DATE, @FYEndDate) 
							) and convert(date,@FYEndDate)=convert(date,@ToDate)
							) 							 
							AND itm.ItemType='consumables'
							---StockManage-Out from SubStore---
							UNION
							SELECT CONVERT(DATE,@FYEndDate) 
							--CONVERT(DATE,wardTxn.TransactionDate) 
							as 'TransactionDate'
							FROM WARD_INV_Transaction wardTxn
							JOIN INV_MST_Item itm on wardTxn.ItemId= itm.ItemId
							JOIN INV_MST_ItemSubCategory sb on itm.SubCategoryId= sb.SubCategoryId						
							WHERE (wardTxn.IsTransferToAcc IS NULL OR wardTxn.IsTransferToAcc=0)  
							AND wardTxn.TransactionType in ('fy-stock-manage') and InOut='out'
							AND 
							(
							(CONVERT(DATE, wardTxn.TransactionDate) between CONVERT(DATE, @FYStartDate) AND  CONVERT(DATE, @FYEndDate) )
							and convert(date,@FYEndDate)=convert(date,@ToDate)
							) 	
							AND itm.ItemType='consumables'
						) AS X		
						WHERE (select count([Description]) from @Rules where [Description]='INVStockManageOut') > 0

			END
			---------------- 			
			IF(@SectionId=2) -- Billing Section
			BEGIN
				IF((select top 1 CONVERT(bit, ParameterValue) from CORE_CFG_Parameters where ParameterGroupName='accounting'and ParameterName='GetBillingFromSyncTable')=1) 
					BEGIN 
						SELECT CONVERT(date, TransactionDate) as 'TransactionDate'
						FROM BIL_SYNC_BillingAccounting 
						WHERE IsTransferedToAcc IS NULL AND CONVERT(date, TransactionDate) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
					END

				ELSE
					BEGIN 
						--Cash Bill--
							SELECT CONVERT(date, itm.PaidDate) as 'TransactionDate'  
							FROM BIL_TXN_BillingTransactionItems itm, BIL_TXN_BillingTransaction txn
							WHERE txn.BillingTransactionId = itm.BillingTransactionId
							AND Convert(Date,itm.PaidDate) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
							AND itm.BillingTransactionId IS NOT NULL
							AND ( txn.PaymentMode='cash' OR txn.PaymentMode='card' OR txn.PaymentMode='cheque')
							AND ISNULL(itm.IsCashBillSync,0) = 0  
							AND ((select count([Description]) from @Rules where [Description]='CashBill') > 0)
						UNION 			
						--Credit Bill--
							Select CONVERT(date, itm.CreatedOn) as 'TransactionDate'
							from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
							Where txn.BillingTransactionId = itm.BillingTransactionId
							AND Convert(Date,itm.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
							and itm.BillingTransactionId IS NOT NULL
							and txn.PaymentMode='credit'
							AND ISNULL(itm.IsCreditBillSync,0) = 0  
							AND ((select count([Description]) from @Rules where [Description]='CreditBill') > 0)

						UNION 
			
						--Cash Bill Return--
							Select	CONVERT(date, ret.CreatedOn) as 'TransactionDate'
							from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
							Where txn.BillingTransactionId = itm.BillingTransactionId
							AND ret.BillingTransactionId=txn.BillingTransactionId
							AND Convert(Date,ret.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
							AND ISNULL(itm.ReturnStatus,0) != 0  
							AND itm.BillingTransactionId IS NOT NULL
							AND  ( txn.PaymentMode='cash' OR txn.PaymentMode='card' OR txn.PaymentMode='cheque') 
							AND ISNULL(itm.IsCashBillReturnSync,0) = 0 
							AND ((select count([Description]) from @Rules where [Description]='CashBill') > 0) 
						UNION 
			
						--CreditBillReturn--
							Select CONVERT(date, ret.CreatedOn) as 'TransactionDate'
							from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
							Where txn.BillingTransactionId = itm.BillingTransactionId
							AND ret.BillingTransactionId=txn.BillingTransactionId
							AND CONVERT(Date,ret.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
							AND ISNULL(itm.ReturnStatus,0) != 0  -- take only returned items..
							AND itm.BillingTransactionId IS NOT NULL
							AND txn.PaymentMode='credit'
							AND ISNULL(itm.IsCreditBillReturnSync,0) = 0  
							AND ((select count([Description]) from @Rules where [Description]='CreditBillReturn') > 0)
						UNION 
			
						--Deposit Add--
							Select	CONVERT(date, CreatedOn) as 'TransactionDate'
							from BIL_TXN_Deposit
							Where CONVERT(Date,CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
							and DepositType ='Deposit'AND ISNULL(IsDepositSync,0) = 0 
							AND ((select count([Description]) from @Rules where [Description]='DepositAdd') > 0)
						UNION 
			
						--Deposit Return/Deduct--
							Select	CONVERT(date, CreatedOn) as 'TransactionDate'
							from BIL_TXN_Deposit
							Where CONVERT(Date,CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
							AND DepositType IN ('ReturnDeposit', 'depositdeduct') AND ISNULL(IsDepositSync,0) = 0  	
							AND ((select count([Description]) from @Rules where [Description]='DepositReturn') > 0)	
			
					END
			END
			----------------
			IF(@SectionId=3) -- Pharmacy Section			
			BEGIN
				--Table1: CashInvoice
					SELECT CONVERT(DATE, inv.CreateOn) AS 'TransactionDate' 
					FROM PHRM_TXN_Invoice inv 
					WHERE inv.IsTransferredToACC IS NULL 
					AND CONVERT(DATE, inv.CreateOn)BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate) 
					AND ((select count([Description]) from @Rules where [Description]='PHRMCreditInvoice1'OR [Description]='PHRMCashInvoice1') > 0)
				UNION
				--Table3: CashInvoiceReturn
					SELECT CONVERT(DATE, CreatedOn) AS 'TransactionDate' 
					FROM  PHRM_TXN_InvoiceReturnItems invRet 
					WHERE invRet.IsTransferredToACC IS NULL 
					AND CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate) 
					AND ((select count([Description]) from @Rules where [Description]='PHRMCreditInvoiceReturn1'OR [Description]='PHRMCashInvoiceReturn1') > 0)
				UNION
				--Table4: goodsReceipt
					SELECT CONVERT(DATE, CreatedOn) AS 'TransactionDate' 
					FROM PHRM_GoodsReceipt gr 
					WHERE gr.IsTransferredToACC IS NULL 
					AND gr.IsCancel=0  AND CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate) 					
					AND ((select count([Description]) from @Rules where [Description]='PHRMCreditGoodReceipt'OR [Description]='PHRMCashGoodReceipt') > 0)
				UNION
				--Table5: writeoff
					SELECT CONVERT(DATE, CreatedOn) AS 'TransactionDate' 
					FROM PHRM_WriteOff wrOff 
					WHERE wrOff.IsTransferredToACC IS NULL 
					AND CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate)  
					AND ((select count([Description]) from @Rules where [Description]='PHRMWriteOff') > 0)
				UNION
				--Table6: dispatchToDept && dispatchToDeptRet
					SELECT CONVERT(DATE,CreatedOn) AS 'TransactionDate' 
					FROM PHRM_StockTxnItems stkItm 
					WHERE stkItm.IsTransferredToACC IS NULL 
					AND  CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate) 
					AND ((select count([Description]) from @Rules where [Description]='PHRMDispatchToDept'OR [Description]='PHRMDispatchToDeptReturn') > 0)
  

		
			END
			---------------- 
			IF(@SectionId=5) -- Incetives Section
			BEGIN
				SELECT CONVERT(DATE, TransactionDate) AS 'TransactionDate'
				FROM INCTV_TXN_IncentiveFractionItem outerTbl 
				WHERE Convert(DATE,outerTbl.TransactionDate) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate) 
				AND ISNULL(IsTransferToAcc,0) = 0 AND ISNULL(outerTbl.IsActive,0) = 1
				AND ((select count([Description]) from @Rules where [Description]='ConsultantIncentive') > 0)
				GROUP BY Convert(DATE, TransactionDate)				
			END
  		END			
	END
Go

--unique constraint on ACC_Ledger table for LedgerName & LedgerGroupId column

ALTER TABLE ACC_Ledger
ADD CONSTRAINT UC_LedgerName_LedgerGroupId UNIQUE (LedgerName,LedgerGroupId)
Go

-----END: NageshBB: 08 Oct 2020: inv record get issue fixed



----start: sud-08-Oct'20--Inctv correcction---
ALTER PROCEDURE [dbo].[SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_Return_InDateRange] 
 ( @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL)
AS
/*
 File: SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_Return_InDateRange '2020-02-14','2020-02-14'
 Description: To insert negative amount for Invoice Return Cases.
           -- Negative Amount for:  TotalBillAmount, IncentiveAmount and TDS
		   -- IncentivePercent will remain same
 Remarks:  
     * MainDoctor=1 for Assigned and is 0 for Referral.
     * Check for CreatedBy and CreatedOn value. 
	 * We're excluding the fraction where RequestsedBy(ReferredBy) and AssignedToId are there in BillingTxnItem but those doctors don't have any configuration in Incentive-Profile

 Revision Needed ON: 
    * We may need undo functionality of this feature.
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By            Remarks
 --------------------------------------------------
1.      24Sept'20                 This handles only Returned Items.
 -----------------------------------------------------------------
*/
BEGIN

IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL)
BEGIN

INSERT INTO INCTV_TXN_IncentiveFractionItem
   ( InvoiceNoFormatted, TransactionDate, PriceCategory, BillingTransactionId, BillingTransactionItemId, PatientId, 
    BillItemPriceId, ItemName, TotalBillAmount, IncentiveType, IncentiveReceiverId, IncentiveReceiverName, IncentivePercent, IncentiveAmount, 
	IsPaymentProcessed, PaymentInfoId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive, IsMainDoctor, TDSPercentage, TDSAmount
	, IsReturnTxn)

Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   rettxn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,
   - txnItm.TotalAmount 'TotalBillAmount',
    'referral' as IncentiveType, 
   txnItm.RequestedBy 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.ReferredByPercent 'IncentivePercent', 
	- txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 'IncentiveAmount', 
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	0 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercent,
	- ( txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100
	, 1 AS IsReturnTxn
  -----2. Secondary Columns:
  -- ,txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
    BIL_TXN_InvoiceReturn retTxn ON txn.BillingTransactionId = retTxn.BillingTransactionId 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN FN_INCTV_GetIncentiveSettings_Normal () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.RequestedBy = sett.EmployeeId
Where  Convert(Date,retTxn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(sett.ReferredByPercent,0) !=0
	and txnItm.BillingTransactionItemId  NOT IN 
	  (SELECT DISTINCT BillingTransactionItemId  FROM INCTV_TXN_IncentiveFractionItem  WHERE IsReturnTxn=1) 
---End: For Referral Incentive-----------

UNION ALL

---2.1-- Start: For Assigned Incentive (No Group Distribution)-----------
Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
    rettxn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,
   - txnItm.TotalAmount 'TotalBillAmount',
    'assigned' as IncentiveType, 
   txnItm.ProviderId 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.AssignedToPercent 'IncentivePercent', 
	- txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	1 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercentage,
	- ( txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100
	, 1 AS IsReturnTxn



from BIL_TXN_BillingTransaction txn 
   INNER JOIN
    BIL_TXN_InvoiceReturn retTxn ON txn.BillingTransactionId = retTxn.BillingTransactionId 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN FN_INCTV_GetIncentiveSettings_Normal () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.ProviderId = sett.EmployeeId
Where  Convert(Date,retTxn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(sett.AssignedToPercent,0) !=0
		---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN 
	    (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem  WHERE IsReturnTxn=1) 
---End: 2.1 For Assigned Incentive (No Group Distribution)-----------

UNION ALL

---2.2-- Start: For Assigned Incentive (Group Distribution Only)-----------
 
Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   rettxn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,
   - txnItm.TotalAmount 'TotalBillAmount',
    'assigned' as IncentiveType, 
  -- incentive goes to:  ToEmployeeId----
   sett.ToEmployeeId 'IncentiveReceiverId', sett.ToEmployeeName 'IncentiveReceiverName',
    sett.DistributionPercent 'IncentivePercent', 
	- txnitm.TotalAmount* ISNULL(sett.DistributionPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	1 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercentage,
	- ( txnitm.TotalAmount* ISNULL(sett.DistributionPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100
	, 1 AS IsReturnTxn

from BIL_TXN_BillingTransaction txn 
  INNER JOIN
    BIL_TXN_InvoiceReturn retTxn ON txn.BillingTransactionId = retTxn.BillingTransactionId 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      ON txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
      ON TXN.FiscalYearId = fyear.FiscalYearId
  INNER JOIN 
	 FN_INCTV_GetIncentiveSettings_GroupDistribution() sett  -- this gives us group distribution settings only.. 
  
  --[FN_INCTV_GetIncentiveSettings] () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.ProviderId = sett.FromEmployeeId
Where  Convert(Date,retTxn.CreatedOn) BETWEEN @FromDate and @ToDate 
	AND ISNULL(sett.DistributionPercent,0) !=0
		---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN 
	    (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem  WHERE IsReturnTxn=1) 

---2.2-- End: For Assigned Incentive (Group Distribution Only)-----------

END--end of IF.. 

--by default returning something so that we understand it has been executed..
Select 'success' as 'status' 

END--end of SP--
GO

----end: sud-08-Oct'20--Inctv correcction---
-----------Merge from  LabPrintSheetEnhancement to DEV branch------------
---Anish: 15 Oct, 2020: Start ----
Alter table Lab_MAP_TestComponents
Add ShowInSheet bit null
Go

Update Lab_MAP_TestComponents
set ShowInSheet=1
GO

---Anish: 15 Oct, 2020: END ----
-----------Merge from  LabPrintSheetEnhancement to DEV branch------------

---start: sud--19Oct'20--Incentive db changes--
ALTER TABLE INCTV_MAP_EmployeeBillItemsMap
ADD CreatedBy int ,
  CreatedOn datetime,
  ModifiedBy int, 
  ModifiedOn datetime;
GO

ALTER TABLE INCTV_CFG_ItemGroupDistribution
ADD  ModifiedBy int, 
  ModifiedOn datetime;
GO
---end: sud--19Oct'20--Incentive db changes--

---Anish: START: 19 Oct 2020: Parameter Value Type changed for OrderStatus cancell Parameter----
UPDATE CORE_CFG_Parameters set ValueDataType='arrayobj' 
WHERE ParameterName='CancellationRules' OR ParameterName='OrderStatusSettingB4Discharge'
GO
---Anish: END: 19 Oct 2020: Parameter Value Type changed for OrderStatus cancell Parameter----

--START: VIKAS:20th Oct- 2020: parameter rename script.
IF EXISTS(Select  top 1 * from CORE_CFG_Parameters Where ParameterGroupName='Accounting' and ParameterName='AllowToCreateAllLedgers')
BEGIN
UPDATE CORE_CFG_Parameters
SET ParameterName='AllowToCreateAllLedgersFromDefaultTab'
Where ParameterGroupName='Accounting' and ParameterName='AllowToCreateAllLedgers'
END
GO
--END: VIKAS:20th Oct- 2020: parameter rename script.

--START:NageshBB: 22 Oct 2020: inventory fiscal year calendar update IsClosed column vlaue in case of null , acc-daywise report hide
update INV_CFG_FiscalYears
set IsClosed=0 where IsClosed is null
Go

--Accounting Report => Day wise voucher report  no need to show . Update isactive=false 
Update RBAC_RouteConfig
set IsActive=0 where
UrlFullPath= 'Accounting/Reports/DaywiseVoucherReport' and RouterLink=	'DaywiseVoucherReport'
Go

--END:NageshBB: 22 Oct 2020: inventory fiscal year calendar update IsClosed column vlaue in case of null , acc-daywise report hide

-----START: 04 Nov '20, Merged Inctv_IpOpSeparation to DEV branch----

--Start: Pratik: 20 oct 2020:-- Incentive-IP/OP Separation on Settings 
INSERT INTO CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description,ParameterType,ValueLookUpList)
VALUES ('Incentive','IncentiveOpdIpdSettings','{"EnableOpdIpd":false, "OpdSelected":false, "IpdSelected":false}','JSON','Incentive-IP/OP Separation Settings.Need to set and calculate incentive for IPD/OPD separately for each Employee-Item.','custom','NULL');
GO

 ALTER TABLE INCTV_MAP_EmployeeBillItemsMap
 ADD BillingTypesApplicable varchar(20);
 GO

 --End: Pratik: 20 oct 2020:-- Incentive-IP/OP Separation on Settings

  --Start: Pratik: 22 oct 2020:-- Incentive-IP/OP Separation on Bill Sync
  

ALTER FUNCTION [dbo].[FN_INCTV_GetIncentiveSettings_GroupDistribution] ()  
RETURNS TABLE
/*
To get settings for GroupDistribution bill items only.. 
Created: Sud/Pratik-17Jul'20
Remarks: This is different than normal incentive distribution. 
           another function for nonGroupDistribution is 'FN_INCTV_GetIncentiveSettings()'
Change History:
------------------------------------------------------------------------------------------
S.No.    Author         Remarks
------------------------------------------------------------------------------------------
1.      Sud/Pratik-17Jul'20   Initial Draft
------------------------------------------------------------------------------------------
*/
AS
    RETURN
    (
 
      Select 
		   grpDist.FromEmployeeId,
		   grpDist.DistributeToEmployeeId 'ToEmployeeId',
		   toEmp.FullName  'ToEmployeeName',
		   grpDist.DistributionPercent,

		  grpDist.BillItemPriceId,
		  cfgPrice.ServiceDepartmentId,
		  cfgPrice.ItemId,
		  cfgPrice.ItemName,
		  grpDist.IncentiveType,
		  inctvInfo.TDSPercent,
		  empBilMap.PriceCategoryId,
		  pricCat.PriceCategoryName,
		  empBilMap.BillingTypesApplicable
 
		 from INCTV_CFG_ItemGroupDistribution grpDist
		   INNER JOIN  EMP_Employee fromEmp
			  ON grpDist.FromEmployeeId = fromEmp.EmployeeId
		  INNER JOIN EMP_Employee toEmp
			  ON grpDist.DistributeToEmployeeId = toEmp.EmployeeId
		  INNER JOIN INCTV_EmployeeIncentiveInfo  inctvInfo
			  ON grpDist.DistributeToEmployeeId = inctvInfo.EmployeeId
		  INNER JOIN BIL_CFG_BillItemPrice cfgPrice
		     ON grpDist.BillItemPriceId = cfgPrice.BillItemPriceId
		  INNER JOIN INCTV_MAP_EmployeeBillItemsMap empBilMap
              ON grpDist.EmployeeBillItemsMapId = empBilMap.EmployeeBillItemsMapId
          INNER JOIN BIL_CFG_PriceCategory pricCat
             ON empBilMap.PriceCategoryId = pricCat.PriceCategoryId
		WHERE grpDist.IsActive=1 and empBilMap.IsActive=1
    )
GO
----------------------------------------------------------------------------------------


ALTER FUNCTION [dbo].[FN_INCTV_GetIncentiveSettings_Normal] ()
RETURNS TABLE
/*
To get current incentive profile settings for normal. i.e: No GroupDistribution.. 
Created: sud-15Feb'20
Remarks: 
Change History:
------------------------------------------------------------------------------------------
S.No.    Author						Remarks
------------------------------------------------------------------------------------------
1.      15Feb'20/sud				 Initial Draft
2.      15Mar'20/Sud				Added TDSPercenatge in the Select list, which will be used later in calculation.
3.		11June2020/Pratik			GroupDistribution Impacts on Existing Functionalities 
4.      17Jul'20/Sud/Pratik			Recreate after Renamed.. 
------------------------------------------------------------------------------------------
*/
AS
    RETURN
    (
 
      SELECT 
        empBillItmMap.BillItemPriceId,empInctvInfo.EmployeeIncentiveInfoId,
        itmPrice.ServiceDepartmentId, itmPrice.ItemId, itmPrice.ItemName,
        priceCat.PriceCategoryId, priceCat.PriceCategoryName,
        emp.EmployeeId,
        emp.FullName,
        empBillItmMap.AssignedToPercent,
        empBillItmMap.ReferredByPercent,
        empInctvInfo.TDSPercent,
		empBillItmMap.BillingTypesApplicable
      from INCTV_EmployeeIncentiveInfo empInctvInfo
      INNER JOIN INCTV_MAP_EmployeeBillItemsMap empBillItmMap
        on empInctvInfo.EmployeeId=empBillItmMap.EmployeeId
      INNER JOIN BIL_CFG_BillItemPrice  itmPrice
        ON empBillItmMap.BillItemPriceId = itmPrice.BillItemPriceId
      INNER JOIN BIL_CFG_PriceCategory priceCat
        ON empBillItmMap.PriceCategoryId=priceCat.PriceCategoryId 
      INNER JOIN EMP_Employee emp
        ON empInctvInfo.EmployeeId=emp.EmployeeId  
        where empInctvInfo.IsActive=1 and empBillItmMap.IsActive=1 
		-- take only those where groupdistribution is not there---
		and ISNULL(empBillItmMap.HasGroupDistribution,0) = 0
    )
GO
--------------------------------------------------------------------------------

ALTER PROCEDURE [dbo].[SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange] 
 ( @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL)
AS
/*
 File: SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange '2020-02-14','2020-02-14'
 Description: 
 Remarks:  
     * MainDoctor=1 for Assigned and is 0 for Referral.
     * Check for CreatedBy and CreatedOn value. 
	 * We're excluding the fraction where RequestsedBy(ReferredBy) and AssignedToId are there in BillingTxnItem but those doctors don't have any configuration in Incentive-Profile

 Revision Needed ON: 
    * We may need undo functionality of this feature.
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By            Remarks
 --------------------------------------------------
 1.      15Feb'20/Sud              Initial Draft (Needs Revision)
 2.      15Mar'20/Sud              Added TDSPercentage and TDSAmount calculation in the query
3.       4Apr'20/Sud               Excluding Already Added BillingTransactionItem during Bill Sync.
                                   earlier it was at BillingTransactionId level, now it's BillingTransactionItemId
4.       11June                    TDSpercentage from Employee Incentive Info
5.       17Jul'20/Sud/Pratik       Updated for Group Distribution 
6.       10Aug'20/Sud              Removed HardCoded Date Range from Group Distribution
7.       17Sept'20                 Temporary solution to avoid Syncing Returned items
                                   ToDate <= GetDate()-5days or less.. if not then make that from here..
8.       24Sept'20                 Returned items not excluded anymore, it will be handled by another StoredProcedure as Negative billing
 -----------------------------------------------------------------
*/
BEGIN

IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL)
BEGIN


INSERT INTO INCTV_TXN_IncentiveFractionItem
   ( InvoiceNoFormatted, TransactionDate, PriceCategory, BillingTransactionId, BillingTransactionItemId, PatientId, 
    BillItemPriceId, ItemName, TotalBillAmount, IncentiveType, IncentiveReceiverId, IncentiveReceiverName, IncentivePercent, IncentiveAmount, 
	IsPaymentProcessed, PaymentInfoId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive, IsMainDoctor, TDSPercentage, TDSAmount, IsReturnTxn)

Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'referral' as IncentiveType, 
   txnItm.RequestedBy 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.ReferredByPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	0 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercent,
	( txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100
	, 0 AS IsReturnTxn
  -----2. Secondary Columns:
  -- ,txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN FN_INCTV_GetIncentiveSettings_Normal () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.RequestedBy = sett.EmployeeId
	AND 1 = (
        Case WHEN ISNULL(sett.BillingTypesApplicable,'both')='both' then 1
        WHEN sett.BillingTypesApplicable = txnItm.BillingType then 1
        ELSE 0 END
)
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	--AND ISNULL(txnItm.ReturnStatus,0)= 0 -- Not Required Anymore
	AND ISNULL(sett.ReferredByPercent,0) !=0

	and txnItm.BillingTransactionItemId NOT IN 
	    (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem  WHERE IsReturnTxn=0) 
---End: For Referral Incentive-----------

UNION ALL

---2.1-- Start: For Assigned Incentive (No Group Distribution)-----------
Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'assigned' as IncentiveType, 
   txnItm.ProviderId 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.AssignedToPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	1 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercentage,
	( txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100
	, 0 AS IsReturnTxn
  -----2. Secondary Columns:
  --, txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN FN_INCTV_GetIncentiveSettings_Normal () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.ProviderId = sett.EmployeeId
	AND 1 = (
        Case WHEN ISNULL(sett.BillingTypesApplicable,'both')='both' then 1
        WHEN sett.BillingTypesApplicable = txnItm.BillingType then 1
        ELSE 0 END
)
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(sett.AssignedToPercent,0) !=0
		---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN 
	  (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem WHERE IsReturnTxn=0) -- remove this condition once daily upload is enabled..
---End: 2.1 For Assigned Incentive (No Group Distribution)-----------

UNION ALL

---2.2-- Start: For Assigned Incentive (Group Distribution Only)-----------
 
Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   txn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,txnItm.TotalAmount 'TotalBillAmount',
    'assigned' as IncentiveType, 
  -- incentive goes to:  ToEmployeeId----
   sett.ToEmployeeId 'IncentiveReceiverId', sett.ToEmployeeName 'IncentiveReceiverName',
    sett.DistributionPercent 'IncentivePercent', txnitm.TotalAmount* ISNULL(sett.DistributionPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	1 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercentage,
	( txnitm.TotalAmount* ISNULL(sett.DistributionPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100
	, 0 AS IsReturnTxn

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      ON txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
      ON TXN.FiscalYearId = fyear.FiscalYearId
  INNER JOIN 
	 FN_INCTV_GetIncentiveSettings_GroupDistribution() sett  -- this gives us group distribution settings only.. 
  
  --[FN_INCTV_GetIncentiveSettings] () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.ProviderId = sett.FromEmployeeId
	AND 1 = (
        Case WHEN ISNULL(sett.BillingTypesApplicable,'both')='both' then 1
        WHEN sett.BillingTypesApplicable = txnItm.BillingType then 1
        ELSE 0 END
)
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate -- sud:10Aug'20-- this dates were hardcoded earlier.
	-- AND ISNULL(txnItm.ReturnStatus,0)= 0 -- Not Required Anymore
	AND ISNULL(sett.DistributionPercent,0) !=0
		---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN 
	  (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem WHERE IsReturnTxn=0) -- remove this condition once daily upload is enabled..

---2.2-- End: For Assigned Incentive (Group Distribution Only)-----------


END--end of IF.. 

--by default returning something so that we understand it has been executed..
Select 'success' as 'status' 

END--end of SP--

GO

-------------------------------------------------------------------------------------------------------

ALTER PROCEDURE [dbo].[SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_Return_InDateRange] 
 ( @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL)
AS
/*
 File: SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_Return_InDateRange '2020-02-14','2020-02-14'
 Description: To insert negative amount for Invoice Return Cases.
           -- Negative Amount for:  TotalBillAmount, IncentiveAmount and TDS
		   -- IncentivePercent will remain same
 Remarks:  
     * MainDoctor=1 for Assigned and is 0 for Referral.
     * Check for CreatedBy and CreatedOn value. 
	 * We're excluding the fraction where RequestsedBy(ReferredBy) and AssignedToId are there in BillingTxnItem but those doctors don't have any configuration in Incentive-Profile

 Revision Needed ON: 
    * We may need undo functionality of this feature.
 Change History:
 --------------------------------------------------
 S.No.    ChangeDate/By            Remarks
 --------------------------------------------------
1.      24Sept'20                 This handles only Returned Items.
 -----------------------------------------------------------------
*/
BEGIN

IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL)
BEGIN

INSERT INTO INCTV_TXN_IncentiveFractionItem
   ( InvoiceNoFormatted, TransactionDate, PriceCategory, BillingTransactionId, BillingTransactionItemId, PatientId, 
    BillItemPriceId, ItemName, TotalBillAmount, IncentiveType, IncentiveReceiverId, IncentiveReceiverName, IncentivePercent, IncentiveAmount, 
	IsPaymentProcessed, PaymentInfoId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsActive, IsMainDoctor, TDSPercentage, TDSAmount
	, IsReturnTxn)

Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   rettxn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,
   - txnItm.TotalAmount 'TotalBillAmount',
    'referral' as IncentiveType, 
   txnItm.RequestedBy 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.ReferredByPercent 'IncentivePercent', 
	- txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 'IncentiveAmount', 
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	0 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercent,
	- ( txnitm.TotalAmount* ISNULL(sett.ReferredByPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100
	, 1 AS IsReturnTxn
  -----2. Secondary Columns:
  -- ,txnitm.ServiceDepartmentId, txnitm.ServiceDepartmentName, txnitm.ItemId, txnItm.SubTotal, txnItm.DiscountAmount,
  -- pat.FirstName+' '+pat.LastName 'PatientName'

from BIL_TXN_BillingTransaction txn 
   INNER JOIN
    BIL_TXN_InvoiceReturn retTxn ON txn.BillingTransactionId = retTxn.BillingTransactionId 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN FN_INCTV_GetIncentiveSettings_Normal () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.RequestedBy = sett.EmployeeId
	AND 1 = (
        Case WHEN ISNULL(sett.BillingTypesApplicable,'both')='both' then 1
        WHEN sett.BillingTypesApplicable = txnItm.BillingType then 1
        ELSE 0 END
)
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(sett.ReferredByPercent,0) !=0
	and txnItm.BillingTransactionItemId  NOT IN 
	  (SELECT DISTINCT BillingTransactionItemId  FROM INCTV_TXN_IncentiveFractionItem  WHERE IsReturnTxn=1) 
---End: For Referral Incentive-----------

UNION ALL

---2.1-- Start: For Assigned Incentive (No Group Distribution)-----------
Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
    rettxn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,
   - txnItm.TotalAmount 'TotalBillAmount',
    'assigned' as IncentiveType, 
   txnItm.ProviderId 'IncentiveReceiverId', sett.FullName 'IncentiveReceiverName',
    sett.AssignedToPercent 'IncentivePercent', 
	- txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	1 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercentage,
	- ( txnitm.TotalAmount* ISNULL(sett.AssignedToPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100
	, 1 AS IsReturnTxn



from BIL_TXN_BillingTransaction txn 
   INNER JOIN
    BIL_TXN_InvoiceReturn retTxn ON txn.BillingTransactionId = retTxn.BillingTransactionId 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      on txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
  ON TXN.FiscalYearId=fyear.FiscalYearId
  INNER JOIN FN_INCTV_GetIncentiveSettings_Normal () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.ProviderId = sett.EmployeeId
	AND 1 = (
        Case WHEN ISNULL(sett.BillingTypesApplicable,'both')='both' then 1
        WHEN sett.BillingTypesApplicable = txnItm.BillingType then 1
        ELSE 0 END
)
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate
	AND ISNULL(sett.AssignedToPercent,0) !=0
		---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN 
	    (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem  WHERE IsReturnTxn=1) 
---End: 2.1 For Assigned Incentive (No Group Distribution)-----------

UNION ALL

---2.2-- Start: For Assigned Incentive (Group Distribution Only)-----------
 
Select  
  ---1. Primary Columns: These are primary columns -- and are in exact sequence with that of INCTV_TXN_IncentiveFractionItem table--
  fyear.FiscalYearFormatted +'-'+ txn.InvoiceCode + cast(txn.InvoiceNo as varchar(20)) AS 'InvoiceNoFormatted' ,
   rettxn.CreatedOn 'TransactionDate',
   sett.PriceCategoryName 'PriceCategory',
   txn.BillingTransactionId, BillingTransactionItemId, txn.PatientId, sett.BillItemPriceId, sett.ItemName,
   - txnItm.TotalAmount 'TotalBillAmount',
    'assigned' as IncentiveType, 
  -- incentive goes to:  ToEmployeeId----
   sett.ToEmployeeId 'IncentiveReceiverId', sett.ToEmployeeName 'IncentiveReceiverName',
    sett.DistributionPercent 'IncentivePercent', 
	- txnitm.TotalAmount* ISNULL(sett.DistributionPercent,0)/100 'IncentiveAmount',
	0 AS IsPaymentProcessed, NULL AS PaymentInfoId, 
	1 as CreatedBy, GetDate() as CreatedOn, NULL AS ModifiedBy, NULL AS ModifiedOn,1 AS IsActive,
	1 as IsMainDoctor,
	ISNULL(sett.TDSPercent,0) AS TDSPercentage,
	- ( txnitm.TotalAmount* ISNULL(sett.DistributionPercent,0)/100 ) *ISNULL(sett.TDSPercent,0)/100   AS 'TDSAmount'  -- TDSAmount=IncentiveAmt*TDSPercent/100
	, 1 AS IsReturnTxn

from BIL_TXN_BillingTransaction txn 
  INNER JOIN
    BIL_TXN_InvoiceReturn retTxn ON txn.BillingTransactionId = retTxn.BillingTransactionId 
   INNER JOIN
      BIL_TXN_BillingTransactionItems txnItm
       ON txn.BillingTransactionId=txnItm.BillingTransactionId
   INNER JOIN PAT_Patient pat
      ON txn.PatientId=pat.PatientId
  INNER JOIN BIL_CFG_FiscalYears fyear 
      ON TXN.FiscalYearId = fyear.FiscalYearId
  INNER JOIN 
	 FN_INCTV_GetIncentiveSettings_GroupDistribution() sett  -- this gives us group distribution settings only.. 
  
  --[FN_INCTV_GetIncentiveSettings] () sett
ON txnItm.ServiceDepartmentId = sett.ServiceDepartmentId
    AND txnItm.ItemId=sett.ItemId
    AND txnItm.ProviderId = sett.FromEmployeeId
	AND 1 = (
        Case WHEN ISNULL(sett.BillingTypesApplicable,'both')='both' then 1
        WHEN sett.BillingTypesApplicable = txnItm.BillingType then 1
        ELSE 0 END
)
Where  Convert(Date,txn.CreatedOn) BETWEEN @FromDate and @ToDate 
	AND ISNULL(sett.DistributionPercent,0) !=0
		---4Apr'20/Sud: changed from BillingTransactionId to BillingTransactionItemId
	and txnItm.BillingTransactionItemId NOT IN 
	    (SELECT DISTINCT BillingTransactionItemId FROM INCTV_TXN_IncentiveFractionItem  WHERE IsReturnTxn=1) 

---2.2-- End: For Assigned Incentive (Group Distribution Only)-----------

END--end of IF.. 

--by default returning something so that we understand it has been executed..
Select 'success' as 'status' 

END--end of SP--
GO


  --End: Pratik: 22 oct 2020:-- Incentive-IP/OP Separation on Bill Sync
-----END: 04 Nov '20, Merged Inctv_IpOpSeparation to DEV branch----

----START:NageshBB: On 09 Nov 2020-- Merged ACC to DEV branch -ACC-Incremental script merging start here -----------------


-- START:Vikas:13th Oct 2020: Parameters for show particular in ledger report.
IF NOT EXISTS(Select  top 1 * from CORE_CFG_Parameters Where ParameterGroupName='Accounting' and ParameterName='AccLedgerReportShowParticulars')
BEGIN
	Insert Into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,[Description],ParameterType)
	Values('Accounting','AccLedgerReportShowParticulars','false','boolean','Enable/Disable to show and hide particular columns in ledger report','custom'); 
END
GO
-- END:Vikas:13th Oct 2020: Parameters for show particular in ledger report.

--START: Vikas: 30 Oct 2020: Application and permission for sections.
IF NOT EXISTS(Select  top 1 * from RBAC_Application Where ApplicationCode='ACC-Section' and ApplicationName='Accounts-Sections')
BEGIN
INSERT INTO RBAC_Application(ApplicationCode,ApplicationName,IsActive,CreatedBy,CreatedOn)
VALUES('ACC-Section','Accounts-Sections',1,1,GETDATE())
END
Go

Declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Accounts-Sections' and ApplicationCode='ACC-Section');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('acc-sections-inventory',@ApplicationId,1,GETDATE(),1);
Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('acc-sections-billing',@ApplicationId,1,GETDATE(),1);
Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('acc-sections-pharmacy',@ApplicationId,1,GETDATE(),1);
Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('acc-sections-manual_voucher',@ApplicationId,1,GETDATE(),1);
Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('acc-sections-incentive',@ApplicationId,1,GETDATE(),1);
GO
--END: Vikas: 30 Oct 2020: Application and permission for sections.

-- START:Vikas:9th Nov 2020: Chart of accounts changes
--1. Create PrimaryGroup Table
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Object_ID = Object_ID(N'dbo.ACC_MST_PrimaryGroup'))
BEGIN
	CREATE TABLE [dbo].[ACC_MST_PrimaryGroup](
		[PrimaryGroupId] [int] IDENTITY(1,1) NOT NULL,
		[PrimaryGroupCode] [varchar](20) NULL,
		[PrimaryGroupName] [varchar](100) NULL,
		[IsActive] [bit] NULL,
		[CreatedOn] [datetime] NULL,
		[CreatedBy] [int] NULL,
		[ModifiedOn] [datetime] NULL,
		[ModifiedBy] [int] NULL,
	 CONSTRAINT [PK_ACC_MST_PrimaryGroup] PRIMARY KEY CLUSTERED 
		(
			[PrimaryGroupId] ASC
		)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
		) ON [PRIMARY]
	----------- Insert values into ACC_MST_PrimaryGroup table.
	INSERT INTO ACC_MST_PrimaryGroup(PrimaryGroupName,IsActive,CreatedOn,CreatedBy)
	SELECT distinct(PrimaryGroup),1,GETDATE(),1
	FROM ACC_MST_LedgerGroup
END
GO

--2. Create Chart of account table
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Object_ID = Object_ID(N'dbo.ACC_MST_ChartOfAccounts'))
BEGIN
	CREATE TABLE [dbo].[ACC_MST_ChartOfAccounts](
		[ChartOfAccountId] [int] IDENTITY(1,1) NOT NULL,
		[ChartOfAccountName] [varchar](100) NULL,
		[COACode] [varchar](20) NULL,
		[PrimaryGroupId] [int] NULL,
		[Description] [varchar](200) NULL,
		[CreatedOn] [datetime] NULL,
		[CreatedBy] [int] NULL,
		[ModifiedOn] [datetime] NULL,
		[ModifiedBy] [int] NULL,
		[IsActive] [bit] NULL,
	 CONSTRAINT [PK_ACC_MST_ChartOfAccounts] PRIMARY KEY CLUSTERED 
	(
		[ChartOfAccountId] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]

	---------Insert values into ACC_MST_ChartOfAccounts table.
	INSERT INTO ACC_MST_ChartOfAccounts(ChartOfAccountName,PrimaryGroupId,IsActive,CreatedOn,CreatedBy)
	SELECT distinct(COA),(select PrimaryGroupId from ACC_MST_PrimaryGroup p where p.PrimaryGroupName=PrimaryGroup),1,GETDATE(),1
	FROM ACC_MST_LedgerGroup
END
GO
--3. Added COAId column in ACC_MST_LedgerGroup table
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'COAId'
	 AND Object_ID = Object_ID(N'dbo.ACC_MST_LedgerGroup'))
BEGIN
	ALTER TABLE ACC_MST_LedgerGroup ADD COAId int null;
END
GO

--4. Migrate COAId column from ACC_MST_LedgerGroup table
IF EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'COAId'
	 AND Object_ID = Object_ID(N'dbo.ACC_MST_LedgerGroup'))
BEGIN
	UPDATE ACC_MST_LedgerGroup 
	SET COAId = (SELECT ChartOfAccountId FROM ACC_MST_ChartOfAccounts ch WHERE ch.ChartOfAccountName= COA)
END
GO
--5. route permissions for COA page in accounting settings.
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Accounting' and ApplicationCode='AC');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('coa-list-view',@ApplicationId,1,GETDATE(),1);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='coa-list-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Accounting/Settings')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive)
values ('COA', 'Accounting/Settings/COAList','COAList',@PermissionId,@RefParentRouteId,1,1);
GO
-- END:Vikas:9th Nov 2020: Chart of accounts changes

----END:NageshBB: On 09 Nov 2020-- Merged ACC to DEV branch -ACC-Incremental script merging start here -----------------

----Start: Anjana: 11/10/2020 Making Vitals entry in ER mandatory if ERAddVitalBeforeTriage set to true------
Insert into CORE_CFG_Parameters ([ParameterGroupName],[ParameterName],[ParameterValue],[ValueDataType],[Description],[ParameterType])
values('Emergency','ERAddVitalBeforeTriage ','true','boolean','Disable Triage button if set to true and vitals not added.','custom');
Go 
----END: Anjana: 11/10/2020 Making Vitals entry in ER mandatory if ERAddVitalBeforeTriage set to true------

-----START: Rusha: 20th Nov '20, Merged ER_PatientOverView to DEV script----

---------START: Anish: ER Patient Overview Script--------------------------------
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Emergency' and ApplicationCode='ER');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('emergency-lama-patients-view',@ApplicationId,1,GETDATE(),1),
('emergency-transferred-patients-view',@ApplicationId,1,GETDATE(),1),
('emergency-discharged-patients-view',@ApplicationId,1,GETDATE(),1),
('emergency-admitted-patients-view',@ApplicationId,1,GETDATE(),1),
('emergency-death-patients-view',@ApplicationId,1,GETDATE(),1),
('emergency-dor-patients-view',@ApplicationId,1,GETDATE(),1);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='emergency-lama-patients-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Emergency/FinalizedPatients')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive)
values ('LAMA', 'Emergency/FinalizedPatients/Lama-Patients','Lama-Patients',@PermissionId,@RefParentRouteId,1,1);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='emergency-transferred-patients-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Emergency/FinalizedPatients')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive)
values ('Transferred', 'Emergency/FinalizedPatients/Transferred-Patients','Transferred-Patients',@PermissionId,@RefParentRouteId,1,1);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='emergency-discharged-patients-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Emergency/FinalizedPatients')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive)
values ('Discharged', 'Emergency/FinalizedPatients/Discharged-Patients','Discharged-Patients',@PermissionId,@RefParentRouteId,1,1);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='emergency-admitted-patients-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Emergency/FinalizedPatients')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive)
values ('Admitted', 'Emergency/FinalizedPatients/Admitted-Patients','Admitted-Patients',@PermissionId,@RefParentRouteId,1,1);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='emergency-death-patients-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Emergency/FinalizedPatients')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive)
values ('Death', 'Emergency/FinalizedPatients/Death-Patients','Death-Patients',@PermissionId,@RefParentRouteId,1,1);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='emergency-dor-patients-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Emergency/FinalizedPatients')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive)
values ('DOR', 'Emergency/FinalizedPatients/Dor-Patients','Dor-Patients',@PermissionId,@RefParentRouteId,1,1);
GO



Declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Emergency' and ApplicationCode='ER');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('emergency-patient-view',@ApplicationId,1,GETDATE(),1),
('emergency-patient-overview-view',@ApplicationId,1,GETDATE(),1),
('emergency-clinical-view',@ApplicationId,1,GETDATE(),1),
('emergency-wardbilling-view',@ApplicationId,1,GETDATE(),1),
('emergency-drugrequest-view',@ApplicationId,1,GETDATE(),1),
('emergency-notes-view',@ApplicationId,1,GETDATE(),1);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='emergency-patient-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Emergency')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive,DisplaySeq)
values ('Patient Overview', 'Emergency/PatientOverviewMain','PatientOverviewMain',@PermissionId,@RefParentRouteId,0,1,5);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='emergency-patient-overview-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Emergency/PatientOverviewMain')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive,DisplaySeq)
values ('Patient Overview', 'Emergency/PatientOverviewMain/PatientOverview','PatientOverview',@PermissionId,@RefParentRouteId,1,1,5);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='emergency-clinical-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Emergency/PatientOverviewMain')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive,DisplaySeq)
values ('Clinical', 'Emergency/PatientOverviewMain/Clinical','Clinical',@PermissionId,@RefParentRouteId,1,1,10);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='emergency-wardbilling-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Emergency/PatientOverviewMain')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive,DisplaySeq)
values ('Ward Request', 'Emergency/PatientOverviewMain/WardBilling','WardBilling',@PermissionId,@RefParentRouteId,1,1,15);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='emergency-drugrequest-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Emergency/PatientOverviewMain')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive,DisplaySeq)
values ('Drugs Request', 'Emergency/PatientOverviewMain/DrugsRequest','DrugsRequest',@PermissionId,@RefParentRouteId,1,1,20);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='emergency-notes-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Emergency/PatientOverviewMain')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive,DisplaySeq)
values ('Notes', 'Emergency/PatientOverviewMain/Notes','Notes',@PermissionId,@RefParentRouteId,1,1,25);
GO


Declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Emergency' and ApplicationCode='ER');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('emergency-patient-ov-vitals-view',@ApplicationId,1,GETDATE(),1),
('emergency-patient-ov-allergy-view',@ApplicationId,1,GETDATE(),1),
('emergency-patient-ov-inputoutput-view',@ApplicationId,1,GETDATE(),1),
('emergency-patient-ov-medication-view',@ApplicationId,1,GETDATE(),1)
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='emergency-patient-ov-medication-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Emergency/PatientOverviewMain/Clinical')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive,DisplaySeq)
values ('HomeMedication', 'Emergency/PatientOverviewMain/Clinical/HomeMedication','HomeMedication',@PermissionId,@RefParentRouteId,1,1,20);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='emergency-patient-ov-inputoutput-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Emergency/PatientOverviewMain/Clinical')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive,DisplaySeq)
values ('InputOutput', 'Emergency/PatientOverviewMain/Clinical/InputOutput','InputOutput',@PermissionId,@RefParentRouteId,1,1,15);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='emergency-patient-ov-allergy-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Emergency/PatientOverviewMain/Clinical')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive,DisplaySeq)
values ('Allergy', 'Emergency/PatientOverviewMain/Clinical/Allergy','Allergy',@PermissionId,@RefParentRouteId,1,1,10);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='emergency-patient-ov-vitals-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Emergency/PatientOverviewMain/Clinical')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive,DisplaySeq)
values ('Vitals', 'Emergency/PatientOverviewMain/Clinical/Vitals','Vitals',@PermissionId,@RefParentRouteId,1,1,5);
GO

---------END: Anish: ER Patient Overview Script--------------------------------

-----END: Rusha: 20th Nov '20, Merged ER_PatientOverView to DEV script----

-----START: Rusha: 20th Nov '20, Merged Inctv_ProfileSettingReDesign to DEV script----
---Start:pratik: 3 November 2020: ReDesign the Profile Settings page
ALTER TABLE INCTV_MST_Profile
ADD Description varchar(1000);
Go
---End: pratik: 3 November 2020: ReDesign the Profile Settings page

---Start: pratik: 9 November 2020:
ALTER TABLE INCTV_BillItems_Profile_Map
 ADD BillingTypesApplicable varchar(20);
 GO

ALTER TABLE INCTV_MST_Profile
ADD CreatedBy int ,
  CreatedOn datetime,
  ModifiedBy int, 
  ModifiedOn datetime;
GO

ALTER TABLE INCTV_BillItems_Profile_Map
ADD CreatedBy int ,
  CreatedOn datetime,
  ModifiedBy int, 
  ModifiedOn datetime;
GO

DROP TABLE INCTV_EMP_Profile_Map;
Go
---End: pratik: 9 November 2020:
-----END: Rusha: 20th Nov '20, Merged Inctv_ProfileSettingReDesign to DEV script----

--Start:Anjana: 2020/11/19: Permission for provisional billing feature-----
Declare @ApplicationId INT set @ApplicationId = (Select TOP (1) ApplicationId from RBAC_Application 
	where ApplicationName = 'Pharmacy' and ApplicationCode= 'PHRM');

Insert into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
Values ('btn-phrm-provisional-bill',@ApplicationId,1,GETDATE(),1);
Go
--End:Anjana: 2020/11/19: Permission for provisional billing feature-----

--START:VIKAS:23th Nov 2020: Added missing parameters @HospitalId.
/****** Object:  StoredProcedure [dbo].[SP_ACC_RPT_GetProfitAndLossData]    Script Date: 23-11-2020 12:05:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_ACC_RPT_GetProfitAndLossData]
    @FromDate DATETIME,
    @ToDate DATETIME,
    @HospitalId INT
  AS
  --EXEC [dbo].[SP_ACC_RPT_GetProfitAndLossData] @FromDate = '2020-06-12 18:00:21.657', @ToDate ='2020-06-11 18:00:21.657'
  
  /************************************************************************
  FileName: [[SP_ACC_RPT_GetProfitAndLossData]]
  CreatedBy/date: Nagesh /12'June2020
  Description: get records for profit & Loss report of accounting
  Change History
  -------------------------------------------------------------------------
  S.No.    UpdatedBy/Date                        Remarks
  -------------------------------------------------------------------------
  1       Nagesh /12'June2020            created script for get profit and loss report records
  2.      Sud/Nagesh: 20Jun'20                   Added HospitalId for Phrm-Separation
  *************************************************************************/
  BEGIN
  
    IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
    BEGIN          
       declare @Revenue varchar(50)=(select name from ACC_MST_CodeDetails where code='001' and HospitalId=@HospitalId)
     declare @Expenses varchar(50)=(select name from ACC_MST_CodeDetails where code='002' and HospitalId=@HospitalId)
    
    Select l.LedgerId, 
    lg.PrimaryGroup, 
    l.LedgerName,
    lg.COA, 
    lg.LedgerGroupName, 
    l.Code, 
    SUM(txnItm.DrAmount) 'DRAmount', 
    SUM(txnItm.CrAmount) 'CRAmount'
        FROM ACC_Transactions  txn
        INNER JOIN 
          (Select  
         TransactionId, LedgerId,
         Case WHEN DrCr=1 THEN Amount ELSE 0 END AS DrAmount,
         Case WHEN DrCr=0 THEN Amount ELSE 0 END AS CrAmount
         from  ACC_TransactionItems where HospitalId=@HospitalId ) txnItm 
         ON txn.TransactionId = txnItm.TransactionId
         INNER JOIN ACC_Ledger l
         ON txnItm.LedgerId = l.LedgerId
         INNER JOIN ACC_MST_LedgerGroup lg
         ON l.LedgerGroupId = lg.LedgerGroupId   and lg.PrimaryGroup IN (@Revenue, @Expenses)
    WHERE  l.HospitalId=@HospitalId  and lg. HospitalId=@HospitalId and
    convert(date, txn.TransactionDate) BETWEEN convert(date,@FromDate) and  convert(date,@ToDate) 
    Group by l.LedgerId, lg.PrimaryGroup, l.LedgerName,lg.COA, lg.LedgerGroupName, l.Code
  
    END    
  END
GO

--END:VIKAS:23th Nov 2020: Added missing parameters @HospitalId.


--START: Sanjesh: 26 Nov'20 --filtering out quantity >= 0 in  StoredProcedure [dbo].[SP_PHRMStoreStock] 

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_PHRMStoreStock]
	@Status varchar(200) = NULL
AS
/*
FileName: [SP_PHRMStore]
CreatedBy/date: Shankar/04-03-2019
Description: To get the Details of store Items
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/04-08-2019						Add From and to Date for date filter
2.		Sanjit/04-09-2019						StoreName has been added.
3.      Shankar/04-15-2019                      IsActive added.
4.		Rusha/05-23-2019						Remove From and to Date for date filter and handled quantity not equals to zero
5.		Rusha/06-11-2019						Updated script
6.		Naveed/24-11-2019						Get GR CreatedOn date as Date in Store details List
7.		Ramavtar/04-Jan-2020					Filtered out Quantity > 0
8.		Sanjit/03-Jan-2020						Generic Name added.
9.      Sanjesh/19-Aug-2020                     GoodReceiptId added.
10.     Sanjesh/26-Nov-2020                     Filtered out Quantity >= 0
----------------------------------------------------------------------------
*/
BEGIN
	IF(@Status IS NOT NULL)
		BEGIN
				SELECT  x1.ItemName,x1.GenericName,x1.BatchNo, x1.ExpiryDate,Round(x1.MRP,2,0) AS MRP,x1.GoodReceiptId,
			    (SELECT CreatedOn FROM PHRM_GoodsReceiptItems where GoodReceiptItemId= x1.GoodsReceiptItemId )AS 'Date',
				SUM(FInQty + InQty - FOutQty - OutQty) AS 'AvailableQty',x1.StoreName,x1.ItemId,x1.StoreId,x1.GoodsReceiptItemId,x1.Price
				FROM(SELECT stk.ItemName,gen.GenericName, stk.BatchNo, stk.ExpiryDate, stk.MRP,stk.StoreName,
				stk.StoreId,stk.ItemId,stk.GoodsReceiptItemId,stk.Price,gritm.GoodReceiptId,
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.Quantity ELSE 0 END) AS 'InQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.Quantity ELSE 0 END) AS 'OutQty',
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'
				FROM [dbo].[PHRM_StoreStock] AS stk
				join PHRM_GoodsReceiptItems as gritm on gritm.GoodReceiptItemId = stk.GoodsReceiptItemId
				join PHRM_MST_Item as itm on stk.ItemId = itm.ItemId
				join PHRM_MST_Generic gen on itm.GenericId = gen.GenericId
				GROUP BY stk.ItemName,gen.GenericName, stk.BatchNo , stk.ExpiryDate, stk.MRP,stk.StoreName,stk.StoreId,stk.ItemId,stk.GoodsReceiptItemId,stk.Price,gritm.GoodReceiptId)as x1
				WHERE (@Status=x1.ItemName or x1.ItemName like '%'+ISNULL(@Status,'')+'%')
				GROUP BY x1.ItemName,x1.GenericName, x1.BatchNo, x1.ExpiryDate, x1.MRP,x1.StoreName,x1.ItemId,x1.StoreId,x1.GoodsReceiptItemId,x1.Price,x1.GoodReceiptId
				HAVING SUM(FInQty + InQty - FOutQty - OutQty) >= 0	-- filtering out quantity >= 0
				ORDER BY x1.ItemName
		END		
END
GO
--END: Sanjesh: 26 Nov'20 --filtering out quantity >= 0 in  StoredProcedure [dbo].[SP_PHRMStoreStock] 

-----START: Shankar: 01 Dec,2020, SP for Pharmacy Cashcollection report-------------
GO
/****** Object:  StoredProcedure [dbo].[SP_PHRM_CashCollectionSummaryReport]    Script Date: 11/2/2020 9:04 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_PHRM_CashCollectionSummaryReport]  --- [SP_PHRM_CashCollectionSummaryReport] '03/23/2020','03/23/2020'
@FromDate datetime=null,
 @ToDate datetime=null
 AS
 /*
FileName: [[SP_PHRM_CashCollectionSummaryReport]]
CreatedBy/date: Dinesh 2nd Sept 2019 
Description: .
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Dinesh 2nd Sept 2019                   created the script
2		Ashish 14th Jan 2020				fixx bug Provisional credit invoice amount showing  --if transaction is Provisional and paymenttype is credit then entry into settlement tbl  	
3       Shankar 17th March 2020	            deducted from deposit amount was showing in user collection which is fixed here on.
--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
    BEGIN
	select [Date], UserName, sum(TotalAmount) as TotalAmount, sum(ReturnAmount) as ReturnedAmount, sum((TotalAmount+DepositAmount)-(ReturnAmount+DepositReturn)) as NetAmount, sum(DiscountAmount) as DiscountAmount, sum(DepositAmount) as DepositAmount, sum(DepositReturn) as DepositReturn
	from ( 
          SELECT convert(date,inv.CreateOn) as [Date] ,usr.UserName,sum(inv.PaidAmount)as TotalAmount, 0 as ReturnAmount,sum(inv.DiscountAmount) as DiscountAmount,  0 as DepositAmount, 0 as DepositReturn
            FROM [PHRM_TXN_Invoice] inv
              INNER JOIN RBAC_User usr
             on inv.CreatedBy=usr.EmployeeId      
              where  (convert(datetime, inv.CreateOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 ) and inv.BilStatus='paid' and inv.SettlementId is null and inv.DepositDeductAmount=0
              group by convert(date,inv.createon),UserName
			  
			 
			  union all 
			    SELECT convert(date,stl.CreatedOn) as [Date] ,usr.UserName,sum(stl.PayableAmount)as TotalAmount, 0 as ReturnAmount,sum(stl.DiscountAmount) as DiscountAmount,  0 as DepositAmount, 0 as DepositReturn
            FROM [PHRM_TXN_Settlement] stl
              INNER JOIN RBAC_User usr
             on stl.CreatedBy=usr.EmployeeId
              where  (convert(datetime, stl.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 ) 
              group by convert(date,stl.CreatedOn),UserName
			  
			  union all
			  select convert(date,invRet.CreatedOn) as [Date], usr.UserName, 0 as TotalAmount,sum(invRet.TotalAmount ) as ReturnAmount,  sum(DiscountAmount) as DiscountAmount, 0 as DepositAmount, 0 as DepositReturn
			  From[PHRM_TXN_InvoiceReturn] invRet
			  INNER JOIN RBAC_User usr
			  on invRet.CreatedBy = usr.EmployeeId
			  where convert(datetime, invRet.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 and invRet.InvoiceId is not null
			  group by convert(date,invRet.CreatedOn),UserName

			  union all
			  select convert(date,depo.CreatedOn) as [Date], usr.UserName, 0 as TotalAmount, 0 as ReturnAmount, 0 as DiscountAmount, sum(depo.DepositAmount) as DepositAmount, 0 as DepositReturn
			  From PHRM_Deposit as depo
			  INNER JOIN RBAC_User as usr
			  on depo.CreatedBy = usr.EmployeeId
			  where convert(datetime, depo.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 and depo.DepositType = 'deposit'
			  group by convert(date, depo.CreatedOn), UserName

			  union all
			  select convert(date,depo.CreatedOn) as [Date], usr.UserName, 0 as TotalAmount, 0 as ReturnAmount, 0 as DiscountAmount, 0 as DepositAmount, sum(depo.DepositAmount) as DepositReturn
			  From PHRM_Deposit as depo
			  INNER JOIN RBAC_User as usr
			  on depo.CreatedBy = usr.EmployeeId
			 
			  where convert(datetime, depo.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 and depo.DepositType ='depositreturn'
			  group by convert(date, depo.CreatedOn), UserName


			  )	  tabletotal
			  Group BY [Date], UserName
      End
End
GO
-----END: Shankar: 01 Dec,2020, SP for Pharmacy Cashcollection report-------------

-----START: Shankar: 01 Dec 2020, SP for User collection report----------------
GO
/****** Object:  UserDefinedFunction [dbo].[FN_PHRM_PharmacyTxn_ByBillingType_UserCollection]    Script Date: 11/2/2020 10:02 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--select * from FN_PHRM_PharmacyTxn_ByBillingType_UserCollection('2020-03-16','2020-03-16')
-- =============================================
-- Author:		Salakha
-- Create date: 26/08/2019
-- Description:	calculates daily sales for pharmacy
-- =============================================

/* Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Dinesh/Abhishek 2nd Sept 2019          Credit logic, credit return logic optimized 
2		Vikas	10th Jan 2020				   Credit sales, and credit received query modified.
3       Shankar  23rd March 2020               depositdeduct included 
4		Shankar  20th Aug 2020				   Cash return query optimized
5       Shankar 27th Aug 2020                  Cash collection taken from Paid amount to remove decimal issue in report
--------------------------------------------------------

*/
ALTER FUNCTION [dbo].[FN_PHRM_PharmacyTxn_ByBillingType_UserCollection]
(@FromDate Date, @ToDate Date)
RETURNS TABLE

AS
RETURN
(

		SELECT * FROM 
		(
				--Cash Invoices (Same Day)--
				Select   Convert(Date,CreateOn) 'Date', 
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 Patientid,
						 InvoiceId,
						 'CashInvoice' AS 'TransactionType',
						 SubTotal,
						 DiscountAmount,
						 VATAmount,
						 TotalAmount, 
						 PaidAmount AS 'CashCollection', 
						 0 AS 'DepositReceived', 
						 0 AS 'DepositRefund', 
						 0 AS 'DepositDeduct',
						 0 AS 'CreditReceived',  
						 0 AS 'CreditAmount',
						 CounterId, 
						 CreatedBy 'EmployeeId',
						 Remark 'Remarks',  
						 1 as DisplaySeq
				from PHRM_TXN_Invoice
				Where PaymentMode ='cash' and Convert(Date,CreateOn) = Convert(Date,CreateOn)

				UNION ALL

				--Credit Sales (Same Day)--
				SELECT COnvert(Date,CreateOn) 'Date', 
					   'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
					   Patientid,
					   InvoiceId,
					   'CreditInvoice' AS 'TransactionType',
					   SubTotal,
					   DiscountAmount,
					   TotalAmount,
					   VATAmount, 
					   0 AS 'CashCollection', 
					   0 AS 'DepositReceived', 
					   0 AS 'DepositRefund', 
					   0 AS 'DepositDeduct',
					   0 AS 'CreditReceived',
					   TotalAmount  AS 'CreditAmount',
					   CounterId, 
					   CreatedBy 'EmployeeId',
					   Remark 'Remarks', 
					   2 as DisplaySeq 
				FROM PHRM_TXN_Invoice
				WHERE (PaymentMode = 'credit' and BilStatus='unpaid') 
				--and(Convert(Date,CreateOn) = Convert(Date,CreateOn))  --VIKAS:10th Jan 2020

				UNION ALL

				--Credit Received (from previous day)
				Select  Convert(Date,PaidDate) 'Date',  
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 Patientid,
						 InvoiceId,
						'CreditInvoiceReceived' AS 'TransactionType',
						 0 AS SubTotal, 
						 0 AS DiscountAmount, 
						 0 AS VATAmount,  
						 0 AS TotalAmount, 
					     PaidAmount AS 'CashCollection', 
						 0 AS 'DepositReceived', 
						 0 AS 'DepositRefund', 
						 0 AS 'DepositDeduct',
					   	 TotalAmount AS 'CreditReceived',  
						 0  AS 'CreditAmount',
					     CounterId AS 'CounterId', 
						 CreatedBy AS 'EmployeeId', 
						 Remark 'Remarks', 
						 3 as DisplaySeq 
				from PHRM_TXN_Invoice
				Where (PaymentMode='credit'and BilStatus='paid')  
				--and Convert(Date,PaidDate) != Convert(Date,CreditDate) --VIKAS:10th Jan 2020

				UNION ALL
				--Cash Return---
				SELECT   Convert(Date,ret.CreatedOn) 'Date',  
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						  ret.PatientId,
						  ret.InvoiceId,
						 'CashInvoiceReturn' AS 'TransactionType',
						 (-ret.SubTotal) 'SubTotal', 
						 (-ret.DiscountAmount) 'DiscountAmount', 
						 (-ret.VATAmount) 'VATAmount', 
						 (-ret.TotalAmount) 'TotalAmount', 
	  					 (-ret.TotalAmount) AS 'CashCollection', 
						 0 AS 'DepositReceived', 
						 0 AS 'DepositRefund',
						 0 AS 'DepositDeduct',
						 0 AS 'CreditReceived', 
						 0 AS 'CreditAmount',
						ret.CounterId, 
						ret.CreatedBy 'EmployeeId', 
						ret.Remarks 'Remarks', 
						4 as DisplaySeq 
				FROM PHRM_TXN_InvoiceReturn ret, PHRM_TXN_Invoice txn
				where (ret.InvoiceId=txn.InvoiceId and txn.PaymentMode='cash') or (ret.InvoiceId=txn.InvoiceId and 
				txn.PaymentMode='credit' and txn.settlementId is not null)
				 --If billstatus is paid, regardless it was Credit + Settled, it should come in Cash Return--
				  
				UNION ALL
				--Credit Return---
				SELECT   Convert(Date,ret.CreatedOn) 'Date', 
					    'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 txn.PatientId,
						 ret.InvoiceId,
						 'CreditInvoiceReturn' AS 'TransactionType',
						 (-ret.SubTotal) 'SubTotal', 
						 (-txn.DiscountAmount) 'DiscountAmount', 
						 (-txn.VATAmount) 'VATAmount', 
						 (-ret.TotalAmount) 'TotalAmount', 
	  					 (0) AS 'CashCollection',  
						 0 AS 'DepositReceived', 
						 0 AS 'DepositRefund', 
						 0 AS 'DepositDeduct',
						 0 AS 'CreditReceived', 
						 (-ret.TotalAmount) 'CreditAmount',
						 ret.CounterId, 
						 ret.CreatedBy 'EmployeeId', 
						 ret.Remark 'Remarks', 
						 5 as DisplaySeq
				FROM PHRM_TXN_InvoiceReturnItems ret, PHRM_TXN_Invoice txn
				where ret.InvoiceId=txn.InvoiceId
				and txn.PaymentMode='credit' and settlementId is null
			) A
			WHERE A.Date BETWEEN @FromDate and @ToDate
) -- end of return
GO

/****** Object:  StoredProcedure [dbo].[SP_PHRM_UserwiseCollectionReport]    Script Date: 11/2/2020 9:58 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_PHRM_UserwiseCollectionReport]  

@FromDate datetime=null,
@ToDate datetime=null,
@CounterId varchar(max)=null,
@CreatedBy varchar(max)=null
 AS
 /*
FileName: [[SP_PHRM_UserwiseCollectionReport]]
CreatedBy/date: Nagesh/Vikas/2018-07-31
Description: .
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1      Nagesh/Vikas/2018-07-31                       created the script
2      Abhishek/2018-08-06					 Return and NetAmount calculation
3	   Salakha/2019-08-26					Billing type wise Calculation 
4. 		Dinesh /Abhishek 2nd Sept 2019		Counter corrected for pharmacy 
5.      Shankar 23rd March 2020             Included deposit deduct and deposit refund
--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
    BEGIN
	select 
	    	bills.Date,
			bills.InvoiceNo 'ReceiptNo',
			pat.PatientCode 'HospitalNo',
			pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
			bills.TransactionType 'TransactionType',
			bills.SubTotal,
			bills.DiscountAmount,
			bills.VATAmount,
			bills.TotalAmount, 
			bills.CashCollection, 
			bills.DepositReceived,
			bills.DepositRefund,
			bills.DepositDeduct,
			bills.CreditReceived,
			bills.CreditAmount,
			bills.CounterId, 
			bills.[EmployeeId],
			bills.Remarks,
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy
	from ( 

					Select * from FN_PHRM_PharmacyTxn_ByBillingType_UserCollection(@FromDate,@ToDate)
	    
					UNION ALL

					--All Deposits Transactions---
					Select   Convert(Date,CreatedOn) 'Date', 
							 'DR'+ Convert(varchar(20),ISNULL(ReceiptNo,'')) 'InvoiceNo', 
							 Patientid,
							 0 AS 'InvoiceId',
							 CASE WHEN DepositType='Deposit' THEN 'AdvanceReceived' 
								WHEN DepositType='depositdeduct' OR DepositType='depositreturn' THEN 'AdvanceSettled' END AS 'TransactionType',
			
							 0 As SubTotal,0 AS DiscountAmount,0 AS VATAmount, 0 AS TotalAmount, 
							 CASE WHEN DepositType='Deposit' THEN DepositAmount WHEN DepositType='depositdeduct' OR DepositType='depositreturn' THEN (-DepositAmount) END AS 'CashCollection',
							  CASE WHEN DepositType='Deposit' THEN DepositAmount ELSE 0 END AS 'DepositReceived',
							CASE WHEN  DepositType='depositreturn' THEN DepositAmount ELSE 0 END AS 'DepositRefund',

						   CASE WHEN  DepositType='depositdeduct' THEN DepositAmount ELSE 0 END AS 'DepositDeduct'
							 , 0 AS CreditReceived,  0 AS 'CreditAmount',
							 CounterId 'CounterId', CreatedBy 'EmployeeId',Remark 'Remarks', 6 as DisplaySeq 
					from PHRM_Deposit
					WHERE COnvert(Date,CreatedOn) BETWEEN @FromDate and @ToDate	


			) bills,

		EMP_Employee emp,
		PAT_Patient pat,
		PHRM_MST_Counter cntr
		WHERE bills.PatientId = pat.PatientId
				AND emp.EmployeeId = bills.EmployeeId
				AND bills.CounterId = cntr.CounterId
		        AND (bills.CounterId LIKE '%' + ISNULL(@CounterId, bills.CounterId) + '%')
		        AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')
		
       Order by bills.DisplaySeq

	   	   
   --Table2: For Settlement Details, needed Discount and DueAmount for UserCollection-Cash Collection fields.
   --We Only need collective amount for Settlement Amounts.
	 Select 
	        sett.CreatedBy 'EmployeeId',
			Sett.CounterId,
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
			 --Case When sett.PayableAmount > 0 then PayableAmount - ( DepositDeducted + ISNULL(DiscountAmount,0) + ISNULL(DueAmount,0)) ELSE 0 END AS PaidAmount, 
			SUM(Case When sett.PayableAmount > 0 then sett.PaidAmount ELSE 0 END) AS 'SettlPaidAmount', 
			SUM( Case WHEN sett.RefundableAmount > 0 THEN sett.ReturnedAmount ELSE 0 END ) AS 'SettlReturnAmount',
			SUM( Case WHEN sett.DueAmount > 0 THEN sett.DueAmount ELSE 0 END ) AS 'SettlDueAmount',
			SUM( Case WHEN  sett.DiscountAmount > 0 THEN sett.DiscountAmount ELSE 0 END  ) 'SettlDiscountAmount'
	from PHRM_TXN_Settlement sett, 
	    EMP_Employee emp,
		PHRM_MST_Counter cntr 


	WHERE sett.CreatedBy=emp.EmployeeId
	      AND sett.CounterId=cntr.CounterId
		  AND (sett.CounterId LIKE '%' + ISNULL(@CounterId, sett.CounterId) + '%')
		  AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')
	      AND Convert(Date,sett.CreatedOn) BETWEEN Convert(Date, @FromDate) AND Convert(Date, @ToDate) 
    Group By sett.CreatedBy, sett.CounterId,emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName 
      End
End
GO
-----END: Shankar: 01 Dec 2020, SP for User collection report----------------

--Start: Pratik:Dec 2nd 2020: Permissions for different buttons in Settings - Billing - Bill Items----
Declare @ApplicationId INT set @ApplicationId = (Select TOP (1) ApplicationId from RBAC_Application 
	where ApplicationName = 'Settings' and ApplicationCode= 'SETT');

Insert into RBAC_Permission(PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
Values ('btn-settings-bill-item-addnew',@ApplicationId,1,GETDATE(),1), 
	   ('btn-settings-bill-item-edit',@ApplicationId,1,GETDATE(),1),
	   ('btn-settings-bill-item-activate',@ApplicationId,1,GETDATE(),1),
	   ('btn-settings-bill-item-pricehistory',@ApplicationId,1,GETDATE(),1)
	    
Go

--END: Pratik:Dec 2nd 2020: Permissions for different buttons in Settings - Billing - Bill Items----


--Start: Arpan:Dec 7th 2020: PharmacyTxn_ByBillingType_UserCollectio
  --(Net total is missing for credit billing.) and 
  --(Multiple entry for the same Credit Invoice Return in User Collection Report.)----
  
/****** Object:  UserDefinedFunction [dbo].[FN_PHRM_PharmacyTxn_ByBillingType_UserCollection]    Script Date: 12/7/2020 2:50:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--select * from FN_PHRM_PharmacyTxn_ByBillingType_UserCollection('2020-03-16','2020-03-16')
-- =============================================
-- Author:		Salakha
-- Create date: 26/08/2019
-- Description:	calculates daily sales for pharmacy
-- =============================================

/* Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Dinesh/Abhishek 2nd Sept 2019          Credit logic, credit return logic optimized 
2		Vikas	10th Jan 2020				   Credit sales, and credit received query modified.
3       Shankar  23rd March 2020               depositdeduct included 
4		Shankar  20th Aug 2020				   Cash return query optimized
5       Shankar 27th Aug 2020                  Cash collection taken from Paid amount to remove decimal issue in report
6		Arpan 7th Dec 2020					   Net total is missing for credit billing, Multiple entry for the same Credit Invoice Return in User Collection Report.
--------------------------------------------------------

*/
ALTER FUNCTION [dbo].[FN_PHRM_PharmacyTxn_ByBillingType_UserCollection]
(@FromDate Date, @ToDate Date)
RETURNS TABLE

AS
RETURN
(

		SELECT * FROM 
		(
				--Cash Invoices (Same Day)--
				Select   Convert(Date,CreateOn) 'Date', 
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 Patientid,
						 InvoiceId,
						 'CashInvoice' AS 'TransactionType',
						 SubTotal,
						 DiscountAmount,
						 VATAmount,
						 TotalAmount, 
						 PaidAmount AS 'CashCollection', 
						 0 AS 'DepositReceived', 
						 0 AS 'DepositRefund', 
						 0 AS 'DepositDeduct',
						 0 AS 'CreditReceived',  
						 0 AS 'CreditAmount',
						 CounterId, 
						 CreatedBy 'EmployeeId',
						 Remark 'Remarks',  
						 1 as DisplaySeq
				from PHRM_TXN_Invoice
				Where PaymentMode ='cash' and Convert(Date,CreateOn) = Convert(Date,CreateOn)

				UNION ALL

				--Credit Sales (Same Day)--
				SELECT COnvert(Date,CreateOn) 'Date', 
					   'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
					   Patientid,
					   InvoiceId,
					   'CreditInvoice' AS 'TransactionType',
					   SubTotal,
					   DiscountAmount,
					   VATAmount, 
					   TotalAmount,
					   0 AS 'CashCollection', 
					   0 AS 'DepositReceived', 
					   0 AS 'DepositRefund', 
					   0 AS 'DepositDeduct',
					   0 AS 'CreditReceived',
					   TotalAmount  AS 'CreditAmount',
					   CounterId, 
					   CreatedBy 'EmployeeId',
					   Remark 'Remarks', 
					   2 as DisplaySeq 
				FROM PHRM_TXN_Invoice
				WHERE (PaymentMode = 'credit' and BilStatus='unpaid') 
				--and(Convert(Date,CreateOn) = Convert(Date,CreateOn))  --VIKAS:10th Jan 2020

				UNION ALL

				--Credit Received (from previous day)
				Select  Convert(Date,PaidDate) 'Date',  
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 Patientid,
						 InvoiceId,
						'CreditInvoiceReceived' AS 'TransactionType',
						 0 AS SubTotal, 
						 0 AS DiscountAmount, 
						 0 AS VATAmount,  
						 0 AS TotalAmount, 
					     PaidAmount AS 'CashCollection', 
						 0 AS 'DepositReceived', 
						 0 AS 'DepositRefund', 
						 0 AS 'DepositDeduct',
					   	 TotalAmount AS 'CreditReceived',  
						 0  AS 'CreditAmount',
					     CounterId AS 'CounterId', 
						 CreatedBy AS 'EmployeeId', 
						 Remark 'Remarks', 
						 3 as DisplaySeq 
				from PHRM_TXN_Invoice
				Where (PaymentMode='credit'and BilStatus='paid')  
				--and Convert(Date,PaidDate) != Convert(Date,CreditDate) --VIKAS:10th Jan 2020

				UNION ALL
				--Cash Return---
				SELECT   Convert(Date,ret.CreatedOn) 'Date',  
						 'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						  ret.PatientId,
						  ret.InvoiceId,
						 'CashInvoiceReturn' AS 'TransactionType',
						 (-ret.SubTotal) 'SubTotal', 
						 (-ret.DiscountAmount) 'DiscountAmount', 
						 (-ret.VATAmount) 'VATAmount', 
						 (-ret.TotalAmount) 'TotalAmount', 
	  					 (-ret.TotalAmount) AS 'CashCollection', 
						 0 AS 'DepositReceived', 
						 0 AS 'DepositRefund',
						 0 AS 'DepositDeduct',
						 0 AS 'CreditReceived', 
						 0 AS 'CreditAmount',
						ret.CounterId, 
						ret.CreatedBy 'EmployeeId', 
						ret.Remarks 'Remarks', 
						4 as DisplaySeq 
				FROM PHRM_TXN_InvoiceReturn ret, PHRM_TXN_Invoice txn
				where (ret.InvoiceId=txn.InvoiceId and txn.PaymentMode='cash') or (ret.InvoiceId=txn.InvoiceId and 
				txn.PaymentMode='credit' and txn.settlementId is not null)
				 --If billstatus is paid, regardless it was Credit + Settled, it should come in Cash Return--
				  
				UNION ALL
				--Credit Return---
				SELECT   Convert(Date,ret.CreatedOn) 'Date', 
					    'PHRM'+Convert(varchar(20),InvoicePrintId) 'InvoiceNo', 
						 txn.PatientId,
						 ret.InvoiceId,
						 'CreditInvoiceReturn' AS 'TransactionType',
						 (-ret.SubTotal) 'SubTotal', 
						 (-txn.DiscountAmount) 'DiscountAmount', 
						 (-txn.VATAmount) 'VATAmount', 
						 (-ret.TotalAmount) 'TotalAmount', 
	  					 (0) AS 'CashCollection',  
						 0 AS 'DepositReceived', 
						 0 AS 'DepositRefund', 
						 0 AS 'DepositDeduct',
						 0 AS 'CreditReceived', 
						 (-ret.TotalAmount) 'CreditAmount',
						 ret.CounterId, 
						 ret.CreatedBy 'EmployeeId', 
						 ret.Remarks 'Remarks', 
						 5 as DisplaySeq
				FROM PHRM_TXN_InvoiceReturn ret, PHRM_TXN_Invoice txn
				where ret.InvoiceId=txn.InvoiceId
				and txn.PaymentMode='credit' and settlementId is null
			) A
			WHERE A.Date BETWEEN @FromDate and @ToDate
			
) -- end of return
GO

--End: Arpan:Dec 7th 2020: PharmacyTxn_ByBillingType_UserCollection----

---Start: Shankar: 7th Dec 2020: Credit sale return case included in settlement---
/****** Object:  StoredProcedure [dbo].[SP_TXNS_PHRM_SettlementSummary]    Script Date: 12/7/2020 11:46 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_TXNS_PHRM_SettlementSummary] 
AS
/*
FileName: [SP_TXNS_PHRM_SettlementSummary]
CreatedBy/date: sanjit:24Nov2019
Description: to get CreditTotal, DepositBalance of patients
Remarks:   We're selecting only those patients, who has balance amount in any of above types.
       : I've kept amount > 1 in filter list, otherwise it'll show a lot of un-necessary data.. 
Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
1.		Shankar/28thFeb2020				Added provisional amount as well
2.		VIKAS/1st Sep 2020				Added BilStatus, and SettlementId and get paid and unpaid credit bills data
3.		Shankar/7th Dec 2020			Subtracted Credit invoice return from CreditTotal
-----------------------------------------------------------------------------------------			
*/
BEGIN
 
Select pat.PatientId, pat.PatientCode, 
       pat.FirstName+' '+ISNULL(pat.MiddleName+' ','')+ pat.LastName 'PatientName', 
	   pat.DateOfBirth,
	   pat.Gender,pat.PhoneNumber,	   
       CAST(ISNULL(credit.CreditTotal,0) - ISNULL(invretn.PaidAmount,0) as numeric(16,2)) 'CreditTotal',
	   CAST(ROUND(ISNULL(provisional.ProvisionalTotal,0),2) as numeric(16,2)) 'ProvisionalTotal',
	   CAST(
	      ROUND( 
	           (ISNULL(dep.TotalDeposit,0)- ISNULL(dep.DepositDeduction,0) - ISNULL(dep.DepositReturn,0))
	         ,2) as numeric(16,2)) 'DepositBalance',
			 credit.CreatedOn 'CreditDate' ,dep.CreatedOn 'DepositDate',
	credit.BilStatus, credit.SettlementId -- VIKAS:1st Sep 2020: added BilStatus , and  SettlementId
	
from PAT_Patient pat
LEFT JOIN
( 
  Select txn.PatientId, max(txn.CreateOn) CreatedOn, txn.BilStatus,txn.SettlementId,
  SUM(txn.PaidAmount) 'CreditTotal'  from PHRM_TXN_Invoice txn
  where --txn.BilStatus ='unpaid' 
   txn.PaymentMode = 'credit' 
  AND ISNULL(txn.IsReturn,0) != 1
  Group by txn.PatientId,txn.BilStatus, txn.SettlementId
) credit on pat.PatientId = credit.PatientId


LEFT JOIN
(
select invret.PatientId,SUM(invret.PaidAmount) 'PaidAmount' from PHRM_TXN_Invoice inv
join PHRM_TXN_InvoiceReturn invret on inv.InvoiceId = invret.InvoiceId --and invret.PaymentMode = 'credit'
where invret.PaymentMode = 'credit'
group by invret.PatientId
) invretn on pat.PatientId = invretn.PatientId


LEFT JOIN
(--select * from PHRM_TXN_Invoice where BilStatus = 'provisional'
  Select invitms.PatientId, max(invitms.CreatedOn) CreatedOn,
  SUM(invitms.TotalAmount) 'ProvisionalTotal' from PHRM_TXN_InvoiceItems invitms
  where invitms.BilItemStatus='provisional' or invitms.BilItemStatus='wardconsumption' 
  Group by invitms.PatientId
) provisional on pat.PatientId = provisional.PatientId
LEFT JOIN
( 
  Select dep.PatientId,max(dep.CreatedOn) CreatedOn,
    SUM(Case WHEN dep.DepositType='deposit' THEN ISNULL(dep.DepositAmount,0) ELSE 0  END ) AS 'TotalDeposit',
    SUM(Case WHEN dep.DepositType='depositdeduct' THEN ISNULL(dep.DepositAmount,0) ELSE 0  END ) AS 'DepositDeduction',
	SUM(Case WHEN dep.DepositType='depositreturn' THEN ISNULL(dep.DepositAmount,0) ELSE 0  END ) AS 'DepositReturn'
   FROM PHRM_Deposit dep
   Group by dep.PatientId
) dep
ON dep.PatientId = pat.PatientId

---show only those patients which has either amount > 0
where CAST(ISNULL(credit.CreditTotal,0) - ISNULL(invretn.PaidAmount,0) as numeric(16,2)) > 1 
	  OR ( dep.TotalDeposit-dep.DepositDeduction - dep.DepositReturn) > 1
--to get the latest first
	  order by
  CASE
      WHEN ISNULL(dep.CreatedOn,0) >= ISNULL(credit.CreatedOn,0)
          THEN  dep.CreatedOn
      ELSE  credit.CreatedOn 
  END
 DESC
END
GO
---End: Shankar: 7th Dec 2020: Credit sale return case included in settlement---

-------------------Start:7th_Dec_2020 DInesh : FN_BIL_GetSettledAmountBetnDateRange created
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


Create Function [dbo].[FN_BIL_GetSettledAmountBetnDateRange] 
                (   @FromDate datetime,
				    @ToDate datetime
				)
RETURNS TABLE
/*
File: [FN_BIL_GetSettledAmountBetnDateRange]
Created/Updated By: dinesh 7th_Dec_2020
Description: Returns SettledDiscountAmount

Select * from  [FN_BIL_GetSettledAmountBetnDateRange] ('2020-12-07','2020-12-07')
*/
AS
RETURN
(
       SELECT  
	 UserDetails.BillingDate,
	ISNULL(SettlDiscountAmount,0)     'SettledDiscountAmount'

FROM 
(
  SELECT Dates 'BillingDate' 
  FROM [FN_COMMON_GetAllDatesBetweenRange] (ISNULL(@FromDate,GETDATE()),ISNULL(@ToDate,GETDATE()))

) UserDetails


LEFT JOIN
(
Select  Convert(date,sett.SettlementDate) 'BillingDate',
        SUM(Case When sett.PayableAmount > 0 then sett.PaidAmount ELSE 0 END) AS 'SettlPaidAmount', 
		SUM(Case WHEN sett.RefundableAmount > 0 THEN sett.ReturnedAmount ELSE 0 END ) AS 'SettlReturnAmount',
		SUM(Case WHEN sett.DueAmount > 0 THEN sett.DueAmount   ELSE 0 END ) AS 'SettlDueAmount',
      SUM( sett.DiscountAmount ) 'SettlDiscountAmount'
from BIL_TXN_Settlements sett 
GROUP BY Convert(date,sett.SettlementDate)
) settl
ON UserDetails.BillingDate = settl.BillingDate 

)
GO
-------------------End:7th_Dec_2020 DInesh : FN_BIL_GetSettledAmountBetnDateRange created
-----------------Start: 7th_Dec_2020 Department Summary Changes ---------------------

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DepartmentSummary]    Script Date: 12/7/2020 2:04:14 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- SP_Report_BIL_DepartmentSummary 
ALTER PROCEDURE [dbo].[SP_Report_BIL_DepartmentSummary] -- SP_Report_BIL_DepartmentSummary '2020-12-07','2020-12-07'
  @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.	UpdatedBy/Date			Remarks
----------------------------------------------------------
1		Ramavtar/11Sept'18      Initial Draft
2		Ramavtar/30Nov'18		added summary and filtered report data for provisional and cancel
3       Sud/13Mar'19            Changed to function FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional 
                                  from: FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary
4.		Dinesh/ 28th May'19		Added Credit Received amount in summary as previously it was not cleared and taking from previous dates
5.      Dinesh /7thDec'2020     Handled Settled Discount Amount 
----------------------------------------------------------
*/
BEGIN
	--table1: report data
	 SELECT
	    [dbo].[FN_BIL_GetSrvDeptReportingName_DepartmentSummary] (ServiceDepartmentName,ItemName) 'ServiceDepartment',
		--fnItems.ServiceDepartmentName 'ServiceDepartment',
		SUM(ISNULL(fnItems.Quantity, 0)) 'Quantity',
		SUM(ISNULL(fnItems.SubTotal, 0)) 'SubTotal',
		SUM(ISNULL(fnItems.DiscountAmount, 0)) 'DiscountAmount',
		SUM(ISNULL(fnItems.TotalAmount, 0)) 'TotalAmount',
		SUM(ISNULL(fnItems.ReturnTotalAmount, 0)) 'ReturnAmount',
	    SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnTotalAmount, 0)) AS 'NetSales',
	    SUM(ISNULL(CreditAmount, 0)) AS 'CreditAmount',
		SUM(ISNULL(CreditReceived, 0)) AS 'CreditReceivedAmount'

	FROM FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional(@FromDate, @ToDate)  fnItems

	GROUP BY  
	  [dbo].[FN_BIL_GetSrvDeptReportingName_DepartmentSummary] (ServiceDepartmentName,ItemName) 
	ORDER BY 1
	--SELECT
	--	fnItems.ServiceDepartmentName 'ServiceDepartment',
	--	SUM(ISNULL(fnItems.Quantity, 0)) 'Quantity',
	--	SUM(ISNULL(fnItems.SubTotal, 0)) 'SubTotal',
	--	SUM(ISNULL(fnItems.DiscountAmount, 0)) 'DiscountAmount',
	--	SUM(ISNULL(fnItems.TotalAmount, 0)) 'TotalAmount',
	--	SUM(ISNULL(fnItems.ReturnAmount, 0)) 'ReturnAmount',
	--	SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnAmount, 0)) 'NetSales'
	--FROM (SELECT
	--	*
	--FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary(@FromDate, @ToDate)
	--WHERE BillStatus != 'cancelled' AND BillStatus != 'provisional') fnItems
	--GROUP BY fnItems.ServiceDepartmentName
	--ORDER BY 1
	--table2: provisional, cancel, credit amounts for summary
	SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount',
		(SELECT SUM(ISNULL(CreditReceived, 0)) FROM FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional(@FromDate,@ToDate))  AS 'CreditReceivedAmount',
		(SELECT SUM(ISNULL(AdvanceReceived,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceReceived',
		(SELECT SUM(ISNULL(AdvanceSettled,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceSettled',
		(SELECT SUM(ISNULL(SettledDiscountAmount,0)) FROM [FN_BIL_GetSettledAmountBetnDateRange](@FromDate,@ToDate)) 'SettledDiscountAmount'
		----dinesh : settlement Discount is handled over here 
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DepartmentSummary(@FromDate, @ToDate)
END
GO

-----------------End:7th_Dec_2020 Department Summary Changes ---------------------

-----------------Start:8th_Dec_2020 JIRA_NO: 2873_Doctor Summary Changes ---------------------

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DoctorSummary]    Script Date: 12/8/2020 11:28:41 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		Sud/02Sept'18
-- Description:		to show doctor summary
-- Remarks: 
---[SP_Report_BIL_DoctorSummary] '2020-12-08','2020-12-08'
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BIL_DoctorSummary]
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1.		Sud/02Sept'18			     Initial Draft
2.		Ramavtar/12Nov'18			 sorting by doctorname
3.	    Ramavtar/30Nov'18			 summary added
4.		Ramavtar/17Dec'18			change in where condition (checking for credit records)
5.      Sud/21Feb'19                Changed as per new function <needs revision>
6.      Dinesh/8Dec'20              Handling of SettlementDiscount Amount (Need Revision)
----------------------------------------------------------
*/
BEGIN
  
 SELECT
        ISNULL(Providerid, 0) 'DoctorId',
        CASE WHEN ISNULL(ProviderId, 0) != 0 THEN ProviderName ELSE 'No Doctor' END AS 'DoctorName',
        SUM(ISNULL(SubTotal, 0)) 'SubTotal',
        SUM(ISNULL(DiscountAmount, 0)) AS 'Discount',
        SUM(ISNULL(ReturnTotalAmount, 0)) AS 'Refund',
        SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnTotalAmount, 0)) AS 'NetTotal',

		 SUM(ISNULL(CreditAmount, 0)) AS 'CreditAmount',
		 SUM(ISNULL(CreditReceived, 0)) AS 'CreditReceivedAmount'

    FROM FN_BILL_Get_BillingTxnItemSeggregation_ByBillingType_NoProvisional(@FromDate, @ToDate)
	    GROUP BY 
		ProviderId,
		ProviderName	
	ORDER BY 2 

 --   SELECT
 --       ISNULL(Providerid, 0) 'DoctorId',
 --       CASE WHEN ISNULL(ProviderId, 0) != 0 THEN ProviderName ELSE 'NoDoctor' END AS 'DoctorName',
 --       SUM(ISNULL(SubTotal, 0)) 'SubTotal',
 --       SUM(ISNULL(DiscountAmount, 0)) AS 'Discount',
 --       SUM(ISNULL(ReturnAmount, 0)) AS 'Refund',
 --       SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnAmount, 0)) AS 'NetTotal'
 --   FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
	--WHERE BillStatus != 'cancelled' 
	--		AND BillStatus != 'provisional'
	--		--AND (PaymentMode != 'credit' OR CreditDate IS NOT NULL)
 --   GROUP BY 
	--	ProviderId,
	--	ProviderName	
	--ORDER BY 2 



	SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount',
		--sud:7Feb'18--Added CreditReceivedAmount with below condition--
		SUM(CASE WHEN BillStatus='paid' AND PaymentMode='credit' AND PaidDate is not null and CreditDate is null THEN PaidAmount ELSE 0 END) 'CreditReceivedAmount',
		--sud:7Feb'18: Added CreditReturnAmount <Needs Revision>
		SUM(CASE WHEN BillStatus='return' AND PaymentMode='credit' AND PaidDate IS NULL THEN ReturnAmount ELSE 0 END) 'CreditReturnAmount',
		(SELECT SUM(ISNULL(AdvanceReceived,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceReceived',
		(SELECT SUM(ISNULL(AdvanceSettled,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceSettled',
		(SELECT SUM(ISNULL(SettledDiscountAmount,0)) FROM [FN_BIL_GetSettledAmountBetnDateRange](@FromDate,@ToDate)) 'SettledDiscountAmount'
--FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
FROM FN_BIL_GetTxnItemsInfoWithDateSeparation_DoctorSummary(@FromDate, @ToDate)--for testing: sud-29Jan2019--revert to above
END
GO
-----------------Start:8th_Dec_2020 JIRA_NO: 2873_Doctor Summary Changes ---------------------

-----START: NageshBB: 08 DEc 2020: Inventory report sp changes
--Fix for ->Jira NO-2826-Inventory>CurrentStockLevelReport: Store items are not loading as per the selected store.

/****** Object:  StoredProcedure [dbo].[SP_Report_INV_CurrentStockLevel]    Script Date: 08-12-2020 13:47:47 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_INV_CurrentStockLevel] 
@StoreIds NVARCHAR(400) = ''  
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		NageshBB/22 Sep 2020			updated script for get subcategory name column
2		NageshBB/08 Dec 2020			updated script for fix wrong storeId get issue resolution when main storeId is not there
---------------------------------------------------------------------
*/
  DECLARE @mainStoreId INT=null;
  SET @mainStoreId = (select StoreId from PHRM_MST_Store where [Name]='Main Store')
  IF(@mainStoreId IN (SELECT value FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> ''))
  BEGIN

	SELECT 
	    x.SubCategoryName,
		x.ItemName, 
		x.Code,x.ItemId, 
		SUM(x.AvailableQuantity) as AvailableQuantity,
		SUM(x.Price*x.AvailableQuantity) as StockValue,
		x.ItemType,
		STRING_AGG(X.StoreId, ',') AS StoreIds
	FROM (SELECT 
				subCat.SubCategoryName,
				itm.ItemName, itm.ItemId,
				itm.Code, 
				stk.AvailableQuantity,
				stk.Price,
				itm.ItemType,
			(select top(1)StoreId from PHRM_MST_Store where [Name]='Main Store') as StoreId
			FROM INV_TXN_Stock stk
				join INV_MST_Item itm on stk.ItemId = itm.ItemId
				join INV_MST_ItemSubCategory subCat on subCat.SubCategoryId=itm.SubCategoryId
			WHERE  AvailableQuantity>0 
		 UNION ALL

		 SELECT 
		    subCat.SubCategoryName,
			itm.ItemName, itm.ItemId,
			itm.Code, 
			stk.AvailableQuantity,
			stk.Price,
			itm.ItemType,
			stk.StoreId
		FROM WARD_INV_Stock stk
			join INV_MST_Item itm on stk.ItemId = itm.ItemId
			join INV_MST_ItemSubCategory subCat on subCat.SubCategoryId=itm.SubCategoryId
		WHERE  AvailableQuantity>0 AND stk.StoreId IN (SELECT value FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> '')
		) as x
		GROUP BY x.ItemName, x.Code,x.ItemType,x.ItemId,x.SubCategoryName
	
	END

	ELSE
	BEGIN
		SELECT 
		   subCat.SubCategoryName,
			itm.ItemName, 
			itm.ItemId,
			itm.Code, 
			SUM(stk.AvailableQuantity) as AvailableQuantity,
			SUM(stk.Price*stk.AvailableQuantity) as StockValue,
			itm.ItemType,
			STRING_AGG(stk.StoreId, ',') AS StoreIds
		FROM WARD_INV_Stock stk
			join INV_MST_Item itm on stk.ItemId = itm.ItemId
				join INV_MST_ItemSubCategory subCat on subCat.SubCategoryId=itm.SubCategoryId
		WHERE  AvailableQuantity>0 AND stk.StoreId IN (SELECT value FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> '')
		GROUP BY itm.ItemName, itm.ItemId,itm.Code,itm.ItemType,subCat.SubCategoryName
		ORDER BY itm.ItemName asc
	END
Go

-----END: NageshBB: 08 DEc 2020: Inventory report sp changes


--start: sud:09Dec'20--hide unused reports from Pharmacy--
Update RBAC_RouteConfig
set IsActive=0 
where UrlFullPath like 'Pharmacy/Report/%'
and UrlFullPath not in 
('Pharmacy/Report/PurchaseOrderReport'
,'Pharmacy/Report/ItemWiseStockReport'
,'Pharmacy/Report/SupplierInfoReport'
,'Pharmacy/Report/StockItemsReport'
,'Pharmacy/Report/ReturnToSupplierReport'
,'Pharmacy/Report/UserwiseCollectionReport'
,'Pharmacy/Report/GoodsReceiptProductReport'
,'Pharmacy/Report/PHRMNarcoticsStockReport'
,'Pharmacy/Report/DepositBalanceReport'
,'Pharmacy/Report/PHRMNarcoticsDailySalesReport'
)
GO
--end: sud:09Dec'20--hide unused reports from Pharmacy--

---------------------Merged from Billing-Settlement branch-----
---Start: pratik:17Dec 2020: Export all Data from incentive setting

Create PROCEDURE SP_Inctv_ExportAllEmpItemsSettings  
AS
/*
 FileName: [SP_Inctv_ExportAllEmpItemsSettings] 
 Created: 16th Dec 2020/Pratik
 Description: To export all Data from incentive setting (i.e. EmployeeItemsSetup page)
 Remarks: 
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User               Change          Remarks
 -------------------------------------------------------------------------
 1.		Pratik:16th Dec 2020		inital draft
 -------------------------------------------------------------------------
*/
BEGIN	   
SELECT 
emp.EmployeeId,emp.FullName AS EmployeeName ,
inctvInfo.TDSPercent,
billItmPrice.ServiceDepartmentId,
servDeprt.ServiceDepartmentName,
billItmPrice.ItemId,
billItmPrice.ItemName,
empbillitmMap.AssignedToPercent,
empbillitmMap.ReferredByPercent,
--empbillitmMap.HasGroupDistribution,
CASE
    WHEN empbillitmMap.HasGroupDistribution =1 THEN 'Yes'
    ELSE 'No'
END AS HasGroupDistribution,

groupDist.DistributionInfo
from INCTV_EmployeeIncentiveInfo inctvInfo
     join EMP_Employee emp  
        on inctvInfo.EmployeeId=emp.EmployeeId 

left join INCTV_MAP_EmployeeBillItemsMap empbillitmMap
     on inctvInfo.EmployeeId=empbillitmMap.EmployeeId 

join BIL_CFG_BillItemPrice billItmPrice
    on billItmPrice.BillItemPriceId=empbillitmMap.BillItemPriceId  
	
join BIL_MST_ServiceDepartment servDeprt
    on billItmPrice.ServiceDepartmentId=servDeprt.ServiceDepartmentId  and servDeprt.IsActive=1

left join (
		SELECT x.EmployeeBillItemsMapId, DistributionInfo = STUFF((
				SELECT N', ' + emp1.FullName+': ' +Convert(varchar(20),dist1.DistributionPercent)+'%'
				FROM INCTV_CFG_ItemGroupDistribution dist1 inner join EMP_Employee emp1
					  on dist1.DistributeToEmployeeId = emp1.EmployeeId and dist1.IsActive=1
				WHERE EmployeeBillItemsMapId = x.EmployeeBillItemsMapId
				FOR XML PATH(''), TYPE).value(N'.[1]', N'nvarchar(max)'), 1, 2, N'')

			  FROM INCTV_MAP_EmployeeBillItemsMap AS x
			  where Isnull(x.HasGroupDistribution,0)=1
			  GROUP BY x.EmployeeBillItemsMapId

	  )groupDist

   on empbillitmMap.EmployeeBillItemsMapId = groupDist.EmployeeBillItemsMapId 
   where empbillitmMap.IsActive=1 and inctvInfo.IsActive=1
order by emp.FirstName, emp.LastName , ServiceDepartmentName, ItemName

END
GO


---End: pratik:17Dec 2020: Export all Data from incentive setting

---------------------Merged from Billing-Settlement branch-----



-----Start:Anjana: 12/22/2020: Incremental files for Substore Dispatch and Consumption report------
declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationId from RBAC_Application where ApplicationName='Inventory' and ApplicationCode='INV');

Insert into RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn,IsActive)
values ('inventory-reports-substore-dispatch-consumptions-summary-view',@ApplicationId,1,GETDATE(),1);
GO

declare @PermissionId INT
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='inventory-reports-substore-dispatch-consumptions-summary-view')

declare @RefParentRouteId INT
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Inventory/Reports')

Insert into RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, css, DefaultShow, IsActive)
values ('Substore Dispatch And Consumption', 'Inventory/Reports/SubstoreDispatchNConsumption','SubstoreDispatchNConsumption',@PermissionId,@RefParentRouteId,'fa fa-shopping-cart fa-stack-1x text-white',1,1);
GO

/****** Object:  StoredProcedure [dbo].[SP_INV_RPT_GetSubstoreDispConsumption_Summary ]    Script Date: 12/18/2020 2:24:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_INV_RPT_GetSubstoreDispConsumption_Summary ] 
	@StoreIds NVARCHAR(400) = '' ,
	@FromDate Datetime = null,
	@ToDate DateTime = null
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Anjana/12/18/2020				Initial Draft
---------------------------------------------------------------------
*/
  Declare @StoreIdTbl Table(StoreId int)
  Insert into @StoreIdTbl
  SELECT value FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> ''
	BEGIN
		SELECT 
		   sub.SubCategoryName,
			itm.ItemName, 
			itm.ItemId,
			itm.Code,
			itm.ItemType,
			txn.TransactionId,
			txn.TransactionDate,
			txn.StoreId,
			txn.ItemId,
			txn.InOut,
			txn.TransactionType,
			txn.Price,
			txn.Quantity,
			unit.UOMName as Unit,
			CASE When TransactionType ='dispatched-items' Then txn.Price*txn.Quantity Else 0 END as 'DispatchValue',
			CASE WHEN TransactionType ='consumption-items' Then txn.Price*txn.Quantity ELSE 0 END as 'ConsumptionValue',
			CASE WHEN TransactionType='dispatched-items' Then txn.Quantity ELSE 0 END as 'DispatchQuantity',
			CASE WHEN TransactionType='consumption-items' Then txn.Quantity ELSE 0 END as 'ConsumptionQuantity'
			
		From @StoreIdTbl store
		join WARD_INV_Transaction txn on store.StoreId = txn.StoreId
		join INV_MST_Item itm on txn.ItemId = itm.ItemId
		join INV_MST_ItemSubCategory sub on itm.SubCategoryId = sub.SubCategoryId
		join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
		WHERE  txn.StoreId IN (Select StoreId from @StoreIdTbl)
		and Convert(Date, txn.TransactionDate) between ISNULL(@FromDate, Convert(Date, GETDATE())) AND ISNULL(@ToDate, Convert(DATE, GETDATE()))
		GROUP BY itm.ItemName, itm.ItemId,itm.Code,itm.ItemType,sub.SubCategoryName, txn.TransactionDate,
		txn.TransactionId,txn.StoreId,txn.ItemId,txn.TransactionType,txn.Price,txn.Quantity,txn.InOut, unit.UOMName
		ORDER BY itm.ItemName asc
	END
GO


/****** Object:  StoredProcedure [dbo].[SP_INV_RPT_GetSubstoreDispConsumption_Items ]    Script Date: 12/21/2020 2:26:51 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_INV_RPT_GetSubstoreDispConsumption_Items ] 
	@StoreIds NVARCHAR(400) = '' ,
	@ItemId NVARCHAR(50)
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Anjana/12/21/2020				Initial Draft
---------------------------------------------------------------------
*/

  DECLARE @StoreIdTbl Table(StoreId int)
  Insert into @StoreIdTbl
  SELECT value FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> ''
	BEGIN
		SELECT 
			itm.ItemName, 
			itm.ItemId,
			itm.Code,
			itm.ItemType,
			txn.TransactionId,
			txn.TransactionDate,
			txn.StoreId,
			txn.ItemId,
			txn.InOut,
			txn.TransactionType,
			txn.Price,
			txn.Quantity,
			sto.Name,
			gr.GoodsReceiptNo,
			CASE When TransactionType ='dispatched-items' Then txn.Price*txn.Quantity Else 0 END as 'DispatchValue',
			CASE WHEN TransactionType ='consumption-items' Then txn.Price*txn.Quantity ELSE 0 END as 'ConsumptionValue',
			CASE WHEN TransactionType='dispatched-items' Then txn.Quantity ELSE 0 END as 'DispatchQuantity',
			CASE WHEN TransactionType='consumption-items' Then txn.Quantity ELSE 0 END as 'ConsumptionQuantity'
			
		From @StoreIdTbl store
		join WARD_INV_Transaction txn on store.StoreId = txn.StoreId
		join PHRM_MST_Store sto on store.StoreId = sto.StoreId
		join INV_MST_Item itm on txn.ItemId = itm.ItemId
		join INV_TXN_GoodsReceiptItems gritm on txn.GoodsReceiptItemId = gritm.GoodsReceiptItemId
		join INV_TXN_GoodsReceipt gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
		WHERE  txn.StoreId IN (Select StoreId from @StoreIdTbl) and itm.ItemId = @ItemId
		ORDER BY sto.Name asc, txn.TransactionDate asc
	END
GO
-----End:Anjana: 12/22/2020: Incremental files for Substore Dispatch and Consumption report------

---Start: Anjana: 12/24/2020: Change the size of BedCode in ADT_Bed--------
ALTER TABLE ADT_Bed 
ALTER COLUMN BedCode varchar(50);
GO
---End: Anjana: 12/24/2020: Change the size of BedCode in ADT_Bed--------

--------Start:Anjana:12/28/2020: Grouped similar data into a single row--------
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

 ALTER PROCEDURE [dbo].[SP_INV_RPT_GetSubstoreDispConsumption_Summary ] 
  @StoreIds NVARCHAR(400) = '' ,
  @FromDate Datetime = null,
  @ToDate DateTime = null
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date          Remarks
----------------------------------------------------------
1    Anjana/12/18/2020        Initial Draft
---------------------------------------------------------------------
*/
  Declare @StoreIdTbl Table(StoreId int)
  Insert into @StoreIdTbl
  SELECT value FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> ''
  BEGIN
    SELECT DISTINCT
       sub.SubCategoryName,
      itm.ItemName, 
      itm.ItemId,
      itm.Code,
      itm.ItemType,
      txn.StoreId,
      unit.UOMName as Unit,
      fy.totalQuantity,
      fy.TotalValue,
      dis.DispatchQuantity,
      dis.DispatchValue,
      con.ConsumptionQuantity,
      con.ConsumptionValue
    From @StoreIdTbl store
    join WARD_INV_Transaction txn on store.StoreId = txn.StoreId
    join INV_MST_Item itm on txn.ItemId = itm.ItemId
    join INV_MST_ItemSubCategory sub on itm.SubCategoryId = sub.SubCategoryId
    join INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId
    left join( Select ItemId, Sum(Quantity) 'totalQuantity', Sum(Price*Quantity) 'TotalValue' from WARD_INV_Transaction where TransactionType='fy-stock-manage' group by ItemId) fy on itm.ItemId  = fy.ItemId
    left join ( Select ItemId, Sum(Quantity) 'DispatchQuantity', Sum(Price*Quantity) 'DispatchValue' from WARD_INV_Transaction where TransactionType = 'dispatched-items' and Convert(Date, TransactionDate) between ISNULL(@FromDate, Convert(Date, GETDATE())) AND ISNULL(@ToDate, Convert(DATE, GETDATE())) group by ItemId) dis on itm.ItemId = dis.ItemId
    left join (Select ItemId, Sum(Quantity) 'ConsumptionQuantity', Sum(Price*Quantity) 'ConsumptionValue' from WARD_INV_Transaction where TransactionType = 'consumption-items' and Convert(Date, TransactionDate) between ISNULL(@FromDate, Convert(Date, GETDATE())) AND ISNULL(@ToDate, Convert(DATE, GETDATE())) group by ItemId) con on itm.ItemId = con.ItemId
    WHERE  txn.StoreId IN (Select StoreId from @StoreIdTbl)
    and Convert(Date, txn.TransactionDate) between ISNULL(@FromDate, Convert(Date, GETDATE())) AND ISNULL(@ToDate, Convert(DATE, GETDATE()))
    GROUP BY itm.ItemName, txn.TransactionType, itm.ItemId,itm.ItemType,sub.SubCategoryName
    ,txn.StoreId, unit.UOMName, itm.Code, fy.totalQuantity, dis.DispatchQuantity, con.ConsumptionQuantity, con.ConsumptionValue, dis.DispatchValue, fy.TotalValue
    ORDER BY itm.ItemName asc
  END
GO

/****** Object:  StoredProcedure [dbo].[SP_INV_RPT_GetSubstoreDispConsumption_Items ]    Script Date: 12/31/2020 11:19:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_INV_RPT_GetSubstoreDispConsumption_Items ] 
  @StoreIds NVARCHAR(400) = '' ,
  @ItemId NVARCHAR(50),
  @Date DateTime
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date          Remarks
----------------------------------------------------------
1    Anjana/12/18/2020        Initial Draft
---------------------------------------------------------------------
*/

  DECLARE @StoreIdTbl Table(StoreId int)
  Insert into @StoreIdTbl
  SELECT value FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> ''
  BEGIN
    SELECT 
      itm.ItemName, 
      itm.ItemId,
      itm.Code,
      itm.ItemType,
      txn.TransactionId,
      txn.TransactionDate,
      txn.StoreId,
      txn.ItemId,
      txn.InOut,
      txn.TransactionType,
      txn.Price,
      txn.Quantity,
      sto.Name,
      gr.GoodsReceiptNo,
      CASE When TransactionType ='dispatched-items' Then txn.Price*txn.Quantity Else 0 END as 'DispatchValue',
      CASE WHEN TransactionType ='consumption-items' Then txn.Price*txn.Quantity ELSE 0 END as 'ConsumptionValue',
      CASE WHEN TransactionType='dispatched-items' Then txn.Quantity ELSE 0 END as 'DispatchQuantity',
      CASE WHEN TransactionType='consumption-items' Then txn.Quantity ELSE 0 END as 'ConsumptionQuantity'
      
    From @StoreIdTbl store
    join WARD_INV_Transaction txn on store.StoreId = txn.StoreId
    join PHRM_MST_Store sto on store.StoreId = sto.StoreId
    join INV_MST_Item itm on txn.ItemId = itm.ItemId
    join INV_TXN_GoodsReceiptItems gritm on txn.GoodsReceiptItemId = gritm.GoodsReceiptItemId
    join INV_TXN_GoodsReceipt gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
    WHERE  txn.StoreId IN (Select StoreId from @StoreIdTbl) and itm.ItemId = @ItemId and Convert(Date, txn.TransactionDate) = @Date 
    ORDER BY sto.Name asc, txn.TransactionDate asc
  END
  GO
--------End:Anjana:12/28/2020: Grouped similar data into a single row--------


--Anjana:12/29/2020: Code to update ItemCode of Billing items-----
Declare @maxItemCode table(ItemCode int)
Insert into @maxItemCode
Select CAST(ItemCode AS INT) From BIL_CFG_BillItemPrice 
Declare @maxValue int = (Select MAX(Itemcode) From @maxItemCode)
Update BIL_CFG_BillItemPrice 
SET ItemCode = @maxValue, @maxValue = @maxValue + 1
WHERE ItemCode Is Null
Go
--Anjana:12/29/2020: Code to update ItemCode of Billing items----



----Start:Sud: 4Jan'21--For Inventory Summary Report Correction---

---Fiscal years Configurations were incorrect in inventory tables--
Update INV_CFG_FiscalYears
SET StartDate='2018-07-17 00:00:00'
WHERE FiscalYearName='2075/2076'
GO
Update INV_CFG_FiscalYears
SET StartDate='2019-07-17 00:00:00'
WHERE FiscalYearName='2076/2077'
GO
Update INV_CFG_FiscalYears
SET StartDate='2020-07-16 00:00:00'
WHERE FiscalYearName='2077/2078'
GO

IF object_id('dbo.FN_RPT_INV_GetItemStockTxnsBetnDateRange') IS NOT  NULL
BEGIN
  Drop Function FN_RPT_INV_GetItemStockTxnsBetnDateRange
END
GO
IF object_id('dbo.FN_RPT_INV_GetItemsOpeningQtyUptoDate') IS NOT  NULL
BEGIN
  Drop Function FN_RPT_INV_GetItemsOpeningQtyUptoDate
END
GO

CREATE FUNCTION [dbo].[FN_RPT_INV_GetItemStockTxnsBetnDateRange](@FromDate Date, @ToDate Date)
RETURNS TABLE
AS
/*
 FileName    : FN_RPT_INV_GetItemStockTxnsBetnDateRange
 Description : Gives Purchase, Dispatch, Consumption and StockManage(IN/Out) information for each item on a given date range
 Remarks     : 
 Created: 03Jan'21/Sud
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.      03Jan'21/Sud          created         
 -------------------------------------------------------------------------
*/
RETURN
(

Select 
  itms.ItemId,
  Isnull(gri.GrQty,0) - isnull(cancel.CancelQty,0)  'PurchaseQty', 
  Isnull(gri.StockValue,0) - isnull(cancel.StockValue,0)  'PurchaseValue', 

  Isnull(disp.DispatchQty,0) 'DispatchQty', 
  Isnull(disp.StockValue,0) 'DispatchValue', 

  ISNULL(cons.ConsumedQty,0)  'ConsumptionQty',
  ISNULL(cons.StockValue,0)  'ConsumptionValue',

  Isnull(stmgOut_MainStore.Quantity,0) + ISNULL(stmgOut_substore.Quantity,0)  'StockManageOutQty',
  Isnull(stmgOut_MainStore.StockValue,0)+ISNULL(stmgOut_substore.StockValue,0) 'StockManageOutValue',

  Isnull(stmgIn_MainStore.Quantity,0) +Isnull(stmgIn_substore.Quantity,0)  'StockManageInQty', 
  Isnull(stmgIn_MainStore.StockValue,0)+Isnull(stmgIn_substore.StockValue,0) 'StockManageInValue' 

---Table 1: Item Information for Left most table (anchor table)----
from 
   INV_MST_Item itms
LEFT JOIN
(
  ---Table 2: Purchase Values--(GoodsReceipt in MainStore)---
    SELECT ItemId, SUM(Isnull(Quantity,0)) 'GrQty' , SUM(IsNull(Quantity,0) * IsNull(Price,0)) 'StockValue'
    from INV_TXN_StockTransaction 
    WHERE TransactionType IN('goodreceipt-items','opening-gr-items')
	  and Convert(Date,TransactionDate) Between @FromDate and @ToDate
	  --and FiscalYearId=@FiscalYearId
	Group by ItemId
 ) gri
 ON itms.ItemId=gri.ItemId

LEFT JOIN
(
 ---Table 3: Purchase Cancelled- (GR-Cancelled) of MainStore---
    SELECT ItemId, SUM(Isnull(Quantity,0)) 'CancelQty' , SUM(IsNull(Quantity,0) * IsNull(Price,0)) 'StockValue'
    from INV_TXN_StockTransaction 
    WHERE TransactionType IN ('cancel-gr-items')
	and Convert(Date,TransactionDate) Between @FromDate and @ToDate
	Group by ItemId
 ) cancel
 ON itms.ItemId=cancel.ItemId

LEFT JOIN
(
  ---Table 4: StockManage-In of MainStore---
    SELECT ItemId, SUM(Isnull(Quantity,0)) 'Quantity' , SUM(IsNull(Quantity,0) * IsNull(Price,0)) 'StockValue'
    from INV_TXN_StockTransaction 
    WHERE TransactionType IN ('stockmanaged-items','fy-managed-items')
	      and InOut='in'
		  and Convert(Date,TransactionDate) Between @FromDate and @ToDate
	Group by ItemId
 ) stmgIn_MainStore
 ON itms.ItemId=stmgIn_MainStore.ItemId

LEFT JOIN
(
 ---Table 5: StockManage-Out of MainStore---
    SELECT ItemId, SUM(Isnull(Quantity,0)) 'Quantity', SUM(IsNull(Quantity,0) * IsNull(Price,0)) 'StockValue' 
    from INV_TXN_StockTransaction 
    WHERE TransactionType IN ('stockmanaged-items','fy-managed-items')
	      and InOut='out'
		  and Convert(Date,TransactionDate) Between @FromDate and @ToDate
	Group by ItemId
 ) stmgOut_MainStore
 ON itms.ItemId=stmgOut_MainStore.ItemId

LEFT JOIN
(
 ---Table 6: Dispatch From MainStore---
    SELECT ItemId, SUM(Isnull(Quantity,0)) 'DispatchQty', SUM(IsNull(Quantity,0) * IsNull(Price,0)) 'StockValue' 
    from INV_TXN_StockTransaction 
    WHERE TransactionType IN ('dispatched-items')
	 and Convert(Date,TransactionDate) Between @FromDate and @ToDate
	Group by ItemId
 ) disp
 ON itms.ItemId=disp.ItemId

 LEFT JOIN 
 (
  ---Table 7 : Consumption From Substore---
		Select ItemId, SUM(ISNULL(Quantity,0)) 'ConsumedQty', SUM(IsNull(Quantity,0) * IsNull(Price,0)) 'StockValue' 
		from WARD_INV_Transaction 
		where TransactionType='consumption-items'
		and Convert(Date,TransactionDate) Between @FromDate and @ToDate
		  --and FiscalYearId=@FiscalYearId
		Group by ItemId
 )cons on itms.ItemId=cons.ItemId

 LEFT JOIN 
 (
   ---Table 8 : StockManageOut From Substore---
		Select ItemId, SUM(ISNULL(Quantity,0)) 'Quantity', SUM(IsNull(Quantity,0) * IsNull(Price,0)) 'StockValue' 
		from WARD_INV_Transaction 
		where TransactionType='fy-stock-manage' and InOut='out'
		and Convert(Date,TransactionDate) Between @FromDate and @ToDate
		Group by ItemId
 )stmgOut_substore 
 on itms.ItemId=stmgOut_substore.ItemId

LEFT JOIN 
 (
   ---Table 9 : StockManageIN From Substore---
		Select ItemId, SUM(ISNULL(Quantity,0)) 'Quantity', SUM(IsNull(Quantity,0) * IsNull(Price,0)) 'StockValue' 
		from WARD_INV_Transaction 
		where TransactionType='fy-stock-manage' and InOut='in'
		and Convert(Date,TransactionDate) Between @FromDate and @ToDate
		Group by ItemId
 )stmgIn_substore 
 on itms.ItemId=stmgIn_substore.ItemId


 WHERE 
 
 --- take only those having at least one transaction in the system..
 ( 
	   --isnull(opening.Opening_Qty,0) !=0 OR 
	 Isnull(gri.GrQty,0) != 0 
	 OR isnull(cancel.CancelQty,0) !=0
	 OR Isnull(disp.DispatchQty,0)!=0
	 OR Isnull(stmgOut_MainStore.Quantity,0) !=0
	 OR  Isnull(stmgIn_MainStore.Quantity,0) !=0
	 OR ISNULL(cons.ConsumedQty,0) !=0
	 OR ISNULL(stmgOut_substore.Quantity,0) !=0
	 OR ISNULL(stmgIn_substore.Quantity,0) !=0
 )

)

GO

Create FUNCTION [dbo].[FN_RPT_INV_GetItemsOpeningQtyUptoDate](@FiscalYearId INT, @FyStartDate Date, @UpToDate Date, @DispatchOrConsumption Varchar(20))
RETURNS TABLE
AS
/*
 FileName    : FN_RPT_INV_GetItemsOpeningQtyUptoDate
 Description : Opening = Opening at FyStart + Transaction(IN-OUT)
             : If dispatch then take from Dispatch Value, If consumption then take from Consumption Value for OUT.
 Remarks     : 
 Created: 03Jan'21/Sud
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.      03Jan'21/Sud          created        
 -------------------------------------------------------------------------
*/
RETURN
(
Select 
itms.ItemId,
opening_FY.Opening_Qty + txnsUptoLastDay.PurchaseQty 
   + txnsUptoLastDay.StockManageInQty - txnsUptoLastDay.StockManageOutQty 
   - ( Case WHEN @DispatchOrConsumption = 'dispatch' then txnsUptoLastDay.DispatchQty	
          ELSE txnsUptoLastDay.ConsumptionQty END)	
   AS 'OpeningQty',

opening_FY.StockValue + txnsUptoLastDay.PurchaseValue 
  + txnsUptoLastDay.StockManageInValue - txnsUptoLastDay.StockManageOutValue 
  -  ( Case WHEN @DispatchOrConsumption = 'dispatch' then txnsUptoLastDay.DispatchValue	
          ELSE txnsUptoLastDay.ConsumptionValue END) AS  'OpeningValue'

 From  
 
 INV_MST_Item itms
LEFT JOIN
(
	select ItemId, SUM(IsNull(OpeningQty,0)) 'Opening_Qty', SUM(IsNull(OpeningQty,0) * IsNull(Price,0)) 'StockValue'
	from INV_FiscalYearStock
	where   FiscalYearId=@FiscalYearId
	Group by ItemId
) opening_FY
ON opening_FY.ItemId=itms.ItemId

Left join
(
 --Get transactions from FYStartDate upto LastDay for Opening Calculation---
  Select * from [FN_RPT_INV_GetItemStockTxnsBetnDateRange](@FyStartDate, @UpToDate)
)
txnsUptoLastDay
ON itms.ItemId = txnsUptoLastDay.ItemId

)

GO


ALTER PROCEDURE [dbo].[SP_INV_RPT_GetInventorySummary]			
    @FiscalYearId int, 
	@FromDate Date, 
	@ToDate Date
AS

/************************************************************************
FileName: [SP_INV_RPT_GetInventorySummary]
CreatedBy/date: NageshBB/09Sep2020
Description: Get Inventory summary report data
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1       NageshBB/09Sep2020						script created
												OpeningTxnQty and OpeningTxnValue
												Transaction Records= StockManageIN+ GRReceipt   -StockManageOut -dispatch (if dispatch )
												Transaction Records= StockManageIN+ GRReceipt   -StockManageOut-Consumption (if consumption)
												Closing bal= Opening + Purchase +stockmanagein -stockmanageout -dispatch (if dispatch )
												Closing bal= Opening + Purchase +stockmanagein -stockmanageout -consumption (if consumption)
2.   Sud/3rdJan'21                              Added reusable functions for correct calculation.. 
*************************************************************************/
BEGIN
  
 Declare @FyStartDate datetime=(select top 1 Convert(Date,StartDate) from INV_CFG_FiscalYears where FiscalYearId=@FiscalYearId)
 Declare @DispatchOrConsumption varchar(20)=(Select top 1 ParameterValue from CORE_CFG_Parameters Where ParameterGroupName='Inventory' and ParameterName='ConsumptionOrDispatchForReports')

 Declare @ToDateForOpening Date = DATEADD(DAY, -1, @FromDate)  --ToDateforOpening = FromDate-1

 Select 
		itmsInfo.ItemId,
		itmsInfo.Code 'ItemCode',
		itmsInfo.ItemName,
		itmsInfo.SubCategoryName 'SubCategory',
		itmsInfo.UOMName 'Unit',
		opening.OpeningQty  AS 'OpeningQty',
		opening.OpeningValue AS  'OpeningValue',
		txnsBetnRange.PurchaseQty,
		txnsBetnRange.PurchaseValue,
		txnsBetnRange.DispatchQty,
		txnsBetnRange.DispatchValue,
		txnsBetnRange.ConsumptionQty,
		txnsBetnRange.ConsumptionValue,
		txnsBetnRange.StockManageOutQty,
		txnsBetnRange.StockManageOutValue,
		txnsBetnRange.StockManageInQty,
		txnsBetnRange.StockManageInValue

 From  
 (
  Select itm.ItemId, itm.ItemName, itm.ItemType, itm.Code, sub.SubCategoryName, uom.UOMName
     from INV_MST_Item itm
          INNER JOIN INV_MST_ItemSubCategory sub 
		      ON itm.SubCategoryId = sub.SubCategoryId
	      LEFT JOIN INV_MST_UnitOfMeasurement uom 
		      on itm.UnitOfMeasurementId=uom.UOMId
 ) itmsInfo

LEFT JOIN
(
  --This function does Opening+SUM(IN)-SUM(OUT) and gives Opening on the FromDate
    Select * from	[FN_RPT_INV_GetItemsOpeningQtyUptoDate](@FiscalYearId, @FyStartDate, @ToDateForOpening, @DispatchOrConsumption)
) opening
ON opening.ItemId=itmsInfo.ItemId

Left join
(
  --Get transactions from: @FromDate To @ToDate---
  Select * from [FN_RPT_INV_GetItemStockTxnsBetnDateRange](@FromDate, @ToDate)
)
txnsBetnRange
 ON itmsInfo.ItemId = txnsBetnRange.ItemId

where itmsInfo.ItemType='Consumables'

ORder by itmsInfo.SubCategoryName, itmsInfo.ItemName 

END
GO

----End:Sud: 4Jan'21--For Inventory Summary Report Correction---


-------------Merged from Pharmacy_Enhancement to DEV--------------
--START: Sanjesh: 19 Dec'20 --added column GoodReceiptIemId in PHRM_DispensaryStock  table

alter table [dbo].[PHRM_DispensaryStock]
add GoodReceiptIemId int 
GO
--END: Sanjesh: 19 Dec'20 --added column GoodReceiptIemId in PHRM_DispensaryStock  table

--Start: Shankar: 21-Dec-2020 -- GoodReceiptPrintId included to show on GR page----
/****** Object:  StoredProcedure [dbo].[SP_PHRMStoreStock]    Script Date: 12/15/2020 4:22 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_PHRMStoreStock]
	@Status varchar(200) = NULL
AS
/*
FileName: [SP_PHRMStore]
CreatedBy/date: Shankar/04-03-2019
Description: To get the Details of store Items
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1.		Rusha/04-08-2019						Add From and to Date for date filter
2.		Sanjit/04-09-2019						StoreName has been added.
3.      Shankar/04-15-2019                      IsActive added.
4.		Rusha/05-23-2019						Remove From and to Date for date filter and handled quantity not equals to zero
5.		Rusha/06-11-2019						Updated script
6.		Naveed/24-11-2019						Get GR CreatedOn date as Date in Store details List
7.		Ramavtar/04-Jan-2020					Filtered out Quantity > 0
8.		Sanjit/03-Jan-2020						Generic Name added.
9.      Sanjesh/19-Aug-2020                     GoodReceiptId added.
10.     Sanjesh/26-Nov-2020                     Filtered out Quantity >= 0
11.     Shankar/21-Dec-2020						GoodReceiptPrintId included
----------------------------------------------------------------------------
*/
BEGIN
	IF(@Status IS NOT NULL)
		BEGIN
				SELECT  x1.ItemName,x1.GenericName,x1.BatchNo, x1.ExpiryDate,Round(x1.MRP,2,0) AS MRP,x1.GoodReceiptId,

			    (SELECT CreatedOn FROM PHRM_GoodsReceiptItems where GoodReceiptItemId= x1.GoodsReceiptItemId )AS 'Date',
				SUM(FInQty + InQty - FOutQty - OutQty) AS 'AvailableQty',x1.StoreName,x1.ItemId,x1.StoreId,x1.GoodsReceiptItemId,x1.Price,x1.GoodReceiptPrintId

				FROM(SELECT stk.ItemName,gen.GenericName, stk.BatchNo, stk.ExpiryDate, stk.MRP,stk.StoreName,
				stk.StoreId,stk.ItemId,stk.GoodsReceiptItemId,stk.Price,gritm.GoodReceiptId,gr.GoodReceiptPrintId,
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.Quantity ELSE 0 END) AS 'InQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.Quantity ELSE 0 END) AS 'OutQty',
					SUM(CASE WHEN stk.InOut = 'in' THEN stk.FreeQuantity ELSE 0 END) AS 'FInQty',
					SUM(CASE WHEN stk.InOut = 'out' THEN stk.FreeQuantity ELSE 0 END) AS 'FOutQty'

				FROM [dbo].[PHRM_StoreStock] AS stk

				join PHRM_GoodsReceiptItems as gritm on gritm.GoodReceiptItemId = stk.GoodsReceiptItemId
				join PHRM_GoodsReceipt as gr on gr.GoodReceiptId = gritm.GoodReceiptId
				join PHRM_MST_Item as itm on stk.ItemId = itm.ItemId
				join PHRM_MST_Generic gen on itm.GenericId = gen.GenericId

				GROUP BY stk.ItemName,gen.GenericName, stk.BatchNo , stk.ExpiryDate, stk.MRP,stk.StoreName,stk.StoreId,stk.ItemId,stk.GoodsReceiptItemId,stk.Price,gritm.GoodReceiptId,gr.GoodReceiptPrintId)as x1

				WHERE (@Status=x1.ItemName or x1.ItemName like '%'+ISNULL(@Status,'')+'%')

				GROUP BY x1.ItemName,x1.GenericName, x1.BatchNo, x1.ExpiryDate, x1.MRP,x1.StoreName,x1.ItemId,x1.StoreId,x1.GoodsReceiptItemId,x1.Price,x1.GoodReceiptId,x1.GoodReceiptPrintId

				HAVING SUM(FInQty + InQty - FOutQty - OutQty) >= 0	-- filtering out quantity >= 0
				ORDER BY x1.ItemName
		END		
END
GO


--End: Shankar: 21-Dec-2020 -- GoodReceiptPrintId included to show on GR page----

--START:Sanjesh-- 05-Jan-2021--Router link of pharmacy StockSummaryReport and FN_PHRM_StockDetailsOfGRItems and SP_PHRMReport_StockSummaryReport
insert into RBAC_Permission (PermissionName,ApplicationId,CreatedBy,CreatedOn,IsActive)
values ('reports-pharmacy-stock-summary-report-view',17,1,GETDATE(),1)
Go
declare @perid int
set @perid= (select PermissionId from RBAC_Permission where PermissionName='reports-pharmacy-stock-summary-report-view')

insert into RBAC_RouteConfig (DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Stock Summary Report','Pharmacy/Report/StockSummaryReport','StockSummaryReport',@perid,
158,1,NULL,1)
Go


/****** Object:  UserDefinedFunction [dbo].[FN_PHRM_StockDetailsOfGRItems]    Script Date: 1/4/2021 12:43:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


Create FUNCTION [dbo].[FN_PHRM_StockDetailsOfGRItems](@fromDate datetime,@toDate datetime)
RETURNS TABLE  
AS  
RETURN   
(  
select GRItemID
      ,GRItems.ItemId
      ,GRItems.ItemName
	  ,GRItems.BatchNo
	  ,GRItems.ExpiryDate
	  ,GRItems.GRItemPrice
	  ,GRItems.MRP
	  ,GRItems.UOMName
      ,GRIReceivedQuantity
	  ,GRIFreeQuantity
	  ,GRITotalAmount
	  ,RTSQuantity
	  ,RTSFreeAmount
	  ,RTSTotalAmount
	  ,SalesQuantity
	  ,SalesTotalAmount
	  ,ProvisionalQuantity
	  ,ProvisionalTotalAmount
	  ,ReturnQuantity
	  ,ReturnTotalAmount
	  ,StockManageQuantityIn
	  ,StockManageAmountIn
	  ,StockManageQuantityOut
	  ,StockManageAmountOut
from 
    (select  
        GRItemID
	   ,ItemID
       ,sum(isnull(ReceivedQuantity,0)) as 'GRIReceivedQuantity'
	   ,sum(isnull(FreeQuantity,0)) as 'GRIFreeQuantity'
	   ,sum(isnull(TotalAmount,0)) as 'GRITotalAmount' 
	   ,sum(isnull(RTSQuantity,0)) as 'RTSQuantity'
	   ,sum(isnull(RTSFreeAmount,0)) as 'RTSFreeAmount'
	   ,sum(isnull(RTSTotalAmount,0)) as 'RTSTotalAmount'
       ,sum(isnull(SalesQuantity,0)) as 'SalesQuantity'
	   ,sum(isnull(SalesTotalAmount,0)) as 'SalesTotalAmount'
	   ,sum(isnull(ProvisionalQuantity,0)) as 'ProvisionalQuantity'
	   ,sum(isnull(ProvisionalTotalAmount,0)) as 'ProvisionalTotalAmount'
	   ,sum(isnull(ReturnQuantity,0)) as 'ReturnQuantity'
	   ,sum(isnull(ReturnTotalAmount,0)) as 'ReturnTotalAmount'
	   ,sum(isnull(InQuantity,0)) as 'StockManageQuantityIn'
	   ,sum(isnull(InAmount,0)) as 'StockManageAmountIn'
	   ,sum(isnull(OutQuantity,0)) as 'StockManageQuantityOut'
	   ,sum(isnull(OutAmount,0)) as 'StockManageAmountOut'
from 
(
select case when InvoiceAndStockManage.GRItemID is null then GoodsReceipt.GoodReceiptItemId else InvoiceAndStockManage.GRItemID end as GRItemID
	   ,case when InvoiceAndStockManage.ItemId is null then GoodsReceipt.ItemId else InvoiceAndStockManage.ItemId end as ItemID
	   ,GoodsReceipt.FreeQuantity
	   ,GoodsReceipt.ReceivedQuantity
	   ,GoodsReceipt.RTSFreeAmount
	   ,GoodsReceipt.RTSQuantity
	   ,GoodsReceipt.RTSTotalAmount
	   ,GoodsReceipt.TotalAmount
	   ,InvoiceAndStockManage.SalesQuantity
	   ,InvoiceAndStockManage.SalesTotalAmount
	   ,InvoiceAndStockManage.ProvisionalQuantity
	   ,InvoiceAndStockManage.ProvisionalTotalAmount
	   ,InvoiceAndStockManage.ReturnQuantity
	   ,InvoiceAndStockManage.ReturnTotalAmount
	   ,InvoiceAndStockManage.InQuantity
	   ,InvoiceAndStockManage.InAmount
	   ,InvoiceAndStockManage.OutQuantity
	   ,InvoiceAndStockManage.OutAmount
from
(
select GRItemID
	  ,ItemId
      ,sum(isnull(SalesQuantity,0)) as 'SalesQuantity'
	  ,sum(isnull(SalesTotalAmount,0)) as 'SalesTotalAmount'
	  ,sum(isnull(ProvisionalQuantity,0)) as 'ProvisionalQuantity'
	  ,sum(isnull(ProvisionalTotalAmount,0)) as 'ProvisionalTotalAmount'
	  ,sum(isnull(ReturnQuantity,0)) as 'ReturnQuantity'
	  ,sum(isnull(ReturnTotalAmount,0)) as 'ReturnTotalAmount'
	  ,sum(isnull(InQuantity,0)) as 'InQuantity'
	  ,sum(isnull(InAmount,0)) as 'InAmount'
	  ,sum(isnull(OutQuantity,0)) as 'OutQuantity'
	  ,sum(isnull(OutAmount,0)) as 'OutAmount'
from 
(
	select case 
	          when StockManage.GoodsReceiptItemId is null then Invoice.GrItemId 
	          else StockManage.GoodsReceiptItemId 
		   end as GRItemID
		  ,case
		      when StockManage.ItemId is null then Invoice.ItemId
		      else StockManage.ItemId
		  end as ItemId
		  ,Invoice.GrItemId as InvoiceGRItemID
		  ,StockManage.GoodsReceiptItemId as StockManageGRItemID
		  ,Invoice.SalesQuantity
		  ,Invoice.SalesTotalAmount
		  ,Invoice.ProvisionalQuantity
		  ,Invoice.ProvisionalTotalAmount
		  ,Invoice.ReturnQuantity
		  ,Invoice.ReturnTotalAmount
		  ,StockManage.InQuantity
		  ,StockManage.InAmount
		  ,StockManage.OutQuantity
		  ,StockManage.OutAmount
	from 
		(select a.GrItemId
		       ,a.ItemId
			   ,sum(isnull(SalesQuantity,0)) as SalesQuantity
			   ,sum(isnull(SalesTotalAmount,0)) as SalesTotalAmount
			   ,sum(isnull(ProvisionalQuantity,0)) as ProvisionalQuantity
			   ,sum(isnull(ProvisionalTotalAmount,0)) as ProvisionalTotalAmount
			   ,sum(isnull(ReturnQuantity, 0)) as ReturnQuantity
			   ,sum(isnull(ReturnTotalAmount, 0)) as ReturnTotalAmount
		from
			    (select
					 InvItems.GrItemId
					,InvItems.ItemId
					,case
					   when InvItems.InvoiceId is null then InvItems.TotalAmount
					 end as ProvisionalTotalAmount
					,case
					   when InvItems.InvoiceId is null then InvItems.Quantity
					 end as ProvisionalQuantity
					,case
					   when InvItems.InvoiceId is not null then InvItems.TotalAmount
					 end as SalesTotalAmount
					,case
					   when InvItems.InvoiceId is not null then InvItems.Quantity
					 end as SalesQuantity
					,InvItemsReturn.ReturnedQty as ReturnQuantity
					,InvItemsReturn.TotalAmount as ReturnTotalAmount
				from 
				(select * from PHRM_TXN_InvoiceItems where CreatedOn between @fromDate and @toDate) as InvItems
				left join 
				(select * from PHRM_TXN_InvoiceReturnItems where CreatedOn between @fromDate and @toDate) as InvItemsReturn
				on 
				InvItems.InvoiceItemId = InvItemsReturn.InvoiceItemId
			) as a
			group by a.GrItemId,a.ItemId
	) 
	as Invoice

	full join

	 (select GoodsReceiptItemId
	        ,ItemId
			,sum(case when InOut = 'in' then Quantity else 0 end) as InQuantity
			,sum(case when InOut = 'in' then TotalAmount  else 0 end) as InAmount
			,sum(case when InOut = 'out' then Quantity else 0 end) as OutQuantity
			,sum(case when InOut = 'out' then TotalAmount else 0 end) as OutAmount
		from (select * from PHRM_StoreStock where CreatedOn between @fromDate and @toDate) as PHRM_StoreStock
		where TransactionType = 'stockmanage'
		group by GoodsReceiptItemId,ItemId
	) 
	as StockManage
	on
	Invoice.GrItemId = StockManage.GoodsReceiptItemId
) as g
group by g.GRItemID,g.ItemId

) as InvoiceAndStockManage

full join

	(select GRI.GoodReceiptItemId
		   ,GRI.ItemId
		   ,GRI.ReceivedQuantity
		   ,GRI.FreeQuantity
		   ,GRI.TotalAmount
		   ,RTS.Quantity as RTSQuantity
		   ,RTS.FreeAmount as RTSFreeAmount
		   ,RTS.TotalAmount as RTSTotalAmount
	from 
	(select * from PHRM_GoodsReceipt where GoodReceiptDate between @fromDate and @toDate) as GR
	join 
	(select * from PHRM_GoodsReceiptItems) as GRI
	on
	GRI.GoodReceiptId = GR.GoodReceiptId
	left join 
	(select * from PHRM_ReturnToSupplierItems) as RTS
	on
	GRI.GoodReceiptItemId = RTS.GoodReceiptItemId
	where GR.IsCancel = 0
) 
as GoodsReceipt
on 
InvoiceAndStockManage.GRItemID = GoodsReceipt.GoodReceiptItemId 
) as f
group by f.GRItemID,f.ItemId 
) 
as GRItemStock
join 
PHRM_GoodsReceiptItems as GRItems
on
GRItemStock.GRItemID = GRItems.GoodReceiptItemId

);  
GO


/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_StockSummaryReport]    Script Date: 12/31/2020 5:35:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


Create PROCEDURE [dbo].[SP_PHRMReport_StockSummaryReport] 
	     @FromDate datetime= null,
		 @ToDate datetime= null	
		 
AS
set @FromDate = @FromDate + ' 00:00:00.000'
set @ToDate = @ToDate + ' 23:59:59.997'
/*
FileName: [SP_PHRMReport_StockSummaryReport]
CreatedBy/date: Umed/2018-02-27
Description: 
1. Created Seprate Function to Get Opention Stock Count of Selected FromDate 


Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1       Arpan/2020-12-31	                 created the script.
                                  
								
 2.     Sanjesh/ 2021-01-04            updated script
----------------------------------------------------------------------------
*/
BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
	BEGIN


create table #GRItemsStockBetweenDates(
     GRItemID int primary key
    ,ItemId int
    ,ItemName nvarchar(max),
	UOMName nvarchar(max)
	,BatchNo nvarchar(max)
	,ExpiryDate datetime
	,GRItemPrice decimal(16,4)
	,MRP decimal(16,4) 
	,GRIReceivedQuantity int 
	,GRIFreeQuantity int
	,GRITotalAmount decimal(16,4)
	,RTSQuantity int
	,RTSFreeAmount decimal(16,4)
	,RTSTotalAmount decimal(16,4)
	,SalesQuantity int
	,SalesTotalAmount decimal(16,4) 
	,ProvisionalQuantity int
	,ProvisionalTotalAmount decimal(16,4)
	,ReturnQuantity int
	,ReturnTotalAmount decimal(16,4)
	,StockManageQuantityIn int
	,StockManageAmountIn decimal(16,4)
	,StockManageQuantityOut int
	,StockManageAmountOut decimal(16,4)
);


create table #GRItemsStartingStock(
     GRItemID int primary key
    ,ItemId int
    ,ItemName nvarchar(max),
	UOMName nvarchar(max)
	,BatchNo nvarchar(max)
	,ExpiryDate datetime
	,GRItemPrice decimal(16,4)
	,MRP decimal(16,4) 
	,GRIReceivedQuantity int 
	,GRIFreeQuantity int
	,GRITotalAmount decimal(16,4)
	,RTSQuantity int
	,RTSFreeAmount decimal(16,4)
	,RTSTotalAmount decimal(16,4)
	,SalesQuantity int
	,SalesTotalAmount decimal(16,4) 
	,ProvisionalQuantity int
	,ProvisionalTotalAmount decimal(16,4)
	,ReturnQuantity int
	,ReturnTotalAmount decimal(16,4)
	,StockManageQuantityIn int
	,StockManageAmountIn decimal(16,4)
	,StockManageQuantityOut int
	,StockManageAmountOut decimal(16,4)
);


insert into #GRItemsStartingStock
select * from 
dbo.FN_PHRM_StockDetailsOfGRItems('2016-01-01 00:00:00.000', @FromDate)


insert into #GRItemsStockBetweenDates
select * from 
dbo.FN_PHRM_StockDetailsOfGRItems(@FromDate, @ToDate)


select  
      (isnull(Starting.GRIReceivedQuantity + Starting.GRIFreeQuantity 
	         - Starting.ProvisionalQuantity - Starting.SalesQuantity  + Starting.ReturnQuantity 
			 + Starting.StockManageQuantityIn - Starting.StockManageQuantityOut, 0)) as StartingQuantity
      ,(isnull(Starting.GRITotalAmount 
	        - Starting.ProvisionalTotalAmount - Starting.SalesTotalAmount + Starting.ReturnTotalAmount 
			  + Starting.StockManageAmountIn - Starting.StockManageAmountOut, 0.000)) as StartingAmount
	  ,BetweenDates.*
	  ,(isnull(BetweenDates.GRIReceivedQuantity + BetweenDates.GRIFreeQuantity 
			  - BetweenDates.ProvisionalQuantity - BetweenDates.SalesQuantity + BetweenDates.ReturnQuantity 
			  + BetweenDates.StockManageQuantityIn - BetweenDates.StockManageQuantityOut, 0)) as EndingQuantity
      ,(isnull(BetweenDates.GRITotalAmount + BetweenDates.ProvisionalTotalAmount 
			  - BetweenDates.SalesTotalAmount + BetweenDates.ReturnTotalAmount 
			  + BetweenDates.StockManageAmountIn - BetweenDates.StockManageAmountOut, 0.000)) as EndingAmount
from 
	#GRItemsStockBetweenDates as BetweenDates
left join
	#GRItemsStartingStock as Starting
on 
	BetweenDates.GRItemID = Starting.GRItemID

	END
END
GO

--END:Sanjesh--05-Jan-2021--Router link of pharmacy StockSummaryReport and FN_PHRM_StockDetailsOfGRItems and SP_PHRMReport_StockSummaryReport

-------------Merged from Pharmacy_Enhancement to DEV--------------

---Start:Anjana:01/05/2021: Made corrections in SP--------------
SET QUOTED_IDENTIFIER ON
GO

 ALTER PROCEDURE [dbo].[SP_INV_RPT_GetSubstoreDispConsumption_Summary ] 
  @StoreIds NVARCHAR(400) = '' ,
  @FromDate Datetime = null,
  @ToDate DateTime = null
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date          Remarks
----------------------------------------------------------
1    Anjana/12/18/2020        Initial Draft
2	 Sud/01/05/2021			  Made Corrections 
---------------------------------------------------------------------
*/
 BEGIN
 
 
  Declare @StoreIdTbl Table(StoreId int)
  Insert into @StoreIdTbl
  SELECT value FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> ''
  
   SELECT 
       sub.SubCategoryName,
      itm.ItemName, 
      itm.ItemId,
      itm.Code,
      itm.ItemType,
      unit.UOMName as Unit,
      dis.DispatchQuantity,
      dis.DispatchValue,
      con.ConsumptionQuantity,
      con.ConsumptionValue
    From 
	INV_MST_Item itm 
	  inner join INV_MST_ItemSubCategory sub on itm.SubCategoryId = sub.SubCategoryId
	  left join  INV_MST_UnitOfMeasurement unit on itm.UnitOfMeasurementId = unit.UOMId 
      left join ( Select ItemId, Sum(Quantity) 'DispatchQuantity', Sum(ISNULL(Price,0)*ISNULL(Quantity,0)) 'DispatchValue' 
	        from WARD_INV_Transaction txn
			where TransactionType = 'dispatched-items' 
                  and Convert(Date, TransactionDate) between ISNULL(@FromDate, Convert(Date, GETDATE())) AND ISNULL(@ToDate, Convert(DATE, GETDATE())) 
				  and txn.StoreId IN (Select StoreId from @StoreIdTbl)
			group by ItemId
			) dis 
			on itm.ItemId = dis.ItemId

     left join ( Select ItemId, Sum(Quantity) 'ConsumptionQuantity', Sum(ISNULL(Price,0)*ISNULL(Quantity,0)) 'ConsumptionValue' 
	      from WARD_INV_Transaction  txn
		  where TransactionType = 'consumption-items' 
		        and Convert(Date, TransactionDate) between ISNULL(@FromDate, Convert(Date, GETDATE())) AND ISNULL(@ToDate, Convert(DATE, GETDATE())) 
		       and txn.StoreId IN (Select StoreId from @StoreIdTbl)
		  group by ItemId )con 
		  on itm.ItemId = con.ItemId
   
     where (
	  ISNULL(dis.DispatchQuantity,0) !=0 
	  OR ISNULL(con.ConsumptionQuantity,0) !=0 
	)

    ORDER BY sub.SubCategoryName, itm.ItemName 

 END
 GO

 ----------------SP of INV_RPT_GetSubstoreDispConsumption_Items -----
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_INV_RPT_GetSubstoreDispConsumption_Items ] 
	@StoreIds NVARCHAR(400) = '' ,
	@ItemId NVARCHAR(50),
	@FromDate DateTime,
	@ToDate DateTime
AS
/*
Change History
----------------------------------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------------------------------
1		Anjana/12/18/2020				Initial Draft
2		Anjana/01/05/2020				Added two more parameters for date filter
----------------------------------------------------------------------------------
*/

  DECLARE @StoreIdTbl Table(StoreId int)
  Insert into @StoreIdTbl
  SELECT value FROM STRING_SPLIT(@StoreIds, ',') WHERE RTRIM(value) <> ''
	BEGIN
		SELECT 
			itm.ItemName, 
			itm.ItemId,
			itm.Code,
			itm.ItemType,
			txn.TransactionId,
			txn.TransactionDate,
			txn.StoreId,
			txn.ItemId,
			txn.InOut,
			txn.TransactionType,
			txn.Price,
			txn.Quantity,
			sto.Name,
			gr.GoodsReceiptNo,
			CASE When TransactionType ='dispatched-items' Then txn.Price*txn.Quantity Else 0 END as 'DispatchValue',
			CASE WHEN TransactionType ='consumption-items' Then txn.Price*txn.Quantity ELSE 0 END as 'ConsumptionValue',
			CASE WHEN TransactionType='dispatched-items' Then txn.Quantity ELSE 0 END as 'DispatchQuantity',
			CASE WHEN TransactionType='consumption-items' Then txn.Quantity ELSE 0 END as 'ConsumptionQuantity'
			
		From @StoreIdTbl store
		join WARD_INV_Transaction txn on store.StoreId = txn.StoreId
		join PHRM_MST_Store sto on store.StoreId = sto.StoreId
		join INV_MST_Item itm on txn.ItemId = itm.ItemId
		join INV_TXN_GoodsReceiptItems gritm on txn.GoodsReceiptItemId = gritm.GoodsReceiptItemId
		join INV_TXN_GoodsReceipt gr on gritm.GoodsReceiptId = gr.GoodsReceiptID
		WHERE  txn.StoreId IN (Select StoreId from @StoreIdTbl) and itm.ItemId = @ItemId and Convert(Date, TransactionDate) between ISNULL(@FromDate, Convert(Date, GETDATE())) AND ISNULL(@ToDate, Convert(DATE, GETDATE())) 
		ORDER BY sto.Name asc, txn.TransactionDate asc
	END
GO

 ---END:Anjana:01/05/2021: Made corrections in SP--------------

 --start: Sud:5Jan'21--PHRM-Packing insert default value--
 If NOT EXISTS(Select 1 from PHRM_MST_PackingType)
BEGIN
  Insert into PHRM_MST_PackingType(PackingName,PackingQuantity,CreatedBy, CreatedOn,IsActive)
  Values('1x1',1,1,getdate(),1)
END
GO
 --end: Sud:5Jan'21--PHRM-Packing insert default value--

 --start: sud-7Jan'21-Phrm Db Correction--
 EXEC sp_rename 'PHRM_DispensaryStock.GoodReceiptIemId', 'GoodReceiptItemId', 'COLUMN'; 
 GO
  --end: sud-7Jan'21-Phrm Db Correction--
--Start:Sanjesh:21-Jan'21-column named oldMRP and StoreStockId added in PHRM_StockTxnItems_MRPHistory  table
ALTER TABLE PHRM_StockTxnItems_MRPHistory 
ADD oldMRP [decimal](18, 4) NULL, StoreStockId [int] NULL;
GO
ALTER TABLE [dbo].[PHRM_StockTxnItems_MRPHistory]  WITH NOCHECK ADD  CONSTRAINT [FK_PHRM_StockTxnItems_MRPHistory_StoreStockId_PHRM_StoreStock_StoreStockId] FOREIGN KEY([StoreStockId])
REFERENCES [dbo].[PHRM_StoreStock] ([StoreStockId])
GO

ALTER TABLE [dbo].[PHRM_StockTxnItems_MRPHistory] CHECK CONSTRAINT [FK_PHRM_StockTxnItems_MRPHistory_StoreStockId_PHRM_StoreStock_StoreStockId]
GO
--End:Sanjesh:21-Jan'21-column named oldMRP and StoreStockId added in PHRM_StockTxnItems_MRPHistory  table

--START: Sanjit 21Jan21 - SP alter for Stock Summary Report in Pharmacy and Item-wise transaction
ALTER PROCEDURE [dbo].[SP_PHRMReport_StockSummaryReport] 
	     @FromDate datetime= null,
		 @ToDate datetime= null	
		 
AS
set @FromDate = @FromDate + ' 00:00:00.000'
set @ToDate = @ToDate + ' 23:59:59.997'
/*
FileName: [SP_PHRMReport_StockSummaryReport]
CreatedBy/date: Umed/2018-02-27
Description: 
1. Created Seprate Function to Get Opention Stock Count of Selected FromDate 


Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
1       Arpan/2020-12-31	                created the script.
2.		Sanjesh/ 2021-01-04					updated script
3.		Sanjit/ 2021-01-21					changed the sequence for UOM Name
----------------------------------------------------------------------------
*/
BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
	BEGIN


create table #GRItemsStockBetweenDates(
     GRItemID int primary key
    ,ItemId int
    ,ItemName nvarchar(max)
	,BatchNo nvarchar(max)
	,ExpiryDate datetime
	,GRItemPrice decimal(16,4)
	,MRP decimal(16,4) 
	,UOMName nvarchar(max)
	,GRIReceivedQuantity int 
	,GRIFreeQuantity int
	,GRITotalAmount decimal(16,4)
	,RTSQuantity int
	,RTSFreeAmount decimal(16,4)
	,RTSTotalAmount decimal(16,4)
	,SalesQuantity int
	,SalesTotalAmount decimal(16,4) 
	,ProvisionalQuantity int
	,ProvisionalTotalAmount decimal(16,4)
	,ReturnQuantity int
	,ReturnTotalAmount decimal(16,4)
	,StockManageQuantityIn int
	,StockManageAmountIn decimal(16,4)
	,StockManageQuantityOut int
	,StockManageAmountOut decimal(16,4)
);


create table #GRItemsStartingStock(
     GRItemID int primary key
    ,ItemId int
    ,ItemName nvarchar(max)
	,BatchNo nvarchar(max)
	,ExpiryDate datetime
	,GRItemPrice decimal(16,4)
	,MRP decimal(16,4)
	,UOMName nvarchar(max) 
	,GRIReceivedQuantity int 
	,GRIFreeQuantity int
	,GRITotalAmount decimal(16,4)
	,RTSQuantity int
	,RTSFreeAmount decimal(16,4)
	,RTSTotalAmount decimal(16,4)
	,SalesQuantity int
	,SalesTotalAmount decimal(16,4) 
	,ProvisionalQuantity int
	,ProvisionalTotalAmount decimal(16,4)
	,ReturnQuantity int
	,ReturnTotalAmount decimal(16,4)
	,StockManageQuantityIn int
	,StockManageAmountIn decimal(16,4)
	,StockManageQuantityOut int
	,StockManageAmountOut decimal(16,4)
);


insert into #GRItemsStartingStock
select * from 
dbo.FN_PHRM_StockDetailsOfGRItems('2016-01-01 00:00:00.000', @FromDate)


insert into #GRItemsStockBetweenDates
select * from 
dbo.FN_PHRM_StockDetailsOfGRItems(@FromDate, @ToDate)


select  
      (isnull(Starting.GRIReceivedQuantity + Starting.GRIFreeQuantity 
	         - Starting.ProvisionalQuantity - Starting.SalesQuantity  + Starting.ReturnQuantity 
			 + Starting.StockManageQuantityIn - Starting.StockManageQuantityOut, 0)) as StartingQuantity
      ,(isnull(Starting.GRITotalAmount 
	        - Starting.ProvisionalTotalAmount - Starting.SalesTotalAmount + Starting.ReturnTotalAmount 
			  + Starting.StockManageAmountIn - Starting.StockManageAmountOut, 0.000)) as StartingAmount
	  ,BetweenDates.*
	  ,(isnull(BetweenDates.GRIReceivedQuantity + BetweenDates.GRIFreeQuantity 
			  - BetweenDates.ProvisionalQuantity - BetweenDates.SalesQuantity + BetweenDates.ReturnQuantity 
			  + BetweenDates.StockManageQuantityIn - BetweenDates.StockManageQuantityOut, 0)) as EndingQuantity
      ,(isnull(BetweenDates.GRITotalAmount + BetweenDates.ProvisionalTotalAmount 
			  - BetweenDates.SalesTotalAmount + BetweenDates.ReturnTotalAmount 
			  + BetweenDates.StockManageAmountIn - BetweenDates.StockManageAmountOut, 0.000)) as EndingAmount
from 
	#GRItemsStockBetweenDates as BetweenDates
left join
	#GRItemsStartingStock as Starting
on 
	BetweenDates.GRItemID = Starting.GRItemID

	END
END
GO
CREATE PROCEDURE [dbo].[SP_PHRMReport_ItemTxnSummaryReport] 
    @FromDate DATETIME = null,
    @ToDate DATETIME = null,  
	@ItemId INT = null
AS
    SET @FromDate = @FromDate + ' 00:00:00.000'
	SET @ToDate = @ToDate + ' 23:59:59.997'
/*
	FileName: [SP_PHRMReport_ItemTxnSummaryReport]
	CreatedBy/date: Sanjit/2021-01-20
	Description: 
	1. Created to find all the item txn as a part of stock summary report in pharmacy

	Change History
	----------------------------------------------------------------------------
	S.No.    UpdatedBy/Date                        Remarks
	---------------------------------------------------------------------------
	1       Sanjit/2021-01-20					created the script.
	----------------------------------------------------------------------------
*/
BEGIN
	SELECT Date, ReferenceNoPrefix, ReferenceNo, Type, StockIn, StockOut, Rate, MRP, ExpiryDate FROM 
	(
		--Purchase from Goods Receipt Table
		SELECT GR.GoodReceiptDate AS [Date],
			  'GR' AS [ReferenceNoPrefix],
			  GR.GoodReceiptPrintId AS [ReferenceNo],
			  'Purchase' AS [Type],
			  ISNULL(GRI.ReceivedQuantity,0) + ISNULL(GRI.FreeQuantity,0) AS [StockIn],
			  0 AS [StockOut],
			  GRI.GRItemPrice AS [Rate],
			  GRI.MRP AS [MRP],
			  CONVERT(varchar, GRI.ExpiryDate, 23) AS [ExpiryDate]
		FROM PHRM_GoodsReceiptItems AS GRI
		INNER JOIN PHRM_GoodsReceipt AS GR ON GR.GoodReceiptId = GRI.GoodReceiptId
		WHERE (GRI.ItemId = @ItemId) AND GR.IsCancel != 1 AND (GR.GoodReceiptDate BETWEEN @fromDate AND @toDate)

		UNION

		-- Purchase Return from Return To Supplier
		SELECT RTS.ReturnDate AS [Date],
			  'RGR' AS [ReferenceNoPrefix],
			  RTS.CreditNotePrintId AS [ReferenceNo],
			  'PurchaseReturn' AS [Type],
			  0 AS [StockIn],
			  (ISNULL(RTSI.Quantity,0) + ISNULL(RTSI.FreeQuantity,0)) AS [StockOut],
			  RTSI.ItemPrice AS [Rate],
			  RTSI.MRP AS [MRP],
			  CONVERT(varchar, RTSI.ExpiryDate, 23) AS [ExpiryDate]
		FROM PHRM_ReturnToSupplierItems RTSI
		JOIN PHRM_ReturnToSupplier RTS ON RTSI.ReturnToSupplierId = RTS.ReturnToSupplierId
		WHERE RTSI.ItemId = @ItemId AND RTS.ReturnDate BETWEEN @fromDate AND @toDate

		UNION

		--Purchase Cancel , txn type = cancel-gr
		SELECT GR.GoodReceiptDate AS [Date],
			  'CGR' AS [ReferenceNoPrefix],
			  GR.GoodReceiptPrintId AS [ReferenceNo],
			  'PurchaseCancel' AS [Type],
			  ISNULL(GRI.ReceivedQuantity,0) + ISNULL(GRI.FreeQuantity,0) AS [StockIn],
			  0 AS [StockOut],
			  GRI.GRItemPrice AS [Rate],
			  GRI.MRP AS [MRP],
			  CONVERT(varchar, GRI.ExpiryDate, 23) AS [ExpiryDate]
		FROM PHRM_GoodsReceiptItems AS GRI
		INNER JOIN PHRM_GoodsReceipt AS GR ON GR.GoodReceiptId = GRI.GoodReceiptId
		WHERE (GRI.ItemId = @ItemId) AND GR.IsCancel = 1 AND (GR.GoodReceiptDate BETWEEN @fromDate AND @toDate)

		UNION

		--StockManageIn from PHRM_StoreStock
		SELECT S.CreatedOn AS [Date],
			  'SMI' AS [ReferenceNoPrefix],
			  S.ReferenceNo AS [ReferenceNo],
			  'StockManageIn' AS [Type],
			  (ISNULL(S.Quantity,0) + ISNULL(S.FreeQuantity,0)) AS [StockIn],
			  0 AS [StockOut],
			  S.Price AS [Rate],
			  S.MRP AS [MRP],
			  CONVERT(varchar, S.ExpiryDate, 23) AS [ExpiryDate]
		FROM PHRM_StoreStock S
		WHERE TransactionType = 'stockmanage'
				AND InOut = 'in'
				AND S.ItemId = @ItemId
				AND S.CreatedOn BETWEEN @fromDate AND @toDate

		UNION

		--StockManageOut from PHRM_StoreStock
		SELECT S.CreatedOn AS [Date],
			  'SMO' AS [ReferenceNoPrefix],
			  S.ReferenceNo AS [ReferenceNo],
			  'StockManageIn' AS [Type],
			  0 AS [StockIn],
			  (ISNULL(S.Quantity,0) + ISNULL(S.FreeQuantity,0)) AS [StockOut],
			  S.Price AS [Rate],
			  S.MRP AS [MRP],
			  CONVERT(varchar, S.ExpiryDate, 23) AS [ExpiryDate]
		FROM PHRM_StoreStock S
		WHERE TransactionType = 'stockmanage'
				AND InOut = 'out'
				AND S.ItemId = @ItemId
				AND S.CreatedOn BETWEEN @fromDate AND @toDate

		UNION

		-- Sale from Invoice Table
			SELECT I.CreateOn AS [Date],
			  'PHRMS' AS [ReferenceNoPrefix],
			  I.InvoicePrintId AS [ReferenceNo],
			  'Sale' AS [Type],
			  0 AS [StockIn],
			  (ISNULL(IItem.Quantity,0) + ISNULL(IItem.FreeQuantity,0)) AS [StockOut],
			  IItem.Price AS [Rate],
			  IItem.MRP AS [MRP],
			  CONVERT(varchar, IItem.ExpiryDate, 23) AS [ExpiryDate]
		FROM PHRM_TXN_InvoiceItems IItem
		JOIN PHRM_TXN_Invoice I ON I.InvoiceId = IItem.InvoiceId
		WHERE IItem.ItemId = @ItemId AND I.CreateOn BETWEEN @fromDate AND @toDate

		UNION

		-- Sales Return from Invoice Return Table
		SELECT IR.CreatedOn AS [Date],
			'PHRMSR' AS [ReferenceNoPrefix],
			IR.CreditNoteID AS [ReferenceNo],
			'SaleReturn' AS [Type],
			(ISNULL(IRI.ReturnedQty,0)) AS [StockIn],
			0 AS [StockOut],
			IRI.Price AS [Rate],
			IRI.MRP AS [MRP],
			CONVERT(varchar, IItem.ExpiryDate, 23) AS [ExpiryDate]
		FROM PHRM_TXN_InvoiceReturnItems IRI
		JOIN PHRM_TXN_InvoiceReturn IR ON IR.InvoiceReturnId = IRI.InvoiceReturnId
		JOIN PHRM_TXN_InvoiceItems IItem ON IItem.InvoiceItemId = IRI.InvoiceItemId
		WHERE IRI.ItemId = @ItemId AND IR.CreatedOn BETWEEN @fromDate AND @toDate
	) ItemTxns
	ORDER BY ItemTxns.Date
END
GO
--END: Sanjit 21Jan21 - SP alter for Stock Summary Report in Pharmacy and Item-wise transaction
 
--START: Bikash, 19 Dec 2021, Discharge Summary Enhancement
ALTER TABLE ADT_DischargeSummary
ALTER COLUMN LabTests VARCHAR(5000);
GO

ALTER TABLE ADT_DischargeSummary
ADD SelectedImagingItems NVARCHAR(2000) NULL;
GO
--END: Bikash, 19 Dec 2021, Discharge Summary Enhancement
--Sanjesh:01 Feb 2021 -Added CancelRemarks,CancelledBy and CancelledOn column in PHRM_GoodsReceipt table
ALTER TABLE PHRM_GoodsReceipt 
ADD CancelRemarks nvarchar(200) ,CancelledBy int null,CancelledOn Datetime null
GO
--Sanjesh:01 Feb 2021 -Added CancelRemarks,CancelledBy and CancelledOn column in PHRM_GoodsReceipt table

------Merge From EMR V1.48.9X to DEV Branch 10 Feb 2021-----
-- Start: Bikash 3rd Fed'21 Updateing Route link display name My Appointments to Out Patient

UPDATE RBAC_RouteConfig
set DisplayName = 'Out Patient'
where DisplayName ='My Appointments'
GO
-- End : Bikash 3rd Fed'21 Updateing Route link display name My Appointments to Out Patient

-- Start: Bikash 3rd-Feb'21, Route config for doctor new patients

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationID from RBAC_Application where ApplicationName = 'Doctors' and ApplicationCode='DOC');

Insert into RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive) values ('doctors-op-newpatient-view', @ApplicationId, 1, GETDATE(),1);
GO

declare @PermissionId INT 
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='doctors-op-newpatient-view');

declare @RefParentRouteId INT 
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Doctors/OutPatientDoctor');

Insert into RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive) values('New Patient','Doctors/OutPatientDoctor/NewPatient','NewPatient',@PermissionId,@RefParentRouteId,1,NULL,1);
GO
-- End: Bikash 3rd-Feb'21, Route config for doctor new patients

-- Start: Bikash 3rd-Feb'21, Route config for doctor opd records

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationID from RBAC_Application where ApplicationName = 'Doctors' and ApplicationCode='DOC');

Insert into RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive) values ('doctors-op-opd-record-view', @ApplicationId, 1, GETDATE(),1);
GO

declare @PermissionId INT 
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='doctors-op-opd-record-view');

declare @RefParentRouteId INT 
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Doctors/OutPatientDoctor');

Insert into RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive) values('OPD Record','Doctors/OutPatientDoctor/OPDRecord','OPDRecord',@PermissionId,@RefParentRouteId,1,NULL,1);
GO
-- End: Bikash 3rd-Feb'21, Route config for doctor opd records

-- Start: Bikash 5th-Feb'21, Route config for Scanned Images for Nursing

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationID from RBAC_Application where ApplicationName = 'Nursing' and ApplicationCode='NUR');

Insert into RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive) values ('nursing-scanned-images-view', @ApplicationId, 1, GETDATE(),1);
GO

declare @PermissionId INT 
SET @PermissionId = (Select TOP(1) PermissionId from RBAC_Permission where PermissionName='nursing-scanned-images-view');

declare @RefParentRouteId INT 
SET @RefParentRouteId = (Select TOP(1) RouteId from RBAC_RouteConfig where UrlFullPath='Nursing/PatientOverviewMain');

Insert into RBAC_RouteConfig(DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, DisplaySeq, IsActive) values('Scanned Images','Nursing/PatientOverviewMain/ScannedImages','ScannedImages',@PermissionId,@RefParentRouteId,1,NULL,1);
GO
-- End: Bikash 5th-Feb'21, Route config for Scanned Images for Nursing

-- Start: Bikash 5th-Feb'21, Adding Nursing Note in Note type table 
INSERT INTO CLN_MST_NoteType
values('Nursing Note',1,GETDATE(),1);
GO
-- End: Bikash 5th-Feb'21, Adding Nursing Note in Note type table 

-- Start: Bikash 5th-Feb'21, Adding IsForNursing flag to assign note for nursing staff
ALTER TABLE CLN_MST_NoteType
ADD IsForNursing bit NULL;
GO

update CLN_MST_NoteType
set IsForNursing = 1 
Go
update CLN_MST_NoteType
set IsForNursing = 0 
where NoteType in ('Discharge Note', 'Emergency Note', 'Procedure Note', 'Prescription Note');
GO

ALTER TABLE CLN_Template
ADD IsForNursing bit NULL;
GO
update CLN_Template
set IsForNursing = 1;
GO
update CLN_Template
set IsForNursing = 0 
where TemplateName in ('Discharge Note', 'Emergency Note', 'Procedure Note', 'Prescription Note');
GO
-- End: Bikash 5th-Feb'21, Adding IsForNursing flag to assign note for nursing staff

-- Start: Bikash 8th-Feb'21, altering clinical Notes table 
ALTER TABLE CLN_Notes 
ADD ICDSelected nvarchar(max) NULL;
GO

ALTER TABLE CLN_Notes 
ALTER COLUMN Remarks nvarchar(max) NULL;
GO
-- End: Bikash 8th-Feb'21, altering clinical Notes table

-- Start: Bikash 8th-Feb'21, altering clinical Emergency Note table
ALTER TABLE CLN_Notes_Emergency 
ADD ICDSelected nvarchar(max) NULL;
GO
-- End: Bikash 8th-Feb'21, altering clinical Emergency Note table

-- Start: Bikash 8th-Feb'21, altering clinical Free Text Note table
ALTER TABLE CLN_Notes_FreeText
ALTER COLUMN [FreeText] nvarchar(max) NULL;
GO
-- End: Bikash 8th-Feb'21, altering clinical Free Text Note table

---Add new script here---
--Sanjesh:08 Feb 2021 -Added IsPacking ,IsItemDiscountApplicable and IsPacking,IsItemDiscountApplicable,PackingQty,StripMRP in PHRM_GoodsReceipt  and PHRM_GoodsReceiptItems table 
ALTER TABLE PHRM_GoodsReceiptItems
ADD IsPacking bit default 0,
IsItemDiscountApplicable bit default 0,
PackingQty int , StripMRP decimal(16,4)
Go
ALTER TABLE PHRM_GoodsReceipt
ADD IsPacking bit default 0,
IsItemDiscountApplicable bit default 0
Go
--Sanjesh:08 Feb 2021 -Added IsPacking ,IsItemDiscountApplicable and IsPacking,IsItemDiscountApplicable,PackingQty,StripMRP  in PHRM_GoodsReceipt  and PHRM_GoodsReceiptItems table
--Sanjesh:10 Feb 2021 -Added PackingTypeId column in  PHRM_GoodsReceiptItems table 
ALTER Table PHRM_GoodsReceiptItems
ADD PackingTypeId int null
Go
--Sanjesh:10 Feb 2021 -Added PackingTypeId column in  PHRM_GoodsReceiptItems table

------Merge From EMR V1.48.9X to DEV Branch 10 Feb 2021-----

-- Start: Bikash 11th-Feb'21, Adding permission for discharge summary add, edit, view buttons. 

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationID from RBAC_Application where ApplicationName = 'ADT' and ApplicationCode='ADT');
Insert into RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive) values ('adt-nursing-discharge-summary-add-view-btn-permission', @ApplicationId, 1, GETDATE(),1);
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationID from RBAC_Application where ApplicationName = 'ADT' and ApplicationCode='ADT');
Insert into RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive) values ('adt-nursing-discharge-summary-edit-btn-permission', @ApplicationId, 1, GETDATE(),1);
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationID from RBAC_Application where ApplicationName = 'ADT' and ApplicationCode='ADT');
Insert into RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive) values ('adt-discharge-summary-clear-due-btn-permission', @ApplicationId, 1, GETDATE(),1);
GO

declare @ApplicationId INT
SET @ApplicationId = (Select TOP(1) ApplicationID from RBAC_Application where ApplicationName = 'ADT' and ApplicationCode='ADT');
Insert into RBAC_Permission(PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive) values ('adt-discharge-summary-cancel-btn-permission', @ApplicationId, 1, GETDATE(),1);
GO

-- End: Bikash 11th-Feb'21, Adding permission for discharge summary add, edit, view buttons

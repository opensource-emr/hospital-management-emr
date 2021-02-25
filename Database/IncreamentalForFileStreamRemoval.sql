----IMPORTANT--- DON'T RUN BELOW SCRIPT UNTIL YOU CREATE FOlders for PatientImage and Clinical Image storage--
--- for  HAMS LIVE Please connect with Sud once before running it there..----

-- It's path can be set from parameters, name mentioned below..---
----1. PatientProfilePicImageUploadLocation,   2. ClinicalDocumentUploadLocation ----

---Anish:Start: 24 March-2020, Patient Image upload location parameterized----

CREATE PROCEDURE dbo.usp_ExportPatientProfileImage (
    @PicName NVARCHAR (400)
   ,@ImageFolderPath NVARCHAR(1000)
   ,@Filename NVARCHAR(1000)
   )
AS
BEGIN
   DECLARE @ImageData VARBINARY (max);
   DECLARE @Path2OutFile NVARCHAR (2000);
   DECLARE @Obj INT
 
   SET NOCOUNT ON
 
   SELECT @ImageData = (
         SELECT convert (VARBINARY (max), FileBinaryData, 1)
         FROM PAT_PatientFiles
         WHERE FileName = @PicName AND IsActive=1
         );
 
   SET @Path2OutFile = CONCAT (
         @ImageFolderPath
         , @Filename
         );
    BEGIN TRY
     EXEC sp_OACreate 'ADODB.Stream' ,@Obj OUTPUT;
     EXEC sp_OASetProperty @Obj ,'Type',1;
     EXEC sp_OAMethod @Obj,'Open';
     EXEC sp_OAMethod @Obj,'Write', NULL, @ImageData;
     EXEC sp_OAMethod @Obj,'SaveToFile', NULL, @Path2OutFile, 2;
     EXEC sp_OAMethod @Obj,'Close';
     EXEC sp_OADestroy @Obj;
    END TRY
    
 BEGIN CATCH
  EXEC sp_OADestroy @Obj;
 END CATCH
 
   SET NOCOUNT OFF
END
GO

CREATE PROCEDURE dbo.usp_ExportPatientClinicalImage (
    @PicName NVARCHAR (400)
   ,@ImageFolderPath NVARCHAR(1000)
   ,@Filename NVARCHAR(1000)
   )
AS
BEGIN
   DECLARE @ImageData VARBINARY (max);
   DECLARE @Path2OutFile NVARCHAR (2000);
   DECLARE @Obj INT
 
   SET NOCOUNT ON
 
   SELECT @ImageData = (
         SELECT convert (VARBINARY (max), FileBinaryData, 1)
         FROM CLN_PAT_Images
         WHERE FileName = @PicName AND IsActive=1
         );
 
   SET @Path2OutFile = CONCAT (
         @ImageFolderPath
         , @Filename
         );
    BEGIN TRY
     EXEC sp_OACreate 'ADODB.Stream' ,@Obj OUTPUT;
     EXEC sp_OASetProperty @Obj ,'Type',1;
     EXEC sp_OAMethod @Obj,'Open';
     EXEC sp_OAMethod @Obj,'Write', NULL, @ImageData;
     EXEC sp_OAMethod @Obj,'SaveToFile', NULL, @Path2OutFile, 2;
     EXEC sp_OAMethod @Obj,'Close';
     EXEC sp_OADestroy @Obj;
    END TRY
    
 BEGIN CATCH
  EXEC sp_OADestroy @Obj;
 END CATCH
 
   SET NOCOUNT OFF
END
GO
-------SQL to Update Older Data of PatientFiles table Starts-----
sp_configure 'show advanced options', 1;
GO
RECONFIGURE;
GO
sp_configure 'Ole Automation Procedures', 1;
GO
RECONFIGURE;
GO

Declare @location varchar(800);
SET @location = (SELECT ParameterValue from CORE_CFG_Parameters WHERE LOWER(ParameterGroupName)='patient' 
AND ParameterName = 'PatientProfilePicImageUploadLocation');
Declare @fileName varchar(500);
Declare @patFileId int;
SELECT * INTO tempTable FROM PAT_PatientFiles Where IsActive = 1;
WHILE(EXISTS(SELECT TOP (1) PatientFileId from tempTable))
BEGIN
Set @fileName = (Select  TOP (1) FileName from tempTable);
Set @patFileId = (Select  TOP (1) PatientFileId FileName from tempTable);
exec dbo.usp_ExportPatientProfileImage @fileName,@location,@fileName; 
DELETE TOP (1) from tempTable
END
Drop table tempTable 
GO


Declare @location varchar(800);
SET @location = (SELECT ParameterValue from CORE_CFG_Parameters WHERE LOWER(ParameterGroupName)='clinical' 
AND ParameterName = 'ClinicalDocumentUploadLocation');
Declare @fileName varchar(500);
Declare @patFileId int;
SELECT * INTO tempClnPatTable FROM CLN_PAT_Images Where IsActive = 1;
WHILE(EXISTS(SELECT TOP (1) PatImageId from tempClnPatTable))
BEGIN
Set @fileName = (Select  TOP (1) FileName from tempClnPatTable);
Set @patFileId = (Select  TOP (1) PatImageId FileName from tempClnPatTable);
exec dbo.usp_ExportPatientClinicalImage @fileName,@location,@fileName; 
DELETE TOP (1) from tempClnPatTable
END
Drop table tempClnPatTable 
GO


sp_configure 'show advanced options', 1;
GO
RECONFIGURE;
GO
sp_configure 'Ole Automation Procedures', 0;
GO
RECONFIGURE;
GO
-------SQL to Update Older Data of PatientFiles table Starts-----

---sud:9Apr'20-- Don't remove these files until the images are restored properly---
---Contact with sud for any queries-- thanks.. 
--Alter table PAT_PatientFiles
--Drop column FileBinaryData, ImageFullPath
--GO

--Alter table CLN_PAT_Images
--Drop column FileBinaryData
--GO

DROP Procedure usp_ExportPatientProfileImage
Go
DROP Procedure usp_ExportPatientClinicalImage
Go

---Anish:Start: 24 March-2020, Patient Image upload location parameterized----


--START: Nagesh:12th may 2020: billing txn get for accounting script changes for fix payment mode issue on cash bill
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER Procedure [dbo].[SP_ACC_Bill_GetBillingDataForAccTransfer]
  @TransactionDate DATE
AS

/**************************************************
Stored Procedure Name:SP_ACC_Bill_GetBillingDataForAccTransfer
Details:
-This stored procedure will get billing module data for transfer to accounting by date
-We are getting billing records, deposit records, etc
	
 Change History:
 ----------------------------------------------------------------------------------
 S.No.   Author					Date               Remarks
 ----------------------------------------------------------------------------------
 1.      NageshBB & Sud sir		16/03/2020        Stored procedure created
 2.     Nagesh/Sud               8May'20          Paymentmode=card & cheque handled in billingtransaction, We're now considering all : card, cheque and cash    as   cash 
 ----------------------------------------------------------------------------------

**********************************************/
BEGIN

  IF((select top 1 CONVERT(bit, ParameterValue) from CORE_CFG_Parameters where ParameterGroupName='accounting'and ParameterName='GetBillingFromSyncTable')=1) 
  BEGIN
  
  SELECT * from BIL_SYNC_BillingAccounting 
  WHERE IsTransferedToAcc IS NULL AND CONVERT(date, TransactionDate) BETWEEN CONVERT(date, @TransactionDate) AND CONVERT(date, @TransactionDate)
  END
  ELSE
  BEGIN    
 --Note:-BillingAccountingSyncId added for temporary pupose because code mapping model has this column , later we need to remove this 
------Cash Bill----------CashBill->BIL_TXN_BillingTransactionItems->BillingTransactionItemId  (TransactionType->TableName->ReferenceId Column Name)
			 Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CashBill' TransactionType,
			  'cash' As PaymentMode, 
			 --txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 itm.PaidDate 'TransactionDate',
			 GetDate() 'CreatedOn',
			 itm.PaymentReceivedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 AND Convert(Date,itm.PaidDate) = @TransactionDate
			 and itm.BillingTransactionId IS NOT NULL
			  --- sud/nagesh:8may'20-- below case should be separated for card and cheque after requirement comes for this..
			 and ( txn.PaymentMode='cash' OR txn.PaymentMode='card' OR txn.PaymentMode='cheque')
			 AND ISNULL(itm.IsCashBillSync,0) = 0  -- Include only Not-Synced Data for CashBill Case--
			
			
			
			UNION ALL
			
---------Credit Bill----------------------------------------------CreditBill-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CreditBill' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 txn.CreatedOn 'TransactionDate', -- this is credit date.. 
			 GetDate() 'CreatedOn',
			 itm.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 AND Convert(Date,itm.CreatedOn)=@TransactionDate
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='credit'
			 AND ISNULL(itm.IsCreditBillSync,0) = 0  -- Include only Not-Synced Data for CreditBill Case--
					

			UNION ALL
			
-----------------Credit Bill Paid-----CreditBillPaid-BillingTransactionId-BIL_TXN_BillingTransaction
		--for now we are commenting this function, later we will get creditbill paid records
			--Select 
			-- txn.BillingTransactionId as BillingAccountingSyncId,
			-- txn.BillingTransactionId AS 'ReferenceId',
			-- 'CreditBillPaid' AS ReferenceModelName,
			-- NULL AS ServiceDepartmentId,
			-- NULL AS ItemId,
			-- NULL IncomeLedgerName,  --- correct it, we might need CreditOrganization's LEdger here.. 
			--  sett.PatientId,
			-- 'CreditBillPaid' TransactionType,
			--  sett.PaymentMode As PaymentMode, 
			-- NULL SubTotal,
			-- 0 'TaxAmount',
			-- NULL AS DiscountAmount,
			-- txn.TotalAmount AS TotalAmount,
			
			-- 0 AS IsTransferedToAcc,
			-- SettlementDate 'TransactionDate', -- this is credit date.. 
			-- GetDate() 'CreatedOn',
			-- sett.CreatedBy AS CreatedBy,
			-- NULL AS SettlementDiscountAmount,  -- Can't take this here, it'll go separately into Cash Discount LEdger.. 
			-- NULL AS Remark,
			-- txn.OrganizationId AS CreditOrganizationId   -- correct it after Settlement is separated for CreditOrginizations.
			--from BIL_TXN_Settlements sett, BIL_TXN_BillingTransaction txn
			
			--Where 
			--     sett.SettlementId = txn.SettlementId
			--   AND Convert(Date,SettlementDate)=@TransactionDate
			--   AND ISNULL(txn.IsCreditBillPaidSync,0) = 0  -- Include only Not-Synced Data for Credit Paid Case--
			
			--UNION ALL
			
-----------------------Cash Bill Return---CashBillReturn-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			 BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CashBillReturn' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 ret.CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 ret.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
			
			Where 
			 txn.BillingTransactionId = itm.BillingTransactionId
			 and ret.BillingTransactionId=txn.BillingTransactionId
			 and Convert(Date,ret.CreatedOn) = @TransactionDate--sud-19March this should've been createdon of return table..
			 and ISNULL(itm.ReturnStatus,0) != 0  
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='cash'
			 AND ISNULL(itm.IsCashBillReturnSync,0) = 0  -- Include only Not-Synced Data for CashBill Return Case--
			
			UNION ALL
			
------------CreditBillReturn--- done with join from Transaction, TransactionItem and InvoiceReturn Table--CreditBillReturn-BillingTransactionItemId-BIL_TXN_BillingTransactionItems
			Select 
			BillingTransactionItemId as BillingAccountingSyncId,
			 BillingTransactionItemId 'ReferenceId',
			 'BillingTransactionItem' AS ReferenceModelName,
			 ServiceDepartmentId,
			 ItemId,
			 (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName)) IncomeLedgerName,  --- correct it
			 itm.PatientId,
			 'CreditBillReturn' TransactionType,
			 txn.PaymentMode As PaymentMode, 
			 itm.SubTotal,
			 Tax 'TaxAmount',
			 itm.DiscountAmount,
			 itm.TotalAmount,
			 0 AS IsTransferedToAcc,
			 ret.CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 ret.CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 txn.OrganizationId AS CreditOrganizationId  
			from BIL_TXN_BillingTransactionItems  itm, BIL_TXN_BillingTransaction txn, BIL_TXN_InvoiceReturn ret
			
			Where 
			   txn.BillingTransactionId = itm.BillingTransactionId
			 and ret.BillingTransactionId=txn.BillingTransactionId
			 and Convert(Date,ret.CreatedOn) = @TransactionDate
			 and ISNULL(itm.ReturnStatus,0) != 0  -- take only returned items..
			 and itm.BillingTransactionId IS NOT NULL
			 and txn.PaymentMode='credit'
			 AND ISNULL(itm.IsCreditBillReturnSync,0) = 0  -- Include only Not-Synced Data for Credit Return Case--
			
			 UNION ALL
			
------------------Deposit Add---DepositAdd-DepositId-BIL_TXN_Deposit
			Select 
			DepositId as BillingAccountingSyncId,
			 DepositId 'ReferenceId',
			 'Deposit' AS ReferenceModelName,
			 NULL AS ServiceDepartmentId,
			 NULL AS ItemId,
			 NULL IncomeLedgerName,  --- correct it
			  PatientId,
			 'DepositAdd' TransactionType,
			 PaymentMode As PaymentMode, 
			 NULL AS SubTotal,
			 NULL AS 'TaxAmount',
			 NULL AS DiscountAmount,
			 Amount AS TotalAmount,
			 0 AS IsTransferedToAcc,
			 CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_Deposit
			
			Where 
			Convert(Date,CreatedOn)=@TransactionDate
			and DepositType ='Deposit'
			AND ISNULL(IsDepositSync,0) = 0  -- Include only Not-Synced Data
			
			UNION ALL
			
-------Deposit Return/Deduct---DepositReturn-DepositId-BIL_TXN_Deposit
			Select 
			DepositId as BillingAccountingSyncId,
			 DepositId 'ReferenceId',
			 'Deposit' AS ReferenceModelName,
			 NULL AS ServiceDepartmentId,
			 NULL AS ItemId,
			 NULL IncomeLedgerName,  --- correct it
			  PatientId,
			 'DepositReturn' TransactionType,
			 PaymentMode As PaymentMode, 
			 NULL AS SubTotal,
			 NULL AS 'TaxAmount',
			 NULL AS DiscountAmount,
			 Amount AS TotalAmount,
			 0 AS IsTransferedToAcc,
			 CreatedOn 'TransactionDate',
			 GetDate() 'CreatedOn',
			 CreatedBy AS CreatedBy,
			 NULL AS SettlementDiscountAmount,
			 NULL AS Remark,
			 NULL AS CreditOrganizationId  
			from BIL_TXN_Deposit
			
			Where 
			
			Convert(Date,CreatedOn)=@TransactionDate
			and DepositType IN ('ReturnDeposit', 'depositdeduct')
			 AND ISNULL(IsDepositSync,0) = 0  -- Include only Not-Synced Data
			
			
			--UNION ALL
			
---------Cash discount -- from settlement-- New new Transfer rule for this---CashDiscount-SettlementId-BIL_TXN_Settlements
			--Select 
			--SettlementId as BillingAccountingSyncId,
			-- SettlementId 'ReferenceId',
			-- 'CashDiscount' AS ReferenceModelName,
			-- NULL AS ServiceDepartmentId,
			-- NULL AS ItemId,
			-- NULL IncomeLedgerName,  --- correct it
			--  PatientId,
			-- 'CashDiscount' TransactionType,
			-- PaymentMode As PaymentMode, 
			-- NULL AS SubTotal,
			-- NULL AS 'TaxAmount',
			-- NULL AS DiscountAmount,
			-- DiscountAmount AS TotalAmount,    -- use this column if possible
			-- 0 AS IsTransferedToAcc,
			-- CreatedOn 'TransactionDate',
			-- GetDate() 'CreatedOn',
			-- CreatedBy AS CreatedBy,
			-- DiscountAmount AS SettlementDiscountAmount,  -- don't use this column if possible.
			-- NULL AS Remark,
			-- NULL AS CreditOrganizationId  
			--from BIL_TXN_Settlements
			
			--Where 
			--  Convert(Date,CreatedOn)=@TransactionDate
			--  AND ISNULL(DiscountAmount,0) != 0  -- exclude zero discount, since it's not needed.
			--  AND ISNULL(IsCashDiscountSync,0) = 0  -- Include only Not-Synced Data	
  END			  					
END
GO
--START: Nagesh:12th may 2020: billing txn get for accounting script changes for fix payment mode issue on cash bill




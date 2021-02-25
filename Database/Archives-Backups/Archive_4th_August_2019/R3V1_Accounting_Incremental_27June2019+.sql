
--Start: Salakha -27th june 2019 --Updated script for pharamcy transafer rules--
update ACC_MST_GroupMapping
set Description = 'PHRMCreditInvoice1'
where Description = 'PHRMCreditInvoice'
GO

INSERT INTO [dbo].[ACC_Ledger]  ([LedgerName],[CreatedOn],[CreatedBy],[IsActive],[LedgerGroupId])
VALUES ('Cash Discount Expense',GETDATE(),1,1,(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses'
 and COA='Indirect Expenses' and LedgerGroupName='Administration Expenses'))
GO

INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId])
 VALUES ('PHRMCreditInvoice2', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Journal Voucher')) 
GO

update ACC_MST_GroupMapping
set VoucherId = (select VoucherId from ACC_MST_Vouchers where VoucherName ='Sales Voucher')
where Description ='PHRMCreditPaidInvoice'
GO

update ACC_MST_GroupMapping
set VoucherId = (select VoucherId from ACC_MST_Vouchers where VoucherName ='Journal Voucher')
where Description ='PHRMCashInvoice2'
GO

update ACC_MST_GroupMapping
set Description = 'PHRMCashInvoiceReturn1', VoucherId = (select VoucherId from ACC_MST_Vouchers where VoucherName ='Sales Voucher')
where Description = 'PHRMCashInvoiceReturn'
GO

INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId])
 VALUES ('PHRMCashInvoiceReturn2', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Journal Voucher')) 
GO

update ACC_MST_GroupMapping
set Description = 'PHRMCreditInvoiceReturn1', VoucherId = (select VoucherId from ACC_MST_Vouchers where VoucherName ='Sales Voucher')
where Description = 'PHRMCreditInvoiceReturn'
GO

INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId])
 VALUES ('PHRMCreditInvoiceReturn2', 3, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Journal Voucher')) 
GO

update ACC_MST_MappingDetail 
set Description = 'PHRMCreditInvoice1Sales'
where  GroupMappingId = (select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditInvoice1')
and LedgerGroupId= (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Revenue' and COA='Direct Income'
and LedgerGroupName='Sales')
GO
   
update ACC_MST_MappingDetail 
set Description = 'PHRMCreditInvoice1SundryDebtors'
where  GroupMappingId = (select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditInvoice1')
and LedgerGroupId= (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Sundry Debtors')
GO

update ACC_MST_MappingDetail 
set Description = 'PHRMCreditInvoice1DutiesandTaxes'
where  GroupMappingId = (select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditInvoice1')
and LedgerGroupId= (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes')
GO

update ACC_MST_MappingDetail 
set Description = 'PHRMCreditInvoice1AdministrationExpenses'
where  GroupMappingId = (select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditInvoice1')
and LedgerGroupId= (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup ='Expenses' and COA ='Indirect Expenses'
 and LedgerGroupName ='Administration expenses')
GO
   
update ACC_MST_MappingDetail 
set Description = 'PHRMCashInvoice1CashInHand', LedgerGroupId = (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Cash In Hand')
where  GroupMappingId = (select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoice1')
and Description ='PHRMCashInvoice1SundryDebtors'
GO

 update ACC_MST_MappingDetail 
set Description = 'PHRMCashInvoice2CostofGoodsSold',
 LedgerGroupId = (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA='Direct Expense' and LedgerGroupName='Cost of Goods Sold')
where  GroupMappingId = (select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoice2')
and Description ='PHRMCashInvoice2CashInHand'
GO

 update ACC_MST_MappingDetail 
set  DrCr = 0, Description = 'PHRMCashInvoice2Inventory',
 LedgerGroupId = (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory')
where  GroupMappingId = (select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoice2')
and Description ='PHRMCashInvoice2AdministrationExpenses'
GO

DELETE FROM ACC_MST_MappingDetail WHERE Description ='PHRMCashInvoice2SundryDebtors'
GO

 update ACC_MST_MappingDetail 
set Description = 'PHRMCashInvoiceReturn1Sales'
where  Description ='PHRMCashInvoiceReturnSales'
go

 update ACC_MST_MappingDetail 
set Description = 'PHRMCashInvoiceReturn1DutiesandTaxes'
where description = 'PHRMCashInvoiceReturnDutiesandTaxes'
GO

 update ACC_MST_MappingDetail 
set Description = 'PHRMCashInvoiceReturn1AdministrationExpenses'
where  Description ='PHRMCashInvoiceReturnAdministrationExpenses'
go

 update ACC_MST_MappingDetail 
set Description = 'PHRMCashInvoiceReturn1CashInHand'
where description = 'PHRMCashInvoiceReturnCashInHand'
GO

 update ACC_MST_MappingDetail 
set Description = 'PHRMCreditInvoiceReturn1Sales'
where  Description ='PHRMCreditInvoiceReturnSales'
go

 update ACC_MST_MappingDetail 
set Description = 'PHRMCreditInvoiceReturn1SundryDebtors'
where description = 'PHRMCreditInvoiceReturnSundryDebtors'
GO

 update ACC_MST_MappingDetail 
set Description = 'PHRMCreditInvoiceReturn1DutiesandTaxes'
where  Description ='PHRMCreditInvoiceReturnDutiesandTaxes'
go

 update ACC_MST_MappingDetail 
set Description = 'PHRMCreditInvoiceReturn1AdministrationExpenses'
where description = 'PHRMCreditInvoiceReturnAdministrationExpenses'
GO

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditInvoice2'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA='Direct Expense' and LedgerGroupName='Cost of Goods Sold'), 1)
Go

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditInvoice2'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 0)
Go

 INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr])
  VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoiceReturn2'),
   (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA='Direct Expense' and LedgerGroupName='Cost of Goods Sold'), 0)
Go

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCashInvoiceReturn2'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 1)
GO

 INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr])
  VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditInvoiceReturn2'),
   (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA='Direct Expense' and LedgerGroupName='Cost of Goods Sold'), 0)
   Go

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='PHRMCreditInvoiceReturn2'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Inventory'), 1)
Go

update ACC_MST_MappingDetail
set Description ='CreditBillPaidAdministrationExpenses'
where Description ='CashBillReturnAdministrationExpenses' and GroupMappingId = (select GroupMappingId from ACC_MST_GroupMapping where Description='CreditBillPaid')
GO

update PHRM_GoodsReceipt
set TransactionType ='Cash'
where SupplierId = (select SupplierId from PHRM_MST_Supplier where SupplierName ='CASH') AND TransactionType IS NULL
go

update PHRM_GoodsReceipt
set TransactionType ='Credit'
where SupplierId != (select SupplierId from PHRM_MST_Supplier where SupplierName ='CASH') AND TransactionType IS NULL
gO

UPDATE PHRM_TXN_Invoice
SET PaymentMode = 'cash'
where PaymentMode IS NULL
GO

--End: Salakha -27th june 2019 --Updated script for pharamcy transafer rules--

--START Ajay -28 JUNE 19 --Jira [EMR-682]
-----Update of GRItemPrice column value and trigger for after insert into Pharmacy Invoice Itmes table

--updating GRItemPrice from PHRM_GoodsReceiptItems for existing record
UPDATE
    PHRM_TXN_InvoiceItems
SET
    GrItemPrice=(gri.GRItemPrice)
FROM
    PHRM_GoodsReceiptItems as gri
    JOIN PHRM_GoodsReceipt as gr on gri.GoodReceiptId=gr.GoodReceiptId
	JOIN PHRM_TXN_InvoiceItems i on gri.MRP = i.MRP and gri.BatchNo = i.BatchNo and gri.ExpiryDate = i.ExpiryDate and gri.ItemId = i.ItemId
WHERE
    i.InvoiceItemId = InvoiceItemId and gr.IsCancel = 0 and i.GrItemPrice is null
GO

--updating GRItemPrice from PHRM_StockTxnItems
UPDATE
    PHRM_TXN_InvoiceItems
SET
    GrItemPrice=ISNULL(gri.Price,i.GrItemPrice)
FROM
    PHRM_StockTxnItems as gri
	JOIN PHRM_TXN_InvoiceItems i on gri.MRP = i.MRP and gri.BatchNo = i.BatchNo and gri.ExpiryDate = i.ExpiryDate and gri.ItemId = i.ItemId
WHERE
    i.InvoiceItemId = InvoiceItemId and GrItemPrice is null and gri.InOut='in' and gri.ReferenceNo IS NULL
GO

--if GRItemPrice is null after updating from PHRM_GoodsReceiptItems and PHRM_StockTxnItems
--then updating GRItemPrice to selling price from PHRM_TXN_InvoiceItems
UPDATE
    PHRM_TXN_InvoiceItems
SET
    GrItemPrice=i.Price
FROM
	PHRM_TXN_InvoiceItems i
WHERE
    i.InvoiceItemId = InvoiceItemId and GrItemPrice is null
GO

--trigger for update GrItemPrice

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [dbo].[TRG_PHRM_TXN_InvoiceItems_UpdateGRItemPrice] 
   ON   [dbo].[PHRM_TXN_InvoiceItems]
   AFTER INSERT
AS 
/************************************************************************
FileName: [TRG_PHRM_TXN_InvoiceItems_UpdateGRItemPrice]
CreatedBy/date: Ajay/27Jun'19
Description: update GRItemPrice if null
Remarks: Getting GRItemPrice from PHRM_GoodsReceiptItems table
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1       Ajay/27Jun'19						created the script
*************************************************************************/
BEGIN
	DECLARE @InvoiceItemId INT;
	DECLARE @MRP DECIMAL(16,4);
	DECLARE @BatchNo VARCHAR(100);
	DECLARE @ExpiryDate datetime;
	DECLARE @ItemId INT;
	
	IF((SELECT GrItemPrice FROM inserted) IS NULL)
	BEGIN
		SELECT @InvoiceItemId = InvoiceItemId, @MRP = MRP, @BatchNo = BatchNo, @ExpiryDate = ExpiryDate, @ItemId = ItemId FROM inserted

		UPDATE
			PHRM_TXN_InvoiceItems
		SET
			GrItemPrice=ISNULL((SELECT TOP 1 gri.GRItemPrice FROM PHRM_GoodsReceiptItems as gri JOIN PHRM_GoodsReceipt as gr on gri.GoodReceiptId=gr.GoodReceiptId
			WHERE gri.MRP = @MRP and gri.BatchNo = @BatchNo and gri.ExpiryDate = @ExpiryDate and gri.ItemId = @ItemId and gr.IsCancel = 0)
			,(SELECT Price FROM inserted))
		WHERE InvoiceItemId=@InvoiceItemId
	END
END
GO

--END Ajay -28 JUNE 19 --Jira [EMR-682]


--Start ajay -28Jun1'19 -- update script for update column IsTransferToAcc, added IsTransferToAcc Column in PHRM_StockTxnItems table

alter table PHRM_StockTxnItems add IsTransferredToACC bit null
GO

/****** Object:  StoredProcedure [dbo].[SP_UpdateIsTransferToACC]    Script Date: 28-06-2019 16:24:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--[SP_UpdateIsTransferToACC] '1066,1067' , 'PHRMInvoice'
-- =============================================
-- Author:    Salakha Gawas
-- Create date: 25 Feb 2019
-- Description:  Created Script to Update column IsTransferToACC
-- =============================================
ALTER PROCEDURE [dbo].[SP_UpdateIsTransferToACC]
    @ReferenceIds varchar(max),
       @TransactionType nvarchar(50)
AS
BEGIN

------------------update pharmacy transaction transferred records--------------------------------------

	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashGoodReceipt')
		Begin            
			EXECUTE('UPDATE PHRM_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodReceiptId IN ('+@ReferenceIds+')')
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCreditGoodReceipt')
		Begin
			EXECUTE('UPDATE PHRM_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodReceiptId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashInvoice1')
		Begin
			EXECUTE('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashInvoice2')
		Begin
			EXECUTE('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCreditInvoice1')
		Begin
			EXECUTE('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCreditInvoice2')
		Begin
			EXECUTE('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashInvoiceReturn1')
		Begin
			EXECUTE('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashInvoiceReturn2')
		Begin
			EXECUTE('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCreditInvoiceReturn1')
		Begin
			EXECUTE('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCreditInvoiceReturn2')
		Begin
			EXECUTE('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashReturnToSupplier')
		Begin
			EXECUTE('UPDATE PHRM_ReturnToSupplier SET IsTransferredToACC = 1 WHERE ReturnToSupplierId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCreditReturnToSupplier')
		Begin
			EXECUTE('UPDATE PHRM_ReturnToSupplier SET IsTransferredToACC = 1 WHERE ReturnToSupplierId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMWriteOff')
		Begin
			EXECUTE('UPDATE PHRM_WriteOff SET IsTransferredToACC = 1 WHERE WriteOffId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMDispatchToDept')
		Begin
			EXECUTE('UPDATE PHRM_StockTxnItems SET IsTransferredToACC = 1 WHERE StockTxnItemId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMDispatchToDeptReturn')
		Begin
			EXECUTE('UPDATE PHRM_StockTxnItems SET IsTransferredToACC = 1 WHERE StockTxnItemId IN ('+@ReferenceIds+')')  
		END

  ------------------------updates inventory txn transaferred records--------------------------------

    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCashGoodReceipt1')
	  Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodsReceiptID IN ('+@ReferenceIds+')')  
	 END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCashGoodReceipt2')
		Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodsReceiptID IN ('+@ReferenceIds+')')  
		END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCreditGoodReceipt')
		Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodsReceiptID IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCreditPaidGoodReceipt')
		Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodsReceiptID IN ('+@ReferenceIds+')')  
		END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVWriteOff')
		Begin
			EXECUTE('UPDATE INV_TXN_WriteOffItems SET IsTransferredToACC = 1 WHERE WriteOffId IN ('+@ReferenceIds+')')  
		END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVReturnToVendorCashGR')
		Begin
			EXECUTE('UPDATE INV_TXN_ReturnToVendorItems SET IsTransferredToACC = 1 WHERE ReturnToVendorItemId IN ('+@ReferenceIds+')')  
		END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVReturnToVendorCreditGR')
		Begin
			EXECUTE('UPDATE INV_TXN_ReturnToVendorItems SET IsTransferredToACC = 1 WHERE ReturnToVendorItemId IN ('+@ReferenceIds+')')  
		END


  --------------------------updates billing txn transferred records---------------

  if(@ReferenceIds IS NOT NULL AND @TransactionType = 'BillingRecords')
	  Begin
		  EXECUTE('UPDATE BIL_SYNC_BillingAccounting SET IsTransferedToAcc = 1 WHERE BillingAccountingSyncId IN ('+@ReferenceIds+')')  
	  END

END

GO

--End ajay 28 Jun'19 
--Start: Salakha -28th june 2019 --Updated script for pharamcy transafer rules--

update ACC_MST_GroupMapping
set Description ='PHRMCashGoodReceipt'
where Description ='PHRMCashGoodReceipt1'
GO
update ACC_MST_MappingDetail
set GroupMappingId = (select GroupMappingId from ACC_MST_GroupMapping where Description ='PHRMCashGoodReceipt')
where GroupMappingId = (select GroupMappingId from ACC_MST_GroupMapping where Description ='PHRMCashGoodReceipt2')
GO
delete from ACC_MST_GroupMapping
where Description ='PHRMCashGoodReceipt2'
Go
update ACC_MST_MappingDetail
set Description = 'PHRMCashGoodReceiptInventory'
where Description ='PHRMCashGoodReceipt1Inventory'
update ACC_MST_MappingDetail
set Description = 'PHRMCashGoodReceiptSundryCreditors'
where Description ='PHRMCashGoodReceipt1SundryCreditors'
update ACC_MST_MappingDetail
set Description = 'PHRMCashGoodReceiptDutiesandTaxes'
where Description ='PHRMCashGoodReceipt1DutiesandTaxes'


update ACC_MST_MappingDetail
set Description = 'PHRMCashGoodReceiptSundryCreditors'
where Description ='PHRMCashGoodReceipt2SundryCreditors'
update ACC_MST_MappingDetail
set Description = 'PHRMCashGoodReceiptCashInHand'
where Description ='PHRMCashGoodReceipt2CashInHand'
update ACC_MST_MappingDetail
set Description = 'PHRMCashGoodReceiptDutiesandTaxes'
where Description ='PHRMCashGoodReceipt2DutiesandTaxes'
update ACC_MST_MappingDetail
set Description = 'PHRMCashGoodReceiptDiscountIncome'
where Description ='PHRMCashGoodReceipt2DiscountIncome'
Go

UPDATE ACC_MST_GroupMapping
set VoucherId = (select VoucherId from ACC_MST_Vouchers where VoucherName ='Purchase Voucher')
where Description ='PHRMCashReturnToSupplier' or Description ='PHRMCreditReturnToSupplier'
Go

--END: Salakha -28th june 2019 --Updated script for pharamcy transafer rules--

--Start: Salakha -3rd July 2019 --Added Parameter for the VAT Registered Hospital--
INSERT INTO [dbo].[CORE_CFG_Parameters]  ([ParameterGroupName],[ParameterName] ,[ParameterValue]  ,[ValueDataType] ,[Description] ,[ParameterType])
     VALUES ('Accounting' ,'VatRegisteredHospital' ,'true' ,'boolean','To ensure whether Hospital is VAT Registered','custom' )
GO

alter table [PHRM_TXN_InvoiceItems] add GrItemVATPercent decimal(16,4) null
GO
alter table [PHRM_TXN_InvoiceItems] add GrItemDiscountAmount decimal(16,4) null
GO

UPDATE
    PHRM_TXN_InvoiceItems
SET
    GrItemVATPercent=x.VATPercent,
  GrItemDiscountAmount=CONVERT(decimal(16,4),(x.Quantity * ((x.GrItemPrice * x.DiscountPercent)/100)))
FROM
  (SELECT
      i.InvoiceItemId as InvoiceItmId,
      i.Quantity,
      i.SubTotal,
      i.GrItemPrice,
      CONVERT(decimal(16,4),(gr.VATAmount*100) / (gr.SubTotal-ISNULL(gr.DiscountAmount,0))) as VATPercent,
      CONVERT(decimal(16,4),((gr.DiscountAmount * 100) / gr.SubTotal)) as DiscountPercent
    FROM
      PHRM_GoodsReceiptItems as gri
      JOIN PHRM_GoodsReceipt as gr on gri.GoodReceiptId=gr.GoodReceiptId
      left JOIN PHRM_TXN_InvoiceItems i on gri.MRP = i.MRP and gri.BatchNo = i.BatchNo and gri.ExpiryDate = i.ExpiryDate and gri.ItemId = i.ItemId
    WHERE gr.SubTotal !=0) as x
WHERE
    x.InvoiceItmId = InvoiceItemId
GO



/****** Object:  Trigger [dbo].[TRG_PHRM_TXN_InvoiceItems_UpdateGRItemPrice]    Script Date: 03-07-2019 16:53:33 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER TRIGGER [dbo].[TRG_PHRM_TXN_InvoiceItems_UpdateGRItemPrice] 
   ON   [dbo].[PHRM_TXN_InvoiceItems]
   AFTER INSERT
AS 
/************************************************************************
FileName: [TRG_PHRM_TXN_InvoiceItems_UpdateGRItemPrice]
CreatedBy/date: Ajay/27Jun'19
Description: update GRItemPrice if null
Remarks: Getting GRItemPrice from PHRM_GoodsReceiptItems table
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1       Ajay/27Jun'19						created the script
*************************************************************************/
BEGIN
	DECLARE @InvoiceItemId INT;
	DECLARE @MRP DECIMAL(16,4);
	DECLARE @BatchNo VARCHAR(100);
	DECLARE @ExpiryDate datetime;
	DECLARE @ItemId INT;
	
	IF((SELECT GrItemPrice FROM inserted) IS NULL)
	BEGIN
		SELECT @InvoiceItemId = InvoiceItemId, @MRP = MRP, @BatchNo = BatchNo, @ExpiryDate = ExpiryDate, @ItemId = ItemId FROM inserted

		UPDATE
			PHRM_TXN_InvoiceItems
		SET
			GrItemPrice=ISNULL((SELECT TOP 1 gri.GRItemPrice FROM PHRM_GoodsReceiptItems as gri JOIN PHRM_GoodsReceipt as gr on gri.GoodReceiptId=gr.GoodReceiptId
			WHERE gri.MRP = @MRP and gri.BatchNo = @BatchNo and gri.ExpiryDate = @ExpiryDate and gri.ItemId = @ItemId and gr.IsCancel = 0)
			,(SELECT Price FROM inserted))
		WHERE InvoiceItemId=@InvoiceItemId

		UPDATE
			PHRM_TXN_InvoiceItems
		SET
			GrItemVATPercent=x.VATPercent,
			GrItemDiscountAmount=CONVERT(decimal(16,4),(x.Quantity * ((x.GrItemPrice * x.DiscountPercent)/100)))
		FROM
			(SELECT TOP 1
				i.InvoiceItemId as InvoiceItmId,
				i.Quantity,
				i.SubTotal,
				i.GrItemPrice,
				CONVERT(decimal(16,4),(gr.VATAmount*100) / (gr.SubTotal-ISNULL(gr.DiscountAmount,0))) as VATPercent,
				CONVERT(decimal(16,4),((gr.DiscountAmount * 100) / gr.SubTotal)) as DiscountPercent
			FROM
				PHRM_GoodsReceiptItems as gri
				JOIN PHRM_GoodsReceipt as gr on gri.GoodReceiptId=gr.GoodReceiptId
				JOIN PHRM_TXN_InvoiceItems i on gri.MRP = @MRP and gri.BatchNo = @BatchNo and gri.ExpiryDate = @ExpiryDate and gri.ItemId = @ItemId
			WHERE gr.SubTotal !=0 and gr.IsCancel = 0) as x
		WHERE InvoiceItemId=@InvoiceItemId
	END
END
Go
--End: Salakha -3rd July 2019 --Modifications in the trigger--

--start ajay 05Jul'19
alter table PHRM_TXN_InvoiceItems add GrItemId int null
alter table PHRM_GoodsReceiptItems add GrVATAmount decimal(14,4) null
alter table PHRM_GoodsReceiptItems add GrDiscountAmount decimal(14,4) null
GO

UPDATE
	PHRM_TXN_InvoiceItems
SET
	GrItemId=gri.GoodReceiptItemId
FROM
	PHRM_GoodsReceiptItems as gri
	JOIN PHRM_TXN_InvoiceItems i on gri.MRP = i.MRP and gri.BatchNo = i.BatchNo and gri.ExpiryDate = i.ExpiryDate and gri.ItemId = i.ItemId
WHERE InvoiceItemId=i.InvoiceItemId
GO

UPDATE
	PHRM_GoodsReceiptItems
SET
	GrVATAmount=x.vatamt,
	GrDiscountAmount=x.discountamt
FROM
	(SELECT
		gr.GoodReceiptId AS grid,
		CONVERT(decimal(16,4),(gr.VATAmount/gri.gritmcount)) AS vatamt,
		CONVERT(decimal(16,4),(gr.DiscountAmount/gri.gritmcount)) AS discountamt
	FROM 
		(SELECT 
			GoodReceiptId,
			COUNT(GoodReceiptItemId) AS gritmcount
		FROM
			PHRM_GoodsReceiptItems 
		GROUP BY GoodReceiptId) AS gri,
		(SELECT 
			GoodReceiptId,
			VATAmount,
			DiscountAmount
		FROM
			PHRM_GoodsReceipt) AS gr
	WHERE gri.GoodReceiptId = gr.GoodReceiptId) AS x
WHERE x.grid = GoodReceiptId
GO

/****** Object:  Trigger [dbo].[TRG_PHRM_TXN_InvoiceItems_UpdateGRItemPrice]    Script Date: 04-07-2019 16:16:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER TRIGGER [dbo].[TRG_PHRM_TXN_InvoiceItems_UpdateGRItemPrice] 
   ON   [dbo].[PHRM_TXN_InvoiceItems]
   AFTER INSERT
AS 
/************************************************************************
FileName: [TRG_PHRM_TXN_InvoiceItems_UpdateGRItemPrice]
CreatedBy/date: Ajay/27Jun'19
Description: update GRItemPrice if null
Remarks: Getting GRItemPrice from PHRM_GoodsReceiptItems table
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1       Ajay/27Jun'19						created the script
2		Ajay/04Jul'19						updating GrItemId
*************************************************************************/
BEGIN
	DECLARE @InvoiceItemId INT;
	DECLARE @MRP DECIMAL(16,4);
	DECLARE @BatchNo VARCHAR(100);
	DECLARE @ExpiryDate datetime;
	DECLARE @ItemId INT;
	
	IF((SELECT GrItemPrice FROM inserted) IS NULL)
	BEGIN
		--get values from inserted data
		SELECT 
			@InvoiceItemId = InvoiceItemId,
			@MRP = MRP,
			@BatchNo = BatchNo,
			@ExpiryDate = ExpiryDate,
			@ItemId = ItemId
		FROM inserted
		--update GrItemPrice,GrItemId of PHRM_TXN_InvoiceItems
		UPDATE
			PHRM_TXN_InvoiceItems
		SET
			GrItemPrice = ISNULL(x.GRItemPrice,(SELECT Price FROM inserted)),
			GrItemId = x.GoodReceiptItemId
		FROM
			(SELECT TOP 1 
				gri.GRItemPrice,
				gri.GoodReceiptItemId
			FROM
				PHRM_GoodsReceiptItems AS gri
				JOIN PHRM_GoodsReceipt AS gr ON gri.GoodReceiptId = gr.GoodReceiptId
			WHERE
				gri.MRP = @MRP
				and gri.BatchNo = @BatchNo
				and gri.ExpiryDate = @ExpiryDate
				and gri.ItemId = @ItemId
				and gr.IsCancel = 0) AS x
		WHERE InvoiceItemId = @InvoiceItemId

		UPDATE
			PHRM_TXN_InvoiceItems
		SET
			GrItemVATPercent=x.VATPercent,
			GrItemDiscountAmount=CONVERT(decimal(16,4),(x.Quantity * ((x.GrItemPrice * x.DiscountPercent)/100)))
		FROM
			(SELECT TOP 1
				i.InvoiceItemId as InvoiceItmId,
				i.Quantity,
				i.SubTotal,
				i.GrItemPrice,
				CONVERT(decimal(16,4),(gr.VATAmount*100) / (gr.SubTotal-ISNULL(gr.DiscountAmount,0))) as VATPercent,
				CONVERT(decimal(16,4),((gr.DiscountAmount * 100) / gr.SubTotal)) as DiscountPercent
			FROM
				PHRM_GoodsReceiptItems as gri
				JOIN PHRM_GoodsReceipt as gr on gri.GoodReceiptId=gr.GoodReceiptId
				JOIN PHRM_TXN_InvoiceItems i on gri.MRP = @MRP and gri.BatchNo = @BatchNo and gri.ExpiryDate = @ExpiryDate and gri.ItemId = @ItemId
			WHERE gr.SubTotal !=0 and gr.IsCancel = 0) as x
		WHERE InvoiceItemId=@InvoiceItemId
	END
END
GO

--end ajay 05Jul'19

--Start: Salakha -05 July 2019 --Add IsTransferredToACC column 
alter table INV_TXN_StockTransaction
add IsTransferredToACC bit NULL
GO

/****** Object:  StoredProcedure [dbo].[SP_UpdateIsTransferToACC]    Script Date: 05-07-2019 02:41:41 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--[SP_UpdateIsTransferToACC] '1066,1067' , 'PHRMInvoice'
-- =============================================
-- Author:    Salakha Gawas
-- Create date: 25 Feb 2019
-- Description:  Created Script to Update column IsTransferToACC
-- =============================================
ALTER PROCEDURE [dbo].[SP_UpdateIsTransferToACC]
    @ReferenceIds varchar(max),
       @TransactionType nvarchar(50)
AS
BEGIN

------------------update pharmacy transaction transferred records--------------------------------------

	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashGoodReceipt')
		Begin            
			EXECUTE('UPDATE PHRM_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodReceiptId IN ('+@ReferenceIds+')')
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCreditGoodReceipt')
		Begin
			EXECUTE('UPDATE PHRM_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodReceiptId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashInvoice1')
		Begin
			EXECUTE('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashInvoice2')
		Begin
			EXECUTE('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCreditInvoice1')
		Begin
			EXECUTE('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCreditInvoice2')
		Begin
			EXECUTE('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashInvoiceReturn1')
		Begin
			EXECUTE('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashInvoiceReturn2')
		Begin
			EXECUTE('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCreditInvoiceReturn1')
		Begin
			EXECUTE('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCreditInvoiceReturn2')
		Begin
			EXECUTE('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashReturnToSupplier')
		Begin
			EXECUTE('UPDATE PHRM_ReturnToSupplier SET IsTransferredToACC = 1 WHERE ReturnToSupplierId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCreditReturnToSupplier')
		Begin
			EXECUTE('UPDATE PHRM_ReturnToSupplier SET IsTransferredToACC = 1 WHERE ReturnToSupplierId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMWriteOff')
		Begin
			EXECUTE('UPDATE PHRM_WriteOff SET IsTransferredToACC = 1 WHERE WriteOffId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMDispatchToDept')
		Begin
			EXECUTE('UPDATE PHRM_StockTxnItems SET IsTransferredToACC = 1 WHERE StockTxnItemId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMDispatchToDeptReturn')
		Begin
			EXECUTE('UPDATE PHRM_StockTxnItems SET IsTransferredToACC = 1 WHERE StockTxnItemId IN ('+@ReferenceIds+')')  
		END

  ------------------------updates inventory txn transaferred records--------------------------------

    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCashGoodReceipt1')
	  Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodsReceiptID IN ('+@ReferenceIds+')')  
	 END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCashGoodReceipt2')
		Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodsReceiptID IN ('+@ReferenceIds+')')  
		END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCreditGoodReceipt')
		Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodsReceiptID IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCreditPaidGoodReceipt')
		Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodsReceiptID IN ('+@ReferenceIds+')')  
		END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVWriteOff')
		Begin
			EXECUTE('UPDATE INV_TXN_WriteOffItems SET IsTransferredToACC = 1 WHERE WriteOffId IN ('+@ReferenceIds+')')  
		END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVReturnToVendorCashGR')
		Begin
			EXECUTE('UPDATE INV_TXN_ReturnToVendorItems SET IsTransferredToACC = 1 WHERE ReturnToVendorItemId IN ('+@ReferenceIds+')')  
		END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVReturnToVendorCreditGR')
		Begin
			EXECUTE('UPDATE INV_TXN_ReturnToVendorItems SET IsTransferredToACC = 1 WHERE ReturnToVendorItemId IN ('+@ReferenceIds+')')  
		END
	  if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVDispatchToDept')
		Begin
			EXECUTE('UPDATE INV_TXN_StockTransaction SET IsTransferredToACC = 1 WHERE StockTxnId IN ('+@ReferenceIds+')')  
		END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVDispatchToDeptReturn')
		Begin
			EXECUTE('UPDATE INV_TXN_StockTransaction SET IsTransferredToACC = 1 WHERE StockTxnId IN ('+@ReferenceIds+')')  
		END


  --------------------------updates billing txn transferred records---------------

  if(@ReferenceIds IS NOT NULL AND @TransactionType = 'BillingRecords')
	  Begin
		  EXECUTE('UPDATE BIL_SYNC_BillingAccounting SET IsTransferedToAcc = 1 WHERE BillingAccountingSyncId IN ('+@ReferenceIds+')')  
	  END

END
GO

--------Added New LedgerGroup and its ledger 
INSERT INTO [dbo].[ACC_MST_LedgerGroup] ([PrimaryGroup],[COA] ,[LedgerGroupName],[CreatedBy]
           ,[CreatedOn] ,[IsActive])
     VALUES ('Expenses','Direct Expense','Cost of Goods Consumed',1 ,GETDATE(),1)
GO

INSERT INTO [dbo].[ACC_Ledger]  ([LedgerName],[CreatedOn],[CreatedBy],[IsActive],[LedgerGroupId])
VALUES ('COGC',GETDATE(),1,1,(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses'
 and COA='Direct Expense' and LedgerGroupName='Cost of Goods Consumed'))
GO
--End : Salakha -05 July 2019 --updated SP

--start ajay 05Jul'19 --getting records of inventory for accounting
CREATE PROCEDURE [dbo].[SP_ACC_GetInventoryTransactions]
    @FromDate DATETIME=null ,
    @ToDate DATETIME=null
AS
--EXEC [dbo].[SP_ACC_GetInventoryTransactions] @FromDate = '2019-07-05 12:07:31.170', @ToDate ='2019-07-05 12:07:31.170'

/************************************************************************
FileName: [SP_ACC_GetInventoryTransactions]
CreatedBy/date: Ajay/05Jul'19
Description: getting records of inventory transactions for accounting
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1       Ajay/05Jul'19						created the script
*************************************************************************/
BEGIN
	IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
	BEGIN
		--Table1: GoodReceipt
		SELECT 
			gr.* ,
			v.VendorName
		FROM
			INV_TXN_GoodsReceipt gr 
			JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
		WHERE
			(gr.IsTransferredToACC IS NULL OR gr.IsTransferredToACC = 0) 
			AND (CONVERT(DATE, gr.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
		--Table2: WriteOffItems
		SELECT * 
		FROM
			INV_TXN_WriteOffItems 
		WHERE
			(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
			AND (CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
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
			AND (CONVERT(DATE, rv.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
		--Table4: DispatchToDept
		SELECT
			st.*, 
			gri.ItemRate 
		FROM
			INV_TXN_StockTransaction st
			JOIN INV_TXN_Stock s ON st.StockId = s.StockId 
			JOIN INV_TXN_GoodsReceiptItems gri ON s.GoodsReceiptItemId = gri.GoodsReceiptItemId 
		WHERE
			(st.IsTransferredToACC IS NULL OR st.IsTransferredToACC = 0) 
			AND (st.TransactionType IN ('dispatch', 'Sent From WardSupply')) 
			AND (CONVERT(DATE, st.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
	END
	ELSE
	BEGIN
		--Table1: GoodReceipt
		SELECT 
			gr.* ,
			v.VendorName
		FROM
			INV_TXN_GoodsReceipt gr 
			JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
		WHERE
			(gr.IsTransferredToACC IS NULL OR gr.IsTransferredToACC = 0) 
		--Table2: WriteOffItems
		SELECT * 
		FROM
			INV_TXN_WriteOffItems 
		WHERE
			(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
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
		--Table4: DispatchToDept
		SELECT
			st.*, 
			gri.ItemRate 
		FROM
			INV_TXN_StockTransaction st
			JOIN INV_TXN_Stock s ON st.StockId = s.StockId 
			JOIN INV_TXN_GoodsReceiptItems gri ON s.GoodsReceiptItemId = gri.GoodsReceiptItemId 
		WHERE
			(st.IsTransferredToACC IS NULL OR st.IsTransferredToACC = 0) 
			AND (TransactionType IN ('dispatch', 'Sent From WardSupply')) 
	END
END
GO
--end ajay 05Jul'19 --getting records of inventory for accounting

--Start:Vikas

/****** Object:  StoredProcedure [dbo].[SP_ACC_GetPharmacyTransactions]    Script Date: 7/5/2019 2:35:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:    Vikas
-- Create date: 1stjuly 2019 
-- =============================================
--EXEC [SP_ACC_GetPharmacyTransactions] '2018-07-29','2018-07-29'
CREATE PROCEDURE [dbo].[SP_ACC_GetPharmacyTransactions]
    @FromDate Datetime=null ,
    @ToDate DateTime=null
AS

BEGIN
  IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
  BEGIN
   --Table1: CashInvoice
	 SELECT * from PHRM_TXN_Invoice inv WHERE inv.IsTransferredToACC IS NULL AND CONVERT(date, inv.CreateOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
   --Table2: PHRM_TXN_InvoiceItems
	 SELECT * from PHRM_TXN_InvoiceItems inv WHERE  CONVERT(date, inv.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
   --Table3: CashInvoiceReturn
	 SELECT * from  PHRM_TXN_InvoiceReturnItems invRet WHERE invRet.IsTransferredToACC IS NULL AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)  
   --Table4: goodsReceipt
	 select * from PHRM_GoodsReceipt gr WHERE gr.IsTransferredToACC IS NULL AND gr.IsCancel=0  AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
  
   --Table5: writeoff
    select * from PHRM_WriteOff wrOff WHERE wrOff.IsTransferredToACC IS NULL AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
 
   --Table6: dispatchToDept && dispatchToDeptRet
   select * from PHRM_StockTxnItems stkItm WHERE stkItm.IsTransferredToACC IS NULL AND  CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
  
   --Table7: GrAmount Sum
 
	
 END
  ELSE
  BEGIN  
   --Table1: CashInvoice
	 SELECT * from PHRM_TXN_Invoice inv WHERE inv.IsTransferredToACC IS NULL 
   --Table2: CashInvoiceReturn
	 SELECT * from  PHRM_TXN_InvoiceReturnItems invRet WHERE invRet.IsTransferredToACC IS NULL
   --Table3: goodsReceiptItems
	 select * from PHRM_GoodsReceipt gr WHERE gr.IsTransferredToACC IS NULL AND gr.IsCancel=0 
   --Table4: returnToSupplier
	 select * from PHRM_ReturnToSupplier grRet WHERE grRet.IsTransferredToACC IS NULL 
   --Table5: writeoff
    select * from PHRM_WriteOff wrOff WHERE wrOff.IsTransferredToACC IS NULL 
   --Table6: dispatchToDept && dispatchToDeptRet
   select * from PHRM_StockTxnItems stkItm WHERE stkItm.IsTransferredToACC IS NULL 
  --Table7: GrAmount Sum
 
  END
END
Go
--End:Vikas 

--Start:Salakha:

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:    Salakha
-- Create date: 14th june 2019 
-- =============================================
-- Author:    Salakha
-- Create date: 14th june 2019 
-- Description:  to get datewise billing txns
-- =============================================
CREATE PROCEDURE [dbo].[SP_ACC_GetBillingTransactions]
    @FromDate Datetime=null ,
    @ToDate DateTime=null
AS
BEGIN
  IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
  BEGIN
  SELECT * from BIL_SYNC_BillingAccounting 
  WHERE IsTransferedToAcc IS NULL AND CONVERT(date, TransactionDate) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
 END
  ELSE
  BEGIN  
  SELECT * from BIL_SYNC_BillingAccounting 
  WHERE IsTransferedToAcc IS NULL
  END
END
Go
-- End:Salakha

--start Ajay 08Jul'19

--removing unsable columns
IF EXISTS(SELECT 1 FROM sys.columns 
          WHERE Name = N'GrVATAmount'
          AND Object_ID = Object_ID(N'PHRM_GoodsReceiptItems'))
BEGIN
ALTER TABLE PHRM_GoodsReceiptItems DROP COLUMN GrVATAmount;
END
GO

IF EXISTS(SELECT 1 FROM sys.columns 
          WHERE Name = N'GrDiscountAmount'
          AND Object_ID = Object_ID(N'PHRM_GoodsReceiptItems'))
BEGIN
ALTER TABLE PHRM_GoodsReceiptItems DROP COLUMN GrDiscountAmount
END
GO

IF EXISTS(SELECT 1 FROM sys.columns 
          WHERE Name = N'GrItemDiscountAmount'
          AND Object_ID = Object_ID(N'PHRM_TXN_InvoiceItems'))
BEGIN
ALTER TABLE PHRM_TXN_InvoiceItems DROP COLUMN GrItemDiscountAmount
END
GO

IF EXISTS(SELECT 1 FROM sys.columns 
          WHERE Name = N'GrItemVATPercent'
          AND Object_ID = Object_ID(N'PHRM_TXN_InvoiceItems'))
BEGIN
ALTER TABLE PHRM_TXN_InvoiceItems DROP COLUMN GrItemVATPercent
END
GO

--adding new columns in PHRM_GoodReceiptItems
IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE Name = N'GrPerItemVATAmt'
          AND Object_ID = Object_ID(N'PHRM_GoodsReceiptItems'))
BEGIN
ALTER TABLE PHRM_GoodsReceiptItems ADD GrPerItemVATAmt DECIMAL(16,4) NULL;
END
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE Name = N'GrPerItemDisAmt'
          AND Object_ID = Object_ID(N'PHRM_GoodsReceiptItems'))
BEGIN
ALTER TABLE PHRM_GoodsReceiptItems ADD GrPerItemDisAmt DECIMAL(16,4) NULL
END
GO


--old data migration for GrPerItemDisAmt,GrPerItemVATAmt
UPDATE
	PHRM_GoodsReceiptItems 
SET
	GrPerItemDisAmt = gritems.disamtperitem, 
    GrPerItemVATAmt = gritems.vatamtperitem 
FROM
	(SELECT gri.GoodReceiptItemId AS gritemid, 
		CASE 
			WHEN ( gri.ReceivedQuantity = 0 ) THEN 0 
            ELSE CONVERT(DECIMAL(16, 4),((gri.SubTotal * gr.disper) / 100) / gri.ReceivedQuantity)
		END AS disamtperitem, 
					--discountamount = (gritemsubtotal * grdiscountpercentage) / 100
					--discountamountperitem = ((gritemsubtotal * grdiscountpercentage) / 100)/gritemquantity
        CASE 
			WHEN ( gri.ReceivedQuantity = 0 ) THEN 0 
            ELSE CONVERT(DECIMAL(16, 4),(((gri.SubTotal-((gri.SubTotal*gr.disper)/100))/100)*gr.vatper) / gri.ReceivedQuantity)
        END AS vatamtperitem 
					--vatamount = (gritemsubtotal - discountamount)/100
					--vatamountperitem = ((gritemsubtotal - discountamount)/100)/gritemquantity
	FROM
		PHRM_GoodsReceiptItems gri 
        JOIN (
			SELECT
				GoodReceiptId, 
				((DiscountAmount * 100) / SubTotal) AS disper, 
                (VATAmount * 100) / (SubTotal - DiscountAmount) AS vatper 
			FROM
				PHRM_GoodsReceipt
            WHERE
				SubTotal != 0) AS gr 
		ON gri.GoodReceiptId = gr.GoodReceiptId) AS gritems 
WHERE
	gritems.gritemid = GoodReceiptItemId 
GO

--tigger for updating GrItemId in [PHRM_TXN_InvoiceItems] table

/****** Object:  Trigger [dbo].[TRG_PHRM_TXN_InvoiceItems_UpdateGRItemPrice]    Script Date: 07-07-2019 17:52:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER TRIGGER [dbo].[TRG_PHRM_TXN_InvoiceItems_UpdateGRItemPrice] 
   ON   [dbo].[PHRM_TXN_InvoiceItems]
   AFTER INSERT
AS 
/************************************************************************
FileName: [TRG_PHRM_TXN_InvoiceItems_UpdateGRItemPrice]
CreatedBy/date: Ajay/27Jun'19
Description: update GRItemPrice if null
Remarks: Getting GRItemPrice from PHRM_GoodsReceiptItems table
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1       Ajay/27Jun'19						created the script
2		Ajay/04Jul'19						updating GrItemId
*************************************************************************/
BEGIN
	DECLARE @InvoiceItemId INT;
	DECLARE @MRP DECIMAL(16,4);
	DECLARE @BatchNo VARCHAR(100);
	DECLARE @ExpiryDate datetime;
	DECLARE @ItemId INT;
	
	IF((SELECT GrItemPrice FROM inserted) IS NULL)
	BEGIN
		--get values from inserted data
		SELECT 
			@InvoiceItemId = InvoiceItemId,
			@MRP = MRP,
			@BatchNo = BatchNo,
			@ExpiryDate = ExpiryDate,
			@ItemId = ItemId
		FROM inserted
		--update GrItemPrice,GrItemId of PHRM_TXN_InvoiceItems
		UPDATE
			PHRM_TXN_InvoiceItems
		SET
			GrItemPrice = ISNULL(x.GRItemPrice,(SELECT Price FROM inserted)),
			GrItemId = x.GoodReceiptItemId
		FROM
			(SELECT TOP 1 
				gri.GRItemPrice,
				gri.GoodReceiptItemId
			FROM
				PHRM_GoodsReceiptItems AS gri
				JOIN PHRM_GoodsReceipt AS gr ON gri.GoodReceiptId = gr.GoodReceiptId
			WHERE
				gri.MRP = @MRP
				and gri.BatchNo = @BatchNo
				and gri.ExpiryDate = @ExpiryDate
				and gri.ItemId = @ItemId
				and gr.IsCancel = 0) AS x
		WHERE InvoiceItemId = @InvoiceItemId
	END
END
GO

--getting records for GrDiscountAmount,GrVATAmount,GrCOGSAmount
/****** Object:  StoredProcedure [dbo].[SP_ACC_GetPharmacyTransactions]    Script Date: 08-07-2019 09:34:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:    Vikas
-- Create date: 1stjuly 2019 
-- =============================================
--EXEC [SP_ACC_GetPharmacyTransactions] '2018-07-29','2018-07-29'
ALTER PROCEDURE [dbo].[SP_ACC_GetPharmacyTransactions]
    @FromDate Datetime=null ,
    @ToDate DateTime=null
AS

/************************************************************************
FileName: [SP_ACC_GetPharmacyTransactions]
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1       Ajay/07Jul'19						getting GrDiscountAmount,GrVATAmount,GrCOGSAmount
*************************************************************************/
BEGIN
  IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
  BEGIN
   --Table1: CashInvoice
	 SELECT * from PHRM_TXN_Invoice inv WHERE inv.IsTransferredToACC IS NULL AND CONVERT(date, inv.CreateOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
   --Table2: PHRM_TXN_InvoiceItems
	 SELECT * from PHRM_TXN_InvoiceItems inv WHERE  CONVERT(date, inv.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
   --Table3: CashInvoiceReturn
	 SELECT * from  PHRM_TXN_InvoiceReturnItems invRet WHERE invRet.IsTransferredToACC IS NULL AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)  
   --Table4: goodsReceipt
	 select * from PHRM_GoodsReceipt gr WHERE gr.IsTransferredToACC IS NULL AND gr.IsCancel=0  AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
  
   --Table5: writeoff
    select * from PHRM_WriteOff wrOff WHERE wrOff.IsTransferredToACC IS NULL AND CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
 
   --Table6: dispatchToDept && dispatchToDeptRet
   select * from PHRM_StockTxnItems stkItm WHERE stkItm.IsTransferredToACC IS NULL AND  CONVERT(date, CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
  
   --Table7: GrDiscountAmount,GrVATAmount,GrCOGSAmount
	SELECT
		invoice1.InvoiceId, 
		CASE 
			WHEN invoice1.DiscountAmount IS NULL THEN 0 
			ELSE CONVERT(DECIMAL(16, 4), invoice1.DiscountAmount) 
		END AS GrDiscountAmount, 
		CASE 
			WHEN invoice1.VATAmount IS NULL THEN 0 
			ELSE CONVERT(DECIMAL(16, 4), invoice1.VATAmount) 
		END AS GrVATAmount, 
		CASE 
			WHEN invoice1.GrCOGS IS NULL THEN 0 
			ELSE CONVERT(DECIMAL(16, 4), invoice1.GrCOGS) 
		END AS GrCOGSAmount  
	FROM (
		SELECT
			invitem.invid AS InvoiceId, 
			SUM(invitem.GrItemDisAmt) AS DiscountAmount, 
			SUM(invitem.GrItemVATAmt) AS VATAmount,
			SUM(GrItemTotalAmount) - SUM(invitem.GrItemDisAmt) AS GrCOGS 
			FROM (
				SELECT
					invitm.InvoiceId AS invid, 
					gri.GrPerItemDisAmt * invitm.Quantity AS GrItemDisAmt, 
					gri.GrPerItemVATAmt * invitm.Quantity AS GrItemVATAmt,
					invitm.GrItemPrice * invitm.Quantity AS GrItemTotalAmount 
				FROM
					PHRM_TXN_InvoiceItems invitm
					JOIN PHRM_GoodsReceiptItems gri ON invitm.GrItemId = gri.GoodReceiptItemId) AS invitem 
			JOIN PHRM_TXN_Invoice inv ON invitem.invid = inv.InvoiceId
			WHERE
				inv.IsTransferredToACC IS NULL 
				AND CONVERT(date, inv.CreateOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
			GROUP BY invid) AS invoice1
			RIGHT JOIN (
				SELECT
					invIt.InvoiceId AS InvoiceId 
				FROM
					PHRM_TXN_InvoiceItems invIt 
					JOIN PHRM_TXN_Invoice inv ON invIt.InvoiceId = inv.InvoiceId 
				WHERE  inv.IsTransferredToACC IS NULL 
				AND CONVERT(date, inv.CreateOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) 
				GROUP  BY invIt.InvoiceId) AS invoice2 
			ON invoice1.InvoiceId = invoice2.InvoiceId 
			Where invoice1.InvoiceId is not null
 END
  ELSE
  BEGIN  
   --Table1: CashInvoice
	 SELECT * from PHRM_TXN_Invoice inv WHERE inv.IsTransferredToACC IS NULL 
   --Table2: CashInvoiceReturn
	 SELECT * from  PHRM_TXN_InvoiceReturnItems invRet WHERE invRet.IsTransferredToACC IS NULL
   --Table3: goodsReceiptItems
	 select * from PHRM_GoodsReceipt gr WHERE gr.IsTransferredToACC IS NULL AND gr.IsCancel=0 
   --Table4: returnToSupplier
	 select * from PHRM_ReturnToSupplier grRet WHERE grRet.IsTransferredToACC IS NULL 
   --Table5: writeoff
    select * from PHRM_WriteOff wrOff WHERE wrOff.IsTransferredToACC IS NULL 
   --Table6: dispatchToDept && dispatchToDeptRet
   select * from PHRM_StockTxnItems stkItm WHERE stkItm.IsTransferredToACC IS NULL 
  --Table7: GrDiscountAmount,GrVATAmount
 	SELECT
		invoice1.InvoiceId, 
		CASE 
			WHEN invoice1.DiscountAmount IS NULL THEN 0 
			ELSE CONVERT(DECIMAL(16, 4), invoice1.DiscountAmount) 
		END AS GrDiscountAmount, 
		CASE 
			WHEN invoice1.VATAmount IS NULL THEN 0 
			ELSE CONVERT(DECIMAL(16, 4), invoice1.VATAmount) 
		END AS GrVATAmount, 
		CASE 
			WHEN invoice1.GrCOGS IS NULL THEN 0 
			ELSE CONVERT(DECIMAL(16, 4), invoice1.GrCOGS) 
		END AS GrCOGSAmount  
	FROM (
		SELECT
			invitem.invid AS InvoiceId, 
			SUM(invitem.GrItemDisAmt) AS DiscountAmount, 
			SUM(invitem.GrItemVATAmt) AS VATAmount,
			SUM(GrItemTotalAmount) - SUM(invitem.GrItemDisAmt) AS GrCOGS 
			FROM (
				SELECT
					invitm.InvoiceId AS invid, 
					gri.GrPerItemDisAmt * invitm.Quantity AS GrItemDisAmt, 
					gri.GrPerItemVATAmt * invitm.Quantity AS GrItemVATAmt,
					invitm.GrItemPrice * invitm.Quantity AS GrItemTotalAmount 
				FROM
					PHRM_TXN_InvoiceItems invitm
					JOIN PHRM_GoodsReceiptItems gri ON invitm.GrItemId = gri.GoodReceiptItemId) AS invitem 
			JOIN PHRM_TXN_Invoice inv ON invitem.invid = inv.InvoiceId
			WHERE
				inv.IsTransferredToACC IS NULL 
			GROUP BY invid) AS invoice1
			RIGHT JOIN (
				SELECT
					invIt.InvoiceId AS InvoiceId 
				FROM
					PHRM_TXN_InvoiceItems invIt 
					JOIN PHRM_TXN_Invoice inv ON invIt.InvoiceId = inv.InvoiceId 
				WHERE  inv.IsTransferredToACC IS NULL 
				GROUP  BY invIt.InvoiceId) AS invoice2 
			ON invoice1.InvoiceId = invoice2.InvoiceId 
			Where invoice1.InvoiceId is not null
  END
END
GO
--end Ajay 08Jul'19

--Start :  Salakha 09Jul'19 : Inventory Rules for Fixed Assets
alter table INV_TXN_GoodsReceiptItems add IsTransferredToACC bit null
GO

update ACC_MST_MappingDetail
set Description ='INVWriteOffCostofGoodsConsumed', LedgerGroupId = (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Expenses'
 and COA='Direct Expense' and LedgerGroupName='Cost of Goods Consumed')
where Description ='INVWriteOffCostofGoodsSold' and GroupMappingId = (select GroupMappingId from ACC_MST_GroupMapping where Description='INVWriteOff')
GO



INSERT INTO [dbo].[ACC_Ledger]  ([LedgerName],[CreatedOn],[CreatedBy],[IsActive],[LedgerGroupId])
VALUES ('Fixed Assets',GETDATE(),1,1,(select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets'
 and COA='Non Current Assets' and LedgerGroupName='Fixed Assets'))
GO

INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId])
 VALUES ('INVCreditGoodReceiptFixedAsset', 1, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Journal Voucher')) 
GO

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCreditGoodReceiptFixedAsset'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Non Current Assets' and LedgerGroupName='Fixed Assets'), 1)
Go

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCreditGoodReceiptFixedAsset'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 1)
Go

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCreditGoodReceiptFixedAsset'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Sundry Creditors'), 0)
Go

INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId])
 VALUES ('INVCashGoodReceiptFixedAsset1', 1, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Journal Voucher')) 
GO

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCashGoodReceiptFixedAsset1'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Non Current Assets' and LedgerGroupName='Fixed Assets'), 1)
Go


INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCashGoodReceiptFixedAsset1'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 1)
Go

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCashGoodReceiptFixedAsset1'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Sundry Creditors'), 0)
Go


INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section], [Details], [VoucherId])
 VALUES ('INVCashGoodReceiptFixedAsset2', 1, NULL, (select VoucherId from ACC_MST_Vouchers where [VoucherName]='Payment Voucher')) 
GO

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCashGoodReceiptFixedAsset2'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Sundry Creditors'), 1)
Go

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCashGoodReceiptFixedAsset2'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Assets' and COA='Current Assets' and LedgerGroupName='Cash In Hand'), 0)
Go

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCashGoodReceiptFixedAsset2'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Liabilities' and COA='Current Liabilities' and LedgerGroupName='Duties and Taxes'), 0)
Go
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description='INVCashGoodReceiptFixedAsset2'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where PrimaryGroup='Revenue' and COA='Indirect Income' and LedgerGroupName='Discount Income'), 0)
Go


/****** Object:  StoredProcedure [dbo].[SP_ACC_GetInventoryTransactions]    Script Date: 09-07-2019 02:45:37 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--End : Salakha -05 July 2019 --updated SP

--start ajay 05Jul'19 --getting records of inventory for accounting
ALTER PROCEDURE [dbo].[SP_ACC_GetInventoryTransactions]
    @FromDate DATETIME=null ,
    @ToDate DATETIME=null
AS
--EXEC [dbo].[SP_ACC_GetInventoryTransactions] @FromDate = '2019-07-05 12:07:31.170', @ToDate ='2020-07-05 12:07:31.170'

/************************************************************************
FileName: [SP_ACC_GetInventoryTransactions]
CreatedBy/date: Ajay/05Jul'19
Description: getting records of inventory transactions for accounting
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1       Ajay/05Jul'19						created the script
*************************************************************************/
BEGIN
	IF(@FromDate IS NOT NULL AND @ToDate IS NOT NULL) 
	BEGIN

		SELECT 
			gr.CreatedOn,
			v.VendorName,
			gr.VendorId,
			 gr.PaymentMode,
			 itm.ItemCategoryId,
			 itm.ItemType,
			 itm.ItemName,
			 gr.TDSAmount,
			 gritm.*
		FROM
			INV_TXN_GoodsReceipt gr 
			join INV_TXN_GoodsReceiptItems gritm on gr.GoodsReceiptID = gritm.GoodsReceiptId
			JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
			join INV_MST_Item itm on gritm.ItemId = itm.ItemId
		WHERE
			(gritm.IsTransferredToACC IS NULL OR gritm.IsTransferredToACC = 0) 
			AND (CONVERT(DATE, gr.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
		--Table1: GoodReceipt
		--SELECT 
		--	gr.* ,
		--	v.VendorName
		--FROM
		--	INV_TXN_GoodsReceipt gr 
		--	JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
		--WHERE
		--	(gr.IsTransferredToACC IS NULL OR gr.IsTransferredToACC = 0) 
		--	AND (CONVERT(DATE, gr.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
		--Table2: WriteOffItems
		SELECT * 
		FROM
			INV_TXN_WriteOffItems 
		WHERE
			(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
			AND (CONVERT(DATE, CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
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
			AND (CONVERT(DATE, rv.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
		--Table4: DispatchToDept
		SELECT
			st.*, 
			gri.ItemRate 
		FROM
			INV_TXN_StockTransaction st
			JOIN INV_TXN_Stock s ON st.StockId = s.StockId 
			JOIN INV_TXN_GoodsReceiptItems gri ON s.GoodsReceiptItemId = gri.GoodsReceiptItemId 
		WHERE
			(st.IsTransferredToACC IS NULL OR st.IsTransferredToACC = 0) 
			AND (st.TransactionType IN ('dispatch', 'Sent From WardSupply')) 
			AND (CONVERT(DATE, st.CreatedOn) BETWEEN CONVERT(DATE, @FromDate) AND CONVERT(DATE, @ToDate))
	END
	ELSE
	BEGIN
		--Table1: GoodReceipt
		SELECT 
			gr.* ,
			v.VendorName
		FROM
			INV_TXN_GoodsReceipt gr 
			JOIN INV_MST_Vendor v ON gr.VendorId = v.VendorId 
		WHERE
			(gr.IsTransferredToACC IS NULL OR gr.IsTransferredToACC = 0) 
		--Table2: WriteOffItems
		SELECT * 
		FROM
			INV_TXN_WriteOffItems 
		WHERE
			(IsTransferredToACC IS NULL OR IsTransferredToACC = 0)
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
		--Table4: DispatchToDept
		SELECT
			st.*, 
			gri.ItemRate 
		FROM
			INV_TXN_StockTransaction st
			JOIN INV_TXN_Stock s ON st.StockId = s.StockId 
			JOIN INV_TXN_GoodsReceiptItems gri ON s.GoodsReceiptItemId = gri.GoodsReceiptItemId 
		WHERE
			(st.IsTransferredToACC IS NULL OR st.IsTransferredToACC = 0) 
			AND (TransactionType IN ('dispatch', 'Sent From WardSupply')) 
	END
END
Go

/****** Object:  StoredProcedure [dbo].[SP_UpdateIsTransferToACC]    Script Date: 09-07-2019 02:46:14 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--[SP_UpdateIsTransferToACC] '1066,1067' , 'PHRMInvoice'
-- =============================================
-- Author:    Salakha Gawas
-- Create date: 25 Feb 2019
-- Description:  Created Script to Update column IsTransferToACC
-- =============================================
ALTER PROCEDURE [dbo].[SP_UpdateIsTransferToACC]
    @ReferenceIds varchar(max),
       @TransactionType nvarchar(50)
AS
BEGIN

------------------update pharmacy transaction transferred records--------------------------------------

	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashGoodReceipt')
		Begin            
			EXECUTE('UPDATE PHRM_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodReceiptId IN ('+@ReferenceIds+')')
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCreditGoodReceipt')
		Begin
			EXECUTE('UPDATE PHRM_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodReceiptId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashInvoice1')
		Begin
			EXECUTE('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashInvoice2')
		Begin
			EXECUTE('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCreditInvoice1')
		Begin
			EXECUTE('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCreditInvoice2')
		Begin
			EXECUTE('UPDATE PHRM_TXN_Invoice SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashInvoiceReturn1')
		Begin
			EXECUTE('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashInvoiceReturn2')
		Begin
			EXECUTE('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCreditInvoiceReturn1')
		Begin
			EXECUTE('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCreditInvoiceReturn2')
		Begin
			EXECUTE('UPDATE PHRM_TXN_InvoiceReturnItems SET IsTransferredToACC = 1 WHERE InvoiceId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCashReturnToSupplier')
		Begin
			EXECUTE('UPDATE PHRM_ReturnToSupplier SET IsTransferredToACC = 1 WHERE ReturnToSupplierId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMCreditReturnToSupplier')
		Begin
			EXECUTE('UPDATE PHRM_ReturnToSupplier SET IsTransferredToACC = 1 WHERE ReturnToSupplierId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMWriteOff')
		Begin
			EXECUTE('UPDATE PHRM_WriteOff SET IsTransferredToACC = 1 WHERE WriteOffId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMDispatchToDept')
		Begin
			EXECUTE('UPDATE PHRM_StockTxnItems SET IsTransferredToACC = 1 WHERE StockTxnItemId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'PHRMDispatchToDeptReturn')
		Begin
			EXECUTE('UPDATE PHRM_StockTxnItems SET IsTransferredToACC = 1 WHERE StockTxnItemId IN ('+@ReferenceIds+')')  
		END

  ------------------------updates inventory txn transaferred records--------------------------------

 --   if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCashGoodReceipt1')
	--  Begin
	--		EXECUTE('UPDATE INV_TXN_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodsReceiptID IN ('+@ReferenceIds+')')  
	-- END
 --   if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCashGoodReceipt2')
	--	Begin
	--		EXECUTE('UPDATE INV_TXN_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodsReceiptID IN ('+@ReferenceIds+')')  
	--	END
 --   if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCreditGoodReceipt')
	--	Begin
	--		EXECUTE('UPDATE INV_TXN_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodsReceiptID IN ('+@ReferenceIds+')')  
	--	END
	--if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCreditPaidGoodReceipt')
	--	Begin
	--		EXECUTE('UPDATE INV_TXN_GoodsReceipt SET IsTransferredToACC = 1 WHERE GoodsReceiptID IN ('+@ReferenceIds+')')  
	--	END
	    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCashGoodReceipt1')
	  Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = 1 WHERE GoodsReceiptItemId IN ('+@ReferenceIds+')')  
	 END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCashGoodReceipt2')
		Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = 1 WHERE GoodsReceiptItemId IN ('+@ReferenceIds+')')  
		END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCreditGoodReceipt')
		Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = 1 WHERE GoodsReceiptItemId IN ('+@ReferenceIds+')')  
		END
	if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCreditPaidGoodReceipt')
		Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = 1 WHERE GoodsReceiptItemId IN ('+@ReferenceIds+')')  
		END
		    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCreditGoodReceiptFixedAsset')
	  Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = 1 WHERE GoodsReceiptItemId IN ('+@ReferenceIds+')')  
	 END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCashGoodReceiptFixedAsset1')
		Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = 1 WHERE GoodsReceiptItemId IN ('+@ReferenceIds+')')  
		END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVCashGoodReceiptFixedAsset2')
		Begin
			EXECUTE('UPDATE INV_TXN_GoodsReceiptItems SET IsTransferredToACC = 1 WHERE GoodsReceiptItemId IN ('+@ReferenceIds+')')  
		END


    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVWriteOff')
		Begin
			EXECUTE('UPDATE INV_TXN_WriteOffItems SET IsTransferredToACC = 1 WHERE WriteOffId IN ('+@ReferenceIds+')')  
		END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVReturnToVendorCashGR')
		Begin
			EXECUTE('UPDATE INV_TXN_ReturnToVendorItems SET IsTransferredToACC = 1 WHERE ReturnToVendorItemId IN ('+@ReferenceIds+')')  
		END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVReturnToVendorCreditGR')
		Begin
			EXECUTE('UPDATE INV_TXN_ReturnToVendorItems SET IsTransferredToACC = 1 WHERE ReturnToVendorItemId IN ('+@ReferenceIds+')')  
		END
	  if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVDispatchToDept')
		Begin
			EXECUTE('UPDATE INV_TXN_StockTransaction SET IsTransferredToACC = 1 WHERE StockTxnId IN ('+@ReferenceIds+')')  
		END
    if(@ReferenceIds IS NOT NULL AND @TransactionType = 'INVDispatchToDeptReturn')
		Begin
			EXECUTE('UPDATE INV_TXN_StockTransaction SET IsTransferredToACC = 1 WHERE StockTxnId IN ('+@ReferenceIds+')')  
		END


  --------------------------updates billing txn transferred records---------------

  if(@ReferenceIds IS NOT NULL AND @TransactionType = 'BillingRecords')
	  Begin
		  EXECUTE('UPDATE BIL_SYNC_BillingAccounting SET IsTransferedToAcc = 1 WHERE BillingAccountingSyncId IN ('+@ReferenceIds+')')  
	  END

END
GO


--End :  Salakha 09Jul'19 : Inventory Rules for Fixed Assets
--START:NageshBB: 10-07-2019: Daywise voucher number column add, generated data for all old txn, trigger for new transaction
 --new column for save voucher number which is daywise uniquer for voucher type
  IF COL_LENGTH('dbo.ACC_Transactions', 'DayVoucherNumber') IS NULL 
  BEGIN 
  Alter table [ACC_Transactions]
  Add DayVoucherNumber int null
  END
  Go

  --update data of daywise voucher number 
   UPDATE
    ACC_Transactions
  SET
    DayVoucherNumber=(tt.rankid)
  FROM
    ACC_Transactions as t
    JOIN (select TransactionDate ,VoucherId ,rank() over(partition by  voucherid order by TransactionDate ASC
    ) as rankid from (
  select TransactionDate, VoucherId  from ACC_Transactions group by TransactionDate,VoucherId )
  as ll )
   as tt 
   on tt.TransactionDate=t.TransactionDate and tt.VoucherId=t.VoucherId
WHERE
    t.DayVoucherNumber is null
GO
--Check and delete if exists trigger
IF OBJECT_ID ('TRG_ACC_Transactions', 'TR') IS NOT NULL  
   DROP TRIGGER TRG_ACC_Transactions; 
go
/****** Object:  Trigger [dbo].[TRG_ACC_Transactions]    Script Date: 11-07-2019 18:05:20 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

Create TRIGGER [dbo].[TRG_ACC_Transactions] 
   ON   [dbo].[ACC_Transactions]
   AFTER INSERT
AS 
/************************************************************************
FileName: [TRG_ACC_Transactions] 
CreatedBy/date: Ajay/Nagesh/10Jul
Description: This trigger will create unique daywise voucher number for every voucher after insert transaction records.
Change History
-------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------------------------
1       Ajay/Nagesh 10July'19            created the script
*************************************************************************/
BEGIN
  DECLARE @TransactionDate date;
  DECLARE @VoucherId INT;
  DECLARE @DayVoucherNumber INT;
  
  SELECT @TransactionDate=convert (date,TransactionDate),@VoucherId=VoucherId FROM inserted

  IF((SELECT top 1 DayVoucherNumber FROM ACC_Transactions WHERE VoucherId=@VoucherId) IS NULL)
  BEGIN
    SET @DayVoucherNumber=1
  END
  ELSE
  BEGIN
	IF ((SELECT top 1 DayVoucherNumber FROM ACC_Transactions WHERE VoucherId =@VoucherId AND convert (date,TransactionDate)=@TransactionDate)is null)
	BEGIN
		SET @DayVoucherNumber = (SELECT ISNULL(MAX(DayVoucherNumber),0) + 1 FROM ACC_Transactions WHERE VoucherId=@VoucherId) -- for previous days
	END
	ELSE
	BEGIN
		SET @DayVoucherNumber = (SELECT ISNULL(MAX(DayVoucherNumber),0) FROM ACC_Transactions WHERE VoucherId=@VoucherId and convert (date,TransactionDate) = @TransactionDate) -- for current day
	END
  END
  
  UPDATE
    ACC_Transactions
  SET
    DayVoucherNumber= isnull(@DayVoucherNumber, 1)
  WHERE
    TransactionId=(SELECT TransactionId FROM inserted)
END
GO
--END:NageshBB: 10-07-2019: Daywise voucher number column add, generated data for all old txn, trigger for new transaction

--Start:Salakha: 24-07-2019: Update Fiscal year Activation
update ACC_MST_FiscalYears
set IsActive = 1
where FiscalYearName ='2076/2077'

update ACC_MST_FiscalYears
set IsActive = 0
where FiscalYearName ='2075/2076'
--END:Salakha: 24-07-2019: Update Fiscal year Activation

---START: Merged: NageshBB On 02 Aug 2019 : DEV and IpBillingDischargeCAncel 
--START: Salakha: 19July'19--Created table for Cancel Discharge Patient-
/****** Object:  Table [dbo].[ADT_DischargeCancel]    Script Date: 19-07-2019 13:53:02 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ADT_DischargeCancel](
	[DischargeCancelId] [int] IDENTITY(1,1) NOT NULL,
	[PatientVisitId] [int] NOT NULL,
	[PatientAdmissionId] [int] NOT NULL,
	[DischargedDate] [datetime] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[DischargedBy] [int] NOT NULL,
	[DischargeCancelledBy] [int] NOT NULL,
	[DischargeCancelNote] [varchar](300) NOT NULL,
	[BillingTransactionId] [int] NOT NULL,
 CONSTRAINT [PK_ADT_DischargeCancel] PRIMARY KEY CLUSTERED 
(
	[DischargeCancelId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE ADT_DischargeSummary
ADD IsDischargeCancel bit null;
GO
--End: Salakha: 19July'19--Created table for Cancel Discharge Patient-
---END: Merged: NageshBB On 02 Aug 2019 : DEV and IpBillingDischargeCAncel 
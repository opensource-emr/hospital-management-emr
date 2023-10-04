
begin try
ALTER INDEX [UK_BillingCounterName_Type]ON BIL_CFG_Counter DISABLE
ALTER INDEX [UK_BIL_CFG_FiscalYears] ON BIL_CFG_FiscalYears DISABLE
ALTER INDEX [UQ__CLN_EyeS__D7A3AA55BC800205] ON CLN_EyeScanImages DISABLE
ALTER INDEX [UQ__CLN_MST___4D3AA1DF8A330DC6] ON CLN_MST_EYE DISABLE
ALTER TABLE ER_Patient DISABLE TRIGGER [Emergency_PoliceCase_NotificatiONTrigger]
ALTER INDEX [UQ__CLN_PAT___D7A3AA5567EF1EDE] ON CLN_PAT_Images DISABLE
ALTER INDEX [UniqueOperatiONName] ON MR_MST_OperatiONType DISABLE
ALTER INDEX [UK_Membership_Community] ON PAT_CFG_MembershipType DISABLE
ALTER INDEX [UQ__PAT_Pati__D7A3AA55F0F539DA] ON PAT_PatientFiles DISABLE
ALTER INDEX [IX_TblPatInsuranceInfo_PatientId] ON PAT_PatientInsuranceInfo DISABLE
ALTER INDEX[UK_PHRM_CFG_FiscalYear] ON PHRM_CFG_FiscalYears DISABLE
ALTER TABLE PHRM_StockTxnItems DISABLE TRIGGER [TR_PHRM_StockTxnItems_MRPUpdateHistory]
ALTER TABLE PHRM_StockTxnItems DISABLE TRIGGER [TR_PHRM_StockTxnItems_UpdateStock]
ALTER TABLE PHRM_TXN_InvoiceItems DISABLE TRIGGER [TRG_PHRM_TXN_InvoiceItems_UpdateGRItemPrice]
ALTER TABLE LAB_TestRequisition DISABLE TRIGGER [PRINT_UpdateTrigger]
ALTER INDEX [Unique_Gov_Lab_ReportItem_Name]  ON Lab_Mst_Gov_Report_Items DISABLE
ALTER INDEX [Unique_Gov_Lab_ReportItem_SerialNumber] ON Lab_Mst_Gov_Report_Items DISABLE
ALTER INDEX [IX_TblBilDeposit_VisitId]  ON BIL_TXN_Deposit DISABLE
ALTER INDEX [IX_TblPatientBedInfo_VisitId]  ON ADT_TXN_PatientBedInfo DISABLE
ALTER INDEX [IX_BIL_BillingTransaction_CreatedOn]  ON BIL_TXN_BillingTransaction DISABLE
ALTER INDEX [IX_TblBilTxn_FiscalYearId_InvoiceNo]  ON BIL_TXN_BillingTransaction DISABLE
ALTER TABLE BIL_TXN_BillingTransaction DISABLE TRIGGER [TRG_BillingTransaction_RestrictBillAlter]
ALTER INDEX [IX_TblVisit_HasInsurance_VisitDate]  ON PAT_PatientVisits DISABLE
ALTER INDEX [IX_TblVisit_PatientId]  ON PAT_PatientVisits DISABLE
ALTER INDEX [IX_TblVisits_ClaimCode]  ON PAT_PatientVisits DISABLE
ALTER TABLE PAT_PatientVisits DISABLE TRIGGER [PAT_PatientVisits_NotificationTrigger]
ALTER INDEX [IX_INCTV_TXN_IncentiveFractionItem_BillingTransactionItemId]  ON INCTV_TXN_IncentiveFractionItem DISABLE
ALTER INDEX [IX_INCTV_TXN_IncentiveFractionItem_IncentiveReceiverId]  ON INCTV_TXN_IncentiveFractionItem DISABLE
ALTER INDEX [UK_IncentiveFractionItems] ON INCTV_TXN_IncentiveFractionItem DISABLE
ALTER TABLE BIL_SYNC_BillingAccounting DISABLE TRIGGER [TRG_BillToAcc_BillSync]
ALTER INDEX [IX_TblAdmission_IsInsurancePatient]  ON ADT_PatientAdmission DISABLE
ALTER INDEX [IX_TblAdmission_VisitId_PatientId]  ON ADT_PatientAdmission DISABLE

delete from dbo.__MigrationHistory 
DBCC CHECKIDENT ('dbo.__MigrationHistory', RESEED, 0);

delete from ACC_Bill_LedgerMapping
DBCC CHECKIDENT ('ACC_Bill_LedgerMapping', RESEED, 0);

delete from ACC_FiscalYear_Log
DBCC CHECKIDENT ('ACC_FiscalYear_Log', RESEED, 0);

delete from ACC_InvoiceData
DBCC CHECKIDENT ('ACC_InvoiceData', RESEED, 0);

delete from ACC_LedgerBalanceHistory
DBCC CHECKIDENT ('ACC_LedgerBalanceHistory', RESEED, 0);

delete from ACC_Log_EditVoucher
DBCC CHECKIDENT ('ACC_Log_EditVoucher', RESEED, 0);

delete from ACC_Map_TxnItemCostCenterItem
DBCC CHECKIDENT ('ACC_Map_TxnItemCostCenterItem', RESEED, 0);

delete from ACC_ReverseTransaction
DBCC CHECKIDENT ('ACC_ReverseTransaction', RESEED, 0);

delete from ACC_Transaction_History
DBCC CHECKIDENT ('ACC_Transaction_History', RESEED, 0);

delete from  ACC_TransactionItemDetail
DBCC CHECKIDENT ('ACC_TransactionItemDetail', RESEED, 0);

delete from ACC_TransactionItems
DBCC CHECKIDENT ('ACC_TransactionItems', RESEED, 0);

delete from ACC_Transactions
DBCC CHECKIDENT ('ACC_Transactions', RESEED, 0);

delete from  ACC_TXN_Bank_Reconciliation
DBCC CHECKIDENT ('ACC_TXN_Bank_Reconciliation', RESEED, 0);

delete from ACC_TXN_Link
DBCC CHECKIDENT ('ACC_TXN_Link', RESEED, 0);

delete from ACC_TXN_Payment
DBCC CHECKIDENT ('ACC_TXN_Payment', RESEED, 0);

delete from ADT_BabyBirthDetails
DBCC CHECKIDENT ('ADT_BabyBirthDetails', RESEED, 0);

delete from ADT_BedReservation
DBCC CHECKIDENT ('ADT_BedReservation', RESEED, 0);

delete from ADT_DeathDeatils
DBCC CHECKIDENT ('ADT_DeathDeatils', RESEED, 0);

delete from ADT_DischargeCancel
DBCC CHECKIDENT ('ADT_DischargeCancel', RESEED, 0);

delete from ADT_DischargeSummary
DBCC CHECKIDENT ('ADT_DischargeSummary', RESEED, 0);

delete from ADT_DischargeSummaryMedication
DBCC CHECKIDENT ('ADT_DischargeSummaryMedication', RESEED, 0);

delete from ADT_MAP_BedFeaturesMap
DBCC CHECKIDENT ('ADT_MAP_BedFeaturesMap', RESEED, 0);

delete from ADT_PatientCertificate
DBCC CHECKIDENT ('ADT_PatientCertificate', RESEED, 0)

delete from BedInformationModels
DBCC CHECKIDENT ('BedInformationModels', RESEED, 0);

delete from BIL_BillItemRequisition
DBCC CHECKIDENT ('BIL_BillItemRequisition', RESEED, 0);

delete from BIL_CFG_BillItemPrice
DBCC CHECKIDENT ('BIL_CFG_BillItemPrice', RESEED, 0);

delete from BIL_CFG_BillItemPrice_History
DBCC CHECKIDENT ('BIL_CFG_BillItemPrice_History', RESEED, 0);

delete from BIL_CFG_Counter
DBCC CHECKIDENT ('BIL_CFG_Counter', RESEED, 0);

delete from BIL_CFG_FiscalYears
DBCC CHECKIDENT ('BIL_CFG_FiscalYears', RESEED, 0);

delete from BIL_CFG_Packages
DBCC CHECKIDENT ('BIL_CFG_Packages', RESEED, 0);

delete from BIL_CFG_PriceCategory
DBCC CHECKIDENT ('BIL_CFG_PriceCategory', RESEED, 0);

delete from BIL_History_BillingTransactionItems
DBCC CHECKIDENT ('BIL_History_BillingTransactionItems', RESEED, 0);

delete from BIL_Temp_ItemsMapping
DBCC CHECKIDENT ('BIL_Temp_ItemsMapping', RESEED, 0);

delete from BIL_TXN_CashHandover
DBCC CHECKIDENT ('BIL_TXN_CashHandover', RESEED, 0);

delete from BIL_TXN_Settlements
DBCC CHECKIDENT ('BIL_TXN_Settlements', RESEED, 0);

delete from CLN_ActiveMedicals
DBCC CHECKIDENT ('CLN_ActiveMedicals', RESEED, 0);

delete from CLN_Allergies
DBCC CHECKIDENT ('CLN_Allergies', RESEED, 0);

delete from CLN_Diagnosis
DBCC CHECKIDENT ('CLN_Diagnosis', RESEED, 0);

delete from CLN_EYE_Ablation_Profile
DBCC CHECKIDENT ('CLN_EYE_Ablation_Profile', RESEED, 0);

delete from CLN_EYE_Laser_DataEntry
DBCC CHECKIDENT ('CLN_EYE_Laser_DataEntry', RESEED, 0);

delete from CLN_EYE_LasikRST
DBCC CHECKIDENT ('CLN_EYE_LasikRST', RESEED, 0);

delete from CLN_EYE_OperationNotes
DBCC CHECKIDENT ('CLN_EYE_OperationNotes', RESEED, 0);

delete from CLN_EYE_ORA
DBCC CHECKIDENT ('CLN_EYE_ORA', RESEED, 0);

delete from CLN_EYE_Pachymetry
DBCC CHECKIDENT ('CLN_EYE_Pachymetry', RESEED, 0);

delete from CLN_EYE_PreOP_Pachymetry
DBCC CHECKIDENT ('CLN_EYE_PreOP_Pachymetry', RESEED, 0);

delete from CLN_EYE_Refraction
DBCC CHECKIDENT ('CLN_EYE_Refraction', RESEED, 0);

delete from CLN_EYE_Smile_Incisions
DBCC CHECKIDENT ('CLN_EYE_Smile_Incisions', RESEED, 0);

delete from CLN_EYE_Smile_Setting
DBCC CHECKIDENT ('CLN_EYE_Smile_Setting', RESEED, 0);

delete from CLN_EYE_VisuMax
DBCC CHECKIDENT ('CLN_EYE_VisuMax', RESEED, 0);

delete from CLN_EYE_Wavefront
DBCC CHECKIDENT ('CLN_EYE_Wavefront', RESEED, 0);

delete from CLN_EyeScanImages
DBCC CHECKIDENT ('CLN_EyeScanImages', RESEED, 0);

delete from CLN_FamilyHistory
DBCC CHECKIDENT ('CLN_FamilyHistory', RESEED, 0);

delete from CLN_HomeMedications
DBCC CHECKIDENT ('CLN_HomeMedications', RESEED, 0);

delete from CLN_KV_PatientClinical_Info
DBCC CHECKIDENT ('CLN_KV_PatientClinical_Info', RESEED, 0);

delete from CLN_MedicationPrescription
DBCC CHECKIDENT ('CLN_MedicationPrescription', RESEED, 0);

delete from CLN_MST_EYE
DBCC CHECKIDENT ('CLN_MST_EYE', RESEED, 0);

delete from CLN_MST_PrescriptionSlip
DBCC CHECKIDENT ('CLN_MST_PrescriptionSlip', RESEED, 0);

delete from CLN_Notes_Emergency
DBCC CHECKIDENT ('CLN_Notes_Emergency', RESEED, 0);

delete from CLN_Notes_FreeText
DBCC CHECKIDENT ('CLN_Notes_FreeText', RESEED, 0);

delete from CLN_Notes_Objective
DBCC CHECKIDENT ('CLN_Notes_Objective', RESEED, 0);

delete from CLN_Notes_PrescriptionNote
DBCC CHECKIDENT ('CLN_Notes_PrescriptionNote', RESEED, 0);

delete from CLN_Notes_Procedure
DBCC CHECKIDENT ('CLN_Notes_Procedure', RESEED, 0);

delete from CLN_Notes_Progress
DBCC CHECKIDENT ('CLN_Notes_Progress', RESEED, 0);

delete from CLN_Notes_Subjective
DBCC CHECKIDENT ('CLN_Notes_Subjective', RESEED, 0);

delete from CLN_PastMedicals
DBCC CHECKIDENT ('CLN_PastMedicals', RESEED, 0);

delete from CLN_PAT_Images
DBCC CHECKIDENT ('CLN_PAT_Images', RESEED, 0);

delete from CLN_PatientNotes
DBCC CHECKIDENT ('CLN_PatientNotes', RESEED, 0);

delete from CLN_PatientVisit_Notes
DBCC CHECKIDENT ('CLN_PatientVisit_Notes', RESEED, 0);

delete from CLN_PatientVisitProcedure
DBCC CHECKIDENT ('CLN_PatientVisitProcedure', RESEED, 0);

delete from CLN_PrescriptionSlip_Acceptance
DBCC CHECKIDENT ('CLN_PrescriptionSlip_Acceptance', RESEED, 0);

delete from CLN_PrescriptionSlip_AdviceDiagnosis
DBCC CHECKIDENT ('CLN_PrescriptionSlip_AdviceDiagnosis', RESEED, 0);

delete from CLN_PrescriptionSlip_Dilate
DBCC CHECKIDENT ('CLN_PrescriptionSlip_Dilate', RESEED, 0);

delete from CLN_PrescriptionSlip_FinalClass
DBCC CHECKIDENT ('CLN_PrescriptionSlip_FinalClass', RESEED, 0);

delete from CLN_PrescriptionSlip_History
DBCC CHECKIDENT ('CLN_PrescriptionSlip_History', RESEED, 0);

delete from CLN_PrescriptionSlip_IOP
DBCC CHECKIDENT ('CLN_PrescriptionSlip_IOP', RESEED, 0);

delete from CLN_PrescriptionSlip_Plup
DBCC CHECKIDENT ('CLN_PrescriptionSlip_Plup', RESEED, 0);

delete from CLN_PrescriptionSlip_Retinoscopy
DBCC CHECKIDENT ('CLN_PrescriptionSlip_Retinoscopy', RESEED, 0);

delete from CLN_PrescriptionSlip_TBUT
DBCC CHECKIDENT ('CLN_PrescriptionSlip_TBUT', RESEED, 0);

delete from CLN_PrescriptionSlip_VaUnaided
DBCC CHECKIDENT ('CLN_PrescriptionSlip_VaUnaided', RESEED, 0);

delete from CLN_ReferralSource
DBCC CHECKIDENT ('CLN_ReferralSource', RESEED, 0);

delete from CLN_SocialHistory
DBCC CHECKIDENT ('CLN_SocialHistory', RESEED, 0);

delete from CORE_Notification
DBCC CHECKIDENT ('CORE_Notification', RESEED, 0);

delete from CSSD_TXN_ItemTransaction
DBCC CHECKIDENT ('CSSD_TXN_ItemTransaction', RESEED, 0);

delete from CLN_SurgicalHistory
DBCC CHECKIDENT ('CLN_SurgicalHistory', RESEED, 0);

delete from DanpheAudit
DBCC CHECKIDENT ('DanpheAudit', RESEED, 0);

delete from DanpheLogInInformation
DBCC CHECKIDENT ('DanpheLogInInformation', RESEED, 0);

delete from DOC_TXN_VisitSummary
DBCC CHECKIDENT ('DOC_TXN_VisitSummary', RESEED, 0);

delete from EMP_EmployeePreferences
DBCC CHECKIDENT ('EMP_EmployeePreferences', RESEED, 0);

delete from ER_DischargeSummary
DBCC CHECKIDENT ('ER_DischargeSummary', RESEED, 0);

delete from ER_FileUploads
DBCC CHECKIDENT ('ER_FileUploads', RESEED, 0);

delete from ER_ModeOfArrival
DBCC CHECKIDENT ('ER_ModeOfArrival', RESEED, 0);

delete from ER_Patient
DBCC CHECKIDENT ('ER_Patient', RESEED, 0);

delete from ER_Patient_Cases
DBCC CHECKIDENT ('ER_Patient_Cases', RESEED, 0);

delete from FRC_FractionCalculation
DBCC CHECKIDENT ('FRC_FractionCalculation', RESEED, 0);

delete from INCTV_TXN_PaymentInfo
DBCC CHECKIDENT ('INCTV_TXN_PaymentInfo', RESEED, 0);

delete from INS_InsuranceBalanceAmount_History
DBCC CHECKIDENT ('INS_InsuranceBalanceAmount_History', RESEED, 0);

delete from INS_TXN_PatientInsurancePackages
DBCC CHECKIDENT ('INS_TXN_PatientInsurancePackages', RESEED, 0);

delete from INV_AssetConditionCheckList
DBCC CHECKIDENT ('INV_AssetConditionCheckList', RESEED, 0);

delete from INV_AssetFaultHistory
DBCC CHECKIDENT ('INV_AssetFaultHistory', RESEED, 0);

delete from INV_AssetInsurance
DBCC CHECKIDENT ('INV_AssetInsurance', RESEED, 0);

delete from INV_AssetLocationHistory
DBCC CHECKIDENT ('INV_AssetLocationHistory', RESEED, 0);

delete from INV_AssetServiceHistory
DBCC CHECKIDENT ('INV_AssetServiceHistory', RESEED, 0);

delete from INV_AssetServiceHistory
DBCC CHECKIDENT ('INV_AssetServiceHistory', RESEED, 0);

delete from INV_MST_Donation
DBCC CHECKIDENT ('INV_MST_Donation', RESEED, 0);

delete from INV_MST_Stock
DBCC CHECKIDENT ('INV_MST_Stock', RESEED, 0);

delete from INV_MST_Vendor
DBCC CHECKIDENT ('INV_MST_Vendor', RESEED, 0);

delete from INV_Quotation
DBCC CHECKIDENT ('INV_Quotation', RESEED, 0);

delete from INV_QuotationItems
DBCC CHECKIDENT ('INV_QuotationItems', RESEED, 0);

delete from INV_QuotationUploadedFiles
DBCC CHECKIDENT ('INV_QuotationUploadedFiles', RESEED, 0);

delete from INV_RequestForQuotation
DBCC CHECKIDENT ('INV_RequestForQuotation', RESEED, 0);

delete from INV_RequestForQuotationItems
DBCC CHECKIDENT ('INV_RequestForQuotationItems', RESEED, 0);

delete from INV_RequestForQuotationVendors
DBCC CHECKIDENT ('INV_RequestForQuotationVendors', RESEED, 0);

delete from INV_TXN_AssetDepreciation
DBCC CHECKIDENT ('INV_TXN_AssetDepreciation', RESEED, 0);

delete from INV_TXN_FixedAssetDispatch
DBCC CHECKIDENT ('INV_TXN_FixedAssetDispatch', RESEED, 0);

delete from INV_TXN_FixedAssetDispatchItems
DBCC CHECKIDENT ('INV_TXN_FixedAssetDispatchItems', RESEED, 0);

delete from INV_TXN_FixedAssetRequisition
DBCC CHECKIDENT ('INV_TXN_FixedAssetRequisition', RESEED, 0);

delete from INV_TXN_FixedAssetRequisitionItems
DBCC CHECKIDENT ('INV_TXN_FixedAssetRequisitionItems', RESEED, 0);

delete from INV_TXN_FixedAssetReturn
DBCC CHECKIDENT ('INV_TXN_FixedAssetReturn', RESEED, 0);

delete from INV_TXN_FixedAssetReturnItems
DBCC CHECKIDENT ('INV_TXN_FixedAssetReturnItems', RESEED, 0);

delete from INV_TXN_FixedAssetStock
DBCC CHECKIDENT ('INV_TXN_FixedAssetStock', RESEED, 0);

delete from INV_TXN_GoodsReceipt
DBCC CHECKIDENT ('INV_TXN_GoodsReceipt', RESEED, 0);

delete from INV_TXN_PurchaseOrder
DBCC CHECKIDENT ('INV_TXN_PurchaseOrder', RESEED, 0);

delete from INV_TXN_PurchaseOrderItems
DBCC CHECKIDENT ('INV_TXN_PurchaseOrderItems', RESEED, 0);

delete from INV_TXN_PurchaseRequest
DBCC CHECKIDENT ('INV_TXN_PurchaseRequest', RESEED, 0);

delete from INV_TXN_PurchaseRequestItems
DBCC CHECKIDENT ('INV_TXN_PurchaseRequestItems', RESEED, 0);

delete from INV_TXN_RequisitionForPO
DBCC CHECKIDENT ('INV_TXN_RequisitionForPO', RESEED, 0);

delete from INV_TXN_RequisitionItemsForPO
DBCC CHECKIDENT ('INV_TXN_RequisitionItems', RESEED, 0);

delete from INV_TXN_ReturnToVendor
DBCC CHECKIDENT ('INV_TXN_ReturnToVendor', RESEED, 0);

delete from INV_TXN_ReturnToVendorItems
DBCC CHECKIDENT ('INV_TXN_ReturnToVendorItems', RESEED, 0);

delete from INV_TXN_StoreStock
DBCC CHECKIDENT ('INV_TXN_StoreStock', RESEED, 0);

delete from INV_TXN_WriteOffItems
DBCC CHECKIDENT ('INV_TXN_WriteOffItems', RESEED, 0);

delete from IRD_Log
DBCC CHECKIDENT ('IRD_Log', RESEED, 0);

delete from MAT_FileUploads
DBCC CHECKIDENT ('MAT_FileUploads', RESEED, 0);

delete from MAT_MaternityANC
DBCC CHECKIDENT ('MAT_MaternityANC', RESEED, 0);

delete from MAT_Patient
DBCC CHECKIDENT ('MAT_Patient', RESEED, 0);

delete from MAT_Register
DBCC CHECKIDENT ('MAT_Register', RESEED, 0);

delete from MAT_TXN_PatientPayments
DBCC CHECKIDENT ('MAT_TXN_PatientPayments', RESEED, 0);

delete from MR_MST_OperationType
DBCC CHECKIDENT ('MR_MST_OperationType', RESEED, 0);

delete from MR_RecordSummary
DBCC CHECKIDENT ('MR_RecordSummary', RESEED, 0);

delete from MR_TXN_Inpatient_Diagnosis
DBCC CHECKIDENT ('MR_TXN_Inpatient_Diagnosis', RESEED, 0);

delete from NewItemHAMS
DBCC CHECKIDENT ('NewItemHAMS', RESEED, 0);

delete from OT_TXN_BookingDetails
DBCC CHECKIDENT ('OT_TXN_BookingDetails', RESEED, 0);

delete from OT_TXN_CheckListInfo
DBCC CHECKIDENT ('OT_TXN_CheckListInfo', RESEED, 0);

delete from OT_TXN_OtTeamsInfo
DBCC CHECKIDENT ('OT_TXN_OtTeamsInfo', RESEED, 0);

delete from OT_TXN_Summary
DBCC CHECKIDENT ('OT_TXN_Summary', RESEED, 0);

delete from PAT_Appointment
DBCC CHECKIDENT ('PAT_Appointment', RESEED, 0);

delete from PAT_CFG_MembershipType
DBCC CHECKIDENT ('PAT_CFG_MembershipType', RESEED, 0);

delete from PAT_HealthCardInfo
DBCC CHECKIDENT ('PAT_HealthCardInfo', RESEED, 0);

delete from PAT_PatientAddress
DBCC CHECKIDENT ('PAT_PatientAddress', RESEED, 0);

delete from PAT_PatientFiles
DBCC CHECKIDENT ('PAT_PatientFiles', RESEED, 0);

delete from PAT_PatientInsuranceInfo
DBCC CHECKIDENT ('PAT_PatientInsuranceInfo', RESEED, 0);

delete from PAT_PatientKinOrEmergencyContacts
DBCC CHECKIDENT ('PAT_PatientKinOrEmergencyContacts', RESEED, 0);

delete from PAT_SSU_Information
DBCC CHECKIDENT ('PAT_SSU_Information', RESEED, 0);

delete from PHRM_BIL_Transaction
DBCC CHECKIDENT ('PHRM_BIL_Transaction', RESEED, 0);

delete from PHRM_BIL_TransactionItem
DBCC CHECKIDENT ('PHRM_BIL_TransactionItem', RESEED, 0);

delete from PHRM_CFG_FiscalYears
DBCC CHECKIDENT ('PHRM_CFG_FiscalYears', RESEED, 0);

delete from PHRM_Deposit
DBCC CHECKIDENT ('PHRM_Deposit', RESEED, 0);

delete from PHRM_ExpiryDate_BatchNo_History
DBCC CHECKIDENT ('PHRM_ExpiryDate_BatchNo_History', RESEED, 0);

delete from PHRM_FiscalYearStock
DBCC CHECKIDENT ('PHRM_FiscalYearStock', RESEED, 0);

delete from PHRM_History_Item
DBCC CHECKIDENT ('PHRM_History_Item', RESEED, 0);

delete from PHRM_History_StockBatchExpiry
DBCC CHECKIDENT ('PHRM_History_StockBatchExpiry', RESEED, 0);

delete from PHRM_History_StockMRP
DBCC CHECKIDENT ('PHRM_History_StockMRP', RESEED, 0);

delete from PHRM_NarcoticSaleRecord
DBCC CHECKIDENT ('PHRM_NarcoticSaleRecord', RESEED, 0);

delete from PHRM_Prescription
DBCC CHECKIDENT ('PHRM_Prescription', RESEED, 0);

delete from PHRM_PrescriptionItems
DBCC CHECKIDENT ('PHRM_PrescriptionItems', RESEED, 0);

delete from PHRM_Requisition
DBCC CHECKIDENT ('PHRM_Requisition', RESEED, 0);

delete from PHRM_RequisitionItems
DBCC CHECKIDENT ('PHRM_RequisitionItems', RESEED, 0);

delete from PHRM_ReturnToSupplier
DBCC CHECKIDENT ('PHRM_ReturnToSupplier', RESEED, 0);

delete from PHRM_ReturnToSupplierItems
DBCC CHECKIDENT ('PHRM_ReturnToSupplierItems', RESEED, 0);

delete from PHRM_SaleItems
DBCC CHECKIDENT ('PHRM_SaleItems', RESEED, 0);

delete from PHRM_SaleItemsReturn
DBCC CHECKIDENT ('PHRM_SaleItemsReturn', RESEED, 0);

delete from PHRM_Stock
DBCC CHECKIDENT ('PHRM_Stock', RESEED, 0);

delete from PHRM_StockManage
DBCC CHECKIDENT ('PHRM_StockManage', RESEED, 0);

delete from PHRM_StockTxnItems
DBCC CHECKIDENT ('PHRM_StockTxnItems', RESEED, 0);

delete from PHRM_StockTxnItems_MRPHistory
DBCC CHECKIDENT ('PHRM_StockTxnItems_MRPHistory', RESEED, 0);

delete from PHRM_StoreDispatchItems
DBCC CHECKIDENT ('PHRM_StoreDispatchItems', RESEED, 0);

delete from PHRM_StoreRequisition
DBCC CHECKIDENT ('PHRM_StoreRequisition', RESEED, 0);

delete from PHRM_StoreRequisitionItems
DBCC CHECKIDENT ('PHRM_StoreRequisitionItems', RESEED, 0);

delete from PHRM_TXN_DispensaryStock
DBCC CHECKIDENT ('PHRM_TXN_DispensaryStock', RESEED, 0);

delete from PHRM_TXN_DispensaryStockTransaction
DBCC CHECKIDENT ('PHRM_TXN_DispensaryStockTransaction', RESEED, 0);

delete from PHRM_TXN_Invoice
DBCC CHECKIDENT ('PHRM_TXN_Invoice', RESEED, 0);

delete from PHRM_TXN_InvoiceItems
DBCC CHECKIDENT ('PHRM_TXN_InvoiceItems', RESEED, 0);

delete from PHRM_TXN_InvoiceReturn
DBCC CHECKIDENT ('PHRM_TXN_InvoiceReturn', RESEED, 0);

delete from PHRM_TXN_InvoiceReturnItems
DBCC CHECKIDENT ('PHRM_TXN_InvoiceReturnItems', RESEED, 0);

delete from PHRM_TXN_Settlement
DBCC CHECKIDENT ('PHRM_TXN_Settlement', RESEED, 0);

delete from PHRM_TXN_Stock
DBCC CHECKIDENT ('PHRM_TXN_Stock', RESEED, 0);

delete from PHRM_TXN_StockTransaction
DBCC CHECKIDENT ('PHRM_TXN_StockTransaction', RESEED, 0);

delete from PHRM_TXN_StoreStock
DBCC CHECKIDENT ('PHRM_TXN_StoreStock', RESEED, 0);

delete from PHRM_TXN_SupplierLedger
DBCC CHECKIDENT ('PHRM_TXN_SupplierLedger', RESEED, 0);

delete from PHRM_TXN_SupplierLedgerTransaction
DBCC CHECKIDENT ('PHRM_TXN_SupplierLedgerTransaction', RESEED, 0);

delete from PHRM_WriteOff
DBCC CHECKIDENT ('PHRM_WriteOff', RESEED, 0);

delete from PHRM_WriteOffItems
DBCC CHECKIDENT ('PHRM_WriteOffItems', RESEED, 0);

delete from PROLL_AttendanceDailyTimeRecord
DBCC CHECKIDENT ('PROLL_AttendanceDailyTimeRecord', RESEED, 0);

delete from PROLL_DailyMuster
DBCC CHECKIDENT ('PROLL_DailyMuster', RESEED, 0);

delete from PROLL_EmpLeave
DBCC CHECKIDENT ('PROLL_EmpLeave', RESEED, 0);

delete from SCH_EmpDayWiseAvailability
DBCC CHECKIDENT ('SCH_EmpDayWiseAvailability', RESEED, 0);

delete from SCH_EmployeeSchedules
DBCC CHECKIDENT ('SCH_EmployeeSchedules', RESEED, 0);

delete from SCH_MAP_EmployeeShift
DBCC CHECKIDENT ('SCH_MAP_EmployeeShift', RESEED, 0);

delete from TBL_BillItem_Temp
DBCC CHECKIDENT ('TBL_BillItem_Temp', RESEED, 0);

delete from Temp_LabNewPrice
DBCC CHECKIDENT ('Temp_LabNewPrice', RESEED, 0);

delete from Temp10
DBCC CHECKIDENT ('Temp10', RESEED, 0);

delete from tempRange
DBCC CHECKIDENT ('tempRange', RESEED, 0);

delete from TXN_EmpDueAmount
DBCC CHECKIDENT ('TXN_EmpDueAmount', RESEED, 0);

delete from TXN_Sms
DBCC CHECKIDENT ('TXN_Sms', RESEED, 0);

delete from  TXN_Verification
DBCC CHECKIDENT ('TXN_Verification', RESEED, 0);

delete from WardInformationModels 
DBCC CHECKIDENT ('WardInformationModels', RESEED, 0);

delete from  WARD_Transaction
DBCC CHECKIDENT ('WARD_Transaction', RESEED, 0);

delete from  WARD_Stock
DBCC CHECKIDENT ('WARD_Stock', RESEED, 0);

delete from WARD_RequisitionItems
DBCC CHECKIDENT ('WARD_RequisitionItems', RESEED, 0);

delete from WARD_Requisition
DBCC CHECKIDENT ('WARD_Requisition', RESEED, 0);

delete from WARD_INV_ConsumptionReceipt
DBCC CHECKIDENT ('WARD_INV_ConsumptionReceipt', RESEED, 0);

delete from  WARD_InternalConsumptionItems
DBCC CHECKIDENT ('WARD_InternalConsumptionItems', RESEED, 0);

delete from  WARD_InternalConsumption
DBCC CHECKIDENT ('WARD_InternalConsumption', RESEED, 0);

delete from WARD_DispatchItems
DBCC CHECKIDENT ('WARD_DispatchItems', RESEED, 0);

delete from WARD_Dispatch
DBCC CHECKIDENT ('WARD_Dispatch', RESEED, 0);

delete from  WARD_Consumption
DBCC CHECKIDENT ('WARD_Consumption', RESEED, 0);

delete from VACC_Vaccines
DBCC CHECKIDENT ('VACC_Vaccines', RESEED, 0);

delete from VACC_PatientVaccineDetail
DBCC CHECKIDENT ('VACC_PatientVaccineDetail', RESEED, 0);

delete from PHRM_StoreStock
DBCC CHECKIDENT ('PHRM_StoreStock', RESEED, 0);

delete from LAB_TXN_TestComponentResult
DBCC CHECKIDENT ('LAB_TXN_TestComponentResult', RESEED, 0);

delete from LAB_TXN_LabReports
DBCC CHECKIDENT ('LAB_TXN_LabReports', RESEED, 0);

delete from LAB_BarCode
DBCC CHECKIDENT ('LAB_BarCode', RESEED, 0);

delete from LAB_TestRequisition
DBCC CHECKIDENT ('LAB_TestRequisition', RESEED, 0);

delete from AllAbnormalDataTable
DBCC CHECKIDENT ('AllAbnormalDataTable', RESEED, 0);

delete from Lab_Mst_Gov_Report_Items
DBCC CHECKIDENT ('Lab_Mst_Gov_Report_Items', RESEED, 0);

delete from LAB_LabTestsWithCorrectedCategory
DBCC CHECKIDENT ('LAB_LabTestsWithCorrectedCategory', RESEED, 0);

delete from PAT_PatientGurantorInfo
DBCC CHECKIDENT ('PAT_PatientGurantorInfo', RESEED, 0);

delete from PAT_PatientMembership
DBCC CHECKIDENT ('PAT_PatientMembership', RESEED, 0);

delete from BIL_TXN_InvoiceReturnItems
DBCC CHECKIDENT ('BIL_TXN_InvoiceReturnItems', RESEED, 0);

delete from BIL_TXN_InvoiceReturn
DBCC CHECKIDENT ('BIL_TXN_InvoiceReturn', RESEED, 0);

delete from BIL_TXN_Deposit
DBCC CHECKIDENT ('BIL_TXN_Deposit', RESEED, 0);

delete from  TXN_EmpCashTransaction
DBCC CHECKIDENT ('TXN_EmpCashTransaction', RESEED, 0);

delete from BIL_TXN_Denomination
DBCC CHECKIDENT ('BIL_TXN_Denomination', RESEED, 0);

delete from CLN_KV_PatientClinical_Info
DBCC CHECKIDENT ('CLN_KV_PatientClinical_Info', RESEED, 0);

delete from ACC_Ledger_Mapping
DBCC CHECKIDENT ('ACC_Ledger_Mapping', RESEED, 0);

delete from BIL_MST_Handover
DBCC CHECKIDENT ('BIL_MST_Handover', RESEED, 0);

delete from UpdatedBillItemPriceTable
DBCC CHECKIDENT ('UpdatedBillItemPriceTable', RESEED, 0);

delete from BIL_TEMP_CFGBillItemPrice_7Sept
DBCC CHECKIDENT ('BIL_TEMP_CFGBillItemPrice_7Sept', RESEED, 0);

delete from RAD_PatientImagingReport
DBCC CHECKIDENT ('RAD_PatientImagingReport', RESEED, 0);

delete from RAD_PatientImagingRequisition
DBCC CHECKIDENT ('RAD_PatientImagingRequisition', RESEED, 0);

delete from ADT_TXN_PatientBedInfo
DBCC CHECKIDENT ('ADT_TXN_PatientBedInfo', RESEED, 0);

delete from ADT_PatientAdmission
DBCC CHECKIDENT ('ADT_PatientAdmission', RESEED, 0);

delete from CLN_InputOutput
DBCC CHECKIDENT ('CLN_InputOutput', RESEED, 0);

delete from CLN_PatientVitals
DBCC CHECKIDENT ('CLN_PatientVitals', RESEED, 0);

delete from CLN_Notes
DBCC CHECKIDENT ('CLN_Notes', RESEED, 0);

delete from INCTV_TXN_IncentiveFractionItem
DBCC CHECKIDENT ('INCTV_TXN_IncentiveFractionItem', RESEED, 0);

delete from TXN_PrintInformation
DBCC CHECKIDENT ('TXN_PrintInformation', RESEED, 0);

delete from BIL_SYNC_BillingAccounting
DBCC CHECKIDENT ('BIL_SYNC_BillingAccounting', RESEED, 0);

delete from PHRM_PurchaseOrder
DBCC CHECKIDENT ('PHRM_PurchaseOrder', RESEED, 0);

delete from PHRM_PurchaseOrderItems
DBCC CHECKIDENT ('PHRM_PurchaseOrderItems', RESEED, 0);

delete from PHRM_GoodsReceipt
DBCC CHECKIDENT ('PHRM_GoodsReceipt', RESEED, 0);

delete from PHRM_GoodsReceiptItems
DBCC CHECKIDENT ('PHRM_GoodsReceiptItems', RESEED, 0);

delete from PHRM_DispensaryStock
DBCC CHECKIDENT ('PHRM_DispensaryStock', RESEED, 0);

delete from INV_FiscalYearStock
DBCC CHECKIDENT ('INV_FiscalYearStock', RESEED, 0);

delete from INV_TXN_StockTransaction
DBCC CHECKIDENT ('INV_TXN_StockTransaction', RESEED, 0);

delete from WARD_INV_Transaction
DBCC CHECKIDENT ('WARD_INV_Transaction', RESEED, 0);

delete from INV_TEMP_TXN_NewStockTxn
DBCC CHECKIDENT ('INV_TEMP_TXN_NewStockTxn', RESEED, 0);

delete from INV_TXN_DispatchItems
DBCC CHECKIDENT ('INV_TXN_DispatchItems', RESEED, 0);

delete from INV_TXN_RequisitionItems
DBCC CHECKIDENT ('INV_TXN_RequisitionItems', RESEED, 0);

delete from INV_TXN_Requisition
DBCC CHECKIDENT ('INV_TXN_Requisition', RESEED, 0);

delete from WARD_INV_Stock
DBCC CHECKIDENT ('WARD_INV_Stock', RESEED, 0);

delete from WARD_INV_Consumption
DBCC CHECKIDENT ('WARD_INV_Consumption', RESEED, 0);

delete from INV_TXN_GoodsReceiptItems
DBCC CHECKIDENT ('INV_TXN_GoodsReceiptItems', RESEED, 0);

delete from INV_TXN_Stock
DBCC CHECKIDENT ('INV_TXN_Stock', RESEED, 0);

delete from ACC_Ledger_2076_77_2
DBCC CHECKIDENT ('ACC_Ledger_2076_77_2', RESEED, 0);

delete from ACC_LedgerCharak$
DBCC CHECKIDENT ('ACC_LedgerCharak$', RESEED, 0);

delete from PAT_NeighbourhoodCardDetail
DBCC CHECKIDENT ('PAT_NeighbourhoodCardDetail', RESEED, 0);

delete from PAT_PatientVisits
DBCC CHECKIDENT ('PAT_PatientVisits', RESEED, 0);

delete from PAT_Patient where PatientId>0
DBCC CHECKIDENT ('PAT_Patient', RESEED, 0);

delete from BIL_TXN_BillingTransaction
DBCC CHECKIDENT ('BIL_TXN_BillingTransaction', RESEED, 0);

end try

begin catch

ALTER INDEX [UK_BillingCounterName_Type]ON BIL_CFG_Counter REBUILD
ALTER INDEX [UK_BIL_CFG_FiscalYears] ON BIL_CFG_FiscalYears REBUILD
ALTER INDEX [UQ__CLN_EyeS__D7A3AA55BC800205] ON CLN_EyeScanImages REBUILD
ALTER INDEX [UQ__CLN_MST___4D3AA1DF8A330DC6] ON CLN_MST_EYE REBUILD
ALTER INDEX [UQ__CLN_PAT___D7A3AA5567EF1EDE] ON CLN_PAT_Images REBUILD
ALTER TABLE ER_Patient ENABLE TRIGGER [Emergency_PoliceCase_NotificatiONTrigger]
ALTER INDEX [UniqueOperatiONName] ON MR_MST_OperatiONType REBUILD
ALTER INDEX [UK_Membership_Community] ON PAT_CFG_MembershipType REBUILD
ALTER INDEX [UQ__PAT_Pati__D7A3AA55F0F539DA] ON PAT_PatientFiles REBUILD
ALTER INDEX [IX_TblPatInsuranceInfo_PatientId] ON PAT_PatientInsuranceInfo REBUILD
ALTER INDEX[UK_PHRM_CFG_FiscalYear] ON PHRM_CFG_FiscalYears REBUILD
ALTER TABLE PHRM_StockTxnItems ENABLE TRIGGER [TR_PHRM_StockTxnItems_MRPUpdateHistory]
ALTER TABLE PHRM_StockTxnItems ENABLE TRIGGER [TR_PHRM_StockTxnItems_UpdateStock]
ALTER TABLE PHRM_TXN_InvoiceItems ENABLE TRIGGER [TRG_PHRM_TXN_InvoiceItems_UpdateGRItemPrice]
ALTER TABLE LAB_TestRequisition ENABLE TRIGGER [PRINT_UpdateTrigger]
ALTER INDEX [Unique_Gov_Lab_ReportItem_Name] ON Lab_Mst_Gov_Report_Items REBUILD
ALTER INDEX [Unique_Gov_Lab_ReportItem_SerialNumber] ON Lab_Mst_Gov_Report_Items REBUILD
ALTER INDEX [IX_TblBilDeposit_VisitId] ON BIL_TXN_Deposit DISABLE
ALTER INDEX [IX_TblPatientBedInfo_VisitId] ON ADT_TXN_PatientBedInfo REBUILD
ALTER INDEX [IX_TblAdmission_IsInsurancePatient] ON ADT_PatientAdmission REBUILD
ALTER INDEX [IX_TblAdmission_VisitId_PatientId]  ON ADT_PatientAdmission REBUILD
ALTER INDEX [IX_INCTV_TXN_IncentiveFractionItem_BillingTransactionItemId] ON INCTV_TXN_IncentiveFractionItem REBUILD
ALTER INDEX [IX_INCTV_TXN_IncentiveFractionItem_IncentiveReceiverId]  ON INCTV_TXN_IncentiveFractionItem REBUILD
ALTER INDEX [UK_IncentiveFractionItems] ON INCTV_TXN_IncentiveFractionItem REBUILD
ALTER TABLE BIL_SYNC_BillingAccounting ENABLE TRIGGER [TRG_BillToAcc_BillSync]
ALTER INDEX [IX_TblVisit_HasInsurance_VisitDate]  ON PAT_PatientVisits REBUILD
ALTER INDEX [IX_TblVisit_PatientId]  ON PAT_PatientVisits REBUILD
ALTER INDEX [IX_TblVisits_ClaimCode]  ON PAT_PatientVisits REBUILD
ALTER TABLE PAT_PatientVisits DISABLE TRIGGER [PAT_PatientVisits_NotificationTrigger]
ALTER INDEX [IX_BIL_BillingTransaction_CreatedOn]  ON BIL_TXN_BillingTransaction REBUILD
ALTER INDEX [IX_TblBilTxn_FiscalYearId_InvoiceNo]  ON BIL_TXN_BillingTransaction REBUILD
ALTER TABLE BIL_TXN_BillingTransaction DISABLE TRIGGER TRG_BillingTransaction_RestrictBillAlter

end catch


ALTER INDEX [UK_BillingCounterName_Type]ON BIL_CFG_Counter REBUILD
ALTER INDEX [UK_BIL_CFG_FiscalYears] ON BIL_CFG_FiscalYears REBUILD
ALTER INDEX [UQ__CLN_EyeS__D7A3AA55BC800205] ON CLN_EyeScanImages REBUILD
ALTER INDEX [UQ__CLN_MST___4D3AA1DF8A330DC6] ON CLN_MST_EYE REBUILD
ALTER INDEX [UQ__CLN_PAT___D7A3AA5567EF1EDE] ON CLN_PAT_Images REBUILD
ALTER TABLE ER_Patient ENABLE TRIGGER [Emergency_PoliceCase_NotificatiONTrigger]
ALTER INDEX [UniqueOperatiONName] ON MR_MST_OperatiONType REBUILD
ALTER INDEX [UK_Membership_Community] ON PAT_CFG_MembershipType REBUILD
ALTER INDEX [UQ__PAT_Pati__D7A3AA55F0F539DA] ON PAT_PatientFiles REBUILD
ALTER INDEX [IX_TblPatInsuranceInfo_PatientId] ON PAT_PatientInsuranceInfo REBUILD
ALTER INDEX[UK_PHRM_CFG_FiscalYear] ON PHRM_CFG_FiscalYears REBUILD
ALTER TABLE PHRM_StockTxnItems ENABLE TRIGGER [TR_PHRM_StockTxnItems_MRPUpdateHistory]
ALTER TABLE PHRM_StockTxnItems ENABLE TRIGGER [TR_PHRM_StockTxnItems_UpdateStock]
ALTER TABLE PHRM_TXN_InvoiceItems ENABLE TRIGGER [TRG_PHRM_TXN_InvoiceItems_UpdateGRItemPrice]
ALTER TABLE LAB_TestRequisition ENABLE TRIGGER [PRINT_UpdateTrigger]
ALTER INDEX [Unique_Gov_Lab_ReportItem_Name] ON Lab_Mst_Gov_Report_Items REBUILD
ALTER INDEX [Unique_Gov_Lab_ReportItem_SerialNumber] ON Lab_Mst_Gov_Report_Items REBUILD
ALTER INDEX [IX_TblBilDeposit_VisitId] ON BIL_TXN_Deposit DISABLE
ALTER INDEX [IX_TblPatientBedInfo_VisitId] ON ADT_TXN_PatientBedInfo REBUILD
ALTER INDEX [IX_TblAdmission_IsInsurancePatient] ON ADT_PatientAdmission REBUILD
ALTER INDEX [IX_TblAdmission_VisitId_PatientId]  ON ADT_PatientAdmission REBUILD
ALTER INDEX [IX_INCTV_TXN_IncentiveFractionItem_BillingTransactionItemId] ON INCTV_TXN_IncentiveFractionItem REBUILD
ALTER INDEX [IX_INCTV_TXN_IncentiveFractionItem_IncentiveReceiverId]  ON INCTV_TXN_IncentiveFractionItem REBUILD
ALTER INDEX [UK_IncentiveFractionItems] ON INCTV_TXN_IncentiveFractionItem REBUILD
ALTER TABLE BIL_SYNC_BillingAccounting ENABLE TRIGGER [TRG_BillToAcc_BillSync]
ALTER INDEX [IX_TblVisit_HasInsurance_VisitDate]  ON PAT_PatientVisits REBUILD
ALTER INDEX [IX_TblVisit_PatientId]  ON PAT_PatientVisits REBUILD
ALTER INDEX [IX_TblVisits_ClaimCode]  ON PAT_PatientVisits REBUILD
ALTER TABLE PAT_PatientVisits DISABLE TRIGGER [PAT_PatientVisits_NotificationTrigger]
ALTER INDEX [IX_BIL_BillingTransaction_CreatedOn]  ON BIL_TXN_BillingTransaction REBUILD
ALTER INDEX [IX_TblBilTxn_FiscalYearId_InvoiceNo]  ON BIL_TXN_BillingTransaction REBUILD
ALTER TABLE BIL_TXN_BillingTransaction DISABLE TRIGGER TRG_BillingTransaction_RestrictBillAlter

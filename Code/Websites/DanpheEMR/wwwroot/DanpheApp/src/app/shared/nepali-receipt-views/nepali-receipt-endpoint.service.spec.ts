import { TestBed } from '@angular/core/testing';

import { NepaliReceiptEndpointService } from './nepali-receipt-endpoint.service';

describe('NepaliReceiptEndpointService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NepaliReceiptEndpointService = TestBed.get(NepaliReceiptEndpointService);
    expect(service).toBeTruthy();
  });
});

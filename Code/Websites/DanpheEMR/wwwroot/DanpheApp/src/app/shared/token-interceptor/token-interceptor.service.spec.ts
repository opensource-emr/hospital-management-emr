import { TestBed } from '@angular/core/testing';

import { TokenInterceptorService } from './token-interceptor.service';

describe('TokenInterceptorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TokenInterceptorService = TestBed.get(TokenInterceptorService);
    expect(service).toBeTruthy();
  });
});

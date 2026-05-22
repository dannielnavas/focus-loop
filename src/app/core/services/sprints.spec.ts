import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Sprints } from './sprints';

describe('Sprints', () => {
  let service: Sprints;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(Sprints);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

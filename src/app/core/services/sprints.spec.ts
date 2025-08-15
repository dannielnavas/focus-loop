import { TestBed } from '@angular/core/testing';

import { Sprints } from './sprints';

describe('Sprints', () => {
  let service: Sprints;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sprints);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

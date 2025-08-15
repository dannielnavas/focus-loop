import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sprints } from './sprints';

describe('Sprints', () => {
  let component: Sprints;
  let fixture: ComponentFixture<Sprints>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sprints]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sprints);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

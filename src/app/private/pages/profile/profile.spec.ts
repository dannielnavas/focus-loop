import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Profile } from './profile';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Profile, FormsModule],
      providers: [{ provide: Router, useValue: mockRouter }],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.profileForm().full_name).toBe('');
    expect(component.profileForm().email).toBe('');
    expect(component.profileForm().role).toBe('user');
    expect(component.profileForm().subscription_plan_id).toBe('free');
  });

  it('should validate form correctly', () => {
    // Form should be invalid initially
    expect(component.isFormValid()).toBe(false);

    // Set valid values
    component.profileForm.set({
      full_name: 'John Doe',
      email: 'john@example.com',
      profile_image: '',
      role: 'user',
      subscription_plan_id: 'free',
    });

    expect(component.isFormValid()).toBe(true);
  });

  it('should validate password form correctly', () => {
    // Password form should be invalid initially
    expect(component.isPasswordFormValid()).toBe(false);

    // Set valid password values
    component.passwordForm.set({
      current_password: 'oldpass',
      new_password: 'newpass123',
      confirm_password: 'newpass123',
    });

    expect(component.isPasswordFormValid()).toBe(true);
  });

  it('should show error when passwords do not match', () => {
    component.passwordForm.set({
      current_password: 'oldpass',
      new_password: 'newpass123',
      confirm_password: 'differentpass',
    });

    expect(component.isPasswordFormValid()).toBe(false);
  });

  it('should reset form correctly', () => {
    // Set some values
    component.profileForm.set({
      full_name: 'Test User',
      email: 'test@example.com',
      profile_image: '',
      role: 'admin',
      subscription_plan_id: 'premium',
    });

    component.passwordForm.set({
      current_password: 'test',
      new_password: 'test123',
      confirm_password: 'test123',
    });

    // Reset form
    component.resetForm();

    // Check that form is reset
    expect(component.profileForm().full_name).toBe('');
    expect(component.passwordForm().current_password).toBe('');
  });

  it('should show message correctly', () => {
    component.showMessage('Test message', 'success');

    expect(component.message()).toBe('Test message');
    expect(component.messageType()).toBe('success');
  });

  it('should navigate back when goBack is called', () => {
    component.goBack();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/private']);
  });
});

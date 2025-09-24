import { Login as LoginService } from '@/core/services/login';
import { StorageService } from '@/core/services/storage.service';
import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export default class Login implements OnInit {
  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly storage = inject(StorageService);

  session = computed(() => this.storage.getToken());
  showPassword = signal(false);

  formLogin!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    effect(() => {
      if (this.session() && this.session() !== 'undefined') {
        this.router.navigate(['/private']);
      }
    });
  }
  ngOnInit(): void {
    this.initForm();
  }

  login() {
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      this.formLogin.updateValueAndValidity();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.loginService.login(this.formLogin.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.storage.setToken(res.access_token);
        this.storage.setUserData(res.user);
        this.router.navigate(['/private']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);

        // Set error message based on the error response
        if (err.status === 401) {
          this.errorMessage = 'Invalid email or password. Please try again.';
        } else if (err.status === 0) {
          this.errorMessage =
            'Network error. Please check your connection and try again.';
        } else if (err.status >= 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      },
    });
  }

  private initForm() {
    this.formLogin = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(255),
        ],
      ],
      password: ['', [Validators.required]],
    });
  }
  togglePasswordVisibility() {
    this.showPassword.update((prev) => !prev);
  }
}

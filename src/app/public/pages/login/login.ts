import { Login as LoginService } from '@/core/services/login';
import { Component, computed, effect, inject, OnInit } from '@angular/core';
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
  session = computed(() => localStorage.getItem('token'));

  formLogin!: FormGroup;

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

    this.loginService.login(this.formLogin.value).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('user_id', res.user.user_id.toString());
        localStorage.setItem('user_name', res.user.full_name);
        localStorage.setItem('user_email', res.user.email);
        this.router.navigate(['/private']);
      },
      error: (err) => {
        console.error(err);
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
}

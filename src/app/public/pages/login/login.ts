import { Login as LoginService } from '@/core/services/login';
import { Component, inject, OnInit } from '@angular/core';
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

  formLogin!: FormGroup;

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
        console.log(res);
        this.router.navigate(['/private']);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  private initForm() {
    this.formLogin = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }
}

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export default class Login {
  private readonly router = inject(Router);

  login() {
    this.router.navigate(['/private']);
  }
}

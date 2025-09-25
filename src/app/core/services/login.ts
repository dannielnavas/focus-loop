import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Auth, LoginResponse } from '../models/auth.model';
import { CreateUser } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class Login {
  private readonly http = inject(HttpClient);

  login(auth: Auth) {
    return this.http.post<LoginResponse>(
      'https://focus-loop-api.danniel.dev/auth/login',
      auth
    );
  }

  register(user: CreateUser) {
    return this.http.post<CreateUser>(
      'https://focus-loop-api.danniel.dev/users',
      user
    );
  }
}

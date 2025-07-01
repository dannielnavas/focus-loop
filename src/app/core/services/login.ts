import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Auth } from '../models/auth.model';
import { CreateUser } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class Login {
  private readonly http = inject(HttpClient);

  login(auth: Auth) {
    return this.http.post<Auth>('http://localhost:3000/auth/login', auth);
  }

  register(user: CreateUser) {
    return this.http.post<CreateUser>('http://localhost:3000/users', user);
  }
}

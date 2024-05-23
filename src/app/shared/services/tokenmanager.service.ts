import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenmgrService {

  constructor() { }

  // retrieving a token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // retrieving the username
  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  // checking if the user is logged
  isLoggedIn(): boolean {
    if (localStorage!== null && localStorage.getItem('token'))
      return true;
    else
      return false;
  }
}

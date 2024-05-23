import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { config } from '../models/config';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient,
              private router: Router) { }
  
  /**
   * Initiates the login process by sending a request to the server with provided credentials.
   * @param username The username for login.
   * @param password The password for login.
   * @returns An observable that resolves to an HTTP response containing the token.
   */
  login(username: string, password: string): Observable<HttpResponse<any>> {
    // debug
    console.log('Login works for the moment.');
    const url = `${config.base_url}/users/login?username=${username}&password=${password}`;

    // setting the parameters
    const params = new HttpParams()
      .set('username', username)
      .set('password', password);

    // get request
    return this.http.get(`${config.base_url}/users/login`, { observe: 'response', params });
  }
}

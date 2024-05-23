import { Injectable } from '@angular/core';
import { config } from '../models/config';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // importing the http client
  constructor(private http: HttpClient) {}
  
  /**
   * Registers a new user by sending a POST request to the server with user data.
   * @param username The username for registration.
   * @param password The password for registration.
   * @param email The email for registration.
   * @returns An observable that resolves to an HTTP response.
   */
  register(username: string, password: string, email: string) {
    // debug
    console.log(username);

    // setting the user data
    const data = { username, password, email };

    // sending the post request
    return this.http.post(`${config.base_url}/users`, data, {observe: 'response' });
  }  
}

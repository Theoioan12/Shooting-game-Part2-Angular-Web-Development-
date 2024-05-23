import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../shared/services/user.service';
import { TokenmgrService } from '../shared/services/tokenmanager.service';
import { LoginService } from '../shared/services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  username!: string;
  password!: string;
  token!: string;

  constructor (private userService: LoginService,
                private tokenManagerService: TokenmgrService,
                private router: Router) {};

  // logout function
  logout() {
    // deleting the token
    localStorage.removeItem('token');

    // also deleting the username from the local storage
    localStorage.removeItem('username'); 

    // debug
    console.log("deleted");

    // sending an alert
    alert("You have been logged out.");

    // going back to home
    this.router.navigate(['/home']);
  }
  
  // local isLoggedIn
  isLoggedIn(): boolean {
    return this.tokenManagerService.isLoggedIn(); 
  }
  
  // the actual login function
  sendit() {
    // check if there is any user logged
    if (!this.isLoggedIn()) {
      // using the service
      this.userService.login(this.username, this.password).subscribe(
        // processing the response
        response => {
          // getting the token
          this.token = response.headers.get("Authorization")!;
          
          // saving it
          localStorage.setItem('token', this.token);

          // saving the username
          localStorage.setItem('username', this.username);

          alert('Login done successfully.'); // alert
          this.router.navigate(['/home']); // redirecting to home
        },

        // error
        error => {
          console.error("Login error:", error);
          alert("ERROR: login failed.");
        }

        // in case the user is already logged
    ); } else {
      alert("Error: You are already logged in!");
    }
  }
}

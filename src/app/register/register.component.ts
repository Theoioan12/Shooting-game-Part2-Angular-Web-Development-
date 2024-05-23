import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../shared/services/user.service';
import { TokenmgrService } from '../shared/services/tokenmanager.service';
import { HttpClient } from '@angular/common/http';
import { config } from '../shared/models/config';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent {
  
  constructor (private userService: UserService,
              private tokenManagerService: TokenmgrService,
              private http:HttpClient) {};

  // the fields
  username!: string;
  email!: string;
  password!: string;
  repeatPassword!: string;
  
  // function to perform the actual registration
  sendit() { 
    // Checking if the user is logged in
    if (this.tokenManagerService.isLoggedIn()) {
      alert(
        'ERROR: You are already logged in!\nLogout in order to register a new user.'
      );
      return;

    } else {
      // calling the service
      this.userService.register(this.username, this.password, this.email).subscribe({
        // processing the response
        next: (response) => {
          console.log('registration succesfful!'); // debug
          alert('User registration successful'); // alert
        },

        // in case of errors
        error: (error) => {
          console.error('Registration error:', error);
        }
      });
    }
  }   

  // checking the email also
  checkEmailFormat() {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(this.email)) {  
      console.log('Invalid email format');
    }
  }

  // if the passwords do not match
  checkPasswordMatch() {
    if (this.password !== this.repeatPassword) {
      console.log('Passwords do not match');
      alert('Password does not match.')
    }
  }

  // checking the usename
  checkUsername() {
    if (this.username) {
      // get request
      this.http.get(`${config.base_url}/users/${this.username}`, {observe: 'response' })
        .subscribe({
          next: (response) => {
            // processing the response
            if(response.status !== 200){
              alert('ERROR: username taken!'); // sending the alert
              console.log("ERROR"); // debug
            }
          },
      });

      // debug
    } else {
      console.log("Waiting for an username");
    }
  }
}

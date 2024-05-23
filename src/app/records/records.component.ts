import { Component } from '@angular/core';
import { ScoresService } from '../shared/services/scores.service';

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrl: './records.component.css'
})

export class RecordsComponent {
  topRecords: any[] = []; // top records generally
  finalScore: number = 0; // getting the final score for the current user
  userRecords: any[] = []; // user top records

  constructor(private scoresService: ScoresService) { }

  ngOnInit(): void {
    this.fetchTopRecords();
    this.finalScore = this.scoresService.getFinalScore();
    this.fetchUserRecords();
  }

  // function to get the first 10 records in general
  fetchTopRecords() {
    // using the servixe
    this.scoresService.getRecords().subscribe(
      (data: any[]) => {
        // if there are more than 10 records, display only the top 10
        this.topRecords = data.slice(0, 10);
      },
      // error
      (error) => {
        console.error('Error fetching records:', error);
      }
    );
  }

  // function to get the current user records
  fetchUserRecords() {
    // used the if for bugs in angular
    if (typeof localStorage !== 'undefined') {
      // getting the username from the localstorage
      // it was more familiar this way,
      // I encountered some bugs when using services
      const user = localStorage.getItem('username');
      const token = localStorage.getItem('token');

      // checking they are not null
      if(user && token){
        // calling the service
        this.scoresService.getUserRecords(user, token)
        .subscribe(
          (userRecords: any[]) => {
            this.userRecords = userRecords;
          },

          // error
          error => {
            console.error('Error fetching records:', error);
          }
        );
      }
    }
  }
}

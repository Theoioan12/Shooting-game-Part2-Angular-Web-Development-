import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PreferencesService } from './preferences.service';

@Injectable({
  providedIn: 'root'
})
export class ScoresService {
  // server URL
  base_url = "http://wd.etsisi.upm.es:10000"

  constructor(private http: HttpClient,
              private preferencesService: PreferencesService) { }

  // returning the records
  getRecords() : Observable<any> {
    // get request
    return this.http.get(this.base_url + "/records");
  }

  // the final score
  private finalScore: number = 0;

  // setter
  setFinalScore(score: number) {
    this.finalScore = score;
  }

  // getter
  getFinalScore(): number {
    return this.finalScore;
  }

  // getting the records for the current user
  getUserRecords(username: string, token: string): Observable<any[]> {
    // authorization via token
    const headers = new HttpHeaders({
      'Authorization': token
    });

    // get request
    return this.http.get<any[]>(`${this.base_url}/records/${username}`, { headers });
  }

  // saving the user's scpre
  saveUserScore(token: string, username: string, score: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    });

    // doing the data body
    const body = {
      punctuation: score,
      ufos: this.preferencesService.getSelectedUFOs(), // number of UFOs the game had
      disposedTime: this.preferencesService.getSelectedTime() // the time the user had
    };
    
    // post request
    return this.http.post<any>(`${this.base_url}/records`, body, { headers });
  }
}

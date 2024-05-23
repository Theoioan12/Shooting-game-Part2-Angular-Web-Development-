import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  constructor() { }

  // game details
  private selectedUFOs: number = 1;
  private selectedTime: number = 60;

  /*
    getters and setters
    for each component
  */

  getSelectedUFOs(): number {
    return this.selectedUFOs;
  }

  setSelectedUFOs(value: number): void {
    this.selectedUFOs = value;
  }

  getSelectedTime(): number {
    return this.selectedTime;
  }

  setSelectedTime(value: number): void {
    this.selectedTime = value;
  } 
}

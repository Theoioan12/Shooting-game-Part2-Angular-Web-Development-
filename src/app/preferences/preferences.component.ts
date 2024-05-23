import { Component } from '@angular/core';
import { NgModel } from '@angular/forms';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PreferencesService } from '../shared/services/preferences.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrl: './preferences.component.css'
})

export class PreferencesComponent {
  selectedUFOs: number = 1; // default value for UFOs
  selectedTime: number = 60; // default value for time

  constructor(private router: Router,
              private preferencesService: PreferencesService) {}

  savePreferences(): void {
    // store preferences, this time using service, not local storage
    this.preferencesService.setSelectedUFOs(this.selectedUFOs);
    this.preferencesService.setSelectedTime(this.selectedTime);

    this.router.navigate(['/play']); // redirecting to play

    // sending an alert 
    alert("Preferences saved successfully!")
  }
}

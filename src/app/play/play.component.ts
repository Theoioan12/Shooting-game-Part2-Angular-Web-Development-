import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { PreferencesService } from '../shared/services/preferences.service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ScoresService } from '../shared/services/scores.service';
import { TokenmgrService } from '../shared/services/tokenmanager.service';
import { HttpClient } from '@angular/common/http';

// a helper class to manage the ufo
class UFO {
  image: HTMLImageElement;  // corresponding html pic
  direction: number;  // the direction it will go to

  // constructor
  constructor(img: HTMLImageElement, dir: number) {
    this.image = img;
    this.direction = dir;
  }

  // remove the ufos after the game is over
  remove(): void {
    if (this.image.parentNode) {
      this.image.parentNode.removeChild(this.image);
    }
  }
}

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrl: './play.component.css'
})

// the play component
export class PlayComponent implements OnInit {
  showStartMessage: boolean = true;
  hpos = 300; hstep = 5;
  vpos = 0;   vstep = 5;
  pid = 0;    triggered = false;
  timeLeft: number = 0;
  score: number = 0;

  // getting the time using the service
  playTime = this.preferencesService.getSelectedTime() || 120;

  ufos: UFO[] = []; // ufos array
  first = true; // this is used on initialision

  // getting the dimensions
  conf = {
    rLimit: 0,
    uLimit: 0
  };

  @ViewChild('missile') missile!: ElementRef;
  @ViewChild('points') points!: ElementRef;
  @ViewChild('time') time!: ElementRef;

  constructor(private preferencesService: PreferencesService,
            @Inject(PLATFORM_ID) private platformId: Object,
            private cdr: ChangeDetectorRef,
            private router: Router,
            private renderer: Renderer2,
            private scoresService: ScoresService,
            private tokenManagerService: TokenmgrService,
            private http: HttpClient
              ) { }

  ngOnInit() {
    // setting the limits
    if (isPlatformBrowser(this.platformId)) {
      this.conf.rLimit = window.innerWidth;
      this.conf.uLimit = window.innerHeight;
    }

    // setting the time
    this.timeLeft = this.playTime;  
  }

  ngAfterViewInit() {
    
  }
  
  // function to keep the time updated
  updateGameTimeDisplay() {
    // I chose to launch the UFOs here since it is called once
    // also used to avoid errors
    this.UFOlaunch();

    // the time is over
    if (this.timeLeft !== null) {
      // setting the element in html
      this.time.nativeElement.textContent = `${this.timeLeft} seconds`;

      // setting the interval
      const countdown = setInterval(() => {
        this.timeLeft -= 1; // decreasing time and updating
        this.time.nativeElement.textContent = `${this.timeLeft} seconds`;
        
        // stopping the counter when there is no more time
        if (this.timeLeft <= 0) {
          clearInterval(countdown);
          this.time.nativeElement.textContent = '';
          this.gameOver();
        }
      }, 1000);
    }
  }

  // function to end the game
  gameOver() {
    // checking if there were changes
    if (this.score > 0 && this.playTime > 0) {
      // calculating the final score according to game rules
      const divisor = Math.floor(this.playTime / 60);
      const ufosExceeding = this.ufos.length - this.preferencesService.getSelectedUFOs();
      const reduction = ufosExceeding > 1 ? 50 * (ufosExceeding - 1) : 0;

      this.score /= divisor;
      this.score -= reduction;

      // settig the score in element
      this.points.nativeElement.textContent = `Final Score: ${this.score}`;
      this.scoresService.setFinalScore(this.score);
    }

    // in case the user is logged
    if (this.tokenManagerService.isLoggedIn()) {
      // getting the username and the token
      const token = localStorage.getItem('token');
      const username = this.tokenManagerService.getUsername();
      
      // saving the scores
      this.scoresService.saveUserScore(token!, username!, this.score)
        .subscribe(
          () => {
            // debug
            console.log('Score saved successfully!');
          },
          (error: any) => {
            // debug
            console.error('Error saving score:', error);
          }
        );

    } else {
      console.log("No user logged in.")
    }

    // sending alerts depending on the user log in
    if (this.tokenManagerService.isLoggedIn()) {
      alert("Game over! Check your records!");
    }
    else {
      alert("Game over! Log in to save your records.")
    }

    // going to show records
    this.cdr.markForCheck(); 
    this.router.navigate(['/records']);  
  }

  /*
    Most of the following functions were taken from
    the lab and adapted to angular and to multiple UFos.
  */

  // moving the missile
  moveHorizontal(step: number) {
    this.hpos = this.hpos + step;
    this.missile.nativeElement.style.left = this.hpos + 'px';
  }

  // choosing directions for the missile
  @HostListener('document:keydown', ['$event'])
  keypressed(theEvent: KeyboardEvent) {
    switch (theEvent.key) {
      case 'ArrowRight': this.moveHorizontal(this.hstep); // right
                         break;

      case 'ArrowLeft':  this.moveHorizontal((-1) * this.hstep); // left
                         break;

      case ' ':          if (!this.triggered) {
                              this.showStartMessage = false;
                              console.log(this.playTime); // debug
                              this.triggered = true;

                              this.pid = window.setInterval(() => {this.trigger(); }, 15);

                              // activating the counter
                              if (this.first) {
                                this.first = false;
                                this.updateGameTimeDisplay();
                              }
                         }
                         break;
      }
  }

  newMissile() {
    this.vpos = 0;
    this.missile.nativeElement.style.bottom = this.vpos + 'px';
    this.triggered = false; 
  }

  // reducing scores in case there are missed UFOs
  reduceScoreForMissedUFOs() {
    this.score -= 25; // Reduce 25 points when missile misses all UFOs
    this.points.nativeElement.textContent = `Score: ${this.score}`;
  }

  // trigger missile
  trigger() {
    // first checking the limits
    if (this.vpos > this.conf.uLimit) {
      this.reduceScoreForMissedUFOs();
      clearInterval(this.pid);
      this.newMissile();

    } else {
      // setting the position
      this.vpos = this.vpos + this.vstep;
      this.missile.nativeElement.style.bottom = this.vpos + 'px';
  
      // check for collision with UFOs
      for (let i = 0; i < this.ufos.length; i++) {
        const ufo = this.ufos[i];

        if (this.detectCollision(ufo.image, this.missile.nativeElement)) {
          // change UFO image to explosion.gif
          if (ufo)
            ufo.image.src = '../../assets/imgs/explosion.gif';

        // update the score
        this.score += 100;
        this.points.nativeElement.textContent = `Score: ${this.score}`;

        // take the missile back to the initial position
        clearInterval(this.pid);
        this.newMissile();
  
          // set a timeout to change back to the original image after a delay
          setTimeout(() => {
            ufo.image.src = '../../assets/imgs/ufo.png';
          }, 1000); // change back after 1 second
        }
      }
    }
  }
  
  // collision detect function
  detectCollision(obj1: HTMLElement, obj2: HTMLElement): boolean {
    const rect1 = obj1.getBoundingClientRect();
    const rect2 = obj2.getBoundingClientRect();
    return !(
      rect1.top > rect2.bottom ||
      rect1.bottom < rect2.top ||
      rect1.left > rect2.right ||
      rect1.right < rect2.left
    );
  }
  
  // function to create a ufo
  createUFO(): HTMLImageElement {
    const ufo = this.renderer.createElement('img') as HTMLImageElement;
    ufo.src = "../../assets/imgs/ufo.png";
    ufo.style.position = "absolute";
    
    return ufo;
  }

  // function to randomly choose the direction
  chooseDirection(): number {
    return Math.random() > 0.5 ? 1 : -1;
  }

  // setting the positions
  setPosition(ufo: HTMLImageElement): HTMLImageElement {
    ufo.style.left = Math.random() * (window.innerWidth - 100) + "px";
    ufo.style.top = Math.random() * (window.innerHeight - 2 * 60 - 20) + "px";
    
    // when it reaches the end
    if (parseInt(ufo.style.top) < 100) {
      ufo.style.top = parseInt(ufo.style.top) + 60 + "px";
    }

    ufo.style.width = ufo.style.height = "60px";
    ufo.style.bottom = Math.random() * window.innerHeight + "px";

    return ufo;
  }

  // launch the UFOs
  UFOlaunch(): void {
    // set the number of UFOs according to preferences
    const numUFOs = this.preferencesService.getSelectedUFOs() || 1;

    // debug
    console.log('Number of UFOs:', numUFOs);

    // for each UFO
    for (let i = 0; i < numUFOs; i++) {
      const ufoImage = this.createUFO(); // create it

      // choose direction
      const ufo = new UFO(ufoImage, this.chooseDirection()); 
      
      // set positions
      this.setPosition(ufo.image);
      this.ufos.push(ufo);

      // adding it to the document
      document.body.appendChild(ufo.image);
      
      // debug for a succesful finish
      console.log('UFO created and positioned:', ufo);
    }

  // moving each ufo
  const ufoMoving = setInterval(() => {
    for (let i = 0; i < this.ufos.length; i++) {
      this.moveUFO(this.ufos[i]);
    }

    // when the time is over
    if (this.timeLeft <= 0) {
      clearInterval(ufoMoving);
      this.time.nativeElement.textContent = '';
    }
  }, 25);
}

  // move the ufo
  moveUFO(theUFO: UFO): void {
    // setting the limits
    const Rlimit = window.innerWidth;
    let hposUFO = parseInt(theUFO.image.style.left);
    const widthUFO = parseInt(theUFO.image.style.width);

    // when it reaches the end
    if (hposUFO + widthUFO + 8 > Rlimit || hposUFO < 0) {
      theUFO.direction = theUFO.direction * (-1);
    }

    // moving it
    hposUFO = hposUFO + theUFO.direction * 5;
    theUFO.image.style.left = hposUFO + "px";
  }

  // removing the ufo
  removeUFOs(): void {
    this.ufos.forEach(ufoElement => {
      ufoElement.remove();
    });
    this.ufos = []; // clear the array after removing
  }

  ngOnDestroy(): void {
    // remove UFOs when the component is destroyed
    this.removeUFOs();
  }
}

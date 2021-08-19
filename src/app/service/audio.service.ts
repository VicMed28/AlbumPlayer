import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  currentSong: any = null;
  constructor() { }

  playNewSong(url: string){
    if(this.currentSong != null)
      this.stopSong()

    this.currentSong = new Audio(url);
    this.currentSong.play();
  }

  pauseSong(){ this.currentSong.pause();  }

  resumeSong(){ this.currentSong.play(); }

  stopSong(){
      this.currentSong.pause();
      this.currentSong.currentTime = 0;
  }
}

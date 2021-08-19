import { Component, OnInit } from '@angular/core';

import { ApiService } from 'src/app/service/api.service';
import { AudioService } from 'src/app/service/audio.service';

import { Song } from 'src/app/interface/song';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  albumsArray = [];
  currentAlbum: any;
  albumNav = {
    current: 1,
    total: 0,
    collectionId: 0,
  }
  nowPlaying = false;
  songsArray: Song[] = [];
  current = {
    song: 0,
    name: '',
    track: 1,
    max: 0
  };

  constructor(private api: ApiService, private audio: AudioService){}

  ngOnInit(){ setTimeout(()=> this.getAllAlbums(), 0); }

  switchPlayingBtnStatus(){ this.nowPlaying = !this.nowPlaying; }

  playCurrentSong(){ /*This method will verify if we haven't played before a song*/
    if(!this.nowPlaying){ /*First, we have to check if is something playing right now*/
      if(this.audio.currentSong == null){ this.playFirstSongOfAlbum(); } /*if nothing's playing, we have to start the first song of the album*/
      else{ this.resumeSong(); } /*but if there is a current song, we have to resume it*/
    }else{ this.pauseSong(); } /*if something's playing, we have to pause it*/
  }

  /*Play the selected song from the table*/
  playSongImmediately(song: Song){
    if(this.audio.currentSong != null){ /*If there is another current song...*/
      if(this.audio.currentSong.src == song.previewUrl){ /*Is the same song currently and selected?*/
        if(this.nowPlaying){ this.pauseSong();} /*If so, verify if it's playing or not. If it's playing, pause it*/
        else{ this.resumeSong(); } /*if it's not playing, resume it*/
      }else{ this.playNewSong(song, false); } /*If it's not the same song, change it and save the new trackId*/
    }else{ this.playNewSong(song); } /*If there is no other current song, just play your song!*/
  }

  playPrevSong(){
    if(this.current.track > 1){ this.current.track--; }
    else{ this.current.track = this.current.max; }
    this.playNewSong(this.songsArray[this.current.track - 1], false)
  }

  playNextSong(){
    if(this.current.track < this.current.max){ this.current.track++; }
    else{ this.current.track = 1; }
    this.playNewSong(this.songsArray[this.current.track - 1], false)
  }

  playNewSong(song: Song, swap: boolean = true){
    /*Creates the media and assign the current song value to a var currentSong*/
    /*Also receives a swap flag, just to know if is a new song without changing the player icon*/
    this.audio.playNewSong(song.previewUrl);
    this.current.song = song.trackId;
    this.current.name = song.trackName;
    this.current.track = song.trackNumber;
    this.current.max = song.trackCount;

    if(swap) this.swapPlayingStatus();
    else{
      this.nowPlaying = true;
      this.swapTableButton();
    }

    let that = this;
    this.audio.currentSong.onended = ()=> that.pauseSong();
  }

  /*Reproduces new song with the first element of array*/
  playFirstSongOfAlbum(){ this.playNewSong(this.songsArray[0]) }

  swapPlayingStatus(){
    this.swapPlayerButton();
    this.swapTableButton();
  }

  pauseSong(){
    this.audio.pauseSong();
    this.swapPlayingStatus();
  }

  resumeSong(){
    this.audio.resumeSong();
    this.swapPlayingStatus();
  }

  swapPlayerButton(){ this.nowPlaying = !this.nowPlaying; }

  swapTableButton(){
    /*Set all the buttons to the play arrow*/
    this.pauseTheOtherPlayButtons();
    /*If the current song is playing, change the button icon on the table*/
    document.getElementById(this.current.song.toString())!.innerHTML = (this.nowPlaying) ? 'pause' : 'play_arrow' ;
  }

  pauseTheOtherPlayButtons(){
    /*Selects all the buttons from the table and set them on play arrow*/
    document.querySelectorAll('.tbl-play').forEach((button: any)=> button.innerHTML = 'play_arrow' );
  }


  previousAlbum(){
    if(this.albumNav.current > 1) { this.albumNav.current--; }
    else{ this.albumNav.current = this.albumNav.total }
    this.currentAlbum = this.albumsArray[this.albumNav.current -1]
    if(this.audio.currentSong != null){
      this.audio.stopSong();
    }
    this.nowPlaying = false;
    this.getAlbumSongs();
  }

  nextAlbum(){
    if(this.albumNav.current < this.albumNav.total) { this.albumNav.current++; }
    else{ this.albumNav.current = 1 }
    this.currentAlbum = this.albumsArray[this.albumNav.current -1]
    if(this.audio.currentSong != null){
      this.audio.stopSong();
      this.audio.currentSong = null;
    }
    this.nowPlaying = false;
    this.getAlbumSongs(); 
  }

  getAllAlbums(){
    /*This function gather all information about Evanescence's albums*/
    this.api.getAlbumsOf("evanescence").subscribe((res: any)=>{
      this.albumNav.total = res.resultCount;
      this.albumsArray = res.results;
      this.currentAlbum = this.albumsArray[this.albumNav.current -1]
      this.current.max = this.currentAlbum.trackCount;
      /*Once it gathers all albums, search for their songs*/
      this.getAlbumSongs();
    }, (error: any) => { console.warn(error) });
  }

  getAlbumSongs(){
    this.api.getSongsByAlbumId(this.currentAlbum.collectionId).subscribe((res: any)=>{
      this.songsArray = res.results.filter((song: Song)=> song.wrapperType == "track");
    },(error) => { this.songsArray = []; });
  }
}

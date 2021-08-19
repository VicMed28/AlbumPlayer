import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Song } from 'src/app/interface/song';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  url: string = 'https://itunes.apple.com/';

  constructor(private http: HttpClient) { }

  getAlbumsOf(artist:string) {
      return this.http.get(`${this.url}search?term=${artist.replace(' ','+')}&entity=album&attribute=allArtistTerm`);
  }

  getSongsByAlbumId(album: number){
    return this.http.get<Song>(`${this.url}lookup?id=${album}&entity=song`);
  }
}

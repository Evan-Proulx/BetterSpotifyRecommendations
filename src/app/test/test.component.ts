import {Component, OnInit} from '@angular/core';
import {SpotifyApiService} from "../SpotifyApiService/spotify-api.service";
import {FormsModule} from "@angular/forms";
import {ArtistListComponent} from "../artist-list/artist-list.component";
import {Artist} from "../models/artist";
import {NgForOf, NgIf} from "@angular/common";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {MatDrawer, MatDrawerContainer, MatDrawerContent} from "@angular/material/sidenav";
import {ArtistService} from "../ArtistService/artist.service";
import {Album} from "../models/album";
import {Track} from "../models/track";
import {AlbumListComponent} from "../album-list/album-list.component";
import {CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [
    FormsModule,
    ArtistListComponent,
    NgForOf,
    NgIf,
    MatFormField,
    MatInput,
    MatButton,
    MatDrawerContent,
    MatDrawer,
    MatDrawerContainer,
    AlbumListComponent,
    CdkDropList,
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent implements OnInit {
  searchText: string = "";
  selectedArtists: Artist[] = [];
  favoriteArtists: string[] = [];
  recommendedTracks: Track[] = [];
  recommendedAlbums: Album[] = [];


  private accessToken: string = "";
  private artistId: string = "";
  private artists: string[] = [];
  constructor(private spotifyService: SpotifyApiService,
              private artistService: ArtistService) { }

  ngOnInit(): void {
    //Gets the access token when the app first loads
    this.spotifyService.getToken().subscribe({
      next: (data) => {
        this.accessToken = data.access_token;
        console.log("TOKEN:", this.accessToken);
      },
      error: (error) => {
        console.error("ERROR FETCHING TOKEN: ", error);
      }
    });

    this.artistService.artistList$.subscribe(list => {
      this.favoriteArtists = list;
    })

  }

  //gets the artist id from the artist
  getArtist(): void {
    if (this.searchText){
      this.spotifyService.getArtist(this.searchText, this.accessToken).subscribe({
        next: (data) => {
          console.log(data.artists.items[0].id);
          this.artistId = data.artists.items[0].id;
          console.log(data)
          this.selectedArtists = data.artists.items.map((item: any) => new Artist(item));
        },
        error: (error) => {
          console.error("ERROR FETCHING ARTIST: ", error);
        }
      });
    }else{
      console.log("Please enter an artist name");
    }
  }

  //gets recommended tracks based on artists in given array
  getRecommendations(): void {
    this.spotifyService.getRecommendations(this.accessToken, this.favoriteArtists).subscribe({
      next: (data) => {
        console.log(data);
        this.recommendedTracks = data.tracks.map((item: any) => new Track(item));
        this.getAlbums();
      },
      error: (error) => {
        console.error("ERROR FETCHING RECOMMENDATIONS: ", error);
      }
    });
  }

  getAlbums(): void {
    this.recommendedTracks.forEach(track => {
      this.recommendedAlbums.push(track.album);
    })
    console.log(this.recommendedAlbums);
  }

  //needs user auth
  // getUserTopArtists(): void {
  //   this.spotifyService.getUserTopArtists(this.accessToken).subscribe({
  //     next: (data) => {
  //       console.log(data.artists.items[0].id);
  //       this.artistId = data.artists.items[0].id;
  //       console.log(data)
  //       this.selectedArtists = data.artists.items.map((item: any) => new Artist(item));
  //     },
  //     error: (error) => {
  //       console.error("ERROR FETCHING RECOMMENDATIONS: ", error);
  //     }
  //   });
  // }

}

import {Component, OnInit} from '@angular/core';
import {AlbumListComponent} from "../album-components/album-list/album-list.component";
import {ArtistListComponent} from "../artist-components/artist-list/artist-list.component";
import {NgForOf, NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Artist} from "../models/artist";
import {Track} from "../models/track";
import {Album} from "../models/album";
import {SpotifyApiService} from "../SpotifyApiService/spotify-api.service";
import {ArtistService} from "../artist-components/ArtistService/artist.service";
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {NavbarComponent} from "../navbar/navbar.component";

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [AlbumListComponent, ArtistListComponent, NgIf, ReactiveFormsModule, FormsModule, CdkDrag, CdkDropList, NgForOf, NavbarComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  //Default artist is needed for the drag and drop functionality
  defaultArtist: Artist = {
    id: '0',
    name: 'Default Artist',
    genres: ['Default Genre'],
    popularity: 0,
    followers: 0,
    externalUrl: 'https://default-url.com',
    images: [{url: '', height: 100, width: 100}],
    isFavorite: false
  };

  //This is shared with the album list(might be bad)
  accessToken: string = "";
  //text in the artist search bar
  searchText: string = "";
  //artists retrieved from the search
  selectedArtists: Artist[] = [];
  //artists that have been dropped from the selected artists
  draggedArtists = [this.defaultArtist];
  defaultArtistRemoved: boolean = false;
  //The ids of the dragged artists
  favoriteArtistsIds: string[] = [];
  //The tracks recommended
  recommendedTracks: Track[] = [];
  recommendedAlbums: Album[] = [];
  //Trending albums
  topAlbums: Album[] = [];

  //these are being used
  private artistId: string = "";
  private artists: string[] = [];

  constructor(private spotifyService: SpotifyApiService,
              private artistService: ArtistService) {
  }

  ngOnInit(): void {
    //Gets the access token when the app first loads
    this.spotifyService.getToken().subscribe({
      next: (data) => {
        this.accessToken = data.access_token;
        console.log("TOKEN:", this.accessToken);
        this.getTopAlbums();
      },
      error: (error) => {
        console.error("ERROR FETCHING TOKEN: ", error);
      }
    });
  }

  //gets the artist id from the artist
  getArtist(): void {
    if (this.searchText) {
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
    } else {
      console.log("Please enter an artist name");
    }
  }

  //gets recommended tracks based on artists in given array
  getRecommendations(): void {
    this.getArtistIds();
    this.spotifyService.getRecommendations(this.accessToken, this.favoriteArtistsIds).subscribe({
      next: (data) => {
        console.log(data);
        //remove items from recommendations
        this.resetDraggedArtists();
        //add retrieved data
        this.recommendedTracks = data.tracks.map((item: any) => new Track(item));
        this.getAlbums();
      },
      error: (error) => {
        console.error("ERROR FETCHING RECOMMENDATIONS: ", error);
      }
    });
  }

  //THis gets the trending tracks from spotify
  //These are shown when the app first loads
  getTopAlbums(): void {
    this.spotifyService.getTopAlbums(this.accessToken).subscribe({
      next: (data) => {
        console.log(data);
        this.recommendedAlbums = data.albums.items.map((item: any) => new Album(item));
      },
      error: (error) => {
        console.error("ERROR FETCHING RECOMMENDATIONS: ", error);
      }
    });
  }

  /**
   * Iterates through the recommended tracks and extracts the albums to populate the recommendedAlbums array.
   */
  getAlbums(): void {
    this.recommendedTracks.forEach(track => {
      this.recommendedAlbums.push(track.album);
    })
    console.log(this.recommendedAlbums);
  }

  //this function gets the ids of the artists in the dragged array
  //this is needed to get the recommended tracks
  getArtistIds(): void {
    this.draggedArtists.forEach(artist => {
      this.favoriteArtistsIds.push(artist.id);
    });
    console.log(this.favoriteArtistsIds);
  }

//deals with drag and drop functionality
  drop(event: CdkDragDrop<Artist[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
    this.manageDefaultArtist();
  }


  //Removes the default artist from the dragged artists array
  //The first item in the array is the popped to remove the default artist
  //Its bad but otherwise the drag and drop doesnt work properly
  //it is added back when all others are removed
  manageDefaultArtist(): void {
    if (!this.defaultArtistRemoved) {
      if (this.draggedArtists.length > 1) {
        this.draggedArtists.pop();
        this.defaultArtistRemoved = true;
      }
    } else if (this.draggedArtists.length === 0) {
      this.draggedArtists.push(this.defaultArtist);
      this.defaultArtistRemoved = false;
    }
  }

  //resets all recommendation values
  //this ensures duplicate values and invalid ids are not used in the call
  resetDraggedArtists(){
    this.draggedArtists = [this.defaultArtist];
    this.recommendedAlbums = [];
    this.recommendedTracks = [];
    this.favoriteArtistsIds = [];
    this.defaultArtistRemoved = false;
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


import {Component, Input} from '@angular/core';
import {Artist} from "../models/artist";
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {ArtistService} from "../ArtistService/artist.service";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-artist',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgForOf,
    NgIf,
    MatButton,
    MatIcon
  ],
  templateUrl: './artist.component.html',
  styleUrl: './artist.component.scss'
})
export class ArtistComponent {
  //single artist from the list
  @Input() contentArtist?: Artist;
  constructor(private artistService: ArtistService) { }

  toggleFavorite(artist: Artist) {
    artist.isFavorite = !artist.isFavorite;
    console.log(artist.isFavorite);
    this.artistService.addToArtistList(artist.id);
  }

}

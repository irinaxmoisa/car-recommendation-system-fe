import {Component, OnInit, ViewChild} from '@angular/core';
import { Car } from '../car';
import { CarService } from '../car.service';
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatTabGroup } from "@angular/material/tabs";
import { switchMap } from "rxjs";

@Component({
  selector: 'app-heroes',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit {
  cars: any[] = [];

  displayedColumns: string[] = ['Make', 'Model', 'HU', 'Fuel', 'Transmission', 'Power', 'Price', 'Actions']
  displayedColumnsRecommended: string[] = ['Make', 'Model', 'HU', 'Fuel', 'Transmission', 'Power', 'Price']

  likedCarIds: Set<string> = new Set();

  dataSourceBrowseCars = new MatTableDataSource<Car>([]);
  dataSourceSuggestedCars = new MatTableDataSource<Car>([]);

  // @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild('browsePaginator') browsePaginator!: MatPaginator;
  @ViewChild('suggestedPaginator') suggestedPaginator!: MatPaginator;

  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  suggestedCars: any[] = [];
  totalSuggestedItems: number = 0;

  suggestedPageIndex = 0;
  suggestedPageSize = 10;

  constructor(private carService: CarService) { }

  ngOnInit(): void {
    this.getCarsPaginated(this.pageIndex + 1, this.pageSize);
  }

  getCarsPaginated(page: number, limit: number): void {
    this.carService.getCarsPaginated(page, limit).subscribe(response => {
      this.cars = response.data;
      this.totalItems = response.total_items;

      setTimeout(() => {
        if (this.browsePaginator) {
          this.browsePaginator.length = this.totalItems;
          this.browsePaginator.pageIndex = page - 1;
        }
      }, 50);

      this.dataSourceBrowseCars.data = this.cars;
      this.dataSourceBrowseCars.paginator = this.browsePaginator;

    }, error => {
      console.error('Error loading cars:', error);
    });
  }

  onGetRecommendations(page: number = this.suggestedPageIndex + 1, limit: number = this.suggestedPageSize): void {

    this.suggestedPaginator.pageIndex = 0;
    this.suggestedPaginator.pageSize = this.suggestedPageSize;
    this.totalSuggestedItems = 0;

    this.carService.getRecommendations(Array.from(this.likedCarIds)).pipe(
      switchMap(recommendedIds => {
        return this.carService.getCarsByIdsPaginated(page, limit, recommendedIds);
      })
    ).subscribe((response: any) => {
      const cars = response.data;

      this.totalSuggestedItems = response.total_items;
      setTimeout(() => {
        if (this.suggestedPaginator) {
          this.suggestedPaginator.length = this.totalSuggestedItems;
          this.suggestedPaginator.pageIndex = page - 1;
        }
      }, 50);

      this.suggestedCars = cars;
      this.dataSourceSuggestedCars.data = this.suggestedCars;
      this.dataSourceSuggestedCars.paginator = this.suggestedPaginator;

      if (this.tabGroup) {
        this.tabGroup.selectedIndex = 1;
      }
    }, error => {
      console.error('Error processing recommendations:', error);
    });
  }

  isLiked(carId: string): boolean {
    return this.likedCarIds.has(carId);
  }

  get likedCarIdsAsArray(): string[] {
    return Array.from(this.likedCarIds);
  }

  toggleLike(carId: string): void {
    if (this.likedCarIds.has(carId)) {
      this.likedCarIds.delete(carId);
    } else {
      this.likedCarIds.add(carId);
    }
  }

  resetPaginationAndGetRecommendations(): void {
    this.suggestedPageIndex = 0;
    this.suggestedPageSize = 10;

    this.onGetRecommendations(this.suggestedPageIndex + 1, this.suggestedPageSize);
  }

  onPageChange(event: any): void {
    const page = event.pageIndex + 1;
    const limit = event.pageSize;
    if (page >= 1) {
      this.getCarsPaginated(page, limit);
    }
  }

  onSuggestedPageChange(event: any): void {
    const page = event.pageIndex + 1;
    const limit = event.pageSize;
    this.suggestedPageIndex = event.pageIndex;
    this.suggestedPageSize = event.pageSize;
    this.onGetRecommendations(page, limit);
  }

}

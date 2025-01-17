import {Component, OnInit, ViewChild} from '@angular/core';

import { Car } from '../car';
import { CarService } from '../car.service';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatTabGroup} from "@angular/material/tabs";
import {switchMap} from "rxjs";

@Component({
  selector: 'app-heroes',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit {
  cars: any[] = [];
  //displayedColumns: string[] = ['id', 'name', 'actions'];
  displayedColumns: string[] = ['Make', 'Model', 'HU', 'Fuel', 'Transmission', 'Power', 'Price', 'Actions']
  displayedColumnsRecommended: string[] = ['Make', 'Model', 'HU', 'Fuel', 'Transmission', 'Power', 'Price']

  likedCarIds: Set<string> = new Set();

  dataSource = new MatTableDataSource<Car>([]);
  dataSourceBrowseCars = new MatTableDataSource<Car>([]);
  dataSourceSuggestedCars = new MatTableDataSource<Car>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild('browsePaginator') browsePaginator!: MatPaginator;
  @ViewChild('suggestedPaginator') suggestedPaginator!: MatPaginator;

  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  // ids: string[] = [
  //   'eea24da9-9008-43db-b9d2-3d5a5702e7d4',
  //   '7be237a6-e6fe-42f4-8947-efc7307b0cbc',
  //   '544c4746-0652-40af-afbe-b47a0167273e'
  // ];

  constructor(private carService: CarService) { }

  ngOnInit(): void {
    //this.getAllCars();
    //this.getCarsByIds();
    this.getCarsPaginated(this.pageIndex + 1, this.pageSize);
    //this.getBrowseCars();
    //this.getSuggestedCars();
  }

  onPageChange(event: any): void {
    const page = event.pageIndex + 1;
    const limit = event.pageSize;
    if (page >= 1) {
      this.getCarsPaginated(page, limit);
    }
    console.log("PAGINATOR ", this.browsePaginator);
  }

  onSuggestedPageChange(event: any): void {
    const page = event.pageIndex + 1;
    const limit = event.pageSize;
    this.suggestedPageIndex = event.pageIndex;
    this.suggestedPageSize = event.pageSize;

    this.onGetRecommendations(page, limit);
  }


  getAllCars(): void {
    // this.carService.getAllCars()
    //   .subscribe(cars => {
    //     this.cars = cars;
    //     this.dataSource = new MatTableDataSource(cars);
    //     this.dataSource.paginator = this.paginator;
    //   });

    this.carService.getAllCars().subscribe(response => {
      this.cars = response;
      this.dataSourceBrowseCars.data = this.cars;
      this.dataSourceBrowseCars.paginator = this.browsePaginator;
      console.log('Cars loaded:', this.dataSourceBrowseCars.data);
    }, error => {
      console.error('Error loading cars:', error);
    });
  }

  // getCarsByIds(): void {
  //   this.carService.getCarsByIds(this.ids).subscribe(response => {
  //     this.cars = response;
  //     this.dataSourceBrowseCars.data = this.cars;
  //     this.dataSourceBrowseCars.paginator = this.browsePaginator;
  //     console.log('Cars loaded:', this.cars);
  //   }, error => {
  //     console.error('Error loading cars:', error);
  //   });
  // }

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

      console.log('Cars loaded:', this.totalItems);
    }, error => {
      console.error('Error loading cars:', error);
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
      this.likedCarIds.delete(carId); // Dacă ID-ul există deja, îl eliminăm
    } else {
      this.likedCarIds.add(carId); // Dacă nu există, îl adăugăm
    }

    console.log("MASINILE APRECIATE ", this.likedCarIds);
  }

  // getBrowseCars(): void {
  //   this.carService.getAllCars().subscribe(cars => {
  //     this.dataSourceBrowseCars.data = cars;
  //     this.dataSourceBrowseCars.paginator = this.browsePaginator;
  //   });
  // }

  // getSuggestedCars(): void {
  //   this.carService.getAllCars().subscribe(cars => {
  //     const suggestedCars = cars.filter(car => car);
  //     this.dataSourceSuggestedCars.data = suggestedCars;
  //     this.dataSourceSuggestedCars.paginator = this.suggestedPaginator;
  //   });
  // }

  // getHeroes(): void {
  //   this.carService.getHeroes()
  //   .subscribe(heroes => this.heroes = heroes);
  // }

  // add(name: string): void {
  //   name = name.trim();
  //   if (!name) { return; }
  //   this.carService.addHero({ name } as Car)
  //     .subscribe(hero => {
  //       this.heroes.push(hero);
  //     });
  // }
  //
  // delete(hero: Car): void {
  //   this.heroes = this.heroes.filter(h => h !== hero);
  //   this.carService.deleteHero(hero.id).subscribe();
  // }

  suggestedCars: any[] = [];
  totalSuggestedItems: number = 0;

  suggestedPageIndex = 0;
  suggestedPageSize = 10;

  onGetRecommendations(page: number = this.suggestedPageIndex + 1, limit: number = this.suggestedPageSize): void {
    //console.log("CATE SUNTETI ", this.likedCarIds)

    this.suggestedPaginator.pageIndex = 0; // Resetează indexul paginii la 0 (prima pagină)
    this.suggestedPaginator.pageSize = this.suggestedPageSize; // Setează dimensiunea paginii dacă este necesar
    this.totalSuggestedItems = 0;

    this.carService.getRecommendations(Array.from(this.likedCarIds)).pipe(
      switchMap(recommendedIds => {
        console.log('Recommendations received:', recommendedIds);
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


  resetPaginationAndGetRecommendations(): void {
    this.suggestedPageIndex = 0;
    this.suggestedPageSize = 10;

    this.onGetRecommendations(this.suggestedPageIndex + 1, this.suggestedPageSize);
  }


}

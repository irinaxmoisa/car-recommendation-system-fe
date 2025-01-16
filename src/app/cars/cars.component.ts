import {Component, OnInit, ViewChild} from '@angular/core';

import { Car } from '../car';
import { CarService } from '../car.service';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";

@Component({
  selector: 'app-heroes',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit {
  cars: Car[] = [];
  displayedColumns: string[] = ['id', 'name', 'actions'];

  dataSource = new MatTableDataSource<Car>([]);
  dataSourceBrowseCars = new MatTableDataSource<Car>([]);
  dataSourceSuggestedCars = new MatTableDataSource<Car>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild('browsePaginator') browsePaginator!: MatPaginator;
  @ViewChild('suggestedPaginator') suggestedPaginator!: MatPaginator;

  constructor(private carService: CarService) { }

  ngOnInit(): void {
    //this.getCars();
    this.getBrowseCars();
    this.getSuggestedCars();
  }

  getCars(): void {
    this.carService.getCars()
      .subscribe(cars => {
        this.cars = cars;
        this.dataSource = new MatTableDataSource(cars);
        this.dataSource.paginator = this.paginator;
      });
  }

  getBrowseCars(): void {
    this.carService.getCars().subscribe(cars => {
      this.dataSourceBrowseCars.data = cars;
      this.dataSourceBrowseCars.paginator = this.browsePaginator;
    });
  }

  getSuggestedCars(): void {
    this.carService.getCars().subscribe(cars => {
      const suggestedCars = cars.filter(car => car);
      this.dataSourceSuggestedCars.data = suggestedCars;
      this.dataSourceSuggestedCars.paginator = this.suggestedPaginator;
    });
  }

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

}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CarService {

  private apiUrlBackend = 'http://127.0.0.1:5001/api/cars';
  private apiUrlServer = 'http://127.0.0.1:5000/recommend';

  constructor(private http: HttpClient) { }

  getCarsPaginated(page: number, limit: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrlBackend}/paginated`, { params });
  }

  getCarsByIdsPaginated(page: number, limit: number, ids: string[]): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    const body = { ids };
    return this.http.post<any>(`${this.apiUrlBackend}/bulk/paginated`, body,{ params });
  }

  getRecommendations(carIds: string[]): Observable<string[]> {
    const url = `${this.apiUrlServer}`;
    return this.http.post<string[]>(url, { car_ids: carIds });
  }

}

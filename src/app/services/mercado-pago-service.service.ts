import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/evironment';

export interface PaymentRequest {
  title: string;
  description: string;
  price: number;
  quantity: number;
  currency: string;
  successUrl?: string;
  failureUrl?: string;
  pendingUrl?: string;
  externalReference?: string;
  items?: {
    id: string;
    title: string;
    description: string;
    categoryId: string;
    unitPrice: number;
    quantity: number;
    currencyId: string;
  }[];
}

export interface PaymentResponse {
  success: boolean;
  initPoint: string;
  sandboxInitPoint?: string;  // Añadido campo para sandbox
  error?: string;
  preferenceId: string;
}

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
  private apiUrl = `${environment.apiUrlMp}/mp`; // Corregido a /api/mp

  constructor(private http: HttpClient) { }

  createPayment(request: PaymentRequest): Observable<PaymentResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    console.log(`Enviando solicitud a ${this.apiUrl}/create`);
    return this.http.post<PaymentResponse>(`${this.apiUrl}/create`, request, { headers });
  }
}
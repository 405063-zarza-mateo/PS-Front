import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/evironment';

export interface DonationRequest {
  amount: number;
  description: string;
  payerEmail: string;
  payerName: string;
  customSuccessUrl?: string;
  customFailureUrl?: string;
  customPendingUrl?: string;
  externalReference?: string;
}

export interface DonationResponse {
  preferenceId: string;
  checkoutUrl: string;
  status: string;
  amount: number;
  description: string;
  payerEmail: string;
  payerName: string;
  externalReference?: string;
  createdAt: string;
  successUrl?: string;
  failureUrl?: string;
  pendingUrl?: string;
}

export interface PaymentStatusDto {
  paymentId: string;
  status: string;
  statusDetail?: string;
  amount?: number;
  currencyId?: string;
  payerEmail?: string;
  externalReference?: string;
  dateApproved?: string;
  dateCreated?: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
  private apiUrlUsers = `${environment.apiUrlUsersMp}/donation`;

  constructor(private http: HttpClient) { }

  /**
   * Crea una nueva donación en MercadoPago
   */
  createDonation(request: DonationRequest): Observable<DonationResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    console.log(`Enviando solicitud de donación a ${this.apiUrlUsers}`);
    return this.http.post<DonationResponse>(this.apiUrlUsers, request, { headers });
  }

  /**
   * Obtiene el estado de un pago por su ID
   */
  getPaymentStatus(paymentId: string): Observable<PaymentStatusDto> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log(`Consultando estado del pago: ${paymentId}`);
    return this.http.get<PaymentStatusDto>(`${this.apiUrlUsers}/status/${paymentId}`, { headers });
  }

  /**
   * Verifica el estado del servicio (health check)
   */
  healthCheck(): Observable<{ status: string; service: string; timestamp: string }> {
    return this.http.get<{ status: string; service: string; timestamp: string }>(
      `${this.apiUrlUsers}/health`
    );
  }

  /**
   * Método de conveniencia para crear donación con valores por defecto
   */
  createSimpleDonation(
    amount: number, 
    description: string, 
    payerEmail: string, 
    payerName: string,
    externalReference?: string
  ): Observable<DonationResponse> {
    const request: DonationRequest = {
      amount,
      description,
      payerEmail,
      payerName,
      externalReference
    };

    return this.createDonation(request);
  }

  /**
   * Método para crear donación con URLs personalizadas de callback
   */
  createDonationWithCustomUrls(
    amount: number,
    description: string,
    payerEmail: string,
    payerName: string,
    successUrl: string,
    failureUrl: string,
    pendingUrl: string,
    externalReference?: string
  ): Observable<DonationResponse> {
    const request: DonationRequest = {
      amount,
      description,
      payerEmail,
      payerName,
      customSuccessUrl: successUrl,
      customFailureUrl: failureUrl,
      customPendingUrl: pendingUrl,
      externalReference
    };

    return this.createDonation(request);
  }
}
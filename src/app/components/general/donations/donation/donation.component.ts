import { Component, OnInit } from '@angular/core';
import { MercadoPagoService, DonationRequest } from '../../../../services/mercado-pago-service.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/evironment';

@Component({
  selector: 'app-donation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donation.component.html',
  styleUrl: './donation.component.scss'
})
export class DonationComponent implements OnInit {
  donationAmount: number = 1000;
  customAmount: number | null = null;
  isCustomAmount: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  predefinedAmounts: number[] = [500, 1000, 2000, 5000];
  debugInfo: string | null = null;

  private donorInfo = {
    email: 'donante@ejemplo.com',
    name: 'Donante Anónimo' 
  };

  constructor(private mercadoPagoService: MercadoPagoService) { }

  ngOnInit(): void {
  }

  selectAmount(amount: number): void {
    this.donationAmount = amount;
    this.customAmount = null;
    this.isCustomAmount = false;
    this.error = null;
  }

  enableCustomAmount(): void {
    this.isCustomAmount = true;
    this.customAmount = null;
    this.error = null;
  }

  updateCustomAmount(event: any): void {
    const value = event.target.value;
    this.customAmount = value ? parseFloat(value) : null;
    if (this.customAmount && this.customAmount > 0) {
      this.donationAmount = this.customAmount;
    }
    this.error = null;
  }

  processDonation(): void {
    if (!this.donationAmount || this.donationAmount <= 0) {
      this.error = 'Por favor ingrese un monto válido';
      return;
    }

    this.loading = true;
    this.error = null;
    this.debugInfo = null;

    const timestamp = new Date().getTime();
    
    // CORREGIDO: No enviar URLs personalizadas - dejar que el backend use sus defaults
    const donationRequest: DonationRequest = {
      amount: this.donationAmount,
      description: `Donación a El Galponcito - $${this.donationAmount}`,
      payerEmail: this.donorInfo.email,
      payerName: this.donorInfo.name,
      externalReference: `DONACION-${timestamp}`
      // Eliminamos las URLs personalizadas para que el backend use las correctas
    };

    console.log('Enviando solicitud de donación:', donationRequest);

    this.mercadoPagoService.createDonation(donationRequest).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);

        if (response.checkoutUrl) {
          console.log(`Redirigiendo a MercadoPago: ${response.checkoutUrl}`);
          
          // Guardamos información de la donación en sessionStorage para después
          sessionStorage.setItem('donationInfo', JSON.stringify({
            preferenceId: response.preferenceId,
            amount: response.amount,
            externalReference: response.externalReference,
            timestamp: new Date().toISOString()
          }));

          // Redirigir a MercadoPago
          window.location.href = response.checkoutUrl;
        } else {
          this.error = 'No se recibió URL de pago válida';
          this.debugInfo = 'Respuesta: ' + JSON.stringify(response);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error en la solicitud:', err);

        let errorMsg = 'Error de conexión con el servidor';
        
        if (err.error) {
          if (err.error.message) {
            errorMsg = err.error.message;
          } else if (err.error.validationErrors) {
            const validationErrors = Object.values(err.error.validationErrors).join(', ');
            errorMsg = `Errores de validación: ${validationErrors}`;
          } else if (typeof err.error === 'string') {
            errorMsg = err.error;
          }
        } else if (err.message) {
          errorMsg = err.message;
        }

        this.error = errorMsg;
        this.debugInfo = `Status: ${err.status} - ${JSON.stringify(err.error)}`;
        this.loading = false;
      }
    });
  }

  checkServiceHealth(): void {
    this.mercadoPagoService.healthCheck().subscribe({
      next: (response) => {
        console.log('Estado del servicio:', response);
      },
      error: (err) => {
        console.error('Error al verificar el servicio:', err);
      }
    });
  }
}
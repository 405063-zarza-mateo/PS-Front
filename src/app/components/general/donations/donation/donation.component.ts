import { Component, OnInit } from '@angular/core';
import { MercadoPagoService, PaymentRequest } from '../../../../services/mercado-pago-service.service';
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

    // Añadimos timestamp al externalReference para hacerlo único
    const timestamp = new Date().getTime();

    // Configuramos las URLs de redirección directamente al frontend
    const frontendUrl =  'http://localhost:4200';
    
    const paymentRequest: PaymentRequest = {
      title: 'Donación a El Galponcito',
      description: 'Tu aporte ayuda a mejorar la educación de los niños en nuestra comunidad',
      price: this.donationAmount,
      quantity: 1,
      currency: 'ARS',
      externalReference: `DONACION-${timestamp}`,
      // Aseguramos que las URLs de redirección sean correctas
      successUrl: `${frontendUrl}/donation/success`,
      failureUrl: `${frontendUrl}/donation/failure`,
      pendingUrl: `${frontendUrl}/donation/pending`
    };

    console.log('Enviando solicitud de pago:', paymentRequest);

    this.mercadoPagoService.createPayment(paymentRequest).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);

        if (response.success) {
          // Usamos sandbox en entorno de desarrollo
          const redirectUrl = !environment.production && response.sandboxInitPoint 
            ? response.sandboxInitPoint 
            : response.initPoint;
          
          console.log(`Redirigiendo a MercadoPago: ${redirectUrl}`);
          window.location.href = redirectUrl;
        } else {
          this.error = response.error || 'Error al procesar la donación';
          this.debugInfo = 'Detalles: ' + JSON.stringify(response);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error en la solicitud:', err);

        let errorMsg = 'Error de conexión con el servidor';
        if (err.error && typeof err.error === 'object') {
          errorMsg = err.error.error || errorMsg;
        } else if (err.message) {
          errorMsg = err.message;
        }

        this.error = errorMsg;
        this.debugInfo = 'Detalles técnicos: ' + JSON.stringify(err);
        this.loading = false;
      }
    });
  }
}
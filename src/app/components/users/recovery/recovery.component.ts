import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth-service.service';

@Component({
  selector: 'app-recovery',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './recovery.component.html',
  styleUrl: './recovery.component.scss'
})
export class RecoveryComponent {
  resetForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.resetForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      this.authService.resetPassword(this.resetForm.get('email')?.value).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.submitSuccess = true;
        },
        error: (err) => {

          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Error al procesar la solicitud. Por favor intente nuevamente.';
        }
      });
    } else {
      this.resetForm.get('email')?.markAsTouched();
    }
  }
}

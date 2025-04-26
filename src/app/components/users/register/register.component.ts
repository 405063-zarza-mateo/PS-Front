import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth-service.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  registrationError = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      course: ['Curso', [Validators.required]]
/*       termsAccepted: [false, [Validators.requiredTrue]]
 */    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { 'mismatch': true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      
      // Extraer los datos del formulario, excluyendo confirmPassword y termsAccepted
      const { confirmPassword,  ...userData } = this.registerForm.value;
      
      this.authService.register(userData).subscribe({
        next: () => {
          this.isSubmitting = false;
          // El servicio de autenticación ya maneja la redirección
        },
        error: (err) => {
          this.isSubmitting = false;
          this.registrationError = err.error?.message || 'Error al registrar. Por favor intente nuevamente.';
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar los errores
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}

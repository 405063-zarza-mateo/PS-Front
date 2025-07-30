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
      course: ['Curso', [Validators.required]],
      termsAccepted: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { 'mismatch': true };
  }

  /**
   * Capitaliza la primera letra de cada palabra
   */
  private capitalizeWords(text: string): string {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Capitaliza el nombre cuando el usuario sale del campo
   */
  onNameBlur(): void {
    const nameControl = this.registerForm.get('name');
    if (nameControl?.value) {
      const capitalizedName = this.capitalizeWords(nameControl.value.trim());
      nameControl.setValue(capitalizedName);
    }
  }

  /**
   * Capitaliza el apellido cuando el usuario sale del campo
   */
  onLastNameBlur(): void {
    const lastNameControl = this.registerForm.get('lastName');
    if (lastNameControl?.value) {
      const capitalizedLastName = this.capitalizeWords(lastNameControl.value.trim());
      lastNameControl.setValue(capitalizedLastName);
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      
      // Extraer los datos del formulario, excluyendo confirmPassword y termsAccepted
      const { confirmPassword, ...userData } = this.registerForm.value;
      
      // Capitalizar nombre y apellido antes de enviar
      if (userData.name) {
        userData.name = this.capitalizeWords(userData.name.trim());
      }
      if (userData.lastName) {
        userData.lastName = this.capitalizeWords(userData.lastName.trim());
      }
      
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
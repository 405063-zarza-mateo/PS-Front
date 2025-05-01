import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth-service.service';
import { ProfileDto } from '../../../models/profileDto';
import { ProfileService } from '../../../services/profile.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  userProfile: ProfileDto | null = null;
  isEditing = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService
  ) {
    this.profileForm = this.fb.group({
      email: [{ value: '', disabled: true }],
      name: [{ value: '', disabled: true }],
      lastName: [{ value: '', disabled: true }],
      course: ['Curso', [Validators.required]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.mustMatch('newPassword', 'confirmPassword')
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.profileService.getUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;

        this.profileForm.patchValue({
          email: profile.email,
          name: profile.name,
          lastName: profile.lastName,
          course: profile.course
        });
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar el perfil del usuario';
        console.error(err);
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.isEditing = false;

    if (this.userProfile) {
      this.profileForm.patchValue({
        course: this.userProfile.course
      });
    }
  }

  updateProfile(): void {
    const course: string = this.profileForm.get('course')?.value;

    this.profileService.updateProfile(course).subscribe({
      next: (response) => {
        this.successMessage = 'Perfil actualizado correctamente';
        this.errorMessage = '';
        this.isEditing = false;

        if (this.userProfile && response) {
          this.userProfile.course = response.course;
        }
      },
      error: (err) => {
        this.errorMessage = 'Error al actualizar el perfil';
        this.successMessage = '';
        console.error(err);
      }
    });

  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      const passwordData = {
        currentPassword: this.passwordForm.get('currentPassword')?.value,
        newPassword: this.passwordForm.get('newPassword')?.value
      };

      this.profileService.changePassword(passwordData).subscribe({
        next: () => {
          this.successMessage = 'Contraseña actualizada correctamente';
          this.errorMessage = '';
          this.passwordForm.reset();
        },
        error: (err) => {
          this.errorMessage = 'Error al cambiar la contraseña. Verifica tu contraseña actual';
          this.successMessage = '';
          console.error(err);
        }
      });
    }
  }

  mustMatch(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl) => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (!control || !matchingControl) {
        return null;
      }

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return null;
      }

      // Establecer error si las contraseñas no coinciden
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
        return { mustMatch: true };
      } else {
        matchingControl.setErrors(null);
        return null;
      }
    };
  }
}

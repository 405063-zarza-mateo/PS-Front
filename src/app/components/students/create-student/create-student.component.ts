import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Student } from '../../../models/student';
import { StudentService } from '../../../services/student-service.service';
import { StudentPostDto } from '../../../models/studentPostDto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-student',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-student.component.html',
  styleUrl: './create-student.component.scss'
})
export class CreateStudentComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  student: Student | null = null;
  studentForm: FormGroup;
  submitted = false;
  saving = false;
  errorMessage = '';
  courses: String[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService
  ) {
    this.studentForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCourses()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      address: [''],
      gender: ['Masculino', [Validators.required]],
      course: ['Curso', [Validators.required]],
      familyInfo: ['']
    });
  }

  get f() {
    return this.studentForm.controls;
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
    const nameControl = this.studentForm.get('name');
    if (nameControl?.value) {
      const capitalizedName = this.capitalizeWords(nameControl.value.trim());
      nameControl.setValue(capitalizedName);
    }
  }

  /**
   * Capitaliza el apellido cuando el usuario sale del campo
   */
  onLastNameBlur(): void {
    const lastNameControl = this.studentForm.get('lastName');
    if (lastNameControl?.value) {
      const capitalizedLastName = this.capitalizeWords(lastNameControl.value.trim());
      lastNameControl.setValue(capitalizedLastName);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  saveChanges(): void {
    this.submitted = true;

    if (this.studentForm.invalid) {
      return;
    }

    const formData = { ...this.studentForm.value };
    
    // Capitalizar nombre y apellido antes de enviar
    if (formData.name) {
      formData.name = this.capitalizeWords(formData.name.trim());
    }
    if (formData.lastName) {
      formData.lastName = this.capitalizeWords(formData.lastName.trim());
    }

    const newStudent: StudentPostDto = formData;

    this.saving = true;
    this.errorMessage = '';

    const subscription = this.studentService.createStudent(newStudent).subscribe({
      next: (result) => {
        this.saving = false;
        this.created.emit();
        this.close.emit();
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage = 'Error al crear estudiante. Por favor intente nuevamente.';
        console.error('Error al crear estudiante:', error);
      }
    });

    this.subscriptions.push(subscription);
  }

  cancel(): void {
    this.close.emit();
  }

  loadCourses() {
    const subscription = this.studentService.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
      },
      error: (err) => {
        console.error('Error al cargar los cursos:', err);
      }
    });

    this.subscriptions.push(subscription);
  }
}
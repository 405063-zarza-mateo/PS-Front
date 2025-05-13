import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Student } from '../../../models/student';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StudentService } from '../../../services/student-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-student',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './view-student.component.html',
  styleUrl: './view-student.component.scss'
})
export class ViewStudentComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() student: Student | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<number>();
  @Output() updated = new EventEmitter<Student>();

  editMode = false;
  studentForm: FormGroup;
  submitted = false;
  saving = false;
  errorMessage = '';
  courses : String[] = []

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

  ngOnChanges(changes: SimpleChanges): void {
    // Si el estudiante cambia, reiniciamos el modo de edición
    if (changes['student'] && this.student) {
      this.editMode = false;
      this.submitted = false;
      this.errorMessage = '';

      // Inicializar el formulario con los datos del estudiante
      if (this.student) {
        this.studentForm = this.createForm();
      }
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: [this.student?.name || '', [Validators.required]],
      lastName: [this.student?.lastName || '', [Validators.required]],
      gender: [this.student?.gender || 'MALE', [Validators.required]],
      address: [this.student?.address || ''],
      course: [this.student?.course || '', [Validators.required]],
      familyInfo: [
        this.student?.familyInfo || '',
        [], []
      ]
    });
  }

  get f() {
    return this.studentForm.controls;
  }

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    if (this.student) {
      this.edit.emit(this.student.id);
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    this.submitted = false;
    this.errorMessage = '';

    // Si entramos en modo edición, inicializamos el formulario con los datos actuales
    if (this.editMode && this.student) {
      this.studentForm.patchValue({
        name: this.student.name,
        lastName: this.student.lastName,
        gender: this.student.gender,
        address: this.student.address,
        course: this.student.course,
        assistace: this.student.assistance
      });
    }
  }

  cancelEdit(): void {
    this.editMode = false;
    this.submitted = false;
    this.errorMessage = '';
  }

  saveChanges(): void {
    this.submitted = true;

    if (this.studentForm.invalid) {
      return;
    }

    if (!this.student) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const updatedStudent: Partial<Student> = {
      ...this.studentForm.value
    };

    const subscription = this.studentService.updateStudent(this.student.id, updatedStudent).subscribe({
      next: (result) => {
        this.saving = false;
        this.editMode = false;

        if (this.student) {
          this.student = { ...result };
          this.updated.emit(result);
        }
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage = 'Error al guardar los cambios. Por favor intente nuevamente.';
        console.error('Error al actualizar estudiante:', error);
      }
    });

    this.subscriptions.push(subscription);

  }


  loadCourses() {
    const subscription = this.studentService.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
      },
      error: (err) => {
        console.error('Error al cargar los alumnos:', err);
      }
    });

    this.subscriptions.push(subscription);
  }

  formatSubjectName(subject: string): string {
    switch (subject) {
      case 'Matematica':
        return 'Matemática';
      case 'Lectura':
        return 'Lectura';  
      case 'Escritura':
        return 'Escritura';
      case 'Disciplina':
        return 'Disciplina';
      default:
        return subject;
    }
  }

}
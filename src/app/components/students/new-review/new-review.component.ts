import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Student } from '../../../models/student';
import { StudentService } from '../../../services/student-service.service';
import { Subscription } from 'rxjs';
import { Teacher } from '../../../models/teacher';
import { ReviewDto } from '../../../models/ReviewDto';

@Component({
  selector: 'app-new-review',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-review.component.html',
  styleUrl: './new-review.component.scss'
})
export class NewReviewComponent implements OnInit, OnDestroy {

  @Input() isOpen = false;
  @Input() selectedStudent: Student | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  reviewForm: FormGroup;
  submitted = false;
  saving = false;
  errorMessage = '';
  teachers: Teacher[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private studetService: StudentService,
  ) {
    this.reviewForm = this.createForm();
  }

  ngOnInit(): void {
    
    // Inicializar los checkboxes como marcados por defecto
    this.reviewForm.patchValue({
      matematicaWorked: true,
      lecturaWorked: true,
      escrituraWorked: true,
      disciplinaWorked: true
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  createForm(): FormGroup {
    return this.fb.group({
      date: [new Date().toISOString().substring(0, 10), [Validators.required]],
      
      // Asignaturas con sus scores
      matematica: [50],
      lectura: [50],
      escritura: [50],
      disciplina: [50],
      
      // Estado de trabajo de las asignaturas (checkbox)
      matematicaWorked: [true],
      lecturaWorked: [true],
      escrituraWorked: [true],
      disciplinaWorked: [true]
    });
  }

  get f() {
    return this.reviewForm.controls;
  }

  toggleSubjectWorked(subject: string): void {
    const isWorked = this.reviewForm.get(`${subject}Worked`)?.value;
    
    if (!isWorked) {
      // Si no se trabajó, deshabilitamos el range y reseteamos el valor
      this.reviewForm.get(subject)?.disable();
    } else {
      // Si se trabajó, habilitamos el range
      this.reviewForm.get(subject)?.enable();
    }
  }

  isSubjectWorked(subject: string): boolean {
    return this.reviewForm.get(`${subject}Worked`)?.value === true;
  }

  getScoreDisplay(subject: string): string {
    if (!this.isSubjectWorked(subject)) {
      return 'N/A';
    }
    return this.reviewForm.get(subject)?.value;
  }

  formatCourse(course: string): string {
    if (course.includes('_') && course.includes('grado')) {
      return `${course.slice(0, course.indexOf('_'))} grado`;
    } else if (course.includes('_') && course.includes('anio')) {
      return `${course.slice(0, course.indexOf('_'))} año`;
    }
    return course;
  }

  saveReview(): void {
    this.submitted = true;

    if (this.reviewForm.invalid || !this.selectedStudent) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    // Crear el objeto de review para enviar al backend
    const reviewData: ReviewDto = {
      date: this.reviewForm.get('date')?.value,
      resultDtos: [
        {
          subject: 'Matematica',
          score: this.isSubjectWorked('matematica') ? this.reviewForm.get('matematica')?.value : null,
          workedOn: this.isSubjectWorked('matematica')
        },
        {
          subject: 'Lectura',
          score: this.isSubjectWorked('lectura') ? this.reviewForm.get('lectura')?.value : null,
          workedOn: this.isSubjectWorked('lectura')
        },
        {
          subject: 'Escritura',
          score: this.isSubjectWorked('escritura') ? this.reviewForm.get('escritura')?.value : null,
          workedOn: this.isSubjectWorked('escritura')
        },
        {
          subject: 'Disciplina',
          score: this.isSubjectWorked('disciplina') ? this.reviewForm.get('disciplina')?.value : null,
          workedOn: this.isSubjectWorked('disciplina')
        }
      ]
    };

    const subscription = this.studetService.addReview(reviewData, this.selectedStudent.id).subscribe({
      next: (result) => {
        this.saving = false;
        this.created.emit();
        this.close.emit();
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage = 'Error al crear la reseña. Por favor intente nuevamente.';
        console.error('Error al crear la reseña:', error);
      }
    });

    this.subscriptions.push(subscription);
  }

  cancel(): void {
    this.close.emit();
  }
}

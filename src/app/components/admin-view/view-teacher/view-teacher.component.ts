import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Teacher } from '../../../models/teacher';
import { Subscription } from 'rxjs';
import { TeacherService } from '../../../services/teacher-service.service';
import { Review } from '../../../models/review';
import { TeacherReviewDto } from '../../../models/teacherReviewDto';

@Component({
  selector: 'app-view-teacher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-teacher.component.html',
  styleUrl: './view-teacher.component.scss'
})
export class ViewTeacherComponent {
  @Input() isOpen = false;
  @Input() teacher: Teacher | null = null;

  @Output() close = new EventEmitter<void>();
  
  teacherReviews: TeacherReviewDto[] = [];
  loading = false;
  errorMessage = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private teacherService: TeacherService
  ) {}

  ngOnInit(): void {
    // No hay acciones iniciales necesarias
  }

  ngOnChanges(): void {
    if (this.teacher && this.isOpen) {
      this.loadTeacherReviews();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadTeacherReviews(): void {
    if (!this.teacher) return;
    
    this.loading = true;
    const subscription = this.teacherService.getTeacherReviews(this.teacher.id).subscribe({
      next: (reviews) => {
        this.teacherReviews = reviews;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar las revisiones del profesor:', error);
        this.errorMessage = 'No se pudieron cargar las revisiones del profesor.';
        this.loading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  onClose(): void {
    this.close.emit();
  }

  formatSubjectName(subject: string): string {
    // Convertimos el nombre de la asignatura en un formato más legible
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

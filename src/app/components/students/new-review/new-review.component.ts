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
  minDate = '';
  maxDate = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private studetService: StudentService,
  ) {
    this.reviewForm = this.createForm();
  }

  ngOnInit(): void {
    // Ya no necesitamos llamar setDateLimits aquí porque se llama en createForm
    
    // Inicializar los checkboxes como marcados por defecto
    this.reviewForm.patchValue({
      matematicaWorked: true,
      lecturaWorked: true,
      escrituraWorked: true,
      disciplinaWorked: true,
      date: this.getDefaultDate() // Establecer fecha por defecto después de tener las fechas disponibles
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  createForm(): FormGroup {
    this.setDateLimits(); // Llamar primero para establecer las fechas disponibles
    
    return this.fb.group({
      date: ['', [Validators.required, this.dateValidator.bind(this)]],
      
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

  setDateLimits(): void {
    // Obtener fecha actual en Buenos Aires
    const now = new Date();
    const buenosAiresTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
    
    // Obtener el martes y sábado de la semana actual
    const currentWeekDates = this.getTuesdayAndSaturday(buenosAiresTime);
    
    // Obtener el martes y sábado de la semana anterior
    const previousWeek = new Date(buenosAiresTime);
    previousWeek.setDate(previousWeek.getDate() - 7);
    const previousWeekDates = this.getTuesdayAndSaturday(previousWeek);
    
    // Combinar todas las fechas disponibles y filtrar solo las que no son futuras
    const allDates = [
      ...previousWeekDates,
      ...currentWeekDates
    ];
    
    // Filtrar fechas que no sean futuras (solo hasta hoy)
    this.availableDates = allDates
      .filter(date => date <= buenosAiresTime)
      .sort((a, b) => a.getTime() - b.getTime());
    
    // No establecer límites min/max para permitir que solo el validador controle las fechas
    this.minDate = '';
    this.maxDate = '';
  }

  availableDates: Date[] = [];

  getTuesdayAndSaturday(referenceDate: Date): Date[] {
    const dates: Date[] = [];
    const date = new Date(referenceDate);
    
    // Encontrar el lunes de la semana
    const dayOfWeek = date.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    date.setDate(date.getDate() + daysToMonday);
    
    // Martes (lunes + 1)
    const tuesday = new Date(date);
    tuesday.setDate(date.getDate() + 1);
    dates.push(tuesday);
    
    // Sábado (lunes + 5)
    const saturday = new Date(date);
    saturday.setDate(date.getDate() + 5);
    dates.push(saturday);
    
    return dates;
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().substring(0, 10);
  }

  getDefaultDate(): string {
    if (this.availableDates.length === 0) {
      return '';
    }
    
    // Obtener fecha actual en Buenos Aires
    const now = new Date();
    const today = new Date(now.toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
    
    // Verificar si hoy es martes o sábado y está en las fechas disponibles
    const todayFormatted = this.formatDateForInput(today);
    const isTodayAvailable = this.availableDates.some(date => 
      this.formatDateForInput(date) === todayFormatted
    );
    
    if (isTodayAvailable) {
      return todayFormatted;
    }
    
    // Si hoy no es martes/sábado o no está disponible, buscar la fecha más cercana a hoy
    // pero que no sea futura
    let closestDate = this.availableDates[0]; // Por defecto la primera (más antigua)
    let minDifference = Math.abs(today.getTime() - this.availableDates[0].getTime());
    
    for (const date of this.availableDates) {
      const difference = Math.abs(today.getTime() - date.getTime());
      
      // Si la fecha es de hoy o anterior y está más cerca que la actual seleccionada
      if (date <= today && difference < minDifference) {
        closestDate = date;
        minDifference = difference;
      }
    }
    
    return this.formatDateForInput(closestDate);
  }

  getTempAvailableDates(referenceDate: Date): Date[] {
    const currentWeekDates = this.getTuesdayAndSaturday(referenceDate);
    const previousWeek = new Date(referenceDate);
    previousWeek.setDate(previousWeek.getDate() - 7);
    const previousWeekDates = this.getTuesdayAndSaturday(previousWeek);
    
    return [
      ...previousWeekDates,
      ...currentWeekDates
    ].sort((a, b) => a.getTime() - b.getTime());
  }

  // Método para deshabilitar fechas que no son martes o sábado
  isDateDisabled = (date: string): boolean => {
    const selectedDate = new Date(date + 'T00:00:00');
    return !this.availableDates.some(availableDate => 
      this.formatDateForInput(availableDate) === date
    );
  }

  dateValidator(control: any) {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const isValidDate = this.availableDates.some(date => 
      this.formatDateForInput(date) === control.value
    );
    
    return isValidDate ? null : { invalidDate: true };
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
      if (this.reviewForm.get('date')?.hasError('invalidDate')) {
        this.errorMessage = 'Por favor seleccione una fecha válida (martes o sábado de la semana actual o anterior).';
      }
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
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Error al crear la reseña. Por favor intente nuevamente.';
        }
        console.error('Error al crear la reseña:', error);
      }
    });

    this.subscriptions.push(subscription);
  }

  cancel(): void {
    this.close.emit();
  }
}
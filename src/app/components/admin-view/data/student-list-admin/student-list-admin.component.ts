import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Student } from '../../../../models/student';
import { Review } from '../../../../models/review';
import { Results } from '../../../../models/results';
import * as XLSX from 'xlsx';
import saveAs from 'file-saver';
import { StudentService } from '../../../../services/student-service.service';

@Component({
  selector: 'app-student-list-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-list-admin.component.html',
  styleUrl: './student-list-admin.component.scss'
})
export class StudentListAdminComponent implements OnInit, OnDestroy {
  // Subjects for unsubscribing
  private destroy$ = new Subject<void>();

  // Data properties
  students: Student[] = [];
  filteredStudents: Student[] = [];
  isLoading = false;
  error = '';
  successMessage = '';
  
  // Filter properties
  searchTerm = '';
  selectedCourse = '';
  sortBy = 'date';
  sortDirection = 'desc';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Courses list
  courses: String[] = [];

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadStudents();
    this.loadCourses();
  }

  ngOnDestroy(): void {
    // Complete the subject to unsubscribe from all subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.error = '';

    this.studentService.getStudents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.students = data;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar los estudiantes: ' + err.message;
          this.isLoading = false;
        }
      });
  }

  loadCourses(): void {
    this.studentService.getCourses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.courses = data;
        },
        error: (err) => {
          this.error = 'Error al cargar los cursos: ' + err.message;
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.students];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(student => {
        const studentMatch = student.name.toLowerCase().includes(term) || 
                             student.lastName.toLowerCase().includes(term);

        const teacherMatch = student.reviews?.some(review => {
          const teacherFullName = `${review.teacher.name} ${review.teacher.lastName}`.toLowerCase();
          return teacherFullName.includes(term) || 
                 review.teacher.name.toLowerCase().includes(term) || 
                 review.teacher.lastName.toLowerCase().includes(term);
        });

        return studentMatch || teacherMatch;
      });
    }

    // Apply course filter
    if (this.selectedCourse) {
      filtered = filtered.filter(student =>
        student.course === this.selectedCourse
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dirMod = this.sortDirection === 'asc' ? 1 : -1;

      switch (this.sortBy) {
        case 'name':
          return (a.name.localeCompare(b.name)) * dirMod;
        case 'lastName':
          return (a.lastName.localeCompare(b.lastName)) * dirMod;
        case 'course':
          return (a.course.localeCompare(b.course)) * dirMod;
        case 'assistance':
          return (a.assistance - b.assistance) * dirMod;
        case 'date':
          // Sort by latest review date
          const aLatest = a.reviews.length ? new Date(a.reviews[a.reviews.length - 1].date).getTime() : 0;
          const bLatest = b.reviews.length ? new Date(b.reviews[b.reviews.length - 1].date).getTime() : 0;
          return (aLatest - bLatest) * dirMod;
        default:
          return 0;
      }
    });

    this.filteredStudents = filtered;
    this.totalItems = filtered.length;
    
    // Reset to first page if no results on current page
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onCourseChange(event: Event): void {
    this.selectedCourse = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onSortChange(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'desc';
    }
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCourse = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const pages = [];
    // Mostrar menos páginas en dispositivos móviles
    const maxVisiblePages = window.innerWidth < 768 ? 3 : 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  get paginatedStudents(): Student[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredStudents.slice(start, end);
  }

  getReviews(student: Student): Review[] {
    return student.reviews || [];
  }

  getSubjectScore(results: Results[], subject: string): number | string {
    const result = results?.find(r => r.subject === subject);
    if (result && result.workedOn) {
      return result.score;
    }
    return 'N/A';
  }

  getScoreClass(score: number | string): string {
    if (score === 'N/A') return 'text-secondary ';
    if (typeof score === 'number') {
      if (score < 40) return 'text-danger fw-bold';
      if (score >= 40 && score < 70) return 'text-warning fw-bold';
      if (score >= 70) return 'text-success fw-bold';
    }
    return '';
  }

  // Helper para formatear nombre de curso en vista móvil
  formatCourse(course: String): String {
    if (course.includes("_") && course.includes("grado")) {
      return `${course.slice(0, course.indexOf("_"))} grado`;
    } else if (course.includes("_") && course.includes("anio")) {
      return `${course.slice(0, course.indexOf("_"))} año`;
    }
    return course;
  }

  exportToExcel(): void {
    const data: any[] = [];

    this.filteredStudents.forEach(student => {
      const reviews = this.getReviews(student);

      if (reviews.length === 0) {
        // Estudiante sin reviews
        data.push({
          'Nombre': student.name,
          'Apellido': student.lastName,
          'Curso': student.course,
          'Asistencia': student.assistance,
          'Matemática': 'N/A',
          'Escritura': 'N/A',
          'Lectura': 'N/A',
          'Disciplina': 'N/A',
          'Profesor': 'N/A',
          'Fecha': 'N/A'
        });
      } else {
        reviews.forEach(review => {
          data.push({
            'Nombre': student.name,
            'Apellido': student.lastName,
            'Curso': this.formatCourse(student.course),
            'Asistencia': student.assistance,
            'Matemática': this.getSubjectScore(review.results, 'Matematica'),
            'Escritura': this.getSubjectScore(review.results, 'Escritura'),
            'Lectura': this.getSubjectScore(review.results, 'Lectura'),
            'Disciplina': this.getSubjectScore(review.results, 'Disciplina'),
            'Profesor': `${review.teacher.name} ${review.teacher.lastName}`,
            'Fecha': new Date(review.date).toLocaleDateString()
          });
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudiantes');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    saveAs(blob, `estudiantes_${new Date().toISOString().split('T')[0]}.xlsx`);

    this.successMessage = 'Datos exportados a Excel correctamente';
    setTimeout(() => this.successMessage = '', 3000);
  }

  exportToStata(): void {
    let stataContent = 'id\tnombre\tapellido\tcurso\tasistencia\tmatematica\tescritura\tlectura\tdisciplina\tprofesor\tfecha\n';
    let rowId = 1;

    this.filteredStudents.forEach(student => {
      const reviews = this.getReviews(student);

      if (reviews.length === 0) {
        stataContent += `${rowId++}\t${student.name}\t${student.lastName}\t${this.formatCourse(student.course)}\t${student.assistance}\tN/A\tN/A\tN/A\tN/A\tN/A\tN/A\n`;
      } else {
        reviews.forEach(review => {
          stataContent += `${rowId++}\t${student.name}\t${student.lastName}\t${this.formatCourse(student.course)}\t${student.assistance}\t`;
          stataContent += `${this.getSubjectScore(review.results, 'Matematica')}\t`;
          stataContent += `${this.getSubjectScore(review.results, 'Escritura')}\t`;
          stataContent += `${this.getSubjectScore(review.results, 'Lectura')}\t`;
          stataContent += `${this.getSubjectScore(review.results, 'Disciplina')}\t`;
          stataContent += `${review.teacher.name} ${review.teacher.lastName}\t`;
          stataContent += `${new Date(review.date).toLocaleDateString()}\n`;
        });
      }
    });

    const blob = new Blob([stataContent], { type: 'text/tab-separated-values' });
    saveAs(blob, `estudiantes_stata_${new Date().toISOString().split('T')[0]}.csv`);

    this.successMessage = 'Datos exportados en formato compatible con Stata correctamente';
    setTimeout(() => this.successMessage = '', 3000);
  }
}
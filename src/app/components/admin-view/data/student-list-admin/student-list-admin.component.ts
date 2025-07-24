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
  private destroy$ = new Subject<void>();

  students: Student[] = [];
  filteredStudents: Student[] = [];
  allFilteredStudents: Student[] = [];
  isLoading = false;
  error = '';
  successMessage = '';

  searchTerm = '';
  selectedCourse = '';
  sortBy = 'default';
  sortDirection = 'asc';

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  courses: String[] = [];

  constructor(private studentService: StudentService) { }

  ngOnInit(): void {
    this.loadStudents();
    this.loadCourses();
  }

  ngOnDestroy(): void {
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

    if (this.selectedCourse) {
      filtered = filtered.filter(student =>
        student.course === this.selectedCourse
      );
    }

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
          const aLatest = a.reviews.length ? new Date(a.reviews[a.reviews.length - 1].date).getTime() : 0;
          const bLatest = b.reviews.length ? new Date(b.reviews[b.reviews.length - 1].date).getTime() : 0;
          return (aLatest - bLatest) * dirMod;
        case 'default':
        default:
          const courseOrder = this.courses.indexOf(a.course) - this.courses.indexOf(b.course);
          if (courseOrder !== 0) return courseOrder;

          const nameOrder = a.name.localeCompare(b.name);
          if (nameOrder !== 0) return nameOrder;

          const aLatestDate = a.reviews.length ? new Date(a.reviews[a.reviews.length - 1].date).getTime() : 0;
          const bLatestDate = b.reviews.length ? new Date(b.reviews[b.reviews.length - 1].date).getTime() : 0;
          return bLatestDate - aLatestDate;
      }
    });

    this.allFilteredStudents = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalItems = this.allFilteredStudents.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.filteredStudents = this.allFilteredStudents.slice(start, end);
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

  onItemsPerPageChange(event: Event): void {
    this.itemsPerPage = parseInt((event.target as HTMLSelectElement).value);
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
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  goToFirstPage(): void {
    this.goToPage(1);
  }

  goToLastPage(): void {
    this.goToPage(this.totalPages);
  }

  goToPreviousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  goToNextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, this.currentPage - 2);
      const endPage = Math.min(this.totalPages, this.currentPage + 2);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  getStartItem(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  getReviews(student: Student): Review[] {
    const reviews = student.reviews || [];
    return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

  getGenderClass(gender: string): string {
    if (gender == "Masculino") {
      return "text-primary fw-bold"
    } else if (gender == "Femenino") {
      return "text-female fw-bold"
    }
    return ""
  }

  formatCourse(course: String): String {
    if (course.includes("_") && course.includes("grado")) {
      return `${course.slice(0, course.indexOf("_"))} grado`;
    } else if (course.includes("_") && course.includes("anio")) {
      return `${course.slice(0, course.indexOf("_"))} año`;
    }
    return course;
  }

  private getCurrentDateTime(): string {
    const now = new Date();
    const argTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
    const day = argTime.getDate().toString().padStart(2, '0');
    const month = (argTime.getMonth() + 1).toString().padStart(2, '0');
    const year = argTime.getFullYear();
    const hours = argTime.getHours().toString().padStart(2, '0');
    const minutes = argTime.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  exportToExcel(): void {
    const data: any[] = [];

    this.allFilteredStudents.forEach(student => {
      const reviews = this.getReviews(student);

      if (reviews.length === 0) {
        data.push({
          'Nombre': student.name,
          'Apellido': student.lastName,
          'Sexo': student.gender,
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
            'Sexo': student.gender,
            'Curso': this.formatCourse(student.course),
            'Asistencia': student.assistance,
            'Matemática': this.getSubjectScore(review.results, 'Matematica'),
            'Escritura': this.getSubjectScore(review.results, 'Escritura'),
            'Lectura': this.getSubjectScore(review.results, 'Lectura'),
            'Disciplina': this.getSubjectScore(review.results, 'Disciplina'),
            'Profesor': `${review.teacher.name} ${review.teacher.lastName}`,
            'Fecha': new Date(review.date).toLocaleDateString('es-AR')
          });
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudiantes');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    saveAs(blob, `Lista estudiantes (${this.getCurrentDateTime().replace(':', '-').replace(' ', ' ')}).xlsx`);

    this.successMessage = 'Datos exportados a Excel correctamente';
    setTimeout(() => this.successMessage = '', 3000);
  }

  exportToStata(): void {
    let stataContent = 'id\tnombre\tapellido\tsexo\tcurso\tasistencia\tmatematica\tescritura\tlectura\tdisciplina\tprofesor\tfecha\n';
    let rowId = 1;

    this.allFilteredStudents.forEach(student => {
      const reviews = this.getReviews(student);

      if (reviews.length === 0) {
        stataContent += `${rowId++}\t${student.name}\t${student.lastName}\t${student.gender}\t${this.formatCourse(student.course)}\t${student.assistance}\tN/A\tN/A\tN/A\tN/A\tN/A\tN/A\n`;
      } else {
        reviews.forEach(review => {
          stataContent += `${rowId++}\t${student.name}\t${student.lastName}\t${student.gender}\t${this.formatCourse(student.course)}\t${student.assistance}\t`;
          stataContent += `${this.getSubjectScore(review.results, 'Matematica')}\t`;
          stataContent += `${this.getSubjectScore(review.results, 'Escritura')}\t`;
          stataContent += `${this.getSubjectScore(review.results, 'Lectura')}\t`;
          stataContent += `${this.getSubjectScore(review.results, 'Disciplina')}\t`;
          stataContent += `${review.teacher.name} ${review.teacher.lastName}\t`;
          stataContent += `${new Date(review.date).toLocaleDateString('es-AR')}\n`;
        });
      }
    });

    const blob = new Blob([stataContent], { type: 'text/tab-separated-values' });
    saveAs(blob, `Lista estudiantes (${this.getCurrentDateTime().replace(':', '-').replace(' ', ' ')}).csv`);

    this.successMessage = 'Datos exportados en formato compatible con Stata correctamente';
    setTimeout(() => this.successMessage = '', 3000);
  }
}
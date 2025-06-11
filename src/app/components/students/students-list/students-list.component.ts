import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Student } from '../../../models/student';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth-service.service';
import { Router, RouterModule } from '@angular/router';
import { StudentService } from '../../../services/student-service.service';
import { DeleteStudentComponent } from '../delete-student/delete-student.component';
import { ViewStudentComponent } from '../view-student/view-student.component';
import { CreateStudentComponent } from '../create-student/create-student.component';
import { NewReviewComponent } from '../new-review/new-review.component';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule,
    RouterModule,
    DeleteStudentComponent,
    ViewStudentComponent,
    CreateStudentComponent,
    NewReviewComponent
  ],
  templateUrl: './students-list.component.html',
  styleUrl: './students-list.component.scss'
})
export class StudentsListComponent implements OnInit, OnDestroy {
  students: Student[] = [];
  filteredStudents: Student[] = [];
    paginatedStudents: Student[] = [];
  
  isAdmin = false;
  isLoading = true;
  searchTerm = '';
  error = '';
  selectedCourse = 'Curso...'; 

  isDeleteModalOpen = false;
  isDetailsModalOpen = false;
  isCreateModalOpen = false;
  isReviewModalOpen = false;

  selectedStudent: Student | null = null;
  studentToDeleteId: number | null = null;
  successMessage = '';
  courses: String[] = [];

    // Propiedades de paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private studentService: StudentService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin;

    this.loadStudents();

    this.loadCourses();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private sortStudents(students: Student[]): Student[] {
  return students.sort((a, b) => {
    // Primero ordenar por el orden de los cursos
    const courseIndexA = this.courses.indexOf(a.course);
    const courseIndexB = this.courses.indexOf(b.course);
    
    if (courseIndexA !== courseIndexB) {
      return courseIndexA - courseIndexB;
    }
    
    // Si tienen el mismo curso, ordenar alfabéticamente por nombre completo
    const fullNameA = `${a.name} ${a.lastName}`.toLowerCase();
    const fullNameB = `${b.name} ${b.lastName}`.toLowerCase();
    
    return fullNameA.localeCompare(fullNameB);
  });
}

  loadStudents(): void {
    this.isLoading = true;

    const subscription = this.studentService.getStudents().subscribe({
      next: (data) => {
        this.students = this.sortStudents(data);
        this.applyFilters(); 
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los alumnos:', err);
        this.error = 'No se pudieron cargar los alumnos. Por favor, intente nuevamente.';
        this.isLoading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  // Agregar este método en la clase StudentsListComponent, después del método resetCourseFilter():

applyFilters(): void {
  let result = [...this.students];
  
  if (this.searchTerm.trim()) {
    const term = this.searchTerm.toLowerCase().trim();
    result = result.filter(student =>
      student.name.toLowerCase().includes(term) ||
      student.lastName.toLowerCase().includes(term) ||
      student.gender.toLowerCase().includes(term) ||
      student.course.toLowerCase().includes(term)
    );
  }
  
  if (this.selectedCourse && this.selectedCourse !== 'Curso...') {
    result = result.filter(student => student.course === this.selectedCourse);
  }
  
  // Mantener el ordenamiento después de aplicar filtros
  this.filteredStudents = this.sortStudents(result);
  this.updatePagination();
}

// Modificar el método onSearch para resetear a la primera página:
onSearch(event: Event): void {
  const target = event.target as HTMLInputElement;
  this.searchTerm = target.value;
  this.currentPage = 1; // Agregar esta línea
  this.applyFilters();
}

// Modificar el método onCourseChange para resetear a la primera página:
onCourseChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  this.selectedCourse = target.value;
  this.currentPage = 1; // Agregar esta línea
  this.applyFilters();
}

  searchStudents(): void {
    this.applyFilters(); 
  }

  openDetailsModal(id: number): void {
    const studentFromList = this.students.find(s => s.id === id);

    if (studentFromList && this.hasCompleteData(studentFromList)) {
      this.selectedStudent = studentFromList;
      this.isDetailsModalOpen = true;
    } else {
      this.isLoading = true;

      const subscription = this.studentService.getStudentById(id).subscribe({
        next: (student) => {
          this.selectedStudent = student;
          this.isDetailsModalOpen = true;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(`Error al cargar los detalles del alumno ${id}:`, err);
          this.error = 'No se pudieron cargar los detalles del alumno. Por favor, intente nuevamente.';
          this.isLoading = false;
        }
      });

      this.subscriptions.push(subscription);
    }
  }

  private hasCompleteData(student: Student): boolean {
    return !!student.reviews && student.reviews.length > 0;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedStudent = null;
  }

  openDeleteModal(id: number): void {
    const student = this.students.find(s => s.id === id);
    if (student) {
      this.selectedStudent = student;
      this.studentToDeleteId = id;
      this.isDeleteModalOpen = true;
    }
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.selectedStudent = null;
    this.studentToDeleteId = null;
  }

  confirmDelete(id: number): void {
    const subscription = this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.students = this.students.filter(student => student.id !== id);
        this.applyFilters(); 
        this.closeDeleteModal();
        this.successMessage = 'Alumno eliminado con éxito.';
      },
      error: (err) => {
        console.error('Error al eliminar el alumno:', err);
        this.error = 'No se pudo eliminar el alumno. Por favor, intente nuevamente.';
        this.closeDeleteModal();
      }
    });

    this.subscriptions.push(subscription);
  }

  onStudentUpdated(student: Student): void {
    console.log('Estudiante actualizado:', student);

    if (this.students) {
      const index = this.students.findIndex(s => s.id === student.id);
      if (index !== -1) {
        this.students[index] = student;
      }
    }
    this.loadStudents();
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  createdStudet(): void {
    this.successMessage = 'Estudiante creado con éxito.';
    this.loadStudents();
  }

  loadCourses() {
    this.isLoading = true;

    const subscription = this.studentService.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los cursos:', err);
        this.isLoading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  openAddReviewModal(id: number): void {
    const student = this.students.find(s => s.id === id);
    if (student) {
      this.selectedStudent = student;
      this.isReviewModalOpen = true;
    }
  }
  
  onCloseAddReviewModal(): void {
    this.isReviewModalOpen = false;
  }
  
  onReviewCreated(): void {
    this.loadStudents();
    this.successMessage = 'Reseña añadida exitosamente';
  }

  resetCourseFilter(): void {
    this.selectedCourse = 'Curso...';
    this.applyFilters();
  }

   // Métodos para usar en el template
  getStartItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

    updatePagination(): void {
    this.totalItems = this.filteredStudents.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // Ajustar página actual si es necesario
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
    
    // Calcular items para la página actual
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedStudents = this.filteredStudents.slice(startIndex, endIndex);
  }

  // Métodos de paginación
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

  // Obtener array de páginas para mostrar en la paginación
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con puntos suspensivos
      const startPage = Math.max(1, this.currentPage - 2);
      const endPage = Math.min(this.totalPages, this.currentPage + 2);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

}
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Teacher } from '../../../models/teacher';
import { AuthService } from '../../../services/auth-service.service';
import { TeacherService } from '../../../services/teacher-service.service';
import { Router } from '@angular/router';
import { StudentService } from '../../../services/student-service.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ViewTeacherComponent } from "../view-teacher/view-teacher.component";
import { AdminViewService } from '../../../services/admin-view-service.service';
import { DeleteTeacherComponent } from "../delete-teacher/delete-teacher.component";

@Component({
  selector: 'app-teachers-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ViewTeacherComponent, DeleteTeacherComponent],
  templateUrl: './teachers-list.component.html',
  styleUrl: './teachers-list.component.scss'
})
export class TeachersListComponent implements OnInit, OnDestroy {
  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  paginatedTeachers: Teacher[] = [];
  isAdmin = false;
  isLoading = true;
  searchTerm = '';
  error = '';
  selectedCourse = 'Curso...'; 
  successMessage = '';

  // Propiedades de paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  courses: String[] = [];

  isDeleteModalOpen = false;
  isDetailsModalOpen = false;
  selectedTeacher: Teacher | null = null;
  teacherToDeleteId: number | null = null;

  private subscriptions: Subscription[] = [];
  
  constructor(
    private teacherService: TeacherService,
    private adminViewService : AdminViewService,
    private studentService: StudentService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadTeachers();
    this.loadCourses();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  loadTeachers(): void {
    this.isLoading = true;

    const subscription = this.adminViewService.getTeachers().subscribe({
      next: (data) => {
        this.teachers = data;
        this.applyFilters(); 
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los profesores:', err);
        this.error = 'No se pudieron cargar los profesores. Por favor, intente nuevamente.';
        this.isLoading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.currentPage = 1; // Resetear a la primera página al buscar
    this.applyFilters();
  }

  onCourseChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCourse = target.value;
    this.currentPage = 1; // Resetear a la primera página al filtrar
    this.applyFilters();
  }

  applyFilters(): void {
    console.log(this.teachers)
    let result = [...this.teachers];
    
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(teacher =>
        teacher.name.toLowerCase().includes(term) ||
        teacher.lastName.toLowerCase().includes(term) ||
        teacher.course.toLowerCase().includes(term)
      );
    }
    
    if (this.selectedCourse && this.selectedCourse !== 'Curso...') {
      result = result.filter(teacher => teacher.course === this.selectedCourse);
    }
    
    this.filteredTeachers = result;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalItems = this.filteredTeachers.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // Ajustar página actual si es necesario
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
    
    // Calcular items para la página actual
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTeachers = this.filteredTeachers.slice(startIndex, endIndex);
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

  searchTeachers(): void {
    this.applyFilters(); 
  }

  openDetailsModal(id: number): void {
    const teacherFromList = this.teachers.find(s => s.id === id);

    if (teacherFromList ) {
      this.selectedTeacher = teacherFromList;
      this.isDetailsModalOpen = true;
    } else {
      this.isLoading = true;

      const subscription = this.teacherService.getTeacherById(id).subscribe({
        next: (teacher) => {
          this.selectedTeacher = teacher;
          this.isDetailsModalOpen = true;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(`Error al cargar los detalles del profesor ${id}:`, err);
          this.error = 'No se pudieron cargar los detalles del profesor. Por favor, intente nuevamente.';
          this.isLoading = false;
        }
      });

      this.subscriptions.push(subscription);
    }
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedTeacher = null;
  }

  openDeleteModal(id: number): void {
    const teacher = this.teachers.find(s => s.id === id);
    if (teacher) {
      this.selectedTeacher = teacher;
      this.teacherToDeleteId = id;
      this.isDeleteModalOpen = true;
    }
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.selectedTeacher = null;
    this.teacherToDeleteId = null;
  }

  confirmDelete(id: number): void {
    const subscription = this.teacherService.deleteTeacher(id).subscribe({
      next: () => {
        this.teachers = this.teachers.filter(teacher => teacher.id !== id);
        this.applyFilters(); // Esto actualizará la paginación automáticamente
        this.closeDeleteModal();
        this.successMessage = 'Profesor eliminado con éxito.';
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error al eliminar el profesor:', err);
        this.error = 'No se pudo eliminar el profesor. Por favor, intente nuevamente.';
        this.closeDeleteModal();
      }
    });

    this.subscriptions.push(subscription);
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

  resetCourseFilter(): void {
    this.selectedCourse = 'Curso...';
    this.currentPage = 1; // Resetear a la primera página al limpiar filtros
    this.applyFilters();
  }

  // Métodos para usar en el template
  getStartItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }
}
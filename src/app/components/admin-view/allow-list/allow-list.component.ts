import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Teacher } from '../../../models/teacher';
import { StudentService } from '../../../services/student-service.service';
import { TeacherService } from '../../../services/teacher-service.service';
import { Router } from '@angular/router';
import { AdminViewService } from '../../../services/admin-view-service.service';
import { FormsModule } from '@angular/forms';
import { TeacherResponse } from '../../../models/teacherRequest';

@Component({
  selector: 'app-allow-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './allow-list.component.html',
  styleUrl: './allow-list.component.scss'
})
export class AllowListComponent {

  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  paginatedTeachers: Teacher[] = [];

  // Nuevo: mapa para mantener las selecciones pendientes
  pendingSelections: Map<number, 'approved' | 'denied' | null> = new Map();

  isLoading = true;
  searchTerm = '';
  error = '';
  selectedCourse = 'Curso...'; 
  successMessage = '';
  isProcessing = false; // Nuevo: para controlar el estado de procesamiento

  courses: String[] = [];

  // Propiedades de paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  private subscriptions: Subscription[] = [];
  
  constructor(
    private adminViewService: AdminViewService,
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

    const subscription = this.adminViewService.getPendingTeachers().subscribe({
      next: (data) => {
        this.teachers = data;
        // Limpiar selecciones anteriores cuando se recargan los datos
        this.pendingSelections.clear();
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
    this.applyFilters();
  }

  onCourseChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCourse = target.value;
    this.applyFilters();
  }

  applyFilters(): void {
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

  searchTeachers(): void {
    this.applyFilters(); 
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
    this.applyFilters();
  }

  // Nuevos métodos para manejar selecciones
  selectForApproval(teacherId: number): void {
    this.pendingSelections.set(teacherId, 'approved');
  }

  selectForDenial(teacherId: number): void {
    this.pendingSelections.set(teacherId, 'denied');
  }

  clearSelection(teacherId: number): void {
    this.pendingSelections.delete(teacherId);
  }

  getSelectionStatus(teacherId: number): 'approved' | 'denied' | null {
    return this.pendingSelections.get(teacherId) || null;
  }

  // Obtener el número de selecciones pendientes
  getPendingSelectionsCount(): number {
    return this.pendingSelections.size;
  }

  // Obtener estadísticas de selecciones
  getSelectionStats(): { approved: number, denied: number } {
    let approved = 0;
    let denied = 0;
    
    this.pendingSelections.forEach(status => {
      if (status === 'approved') approved++;
      else if (status === 'denied') denied++;
    });
    
    return { approved, denied };
  }

  // Confirmar todas las selecciones
  confirmSelections(): void {
    if (this.pendingSelections.size === 0) {
      this.error = 'No hay selecciones pendientes para confirmar.';
      return;
    }

    this.isProcessing = true;
    const responses: TeacherResponse[] = [];

    // Convertir las selecciones a TeacherResponse
    this.pendingSelections.forEach((status, teacherId) => {
      responses.push({
        id: teacherId,
        approved: status === 'approved'
      });
    });

    const subscription = this.adminViewService.respondRequests(responses).subscribe({
      next: () => {
        const stats = this.getSelectionStats();
        this.successMessage = `Procesamiento completado: ${stats.approved} aprobados, ${stats.denied} denegados`;
        this.pendingSelections.clear();
        this.loadTeachers(); // Recargar la lista
        this.isProcessing = false;
      },
      error: (err) => {
        console.error('Error al procesar las solicitudes:', err);
        this.error = 'Error al procesar las solicitudes. Por favor, intente nuevamente.';
        this.isProcessing = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  // Limpiar todas las selecciones
  clearAllSelections(): void {
    this.pendingSelections.clear();
  }

  // Métodos para usar en el template
  getStartItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
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
}
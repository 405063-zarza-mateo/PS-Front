import { Component } from '@angular/core';
import { Log } from '../../../models/log';
import { AdminViewService } from '../../../services/admin-view-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-teacher-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-log.component.html',
  styleUrl: './teacher-log.component.scss'
})
export class TeacherLogComponent {
  logs: Log[] = [];
  filteredLogs: Log[] = [];
  isLoading: boolean = true;
  error: string = '';
  successMessage: string = '';
  searchTerm: string = '';
  selectedCategory: string = 'Categoría...';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(private adminService: AdminViewService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    this.adminService.getLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los registros de actividad. Por favor, inténtelo de nuevo.';
        console.error('Error fetching logs:', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.currentPage = 1;
    this.applyFilters();
  }

  onCategoryChange(event: Event): void {
    this.selectedCategory = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.applyFilters();
  }

  resetCategoryFilter(): void {
    this.selectedCategory = 'Categoría...';
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    // Apply category filter
    let filtered = this.logs;
    
    if (this.selectedCategory !== 'Categoría...') {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(this.selectedCategory.toLowerCase())
      );
    }
    
    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(this.searchTerm)
      );
    }
    
    // Sort by time (newest first)
    filtered = [...filtered].sort((a, b) => 
      new Date(b.time).getTime() - new Date(a.time).getTime()
    );
    
    this.filteredLogs = filtered;
    // Update pagination
    this.updatePagination();
  }

  // Métodos de paginación mejorados
  getStartItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  updatePagination(): void {
    this.totalItems = this.filteredLogs.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
   
    // Ajustar página actual si es necesario
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
   
    // Calcular items para la página actual
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredLogs = this.filteredLogs.slice(startIndex, endIndex);
  }

  // Métodos de paginación
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters(); // Reaplicar filtros para recalcular la página
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
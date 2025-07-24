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
  allFilteredLogs: Log[] = [];
  isLoading: boolean = true;
  error: string = '';
  successMessage: string = '';
  searchTerm: string = '';
  selectedCategory: string = 'Categoría...';
  
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

  onItemsPerPageChange(event: Event): void {
    this.itemsPerPage = parseInt((event.target as HTMLSelectElement).value);
    this.currentPage = 1;
    this.applyFilters();
  }

  resetCategoryFilter(): void {
    this.selectedCategory = 'Categoría...';
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.logs;
    
    if (this.selectedCategory !== 'Categoría...') {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(this.selectedCategory.toLowerCase())
      );
    }
    
    if (this.searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(this.searchTerm)
      );
    }
    
    filtered = [...filtered].sort((a, b) => 
      new Date(b.time).getTime() - new Date(a.time).getTime()
    );
    
    this.allFilteredLogs = filtered;
    this.updatePagination();
  }

  getStartItem(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  updatePagination(): void {
    this.totalItems = this.allFilteredLogs.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
   
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
   
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredLogs = this.allFilteredLogs.slice(startIndex, endIndex);
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
}
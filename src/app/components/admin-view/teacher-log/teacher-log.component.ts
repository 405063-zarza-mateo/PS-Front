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
  pageSize: number = 10;
  totalLogs: number = 0;
  totalPages: number = 0;
  pageNumbers: number[] = [];

  constructor(private adminService: AdminViewService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    this.adminService.getLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.totalLogs = data.length;
        this.calculatePagination();
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

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalLogs / this.pageSize);
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
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
    
    // Update total and pagination based on filtered results
    this.totalLogs = filtered.length;
    this.calculatePagination();
    
    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.filteredLogs = filtered.slice(startIndex, startIndex + this.pageSize);
  }}


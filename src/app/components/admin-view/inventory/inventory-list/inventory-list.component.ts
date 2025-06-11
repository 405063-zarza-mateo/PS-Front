import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Item } from '../../../../models/item';
import { InventoryService } from '../../../../services/inventory.service';
import { CreateItemComponent } from '../create-item/create-item.component';
import { DeleteItemComponent } from '../delete-item/delete-item.component';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [    
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule,
    DeleteItemComponent,
    CreateItemComponent
  ],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.scss'
})
export class InventoryListComponent implements OnInit, OnDestroy {
  items: Item[] = [];
  filteredItems: Item[] = [];
  paginatedItems: Item[] = [];
  isLoading = true;
  searchTerm = '';
  error = '';
  
  // Propiedades de paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  
  isDeleteModalOpen = false;
  isFormModalOpen = false;
  
  selectedItem: Item | null = null;
  itemToDeleteId: number | null = null;
  successMessage = '';
  isEditMode = false;

  private subscriptions: Subscription[] = [];

  constructor(private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.loadItems();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadItems(): void {
    this.isLoading = true;

    const subscription = this.inventoryService.getItems().subscribe({
      next: (data) => {
        this.items = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los items:', err);
        this.error = 'No se pudieron cargar los items. Por favor, intente nuevamente.';
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

 applyFilters(): void {
  let result = [...this.items];
  
  if (this.searchTerm.trim()) {
    const term = this.searchTerm.toLowerCase().trim();
    result = result.filter(item =>
      item.name?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) 
    );
  }
  
  result.sort((a, b) => {
    const quantityA = a.quantity || 0;
    const quantityB = b.quantity || 0;
    
    if (quantityA !== quantityB) {
      return quantityB - quantityA; 
    }
    
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    
    return nameA.localeCompare(nameB); 
  });
  
  this.filteredItems = result;
  this.updatePagination();
}

  updatePagination(): void {
    this.totalItems = this.filteredItems.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // Ajustar página actual si es necesario
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
    
    // Calcular items para la página actual
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedItems = this.filteredItems.slice(startIndex, endIndex);
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

  openCreateModal(): void {
    this.selectedItem = null;
    this.isEditMode = false;
    this.isFormModalOpen = true;
  }

  openEditModal(id: number): void {
    const item = this.items.find(i => i.id === id);
    if (item) {
      console.log('Abriendo modal de edición para:', item);
      this.selectedItem = { ...item }; // Crear una copia del item
      this.isEditMode = true;
      this.isFormModalOpen = true;
    }
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
    this.selectedItem = null;
    this.isEditMode = false;
  }

  onItemSaved(): void {
    this.closeFormModal();
    this.loadItems();
    this.successMessage = this.isEditMode ? 'Item actualizado con éxito.' : 'Item creado con éxito.';
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  openDeleteModal(id: number): void {
    const item = this.items.find(i => i.id === id);
    if (item) {
      this.selectedItem = item;
      this.itemToDeleteId = id;
      this.isDeleteModalOpen = true;
    }
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.selectedItem = null;
    this.itemToDeleteId = null;
  }

  confirmDelete(id: number): void {
    const subscription = this.inventoryService.deleteItem(id).subscribe({
      next: () => {
        this.items = this.items.filter(item => item.id !== id);
        this.applyFilters(); // Esto actualizará la paginación automáticamente
        this.closeDeleteModal();
        this.successMessage = 'Item eliminado con éxito.';
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error al eliminar el item:', err);
        this.error = 'No se pudo eliminar el item. Por favor, intente nuevamente.';
        this.closeDeleteModal();
      }
    });

    this.subscriptions.push(subscription);
  }

  // Métodos para usar en el template
  getStartItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }
}
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Item } from '../../../../models/item';
import { ItemPostDto } from '../../../../models/itemPostDto';
import { InventoryService } from '../../../../services/inventory.service';

@Component({
  selector: 'app-create-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-item.component.html',
  styleUrl: './create-item.component.scss'
})
export class CreateItemComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen = false;
  @Input() item: Item | null = null;
  @Input() isEditMode = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  
  itemForm: FormGroup;
  isLoading = false;
  error = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService
  ) {
    this.itemForm = this.createForm();
  }

  ngOnInit(): void {
    console.log('OnInit ejecutado - isEditMode:', this.isEditMode);
    if (this.isEditMode && this.item) {
      this.loadItemData();
    }
  }

  // Implementamos OnChanges para detectar cambios en los @Input()
  ngOnChanges(changes: SimpleChanges): void {
    console.log('OnChanges ejecutado:', changes);
    
    // Si el modal se abre y estamos en modo edición
    if (changes['isOpen'] && this.isOpen && this.isEditMode && this.item) {
      this.loadItemData();
    }
    
    // Si cambia el item mientras el modal está abierto
    if (changes['item'] && this.isOpen && this.isEditMode && this.item) {
      this.loadItemData();
    }
    
    // Si cambia el modo de edición
    if (changes['isEditMode']) {
      if (this.isEditMode && this.item) {
        this.loadItemData();
      } else {
        this.resetForm();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      quantity: [0, [Validators.required, Validators.min(0)]],
    });
  }

  private loadItemData(): void {
    console.log('Cargando datos del item:', this.item);
    if (this.item) {
      this.itemForm.patchValue({
        name: this.item.name || '',
        description: this.item.description || '',
        quantity: this.item.quantity || 0,
      });
      console.log('Formulario actualizado con valores:', this.itemForm.value);
    }
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      this.isLoading = true;
      this.error = '';

      const formData = this.itemForm.value;
      
      if (this.isEditMode && this.item) {
        this.updateItem(formData);
      } else {
        this.createItem(formData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createItem(formData: any): void {
    const itemDto: ItemPostDto = {
      name: formData.name,
      description: formData.description,
      quantity: formData.quantity,
    };

    const aux = this.inventoryService.createItem(itemDto).subscribe({
      next: () => {
        this.isLoading = false;
        this.saved.emit();
        this.resetForm();
      },
      error: (err) => {
        console.error('Error creating item:', err);
        this.error = 'Error al crear el item. Por favor, intente nuevamente.';
        this.isLoading = false;
      }
    });

    this.subscriptions.push(aux)
  }

  private updateItem(formData: any): void {
    if (!this.item?.id) return;

    const updateData: Partial<Item> = {
      name: formData.name,
      description: formData.description,
      quantity: formData.quantity,
    };

    const aux = this.inventoryService.updateItem(this.item.id, updateData).subscribe({
      next: () => {
        this.isLoading = false;
        this.saved.emit();
        this.resetForm();
      },
      error: (err) => {
        console.error('Error updating item:', err);
        this.error = 'Error al actualizar el item. Por favor, intente nuevamente.';
        this.isLoading = false;
      }
    });

    this.subscriptions.push(aux)
  }

  onCancel(): void {
    this.close.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.itemForm.reset();
    this.error = '';
    this.isLoading = false;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.itemForm.controls).forEach(key => {
      const control = this.itemForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.itemForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} debe ser mayor o igual a ${field.errors['min'].min}`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nombre',
      description: 'Descripción',
      category: 'Categoría',
      quantity: 'Cantidad',
      price: 'Precio'
    };
    return labels[fieldName] || fieldName;
  }
}
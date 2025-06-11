import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-item.component.html',
  styleUrl: './delete-item.component.scss'
})
export class DeleteItemComponent {
  @Input() isOpen = false;
  @Input() itemName : String= '';
  @Input() itemId: number | null = null;
  
  @Output() confirm = new EventEmitter<number>();
  @Output() cancel = new EventEmitter<void>();
  
  onConfirm(): void {
    if (this.itemId !== null) {
      this.confirm.emit(this.itemId);
    }
  }
  
  onCancel(): void {
    this.cancel.emit();
  }
}

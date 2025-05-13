import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-news.component.html',
  styleUrl: './delete-news.component.scss'
})
export class DeleteNewsComponent {
  @Input() isOpen = false;
  @Input() newsId: number | null = null;
  
  @Output() confirm = new EventEmitter<number>();
  @Output() cancel = new EventEmitter<void>();

  
  
  onConfirm(): void {
    if (this.newsId !== null) {
      this.confirm.emit(this.newsId);
    }
  }
  
  onCancel(): void {
    this.cancel.emit();
  }

  
}

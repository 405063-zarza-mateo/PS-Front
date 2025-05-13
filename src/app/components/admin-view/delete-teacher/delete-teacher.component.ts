import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-teacher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-teacher.component.html',
  styleUrl: './delete-teacher.component.scss'
})
export class DeleteTeacherComponent {
  @Input() isOpen = false;
  @Input() teacherName = '';
  @Input() teacherId: number | null = null;
  
  @Output() confirm = new EventEmitter<number>();
  @Output() cancel = new EventEmitter<void>();
  
  onConfirm(): void {
    if (this.teacherId !== null) {
      this.confirm.emit(this.teacherId);
    }
  }
  
  onCancel(): void {
    this.cancel.emit();
  }
}

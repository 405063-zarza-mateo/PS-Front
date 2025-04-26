import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-student',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-student.component.html',
  styleUrl: './delete-student.component.scss'
})
export class DeleteStudentComponent {
  @Input() isOpen = false;
  @Input() studentName = '';
  @Input() studentId: number | null = null;
  
  @Output() confirm = new EventEmitter<number>();
  @Output() cancel = new EventEmitter<void>();
  
  onConfirm(): void {
    if (this.studentId !== null) {
      this.confirm.emit(this.studentId);
    }
  }
  
  onCancel(): void {
    this.cancel.emit();
  }
}

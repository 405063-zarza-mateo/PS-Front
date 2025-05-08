import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewsService } from '../../../services/news-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-news',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-news.component.html',
  styleUrls: ['./create-news.component.scss']
})
export class CreateNewsComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  newsForm: FormGroup;
  submitting = false;
  imagePreview: string | null = null;
  imageFile: File | null = null;
  private subscriptions: Subscription[] = [];


  constructor(
    private fb: FormBuilder,
    private newsService: NewsService
  ) {
    this.newsForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      body: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void { }


  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.imageFile = inputElement.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.imageFile);
    }
  }

  removeImage(): void {
    this.imageFile = null;
    this.imagePreview = null;
  }

  onSubmit(): void {
    if (this.newsForm.invalid) {
      this.newsForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const newsData = {
      title: this.newsForm.get('title')?.value,
      body: this.newsForm.get('body')?.value,
      image: this.imageFile || undefined
    };

    const formData = this.newsService.prepareFormData(newsData);
    const aux = this.newsService.createNews(formData).subscribe({
      next: () => {
        this.submitting = false;
      },
      error: (err) => {
        console.error('Error al crear la noticia', err);
        this.submitting = false;
        alert('Error al crear la noticia: ' + err.message);
      }
    });

    this.subscriptions.push(aux);

    this.closeModal();
  }

  closeModal(): void { 
    this.close.emit();
  }
}
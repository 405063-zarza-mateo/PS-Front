import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewsService } from '../../../services/news-service.service';
import { Subscription } from 'rxjs';
import { News } from '../../../models/news';

@Component({
  selector: 'app-create-news',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-news.component.html',
  styleUrls: ['./create-news.component.scss']
})
export class CreateNewsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() newsItem: News | null = null;
  @Output() close = new EventEmitter<void>();

  newsForm: FormGroup;
  submitting = false;
  imagePreview: string | null = null;
  imageFile: File | null = null;
  imageChanged = false;
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

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['newsItem'] && this.newsItem) {
      this.loadNewsData();
    } else if (changes['isOpen'] && this.isOpen && !this.newsItem) {
      this.resetForm();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadNewsData(): void {
    if (this.newsItem) {
      this.newsForm.patchValue({
        title: this.newsItem.title,
        body: this.newsItem.body
      });

      if (this.newsItem.imageUrl) {
        this.imagePreview = this.newsItem.imageUrl;
        this.imageChanged = false;
      }
    }
  }

  resetForm(): void {
    this.newsForm.reset();
    this.imageFile = null;
    this.imagePreview = null;
    this.imageChanged = false;
    this.submitting = false;
  }

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.imageFile = inputElement.files[0];
      this.imageChanged = true;

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
    this.imageChanged = true;
  }

  onSubmit(): void {
    if (this.newsForm.invalid) {
      this.newsForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const newsData = {
      title: this.newsForm.get('title')?.value,
      body: this.newsForm.get('body')?.value
    };

    let request;
    
    // Determine whether we're creating or updating
    if (this.newsItem) {
      // If updating and we have an image or the image was removed
      if (this.imageFile || this.imageChanged) {
        const formData = this.newsService.prepareFormData({
          ...newsData,
          image: this.imageFile || undefined
        });
        request = this.newsService.updateNewsWithImage(this.newsItem.id, formData);
      } else {
        // If updating without changing the image
        request = this.newsService.updateNewsWithoutImage(this.newsItem.id, newsData);
      }
    } else {
      // If creating a new news item
      const formData = this.newsService.prepareFormData({
        ...newsData,
        image: this.imageFile || undefined
      });
      request = this.newsService.createNews(formData);
    }

    const subscription = request.subscribe({
      next: () => {
        this.submitting = false;
        this.close.emit();
      },
      error: (err) => {
        console.error(`Error al ${this.newsItem ? 'actualizar' : 'crear'} la noticia`, err);
        this.submitting = false;
        alert(`Error al ${this.newsItem ? 'actualizar' : 'crear'} la noticia: ${err.message}`);
      }
    });

    this.subscriptions.push(subscription);
  }
}
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NewsService } from '../../../services/news-service.service';
import { News } from '../../../models/news';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../../services/auth-service.service';
import { RouterLink } from '@angular/router';
import { CreateNewsComponent } from "../../admin-view/create-news/create-news.component";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [DatePipe, CommonModule, RouterLink, CreateNewsComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit, OnDestroy {

  news: News[] = [];
  loading = true;
  error = false;
  isCreateModalOpen = false;

  private subscriptions: Subscription[] = [];


  constructor(
    private newsService: NewsService,
    public authService: AuthService
  ) { }


  ngOnInit(): void {
    this.loadNews();
  }



  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadNews(): void {
    this.loading = true;
    this.error = false;

    const aux = this.newsService.getAllNews().subscribe({
      next: (data) => {
        // Transformar datos si es necesario
        this.news = data.map(item => ({
          ...item,
          category: 'Noticia', // Establecer categoría por defecto
          summary: item.body.length > 100 ? item.body.substring(0, 100) + '...' : item.body
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar noticias', err);
        this.loading = false;
        this.error = true;
      }
    });

    this.subscriptions.push(aux);
  }

  openCreateNewsModal(): void {
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.loadNews();
    this.isCreateModalOpen = false;
  }

  deleteNews(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta noticia?')) {
      this.newsService.deleteNews(id).subscribe({
        next: () => {
          // Recargar las noticias después de eliminar
          this.loadNews();
        },
        error: (err) => {
          console.error('Error al eliminar la noticia', err);
          alert('Error al eliminar la noticia');
        }
      });
    }
  }

  editNews(arg0: number) {
    throw new Error('Method not implemented.');
    }
}

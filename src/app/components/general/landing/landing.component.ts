import { Component, OnDestroy, OnInit } from '@angular/core';
import { NewsService } from '../../../services/news-service.service';
import { News } from '../../../models/news';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../../services/auth-service.service';
import { RouterLink } from '@angular/router';
import { CreateNewsComponent } from "../../admin-view/create-news/create-news.component";
import { Subscription } from 'rxjs';
import { DeleteNewsComponent } from "../../admin-view/delete-news/delete-news.component";

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [DatePipe, CommonModule, RouterLink, CreateNewsComponent, DeleteNewsComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit, OnDestroy {

  news: News[] = [];
  visibleNews: News[] = [];
  loading = true;
  error = false;
  isCreateModalOpen = false;

  // Variables para el carrusel de noticias
  currentIndex = 0;
  itemsPerPage = 3;
  pageIndicators: number[] = [];

  // Variable para edición de noticias
  selectedNews: News | null = null;


  isDeleteModalOpen = false;

  newsToDeleteId: number | null = null;


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
        this.news = data.map(item => ({
          ...item,
          category: 'Noticia', // Establecer categoría por defecto
          imageUrl: 'http://localhost:8080/api/news/image/' + item.imageRoute,
          summary: item.body.length > 100 ? item.body.substring(0, 100) + '...' : item.body
        }));
        this.loading = false;
        this.news.reverse();

        // Una vez cargadas las noticias, actualizamos el carrusel
        this.updateVisibleNews();
        this.updatePageIndicators();
      },
      error: (err) => {
        console.error('Error al cargar noticias', err);
        this.loading = false;
        this.error = true;
      }
    });
    this.subscriptions.push(aux);
  }

  updateVisibleNews(): void {
    this.visibleNews = this.news.slice(this.currentIndex, this.currentIndex + this.itemsPerPage);
  }

  updatePageIndicators(): void {
    const pageCount = Math.ceil(this.news.length / this.itemsPerPage);
    this.pageIndicators = Array(pageCount).fill(0).map((_, i) => i);
  }



  showNextNews(): void {
    if (this.currentIndex + this.itemsPerPage < this.news.length) {
      this.currentIndex += this.itemsPerPage;
      this.updateVisibleNews();
    }
  }

  showPreviousNews(): void {
    if (this.currentIndex - this.itemsPerPage >= 0) {
      this.currentIndex -= this.itemsPerPage;
      this.updateVisibleNews();
    }
  }

  openCreateNewsModal(): void {
    console.log(this.news)
    this.selectedNews = null;
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.loadNews();
    this.isCreateModalOpen = false;
    this.selectedNews = null;
  }

/*   deleteNews(id: number): void {
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
  } */

  editNews(id: number): void {
    // Buscar la noticia con el ID proporcionado
    const newsToEdit = this.news.find(item => item.id === id);

    if (newsToEdit) {
      this.selectedNews = newsToEdit;
      this.isCreateModalOpen = true;
    } else {
      console.error('No se encontró la noticia con ID:', id);
      alert('No se pudo encontrar la noticia para editar');
    }
  }

  openDeleteModal(id: number): void {
    const news = this.news.find(s => s.id === id);
    if (news) {
      this.selectedNews = news;
      this.newsToDeleteId = id;
      this.isDeleteModalOpen = true;
    }
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.selectedNews = null;
    this.loadNews();
    this.newsToDeleteId = null;
  }

  confirmDelete(id: number): void {
    const subscription = this.newsService.deleteNews(id).subscribe({
      next: () => {
        this.news = this.news.filter(news => news.id !== id);
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Error al eliminar noticia:', err);
        this.closeDeleteModal();
      }
    });

    this.subscriptions.push(subscription);
  }
}
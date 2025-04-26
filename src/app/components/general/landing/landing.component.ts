import { Component, OnInit } from '@angular/core';
import { NewsService } from '../../../services/news-service.service';
import { News } from '../../../models/news';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit{
  news : News[]= [];
  constructor(private newsService: NewsService) {}
  
  ngOnInit(): void {
    this.newsService.getRecentNews().subscribe(news => {
      this.news = news;
    });
  }
}

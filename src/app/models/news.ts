export interface News {
  id: number;
  title: string;
  body: string;
  imageUrl: string;
  imageRoute: string;
  time: string;
  category?: string; // Agregado para mantener compatibilidad con la landing  }
}
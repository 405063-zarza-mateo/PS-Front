import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {

selectedCategory: string = 'all';
  
  // Aquí puedes agregar/editar fácilmente las preguntas frecuentes
  faqs: FAQ[] = [
    // Categoría: General
    {
      id: 1,
      category: 'general',
      question: '¿Qué es El Galponcito?',
      answer: 'El Galponcito es un sistema de gestión educativa desarrollado para el centro comunitario y comedor escolar que brinda apoyo educativo y alimentación a niños y jóvenes en situación de vulnerabilidad en Villa Revol, Córdoba.',
      isOpen: false
    },
    {
      id: 2,
      category: 'general',
      question: '¿Quién desarrolló el sistema?',
      answer: 'El sistema fue desarrollado por Mateo Zarza Lascano como proyecto final de la carrera de Programación en la Universidad Tecnológica de Córdoba, destinado al servicio comunitario a través de Ateneo Juventus Córdoba.',
      isOpen: false
    },
    {
      id: 3,
      category: 'general',
      question: '¿El sistema es gratuito?',
      answer: 'Sí, el sistema es completamente gratuito. Es un proyecto sin fines de lucro, de carácter educativo y social desarrollado para beneficiar a la comunidad.',
      isOpen: false
    },

    // Categoría: Registro y Acceso
    {
      id: 4,
      category: 'registro',
      question: '¿Cómo puedo registrarme como profesor voluntario?',
      answer: 'Para registrarte como profesor voluntario, debes proporcionar una dirección de correo electrónico válida, crear una contraseña segura y completar tu información de perfil. Tu cuenta requerirá aprobación administrativa antes de obtener acceso al sistema.',
      isOpen: false
    },
    {
      id: 5,
      category: 'registro',
      question: '¿Cuánto tiempo tarda la aprobación de mi cuenta?',
      answer: 'La administración será notificada inmediatamente de tu registro, y responderá lo antes posible. Cuando se haya tomado una decisión, se le notificará a través del email proporcionado.',
      isOpen: false
    },
    {
      id: 6,
      category: 'registro',
      question: '¿Qué hago si olvido mi contraseña?',
      answer: 'Si olvidas tu contraseña, se te enviará al email una nueva, la cual podrás editar fácilmente una vez ingresado a tu cuenta.',
      isOpen: false
    },

    // Categoría: Funcionalidades
    {
      id: 7,
      category: 'funcionalidades',
      question: '¿Qué puede hacer un profesor voluntario en el sistema?',
      answer: 'Los profesores voluntarios pueden: acceder a la lista de alumnos asignados, añadir alumnos o editar dicha lista, crear reseñas diarias sobre el trabajo realizado con cada niño y revisar reseñas pasadas.',
      isOpen: false
    },
    {
      id: 8,
      category: 'funcionalidades',
      question: '¿Qué funciones tienen los administradores?',
      answer: 'Los administradores pueden: realizar todo lo que hacen los profesores, administrar profesores, acpetar o denegar nuevos registros, revisar historial de acciones, revisar y generar estadísticas y agregar noticias a la pantalla principal.',
      isOpen: false
    },
    {
      id: 9,
      category: 'funcionalidades',
      question: '¿Cómo creo una reseña diaria?',
      answer: 'Una vez que accedas al sistema como profesor, podrás ver la lista de tus alumnos asignados. Selecciona un alumno y, con el botón de la izquierda, podrás generar una reseña en base a su rendimiento en las tres asignaturas normalmente trabajadas y su disciplina. Al hacer esto, se registrará tanto tu asistencia como la del alumno. Por favor recuerda llenar los datos con honestidad.',
      isOpen: false
    },
    {
      id: 10,
      category: 'funcionalidades',
      question: '¿Puedo ver el historial de reseñas de un alumno?',
      answer: 'Sí, el sistema permite ver el historial completo de reseñas de cada alumno, lo que facilita el seguimiento del progreso educativo a lo largo del tiempo y permite continuidad en el apoyo.',
      isOpen: false
    },

    // Categoría: Donaciones
    {
      id: 11,
      category: 'donaciones',
      question: '¿Cómo puedo hacer una donación?',
      answer: 'Puedes realizar donaciones a través de nuestra plataforma utilizando MercadoPago. Aceptamos transferencias bancarias, tarjetas de crédito y tarjetas de débito. Haz clic en el botón "Colaborar" en la página principal.',
      isOpen: false
    },
    {
      id: 12,
      category: 'donaciones',
      question: '¿A qué se destinan las donaciones?',
      answer: 'El 100% de las donaciones recibidas se destina a: insumos para el desayuno de los niños, materiales educativos y didácticos, y mejoras en la infraestructura del comedor. Todas las donaciones son administradas por Ateneo Juventus Córdoba, organización sin fines de lucro encargada de El Galponcito.',
      isOpen: false
    },
    {
      id: 13,
      category: 'donaciones',
      question: '¿Las donaciones son seguras?',
      answer: 'Sí, todas las donaciones se procesan a través de MercadoPago, una plataforma segura y confiable. No se almacena ni se guarda información sensible relacionada al pago.',
      isOpen: false
    },

    // Categoría: Seguridad y Privacidad
    {
      id: 14,
      category: 'seguridad',
      question: '¿Cómo se protegen los datos de los niños?',
      answer: 'Los datos de menores están protegidos con medidas especiales conforme a la Ley Nacional 25.326 y la Convención sobre los Derechos del Niño. Solo personal autorizado puede acceder a esta información, y está prohibido compartir información con terceros no autorizados.',
      isOpen: false
    },
    {
      id: 15,
      category: 'seguridad',
      question: '¿Qué medidas de seguridad implementa el sistema?',
      answer: 'El sistema implementa: encriptación de datos sensibles, acceso mediante autenticación segura, registros de auditoría de accesos, copias de seguridad periódicas, y acceso restringido únicamente a personal autorizado.',
      isOpen: false
    },
    {
      id: 16,
      category: 'seguridad',
      question: '¿Puedo compartir mi información de acceso?',
      answer: 'No, está estrictamente prohibido compartir credenciales de acceso. Cada usuario es responsable de mantener la confidencialidad de sus datos de acceso y debe notificar inmediatamente cualquier uso no autorizado.',
      isOpen: false
    },

 
  ];

  constructor() { }

  // Obtener categorías únicas para el filtro
  get categories() {
    const cats = [...new Set(this.faqs.map(faq => faq.category))];
    return cats.map(cat => ({
      value: cat,
      label: this.getCategoryLabel(cat)
    }));
  }

  // Obtener etiqueta legible para la categoría
  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'general': 'General',
      'registro': 'Registro y Acceso',
      'funcionalidades': 'Funcionalidades',
      'donaciones': 'Donaciones',
      'seguridad': 'Seguridad y Privacidad',
      'soporte': 'Soporte'
    };
    return labels[category] || category;
  }

  // Filtrar FAQs por categoría
  get filteredFaqs() {
    if (this.selectedCategory === 'all') {
      return this.faqs;
    }
    return this.faqs.filter(faq => faq.category === this.selectedCategory);
  }

  // Alternar pregunta abierta/cerrada
  toggleFaq(id: number) {
    const faq = this.faqs.find(f => f.id === id);
    if (faq) {
      faq.isOpen = !faq.isOpen;
    }
  }

  // Filtrar por categoría
  filterByCategory(category: string) {
    this.selectedCategory = category;
    // Cerrar todas las preguntas al cambiar de categoría
    this.faqs.forEach(faq => faq.isOpen = false);
  }

  // Buscar en preguntas y respuestas
  searchFaqs(searchTerm: string) {
    if (!searchTerm.trim()) {
      return this.filteredFaqs;
    }
    
    const term = searchTerm.toLowerCase();
    return this.filteredFaqs.filter(faq => 
      faq.question.toLowerCase().includes(term) || 
      faq.answer.toLowerCase().includes(term)
    );
  }
}
/* export const environment = {
  production: false,
  apiUrlUsers: 'http://localhost:8081/api',
  apiUrlUsersNews: 'http://localhost:8080/api',
  apiUrlUsersMp:'http://localhost:8082/api',
  apiUrlUsersInv: 'http://localhost:8083/api',

  appName: 'El Galponcito',
  appVersion: '1.0.0'
}; */

export const environment = {
  production: false, // Keep this as false for development. Your Dockerfile handles the production build.
  apiUrlUsers: '/api', // Nginx will proxy requests like /api/users/login to http://user-service:8081/
  apiUrlUsersNews: '/api', // Nginx will proxy requests like /api/news/latest to http://news-service:8080/
  apiUrlUsersMp: '/api', // Nginx will proxy requests like /api/payments/create to http://mp-service:8082/
  apiUrlUsersInv: '/api', // Nginx will proxy requests like /api/inventory/items to http://inventory-service:8083/

  appName: 'El Galponcito',
  appVersion: '1.0.0'
};
//Interfaz del response del backend refleja la respuesta de la API
export interface ICurrentUserResponse {
  userId: string;
  email: string;
  username: string;
}

// Datos personales editables (locales hasta que el backend los soporte)
export interface IPersonalData {
  description: string;
  privacy: "public" | "contacts" | "private";
}

// Datos corporativos (solo lectura)
export interface ICorporateData {
  role: string;
  department: string;
  area: string;
  hierarchyLevel: string;
  supervisor: string;
}
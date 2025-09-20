import { Injectable } from '@angular/core';

export interface StorageData {
  token?: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  user_data?: any;
  user_role?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly storageKey = 'focus_loop_data';

  constructor() {}

  /**
   * Guarda un valor en el almacenamiento local
   */
  set(key: string, value: any): void {
    try {
      const data = this.getAll();
      data[key] = value;
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error al guardar en storage:', error);
    }
  }

  /**
   * Obtiene un valor del almacenamiento local
   */
  get(key: string): string {
    try {
      const data = this.getAll();
      return data[key] || '';
    } catch (error) {
      console.error('Error al obtener del storage:', error);
      return '';
    }
  }

  /**
   * Obtiene todos los datos del almacenamiento
   */
  getAll(): StorageData {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error al obtener todos los datos del storage:', error);
      return {};
    }
  }

  /**
   * Elimina un valor específico del almacenamiento
   */
  delete(key: string): void {
    try {
      const data = this.getAll();
      delete data[key];
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error al eliminar del storage:', error);
    }
  }

  /**
   * Elimina todos los datos del almacenamiento
   */
  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error al limpiar el storage:', error);
    }
  }

  /**
   * Verifica si existe una clave en el almacenamiento
   */
  has(key: string): boolean {
    try {
      const data = this.getAll();
      return key in data && data[key] !== null && data[key] !== undefined;
    } catch (error) {
      console.error('Error al verificar existencia en storage:', error);
      return false;
    }
  }

  /**
   * Obtiene un objeto JSON del almacenamiento
   */
  getObject(key: string): any {
    try {
      const value = this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error al obtener objeto del storage:', error);
      return null;
    }
  }

  /**
   * Guarda un objeto JSON en el almacenamiento
   */
  setObject(key: string, value: any): void {
    try {
      this.set(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error al guardar objeto en storage:', error);
    }
  }

  /**
   * Métodos específicos para la aplicación
   */
  setToken(token: string): void {
    this.set('token', token);
  }

  getToken(): string {
    return this.get('token');
  }

  setUserData(user: any): void {
    this.setObject('user_data', user);
    this.set('user_id', user.user_id?.toString() || '');
    this.set('user_name', user.full_name || '');
    this.set('user_email', user.email || '');
    this.set('user_role', user.role || '');
  }

  getUserData(): any {
    return this.getObject('user_data');
  }

  getUserId(): string {
    return this.get('user_id');
  }

  getUserName(): string {
    return this.get('user_name');
  }

  getUserEmail(): string {
    return this.get('user_email');
  }

  getUserRole(): string {
    return this.get('user_role');
  }

  /**
   * Limpia todos los datos de usuario (logout)
   */
  clearUserData(): void {
    this.delete('token');
    this.delete('user_id');
    this.delete('user_name');
    this.delete('user_email');
    this.delete('user_data');
    this.delete('user_role');
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return Boolean(token && token !== 'undefined' && token !== '');
  }
}

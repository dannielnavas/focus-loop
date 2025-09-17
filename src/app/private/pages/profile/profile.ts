import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface ProfileForm {
  full_name: string;
  email: string;
  profile_image: string;
  role: string;
  subscription_plan_id: string;
}

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface UserPreferences {
  email_notifications: boolean;
  dark_mode: boolean;
  task_reminders: boolean;
}

@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export default class Profile {
  private readonly router = inject(Router);

  // Signals para el estado del formulario
  profileForm = signal<ProfileForm>({
    full_name: '',
    email: '',
    profile_image: '',
    role: 'user',
    subscription_plan_id: 'free',
  });

  passwordForm = signal<PasswordForm>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  preferences = signal<UserPreferences>({
    email_notifications: true,
    dark_mode: true,
    task_reminders: true,
  });

  // Signals para mensajes y estado
  message = signal('');
  messageType = signal<'success' | 'error'>('success');
  isLoading = signal(false);

  constructor() {
    this.loadUserProfile();
  }

  // Computed para validar el formulario
  isFormValid = computed(() => {
    const form = this.profileForm();
    return form.full_name.trim() !== '' && form.email.trim() !== '';
  });

  isPasswordFormValid = computed(() => {
    const form = this.passwordForm();
    return (
      form.current_password.trim() !== '' &&
      form.new_password.trim() !== '' &&
      form.confirm_password.trim() !== '' &&
      form.new_password === form.confirm_password &&
      form.new_password.length >= 6
    );
  });

  // Cargar perfil del usuario desde localStorage
  loadUserProfile() {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.profileForm.set({
          full_name: user.full_name || '',
          email: user.email || '',
          profile_image: user.profile_image || '',
          role: user.role || 'user',
          subscription_plan_id: user.subscription_plan_id || 'free',
        });
      } catch (error) {
        console.error('Error loading user profile:', error);
        this.showMessage('Error loading user profile', 'error');
      }
    }
  }

  // Seleccionar imagen de perfil
  selectImage() {
    // En una aplicación real, esto abriría un selector de archivos
    // Por ahora, simulamos la selección de una imagen
    const imageUrl = prompt('Enter your profile image URL:');
    if (imageUrl) {
      this.profileForm.update((form) => ({
        ...form,
        profile_image: imageUrl,
      }));
    }
  }

  // Guardar perfil
  saveProfile() {
    if (!this.isFormValid()) {
      this.showMessage('Please complete all required fields', 'error');
      return;
    }

    this.isLoading.set(true);

    // Simular guardado (en una aplicación real, esto haría una llamada a la API)
    setTimeout(() => {
      try {
        // Guardar en localStorage
        const userData = {
          ...this.profileForm(),
          preferences: this.preferences(),
        };
        localStorage.setItem('user_data', JSON.stringify(userData));

        this.showMessage('Profile updated successfully', 'success');
        this.isLoading.set(false);
      } catch (error) {
        console.error('Error saving profile:', error);
        this.showMessage('Error saving profile', 'error');
        this.isLoading.set(false);
      }
    }, 1000);
  }

  // Cambiar contraseña
  changePassword() {
    if (!this.isPasswordFormValid()) {
      this.showMessage(
        'Please complete all password fields correctly',
        'error'
      );
      return;
    }

    this.isLoading.set(true);

    // Simular cambio de contraseña (en una aplicación real, esto haría una llamada a la API)
    setTimeout(() => {
      try {
        // Aquí se haría la llamada a la API para cambiar la contraseña
        console.log('Changing password...');

        // Limpiar formulario de contraseña
        this.passwordForm.set({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });

        this.showMessage('Password changed successfully', 'success');
        this.isLoading.set(false);
      } catch (error) {
        console.error('Error changing password:', error);
        this.showMessage('Error changing password', 'error');
        this.isLoading.set(false);
      }
    }, 1000);
  }

  // Resetear formulario
  resetForm() {
    this.loadUserProfile();
    this.passwordForm.set({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    this.message.set('');
  }

  // Mostrar mensaje
  showMessage(text: string, type: 'success' | 'error') {
    this.message.set(text);
    this.messageType.set(type);

    // Clear message after 5 seconds
    setTimeout(() => {
      this.message.set('');
    }, 5000);
  }

  // Navigate back
  goBack() {
    this.router.navigate(['/private']);
  }
}

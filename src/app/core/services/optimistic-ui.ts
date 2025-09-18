import { Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { NotificationService } from './notification.service';

export interface OptimisticOperation<T> {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: T;
  originalData?: T;
  timestamp: number;
  status: 'pending' | 'success' | 'error';
  error?: any;
}

@Injectable({
  providedIn: 'root',
})
export class OptimisticUIService {
  private operations = signal<Map<string, OptimisticOperation<any>>>(new Map());
  private isProcessing = signal(false);
  private readonly notificationService = new NotificationService();

  /**
   * Ejecuta una operación de manera optimista
   * @param operationId ID único para la operación
   * @param optimisticData Datos que se mostrarán inmediatamente en la UI
   * @param actualOperation Operación real que se ejecutará en el servidor
   * @param rollbackData Datos originales para rollback en caso de error
   */
  executeOptimistic<T>(
    operationId: string,
    optimisticData: T,
    actualOperation: Observable<T>,
    rollbackData?: T
  ): Observable<T> {
    // 1. Agregar operación optimista
    const operation: OptimisticOperation<T> = {
      id: operationId,
      type: 'update',
      data: optimisticData,
      originalData: rollbackData,
      timestamp: Date.now(),
      status: 'pending',
    };

    this.addOperation(operation);

    // 2. Ejecutar operación real
    return actualOperation.pipe(
      tap((result) => {
        // 3. Marcar como exitosa
        this.updateOperationStatus(operationId, 'success', result);
        this.notificationService.success(
          'Success operation',
          'The changes have been saved correctly'
        );
      }),
      catchError((error) => {
        // 4. Marcar como error y hacer rollback
        this.updateOperationStatus(operationId, 'error', undefined, error);
        this.notificationService.error(
          'Error in the operation',
          'The changes could not be saved. The previous state has been restored.'
        );
        return throwError(() => error);
      }),
      finalize(() => {
        // 5. Limpiar operación después de un tiempo
        setTimeout(() => {
          this.removeOperation(operationId);
        }, 3000);
      })
    );
  }

  /**
   * Ejecuta una operación de creación optimista
   */
  createOptimistic<T>(
    operationId: string,
    optimisticData: T,
    actualOperation: Observable<T>
  ): Observable<T> {
    const operation: OptimisticOperation<T> = {
      id: operationId,
      type: 'create',
      data: optimisticData,
      timestamp: Date.now(),
      status: 'pending',
    };

    this.addOperation(operation);

    return actualOperation.pipe(
      tap((result) => {
        this.updateOperationStatus(operationId, 'success', result);
        this.notificationService.success(
          'Element created',
          'The new element has been created successfully'
        );
      }),
      catchError((error) => {
        this.updateOperationStatus(operationId, 'error', undefined, error);
        this.notificationService.error(
          'Error creating element',
          'The element could not be created. Try again.'
        );
        return throwError(() => error);
      }),
      finalize(() => {
        setTimeout(() => {
          this.removeOperation(operationId);
        }, 3000);
      })
    );
  }

  /**
   * Ejecuta una operación de eliminación optimista
   */
  deleteOptimistic<T>(
    operationId: string,
    optimisticData: T,
    actualOperation: Observable<any>
  ): Observable<any> {
    const operation: OptimisticOperation<T> = {
      id: operationId,
      type: 'delete',
      data: optimisticData,
      timestamp: Date.now(),
      status: 'pending',
    };

    this.addOperation(operation);

    return actualOperation.pipe(
      tap(() => {
        this.updateOperationStatus(operationId, 'success');
        this.notificationService.success(
          'Element deleted',
          'The element has been deleted successfully'
        );
      }),
      catchError((error) => {
        this.updateOperationStatus(operationId, 'error', undefined, error);
        this.notificationService.error(
          'Error deleting element',
          'The element could not be deleted. Try again.'
        );
        return throwError(() => error);
      }),
      finalize(() => {
        setTimeout(() => {
          this.removeOperation(operationId);
        }, 3000);
      })
    );
  }

  private addOperation<T>(operation: OptimisticOperation<T>) {
    this.operations.update((ops) => {
      const newOps = new Map(ops);
      newOps.set(operation.id, operation);
      return newOps;
    });
  }

  private updateOperationStatus<T>(
    operationId: string,
    status: 'success' | 'error',
    data?: T,
    error?: any
  ) {
    this.operations.update((ops) => {
      const newOps = new Map(ops);
      const operation = newOps.get(operationId);
      if (operation) {
        newOps.set(operationId, {
          ...operation,
          status,
          data: data || operation.data,
          error,
        });
      }
      return newOps;
    });
  }

  private removeOperation(operationId: string) {
    this.operations.update((ops) => {
      const newOps = new Map(ops);
      newOps.delete(operationId);
      return newOps;
    });
  }

  /**
   * Obtiene todas las operaciones pendientes
   */
  getPendingOperations(): OptimisticOperation<any>[] {
    const ops = this.operations();
    return Array.from(ops.values()).filter((op) => op.status === 'pending');
  }

  /**
   * Obtiene todas las operaciones con error
   */
  getErrorOperations(): OptimisticOperation<any>[] {
    const ops = this.operations();
    return Array.from(ops.values()).filter((op) => op.status === 'error');
  }

  /**
   * Limpia todas las operaciones
   */
  clearAllOperations() {
    this.operations.set(new Map());
  }

  /**
   * Verifica si hay operaciones pendientes
   */
  hasPendingOperations(): boolean {
    return this.getPendingOperations().length > 0;
  }

  /**
   * Genera un ID único para operaciones
   */
  generateOperationId(prefix: string = 'op'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

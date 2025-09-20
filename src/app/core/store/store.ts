import { Injectable, signal } from '@angular/core';
import { SprintResponse } from '../models/sprint.model';
import { TaskResponse } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class Store {
  private taskForWork = signal<TaskResponse[]>([]);
  private oneTaskForWork = signal<TaskResponse | null>(null);
  private sprintId = signal<number | null>(null);
  private sprints = signal<SprintResponse[]>([]);
  private tasks = signal<TaskResponse[]>([]);
  private optimisticTasks = signal<TaskResponse[]>([]);
  private optimisticSprints = signal<SprintResponse[]>([]);

  getTaskForWork() {
    return this.taskForWork();
  }

  setTaskForWork(task: TaskResponse[]) {
    this.taskForWork.set(task);
  }

  getOneTaskForWork() {
    return this.oneTaskForWork();
  }

  setOneTaskForWork(task: TaskResponse) {
    this.oneTaskForWork.set(task);
  }

  getSprintId() {
    return this.sprintId();
  }

  setSprintId(sprintId: number) {
    this.sprintId.set(sprintId);
  }

  // Métodos para sprints
  getSprints() {
    return this.sprints;
  }

  setSprints(sprints: SprintResponse[]) {
    this.sprints.set(sprints);
  }

  // Métodos para tareas
  getTasks() {
    return this.tasks();
  }

  setTasks(tasks: TaskResponse[]) {
    this.tasks.set(tasks);
  }

  // Métodos para estados optimistas
  getOptimisticTasks() {
    return this.optimisticTasks();
  }

  setOptimisticTasks(tasks: TaskResponse[]) {
    this.optimisticTasks.set(tasks);
  }

  addOptimisticTask(task: TaskResponse) {
    this.optimisticTasks.update((tasks) => [...tasks, task]);
  }

  removeOptimisticTask(taskId: number) {
    this.optimisticTasks.update((tasks) =>
      tasks.filter((task) => task.task_id !== taskId)
    );
  }

  updateOptimisticTask(taskId: number, updates: Partial<TaskResponse>) {
    this.optimisticTasks.update((tasks) =>
      tasks.map((task) =>
        task.task_id === taskId ? { ...task, ...updates } : task
      )
    );
  }

  getOptimisticSprints() {
    return this.optimisticSprints();
  }

  setOptimisticSprints(sprints: SprintResponse[]) {
    this.optimisticSprints.set(sprints);
  }

  addOptimisticSprint(sprint: SprintResponse) {
    this.optimisticSprints.update((sprints) => [...sprints, sprint]);
  }

  removeOptimisticSprint(sprintId: number) {
    this.optimisticSprints.update((sprints) =>
      sprints.filter((sprint) => sprint.sprint_id !== sprintId)
    );
  }

  updateOptimisticSprint(sprintId: number, updates: Partial<SprintResponse>) {
    this.optimisticSprints.update((sprints) =>
      sprints.map((sprint) =>
        sprint.sprint_id === sprintId ? { ...sprint, ...updates } : sprint
      )
    );
  }

  // Método para obtener tareas combinadas (reales + optimistas)
  getCombinedTasks(): TaskResponse[] {
    const realTasks = this.tasks();
    const optimisticTasks = this.optimisticTasks();

    // Filtrar tareas optimistas que ya existen en las reales
    const filteredOptimistic = optimisticTasks.filter(
      (optTask) =>
        !realTasks.some((realTask) => realTask.task_id === optTask.task_id)
    );

    return [...realTasks, ...filteredOptimistic];
  }

  // Método para obtener sprints combinados (reales + optimistas)
  getCombinedSprints(): SprintResponse[] {
    const realSprints = this.sprints();
    const optimisticSprints = this.optimisticSprints();

    // Filtrar sprints optimistas que ya existen en los reales
    const filteredOptimistic = optimisticSprints.filter(
      (optSprint) =>
        !realSprints.some(
          (realSprint) => realSprint.sprint_id === optSprint.sprint_id
        )
    );

    return [...realSprints, ...filteredOptimistic];
  }
}

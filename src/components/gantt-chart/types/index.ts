export interface Task {
  id: string;
  name: string;
  start: string;
  end: string;
  progress?: number;
  dependencies?: string[];
  color?: string;
  type?: 'task' | 'milestone' | 'project';
}

export interface Dependency {
  fromId: string;
  toId: string;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
} 
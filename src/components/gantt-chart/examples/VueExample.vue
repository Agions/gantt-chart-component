<template>
  <div class="gantt-example">
    <h2>Vue 甘特图示例</h2>
    
    <div class="controls">
      <div class="view-modes">
        <button 
          @click="viewMode = 'day'" 
          :class="{ active: viewMode === 'day' }"
        >
          日视图
        </button>
        <button 
          @click="viewMode = 'week'" 
          :class="{ active: viewMode === 'week' }"
        >
          周视图
        </button>
        <button 
          @click="viewMode = 'month'" 
          :class="{ active: viewMode === 'month' }"
        >
          月视图
        </button>
      </div>
      
      <button @click="addTask" class="add-task-btn">
        添加任务
      </button>
    </div>
    
    <div style="height: 400px; width: 100%; border: 1px solid #e0e0e0">
      <GanttChartVue
        :tasks="tasks"
        :startDate="startDate"
        :endDate="endDate"
        :viewMode="viewMode"
        @task-click="handleTaskClick"
      />
    </div>
  </div>
</template>

<script>
import GanttChartVue from '../vue/GanttChartVue.vue';

export default {
  components: {
    GanttChartVue
  },
  data() {
    return {
      tasks: [
        {
          id: 1,
          name: '需求分析',
          start: '2023-10-01',
          end: '2023-10-10',
          color: '#4e85c5'
        },
        {
          id: 2,
          name: '设计阶段',
          start: '2023-10-11',
          end: '2023-10-25',
          color: '#de5454'
        },
        {
          id: 3,
          name: '开发阶段',
          start: '2023-10-15',
          end: '2023-11-15',
          color: '#f2bd53'
        },
        {
          id: 4,
          name: '测试阶段',
          start: '2023-11-10',
          end: '2023-11-30',
          color: '#57c997'
        },
        {
          id: 5,
          name: '部署上线',
          start: '2023-12-01',
          end: '2023-12-05',
          color: '#9d5ff5'
        }
      ],
      startDate: new Date('2023-10-01'),
      endDate: new Date('2023-12-31'),
      viewMode: 'day'
    };
  },
  methods: {
    handleTaskClick(task) {
      console.log('点击了任务:', task);
      alert(`点击了任务: ${task.name}`);
    },
    addTask() {
      const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
      const newTask = {
        id: this.tasks.length + 1,
        name: `新任务 ${this.tasks.length + 1}`,
        start: '2023-11-20',
        end: '2023-12-10',
        color: randomColor
      };
      this.tasks.push(newTask);
    }
  }
};
</script>

<style scoped>
.gantt-example {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
}

.view-modes button {
  margin-right: 10px;
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.view-modes button.active {
  background: #4e85c5;
  color: white;
  border-color: #3a6ea5;
}

.add-task-btn {
  padding: 8px 16px;
  background: #57c997;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-task-btn:hover {
  background: #45b784;
}
</style> 
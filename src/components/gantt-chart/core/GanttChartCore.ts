import { GanttChartOptions, Task } from "./types"
import { daysBetween, addDays, getWeekNumber, getMonthName } from "./utils"

export default class GanttChartCore {
  options: GanttChartOptions
  tasks: Task[]
  startDate: Date
  endDate: Date
  element: HTMLElement | null = null

  // 用于拖拽的临时数据
  private dragData: {
    bar: HTMLElement
    task: Task
    startX: number
    originalLeft: number
  } | null = null

  constructor(options: GanttChartOptions) {
    this.options = options
    this.tasks = options.tasks || []
    this.startDate = options.startDate || new Date()
    this.endDate = options.endDate || this.calculateEndDate()
  }

  /**
   * 计算甘特图结束日期
   */
  calculateEndDate(): Date {
    if (!this.tasks.length) {
      const date = new Date()
      date.setMonth(date.getMonth() + 1)
      return date
    }
    return this.tasks.reduce((max, task) => {
      const end = new Date(task.end)
      return end > max ? end : max
    }, new Date(this.tasks[0].end))
  }

  /**
   * 渲染甘特图到指定DOM元素
   */
  render(element: HTMLElement): void {
    if (!element) return
    this.element = element
    // 清空容器
    while (element.firstChild) {
      element.removeChild(element.firstChild)
    }

    // 创建甘特图容器
    const container = document.createElement("div")
    container.className = "gantt-container"

    // 添加表头
    const header = this.createHeader()
    container.appendChild(header)

    // 添加任务区域
    const taskContainer = this.createTaskContainer()
    container.appendChild(taskContainer)

    // 如果开启依赖关系显示，则添加SVG图层
    if (this.options.enableDependencies) {
      const dependencyLayer = this.createDependencyLayer()
      container.appendChild(dependencyLayer)
    }

    element.appendChild(container)

    // 绑定事件
    this.bindEvents()
  }

  /**
   * 创建时间轴表头
   */
  createHeader(): HTMLElement {
    const header = document.createElement("div")
    header.className = "gantt-header"

    const timeline = document.createElement("div")
    timeline.className = "gantt-timeline"

    const totalDays = daysBetween(this.startDate, this.endDate)
    const columnWidth = this.options.columnWidth || 40

    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(this.startDate)
      date.setDate(date.getDate() + i)

      const dayLabel = document.createElement("div")
      dayLabel.className = "gantt-day"
      dayLabel.style.width = `${columnWidth}px`

      if (this.options.viewMode === "day") {
        dayLabel.textContent = String(date.getDate())
      } else if (this.options.viewMode === "week") {
        dayLabel.textContent = String(getWeekNumber(date))
      } else if (this.options.viewMode === "month") {
        dayLabel.textContent = getMonthName(date, true)
      } else {
        dayLabel.textContent = String(date.getDate())
      }

      timeline.appendChild(dayLabel)
    }

    header.appendChild(timeline)
    return header
  }

  /**
   * 创建任务区域
   */
  createTaskContainer(): HTMLElement {
    const taskContainer = document.createElement("div")
    taskContainer.className = "gantt-task-container"

    const columnWidth = this.options.columnWidth || 40

    // 遍历任务并创建任务行
    this.tasks.forEach((task) => {
      const taskRow = document.createElement("div")
      taskRow.className = "gantt-task-row"

      // 任务标签
      const taskLabel = document.createElement("div")
      taskLabel.className = "gantt-task-label"
      taskLabel.textContent = task.name
      taskRow.appendChild(taskLabel)

      // 任务条
      const taskBar = document.createElement("div")
      taskBar.className = "gantt-task-bar"

      const offset = this.getTaskOffset(task)
      const width = this.getTaskWidth(task)
      // 200px 为任务标签占用的宽度
      taskBar.style.left = `${offset + 200}px`
      taskBar.style.width = `${width}px`
      taskBar.style.backgroundColor = task.color || "#4e85c5"
      taskBar.setAttribute("data-task-id", String(task.id))

      // 如果开启拖拽，则设置样式
      if (this.options.enableDragging !== false) {
        taskBar.style.cursor = "move"
      }

      taskRow.appendChild(taskBar)
      taskContainer.appendChild(taskRow)
    })

    return taskContainer
  }

  /**
   * 获取任务相对于起始日期的偏移量（以像素为单位）
   */
  getTaskOffset(task: Task): number {
    const columnWidth = this.options.columnWidth || 40
    const diffDays = daysBetween(this.startDate, task.start)
    return diffDays * columnWidth
  }

  /**
   * 获取任务条的宽度（以像素为单位）
   */
  getTaskWidth(task: Task): number {
    const columnWidth = this.options.columnWidth || 40
    const taskStart = new Date(task.start)
    const taskEnd = new Date(task.end)
    const diffDays = daysBetween(taskStart, taskEnd)
    return (diffDays + 1) * columnWidth
  }

  /**
   * 创建依赖关系的SVG图层
   */
  createDependencyLayer(): HTMLElement {
    const svgNS = "http://www.w3.org/2000/svg"
    const svg = document.createElementNS(svgNS, "svg")
    svg.classList.add("gantt-dependency-layer")
    svg.style.position = "absolute"
    svg.style.top = "0"
    svg.style.left = "0"
    svg.style.width = "100%"
    svg.style.height = "100%"

    if (this.options.dependencies) {
      this.options.dependencies.forEach((dep) => {
        const fromBar = this.element?.querySelector(
          `[data-task-id='${dep.fromId}']`
        ) as HTMLElement
        const toBar = this.element?.querySelector(
          `[data-task-id='${dep.toId}']`
        ) as HTMLElement
        if (fromBar && toBar && this.element) {
          const containerRect = this.element.getBoundingClientRect()
          const fromRect = fromBar.getBoundingClientRect()
          const toRect = toBar.getBoundingClientRect()

          const x1 = fromRect.right - containerRect.left
          const y1 = fromRect.top + fromRect.height / 2 - containerRect.top
          const x2 = toRect.left - containerRect.left
          const y2 = toRect.top + toRect.height / 2 - containerRect.top

          const line = document.createElementNS(svgNS, "line")
          line.setAttribute("x1", String(x1))
          line.setAttribute("y1", String(y1))
          line.setAttribute("x2", String(x2))
          line.setAttribute("y2", String(y2))
          line.setAttribute("stroke", "#FF0000")
          line.setAttribute("stroke-width", "2")

          svg.appendChild(line)
        }
      })
    }

    return svg as unknown as HTMLElement
  }

  /**
   * 绑定任务条的事件（拖拽和点击等）
   */
  bindEvents(): void {
    if (!this.element) return

    const bars = this.element.querySelectorAll(".gantt-task-bar")
    bars.forEach((bar) => {
      if (this.options.enableDragging !== false) {
        bar.addEventListener("mousedown", this.onMouseDown.bind(this))
      }
      bar.addEventListener("click", (e: Event) => {
        const taskId = (e.currentTarget as HTMLElement).getAttribute(
          "data-task-id"
        )
        const task = this.tasks.find((t) => String(t.id) === taskId)
        if (task && this.options.onTaskClick) {
          this.options.onTaskClick(task, e as MouseEvent)
        }
      })
    })
  }

  /**
   * 鼠标按下事件处理
   */
  onMouseDown(e: MouseEvent): void {
    e.preventDefault()
    const target = e.currentTarget as HTMLElement
    const taskId = target.getAttribute("data-task-id")
    const task = this.tasks.find((t) => String(t.id) === taskId)
    if (task) {
      this.dragData = {
        bar: target,
        task,
        startX: e.clientX,
        originalLeft: parseInt(target.style.left, 10) || 0,
      }
      document.addEventListener("mousemove", this.onMouseMove)
      document.addEventListener("mouseup", this.onMouseUp)
    }
  }

  /**
   * 鼠标移动事件处理（拖拽过程）
   */
  onMouseMove = (e: MouseEvent): void => {
    if (this.dragData) {
      const deltaX = e.clientX - this.dragData.startX
      const columnWidth = this.options.columnWidth || 40
      let newLeft = this.dragData.originalLeft + deltaX
      // 快速吸附到网格
      newLeft = Math.round(newLeft / columnWidth) * columnWidth
      this.dragData.bar.style.left = `${newLeft}px`
    }
  }

  /**
   * 鼠标松开事件处理（拖拽结束）
   */
  onMouseUp = (e: MouseEvent): void => {
    if (this.dragData) {
      const columnWidth = this.options.columnWidth || 40
      const currentLeft = parseInt(this.dragData.bar.style.left, 10)
      // 计算天数变化: 减去标签宽度200
      const shiftDays = (currentLeft - 200) / columnWidth
      const newStart = addDays(this.startDate, shiftDays)

      // 计算任务持续天数，根据原始任务时间
      const originalDuration = daysBetween(
        this.dragData.task.start,
        this.dragData.task.end
      )
      const newEnd = addDays(newStart, originalDuration)

      if (this.options.onTaskDrag) {
        this.options.onTaskDrag(this.dragData.task, e, newStart, newEnd)
      }

      this.dragData = null
      document.removeEventListener("mousemove", this.onMouseMove)
      document.removeEventListener("mouseup", this.onMouseUp)
    }
  }

  /**
   * 更新任务数据
   */
  updateTasks(tasks: Task[]): void {
    this.tasks = tasks
    this.endDate = this.calculateEndDate()
    if (this.element) {
      this.render(this.element)
    }
  }

  /**
   * 更新配置
   */
  updateOptions(options: Partial<GanttChartOptions>): void {
    Object.assign(this.options, options)
    if (this.element) {
      this.render(this.element)
    }
  }
}

import { GanttChartOptions, Task, ViewMode } from "./types"
import { daysBetween, addDays, getWeekNumber, getMonthName, parseDate, exportToImage, exportToPDF, formatDate } from "./utils"

export default class GanttChartCore {
  options: GanttChartOptions
  tasks: Task[]
  startDate: Date
  endDate: Date
  element: HTMLElement | null = null
  private virtualScrolling: boolean = false
  private visibleTaskCount: number = 50
  private bufferSize: number = 10
  private visibleTasks: Task[] = []
  private scrollTop: number = 0
  private containerHeight: number = 0
  private resizeObserver: ResizeObserver | null = null
  private onMouseMove: (e: MouseEvent) => void
  private onMouseUp: (e: MouseEvent) => void
  private onResizeMove: (e: MouseEvent) => void
  private onResizeEnd: (e: MouseEvent) => void
  private handleScroll: () => void

  // 用于拖拽的临时数据
  private dragData: {
    bar: HTMLElement
    task: Task
    startX: number
    originalLeft: number
    originalWidth: number
    resizeType?: "left" | "right"
    type?: "move" | "resize_left" | "resize_right" | "progress"
  } | null = null

  constructor(options: GanttChartOptions) {
    this.options = options
    this.tasks = options.tasks || []
    this.startDate = options.startDate || new Date()
    this.endDate = options.endDate || this.calculateEndDate()
    this.virtualScrolling = options.virtualScrolling || false
    this.visibleTaskCount = options.visibleTaskCount || 50
    this.bufferSize = options.bufferSize || 10

    // 绑定方法
    this.onMouseMove = this.onMouseMoveHandler.bind(this)
    this.onMouseUp = this.onMouseUpHandler.bind(this)
    this.onResizeMove = this.onResizeMoveHandler.bind(this)
    this.onResizeEnd = this.onResizeEndHandler.bind(this)

    // 性能优化：使用防抖处理滚动事件
    this.handleScroll = this.debounce(this.handleScrollHandler.bind(this), 16)
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

    // 性能优化：监听容器大小变化
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    this.resizeObserver = new ResizeObserver(this.handleResizeHandler.bind(this))
    this.resizeObserver.observe(element)

    // 初始化虚拟滚动
    if (this.virtualScrolling) {
      this.containerHeight = element.clientHeight
      this.initVirtualScrolling()
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
    const rowHeight = this.options.rowHeight || 40

    // 如果启用虚拟滚动，设置容器样式
    if (this.virtualScrolling) {
      taskContainer.style.position = "relative"
      taskContainer.style.height = `${this.tasks.length * rowHeight}px`
      taskContainer.classList.add("gantt-virtual-scroll")
    }

    // 确定要渲染的任务
    const tasksToRender = this.virtualScrolling ? this.visibleTasks : this.tasks

    // 遍历任务并创建任务行
    tasksToRender.forEach((task) => {
      const taskRow = document.createElement("div")
      taskRow.className = "gantt-task-row"

      // 如果是虚拟滚动，设置任务行的位置
      if (this.virtualScrolling) {
        const taskIndex = this.tasks.findIndex((t) => t.id === task.id)
        taskRow.style.position = "absolute"
        taskRow.style.top = `${taskIndex * rowHeight}px`
        taskRow.style.width = "100%"
      }

      // 任务标签
      const taskLabel = document.createElement("div")
      taskLabel.className = "gantt-task-label"

      // 创建标签文本容器以支持溢出省略
      const labelText = document.createElement("div")
      labelText.className = "gantt-task-label-text"
      labelText.textContent = task.name
      taskLabel.appendChild(labelText)

      taskRow.appendChild(taskLabel)

      // 任务条
      const taskBar = document.createElement("div")
      taskBar.className = "gantt-task-bar"

      // 添加任务类型样式
      if (task.type) {
        taskBar.classList.add(task.type)
      }

      const offset = this.getTaskOffset(task)
      const width = this.getTaskWidth(task)
      // 200px 为任务标签占用的宽度
      taskBar.style.left = `${offset + 200}px`
      taskBar.style.width = `${width}px`
      taskBar.style.backgroundColor = task.color || "#4e85c5"
      taskBar.setAttribute("data-task-id", String(task.id))

      // 如果有进度，添加进度条
      if (
        task.progress !== undefined &&
        this.options.enableProgress !== false
      ) {
        const progressBar = document.createElement("div")
        progressBar.className = "gantt-task-progress"
        progressBar.style.width = `${Math.min(
          100,
          Math.max(0, task.progress)
        )}%`
        taskBar.appendChild(progressBar)
      }

      // 如果开启拖拽，则设置样式和添加拖拽手柄
      if (this.options.enableDragging !== false && task.draggable !== false) {
        taskBar.style.cursor = "move"
      }

      // 如果开启调整大小，添加调整大小的手柄
      if (this.options.enableResizing !== false && task.resizable !== false) {
        const leftHandle = document.createElement("div")
        leftHandle.className = "gantt-task-resize-handle left"
        leftHandle.setAttribute("data-resize", "left")

        const rightHandle = document.createElement("div")
        rightHandle.className = "gantt-task-resize-handle right"
        rightHandle.setAttribute("data-resize", "right")

        taskBar.appendChild(leftHandle)
        taskBar.appendChild(rightHandle)
      }

      taskRow.appendChild(taskBar)
      taskContainer.appendChild(taskRow)
    })

    // 如果启用显示今天线
    if (this.options.showToday) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayOffset = this.getDateOffset(today)
      if (todayOffset >= 0) {
        const todayLine = document.createElement("div")
        todayLine.className = "gantt-today-line"
        todayLine.style.left = `${todayOffset + 200}px`
        taskContainer.appendChild(todayLine)
      }
    }

    return taskContainer
  }

  /**
   * 获取日期相对于起始日期的偏移量（以像素为单位）
   */
  getDateOffset(date: Date): number {
    const columnWidth = this.options.columnWidth || 40
    const diffDays = daysBetween(this.startDate, date)
    return diffDays * columnWidth
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
   * 绑定任务条的事件（拖拽、点击、双击、调整大小等）
   */
  bindEvents(): void {
    if (!this.element) return

    const bars = this.element.querySelectorAll(".gantt-task-bar")
    bars.forEach((bar) => {
      // 拖拽事件
      if (this.options.enableDragging !== false) {
        bar.addEventListener("mousedown", this.onMouseDown.bind(this) as EventListener)
      }

      // 点击事件
      bar.addEventListener("click", (e: Event) => {
        const taskId = (e.currentTarget as HTMLElement).getAttribute("data-task-id")
        const task = this.tasks.find((t) => String(t.id) === taskId)
        if (task && this.options.onTaskClick) {
          this.options.onTaskClick(task, e as MouseEvent)
        }
      })

      // 双击事件
      bar.addEventListener("dblclick", (e: Event) => {
        const taskId = (e.currentTarget as HTMLElement).getAttribute("data-task-id")
        const task = this.tasks.find((t) => String(t.id) === taskId)
        if (task && this.options.onTaskDoubleClick) {
          this.options.onTaskDoubleClick(task, e as MouseEvent)
        }
      })

      // 调整大小事件
      if (this.options.enableResizing !== false) {
        const resizeHandles = bar.querySelectorAll(".gantt-task-resize-handle")
        resizeHandles.forEach((handle) => {
          handle.addEventListener("mousedown", (e: Event) => {
            e.stopPropagation() // 阻止冒泡，避免触发拖拽
            this.onResizeStart(e as MouseEvent)
          })
        })
      }

      // 进度条拖拽事件
      if (this.options.enableProgress !== false) {
        bar.addEventListener("mousemove", (e: Event) => {
          const mouseEvent = e as MouseEvent;
          const taskId = (e.currentTarget as HTMLElement).getAttribute("data-task-id")
          const task = this.tasks.find((t) => String(t.id) === taskId)
          if (!task) return

          // 计算鼠标在任务条内的相对位置
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
          const relativeX = mouseEvent.clientX - rect.left
          const percent = Math.min(100, Math.max(0, (relativeX / rect.width) * 100))

          // 显示进度提示
          if (mouseEvent.buttons === 1 && this.options.onProgressChange) {
            this.options.onProgressChange(task, percent)
          }
        })
      }
    })

    // 视图切换事件
    if (this.options.onViewChange) {
      const viewModes: ViewMode[] = ["day", "week", "month", "quarter", "year"]
      viewModes.forEach((mode) => {
        const button = this.element?.querySelector(`.gantt-view-${mode}`)
        if (button) {
          button.addEventListener("click", () => {
            if (this.options.onViewChange) {
              this.options.onViewChange(mode)
            }
          })
        }
      })
    }
  }

  /**
   * 鼠标按下事件处理（开始拖拽）
   */
  onMouseDown(e: MouseEvent): void {
    e.preventDefault()
    const target = e.currentTarget as HTMLElement
    const taskId = target.getAttribute("data-task-id")
    const task = this.tasks.find((t) => String(t.id) === taskId)
    if (task && (task.draggable !== false || task.draggable === undefined)) {
      target.classList.add("dragging")
      this.dragData = {
        bar: target,
        task,
        startX: e.clientX,
        originalLeft: parseInt(target.style.left, 10) || 0,
        originalWidth: parseInt(target.style.width, 10) || 0
      }
      document.addEventListener("mousemove", this.onMouseMove)
      document.addEventListener("mouseup", this.onMouseUp)
    }
  }

  /**
   * 开始调整大小事件处理
   */
  onResizeStart(e: MouseEvent): void {
    e.preventDefault()
    const handle = e.target as HTMLElement
    const bar = handle.parentElement as HTMLElement
    if (!bar) return

    const taskId = bar.getAttribute("data-task-id")
    const task = this.tasks.find((t) => String(t.id) === taskId)
    if (!task || task.resizable === false) return

    const resizeType = handle.getAttribute("data-resize") as "left" | "right" | null
    if (!resizeType) return

    const originalWidth = parseInt(bar.style.width, 10) || 0
    const originalLeft = parseInt(bar.style.left, 10) || 0

    // 设置调整大小数据
    this.dragData = {
      bar,
      task,
      startX: e.clientX,
      originalLeft,
      originalWidth,
      resizeType
    }

    document.addEventListener("mousemove", this.onResizeMove)
    document.addEventListener("mouseup", this.onResizeEnd)
  }

  /**
   * 调整大小移动事件处理
   */
  private onResizeMoveHandler(e: MouseEvent): void {
    if (!this.dragData || !this.dragData.resizeType) return

    const deltaX = e.clientX - this.dragData.startX
    const columnWidth = this.options.columnWidth || 40

    if (this.dragData.resizeType === "right") {
      // 调整右侧（改变宽度）
      let newWidth = Math.max(columnWidth, this.dragData.originalWidth + deltaX)
      // 吸附到网格
      newWidth = Math.round(newWidth / columnWidth) * columnWidth
      this.dragData.bar.style.width = `${newWidth}px`
    } else if (this.dragData.resizeType === "left") {
      // 调整左侧（改变左边距和宽度）
      let newLeft = this.dragData.originalLeft + deltaX
      let newWidth = this.dragData.originalWidth - deltaX

      // 确保最小宽度
      if (newWidth < columnWidth) {
        newWidth = columnWidth
        newLeft = this.dragData.originalLeft + this.dragData.originalWidth - columnWidth
      }

      // 吸附到网格
      newLeft = Math.round(newLeft / columnWidth) * columnWidth
      newWidth = Math.round(newWidth / columnWidth) * columnWidth

      this.dragData.bar.style.left = `${newLeft}px`
      this.dragData.bar.style.width = `${newWidth}px`
    }

    // 计算新的日期
    const currentLeft = parseInt(this.dragData.bar.style.left, 10) - 200 // 减去标签宽度
    const currentWidth = parseInt(this.dragData.bar.style.width, 10)
    const shiftDays = Math.round(currentLeft / columnWidth)
    const durationDays = Math.round(currentWidth / columnWidth)

    const newStart = addDays(this.startDate, shiftDays)
    const newEnd = addDays(this.startDate, shiftDays + durationDays - 1)

    if (this.options.onTaskDrag) {
      this.options.onTaskDrag(this.dragData.task, e, newStart, newEnd)
    }
  }

  /**
   * 调整大小结束事件处理
   */
  private onResizeEndHandler(e: MouseEvent): void {
    if (!this.dragData || !this.dragData.resizeType) return

    const columnWidth = this.options.columnWidth || 40
    const currentLeft = parseInt(this.dragData.bar.style.left, 10) - 200 // 减去标签宽度
    const currentWidth = parseInt(this.dragData.bar.style.width, 10)

    // 计算新的开始和结束日期
    const shiftDays = Math.round(currentLeft / columnWidth)
    const durationDays = Math.round(currentWidth / columnWidth)

    const newStart = addDays(this.startDate, shiftDays)
    const newEnd = addDays(this.startDate, shiftDays + durationDays - 1)

    if (this.options.onDateChange) {
      this.options.onDateChange(newStart, newEnd)
    }

    document.removeEventListener("mousemove", this.onResizeMove)
    document.removeEventListener("mouseup", this.onResizeEnd)
    this.dragData = null
  }

  /**
   * 鼠标移动事件处理（拖拽过程）
   */
  private onMouseMoveHandler(e: MouseEvent): void {
    if (!this.dragData) return
    const deltaX = e.clientX - this.dragData.startX
    const columnWidth = this.options.columnWidth || 40

    // 计算新的位置
    let newLeft = this.dragData.originalLeft + deltaX
    // 吸附到网格
    newLeft = Math.round(newLeft / columnWidth) * columnWidth
    this.dragData.bar.style.left = `${newLeft}px`

    // 计算新的日期
    const daysShifted = Math.round(deltaX / columnWidth)
    const newStart = addDays(parseDate(this.dragData.task.start), daysShifted)
    const newEnd = addDays(parseDate(this.dragData.task.end), daysShifted)

    if (this.options.onDateChange) {
      this.options.onDateChange(newStart, newEnd)
    }
  }

  /**
   * 鼠标松开事件处理（拖拽结束）
   */
  private onMouseUpHandler(e: MouseEvent): void {
    if (this.dragData) {
      // 移除拖拽样式
      this.dragData.bar.classList.remove("dragging")

      const columnWidth = this.options.columnWidth || 40
      const currentLeft = parseInt(this.dragData.bar.style.left, 10)
      // 计算天数变化: 减去标签宽度200
      const shiftDays = Math.round((currentLeft - 200) / columnWidth)
      const newStart = addDays(this.startDate, shiftDays)

      // 计算任务持续天数，根据原始任务时间
      const originalDuration = daysBetween(
        this.dragData.task.start,
        this.dragData.task.end
      )
      const newEnd = addDays(newStart, originalDuration)

      // 移除日期提示
      if (this.element) {
        const tooltip = this.element.querySelector(".gantt-drag-tooltip")
        if (tooltip) {
          tooltip.remove()
        }
      }

      // 添加动画效果
      this.dragData.bar.style.transition = "transform 0.2s ease"
      this.dragData.bar.style.transform = "scale(1.05)"
      setTimeout(() => {
        if (this.dragData && this.dragData.bar) {
          this.dragData.bar.style.transform = "scale(1)"
        }
      }, 200)

      // 触发回调
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

    // 更新虚拟滚动相关配置
    if (options.virtualScrolling !== undefined) {
      this.virtualScrolling = options.virtualScrolling
    }
    if (options.visibleTaskCount !== undefined) {
      this.visibleTaskCount = options.visibleTaskCount
    }
    if (options.bufferSize !== undefined) {
      this.bufferSize = options.bufferSize
    }

    if (this.element) {
      this.render(this.element)
    }
  }

  /**
   * 初始化虚拟滚动
   */
  private initVirtualScrolling(): void {
    if (!this.element) return

    // 计算可见任务
    this.updateVisibleTasks()

    // 添加滚动事件监听
    this.element.addEventListener("scroll", this.handleScroll)
  }

  /**
   * 处理滚动事件
   */
  private handleScrollHandler(): void {
    if (!this.element || !this.virtualScrolling) return

    const newScrollTop = this.element.scrollTop
    if (Math.abs(newScrollTop - this.scrollTop) > 10) {
      this.scrollTop = newScrollTop
      this.updateVisibleTasks()
      this.renderVisibleTasks()
    }
  }

  /**
   * 更新可见任务列表
   */
  private updateVisibleTasks(): void {
    if (!this.virtualScrolling || !this.element) return

    const rowHeight = this.options.rowHeight || 40
    const scrollTop = this.element.scrollTop

    // 计算开始和结束索引
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / rowHeight) - this.bufferSize
    )
    const endIndex = Math.min(
      this.tasks.length,
      startIndex + this.visibleTaskCount + 2 * this.bufferSize
    )

    // 更新可见任务
    this.visibleTasks = this.tasks.slice(startIndex, endIndex)
  }

  /**
   * 渲染可见任务
   */
  private renderVisibleTasks(): void {
    if (!this.element) return

    const taskContainer = this.element.querySelector(".gantt-task-container") as HTMLElement
    if (!taskContainer) return

    // 清空任务容器
    while (taskContainer.firstChild) {
      taskContainer.removeChild(taskContainer.firstChild)
    }

    // 渲染可见任务
    const tasks = this.virtualScrolling ? this.visibleTasks : this.tasks
    const rowHeight = this.options.rowHeight || 40

    tasks.forEach((task) => {
      const taskRow = document.createElement("div")
      taskRow.className = "gantt-task-row"

      // 如果是虚拟滚动，设置任务行的位置
      if (this.virtualScrolling) {
        const taskIndex = this.tasks.findIndex((t) => t.id === task.id)
        taskRow.style.position = "absolute"
        taskRow.style.top = `${taskIndex * rowHeight}px`
        taskRow.style.width = "100%"
      }

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
      taskBar.style.left = `${offset + 200}px`
      taskBar.style.width = `${width}px`
      taskBar.style.backgroundColor = task.color || "#4e85c5"
      taskBar.setAttribute("data-task-id", String(task.id))

      // 如果有进度，添加进度条
      if (task.progress !== undefined) {
        const progressBar = document.createElement("div")
        progressBar.className = "gantt-task-progress"
        progressBar.style.width = `${Math.min(
          100,
          Math.max(0, task.progress)
        )}%`
        taskBar.appendChild(progressBar)
      }

      // 如果开启拖拽，则设置样式
      if (this.options.enableDragging !== false) {
        taskBar.style.cursor = "move"
      }

      taskRow.appendChild(taskBar)
      taskContainer.appendChild(taskRow)
    })

    // 设置容器高度以适应所有任务
    if (this.virtualScrolling) {
      taskContainer.style.height = `${this.tasks.length * rowHeight}px`
      taskContainer.style.position = "relative"
    }
  }

  /**
   * 处理容器大小变化
   */
  private handleResizeHandler(): void {
    if (!this.element) return

    this.containerHeight = this.element.clientHeight
    if (this.virtualScrolling) {
      this.updateVisibleTasks()
      this.renderVisibleTasks()
    }
  }

  /**
   * 防抖函数
   */
  private debounce(func: Function, wait: number): () => void {
    let timeout: number | null = null
    return () => {
      const later = () => {
        timeout = null
        func()
      }
      if (timeout !== null) {
        clearTimeout(timeout)
      }
      timeout = window.setTimeout(later, wait) as unknown as number
    }
  }

  /**
   * 滚动到指定任务
   * @param taskId 任务ID
   */
  scrollToTask(taskId: number | string): void {
    if (!this.element) return
    
    // 找到任务
    const task = this.tasks.find(t => t.id === taskId)
    if (!task) return
    
    // 计算任务在甘特图中的位置
    const taskIndex = this.tasks.indexOf(task)
    if (taskIndex === -1) return
    
    // 计算任务在视图中的位置并滚动
    const rowHeight = this.options.rowHeight || 40
    const scrollTop = taskIndex * rowHeight
    
    this.element.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    })
    
    // 计算水平位置并滚动
    const taskStart = parseDate(task.start)
    const daysDiff = daysBetween(this.startDate, taskStart)
    const columnWidth = this.options.columnWidth || 40
    const scrollLeft = daysDiff * columnWidth
    
    this.element.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    })
  }
  
  /**
   * 滚动到指定日期
   * @param date 目标日期
   */
  scrollToDate(date: Date | string): void {
    if (!this.element) return
    
    // 解析日期
    const targetDate = typeof date === 'string' ? new Date(date) : date
    
    // 计算日期在视图中的位置并滚动
    const daysDiff = daysBetween(this.startDate, targetDate)
    const columnWidth = this.options.columnWidth || 40
    const scrollLeft = daysDiff * columnWidth
    
    this.element.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    })
  }
  
  /**
   * 设置视图模式
   * @param mode 视图模式
   */
  setViewMode(mode: ViewMode): void {
    if (!this.element) return
    
    // 更新视图模式
    this.options.viewMode = mode
    
    // 重新渲染
    this.render(this.element)
    
    // 触发视图变更回调
    if (this.options.onViewChange) {
      this.options.onViewChange(mode)
    }
  }

  /**
   * 获取当前可见的任务
   * @returns 可见任务数组
   */
  getVisibleTasks(): Task[] {
    if (this.virtualScrolling) {
      return this.visibleTasks
    } else {
      return this.tasks
    }
  }
  
  /**
   * 导出为PNG图片
   * @param options 导出选项
   * @returns 数据URL的Promise
   */
  async exportAsPNG(options?: { filename?: string }): Promise<string> {
    if (!this.element) return Promise.reject("甘特图未渲染")
    
    const filename = options?.filename || 'gantt-chart.png'
    
    try {
      // 使用utils中的exportToImage工具函数
      const dataUrl = await exportToImage(this.element, filename)
      return dataUrl
    } catch (error) {
      console.error("导出PNG失败:", error)
      return Promise.reject(error)
    }
  }
  
  /**
   * 导出为PDF文档
   * @param options 导出选项
   * @returns PDF Blob的Promise
   */
  async exportAsPDF(options?: { filename?: string }): Promise<Blob> {
    if (!this.element) return Promise.reject("甘特图未渲染")
    
    const filename = options?.filename || 'gantt-chart.pdf'
    
    try {
      // 使用utils中的exportToPDF工具函数
      await exportToPDF(this.element, filename)
      
      // 这里仅为示例，实际应修改utils中的exportToPDF函数返回Blob对象
      return new Blob(['PDF内容'], { type: 'application/pdf' })
    } catch (error) {
      console.error("导出PDF失败:", error)
      return Promise.reject(error)
    }
  }

  /**
   * 自动排程功能
   * 根据依赖关系自动调整任务的开始和结束时间
   * @param respectDependencies 是否尊重依赖关系
   * @returns 调整后的任务数组
   */
  autoSchedule(respectDependencies: boolean = true): Task[] {
    // 创建任务副本以避免修改原始数据
    const scheduledTasks = JSON.parse(JSON.stringify(this.tasks)) as Task[];
    
    if (respectDependencies) {
      // 按依赖关系排序任务（拓扑排序）
      const taskMap = new Map<string | number, Task>();
      const visited = new Set<string | number>();
      const visitedInCurrentPath = new Set<string | number>();
      const sortedTasks: Task[] = [];
      
      // 构建任务映射
      scheduledTasks.forEach(task => {
        taskMap.set(task.id, task);
      });
      
      // 深度优先搜索进行拓扑排序
      const dfs = (taskId: string | number) => {
        if (visitedInCurrentPath.has(taskId)) {
          // 检测到循环依赖
          console.warn(`检测到循环依赖，包含任务ID: ${taskId}`);
          return;
        }
        
        if (visited.has(taskId)) {
          return;
        }
        
        visited.add(taskId);
        visitedInCurrentPath.add(taskId);
        
        const task = taskMap.get(taskId);
        if (task && task.dependsOn) {
          task.dependsOn.forEach(depId => {
            dfs(depId);
          });
        }
        
        visitedInCurrentPath.delete(taskId);
        if (task) {
          sortedTasks.push(task);
        }
      };
      
      // 对所有任务执行DFS
      scheduledTasks.forEach(task => {
        if (!visited.has(task.id)) {
          dfs(task.id);
        }
      });
      
      // 根据依赖关系调整任务日期
      sortedTasks.forEach(task => {
        if (task.dependsOn && task.dependsOn.length > 0) {
          let maxEndDate = new Date(0); // 初始化为最早的日期
          
          // 找到所有依赖任务的最晚结束日期
          task.dependsOn.forEach(depId => {
            const dependencyTask = taskMap.get(depId);
            if (dependencyTask) {
              const endDate = parseDate(dependencyTask.end);
              if (endDate > maxEndDate) {
                maxEndDate = new Date(endDate);
              }
            }
          });
          
          // 调整当前任务的开始日期为依赖任务的最晚结束日期之后的一天
          if (maxEndDate.getTime() > 0) {
            const startDate = addDays(maxEndDate, 1);
            const taskDuration = daysBetween(parseDate(task.start), parseDate(task.end));
            const endDate = addDays(startDate, taskDuration);
            
            task.start = formatDate(startDate);
            task.end = formatDate(endDate);
          }
        }
      });
    }
    
    // 触发自动排程完成回调
    if (this.options.onAutoScheduleComplete) {
      this.options.onAutoScheduleComplete(scheduledTasks);
    }
    
    // 更新任务并重新渲染
    this.updateTasks(scheduledTasks);
    
    return scheduledTasks;
  }

  /**
   * 应用主题
   * @param theme 主题配置对象
   */
  applyTheme(theme: any): void {
    if (!this.element) return;
    
    // 默认主题
    const defaultTheme = {
      primary: '#4e85c5',
      secondary: '#13c2c2',
      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d',
      textPrimary: '#000000d9',
      textSecondary: '#00000073',
      borderColor: '#d9d9d9',
      backgroundColor: '#ffffff',
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      taskColor: '#4e85c5',
      milestoneColor: '#722ed1',
      projectColor: '#fa8c16',
      dependencyLineColor: '#bfbfbf'
    };
    
    // 合并用户主题
    const currentTheme = { ...defaultTheme, ...theme };
    
    // 创建样式元素
    let styleEl = document.getElementById('gantt-custom-theme');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'gantt-custom-theme';
      document.head.appendChild(styleEl);
    }
    
    // 应用主题
    styleEl.textContent = `
      .gantt-container {
        font-family: ${currentTheme.fontFamily};
        font-size: ${currentTheme.fontSize};
        background-color: ${currentTheme.backgroundColor};
        color: ${currentTheme.textPrimary};
        --gantt-primary-color: ${currentTheme.primary};
        --gantt-secondary-color: ${currentTheme.secondary};
        --gantt-border-color: ${currentTheme.borderColor};
        --gantt-background-color: ${currentTheme.backgroundColor};
        --gantt-task-color: ${currentTheme.taskColor};
        --gantt-milestone-color: ${currentTheme.milestoneColor};
        --gantt-project-color: ${currentTheme.projectColor};
        --gantt-dependency-line-color: ${currentTheme.dependencyLineColor};
      }
      
      .gantt-task-bar {
        background-color: ${currentTheme.taskColor};
      }
      
      .gantt-milestone {
        background-color: ${currentTheme.milestoneColor};
      }
      
      .gantt-task-bar.project {
        background-color: ${currentTheme.projectColor};
      }
      
      .gantt-dependency-line {
        stroke: ${currentTheme.dependencyLineColor};
      }
    `;
  }
}

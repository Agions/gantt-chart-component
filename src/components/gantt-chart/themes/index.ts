export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  taskBackground: string;
  taskBorder: string;
  milestoneColor: string;
  projectColor: string;
  gridLine: string;
  todayLine: string;
  dependencyLine: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  spacing: {
    unit: number;
    rowHeight: number;
    headerHeight: number;
    taskPadding: number;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
    fontWeight: {
      regular: number;
      medium: number;
      bold: number;
    };
  };
  animation: {
    duration: string;
    easing: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

export const lightTheme: ThemeConfig = {
  colors: {
    primary: '#2196f3',
    secondary: '#1976d2',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#212121',
    textSecondary: '#757575',
    border: '#e0e0e0',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    taskBackground: '#bbdefb',
    taskBorder: '#64b5f6',
    milestoneColor: '#9c27b0',
    projectColor: '#3f51b5',
    gridLine: '#eeeeee',
    todayLine: 'rgba(33, 150, 243, 0.15)',
    dependencyLine: 'rgba(0, 0, 0, 0.12)'
  },
  spacing: {
    unit: 8,
    rowHeight: 40,
    headerHeight: 48,
    taskPadding: 16
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: {
      small: '12px',
      medium: '14px',
      large: '16px'
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      bold: 600
    }
  },
  animation: {
    duration: '0.2s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  shadows: {
    small: '0 2px 4px rgba(0,0,0,0.1)',
    medium: '0 4px 8px rgba(0,0,0,0.12)',
    large: '0 8px 16px rgba(0,0,0,0.14)'
  }
};

export const darkTheme: ThemeConfig = {
  ...lightTheme,
  colors: {
    primary: '#90caf9',
    secondary: '#64b5f6',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    border: '#333333',
    success: '#81c784',
    warning: '#ffb74d',
    error: '#e57373',
    taskBackground: '#1e88e5',
    taskBorder: '#64b5f6',
    milestoneColor: '#ce93d8',
    projectColor: '#7986cb',
    gridLine: '#333333',
    todayLine: 'rgba(144, 202, 249, 0.15)',
    dependencyLine: 'rgba(255, 255, 255, 0.12)'
  },
  shadows: {
    small: '0 2px 4px rgba(0,0,0,0.2)',
    medium: '0 4px 8px rgba(0,0,0,0.24)',
    large: '0 8px 16px rgba(0,0,0,0.28)'
  }
}; 
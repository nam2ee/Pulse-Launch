import { CONFIG } from './config';

// Timer interface
export interface TimerState {
  hours: number;
  minutes: number;
  seconds: number;
}

// Timer API
export const TimerAPI = {
  // Convert seconds to hours, minutes, seconds
  secondsToHMS(seconds: number): TimerState {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return {
      hours,
      minutes,
      seconds: remainingSeconds
    } as TimerState;
  },
  
  // Get initial timer state
  getInitialState(): TimerState {
    const initialSeconds = CONFIG.timer.initialSeconds;
    const timeLeft = this.secondsToHMS(initialSeconds);
    
    return {
      hours: timeLeft.hours,
      minutes: timeLeft.minutes,
      seconds: timeLeft.seconds
    };
  },
  
  // Calculate time left based on last post timestamp
  calculateTimeLeft(lastPostTimestamp: string | null): TimerState {
    const initialSeconds = CONFIG.timer.initialSeconds;
    
    if (!lastPostTimestamp) {
      return this.getInitialState();
    }
    
    const lastPostDate = new Date(lastPostTimestamp);
    const now = new Date();
    
    // Calculate elapsed time in seconds since last post
    const elapsedMilliseconds = now.getTime() - lastPostDate.getTime();
    const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
    
    // Calculate remaining seconds
    const remainingSeconds = Math.max(0, initialSeconds - elapsedSeconds);
    
    // If time is up, return zeros
    if (remainingSeconds <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }
    
    return this.secondsToHMS(remainingSeconds);
  },
  
  // Format the timer as a string
  formatTime(state: TimerState): string {
    return `${String(state.hours).padStart(2, '0')}:${String(state.minutes).padStart(2, '0')}:${String(state.seconds).padStart(2, '0')}`;
  }
}; 
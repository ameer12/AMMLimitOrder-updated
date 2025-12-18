export interface NotificationsState {
    notifications: Notification[]
}

export type Notification = {
    message: string;
    timestamp: number;
    type?: "normal"|"success"|"failure";
}
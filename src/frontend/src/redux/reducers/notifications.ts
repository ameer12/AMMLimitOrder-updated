import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import type { Notification, NotificationsState } from "../types/notifications";

const DEFAULT_NOTIFICATION_TIMEOUT = 4000;

const initialState :NotificationsState = {
  notifications:[],
};

export const notification = createAsyncThunk("notifications/add",
  async (notification:Partial<Notification>&{timeout?:number}, thunkAPI) => {
    if (!notification.timestamp){
      const date = new Date();
      notification.timestamp = date.getMilliseconds();
    }
    if (notification.message === undefined){
      notification.message = "";
    }

    setTimeout(() =>
      thunkAPI.dispatch(dismissNotification(notification.timestamp ?? 0)),
    notification.timeout||DEFAULT_NOTIFICATION_TIMEOUT);

    return notification as Notification;
  } );


const handleDismissNotification = (state :NotificationsState, { payload }: {payload:number}) => {
  state.notifications = state.notifications.filter(notification => notification.timestamp !== payload);
};

export const notificationSlice = createSlice({
  initialState,
  name:"notification",
  reducers:{
    dismissNotification:handleDismissNotification,
  },
  extraReducers: (builder) => {
    builder.addCase(notification.fulfilled, (state: NotificationsState, { payload }:{payload:Notification})=>{
      state.notifications.push(payload);
    });
  }
});


export const { dismissNotification } = notificationSlice.actions;

export const selectNotifications = (state: RootState): NotificationsState => state.notifications;

export default notificationSlice.reducer;
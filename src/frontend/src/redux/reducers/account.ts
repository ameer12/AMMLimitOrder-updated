import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { RootState } from "../store";
import {TonConnectButton, useTonConnectUI, useTonWallet, useTonAddress} from "@tonconnect/ui-react";
import type { AccountState } from "../types/account";
import { notification } from "./notifications";
import { UserCircleIcon } from "@heroicons/react/24/outline";


const initialState :AccountState ={
  walletAddress: null,
};

const NOTIFICATION_TIMEOUT = 2000;

export const connect = createAsyncThunk("account/connect", async (userFriendlyAddress:string|null, thunkAPI) => {
  if (userFriendlyAddress !== "" && userFriendlyAddress !== null){
    thunkAPI.dispatch(notification({
      message:"Successfully connected to wallet.",
      type:"success",
      timeout:NOTIFICATION_TIMEOUT
    }));
  } else {
    thunkAPI.dispatch(notification({
      message:"There was a problem connecting to the wallet!",
      type:"failure",
      timeout:NOTIFICATION_TIMEOUT
    }));
  }
  return userFriendlyAddress
});
export const disconnect = createAsyncThunk("account/disconnect", async (userFriendlyAddress:string|null, thunkAPI) => {
  if (userFriendlyAddress != ""){
    thunkAPI.dispatch(notification({
      message:"Successfully disconnected from wallet.",
      type:"success",
      timeout:NOTIFICATION_TIMEOUT
    }));
  }else{
    thunkAPI.dispatch(notification({
      message:"There was a problem disconnecting from wallet.",
      type:"failure",
      timeout:NOTIFICATION_TIMEOUT
    }));
  }
  return userFriendlyAddress;
});


export const accountSlice = createSlice({
  initialState,
  name:"account",
  reducers:{},
  extraReducers: (builder) => {
    builder.addCase(connect.fulfilled, (state: AccountState, action) => {
       state.walletAddress = action.payload;
    });
    builder.addCase(disconnect.fulfilled, (state: AccountState, action) => {
       state.walletAddress = action.payload;
    });
  }
});

export const {  } = accountSlice.actions;

export const selectAccount = (state: RootState): AccountState => state.account;

export default accountSlice.reducer;
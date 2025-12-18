import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Modal, ModalsState } from "../types/modals";

const initialState :ModalsState ={
  shown:null
};

const handleShowModal = (state :ModalsState, { payload }: PayloadAction<Modal>) => {
  state.shown = payload;
};

export const modalsSlice = createSlice({
  initialState,
  name:"modals",
  reducers:{
    showModal: handleShowModal,
  },
});

export const { showModal }= modalsSlice.actions;

export const selectModals = (state: RootState): ModalsState => state.modals;

export default modalsSlice.reducer;
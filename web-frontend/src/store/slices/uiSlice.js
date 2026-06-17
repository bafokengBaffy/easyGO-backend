import { createSlice } from '@reduxjs/toolkit';

const initialState = { sidebarOpen: false, theme: 'light', modalOpen: false, modalContent: null, loading: false };

const uiSlice = createSlice({
  name: 'ui', initialState, reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload; },
    setTheme: (state, action) => { state.theme = action.payload; },
    openModal: (state, action) => { state.modalOpen = true; state.modalContent = action.payload; },
    closeModal: (state) => { state.modalOpen = false; state.modalContent = null; },
    setLoading: (state, action) => { state.loading = action.payload; },
  },
});

export const { toggleSidebar, setSidebarOpen, setTheme, openModal, closeModal, setLoading } = uiSlice.actions;
export default uiSlice.reducer;

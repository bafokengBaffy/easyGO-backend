import { createSlice } from '@reduxjs/toolkit';

const initialState = { currentRide: null, rideHistory: [], loading: false, error: null };

const rideSlice = createSlice({
  name: 'ride', initialState, reducers: {
    setCurrentRide: (state, action) => { state.currentRide = action.payload; },
    clearCurrentRide: (state) => { state.currentRide = null; },
    setRideHistory: (state, action) => { state.rideHistory = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const { setCurrentRide, clearCurrentRide, setRideHistory, setLoading, setError } = rideSlice.actions;
export default rideSlice.reducer;

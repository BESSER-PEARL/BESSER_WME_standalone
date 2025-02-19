import { configureStore } from '@reduxjs/toolkit';
import { diagramReducer } from '../services/diagram/diagramSlice';

export const store = configureStore({
  reducer: {
    diagram: diagramReducer,
    // Add other reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
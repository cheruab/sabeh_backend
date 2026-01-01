import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentGroup: null, // Currently viewing/creating group
  myGroups: [], // Groups user has created or joined
  loading: false,
  error: null,
};

export const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    // Set current group
    setCurrentGroup: (state, action) => {
      state.currentGroup = action.payload;
      state.error = null;
    },

    // Set user's groups
    setMyGroups: (state, action) => {
      state.myGroups = action.payload;
      state.error = null;
    },

    // Add a new group to myGroups
    addGroup: (state, action) => {
      state.myGroups.unshift(action.payload);
      state.currentGroup = action.payload;
    },

    // Update a group in myGroups
    updateGroup: (state, action) => {
      const index = state.myGroups.findIndex(
        (g) => g._id === action.payload._id
      );
      if (index !== -1) {
        state.myGroups[index] = action.payload;
      }
      if (state.currentGroup?._id === action.payload._id) {
        state.currentGroup = action.payload;
      }
    },

    // Remove a group from myGroups
    removeGroup: (state, action) => {
      state.myGroups = state.myGroups.filter(
        (g) => g._id !== action.payload
      );
      if (state.currentGroup?._id === action.payload) {
        state.currentGroup = null;
      }
    },

    // Loading states
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Error handling
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear current group
    clearCurrentGroup: (state) => {
      state.currentGroup = null;
    },

    // Reset all
    resetGroupState: (state) => {
      return initialState;
    },
  },
});

export const {
  setCurrentGroup,
  setMyGroups,
  addGroup,
  updateGroup,
  removeGroup,
  setLoading,
  setError,
  clearError,
  clearCurrentGroup,
  resetGroupState,
} = groupSlice.actions;

export default groupSlice.reducer;
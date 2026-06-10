import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UiState = {
  marqueeItems: string[];
  activeMenu: string;
};

const initialState: UiState = {
  marqueeItems: [
    "TALENTS AND MODELS PROVIDER",
    "MODELLING CLASS",
    "CASTING",
    "COLLABORATION MANAGEMENT",
    "PRODUCTION",
  ],
  activeMenu: "ABOUT",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setMarqueeItems: (state, action: PayloadAction<string[]>) => {
      state.marqueeItems = action.payload;
    },
    setActiveMenu: (state, action: PayloadAction<string>) => {
      state.activeMenu = action.payload;
    },
  },
});

export const { setMarqueeItems, setActiveMenu } = uiSlice.actions;
export default uiSlice.reducer;

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UiState = {
  marqueeItems: string[];
  activeMenu: string;
  /** Mengontrol animasi pop-up hero saat landing page dibuka. */
  heroRevealed: boolean;
  /**
   * Nama talent yang mau di-inquire, dibawa dari halaman detail talent ke
   * form inquiry client (/collaboration) lewat RTK — bukan query param —
   * supaya field "preferred model" otomatis terisi. null = tidak ada draft.
   */
  inquiryTalent: string | null;
  /** Mengontrol pop-up kecil "you are logged in as …" setelah login / saat sesi pulih. */
  sessionToastOpen: boolean;
  /**
   * Pendaftaran kini lewat modal: klik kartu "Apply as Talent" / "Join Class"
   * membuka form di dalam dialog. null = tidak ada modal terbuka. Disimpan di
   * RTK supaya kartu (pembuka) & dialog (penutup) berbagi satu sumber kebenaran.
   */
  regModal: "talent" | "kelas" | null;
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
  heroRevealed: false,
  inquiryTalent: null,
  sessionToastOpen: false,
  regModal: null,
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
    setHeroRevealed: (state, action: PayloadAction<boolean>) => {
      state.heroRevealed = action.payload;
    },
    // Simpan / kosongkan (null) talent yang mau di-inquire.
    setInquiryTalent: (state, action: PayloadAction<string | null>) => {
      state.inquiryTalent = action.payload;
    },
    openSessionToast: (state) => {
      state.sessionToastOpen = true;
    },
    closeSessionToast: (state) => {
      state.sessionToastOpen = false;
    },
    // Buka modal pendaftaran untuk satu jenis (talent / kelas).
    openRegModal: (state, action: PayloadAction<"talent" | "kelas">) => {
      state.regModal = action.payload;
    },
    // Tutup modal pendaftaran apa pun yang sedang terbuka.
    closeRegModal: (state) => {
      state.regModal = null;
    },
  },
});

export const {
  setMarqueeItems,
  setActiveMenu,
  setHeroRevealed,
  setInquiryTalent,
  openSessionToast,
  closeSessionToast,
  openRegModal,
  closeRegModal,
} = uiSlice.actions;
export default uiSlice.reducer;

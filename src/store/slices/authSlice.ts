import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/store/api/authApi";
import { simpanSesi, hapusSesi } from "@/store/simpananSesi";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
};

// State awal selalu kosong. Data login yang tersimpan di localStorage baru
// dimasukin nanti SETELAH halaman kebuka di browser (lihat Providers.tsx).
// Kenapa gak langsung diisi di sini? Biar tampilan awal di server & di browser
// sama persis — kalau beda, React bakal protes ("hydration mismatch").
const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Dipanggil pas berhasil login/daftar (juga pas baca-ulang dari localStorage).
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      // Selain disimpan di memori (Redux), tulis juga ke localStorage biar
      // gak ilang pas halaman di-refresh.
      simpanSesi(action.payload);
    },
    // Dipanggil pas logout / ganti akun.
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      // Bersihin juga dari localStorage.
      hapusSesi();
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

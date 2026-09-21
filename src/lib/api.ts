/**
 * UHUB API Client - UKK RPL Paket B 2026/2027
 * REST API client connecting Next.js Frontend to Express Backend
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export const DEFAULT_MAKER_KEY = "mk_default_ukk_2026";

// Helper to get active Maker Key
export function getMakerKey(): string {
  if (typeof window === "undefined") return DEFAULT_MAKER_KEY;
  return localStorage.getItem("uhub_maker_key") || DEFAULT_MAKER_KEY;
}

// Helper to get auth token
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const t =
    localStorage.getItem("uhub_token") ||
    localStorage.getItem("token") ||
    null;
  if (!t || t === "undefined" || t === "null") return null;
  return t;
}

// Helper to set auth token and session
export function setAuthSession(token: string, user: any) {
  if (typeof window === "undefined") return;
  if (token && token !== "undefined" && token !== "null") {
    localStorage.setItem("uhub_token", token);
  }
  if (user) {
    localStorage.setItem("uhub_user", JSON.stringify(user));
    if (user.app_key) {
      localStorage.setItem("uhub_maker_key", user.app_key);
    }
  }
  window.dispatchEvent(new Event("authChange"));
}

// Helper to clear auth session
export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("uhub_token");
  localStorage.removeItem("uhub_maker_key");
  localStorage.setItem("uhub_user", "guest");
  window.dispatchEvent(new Event("authChange"));
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("uhub_user");
    if (!raw || raw === "guest") return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Centralized Request Handler
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; status?: boolean; message: string; data?: T; token?: string; error?: string }> {
  const token = getAuthToken();
  const activeMakerKey = getMakerKey();
  const headers: Record<string, string> = {
    "x-maker-key": activeMakerKey,
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const result = await res.json().catch(() => ({
      status: false,
      success: false,
      message: `Error parsing server response (${res.status})`,
    }));

    const isSuccess = res.ok && result.status !== false;

    if (!isSuccess) {
      return {
        status: false,
        success: false,
        message: result.message || `Request failed with status ${res.status}`,
        error: result.error || res.statusText,
        data: result.data,
      };
    }

    return {
      status: true,
      success: true,
      message: result.message || "Success",
      data: result.data !== undefined ? result.data : result,
      token: result.token || result.access_token || (result.data && result.data.token),
      ...result,
    };
  } catch (err: any) {
    console.error(`API Error [${endpoint}]:`, err);
    return {
      success: false,
      message:
        err.message ||
        "Gagal terhubung ke backend server. Pastikan server backend aktif di " +
        API_BASE_URL,
      error: err.message,
    };
  }
}

// ==========================================
// AUTH SERVICES
// ==========================================
export const authApi = {
  sendOtp: async (email: string) => {
    return apiRequest<{ message: string; debugOtp?: string }>("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  verifyOtp: async (email: string, otp: string) => {
    return apiRequest<{ success: boolean; message: string }>("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  },

  login: async (credentials: { username: string; password: string }) => {
    return apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  registerMember: async (data: {
    username: string;
    password: string;
    nama_member: string;
    instansi: string;
    alamat: string;
    telp: string;
    foto?: string | null;
  }) => {
    return apiRequest("/api/auth/register/member", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  registerAdminSpace: async (data: {
    username: string;
    password: string;
    nama_coworking: string;
    nama_pemilik: string;
    telp: string;
  }) => {
    return apiRequest("/api/auth/register/admin-space", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getProfile: async () => {
    return apiRequest("/api/auth/profile", {
      method: "GET",
    });
  },

  updateProfile: async (data: {
    username?: string;
    password?: string;
    nama?: string;
    nama_member?: string;
    instansi?: string;
    alamat?: string;
    telp?: string;
    foto?: string | null;
  }) => {
    return apiRequest("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// ==========================================
// UPLOAD SERVICES
// ==========================================
export const uploadApi = {
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest<{ url: string; filename: string }>("/api/upload/avatar", {
      method: "POST",
      body: formData,
    });
  },
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest<{ url: string; filename: string }>("/api/upload/image", {
      method: "POST",
      body: formData,
    });
  },
};

// ==========================================
// SPACES SERVICES
// ==========================================
export interface SpaceApiItem {
  id: number;
  nama_space: string;
  harga_per_jam: number;
  tipe: "desk" | "meeting_room" | "private_office" | string;
  kapasitas: number;
  foto?: string;
  deskripsi: string;
  id_owner?: number;
  foto_url?: string | null;
  owner?: {
    id: number;
    nama_coworking: string;
    nama_pemilik: string;
    telp: string;
  };
}

export const spaceApi = {
  getSpaceTypes: async () => {
    return apiRequest("/api/spaces/types", {
      method: "GET",
    });
  },

  getSpaces: async (params?: { tipe?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.tipe && params.tipe !== "all") query.set("tipe", params.tipe);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<SpaceApiItem[]>(`/api/spaces${qs}`, {
      method: "GET",
    });
  },

  getAllSpaces: async (params?: { tipe?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.tipe && params.tipe !== "all") query.set("tipe", params.tipe);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<SpaceApiItem[]>(`/api/spaces${qs}`, {
      method: "GET",
    });
  },

  getSpaceById: async (id: number | string) => {
    return apiRequest<SpaceApiItem>(`/api/spaces/${id}`, {
      method: "GET",
    });
  },

  checkAvailability: async (params: {
    id_space?: number | string;
    tanggal: string;
    jam_mulai: string;
    durasi_jam: number;
  }) => {
    const queryParams: Record<string, string> = {
      tanggal: params.tanggal,
      jam_mulai: params.jam_mulai,
      durasi_jam: String(params.durasi_jam),
    };
    if (params.id_space) {
      queryParams.id_space = String(params.id_space);
    }
    const qs = new URLSearchParams(queryParams).toString();
    return apiRequest(`/api/spaces/availability?${qs}`, {
      method: "GET",
    });
  },
};

// ==========================================
// DISKON & PROMO SERVICES
// ==========================================
export interface DiscountApiItem {
  id: number;
  nama_diskon: string;
  persentase_diskon: number;
  tanggal_awal: string;
  tanggal_akhir: string;
}

export const diskonApi = {
  getDiscounts: async () => {
    return apiRequest<DiscountApiItem[]>("/api/diskon", {
      method: "GET",
    });
  },
};

// ==========================================
// RESERVASI SERVICES
// ==========================================
export interface CreateReservasiDto {
  id_space: number | string;
  tanggal_reservasi?: string;
  tanggal?: string;
  jam_mulai: string;
  jam_selesai?: string;
  durasi_jam: number;
  id_diskon?: number | null;
  kode_promo?: string;
}

export interface ReservationApiItem {
  id: number;
  kode_booking: string;
  tanggal_reservasi: string;
  jam_mulai: string;
  jam_selesai: string;
  durasi_jam: number;
  total_bayar: number;
  status:
  | "belum_dikonfirm"
  | "disetujui"
  | "aktif"
  | "selesai"
  | "dibatalkan"
  | string;
  space?: {
    id: number;
    nama_space: string;
    tipe: string;
  };
}

export interface ETicketData {
  e_ticket_number: string;
  kode_booking: string;
  coworking_space: {
    nama: string;
    telepon: string;
  };
  member: {
    nama: string;
    instansi: string;
    telp: string;
  };
  space: {
    nama: string;
    tipe: string;
    harga_per_jam: number;
  };
  jadwal: {
    tanggal: string;
    jam_mulai: string;
    jam_selesai: string;
    durasi: string;
  };
  rincian_pembayaran: {
    tarif_kotor: number;
    diskon_promo: string;
    potongan: number;
    total_dibayar: number;
  };
  status_reservasi: string;
  qr_code_payload: string;
}

export const reservasiApi = {
  create: async (data: CreateReservasiDto) => {
    return apiRequest("/api/reservasi", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMyReservations: async () => {
    return apiRequest<ReservationApiItem[]>("/api/reservasi/my", {
      method: "GET",
    });
  },

  getMyHistory: async (params?: { month?: number | string; year?: number | string }) => {
    const query = new URLSearchParams();
    if (params?.month) query.set("month", String(params.month));
    if (params?.year) query.set("year", String(params.year));
    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiRequest(`/api/reservasi/my/history${qs}`, {
      method: "GET",
    });
  },

  getETicket: async (id: number | string) => {
    return apiRequest<ETicketData>(`/api/reservasi/${id}/e-ticket`, {
      method: "GET",
    });
  },

  getDetail: async (id: number | string) => {
    return apiRequest(`/api/reservasi/${id}`, {
      method: "GET",
    });
  },

  cancel: async (id: number | string) => {
    return apiRequest(`/api/reservasi/${id}/cancel`, {
      method: "PATCH",
    });
  },
};

// ==========================================
// ADMIN DASHBOARD SERVICES
// ==========================================
export const adminApi = {
  // 1. Profil Coworking
  getCoworkingProfile: async () => {
    return apiRequest("/api/admin/profile", {
      method: "GET",
    });
  },
  updateCoworkingProfile: async (data: {
    nama_coworking: string;
    nama_pemilik: string;
    telp: string;
  }) => {
    return apiRequest("/api/admin/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // 2. Member CRUD
  getMembers: async (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiRequest(`/api/admin/members${qs}`, {
      method: "GET",
    });
  },
  createMember: async (data: any) => {
    return apiRequest("/api/admin/members", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateMember: async (id: number | string, data: any) => {
    return apiRequest(`/api/admin/members/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  deleteMember: async (id: number | string) => {
    return apiRequest(`/api/admin/members/${id}`, {
      method: "DELETE",
    });
  },

  // 3. Space CRUD
  getSpaces: async (params?: { tipe?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.tipe && params.tipe !== "all") query.set("tipe", params.tipe);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiRequest(`/api/admin/spaces${qs}`, {
      method: "GET",
    });
  },
  createSpace: async (data: any) => {
    return apiRequest("/api/admin/spaces", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateSpace: async (id: number | string, data: any) => {
    return apiRequest(`/api/admin/spaces/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  deleteSpace: async (id: number | string) => {
    return apiRequest(`/api/admin/spaces/${id}`, {
      method: "DELETE",
    });
  },

  // 4. Diskon CRUD
  getDiscounts: async () => {
    return apiRequest("/api/admin/diskon", {
      method: "GET",
    });
  },
  createDiscount: async (data: {
    nama_diskon: string;
    persentase_diskon: number;
    tanggal_awal: string;
    tanggal_akhir: string;
  }) => {
    return apiRequest("/api/admin/diskon", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateDiscount: async (
    id: number | string,
    data: {
      nama_diskon: string;
      persentase_diskon: number;
      tanggal_awal: string;
      tanggal_akhir: string;
    }
  ) => {
    return apiRequest(`/api/admin/diskon/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  deleteDiscount: async (id: number | string) => {
    return apiRequest(`/api/admin/diskon/${id}`, {
      method: "DELETE",
    });
  },

  // 5. Reservasi & Check-in / Check-out
  getReservations: async (params?: {
    status?: string;
    month?: number | string;
    year?: number | string;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "all")
      query.set("status", params.status);
    if (params?.month) query.set("month", String(params.month));
    if (params?.year) query.set("year", String(params.year));
    if (params?.search) query.set("search", params.search);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiRequest(`/api/admin/reservasi${qs}`, {
      method: "GET",
    });
  },
  updateReservationStatus: async (
    id: number | string,
    status: "belum_dikonfirm" | "disetujui" | "aktif" | "selesai" | "dibatalkan"
  ) => {
    return apiRequest(`/api/admin/reservasi/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  checkIn: async (id: number | string) => {
    return apiRequest(`/api/admin/reservasi/${id}/check-in`, {
      method: "POST",
    });
  },
  checkOut: async (id: number | string) => {
    return apiRequest(`/api/admin/reservasi/${id}/check-out`, {
      method: "POST",
    });
  },

  // 6. Reports & Income Summary
  getMonthlyReport: async (params?: { month?: number | string; year?: number | string }) => {
    const query = new URLSearchParams();
    if (params?.month) query.set("month", String(params.month));
    if (params?.year) query.set("year", String(params.year));
    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiRequest(`/api/admin/reports/monthly${qs}`, {
      method: "GET",
    });
  },
  getIncomeSummary: async () => {
    return apiRequest("/api/admin/reports/income", {
      method: "GET",
    });
  },
};

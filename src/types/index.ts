export interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  admin: Admin;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  location: string;
  activities: string[];
  stay: string;
  meals: string;
  photos: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface TripVariant {
  location: string;
  duration: string;
  originalPrice: number;
  discountedPrice: number;
  image: string;
}

export interface TravelOption {
  label: string;
  priceDelta: number;
  description?: string;
}

export interface TripAddon {
  id?: string;
  name: string;
  rate: number;
  description: string;
  minQuantity: number;
  maxQuantity: number;
}

export interface RoomOption {
  label: string;
  priceDelta: number;
}

export interface Trip {
  id: string;
  title: string;
  slug: string;
  description: string;
  heroImage: string;
  price: number;
  location: string;
  duration: string;
  category: string;
  images: string[];
  itinerary: ItineraryDay[];
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  faqs: FAQ[];
  availableDates: string[];
  variants: TripVariant[];
  travelOptions: TravelOption[];
  roomOptions: RoomOption[];
  addons: TripAddon[];
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userName: string;
  email: string;
  phone: string;
  tripId: string;
  tripTitle?: string;
  travelers: number;
  travelDate?: string;
  amount: number;
  paidAmount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "unpaid" | "partial" | "paid";
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingFormData = Omit<Booking, "id" | "createdAt" | "updatedAt" | "tripTitle">;

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  tripTitle?: string;
  date?: string;
  count?: number;
  read: boolean;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    linkedin: string;
  };
  logo: string;
  favicon: string;
  paymentGateway?: string;
}

export interface DashboardStats {
  totalTrips: number;
  totalBookings: number;
  totalRevenue: number;
  totalInquiries: number;
  recentBookings: Booking[];
  monthlyRevenue: { month: string; revenue: number }[];
  bookingsByStatus: { status: string; count: number }[];
}

export type TripFormData = Omit<Trip, "id" | "createdAt" | "updatedAt">;

export interface Blog {
  id: string;
  title: string;
  slug: string;
  author: string;
  content: string;
  image: string;
  readTime: string;
  hasVideo: boolean;
  status: "draft" | "published";
  createdAt: string;
}

export type BlogFormData = Omit<Blog, "id" | "slug" | "createdAt">;

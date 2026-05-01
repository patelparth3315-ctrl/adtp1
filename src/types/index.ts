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
  order?: number;
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
  gallery?: { url: string; alt: string; order: number }[];
  stickyCardPrice?: number;
  stickyCardLabel?: string;
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
  attractions?: { name: string; image: string; slug: string; description?: string }[];
  activities?: { name: string; image: string; slug: string; description?: string }[];
  accommodations?: { 
    name: string; 
    location: string;
    nights: string;
    type: string; 
    starRating: string;
    roomType: string;
    meals: string;
    image: string; 
    gallery: string[];
  }[];
  route?: { label: string; icon: "plane" | "car" | "train" }[];
  ageGroup?: string;
  maxAltitude?: string;
  tripType?: string;
  startEnd?: string;
  pickupMode?: string;
  popupDetails?: {
    cancellation: { label: string; val: string }[];
    terms: string[];
    carry: { label: string; val: string }[];
    etiquette: { title: string; desc: string }[];
  };
  status: "draft" | "published";
  maxGroupSize?: number;
  difficulty?: "easy" | "moderate" | "hard";
  departureCity?: string;
  ageLimit?: string;
  bookingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainTicket {
  pnr: string;
  trainNo: string;
  trainName: string;
  from: string;
  to: string;
  departureDate?: string;
  arrivalDate?: string;
  coach: string;
  seat: string;
  status: string;
  ticketUrl?: string;
}

export interface Booking {
  id: string;
  bookingId?: string;
  userName: string;
  email: string;
  phone: string;
  tripId: string;
  tripTitle?: string;
  travelers: number;
  travelDate?: string;
  amount: number;
  paidAmount: number;
  paymentMode?: 'UPI' | 'Cash' | 'Bank Transfer' | 'Other' | 'None';
  pickupCity?: string;
  specialRequests?: string;
  idProofUrl?: string;
  salesPersonId?: string;
  salesPersonName?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "accepted" | "rejected";
  paymentStatus: "unpaid" | "partial" | "paid";
  notes?: string;
  adminNotes?: string;
  syncStatus?: 'pending' | 'synced' | 'failed';
  lastSyncAt?: string;
  trainTickets?: TrainTicket[];
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
  status: 'new' | 'contacted' | 'converted' | 'closed';
  isDuplicate?: boolean;
  convertedAmount?: number;
  adminNotes?: string;
  responseTimeMinutes?: number;
  createdAt: string;
}

export interface ThemeSettings {
  primaryColor: string;
  accentColor: string;
  borderRadius: number;
  primaryFont: string;
  handwritingFont?: string;
  headerTitle?: string;
}

export interface DimensionsSettings {
  heroHeight: number;
  containerWidth: number;
  sectionSpacing: number;
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
  theme: ThemeSettings;
  dimensions: DimensionsSettings;
  organization: {
    name: string;
    logo: string;
    website: string;
    supportEmail: string;
    supportPhone: string;
    mailingAddress: string;
  };
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
    isEnabled: boolean;
  };
}

export interface DashboardStats {
  totalTrips: number;
  totalBookings: number;
  totalRevenue: number;
  totalInquiries: number;
  pendingPayments: number;
  totalVendorCost: number;
  totalVendorPaid: number;
  pendingVendorPayments: number;
  totalProfit: number;
  upcomingTrips: { id: string; title: string; location: string; duration: string; nextDate?: string }[];
  recentBookings: (Booking & { paidAmount?: number; paymentStatus?: string })[];
  monthlyRevenue: { month: string; revenue: number }[];
  bookingsByStatus: { status: string; count: number }[];
}

export type TripFormData = Omit<Trip, "id" | "createdAt" | "updatedAt">;

export interface Blog {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorImage?: string;
  content: string;
  image: string;
  readTime: string;
  hasVideo: boolean;
  status: "draft" | "published";
  createdAt: string;
}

export type BlogFormData = Omit<Blog, "id" | "createdAt">;

export interface Payment {
  id: string;
  _id?: string;
  bookingId: string;
  amount: number;
  paymentMode: 'UPI' | 'Cash' | 'Bank Transfer' | 'Card' | 'Other';
  paymentDate: string;
  reference?: string;
  notes?: string;
  recordedBy?: string;
  createdAt: string;
}

export interface PaymentSummary {
  totalAmount: number;
  totalPaid: number;
  pending: number;
  count: number;
}

export interface Vendor {
  id: string;
  _id?: string;
  name: string;
  type: 'hotel' | 'transport' | 'guide' | 'meals' | 'equipment' | 'other';
  phone?: string;
  email?: string;
  location?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface TripVendor {
  id: string;
  _id?: string;
  tripId: string;
  vendorId: Vendor | string;
  agreedCost: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paidAmount: number;
  notes?: string;
  createdAt: string;
}

export interface TripVendorSummary {
  totalVendorCost: number;
  totalPaidToVendors: number;
  pendingVendorPayments: number;
  count: number;
}

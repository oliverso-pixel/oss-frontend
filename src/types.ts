// src/types.ts
// 根據 app/schemas/user.py 的 UserFullResponse (用於已登入用戶)
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  display_name: string | null;
  bio: string | null;
  phone: string | null;
  avatar_url: string | null;
  background_image_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  two_factor_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  linked_roles: string[];
  birth_date: string | null;
  privacy_level: 'public' | 'private';
  total_posts?: number;
  total_following?: number;
  total_followers?: number;
}

// 根據 app/schemas/user.py 的 UserPublicResponse (用於公開展示的用戶資料)
export interface UserPublicProfile {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: string;
  bio?: string | null;
  privacy_level: 'public' | 'private';
  total_posts?: number;
  total_following?: number;
  total_followers?: number;
  from_user: UserPublicProfile;
  to_user: UserPublicProfile;
}

// 根據後端 /api/v1/social/relationship/{user_id} 的回應結構
export interface RelationshipStatus {
  is_friend: boolean;
  is_following: boolean;
  is_followed_by: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  has_pending_request: boolean;
}

// 根據 app/schemas/pet.py 的 PetResponse
export interface Pet {
  id: number;
  user_id: number;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'other';
  breed: string | null;
  gender: 'male' | 'female' | 'unknown';
  birth_date: string | null;
  weight: number | null;
  description: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner_username?: string;
  privacy_level: 'public' | 'private';
}

export interface FriendRequest {
  id: number;
  user: UserPublicProfile; // 發送請求的用戶
  status: 'pending' | 'accepted' | 'rejected';
  message: string | null;
  created_at: string;
  responded_at: string | null;
}

export interface PrivacySettings {
  privacy_level: 'public' | 'private';
  show_email: boolean;
  show_phone: boolean;
  show_online_status: boolean;
  show_last_seen: boolean;
}

// --- 根據 app/schemas/social.py 的 BlockedUserResponse ---
export interface BlockedUser {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  blocked_at: string;
  reason: string | null;
}

// --- 根據 app/schemas/social.py 的 FriendshipStatistics ---
export interface SocialStats {
  total_friends: number;
  pending_requests_sent: number;
  pending_requests_received: number;
  total_followers: number;
  total_following: number;
  blocked_users: number;
  mutual_friends: number;
}

// --- 用於物種下拉選單的類型 ---
export interface SpeciesOption {
    value: string;
    label: string;
}

// --- pet-transfer API ---
export interface PetTransferRequest {
    id: number;
    pet_id: number;
    from_user_id: number;
    to_user_id: number;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
    transfer_type: 'gift' | 'sale';
    transfer_reason: string | null;
    notes: string | null;
    created_at: string;
    pet: Pet;
    from_user: UserPublicProfile;
    to_user: UserPublicProfile;
}

export interface PetTransferHistory {
    id: number;
    pet_id: number;
    from_user_id: number;
    to_user_id: number;
    completed_at: string;
    created_at: string;
    transfer_type: 'gift' | 'sale';
    notes: string | null;
    from_user: UserPublicProfile;
    to_user: UserPublicProfile;
}

// --- 醫療與疫苗記錄類型 ---
export interface VaccinationRecord {
  id: number;
  pet_id: number;
  vaccine_type_id: number;
  vaccine_name: string;
  vaccination_date: string;
  next_due_date: string | null;
  batch_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: number;
}

export interface Clinic {
  id: number;
  name: string;
  phone: string;
  address: {
    city: string;
    district: string;
    street: string;
  };
  is_verified: boolean;
}

export interface MedicalRecord {
  id: number;
  pet_id: number;
  visit_date: string;
  visit_type: string;
  chief_complaint: string;
  symptoms: string | null;
  diagnosis: string;
  treatment: string | null;
  notes: string | null;
  weight: number | null;
  temperature: number | null;
  clinic_id: number | null;
  created_at: string;
  updated_at: string;
  created_by: number;
  vaccinations: VaccinationRecord[];
  clinic: Clinic | null;
}

// --- 貼文相關類型 ---
export interface Media {
  id: number;
  url: string;
  type: 'image' | 'video';
}

export interface Post {
  id: number;
  content: string;
  visibility: 'public' | 'friends' | 'private';
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  author: UserPublicProfile;
  pet: Pet | null;
  media: Media[];
  tags: string[];
  like_count: number;
  comment_count: number;
  view_count: number;
  is_liked: boolean;
  comments_enabled: boolean;
  user_can_edit?: boolean;
  user_can_delete?: boolean;
  comments?: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user: UserPublicProfile; // API 回傳的是 user 而非 author
  parent_id: number | null;
  post_id: number;
  replies?: Comment[];
  reply_count?: number; // API 回傳的是 reply_count
  is_liked: boolean; // API 回傳的是 is_liked
  like_count: number; // API 回傳的是 like_count
  is_deleted: boolean;
  deleted_by: number | null;
  deleted_at: string | null;
  deletion_reason: string | null;
  quoted_comment: Comment | null;
  quoted_comment_id: number | null;
}


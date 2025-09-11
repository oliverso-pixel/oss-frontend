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
  is_active: boolean;
  is_verified: boolean;
  two_factor_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  roles: string[];
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
  privacy_level: 'public' | 'friends' | 'private';
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

// --- 根據 pet-transfer API 的回應結構 ---
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
    // 根據 API 回應，可能會包含關聯的 pet 和 user 資料
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


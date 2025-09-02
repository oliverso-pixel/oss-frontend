// src/types.ts
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

// --- 新增：根據 app/schemas/social.py 的 FriendRequestResponse ---
export interface FriendRequest {
  id: number;
  user: UserPublicProfile; // 發送請求的用戶
  status: 'pending' | 'accepted' | 'rejected';
  message: string | null;
  created_at: string;
  responded_at: string | null;
}
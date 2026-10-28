export const MAX_FREELANCER_POSTS = 3;
export const MAX_FREELANCER_IMAGES = 5;

export interface FreelancerAuthor {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profilePictureUrl: string | null;
  location: string | null;
}

/** A card on the board: no contact details (those are on the detail view). */
export interface FreelancerPostSummary {
  id: string;
  title: string;
  description: string;
  images: string[];
  viewCount: number;
  createdAt: string;
  author: FreelancerAuthor;
}

export interface FreelancerContact {
  contactPhone: string | null;
  contactWhatsapp: string | null;
  contactEmail: string | null;
  contactTelegram: string | null;
}

/** The author's own post, as returned by /mine and the create/update endpoints. */
export interface MyFreelancerPost extends FreelancerContact {
  id: string;
  userId: string;
  title: string;
  description: string;
  linkUrl: string | null;
  images: string[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FreelancerPostDetail extends MyFreelancerPost {
  author: FreelancerAuthor;
  isOwner: boolean;
}

export interface FreelancerPostInput extends FreelancerContact {
  title: string;
  description: string;
  linkUrl: string | null;
}

export interface FreelancerListFilters {
  q?: string;
  limit?: number;
  offset?: number;
}

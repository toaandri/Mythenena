// Types partagés — Forum communautaire

export interface ForumPost {
  id: string;
  pseudonym: string;
  avatarSeed: string; // seed pour générer un avatar neutre
  content: string;
  categoryId: string;
  reactions: Reaction[];
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
  isFlagged: boolean;
}

export interface ForumReply {
  id: string;
  postId: string;
  pseudonym: string;
  avatarSeed: string;
  content: string;
  reactions: Reaction[];
  createdAt: string;
  isFlagged: boolean;
}

export interface ForumCategory {
  id: string;
  slug: string;
  labelFr: string;
  labelMg: string;
  description: string;
  icon: string;
}

export interface Reaction {
  type: "support" | "strength" | "notAlone" | "heart";
  count: number;
}

export interface Report {
  id: string;
  targetId: string; // postId ou replyId
  targetType: "post" | "reply";
  reason: string;
  createdAt: string;
  status: "pending" | "reviewed" | "dismissed";
}

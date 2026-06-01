/** Qdrant collection names. Point id always equals the entity Postgres UUID. */
export const MISSION_COLLECTION = 'mission_embeddings';
export const RESUME_COLLECTION = 'resume_embeddings';

/** How many candidates to pull from Qdrant before hydrating/re-ranking. */
export const SEARCH_LIMIT = 50;

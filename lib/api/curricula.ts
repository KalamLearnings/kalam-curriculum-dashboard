/**
 * API Client for Curriculum operations
 * All functions throw on error - wrap in try/catch
 */

import type {
  Curriculum,
  Topic,
  Node,
  Article,
  CreateCurriculum,
  CreateTopic,
  CreateNode,
  CreateArticle,
  UpdateCurriculum,
  UpdateTopic,
  UpdateNode,
  UpdateArticle,
  BatchReorder,
} from '@/lib/schemas/curriculum';

// ============================================================================
// HELPERS
// ============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const res = await fetch(`${BASE_URL}/functions/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  const json = await res.json();
  return json.data?.data || json.data || json;
}

async function getAuthToken(): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Auth token only available client-side');
  }

  // Import dynamically to avoid SSR issues
  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  return session.access_token;
}

// ============================================================================
// CURRICULUM
// ============================================================================

export async function listCurricula(): Promise<Curriculum[]> {
  return fetchWithAuth<Curriculum[]>('/curriculum/list');
}

export async function getCurriculum(id: string): Promise<Curriculum> {
  return fetchWithAuth<Curriculum>(`/curriculum/${id}`);
}

export async function createCurriculum(
  data: CreateCurriculum
): Promise<Curriculum> {
  return fetchWithAuth<Curriculum>('/curriculum', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCurriculum(
  id: string,
  data: UpdateCurriculum
): Promise<Curriculum> {
  return fetchWithAuth<Curriculum>(`/curriculum/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCurriculum(id: string): Promise<void> {
  return fetchWithAuth<void>(`/curriculum/${id}`, { method: 'DELETE' });
}

// ============================================================================
// TOPICS
// ============================================================================

export async function listTopics(curriculumId: string): Promise<Topic[]> {
  return fetchWithAuth<Topic[]>(`/curriculum/${curriculumId}/topics`);
}

export async function getTopic(
  curriculumId: string,
  topicId: string
): Promise<Topic> {
  return fetchWithAuth<Topic>(`/curriculum/${curriculumId}/topics/${topicId}`);
}

export async function createTopic(
  curriculumId: string,
  data: CreateTopic
): Promise<Topic> {
  return fetchWithAuth<Topic>(`/curriculum/${curriculumId}/topics`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTopic(
  curriculumId: string,
  topicId: string,
  data: UpdateTopic
): Promise<Topic> {
  return fetchWithAuth<Topic>(
    `/curriculum/${curriculumId}/topics/${topicId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

export async function deleteTopic(
  curriculumId: string,
  topicId: string
): Promise<void> {
  return fetchWithAuth<void>(`/curriculum/${curriculumId}/topics/${topicId}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// NODES
// ============================================================================

export async function listNodes(
  curriculumId: string,
  topicId: string
): Promise<Node[]> {
  return fetchWithAuth<Node[]>(
    `/curriculum/${curriculumId}/topics/${topicId}/nodes`
  );
}

export async function getNode(
  curriculumId: string,
  topicId: string,
  nodeId: string
): Promise<Node> {
  return fetchWithAuth<Node>(
    `/curriculum/${curriculumId}/topics/${topicId}/nodes/${nodeId}`
  );
}

export async function createNode(
  curriculumId: string,
  topicId: string,
  data: CreateNode
): Promise<Node> {
  return fetchWithAuth<Node>(
    `/curriculum/${curriculumId}/topics/${topicId}/nodes`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function updateNode(
  curriculumId: string,
  topicId: string,
  nodeId: string,
  data: UpdateNode
): Promise<Node> {
  return fetchWithAuth<Node>(
    `/curriculum/${curriculumId}/topics/${topicId}/nodes/${nodeId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

export async function deleteNode(
  curriculumId: string,
  topicId: string,
  nodeId: string
): Promise<void> {
  return fetchWithAuth<void>(
    `/curriculum/${curriculumId}/nodes/${nodeId}`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * Batch reorder nodes within a topic
 */
export async function reorderNodes(
  curriculumId: string,
  topicId: string,
  data: BatchReorder
): Promise<void> {
  return fetchWithAuth<void>(
    `/curriculum/${curriculumId}/topics/${topicId}/nodes/reorder`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

// ============================================================================
// ARTICLES (Activities)
// ============================================================================

export async function listArticles(
  curriculumId: string,
  nodeId: string
): Promise<Article[]> {
  return fetchWithAuth<Article[]>(
    `/curriculum/${curriculumId}/nodes/${nodeId}/activities`
  );
}

export async function createArticle(
  curriculumId: string,
  data: CreateArticle & { node_id: string }
): Promise<Article> {
  return fetchWithAuth<Article>(`/curriculum/${curriculumId}/activities`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateArticle(
  curriculumId: string,
  articleId: string,
  data: UpdateArticle
): Promise<Article> {
  return fetchWithAuth<Article>(
    `/curriculum/${curriculumId}/activities/${articleId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

export async function deleteArticle(
  curriculumId: string,
  articleId: string
): Promise<void> {
  return fetchWithAuth<void>(
    `/curriculum/${curriculumId}/activities/${articleId}`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * Batch reorder articles within a node
 */
export async function reorderArticles(
  curriculumId: string,
  nodeId: string,
  data: BatchReorder
): Promise<void> {
  return fetchWithAuth<void>(
    `/curriculum/${curriculumId}/nodes/${nodeId}/activities/reorder`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

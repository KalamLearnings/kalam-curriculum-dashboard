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
  ActivityTemplate,
  CreateActivityTemplate,
  UpdateActivityTemplate,
  InstantiateTemplate,
} from '@/lib/schemas/curriculum';

// ============================================================================
// HELPERS
// ============================================================================

import { getPersistedEnvironment, getConfigForEnvironment } from '@/lib/stores/environmentStore';
import { getClientForEnv } from '@/lib/supabase/client';

async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const env = getPersistedEnvironment();
  const config = getConfigForEnvironment(env);
  const token = await getAuthToken();

  const res = await fetch(`${config.url}/functions/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: config.anonKey,
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

  const env = getPersistedEnvironment();
  const supabase = getClientForEnv(env);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('NOT_AUTHENTICATED_FOR_ENV');
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

export async function duplicateTopic(
  curriculumId: string,
  topicId: string,
  targetLetterId: string
): Promise<Topic> {
  return fetchWithAuth<Topic>(
    `/curriculum/${curriculumId}/topics/${topicId}/duplicate`,
    {
      method: 'POST',
      body: JSON.stringify({ target_letter_id: targetLetterId }),
    }
  );
}

// ============================================================================
// NODES
// ============================================================================

export async function listNodes(
  curriculumId: string,
  topicId: string | null
): Promise<Node[]> {
  // If topicId is null, fetch all nodes across all topics
  const path = topicId
    ? `/curriculum/${curriculumId}/topics/${topicId}/nodes`
    : `/curriculum/${curriculumId}/nodes`;

  return fetchWithAuth<Node[]>(path);
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

// ============================================================================
// ACTIVITY TEMPLATES
// ============================================================================

/**
 * List all activity templates
 */
export async function listActivityTemplates(params?: {
  type?: string;
  category?: string;
}): Promise<ActivityTemplate[]> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append('type', params.type);
  if (params?.category) searchParams.append('category', params.category);

  const query = searchParams.toString();
  return fetchWithAuth<ActivityTemplate[]>(
    `/curriculum/templates${query ? `?${query}` : ''}`
  );
}

/**
 * Get a single activity template by ID
 */
export async function getActivityTemplate(id: string): Promise<ActivityTemplate> {
  return fetchWithAuth<ActivityTemplate>(`/curriculum/templates/${id}`);
}

/**
 * Create a new activity template
 */
export async function createActivityTemplate(
  data: CreateActivityTemplate
): Promise<ActivityTemplate> {
  return fetchWithAuth<ActivityTemplate>('/curriculum/templates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing activity template
 */
export async function updateActivityTemplate(
  id: string,
  data: UpdateActivityTemplate
): Promise<ActivityTemplate> {
  return fetchWithAuth<ActivityTemplate>(`/curriculum/templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete an activity template
 */
export async function deleteActivityTemplate(id: string): Promise<void> {
  return fetchWithAuth<void>(`/curriculum/templates/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Instantiate a template with variables
 */
export async function instantiateTemplate(
  data: InstantiateTemplate
): Promise<Article> {
  return fetchWithAuth<Article>('/curriculum/templates/instantiate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

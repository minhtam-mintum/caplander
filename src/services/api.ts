const BASE_URL = 'https://caplandar-api.onrender.com/api';

// ─── User type ────────────────────────────────────────────────────────────────

export interface IUser {
  _id: string;
  userId: string;
  name: string;
  email?: string;
}

// ─── API resource types ───────────────────────────────────────────────────────

export interface IApiLabel {
  _id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IApiEventPayload {
  title: string;
  description?: string;
  labelId?: string | IApiLabel;
  startDate: string;
  endDate: string;
  allDay: boolean;
  color?: string;
  alert?: number;
}

export interface IApiEvent extends IApiEventPayload {
  _id: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// ─── Token management ─────────────────────────────────────────────────────────

let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _refreshPromise: Promise<void> | null = null;
let _onTokensRefreshed: ((tokens: { accessToken: string; refreshToken: string }) => void) | null =
  null;
let _onSessionExpired: (() => void) | null = null;

export function setOnTokensRefreshed(
  cb: (tokens: { accessToken: string; refreshToken: string }) => void,
) {
  _onTokensRefreshed = cb;
}

export function setOnSessionExpired(cb: (() => void) | null) {
  _onSessionExpired = cb;
}

export function initTokens(accessToken: string, refreshToken: string) {
  _accessToken = accessToken;
  _refreshToken = refreshToken;
}

export function clearTokens() {
  _accessToken = null;
  _refreshToken = null;
}

async function doRefresh(): Promise<void> {
  if (!_refreshToken) throw new Error('No refresh token');
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${_refreshToken}`,
    },
  });
  if (res.status === 401) {
    clearTokens();
    _onSessionExpired?.();
    throw new Error('Session expired');
  }
  if (!res.ok) {
    let message = 'Unable to refresh session';
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {}
    throw new Error(message);
  }
  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  _accessToken = data.accessToken;
  _refreshToken = data.refreshToken;
  _onTokensRefreshed?.(data);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`;

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && _refreshToken) {
    if (!_refreshPromise) {
      _refreshPromise = doRefresh().finally(() => {
        _refreshPromise = null;
      });
    }
    try {
      await _refreshPromise;
      if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`;
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    } catch (error) {
      if (error instanceof Error && error.message === 'Session expired') {
        throw new Error('Session expired. Please log in again.');
      }
      throw error;
    }
  }

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {}
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function apiRegister(userId: string, password: string, name: string) {
  return request<{ message: string; user: IUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ userId, password, name }),
  });
}

export async function apiLogin(userId: string, password: string) {
  const data = await request<{ accessToken: string; refreshToken: string; user: IUser }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ userId, password }) },
  );
  initTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function apiLogout(refreshToken: string) {
  return request<{ message: string }>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function apiGetMe() {
  return request<IUser>('/users/me');
}

export async function apiUpdateMe(data: {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  return request<IUser>('/users/me', { method: 'PUT', body: JSON.stringify(data) });
}

export async function apiDeleteMe() {
  return request<{ message: string }>('/users/me', { method: 'DELETE' });
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export async function apiGetLabels() {
  return request<IApiLabel[]>('/labels');
}

export async function apiGetLabel(id: string) {
  return request<IApiLabel>(`/labels/${id}`);
}

export async function apiCreateLabel(data: { name: string; color: string }) {
  return request<IApiLabel>('/labels', { method: 'POST', body: JSON.stringify(data) });
}

export async function apiUpdateLabel(id: string, data: { name?: string; color?: string }) {
  return request<IApiLabel>(`/labels/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function apiDeleteLabel(id: string) {
  return request<{ message: string }>(`/labels/${id}`, { method: 'DELETE' });
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function apiGetEvents(params?: { from?: string; to?: string; labelId?: string }) {
  const query = new URLSearchParams();
  if (params?.from) query.set('from', params.from);
  if (params?.to) query.set('to', params.to);
  if (params?.labelId) query.set('labelId', params.labelId);
  const qs = query.toString();
  return request<IApiEvent[]>(`/events${qs ? `?${qs}` : ''}`);
}

export async function apiGetEvent(id: string) {
  return request<IApiEvent>(`/events/${id}`);
}

export async function apiCreateEvent(data: IApiEventPayload) {
  return request<IApiEvent>('/events', { method: 'POST', body: JSON.stringify(data) });
}

export async function apiUpdateEvent(id: string, data: Partial<IApiEventPayload>) {
  return request<IApiEvent>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function apiDeleteEvent(id: string) {
  return request<{ message: string }>(`/events/${id}`, { method: 'DELETE' });
}

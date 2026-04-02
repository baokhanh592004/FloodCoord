import axiosClient from "../api/axiosClient";

function unwrapResponse(response) {
  return response?.data?.result ?? response?.data;
}

function coerceRequestList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
}

function coercePagePayload(payload) {
  const content = coerceRequestList(payload);
  return {
    content,
    number: Number.isInteger(payload?.number) ? payload.number : 0,
    totalPages: Number.isInteger(payload?.totalPages) ? payload.totalPages : (content.length > 0 ? 1 : 0),
    totalElements: Number.isInteger(payload?.totalElements) ? payload.totalElements : content.length,
    size: Number.isInteger(payload?.size) ? payload.size : content.length,
    first: typeof payload?.first === 'boolean' ? payload.first : true,
    last: typeof payload?.last === 'boolean' ? payload.last : true,
  };
}

function parseCoordinate(value) {
  if (value == null) return null;
  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeCoordinates(rawLat, rawLon) {
  let latitude = parseCoordinate(rawLat);
  let longitude = parseCoordinate(rawLon);

  if (latitude == null || longitude == null) {
    return { latitude: null, longitude: null };
  }

  const isLatValid = latitude >= -90 && latitude <= 90;
  const isLonValid = longitude >= -180 && longitude <= 180;

  // Handle payloads where backend returns lon in latitude and lat in longitude.
  if (!isLatValid && isLonValid) {
    const swappedLat = longitude;
    const swappedLon = latitude;
    if (swappedLat >= -90 && swappedLat <= 90 && swappedLon >= -180 && swappedLon <= 180) {
      latitude = swappedLat;
      longitude = swappedLon;
    }
  }

  // FloodCoord is Vietnam-scoped: if values look clearly swapped, correct them.
  if (latitude >= 90 && latitude <= 130 && longitude >= -10 && longitude <= 40) {
    const swappedLat = longitude;
    const swappedLon = latitude;
    if (swappedLat >= -90 && swappedLat <= 90 && swappedLon >= -180 && swappedLon <= 180) {
      latitude = swappedLat;
      longitude = swappedLon;
    }
  }

  const finalLatValid = latitude >= -90 && latitude <= 90;
  const finalLonValid = longitude >= -180 && longitude <= 180;

  if (!finalLatValid || !finalLonValid) {
    return { latitude: null, longitude: null };
  }

  return { latitude, longitude };
}

function normalizeLocation(request) {
  const rawLocation = request?.location && typeof request.location === 'object' ? request.location : {};
  const rawLat = rawLocation.latitude ?? rawLocation.lat ?? request?.latitude ?? request?.lat;
  const rawLon = rawLocation.longitude ?? rawLocation.lon ?? request?.longitude ?? request?.lon;
  const { latitude, longitude } = normalizeCoordinates(rawLat, rawLon);

  return {
    ...rawLocation,
    addressText: rawLocation.addressText ?? request?.address ?? '',
    latitude,
    longitude,
  };
}

function normalizeRequest(rawRequest = {}) {
  const requestId = rawRequest.requestId ?? rawRequest.id ?? null;

  return {
    ...rawRequest,
    id: rawRequest.id ?? requestId,
    requestId,
    trackingCode: rawRequest.trackingCode ?? (requestId != null ? String(requestId) : ''),
    status: rawRequest.status ?? 'PENDING',
    emergencyLevel: rawRequest.emergencyLevel ?? rawRequest.priority ?? 'LOW',
    contactName: rawRequest.contactName ?? rawRequest.citizenName ?? '',
    contactPhone: rawRequest.contactPhone ?? rawRequest.phone ?? '',
    createdAt: rawRequest.createdAt ?? rawRequest.created_at ?? null,
    updatedAt: rawRequest.updatedAt ?? rawRequest.updated_at ?? rawRequest.createdAt ?? null,
    media: Array.isArray(rawRequest.media) ? rawRequest.media : [],
    location: normalizeLocation(rawRequest),
  };
}

function mergeRequestData(listRequest, detailRequest) {
  if (!detailRequest) return normalizeRequest(listRequest);

  return normalizeRequest({
    ...detailRequest,
    ...listRequest,
    // Keep detail-rich location/media when available.
    location: detailRequest.location || listRequest.location,
    media: Array.isArray(detailRequest.media) && detailRequest.media.length > 0
      ? detailRequest.media
      : listRequest.media,
  });
}

export const coordinatorDashboardApi = {
  getStats: async (params) => {
    const response = await axiosClient.get('/api/coordinator/dashboard', { params });
    return unwrapResponse(response);
  },

  getRequestsPage: async (page = 0, size = 10, params = {}) => {
    const response = await axiosClient.get('/api/coordinator/requests/rescue-requests', {
      params: { page, size, ...params },
    });
    const payload = coercePagePayload(unwrapResponse(response));
    return {
      ...payload,
      content: payload.content.map(normalizeRequest),
    };
  },

  // Read model for dashboard/analytics request data.
  getRequests: async (params = {}) => {
    const payload = await coordinatorDashboardApi.getRequestsPage(0, 10, params);
    return payload.content;
  },

  getRequestDetail: async (requestId) => {
    const response = await axiosClient.get(`/api/coordinator/requests/rescue-requests/${requestId}`);
    return normalizeRequest(unwrapResponse(response) || {});
  },

  // RequestQueue uses this to receive a single normalized, enriched list.
  getRequestsWithDetails: async (params = {}) => {
    const list = await coordinatorDashboardApi.getRequests(params);

    if (!list.length) return [];

    const detailResults = await Promise.allSettled(
      list.map((req) => coordinatorDashboardApi.getRequestDetail(req.requestId || req.id))
    );

    return list.map((req, index) => {
      const detail = detailResults[index]?.status === 'fulfilled' ? detailResults[index].value : null;
      return mergeRequestData(req, detail);
    });
  },

  getRequestsPageWithDetails: async (page = 0, size = 10, params = {}) => {
    const pagePayload = await coordinatorDashboardApi.getRequestsPage(page, size, params);

    if (!pagePayload.content.length) {
      return pagePayload;
    }

    const detailResults = await Promise.allSettled(
      pagePayload.content.map((req) => coordinatorDashboardApi.getRequestDetail(req.requestId || req.id))
    );

    return {
      ...pagePayload,
      content: pagePayload.content.map((req, index) => {
        const detail = detailResults[index]?.status === 'fulfilled' ? detailResults[index].value : null;
        return mergeRequestData(req, detail);
      }),
    };
  },
};
# Document Search API - Frontend Implementation Guide

## Overview

This guide provides comprehensive documentation for implementing the Connect Room Document Search API in your frontend application. The API allows members to search for documents within connect rooms using various filters and sorting options.

## Base URL
```
https://your-api-domain.com/api/v1
```

## Authentication
All endpoints require Bearer token authentication:
```javascript
headers: {
  'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
  'Content-Type': 'application/json'
}
```

---

## API Endpoint

### Search Documents
**GET** `/connect-room/{room_id}/documents/search`

Search for documents within a specific connect room.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `room_id` | integer | Yes | ID of the connect room |

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes | - | Search query (searches title, description, file_name) |
| `file_type` | string | No | - | Filter by file type (pdf, doc, docx, xls, xlsx, txt) |
| `uploaded_by` | integer | No | - | Filter by uploader user ID |
| `date_from` | string | No | - | Filter from date (YYYY-MM-DD) |
| `date_to` | string | No | - | Filter to date (YYYY-MM-DD) |
| `size_min` | integer | No | - | Minimum file size in bytes |
| `size_max` | integer | No | - | Maximum file size in bytes |
| `sort_by` | string | No | `created_at` | Sort field (created_at, title, file_size, file_name) |
| `sort_order` | string | No | `desc` | Sort order (asc, desc) |
| `page` | integer | No | `1` | Page number for pagination |
| `per_page` | integer | No | `10` | Items per page (max 50) |

---

## Response Format

### Success Response (200)
```json
{
  "status": "success",
  "message": "Search completed successfully",
  "data": {
    "documents": [
      {
        "id": 1,
        "title": "Meeting Minutes January",
        "description": "Monthly team meeting notes",
        "file_name": "meeting_jan.pdf",
        "file_url": "https://s3.amazonaws.com/bucket/path/meeting_jan.pdf",
        "file_type": "pdf",
        "file_size": 1024,
        "formatted_file_size": "1 KB",
        "mime_type": "application/pdf",
        "is_private": false,
        "is_active": true,
        "created_at": "2024-01-15T10:30:00.000000Z",
        "updated_at": "2024-01-15T10:30:00.000000Z",
        "uploader": {
          "id": 1,
          "first_name": "John",
          "last_name": "Doe"
        }
      }
    ],
    "pagination": {
      "total": 25,
      "per_page": 10,
      "current_page": 1,
      "last_page": 3
    },
    "search_meta": {
      "query": "meeting",
      "total_results": 25,
      "filters_applied": {
        "file_type": "pdf",
        "date_from": "2024-01-01"
      }
    }
  }
}
```

### Error Responses

#### 403 Forbidden - Not a room member
```json
{
  "status": "error",
  "message": "You are not a member of this room"
}
```

#### 422 Validation Error
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "q": ["The q field is required."],
    "date_to": ["The date to must be a date after or equal to date from."]
  }
}
```

#### 404 Not Found
```json
{
  "status": "error",
  "message": "Room not found"
}
```

---

## Frontend Implementation Examples

### 1. Basic Search Component (React)

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DocumentSearch = ({ roomId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [searchMeta, setSearchMeta] = useState({});

  const searchDocuments = async (query, filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        ...filters
      });

      const response = await axios.get(
        `/api/v1/connect-room/${roomId}/documents/search?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      setDocuments(response.data.data.documents);
      setPagination(response.data.data.pagination);
      setSearchMeta(response.data.data.search_meta);
    } catch (error) {
      console.error('Search failed:', error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchDocuments(searchQuery);
    }
  };

  return (
    <div className="document-search">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents..."
          className="search-input"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searchMeta.query && (
        <div className="search-results-info">
          <p>Found {searchMeta.total_results} results for "{searchMeta.query}"</p>
        </div>
      )}

      <div className="documents-list">
        {documents.map(doc => (
          <div key={doc.id} className="document-item">
            <h3>{doc.title}</h3>
            <p>{doc.description}</p>
            <div className="document-meta">
              <span>Type: {doc.file_type.toUpperCase()}</span>
              <span>Size: {doc.formatted_file_size}</span>
              <span>Uploaded by: {doc.uploader.first_name} {doc.uploader.last_name}</span>
              <span>Date: {new Date(doc.created_at).toLocaleDateString()}</span>
            </div>
            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
              Download
            </a>
          </div>
        ))}
      </div>

      {pagination.last_page > 1 && (
        <div className="pagination">
          <button 
            disabled={pagination.current_page === 1}
            onClick={() => searchDocuments(searchQuery, { page: pagination.current_page - 1 })}
          >
            Previous
          </button>
          <span>Page {pagination.current_page} of {pagination.last_page}</span>
          <button 
            disabled={pagination.current_page === pagination.last_page}
            onClick={() => searchDocuments(searchQuery, { page: pagination.current_page + 1 })}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentSearch;
```

### 2. Advanced Search with Filters (Vue.js)

```vue
<template>
  <div class="advanced-document-search">
    <div class="search-header">
      <h2>Search Documents</h2>
    </div>

    <form @submit.prevent="performSearch" class="search-form">
      <!-- Basic Search -->
      <div class="form-group">
        <label for="query">Search Query *</label>
        <input
          id="query"
          v-model="filters.q"
          type="text"
          placeholder="Search by title, description, or filename..."
          required
        />
      </div>

      <!-- Advanced Filters -->
      <div class="filters-section">
        <h3>Filters</h3>
        
        <div class="filter-row">
          <div class="form-group">
            <label for="fileType">File Type</label>
            <select id="fileType" v-model="filters.file_type">
              <option value="">All Types</option>
              <option value="pdf">PDF</option>
              <option value="doc">DOC</option>
              <option value="docx">DOCX</option>
              <option value="xls">XLS</option>
              <option value="xlsx">XLSX</option>
              <option value="txt">TXT</option>
            </select>
          </div>

          <div class="form-group">
            <label for="uploader">Uploaded By</label>
            <select id="uploader" v-model="filters.uploaded_by">
              <option value="">All Users</option>
              <option v-for="user in roomMembers" :key="user.id" :value="user.id">
                {{ user.first_name }} {{ user.last_name }}
              </option>
            </select>
          </div>
        </div>

        <div class="filter-row">
          <div class="form-group">
            <label for="dateFrom">From Date</label>
            <input
              id="dateFrom"
              v-model="filters.date_from"
              type="date"
            />
          </div>

          <div class="form-group">
            <label for="dateTo">To Date</label>
            <input
              id="dateTo"
              v-model="filters.date_to"
              type="date"
            />
          </div>
        </div>

        <div class="filter-row">
          <div class="form-group">
            <label for="sizeMin">Min Size (KB)</label>
            <input
              id="sizeMin"
              v-model.number="filters.size_min"
              type="number"
              min="0"
            />
          </div>

          <div class="form-group">
            <label for="sizeMax">Max Size (KB)</label>
            <input
              id="sizeMax"
              v-model.number="filters.size_max"
              type="number"
              min="0"
            />
          </div>
        </div>
      </div>

      <!-- Sorting -->
      <div class="sorting-section">
        <h3>Sorting</h3>
        <div class="filter-row">
          <div class="form-group">
            <label for="sortBy">Sort By</label>
            <select id="sortBy" v-model="filters.sort_by">
              <option value="created_at">Date Created</option>
              <option value="title">Title</option>
              <option value="file_size">File Size</option>
              <option value="file_name">File Name</option>
            </select>
          </div>

          <div class="form-group">
            <label for="sortOrder">Order</label>
            <select id="sortOrder" v-model="filters.sort_order">
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="loading || !filters.q.trim()">
          {{ loading ? 'Searching...' : 'Search Documents' }}
        </button>
        <button type="button" @click="clearFilters">Clear Filters</button>
      </div>
    </form>

    <!-- Results -->
    <div v-if="searchResults.length > 0" class="search-results">
      <div class="results-header">
        <h3>Search Results</h3>
        <p>Found {{ searchMeta.total_results }} results for "{{ searchMeta.query }}"</p>
      </div>

      <div class="documents-grid">
        <div
          v-for="document in searchResults"
          :key="document.id"
          class="document-card"
        >
          <div class="document-icon">
            <i :class="getFileIcon(document.file_type)"></i>
          </div>
          <div class="document-info">
            <h4>{{ document.title }}</h4>
            <p class="description">{{ document.description }}</p>
            <div class="document-meta">
              <span class="file-type">{{ document.file_type.toUpperCase() }}</span>
              <span class="file-size">{{ document.formatted_file_size }}</span>
              <span class="uploader">{{ document.uploader.first_name }} {{ document.uploader.last_name }}</span>
              <span class="date">{{ formatDate(document.created_at) }}</span>
            </div>
          </div>
          <div class="document-actions">
            <a
              :href="document.file_url"
              target="_blank"
              rel="noopener noreferrer"
              class="download-btn"
            >
              Download
            </a>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="pagination">
        <button
          @click="goToPage(pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
        >
          Previous
        </button>
        
        <span class="page-info">
          Page {{ pagination.current_page }} of {{ pagination.last_page }}
        </span>
        
        <button
          @click="goToPage(pagination.current_page + 1)"
          :disabled="pagination.current_page === pagination.last_page"
        >
          Next
        </button>
      </div>
    </div>

    <div v-else-if="hasSearched && !loading" class="no-results">
      <p>No documents found matching your search criteria.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdvancedDocumentSearch',
  props: {
    roomId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      hasSearched: false,
      searchResults: [],
      pagination: {},
      searchMeta: {},
      roomMembers: [],
      filters: {
        q: '',
        file_type: '',
        uploaded_by: '',
        date_from: '',
        date_to: '',
        size_min: null,
        size_max: null,
        sort_by: 'created_at',
        sort_order: 'desc',
        page: 1,
        per_page: 12
      }
    };
  },
  async mounted() {
    await this.loadRoomMembers();
  },
  methods: {
    async performSearch() {
      this.loading = true;
      this.hasSearched = true;
      
      try {
        const params = new URLSearchParams();
        
        // Add non-empty filters to params
        Object.keys(this.filters).forEach(key => {
          if (this.filters[key] !== '' && this.filters[key] !== null) {
            params.append(key, this.filters[key]);
          }
        });

        const response = await axios.get(
          `/api/v1/connect-room/${this.roomId}/documents/search?${params}`,
          {
            headers: {
              'Authorization': `Bearer ${this.$store.getters.accessToken}`
            }
          }
        );

        this.searchResults = response.data.data.documents;
        this.pagination = response.data.data.pagination;
        this.searchMeta = response.data.data.search_meta;
      } catch (error) {
        console.error('Search failed:', error.response?.data?.message);
        this.$toast.error('Search failed: ' + (error.response?.data?.message || 'Unknown error'));
      } finally {
        this.loading = false;
      }
    },

    async loadRoomMembers() {
      try {
        const response = await axios.get(
          `/api/v1/connect-room/${this.roomId}/members`,
          {
            headers: {
              'Authorization': `Bearer ${this.$store.getters.accessToken}`
            }
          }
        );
        this.roomMembers = response.data.data.members;
      } catch (error) {
        console.error('Failed to load room members:', error);
      }
    },

    goToPage(page) {
      this.filters.page = page;
      this.performSearch();
    },

    clearFilters() {
      this.filters = {
        q: '',
        file_type: '',
        uploaded_by: '',
        date_from: '',
        date_to: '',
        size_min: null,
        size_max: null,
        sort_by: 'created_at',
        sort_order: 'desc',
        page: 1,
        per_page: 12
      };
      this.searchResults = [];
      this.hasSearched = false;
    },

    getFileIcon(fileType) {
      const icons = {
        pdf: 'fas fa-file-pdf',
        doc: 'fas fa-file-word',
        docx: 'fas fa-file-word',
        xls: 'fas fa-file-excel',
        xlsx: 'fas fa-file-excel',
        txt: 'fas fa-file-alt'
      };
      return icons[fileType] || 'fas fa-file';
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    }
  }
};
</script>

<style scoped>
.advanced-document-search {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.filters-section,
.sorting-section {
  margin: 20px 0;
  padding: 15px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.form-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button[type="submit"] {
  background: #007bff;
  color: white;
}

.form-actions button[type="button"] {
  background: #6c757d;
  color: white;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.document-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.document-icon {
  font-size: 2em;
  color: #007bff;
  margin-bottom: 10px;
}

.document-info h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.document-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
  font-size: 0.9em;
  color: #666;
}

.document-meta span {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.download-btn {
  background: #28a745;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 4px;
  text-align: center;
  margin-top: auto;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
```

### 3. JavaScript/TypeScript Service Class

```typescript
// DocumentSearchService.ts
import axios, { AxiosResponse } from 'axios';

export interface DocumentSearchFilters {
  q: string;
  file_type?: string;
  uploaded_by?: number;
  date_from?: string;
  date_to?: string;
  size_min?: number;
  size_max?: number;
  sort_by?: 'created_at' | 'title' | 'file_size' | 'file_name';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface Document {
  id: number;
  title: string;
  description: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  formatted_file_size: string;
  mime_type: string;
  is_private: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  uploader: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface SearchMeta {
  query: string;
  total_results: number;
  filters_applied: Record<string, any>;
}

export interface SearchResponse {
  status: string;
  message: string;
  data: {
    documents: Document[];
    pagination: Pagination;
    search_meta: SearchMeta;
  };
}

export class DocumentSearchService {
  private baseURL: string;
  private accessToken: string;

  constructor(baseURL: string, accessToken: string) {
    this.baseURL = baseURL;
    this.accessToken = accessToken;
  }

  /**
   * Search documents in a connect room
   */
  async searchDocuments(
    roomId: number,
    filters: DocumentSearchFilters
  ): Promise<SearchResponse> {
    const params = new URLSearchParams();
    
    // Add non-empty filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response: AxiosResponse<SearchResponse> = await axios.get(
      `${this.baseURL}/connect-room/${roomId}/documents/search?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }

  /**
   * Get file type icon class
   */
  getFileIcon(fileType: string): string {
    const icons: Record<string, string> = {
      pdf: 'fas fa-file-pdf text-red-500',
      doc: 'fas fa-file-word text-blue-500',
      docx: 'fas fa-file-word text-blue-500',
      xls: 'fas fa-file-excel text-green-500',
      xlsx: 'fas fa-file-excel text-green-500',
      txt: 'fas fa-file-alt text-gray-500'
    };
    return icons[fileType] || 'fas fa-file text-gray-500';
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Validate search filters
   */
  validateFilters(filters: DocumentSearchFilters): string[] {
    const errors: string[] = [];

    if (!filters.q || filters.q.trim().length === 0) {
      errors.push('Search query is required');
    }

    if (filters.q && filters.q.length > 255) {
      errors.push('Search query must be less than 255 characters');
    }

    if (filters.date_from && filters.date_to) {
      const fromDate = new Date(filters.date_from);
      const toDate = new Date(filters.date_to);
      
      if (fromDate > toDate) {
        errors.push('From date must be before or equal to to date');
      }
    }

    if (filters.size_min !== undefined && filters.size_min < 0) {
      errors.push('Minimum size must be greater than or equal to 0');
    }

    if (filters.size_max !== undefined && filters.size_max < 0) {
      errors.push('Maximum size must be greater than or equal to 0');
    }

    if (filters.size_min !== undefined && filters.size_max !== undefined) {
      if (filters.size_min > filters.size_max) {
        errors.push('Minimum size must be less than or equal to maximum size');
      }
    }

    if (filters.per_page !== undefined && (filters.per_page < 1 || filters.per_page > 50)) {
      errors.push('Per page must be between 1 and 50');
    }

    return errors;
  }
}

// Usage example
const documentSearchService = new DocumentSearchService(
  'https://your-api-domain.com/api/v1',
  'your-access-token'
);

// Search documents
const searchFilters: DocumentSearchFilters = {
  q: 'meeting minutes',
  file_type: 'pdf',
  date_from: '2024-01-01',
  sort_by: 'created_at',
  sort_order: 'desc',
  per_page: 20
};

documentSearchService.searchDocuments(123, searchFilters)
  .then(response => {
    console.log('Search results:', response.data.documents);
    console.log('Total results:', response.data.search_meta.total_results);
  })
  .catch(error => {
    console.error('Search failed:', error.response?.data?.message);
  });
```

### 4. Angular Service Example

```typescript
// document-search.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DocumentSearchFilters {
  q: string;
  file_type?: string;
  uploaded_by?: number;
  date_from?: string;
  date_to?: string;
  size_min?: number;
  size_max?: number;
  sort_by?: 'created_at' | 'title' | 'file_size' | 'file_name';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface Document {
  id: number;
  title: string;
  description: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  formatted_file_size: string;
  mime_type: string;
  created_at: string;
  uploader: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface SearchResponse {
  status: string;
  message: string;
  data: {
    documents: Document[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
    search_meta: {
      query: string;
      total_results: number;
      filters_applied: Record<string, any>;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class DocumentSearchService {
  private baseUrl = 'https://your-api-domain.com/api/v1';

  constructor(private http: HttpClient) {}

  searchDocuments(roomId: number, filters: DocumentSearchFilters): Observable<SearchResponse> {
    let params = new HttpParams();
    
    // Add non-empty filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<SearchResponse>(
      `${this.baseUrl}/connect-room/${roomId}/documents/search`,
      { params }
    );
  }
}
```

---

## Error Handling Best Practices

### 1. Network Error Handling
```javascript
const handleSearchError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 403:
        showError('You are not a member of this room');
        break;
      case 404:
        showError('Room not found');
        break;
      case 422:
        showValidationErrors(data.errors);
        break;
      case 500:
        showError('Server error. Please try again later.');
        break;
      default:
        showError(data.message || 'An unexpected error occurred');
    }
  } else if (error.request) {
    // Network error
    showError('Network error. Please check your connection.');
  } else {
    // Other error
    showError('An unexpected error occurred');
  }
};
```

### 2. Loading States
```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const performSearch = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const results = await searchDocuments(filters);
    setDocuments(results);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

---

## Performance Optimization Tips

### 1. Debounced Search
```javascript
import { useDebounce } from 'use-debounce';

const [searchQuery, setSearchQuery] = useState('');
const [debouncedQuery] = useDebounce(searchQuery, 500);

useEffect(() => {
  if (debouncedQuery) {
    performSearch(debouncedQuery);
  }
}, [debouncedQuery]);
```

### 2. Caching Results
```javascript
const [searchCache, setSearchCache] = useState(new Map());

const getCachedResults = (cacheKey) => {
  return searchCache.get(cacheKey);
};

const cacheResults = (cacheKey, results) => {
  setSearchCache(prev => new Map(prev).set(cacheKey, results));
};
```

### 3. Infinite Scroll
```javascript
const [documents, setDocuments] = useState([]);
const [hasMore, setHasMore] = useState(true);
const [page, setPage] = useState(1);

const loadMore = async () => {
  if (!hasMore || loading) return;
  
  const nextPage = page + 1;
  const results = await searchDocuments({ ...filters, page: nextPage });
  
  setDocuments(prev => [...prev, ...results.data.documents]);
  setPage(nextPage);
  setHasMore(nextPage < results.data.pagination.last_page);
};
```

---

## Testing Examples

### 1. Unit Test (Jest)
```javascript
import { DocumentSearchService } from './DocumentSearchService';

describe('DocumentSearchService', () => {
  let service;
  let mockAxios;

  beforeEach(() => {
    mockAxios = {
      get: jest.fn()
    };
    service = new DocumentSearchService('http://test.com', 'token');
    service.axios = mockAxios;
  });

  it('should search documents with correct parameters', async () => {
    const mockResponse = {
      data: {
        status: 'success',
        data: {
          documents: [],
          pagination: { total: 0, per_page: 10, current_page: 1, last_page: 0 },
          search_meta: { query: 'test', total_results: 0, filters_applied: {} }
        }
      }
    };

    mockAxios.get.mockResolvedValue(mockResponse);

    const filters = { q: 'test', file_type: 'pdf' };
    const result = await service.searchDocuments(123, filters);

    expect(mockAxios.get).toHaveBeenCalledWith(
      'http://test.com/connect-room/123/documents/search?q=test&file_type=pdf',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer token'
        })
      })
    );

    expect(result.status).toBe('success');
  });
});
```

---

## Integration Checklist

- [ ] Set up authentication with Bearer tokens
- [ ] Implement error handling for all HTTP status codes
- [ ] Add loading states for better UX
- [ ] Implement debounced search for performance
- [ ] Add pagination controls
- [ ] Handle empty search results gracefully
- [ ] Implement responsive design for mobile devices
- [ ] Add accessibility features (ARIA labels, keyboard navigation)
- [ ] Test with various file types and sizes
- [ ] Implement proper error logging
- [ ] Add unit tests for search functionality
- [ ] Optimize for performance with large result sets

---

## Support

For technical support or questions about the Document Search API, please contact the development team or refer to the main API documentation.

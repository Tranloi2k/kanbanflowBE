# KanbanFlow API Documentation

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

All endpoints except `/users/register` and `/users/login` require JWT authentication.

Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication

#### Register User

```http
POST /users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User

```http
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Profile

```http
GET /users/profile
Authorization: Bearer <token>
```

### Projects

#### Get All Projects

```http
GET /projects
Authorization: Bearer <token>
```

#### Get Project by ID

```http
GET /projects/{id}
Authorization: Bearer <token>
```

#### Create Project

```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Project",
  "key": "MP",
  "description": "Project description",
  "category": "Web Development",
  "template": "scrum",
  "avatarColor": "bg-blue-500"
}
```

#### Update Project

```http
PUT /projects/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description",
  "isArchived": false
}
```

#### Delete Project

```http
DELETE /projects/{id}
Authorization: Bearer <token>
```

#### Get User Projects

```http
GET /projects/user/{userId}
Authorization: Bearer <token>
```

#### Get Project Members

```http
GET /projects/{id}/members
Authorization: Bearer <token>
```

#### Add Project Member

```http
POST /projects/{id}/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-id-here",
  "role": "developer"
}
```

#### Remove Project Member

```http
DELETE /projects/{id}/members/{userId}
Authorization: Bearer <token>
```

### Issues

#### Get All Issues

```http
GET /issues?priority=high&status=status-id&limit=20&offset=0
Authorization: Bearer <token>
```

#### Get Issue by ID

```http
GET /issues/{id}
Authorization: Bearer <token>
```

#### Create Issue

```http
POST /issues
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "project-id-here",
  "title": "Issue Title",
  "description": "Issue description",
  "issueType": "task",
  "priority": "high",
  "statusId": "status-id-here",
  "assigneeId": "user-id-here",
  "storyPoints": 5,
  "dueDate": "2023-12-31",
  "labelIds": ["label-id-1", "label-id-2"]
}
```

#### Update Issue

```http
PUT /issues/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "priority": "medium",
  "storyPoints": 8,
  "labelIds": ["label-id-1"]
}
```

#### Delete Issue

```http
DELETE /issues/{id}
Authorization: Bearer <token>
```

#### Get Project Issues

```http
GET /issues/project/{projectId}?status=status-id&assignee=user-id&search=keyword
Authorization: Bearer <token>
```

#### Update Issue Status

```http
PATCH /issues/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "statusId": "new-status-id"
}
```

#### Assign Issue

```http
PATCH /issues/{id}/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "assigneeId": "user-id-here"
}
```

#### Get Issue Comments

```http
GET /issues/{id}/comments
Authorization: Bearer <token>
```

#### Add Issue Comment

```http
POST /issues/{id}/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "This is a comment on the issue"
}
```

## Response Format

### Success Response

```json
{
  "statusCode": 200,
  "data": {...},
  "message": "Success message",
  "success": true
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "stack": "Error stack (development only)"
}
```

## Data Models

### User

```json
{
  "id": "uuid",
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "avatarUrl": "https://example.com/avatar.jpg",
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Project

```json
{
  "id": "uuid",
  "name": "Project Name",
  "key": "PROJ",
  "description": "Project description",
  "category": "Web Development",
  "template": "scrum",
  "leadId": "uuid",
  "avatarColor": "bg-blue-500",
  "isStarred": false,
  "isArchived": false,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Issue

```json
{
  "id": "uuid",
  "projectId": "uuid",
  "title": "Issue Title",
  "description": "Issue description",
  "issueType": "task",
  "priority": "medium",
  "statusId": "uuid",
  "assigneeId": "uuid",
  "reporterId": "uuid",
  "storyPoints": 5,
  "position": 1,
  "dueDate": "2023-12-31",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

## Enums

### Issue Type

- `task`
- `bug`
- `feature`
- `story`

### Priority

- `low`
- `medium`
- `high`
- `urgent`

### Project Template

- `scrum`
- `kanban`
- `basic`

### User Role

- `user`
- `admin`

### Project Member Role

- `lead`
- `admin`
- `developer`
- `designer`
- `tester`
- `member`

---
applyTo: "**/*.ts,**/*.js,**/*.py,**/*.cs,**/*.java,**/*.go,**/openapi.yaml,**/openapi.json,**/*.http"
---

# API Documentation Standards — OpenAPI / Swagger

> These rules apply to every backend route, controller, and API endpoint.
> All APIs **MUST** be documented using **OpenAPI 3.1** specification (OAS 3.1).
> Swagger UI **MUST** be enabled in development and staging environments.

---

## Non-Negotiables

1. **Every public API endpoint MUST have an OpenAPI annotation/decorator** — no undocumented routes
2. **Use OAS 3.1** (not Swagger 2.0, not OAS 3.0 unless constrained by tooling)
3. **All request and response schemas MUST be defined** — no `any` schema types
4. **All non-2xx responses MUST be documented** — at minimum 400, 401, 403, 404, 500
5. **Every operation MUST have a unique `operationId`** — follows `verbNoun` convention (e.g., `getUser`, `createOrder`)
6. **Auth schemes MUST be documented** in `components/securitySchemes` and applied per-operation
7. **Swagger UI MUST NOT be exposed in production** — enable only for `development` and `staging`
8. **API versioning MUST be reflected** in both the URL path (`/api/v1/`) and the OAS `info.version`

---

## Framework-Specific Setup

### ASP.NET Core (.NET 9+)

.NET 9+ includes **built-in OpenAPI support** (`Microsoft.AspNetCore.OpenApi`). Use it by default; use Swashbuckle only for projects targeting .NET 8 or earlier.

```csharp
// Program.cs — .NET 9+ built-in OpenAPI
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info = new()
        {
            Title = "My API",
            Version = "v1",
            Description = "API for [project description]",
            Contact = new() { Name = "Team Name", Email = "team@example.com" }
        };
        return Task.CompletedTask;
    });
});

if (app.Environment.IsDevelopment() || app.Environment.IsStaging())
{
    app.MapOpenApi();                  // Serves /openapi/v1.json
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/openapi/v1.json", "API v1");
        c.RoutePrefix = "docs";       // Access at /docs
    });
}
```

#### Swashbuckle (ASP.NET Core .NET 8 and earlier)

```csharp
// Install: dotnet add package Swashbuckle.AspNetCore
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "[Project Name] API",
        Version = "v1",
        Description = "[Brief API description]"
    });
    // Enable XML doc comments
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFile));
    // Enable Bearer auth in Swagger UI
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Enter JWT token"
    });
});

if (app.Environment.IsDevelopment() || app.Environment.IsStaging())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");
        c.RoutePrefix = "docs";
    });
}
```

```xml
<!-- .csproj — Enable XML docs for Swagger comments -->
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
  <NoWarn>$(NoWarn);1591</NoWarn>
</PropertyGroup>
```

**Controller annotation example:**

```csharp
/// <summary>Gets a user by ID.</summary>
/// <param name="id">The user's unique identifier.</param>
/// <returns>The requested user object.</returns>
/// <response code="200">User found and returned.</response>
/// <response code="404">User not found.</response>
/// <response code="401">Unauthorized — token missing or invalid.</response>
[HttpGet("{id}")]
[ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public async Task<IActionResult> GetUser(int id) { ... }
```

---

### FastAPI (Python)

FastAPI generates OpenAPI docs automatically. Configuration is mandatory.

```python
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

app = FastAPI(
    title="[Project Name] API",
    version="1.0.0",
    description="[API description]",
    docs_url="/docs" if not is_production else None,     # Disable in prod
    redoc_url="/redoc" if not is_production else None,
    openapi_url="/openapi.json" if not is_production else None,
)

# Annotate every endpoint
@app.get(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Get a user by ID",
    responses={
        404: {"description": "User not found"},
        401: {"description": "Unauthorized"},
    },
    tags=["Users"],
    operation_id="getUser",
)
async def get_user(user_id: int):
    """
    Retrieve a single user by their unique ID.
    
    - **user_id**: Integer primary key of the user record
    """
    ...
```

---

### Express.js / NestJS (Node.js)

#### NestJS (recommended — built-in Swagger module)

```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('[Project Name] API')
  .setDescription('[API description]')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);

if (process.env.NODE_ENV !== 'production') {
  SwaggerModule.setup('docs', app, document);  // Access at /docs
}
```

```typescript
// Controller decorators — REQUIRED on every endpoint
@ApiTags('users')
@Controller('users')
export class UsersController {
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID', operationId: 'getUser' })
  @ApiParam({ name: 'id', type: 'integer', description: 'User ID' })
  @ApiOkResponse({ type: UserDto, description: 'User found' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  @ApiBearerAuth()
  async getUser(@Param('id') id: number): Promise<UserDto> { ... }
}
```

#### Express.js (swagger-jsdoc + swagger-ui-express)

```typescript
// Install: npm install swagger-jsdoc swagger-ui-express
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.1.0',
    info: { title: '[Project] API', version: '1.0.0' },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  apis: ['./src/routes/**/*.ts'],  // Scan route files for JSDoc annotations
});

if (process.env.NODE_ENV !== 'production') {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Route annotation (JSDoc):
/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     operationId: getUser
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/UserDto' }
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
```

---

### Spring Boot (Java)

```xml
<!-- pom.xml -->
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>2.x.x</version>
</dependency>
```

```java
// application.yml
springdoc:
  api-docs:
    enabled: ${SWAGGER_ENABLED:false}  # Set to true in dev/staging only
  swagger-ui:
    path: /docs
    enabled: ${SWAGGER_ENABLED:false}
```

```java
@Tag(name = "Users", description = "User management endpoints")
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Operation(summary = "Get user by ID", operationId = "getUser")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User found"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) { ... }
}
```

---

## OpenAPI Document Standards

### `openapi.yaml` / `openapi.json` Structure

When maintaining a spec-first (design-first) API, the entry document must follow this structure:

```yaml
openapi: "3.1.0"
info:
  title: "[Project Name] API"
  version: "1.0.0"
  description: "[Brief description]"
  contact:
    name: "[Team Name]"
    email: "[team@example.com]"
  license:
    name: "Proprietary"

servers:
  - url: "https://api.example.com/v1"
    description: "Production"
  - url: "https://staging-api.example.com/v1"
    description: "Staging"
  - url: "http://localhost:3000/v1"
    description: "Local development"

tags:
  - name: Users
    description: "User account management"
  - name: Health
    description: "Service health and readiness"

paths:
  /health:
    get:
      tags: [Health]
      summary: "Service health check"
      operationId: "getHealth"
      responses:
        "200":
          description: "Service is healthy"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/HealthResponse"

components:
  schemas:
    HealthResponse:
      type: object
      required: [status]
      properties:
        status:
          type: string
          enum: [healthy, degraded, unhealthy]
        timestamp:
          type: string
          format: date-time
    ErrorResponse:
      type: object
      required: [code, message]
      properties:
        code:
          type: integer
          format: int32
        message:
          type: string
        details:
          type: string
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

---

## Required Endpoints

Every backend service **MUST** implement:

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Liveness probe — returns `{ status: "healthy" }` |
| `/health/ready` | GET | Readiness probe — checks DB, cache, dependencies |
| `/docs` | GET | Swagger UI (dev/staging only) |
| `/openapi.json` or `/swagger/v1/swagger.json` | GET | Raw OAS document (dev/staging only) |

---

## Response Schema Standards

- All responses return **`application/json`**
- Error responses use a **consistent `ErrorResponse` schema** (never raw strings)
- Paginated lists use a **consistent envelope**: `{ data: [], total: int, page: int, pageSize: int }`
- Datetime fields use **ISO 8601 format** (`date-time`)
- IDs use **integers or UUIDs** — document the format explicitly

```yaml
# Standard error envelope — define in components/schemas and $ref everywhere
ErrorResponse:
  type: object
  required: [code, message]
  properties:
    code:
      type: integer
      example: 404
    message:
      type: string
      example: "Resource not found"
    details:
      type: string
      description: "Additional context for debugging (dev/staging only)"
```

---

## Security Documentation

All security schemes must be declared in `components/securitySchemes`:

| Scheme | OAS type | Use case |
|---|---|---|
| JWT Bearer | `http / bearer` | Standard user auth |
| API Key | `apiKey` | Service-to-service |
| OAuth 2.0 | `oauth2 / authorizationCode` | Delegated user auth |

Apply `security` at operation level. Use empty array `security: []` only when explicitly allowing anonymous access.

---

## operationId Convention

| HTTP Method | Convention | Example |
|---|---|---|
| GET (single) | `get{Resource}` | `getUser`, `getOrder` |
| GET (list) | `list{Resources}` | `listUsers`, `listOrders` |
| POST | `create{Resource}` | `createUser` |
| PUT | `update{Resource}` | `updateUser` |
| PATCH | `patch{Resource}` | `patchUser` |
| DELETE | `delete{Resource}` | `deleteUser` |

---

## AI Agent Checklist

Before marking any backend feature complete, verify:

- [ ] Every new route has an OpenAPI annotation/decorator
- [ ] `operationId` is unique and follows `verbNoun` convention
- [ ] All path, query, and body parameters are documented with types and descriptions
- [ ] All possible response codes are documented (200, 201, 400, 401, 403, 404, 500 as applicable)
- [ ] Response schemas reference `$ref` components — no inline anonymous schemas for reused types
- [ ] `ErrorResponse` schema is used for all non-2xx responses
- [ ] Auth `security` requirements are declared on protected endpoints
- [ ] Swagger UI and `/openapi.json` endpoint are **disabled** behind an environment check for production
- [ ] `/health` and `/health/ready` endpoints exist and are documented
- [ ] Datetime fields use ISO 8601 (`date-time` format)

---

## References

- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.1)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Swashbuckle (ASP.NET)](https://github.com/domaindrivendev/Swashbuckle.AspNetCore)
- [springdoc-openapi](https://springdoc.org/)
- [FastAPI OpenAPI docs](https://fastapi.tiangolo.com/tutorial/first-steps/)
- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
- [swagger-jsdoc (Express)](https://github.com/Surnet/swagger-jsdoc)

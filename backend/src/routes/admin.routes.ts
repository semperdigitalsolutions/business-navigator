/**
 * Admin API Routes
 * Issue #203: API routes for Epic 9 admin dashboard functionality
 *
 * Provides endpoints for managing models, tiers, settings, API keys, and audit logs.
 */
import { Elysia, t } from 'elysia'
import { adminMiddleware } from '@/middleware/admin.js'
import { errorResponse, successResponse } from '@/middleware/error.js'
import { modelsService } from '@/services/models.service.js'
import { tiersService } from '@/services/tiers.service.js'
import { adminConfigService } from '@/services/admin-config.service.js'

export const adminRoutes = new Elysia({ prefix: '/api/admin' })
  // ============================================
  // Models Management
  // ============================================

  .get('/models', async ({ request }) => {
    const auth = await adminMiddleware({ request } as any)
    if (!auth.success) {
      return errorResponse(auth.error ?? 'Unauthorized', auth.status ?? 401)
    }

    try {
      const models = await modelsService.getAvailableModels()
      return successResponse({ models })
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })

  .post(
    '/models',
    async ({ request, body }) => {
      const auth = await adminMiddleware({ request } as any)
      if (!auth.success || !auth.user) {
        return errorResponse(auth.error ?? 'Unauthorized', auth.status ?? 401)
      }

      try {
        const model = await modelsService.createModel(body)

        await adminConfigService.logAction(
          auth.user.id,
          'create',
          'ai_model',
          model.id,
          { model: body },
          { ipAddress: request.headers.get('x-forwarded-for') ?? undefined }
        )

        return successResponse({ model })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      body: t.Object({
        provider: t.String({ minLength: 1 }),
        modelId: t.String({ minLength: 1 }),
        displayName: t.String({ minLength: 1 }),
        creditCost: t.Number({ minimum: 1 }),
        minTierSlug: t.Optional(t.String()),
        isEnabled: t.Optional(t.Boolean()),
        capabilities: t.Optional(t.Record(t.String(), t.Unknown())),
        maxTokens: t.Optional(t.Number()),
        contextWindow: t.Optional(t.Number()),
        description: t.Optional(t.String()),
      }),
    }
  )

  .patch(
    '/models/:id',
    async ({ request, params, body }) => {
      const auth = await adminMiddleware({ request } as any)
      if (!auth.success || !auth.user) {
        return errorResponse(auth.error ?? 'Unauthorized', auth.status ?? 401)
      }

      try {
        const model = await modelsService.updateModel(params.id, body)

        await adminConfigService.logAction(
          auth.user.id,
          'update',
          'ai_model',
          params.id,
          { changes: body },
          { ipAddress: request.headers.get('x-forwarded-for') ?? undefined }
        )

        return successResponse({ model })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        displayName: t.Optional(t.String()),
        creditCost: t.Optional(t.Number()),
        minTierSlug: t.Optional(t.Nullable(t.String())),
        isEnabled: t.Optional(t.Boolean()),
        capabilities: t.Optional(t.Record(t.String(), t.Unknown())),
        maxTokens: t.Optional(t.Number()),
        contextWindow: t.Optional(t.Number()),
        description: t.Optional(t.String()),
      }),
    }
  )

  .patch(
    '/models/:id/toggle',
    async ({ request, params, body }) => {
      const auth = await adminMiddleware({ request } as any)
      if (!auth.success || !auth.user) {
        return errorResponse(auth.error ?? 'Unauthorized', auth.status ?? 401)
      }

      try {
        await modelsService.toggleModelEnabled(params.id, body.enabled)

        await adminConfigService.logAction(
          auth.user.id,
          body.enabled ? 'enable' : 'disable',
          'ai_model',
          params.id,
          { enabled: body.enabled },
          { ipAddress: request.headers.get('x-forwarded-for') ?? undefined }
        )

        return successResponse({ message: 'Model toggled successfully' })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ enabled: t.Boolean() }),
    }
  )

  // ============================================
  // Tiers Management
  // ============================================

  .get('/tiers', async ({ request, query }) => {
    const auth = await adminMiddleware({ request } as any)
    if (!auth.success) {
      return errorResponse(auth.error ?? 'Unauthorized', auth.status ?? 401)
    }

    try {
      const includeInactive = query.includeInactive === 'true'
      const tiers = await tiersService.getAllTiers(includeInactive)
      return successResponse({ tiers })
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })

  .post(
    '/tiers',
    async ({ request, body }) => {
      const auth = await adminMiddleware({ request } as any)
      if (!auth.success || !auth.user) {
        return errorResponse(auth.error ?? 'Unauthorized', auth.status ?? 401)
      }

      try {
        const tier = await tiersService.createTier(body)

        await adminConfigService.logAction(
          auth.user.id,
          'create',
          'subscription_tier',
          tier.id,
          { tier: body },
          { ipAddress: request.headers.get('x-forwarded-for') ?? undefined }
        )

        return successResponse({ tier })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      body: t.Object({
        slug: t.String({ minLength: 1 }),
        name: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        monthlyCredits: t.Number({ minimum: 0 }),
        priceCents: t.Number({ minimum: 0 }),
        features: t.Optional(t.Array(t.String())),
        isDefault: t.Optional(t.Boolean()),
        displayOrder: t.Optional(t.Number()),
        isActive: t.Optional(t.Boolean()),
      }),
    }
  )

  .patch(
    '/tiers/:id',
    async ({ request, params, body }) => {
      const auth = await adminMiddleware({ request } as any)
      if (!auth.success || !auth.user) {
        return errorResponse(auth.error ?? 'Unauthorized', auth.status ?? 401)
      }

      try {
        const tier = await tiersService.updateTier(params.id, body)

        await adminConfigService.logAction(
          auth.user.id,
          'update',
          'subscription_tier',
          params.id,
          { changes: body },
          { ipAddress: request.headers.get('x-forwarded-for') ?? undefined }
        )

        return successResponse({ tier })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String()),
        description: t.Optional(t.String()),
        monthlyCredits: t.Optional(t.Number()),
        priceCents: t.Optional(t.Number()),
        features: t.Optional(t.Array(t.String())),
        isDefault: t.Optional(t.Boolean()),
        displayOrder: t.Optional(t.Number()),
        isActive: t.Optional(t.Boolean()),
      }),
    }
  )

  // ============================================
  // Site Settings Management
  // ============================================

  .get('/settings', async ({ request, query }) => {
    const auth = await adminMiddleware({ request } as any)
    if (!auth.success) {
      return errorResponse(auth.error ?? 'Unauthorized', auth.status ?? 401)
    }

    try {
      const settings = await adminConfigService.getAllSettings(query.category)
      return successResponse({ settings })
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })

  .put(
    '/settings/:key',
    async ({ request, params, body }) => {
      const auth = await adminMiddleware({ request } as any)
      if (!auth.success || !auth.user) {
        return errorResponse(auth.error ?? 'Unauthorized', auth.status ?? 401)
      }

      try {
        await adminConfigService.setSetting(params.key, body.value, {
          description: body.description,
          category: body.category,
          isPublic: body.isPublic,
          isSensitive: body.isSensitive,
        })

        await adminConfigService.logAction(
          auth.user.id,
          'update',
          'site_setting',
          params.key,
          { value: body.isSensitive ? '[REDACTED]' : body.value },
          { ipAddress: request.headers.get('x-forwarded-for') ?? undefined }
        )

        return successResponse({ message: 'Setting updated successfully' })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      params: t.Object({ key: t.String() }),
      body: t.Object({
        value: t.Unknown(),
        description: t.Optional(t.String()),
        category: t.Optional(t.String()),
        isPublic: t.Optional(t.Boolean()),
        isSensitive: t.Optional(t.Boolean()),
      }),
    }
  )

  // ============================================
  // Feature Flags Management
  // ============================================

  .get('/feature-flags', async ({ request }) => {
    const auth = await adminMiddleware({ request } as any)
    if (!auth.success) {
      return errorResponse(auth.error ?? 'Unauthorized', auth.status ?? 401)
    }

    try {
      const flags = await adminConfigService.getAllFeatureFlags()
      return successResponse({ flags })
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })

  .put(
    '/feature-flags/:key',
    async ({ request, params, body }) => {
      const auth = await adminMiddleware({ request } as any)
      if (!auth.success || !auth.user) {
        return errorResponse(auth.error ?? 'Unauthorized', auth.status ?? 401)
      }

      try {
        await adminConfigService.setFeatureFlag(params.key, body.enabled, {
          rolloutPercentage: body.rolloutPercentage,
          targetTiers: body.targetTiers,
          description: body.description,
        })

        await adminConfigService.logAction(
          auth.user.id,
          'update',
          'feature_flag',
          params.key,
          { enabled: body.enabled, rolloutPercentage: body.rolloutPercentage },
          { ipAddress: request.headers.get('x-forwarded-for') ?? undefined }
        )

        return successResponse({ message: 'Feature flag updated successfully' })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      params: t.Object({ key: t.String() }),
      body: t.Object({
        enabled: t.Boolean(),
        rolloutPercentage: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
        targetTiers: t.Optional(t.Array(t.String())),
        description: t.Optional(t.String()),
      }),
    }
  )

  // ============================================
  // API Keys Management
  // ============================================

  .get('/api-keys', async ({ request }) => {
    const auth = await adminMiddleware({ request } as any)
    if (!auth.success) {
      return errorResponse(auth.error ?? 'Unauthorized', auth.status ?? 401)
    }

    try {
      const keys = await adminConfigService.getAllApiKeys()
      return successResponse({ keys })
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })

  .post(
    '/api-keys',
    async ({ request, body }) => {
      const auth = await adminMiddleware({ request } as any)
      if (!auth.success || !auth.user) {
        return errorResponse(auth.error ?? 'Unauthorized', auth.status ?? 401)
      }

      try {
        const key = await adminConfigService.createApiKey({
          provider: body.provider,
          apiKey: body.apiKey,
        })

        await adminConfigService.logAction(
          auth.user.id,
          'create',
          'admin_api_key',
          key.id,
          { provider: body.provider },
          { ipAddress: request.headers.get('x-forwarded-for') ?? undefined }
        )

        return successResponse({ key })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      body: t.Object({
        provider: t.String({ minLength: 1 }),
        apiKey: t.String({ minLength: 10 }),
      }),
    }
  )

  .post(
    '/api-keys/:id/rotate',
    async ({ request, params, body }) => {
      const auth = await adminMiddleware({ request } as any)
      if (!auth.success || !auth.user) {
        return errorResponse(auth.error ?? 'Unauthorized', auth.status ?? 401)
      }

      try {
        await adminConfigService.rotateApiKey(params.id, body.apiKey)

        await adminConfigService.logAction(
          auth.user.id,
          'rotate',
          'admin_api_key',
          params.id,
          {},
          { ipAddress: request.headers.get('x-forwarded-for') ?? undefined }
        )

        return successResponse({ message: 'API key rotated successfully' })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ apiKey: t.String({ minLength: 10 }) }),
    }
  )

  .delete(
    '/api-keys/:id',
    async ({ request, params }) => {
      const auth = await adminMiddleware({ request } as any)
      if (!auth.success || !auth.user) {
        return errorResponse(auth.error ?? 'Unauthorized', auth.status ?? 401)
      }

      try {
        await adminConfigService.deleteApiKey(params.id)

        await adminConfigService.logAction(
          auth.user.id,
          'delete',
          'admin_api_key',
          params.id,
          {},
          { ipAddress: request.headers.get('x-forwarded-for') ?? undefined }
        )

        return successResponse({ message: 'API key deleted successfully' })
      } catch (error: any) {
        return errorResponse(error.message)
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )

  // ============================================
  // Audit Log
  // ============================================

  .get('/audit-log', async ({ request, query }) => {
    const auth = await adminMiddleware({ request } as any)
    if (!auth.success) {
      return errorResponse(auth.error ?? 'Unauthorized', auth.status ?? 401)
    }

    try {
      const { entries, total } = await adminConfigService.getAuditLog({
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        offset: query.offset ? parseInt(query.offset, 10) : 0,
        adminUserId: query.adminId,
        resourceType: query.resourceType,
        action: query.action,
      })

      return successResponse({ entries, total })
    } catch (error: any) {
      return errorResponse(error.message)
    }
  })

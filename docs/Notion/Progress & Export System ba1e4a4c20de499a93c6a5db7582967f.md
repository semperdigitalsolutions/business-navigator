# Progress & Export System

Created by: Erick Nolasco
Created time: December 25, 2025 11:04 PM
Last edited by: Erick Nolasco
Last updated time: January 5, 2026 9:52 AM
Doc Type: Feature Spec
Key Info: Progress tracking, confidence score algorithm, document generation, version history & export UI
Phase: Core Features
Priority: High

_How the App Saves, Organizes, and Exports Everything Users Create_

_Last Updated: December 25, 2025_

## Document Purpose

This document explains how the app captures, stores, and surfaces everything a user creates as they build their business plan. It covers:

- **What gets saved** (progress, decisions, documents, files)
- **How it's organized** (data model, relationships)
- **Real-time sync** (auto-save, conflict resolution)
- **Document generation** (PDF export, business plan document)
- **Version history** (audit trail, rollback capability)
- **Integration** (how this connects to tasks, chat, dashboard)
- **Export & sharing** (formats, permissions, collaboration)

---

## The Big Picture: Your Living Business Plan

### What Users Get

As users complete tasks, they're not just checking boxes—they're **building a comprehensive business plan document** that includes:

✅ **Strategic Foundation**

- Problem statement
- Target customer persona
- Value proposition
- Competitive analysis
- Market validation results
- Success metrics

✅ **Business Model**

- Revenue model
- Pricing strategy
- MVP feature roadmap
- Funding strategy
- Financial projections

✅ **Legal Documentation**

- Entity type selection + reasoning
- Business name + trademark status
- EIN (encrypted)
- License requirements
- Operating agreement (if generated)
- Insurance policies

✅ **Financial Infrastructure**

- Accounting system choice
- Bank account details
- Startup budget breakdown
- Monthly operating budget
- Financial KPIs
- Tax payment schedule

✅ **Supporting Documents**

- Uploaded files (registrations, licenses, contracts)
- Generated documents (operating agreement, projections)
- External links (to state filings, domain registrations)
- Chat transcripts (important conversations with AI)

### Key Principle: Everything is Interconnected

Unlike a static PDF you create once, this is a **living document** that:

- Updates automatically as users complete tasks
- Connects decisions across phases ("You chose LLC in Phase 2, so...")
- Generates insights from accumulated data ("Based on your financials, you need $60K")
- Can be exported at any time in multiple formats
- Maintains version history (see what changed over time)

---

## Data Model: What Gets Saved

### Core Database Tables

Here's the complete data model for tracking everything:

### 1. Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  plan_tier VARCHAR(20) DEFAULT 'free', -- free, starter, growth, pro
  created_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP DEFAULT NOW(),
  onboarding_completed BOOLEAN DEFAULT FALSE
);
```

### 2. Business Plans Table

```sql
CREATE TABLE business_plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Basic Info (from onboarding)
  business_name VARCHAR(255),
  business_type VARCHAR(100), -- SaaS, Service, E-commerce, etc.
  industry VARCHAR(100),
  stage VARCHAR(50), -- idea, planning, started
  state VARCHAR(2), -- US state code
  timeline VARCHAR(50), -- 0-3 months, 3-6 months, etc.
  funding_approach VARCHAR(50), -- bootstrapped, raising, etc.

  -- Progress Tracking
  confidence_score INTEGER DEFAULT 0, -- 0-100%
  phase_1_progress INTEGER DEFAULT 0, -- 0-100%
  phase_2_progress INTEGER DEFAULT 0,
  phase_3_progress INTEGER DEFAULT 0,
  current_hero_task_id VARCHAR(100),

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_exported_at TIMESTAMP,

  -- Soft delete (users can have multiple plans)
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP
);

CREATE INDEX idx_business_plans_user ON business_plans(user_id);
```

### 3. User Tasks Table (Progress Tracking)

```sql
CREATE TABLE user_tasks (
  id UUID PRIMARY KEY,
  business_plan_id UUID REFERENCES business_plans(id) ON DELETE CASCADE,
  task_id VARCHAR(100) NOT NULL, -- e.g., 'task-legal-entity-selection'

  -- Status
  status VARCHAR(20) DEFAULT 'not_started', -- not_started, in_progress, complete, skipped

  -- Task Data (JSON)
  completion_data JSONB, -- All form answers, selections, etc.
  ai_recommendations JSONB, -- AI suggestions made during task

  -- Timestamps
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Metadata
  time_spent_seconds INTEGER DEFAULT 0, -- Track how long user spent
  attempts INTEGER DEFAULT 0 -- Number of times user returned to task
);

CREATE INDEX idx_user_tasks_plan ON user_tasks(business_plan_id);
CREATE INDEX idx_user_tasks_status ON user_tasks(business_plan_id, status);
```

**Example `completion_data` for Task 1.1 (Problem Definition)**:

```json
{
  "problem": "Freelance designers waste 5+ hours per week chasing down client payments.",
  "who": "Freelance designers and creative professionals",
  "current_solution": "Manual invoices via email, PayPal requests, awkward follow-ups",
  "ai_feedback": {
    "assessment": "green",
    "message": "Your problem is clear and specific. This is a strong foundation."
  }
}
```

### 4. User Decisions Table (Key Choices)

```sql
CREATE TABLE user_decisions (
  id UUID PRIMARY KEY,
  business_plan_id UUID REFERENCES business_plans(id) ON DELETE CASCADE,
  decision_type VARCHAR(100) NOT NULL, -- e.g., 'entity_type', 'business_name'
  decision_value JSONB NOT NULL, -- The actual decision (string, object, etc.)

  -- Context
  task_id VARCHAR(100), -- Which task generated this decision
  reasoning TEXT, -- AI or user reasoning for decision
  alternatives_considered JSONB, -- Other options that were evaluated

  -- Timestamps
  made_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Version tracking
  version INTEGER DEFAULT 1,
  superseded_by UUID REFERENCES user_decisions(id) -- If decision was changed
);

CREATE INDEX idx_user_decisions_plan ON user_decisions(business_plan_id);
CREATE INDEX idx_user_decisions_type ON user_decisions(business_plan_id, decision_type);
```

**Example decisions**:

```json
// Entity Type Decision
{
  "decision_type": "entity_type",
  "decision_value": "LLC",
  "task_id": "task-legal-entity-selection",
  "reasoning": "LLC provides liability protection with simpler taxes than C-Corp. Best for bootstrapped SaaS.",
  "alternatives_considered": ["C-Corp", "S-Corp", "Sole Proprietorship"]
}

// Business Name Decision
{
  "decision_type": "business_name",
  "decision_value": {
    "name": "TaskFlow",
    "domain": "[taskflow.io](http://taskflow.io)",
    "domain_available": true,
    "trademark_status": "available"
  },
  "task_id": "task-ideation-business-name",
  "reasoning": "Short, memorable, clearly communicates what the product does"
}

// Target Customer Decision
{
  "decision_type": "target_customer",
  "decision_value": {
    "persona_name": "Startup Sarah",
    "demographics": {
      "age": 32,
      "location": "San Francisco, CA",
      "job": "Product Manager at Series B startup",
      "income": "$120,000/year"
    },
    "goals": ["Launch own SaaS", "Financial independence"],
    "challenges": ["Limited time", "Legal fears", "Tight budget"]
  },
  "task_id": "task-ideation-target-customer"
}
```

### 5. Documents Table (Uploaded & Generated Files)

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  business_plan_id UUID REFERENCES business_plans(id) ON DELETE CASCADE,

  -- Document Info
  document_type VARCHAR(100) NOT NULL, -- registration, license, contract, generated_agreement, etc.
  file_name VARCHAR(255),
  file_size_bytes INTEGER,
  mime_type VARCHAR(100),

  -- Storage
  storage_url TEXT NOT NULL, -- S3 URL or similar
  is_generated BOOLEAN DEFAULT FALSE, -- True if AI-generated

  -- Context
  task_id VARCHAR(100), -- Which task this relates to
  tags TEXT[], -- Searchable tags
  description TEXT,

  -- Metadata
  uploaded_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- For temporary files

  -- Security
  is_sensitive BOOLEAN DEFAULT FALSE, -- Contains EIN, SSN, etc.
  encryption_key_id VARCHAR(255) -- If encrypted at rest
);

CREATE INDEX idx_documents_plan ON documents(business_plan_id);
CREATE INDEX idx_documents_type ON documents(business_plan_id, document_type);
```

**Example documents**:

- EIN confirmation letter (uploaded PDF)
- Articles of Organization (uploaded PDF)
- Operating Agreement (AI-generated DOCX)
- Financial projections (generated Excel)
- Logo files (uploaded images)
- Insurance policies (uploaded PDFs)

### 6. User Deadlines Table (Reminders & Dates)

```sql
CREATE TABLE user_deadlines (
  id UUID PRIMARY KEY,
  business_plan_id UUID REFERENCES business_plans(id) ON DELETE CASCADE,

  -- Deadline Info
  deadline_type VARCHAR(100), -- tax_payment, filing, renewal, milestone
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,

  -- Context
  task_id VARCHAR(100), -- Task that created this deadline
  related_decision_id UUID REFERENCES user_decisions(id),

  -- Status
  status VARCHAR(20) DEFAULT 'upcoming', -- upcoming, completed, missed
  completed_at TIMESTAMP,

  -- Reminders
  reminder_30_days_sent BOOLEAN DEFAULT FALSE,
  reminder_7_days_sent BOOLEAN DEFAULT FALSE,
  reminder_1_day_sent BOOLEAN DEFAULT FALSE,

  -- Recurrence (for quarterly taxes, annual reports, etc.)
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule VARCHAR(50), -- quarterly, annual, biennial
  next_occurrence_id UUID REFERENCES user_deadlines(id),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_deadlines_plan_date ON user_deadlines(business_plan_id, due_date);
```

**Example deadlines**:

```json
// Quarterly estimated tax payment
{
  "deadline_type": "tax_payment",
  "title": "Q1 Estimated Tax Payment",
  "description": "Federal and CA state estimated taxes due",
  "due_date": "2025-04-15",
  "task_id": "task-finance-tax-planning",
  "is_recurring": true,
  "recurrence_rule": "quarterly"
}

// Annual report filing
{
  "deadline_type": "filing",
  "title": "California Statement of Information",
  "description": "Biennial filing required for LLCs in California",
  "due_date": "2026-03-15",
  "task_id": "task-legal-initial-report",
  "is_recurring": true,
  "recurrence_rule": "biennial"
}
```

### 7. Chat Conversations Table

```sql
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY,
  business_plan_id UUID REFERENCES business_plans(id) ON DELETE CASCADE,

  -- Conversation metadata
  started_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,

  -- Context snapshot (what was the user working on?)
  context_snapshot JSONB,

  -- Status
  is_archived BOOLEAN DEFAULT FALSE
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,

  -- Message content
  role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,

  -- Context at time of message
  task_id VARCHAR(100), -- What task was user on?
  context_used JSONB, -- Full context sent to AI

  -- AI metadata (if assistant message)
  model VARCHAR(50), -- gpt-4, gpt-4-turbo
  tokens_used INTEGER,
  latency_ms INTEGER,

  -- Actions (if any buttons were included)
  actions JSONB, -- [{type, parameter, label}, ...]
  action_taken VARCHAR(50), -- Which action user clicked (if any)

  -- Feedback
  user_rating INTEGER, -- Thumbs up (1) or down (-1)

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
```

**Example chat exchange saved**:

```json
// User message
{
  "role": "user",
  "content": "What taxes will I owe as an LLC?",
  "task_id": "task-legal-tax-obligations",
  "context_used": { /* full context object */ }
}

// AI response
{
  "role": "assistant",
  "content": "Based on your LLC entity type, you'll pay...\n\n1. Self-employment tax (15.3%)\n2. Federal income tax...",
  "task_id": "task-legal-tax-obligations",
  "model": "gpt-4-turbo",
  "tokens_used": 856,
  "latency_ms": 2340,
  "actions": [
    {"type": "view_task", "parameter": "task-finance-tax-planning", "label": "View tax planning task →"}
  ],
  "user_rating": 1  // User gave thumbs up
}
```

### 8. Export History Table

```sql
CREATE TABLE export_history (
  id UUID PRIMARY KEY,
  business_plan_id UUID REFERENCES business_plans(id) ON DELETE CASCADE,

  -- Export details
  export_type VARCHAR(50), -- pdf, docx, csv, json
  export_scope VARCHAR(50), -- full_plan, phase_1, financial_only, etc.
  file_url TEXT,
  file_size_bytes INTEGER,

  -- Snapshot
  snapshot JSONB, -- Complete data snapshot at export time

  -- Metadata
  exported_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP -- Temporary download link
);
```

### 9. Activity Log Table (Audit Trail)

```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY,
  business_plan_id UUID REFERENCES business_plans(id) ON DELETE CASCADE,

  -- Activity details
  activity_type VARCHAR(100), -- task_completed, decision_made, document_uploaded, etc.
  entity_type VARCHAR(50), -- task, decision, document, etc.
  entity_id UUID,

  -- Changes
  before_value JSONB, -- State before change
  after_value JSONB, -- State after change

  -- Context
  user_agent TEXT,
  ip_address VARCHAR(45),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_log_plan_time ON activity_log(business_plan_id, created_at DESC);
```

---

## Real-Time Sync & Auto-Save

### The User Experience

**Goal**: Users should NEVER lose work. Everything saves automatically.

**User-facing behavior**:

- ✅ No "Save" button (auto-saves as you type)
- ✅ "Last saved 3 seconds ago" indicator
- ✅ Works offline (syncs when reconnected)
- ✅ Never lose progress if browser crashes

### Technical Implementation

### 1. Optimistic UI Updates (Frontend)

**Pattern**: Update UI immediately, sync to backend in background

```jsx
// When user types in a form field
function handleFieldChange(field, value) {
  // 1. Update local state immediately (optimistic)
  dispatch({
    type: 'UPDATE_TASK_FIELD',
    payload: { taskId, field, value }
  });

  // 2. Debounce save to backend (wait 500ms after user stops typing)
  debouncedSaveToBackend(taskId, field, value);
}

// Debounced save function
const debouncedSaveToBackend = debounce(async (taskId, field, value) => {
  try {
    await api.tasks.updateField(taskId, field, value);

    dispatch({
      type: 'SAVE_SUCCESS',
      payload: { taskId, timestamp: [Date.now](http://Date.now)() }
    });
  } catch (error) {
    // Revert optimistic update if save fails
    dispatch({
      type: 'SAVE_FAILED',
      payload: { taskId, field, error }
    });

    // Show error toast
    showToast('Changes not saved. Retrying...', 'error');

    // Retry with exponential backoff
    retryWithBackoff(() => api.tasks.updateField(taskId, field, value));
  }
}, 500); // Wait 500ms after user stops typing
```

### 2. Backend Save Endpoint

**Endpoint**: `PATCH /api/business-plans/:planId/tasks/:taskId`

```jsx
router.patch('/tasks/:taskId', async (req, res) => {
  const { planId, taskId } = req.params;
  const { field, value } = req.body;

  // 1. Fetch current task state
  const task = await db.user_tasks.findOne({
    business_plan_id: planId,
    task_id: taskId
  });

  if (!task) {
    // First time saving this task - create it
    task = await db.user_tasks.create({
      business_plan_id: planId,
      task_id: taskId,
      status: 'in_progress',
      completion_data: {},
      started_at: new Date()
    });
  }

  // 2. Update field in completion_data (JSONB)
  const updatedData = {
    ...task.completion_data,
    [field]: value
  };

  // 3. Save to database
  await db.user_tasks.update(
    { id: [task.id](http://task.id) },
    {
      completion_data: updatedData,
      updated_at: new Date()
    }
  );

  // 4. Log activity
  await db.activity_log.create({
    business_plan_id: planId,
    activity_type: 'task_field_updated',
    entity_type: 'task',
    entity_id: [task.id](http://task.id),
    before_value: { [field]: task.completion_data[field] },
    after_value: { [field]: value }
  });

  // 5. Return success
  res.json({
    success: true,
    updated_at: new Date().toISOString()
  });
});
```

### 3. Conflict Resolution

**Problem**: User has app open on multiple devices. Makes change on Device A, then Device B.

**Solution**: Last-write-wins with conflict detection

```jsx
// Include version/timestamp with each save
const saveData = {
  field: 'problem',
  value: 'Updated problem statement',
  last_known_version: task.updated_at, // Client's last known version
}

// Backend checks if version matches
if (task.updated_at > req.body.last_known_version) {
  // Conflict! Someone else updated this field
  return res.status(409).json({
    error: 'conflict',
    message: 'This field was updated on another device',
    current_value: task.completion_data[field],
    your_value: value,
    resolution_options: [
      { action: 'use_yours', label: 'Use your version' },
      { action: 'use_theirs', label: 'Use other device version' },
      { action: 'merge', label: 'Merge both' },
    ],
  })
}
```

**UI Treatment**: Show modal asking user to resolve conflict

---

## Document Generation: Exporting the Business Plan

Users can export their complete business plan at any time in multiple formats.

### Export Options

**1. Full Business Plan (PDF)**

- Beautiful, formatted document with all completed sections
- Includes: Executive summary, market analysis, business model, legal structure, financial projections
- Professional layout suitable for sharing with investors, partners, lenders

**2. Financial Summary (Excel)**

- Startup costs breakdown
- Monthly operating budget
- 3-year financial projections
- Cash flow statements
- Editable spreadsheet format

**3. Task Completion Report (PDF)**

- Shows which tasks are complete
- Progress by phase
- Upcoming deadlines
- Useful for accountability/tracking

**4. Data Export (JSON)**

- Complete data dump for developers
- All tasks, decisions, documents
- Machine-readable format
- Useful for importing into other tools

**5. Phase-Specific Exports**

- Legal documents only (Articles, EIN, Operating Agreement)
- Financial documents only (Budget, projections, bank info)
- Marketing materials only (Value prop, target customer, competitive analysis)

### PDF Generation Technical Implementation

**Library**: Use Puppeteer (headless Chrome) or PDFKit

**Process**:

```jsx
// 1. User clicks "Export as PDF"
[router.post](http://router.post)('/export/pdf', async (req, res) => {
  const { planId } = req.params;
  const { scope } = req.body; // 'full', 'financial', 'legal', etc.

  // 2. Fetch all data
  const plan = await fetchCompletePlan(planId, scope);

  // 3. Generate HTML from template
  const html = await renderTemplate('business-plan-pdf', plan);

  // 4. Convert HTML to PDF
  const pdfBuffer = await generatePDF(html);

  // 5. Upload to S3 with temporary URL
  const fileUrl = await uploadToS3(pdfBuffer, {
    key: `exports/${planId}/business-plan-${[Date.now](http://Date.now)()}.pdf`,
    expiresIn: 7 * 24 * 60 * 60 // 7 days
  });

  // 6. Save export history
  await db.export_history.create({
    business_plan_id: planId,
    export_type: 'pdf',
    export_scope: scope,
    file_url: fileUrl,
    file_size_bytes: pdfBuffer.length,
    snapshot: plan, // Full data snapshot
    expires_at: new Date([Date.now](http://Date.now)() + 7 * 24 * 60 * 60 * 1000)
  });

  // 7. Return download URL
  res.json({
    success: true,
    download_url: fileUrl,
    expires_in_days: 7
  });
});

async function fetchCompletePlan(planId, scope) {
  // Fetch all relevant data based on scope
  const plan = await [db.business](http://db.business)_plans.findById(planId);
  const tasks = await db.user_tasks.findByPlanId(planId);
  const decisions = await db.user_decisions.findByPlanId(planId);
  const documents = await db.documents.findByPlanId(planId);
  const deadlines = await db.user_deadlines.findByPlanId(planId);

  // Filter by scope
  if (scope === 'financial') {
    tasks = tasks.filter(t => t.task_id.startsWith('task-finance-'));
  } else if (scope === 'legal') {
    tasks = tasks.filter(t => t.task_id.startsWith('task-legal-'));
  }

  // Organize data by section
  return {
    metadata: {
      business_name: [plan.business](http://plan.business)_name,
      generated_at: new Date().toISOString(),
      version: '1.0'
    },
    sections: {
      executive_summary: buildExecutiveSummary(plan, decisions),
      market_analysis: buildMarketAnalysis(tasks, decisions),
      business_model: buildBusinessModel(tasks, decisions),
      legal_structure: buildLegalStructure(tasks, decisions, documents),
      financial_projections: buildFinancialProjections(tasks, decisions),
      appendix: buildAppendix(documents)
    }
  };
}

function buildExecutiveSummary(plan, decisions) {
  // Pull key decisions and format into executive summary
  return {
    business_name: [plan.business](http://plan.business)_name,
    tagline: decisions.find(d => d.decision_type === 'value_proposition')?.decision_value?.tweet,
    problem: decisions.find(d => d.decision_type === 'problem_definition')?.decision_value?.problem,
    solution: decisions.find(d => d.decision_type === 'value_proposition')?.decision_value?.hero,
    target_customer: decisions.find(d => d.decision_type === 'target_customer')?.decision_value,
    business_model: decisions.find(d => d.decision_type === 'business_model')?.decision_value,
    funding_need: decisions.find(d => d.decision_type === 'startup_budget')?.decision_value?.total_funding_needed
  };
}
```

### PDF Template (HTML + CSS)

**Structure**:

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      @page {
        size: letter;
        margin: 1in;
      }
      body {
        font-family: 'Helvetica', sans-serif;
        color: #333;
      }
      h1 {
        color: #2563eb;
        page-break-before: always;
      }
      h2 {
        color: #1e40af;
        margin-top: 2em;
      }
      .cover-page {
        text-align: center;
        padding-top: 5in;
      }
      .section {
        page-break-inside: avoid;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
    </style>
  </head>
  <body>
    <!-- Cover Page -->
    <div class="cover-page">
      <h1 style="font-size: 3em;">business_name</h1>
      <h2>Business Plan</h2>
      <p style="margin-top: 2em;">Generated: generated_at</p>
    </div>

    <!-- Table of Contents -->
    <div style="page-break-before: always;">
      <h1>Table of Contents</h1>
      <ol>
        <li><a href="#executive-summary">Executive Summary</a></li>
        <li><a href="#market-analysis">Market Analysis</a></li>
        <li><a href="#business-model">Business Model</a></li>
        <li><a href="#legal-structure">Legal Structure</a></li>
        <li><a href="#financial-projections">Financial Projections</a></li>
        <li><a href="#appendix">Appendix</a></li>
      </ol>
    </div>

    <!-- Executive Summary -->
    <div id="executive-summary">
      <h1>Executive Summary</h1>
      <div class="section">
        <h2>The Problem</h2>
        <p>problem</p>
      </div>
      <div class="section">
        <h2>Our Solution</h2>
        <p>solution</p>
      </div>
      <!-- More sections... -->
    </div>

    <!-- More content... -->
  </body>
</html>
```

---

## Version History & Rollback

Users can view past versions of their business plan and restore previous states.

### What Gets Versioned

**Automatic versioning on**:

- Task completion (creates snapshot of task data)
- Decision changes (supersedes previous decision)
- Document uploads (replaces previous version)
- Major milestones (phase completion)

### Version Timeline UI

**Location**: Settings → Version History

**Display**:

```
📅 Version Timeline

[Today - January 20, 2025]
  • Completed "Set Up Invoicing & Payment Processing" (3:45 PM)
  • Updated financial projections (2:30 PM)
  • Chat: Asked 3 questions about tax planning (1:15 PM)

[Yesterday - January 19, 2025]
  • 🎉 Phase 2 complete! (8:20 PM)
  • Uploaded EIN confirmation letter (7:45 PM)
  • Completed "Get Your EIN from the IRS" (7:30 PM)

[January 18, 2025]
  • Changed business model from "One-time" to "Subscription" (5:10 PM)
    [View old version] [See changes]
  • Completed "Determine Your Business Model" (4:55 PM)

[Snapshot available]
```

### Rollback Implementation

**Approach**: Snapshots instead of full version control

```sql
CREATE TABLE snapshots (
  id UUID PRIMARY KEY,
  business_plan_id UUID REFERENCES business_plans(id) ON DELETE CASCADE,
  snapshot_type VARCHAR(50), -- task_completion, phase_completion, manual

  -- Snapshot data (complete state at this point in time)
  tasks_snapshot JSONB,
  decisions_snapshot JSONB,
  documents_snapshot JSONB,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  trigger_event VARCHAR(255) -- What caused this snapshot
);
```

**When snapshots are created**:

1. **Task completion** (automatic)
2. **Phase completion** (automatic)
3. **Manual save** (user clicks "Save snapshot")
4. **Before major change** (e.g., changing entity type)
5. **Daily** (if any changes made that day)

**Rollback process**:

```jsx
// User clicks "Restore this version"
[router.post](http://router.post)('/snapshots/:snapshotId/restore', async (req, res) => {
  const { planId } = req.params;
  const { snapshotId } = req.params;

  // 1. Fetch snapshot
  const snapshot = await db.snapshots.findById(snapshotId);

  if ([snapshot.business](http://snapshot.business)_plan_id !== planId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // 2. Create snapshot of current state (before rollback)
  await createSnapshot(planId, 'before_rollback');

  // 3. Restore snapshot data
  await db.user_tasks.deleteByPlanId(planId);
  await db.user_tasks.bulkInsert(snapshot.tasks_snapshot);

  await db.user_decisions.deleteByPlanId(planId);
  await db.user_decisions.bulkInsert(snapshot.decisions_snapshot);

  // Documents aren't deleted (keep all uploaded files)

  // 4. Recalculate progress
  await recalculateProgress(planId);

  // 5. Log activity
  await db.activity_log.create({
    business_plan_id: planId,
    activity_type: 'snapshot_restored',
    entity_type: 'snapshot',
    entity_id: snapshotId
  });

  res.json({ success: true });
});
```

---

## Integration with App Features

How the documentation/persistence layer connects to everything else:

### 1. Integration with Tasks

**As user completes tasks**:

```jsx
// Task completion flow
async function completeTask(taskId, completionData) {
  // 1. Save task data
  await db.user_tasks.update(
    { task_id: taskId },
    {
      status: 'complete',
      completion_data: completionData,
      completed_at: new Date()
    }
  );

  // 2. Extract and save key decisions
  const decisions = extractDecisions(taskId, completionData);
  for (const decision of decisions) {
    await db.user_decisions.create({
      business_plan_id: planId,
      decision_type: decision.type,
      decision_value: decision.value,
      task_id: taskId
    });
  }

  // 3. Update progress
  await updateProgress(planId);

  // 4. Create snapshot if major milestone
  if (isMajorMilestone(taskId)) {
    await createSnapshot(planId, 'task_completion');
  }

  // 5. Trigger next actions
  await unlockDependentTasks(taskId);
}

function extractDecisions(taskId, data) {
  // Map task data to decisions
  const decisionMap = {
    'task-legal-entity-selection': () => [{
      type: 'entity_type',
      value: data.selected_entity
    }],
    'task-ideation-business-name': () => [{
      type: 'business_name',
      value: {
        name: [data.business](http://data.business)_name,
        domain: data.domain,
        trademark_status: data.trademark_status
      }
    }]
    // More mappings...
  };

  return decisionMap[taskId]?.() || [];
}
```

### 2. Integration with AI Chat

**Chat pulls from saved data**:

```jsx
// When user asks: "What's my total funding need?"
const response = await generateAIResponse({
  question: "What's my total funding need?",
  context: {
    // Pull from saved decisions
    startup_costs: decisions.find((d) => d.decision_type === 'startup_budget')?.decision_value,
    monthly_costs: tasks.find((t) => t.task_id === 'task-finance-startup-budget')?.completion_data
      ?.monthly_operating_budget,
    runway_months: 12,
  },
})
```

**Chat can update saved data** (with user confirmation):

```jsx
// User: "Actually, change my entity type to C-Corp"
// AI: "I'll update your entity type to C-Corp. This will affect:
//      - Tax obligations
//      - Operating Agreement needed
//      - More complexity
//      [Confirm change]  [Cancel]"

if (userConfirms) {
  await db.user_decisions.create({
    decision_type: 'entity_type',
    decision_value: 'C-Corp',
    reasoning: 'Changed from LLC per user request in chat',
    supersedes: previousDecisionId,
    made_at: new Date(),
  })

  // Cascade changes to dependent tasks
  await recalculateDependentTasks('entity_type')
}
```

### 3. Integration with Dashboard

**Dashboard displays saved data**:

```jsx
// Dashboard queries
const dashboardData = {
  // Progress from user_tasks
  progress: await calculateProgress(planId),

  // Hero task from current state
  heroTask: await getNextPriorityTask(planId),

  // Key decisions from user_decisions
  keyDecisions: await db.user_decisions
    .findByPlanId(planId)
    .whereIn('decision_type', ['entity_type', 'business_name', 'business_model'])
    .latest(),

  // Upcoming deadlines from user_deadlines
  upcomingDeadlines: await db.user_deadlines
    .findByPlanId(planId)
    .where('due_date', '>', new Date())
    .orderBy('due_date', 'asc')
    .limit(5),

  // Recent activity from activity_log
  recentActivity: await db.activity_log
    .findByPlanId(planId)
    .orderBy('created_at', 'desc')
    .limit(10),
}
```

### 4. Integration with Progress Tracking

**Confidence score calculation**:

```jsx
async function calculateConfidenceScore(planId) {
  const tasks = await db.user_tasks.findByPlanId(planId);
  const completedTasks = tasks.filter(t => t.status === 'complete');

  // Weight by phase (Phase 2 = 40%, Phase 1 = 20%, Phase 3 = 30%)
  const phase1Tasks = completedTasks.filter(t => t.task_id.startsWith('task-ideation-'));
  const phase2Tasks = completedTasks.filter(t => t.task_id.startsWith('task-legal-'));
  const phase3Tasks = completedTasks.filter(t => t.task_id.startsWith('task-finance-'));

  const phase1Score = (phase1Tasks.length / 10) * 20; // 10 tasks, 20% weight
  const phase2Score = (phase2Tasks.length / 12) * 40; // 12 tasks, 40% weight
  const phase3Score = (phase3Tasks.length / 12) * 30; // 12 tasks, 30% weight

  const totalScore = Math.round(phase1Score + phase2Score + phase3Score);

  // Save to business_plans table
  await [db.business](http://db.business)_plans.update(
    { id: planId },
    {
      confidence_score: totalScore,
      phase_1_progress: Math.round((phase1Tasks.length / 10) * 100),
      phase_2_progress: Math.round((phase2Tasks.length / 12) * 100),
      phase_3_progress: Math.round((phase3Tasks.length / 12) * 100)
    }
  );

  return totalScore;
}
```

---

## Sharing & Collaboration

### Use Cases

**1. Share with co-founder**

- Grant full edit access
- Both see real-time updates
- Activity log shows who made which changes

**2. Share with accountant**

- Grant read-only access to financial sections
- Can download financial exports
- Can leave comments on specific items

**3. Share with investor**

- Export polished PDF
- Temporary view-only link (expires in 30 days)
- No account required

**4. Share with lawyer**

- Grant read access to legal sections
- Can download legal documents
- Can provide feedback via comments

### Implementation

**Permissions table**:

```sql
CREATE TABLE business_plan_permissions (
  id UUID PRIMARY KEY,
  business_plan_id UUID REFERENCES business_plans(id) ON DELETE CASCADE,

  -- Who has access
  user_id UUID REFERENCES users(id), -- If registered user
  email VARCHAR(255), -- If invited by email (not yet registered)
  invite_token VARCHAR(255) UNIQUE, -- For accepting invite

  -- Access level
  permission_level VARCHAR(20), -- owner, editor, viewer, commenter
  scope VARCHAR(50) DEFAULT 'all', -- all, financial, legal, etc.

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, revoked
  invited_by UUID REFERENCES users(id),
  accepted_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP -- For temporary access
);
```

**Sharing flow**:

```jsx
// User clicks "Share" button
[router.post](http://router.post)('/share', async (req, res) => {
  const { planId } = req.params;
  const { email, permission_level, scope } = req.body;

  // 1. Check if user exists
  let user = await db.users.findByEmail(email);

  // 2. Create permission record
  const permission = await [db.business](http://db.business)_plan_permissions.create({
    business_plan_id: planId,
    user_id: user?.id,
    email: email,
    invite_token: generateToken(),
    permission_level: permission_level,
    scope: scope,
    status: user ? 'active' : 'pending',
    invited_by: [req.user.id](http://req.user.id)
  });

  // 3. Send invitation email
  await sendInviteEmail({
    to: email,
    business_name: [plan.business](http://plan.business)_name,
    invited_by: [req.user.name](http://req.user.name),
    permission_level: permission_level,
    accept_url: `${APP_URL}/accept-invite/${permission.invite_token}`
  });

  res.json({ success: true, permission_id: [permission.id](http://permission.id) });
});
```

---

## Offline Support

Users can work offline; changes sync when reconnected.

### Technical Approach

**1. Service Worker** (cache app shell)

**2. IndexedDB** (local storage for data)

**3. Sync Queue** (queue changes while offline)

```jsx
// Offline detection
window.addEventListener('offline', () => {
  dispatch({ type: 'SET_OFFLINE', payload: true });
  showToast('You're offline. Changes will sync when reconnected.', 'info');
});

window.addEventListener('online', () => {
  dispatch({ type: 'SET_OFFLINE', payload: false });
  syncQueuedChanges();
});

// Queue changes while offline
async function saveChange(change) {
  if ([navigator.onLine](http://navigator.onLine)) {
    // Online - save directly
    await [api.save](http://api.save)(change);
  } else {
    // Offline - queue for later
    await queueChange(change);
    showToast('Saved offline. Will sync when reconnected.', 'warning');
  }
}

async function queueChange(change) {
  // Store in IndexedDB
  const db = await openIndexedDB();
  await db.syncQueue.add({
    id: generateId(),
    change: change,
    timestamp: [Date.now](http://Date.now)(),
    retries: 0
  });
}

// Sync when back online
async function syncQueuedChanges() {
  const db = await openIndexedDB();
  const queue = await db.syncQueue.getAll();

  for (const item of queue) {
    try {
      await [api.save](http://api.save)(item.change);
      await db.syncQueue.delete([item.id](http://item.id));
    } catch (error) {
      // Retry with exponential backoff
      item.retries++;
      if (item.retries < 3) {
        await db.syncQueue.update(item);
      } else {
        // Give up after 3 retries
        showToast('Some changes failed to sync. Please try again.', 'error');
      }
    }
  }

  showToast('All changes synced!', 'success');
}
```

---

## Summary: The Complete Documentation System

### What Gets Saved (Automatically)

✅ **Every form field** (debounced auto-save)

✅ **Every task completion** (with timestamp)

✅ **Every key decision** (with reasoning)

✅ **Every uploaded document** (encrypted if sensitive)

✅ **Every chat conversation** (for context)

✅ **Every deadline** (with reminders)

✅ **Every change** (activity log audit trail)

✅ **Snapshots at milestones** (rollback capability)

### What Users Can Export

📄 **Full business plan** (beautiful PDF)

📊 **Financial models** (Excel spreadsheet)

📋 **Task reports** (completion tracking)

💾 **Raw data** (JSON for developers)

📁 **Section-specific** (legal only, financial only)

### Integration Points

🔗 **Tasks** → Save progress, extract decisions, create snapshots

🔗 **Chat** → Pull context, update data (with confirmation)

🔗 **Dashboard** → Display progress, decisions, deadlines

🔗 **Progress Tracking** → Calculate confidence score from completed tasks

🔗 **Export** → Generate documents from saved data

🔗 **Sharing** → Grant access, real-time collaboration

### Key Features

🎯 **Auto-save** (no save button needed)

🎯 **Real-time sync** (works across devices)

🎯 **Offline support** (queues changes, syncs later)

🎯 **Version history** (view past versions, rollback)

🎯 **Conflict resolution** (last-write-wins with detection)

🎯 **Activity log** (complete audit trail)

🎯 **Export anytime** (multiple formats)

🎯 **Secure storage** (encrypted sensitive data)

**Result**: Users build a comprehensive, professional business plan simply by completing tasks. Everything is saved, organized, and exportable. Nothing is ever lost.

---

**Document Complete** ✅

This documentation system ensures users can focus on building their business, not managing files or worrying about losing work. Every action contributes to a living business plan that grows more valuable over time.

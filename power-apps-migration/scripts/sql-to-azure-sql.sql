-- =============================================================================
-- Database Migration Script: SQLite/SQL Server → Azure SQL Database
-- =============================================================================
-- Source: FlankSpeedLegacyDemo.Web/Data/AppDbContext.cs (Entity Framework Core)
-- Target: Azure SQL Database (Power Platform SQL Connector compatible)
--
-- This script creates the schema in Azure SQL Database for the CWA module.
-- Run this after provisioning the Azure SQL Database via Azure Portal or CLI:
--
--   az sql server create --name <server> --resource-group <rg> --location eastus --admin-user <user> --admin-password <pass>
--   az sql db create --resource-group <rg> --server <server> --name FlankSpeedLegacyDemo --service-objective S0
--
-- Then connect and run this script:
--   sqlcmd -S <server>.database.windows.net -d FlankSpeedLegacyDemo -U <user> -P <pass> -i sql-to-azure-sql.sql
-- =============================================================================

-- Enable row-level security for future Entra integration
-- (uncomment when ready for production security roles)
-- CREATE SCHEMA Security;

-- =============================================================================
-- TABLE: Users
-- Source: FlankSpeedLegacyDemo.Web/Models/User.cs
-- =============================================================================
CREATE TABLE [dbo].[Users] (
    [Id]          INT            IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [DisplayName] NVARCHAR(255)  NOT NULL,
    [Email]       NVARCHAR(255)  NOT NULL,
    [Role]        NVARCHAR(50)   NOT NULL,  -- 'Admin', 'Reviewer', 'Submitter', 'Approver'
    [Team]        NVARCHAR(100)  NOT NULL,  -- 'Operations', 'IT', 'Logistics', 'Compliance'
    [IsActive]    BIT            NOT NULL DEFAULT 1,
    [CreatedAt]   DATETIME2(7)   NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [UQ_Users_Email] UNIQUE ([Email])
);

-- =============================================================================
-- TABLE: Categories
-- Source: FlankSpeedLegacyDemo.Web/Models/Category.cs
-- =============================================================================
CREATE TABLE [dbo].[Categories] (
    [Id]          INT            IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Name]        NVARCHAR(255)  NOT NULL,
    [Module]      NVARCHAR(10)   NOT NULL,  -- 'OBS' or 'CWA'
    [Description] NVARCHAR(500)  NULL
);

-- =============================================================================
-- TABLE: Statuses
-- Source: FlankSpeedLegacyDemo.Web/Models/Status.cs
-- =============================================================================
CREATE TABLE [dbo].[Statuses] (
    [Id]        INT            IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Name]      NVARCHAR(100)  NOT NULL,
    [Module]    NVARCHAR(10)   NOT NULL,  -- 'OBS', 'CWA', or 'Shared'
    [SortOrder] INT            NOT NULL DEFAULT 0
);

-- =============================================================================
-- TABLE: WorkItems
-- Source: FlankSpeedLegacyDemo.Web/Models/WorkItem.cs
-- =============================================================================
CREATE TABLE [dbo].[WorkItems] (
    [Id]                INT            IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Title]             NVARCHAR(500)  NOT NULL,
    [Description]       NVARCHAR(MAX)  NULL,
    [Module]            NVARCHAR(10)   NOT NULL,  -- 'OBS' or 'CWA'
    [CategoryId]        INT            NOT NULL,
    [StatusId]          INT            NOT NULL,
    [Priority]          NVARCHAR(20)   NOT NULL DEFAULT 'Medium',  -- 'Low','Medium','High','Critical'
    [AssignedToUserId]  INT            NULL,
    [SubmittedByUserId] INT            NOT NULL,
    [TeamOwner]         NVARCHAR(100)  NULL,
    [DueDate]           DATE           NULL,
    [SubmittedDate]     DATETIME2(7)   NOT NULL DEFAULT SYSUTCDATETIME(),
    [LastUpdatedDate]   DATETIME2(7)   NOT NULL DEFAULT SYSUTCDATETIME(),
    [ClosedDate]        DATETIME2(7)   NULL,
    -- CWA-specific conditional fields
    [Justification]     NVARCHAR(MAX)  NULL,
    [BuildingNumber]    NVARCHAR(50)   NULL,
    [AccessLevel]       NVARCHAR(50)   NULL,  -- 'General','Restricted','Confidential','Top Secret'
    [CreatedAt]         DATETIME2(7)   NOT NULL DEFAULT SYSUTCDATETIME(),
    [UpdatedAt]         DATETIME2(7)   NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [FK_WorkItems_Categories] FOREIGN KEY ([CategoryId])
        REFERENCES [dbo].[Categories]([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_WorkItems_Statuses] FOREIGN KEY ([StatusId])
        REFERENCES [dbo].[Statuses]([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_WorkItems_AssignedTo] FOREIGN KEY ([AssignedToUserId])
        REFERENCES [dbo].[Users]([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_WorkItems_SubmittedBy] FOREIGN KEY ([SubmittedByUserId])
        REFERENCES [dbo].[Users]([Id]) ON DELETE NO ACTION
);

-- =============================================================================
-- TABLE: Comments
-- Source: FlankSpeedLegacyDemo.Web/Models/Comment.cs
-- =============================================================================
CREATE TABLE [dbo].[Comments] (
    [Id]           INT            IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [WorkItemId]   INT            NOT NULL,
    [AuthorUserId] INT            NOT NULL,
    [Text]         NVARCHAR(MAX)  NOT NULL,
    [CreatedAt]    DATETIME2(7)   NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [FK_Comments_WorkItems] FOREIGN KEY ([WorkItemId])
        REFERENCES [dbo].[WorkItems]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Comments_Users] FOREIGN KEY ([AuthorUserId])
        REFERENCES [dbo].[Users]([Id]) ON DELETE NO ACTION
);

-- =============================================================================
-- TABLE: Attachments
-- Source: FlankSpeedLegacyDemo.Web/Models/Attachment.cs
-- =============================================================================
CREATE TABLE [dbo].[Attachments] (
    [Id]              INT            IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [WorkItemId]      INT            NOT NULL,
    [FileName]        NVARCHAR(500)  NOT NULL,
    [FileSize]        BIGINT         NOT NULL DEFAULT 0,
    [UploadedByUserId] INT           NOT NULL,
    [UploadedAt]      DATETIME2(7)   NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [FK_Attachments_WorkItems] FOREIGN KEY ([WorkItemId])
        REFERENCES [dbo].[WorkItems]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Attachments_Users] FOREIGN KEY ([UploadedByUserId])
        REFERENCES [dbo].[Users]([Id]) ON DELETE NO ACTION
);

-- =============================================================================
-- TABLE: AuditLogs
-- Source: FlankSpeedLegacyDemo.Web/Models/AuditLog.cs
-- =============================================================================
CREATE TABLE [dbo].[AuditLogs] (
    [Id]               INT            IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [WorkItemId]       INT            NOT NULL,
    [Action]           NVARCHAR(100)  NOT NULL,  -- 'Created','Status Changed','Assigned','Comment Added'
    [PerformedByUserId] INT           NOT NULL,
    [OldValue]         NVARCHAR(500)  NULL,
    [NewValue]         NVARCHAR(500)  NULL,
    [Timestamp]        DATETIME2(7)   NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [FK_AuditLogs_WorkItems] FOREIGN KEY ([WorkItemId])
        REFERENCES [dbo].[WorkItems]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AuditLogs_Users] FOREIGN KEY ([PerformedByUserId])
        REFERENCES [dbo].[Users]([Id]) ON DELETE NO ACTION
);

-- =============================================================================
-- TABLE: ApprovalSteps
-- Source: FlankSpeedLegacyDemo.Web/Models/ApprovalStep.cs
-- =============================================================================
CREATE TABLE [dbo].[ApprovalSteps] (
    [Id]             INT            IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [WorkItemId]     INT            NOT NULL,
    [StepName]       NVARCHAR(200)  NOT NULL,
    [StepOrder]      INT            NOT NULL,
    [ApproverUserId] INT            NULL,
    [Decision]       NVARCHAR(20)   NOT NULL DEFAULT 'Pending',  -- 'Pending','Approved','Rejected','Returned'
    [DecisionDate]   DATETIME2(7)   NULL,
    [Remarks]        NVARCHAR(MAX)  NULL,
    [CreatedAt]      DATETIME2(7)   NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [FK_ApprovalSteps_WorkItems] FOREIGN KEY ([WorkItemId])
        REFERENCES [dbo].[WorkItems]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ApprovalSteps_Users] FOREIGN KEY ([ApproverUserId])
        REFERENCES [dbo].[Users]([Id]) ON DELETE NO ACTION
);

-- =============================================================================
-- INDEXES (from AppDbContext.OnModelCreating)
-- =============================================================================
CREATE INDEX [IX_WorkItems_Module] ON [dbo].[WorkItems] ([Module]);
CREATE INDEX [IX_WorkItems_StatusId] ON [dbo].[WorkItems] ([StatusId]);
CREATE INDEX [IX_WorkItems_CategoryId] ON [dbo].[WorkItems] ([CategoryId]);
CREATE INDEX [IX_WorkItems_AssignedToUserId] ON [dbo].[WorkItems] ([AssignedToUserId]);
CREATE INDEX [IX_WorkItems_SubmittedByUserId] ON [dbo].[WorkItems] ([SubmittedByUserId]);
CREATE INDEX [IX_Comments_WorkItemId] ON [dbo].[Comments] ([WorkItemId]);
CREATE INDEX [IX_AuditLogs_WorkItemId] ON [dbo].[AuditLogs] ([WorkItemId]);
CREATE INDEX [IX_AuditLogs_Timestamp] ON [dbo].[AuditLogs] ([Timestamp] DESC);
CREATE INDEX [IX_ApprovalSteps_WorkItemId] ON [dbo].[ApprovalSteps] ([WorkItemId]);

-- =============================================================================
-- SEED DATA (from FlankSpeedLegacyDemo.Web/Data/SeedData.cs)
-- =============================================================================
SET IDENTITY_INSERT [dbo].[Users] ON;
INSERT INTO [dbo].[Users] ([Id], [DisplayName], [Email], [Role], [Team]) VALUES
    (1, 'Sarah Mitchell', 'sarah.mitchell@ops.gov', 'Admin', 'Operations'),
    (2, 'James Rodriguez', 'james.rodriguez@ops.gov', 'Reviewer', 'Operations'),
    (3, 'Emily Chen', 'emily.chen@ops.gov', 'Submitter', 'IT'),
    (4, 'Michael Thompson', 'michael.thompson@ops.gov', 'Approver', 'Compliance'),
    (5, 'Lisa Patel', 'lisa.patel@ops.gov', 'Reviewer', 'Logistics'),
    (6, 'David Kim', 'david.kim@ops.gov', 'Submitter', 'IT'),
    (7, 'Rachel Foster', 'rachel.foster@ops.gov', 'Approver', 'Operations'),
    (8, 'Marcus Johnson', 'marcus.johnson@ops.gov', 'Admin', 'Logistics'),
    (9, 'Angela Wright', 'angela.wright@ops.gov', 'Submitter', 'Compliance'),
    (10, 'Robert Davis', 'robert.davis@ops.gov', 'Reviewer', 'IT');
SET IDENTITY_INSERT [dbo].[Users] OFF;

INSERT INTO [dbo].[Categories] ([Name], [Module], [Description]) VALUES
    ('Infrastructure Review', 'OBS', 'Reviews of physical and digital infrastructure'),
    ('Compliance Audit', 'OBS', 'Regulatory and policy compliance assessments'),
    ('Operational Assessment', 'OBS', 'Evaluations of operational readiness and efficiency'),
    ('Resource Allocation', 'OBS', 'Planning and review of resource distribution'),
    ('Facility Access Request', 'CWA', 'Requests for building or area access'),
    ('Equipment Relocation', 'CWA', 'Requests to move equipment between locations'),
    ('Personnel Action', 'CWA', 'Staff transfers, assignments, and duty changes'),
    ('Travel Authorization', 'CWA', 'Travel approval requests for conferences and training');

INSERT INTO [dbo].[Statuses] ([Name], [Module], [SortOrder]) VALUES
    ('Draft', 'Shared', 1),
    ('Submitted', 'Shared', 2),
    ('Under Review', 'OBS', 3),
    ('In Progress', 'OBS', 4),
    ('Completed', 'OBS', 5),
    ('Closed', 'OBS', 6),
    ('Pending Approval', 'CWA', 3),
    ('Approved', 'CWA', 4),
    ('Rejected', 'CWA', 5),
    ('Returned', 'CWA', 6);

GO
PRINT 'Schema creation and seed data complete.';
PRINT 'Next steps:';
PRINT '  1. Configure Power Platform SQL connector to connect to this database';
PRINT '  2. Run: pac code add-data-source -a "shared_sql" -c "<connectionId>" -t "[dbo].[WorkItems]"';
PRINT '  3. Repeat for each table used by the Code App';
GO

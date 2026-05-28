using Microsoft.EntityFrameworkCore;
using FlankSpeedLegacyDemo.Web.Models;

namespace FlankSpeedLegacyDemo.Web.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<WorkItem> WorkItems => Set<WorkItem>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Status> Statuses => Set<Status>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<ApprovalStep> ApprovalSteps => Set<ApprovalStep>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // WorkItem -> AssignedToUser: no cascade
        modelBuilder.Entity<WorkItem>()
            .HasOne(w => w.AssignedToUser)
            .WithMany()
            .HasForeignKey(w => w.AssignedToUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // WorkItem -> SubmittedByUser: no cascade
        modelBuilder.Entity<WorkItem>()
            .HasOne(w => w.SubmittedByUser)
            .WithMany()
            .HasForeignKey(w => w.SubmittedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // WorkItem -> Category
        modelBuilder.Entity<WorkItem>()
            .HasOne(w => w.Category)
            .WithMany()
            .HasForeignKey(w => w.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // WorkItem -> Status
        modelBuilder.Entity<WorkItem>()
            .HasOne(w => w.Status)
            .WithMany()
            .HasForeignKey(w => w.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        // Comment -> AuthorUser: no cascade
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.AuthorUser)
            .WithMany()
            .HasForeignKey(c => c.AuthorUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Comment -> WorkItem
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.WorkItem)
            .WithMany(w => w.Comments)
            .HasForeignKey(c => c.WorkItemId)
            .OnDelete(DeleteBehavior.Cascade);

        // Attachment -> UploadedByUser: no cascade
        modelBuilder.Entity<Attachment>()
            .HasOne(a => a.UploadedByUser)
            .WithMany()
            .HasForeignKey(a => a.UploadedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Attachment -> WorkItem
        modelBuilder.Entity<Attachment>()
            .HasOne(a => a.WorkItem)
            .WithMany(w => w.Attachments)
            .HasForeignKey(a => a.WorkItemId)
            .OnDelete(DeleteBehavior.Cascade);

        // AuditLog -> PerformedByUser: no cascade
        modelBuilder.Entity<AuditLog>()
            .HasOne(al => al.PerformedByUser)
            .WithMany()
            .HasForeignKey(al => al.PerformedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // AuditLog -> WorkItem
        modelBuilder.Entity<AuditLog>()
            .HasOne(al => al.WorkItem)
            .WithMany(w => w.AuditLogs)
            .HasForeignKey(al => al.WorkItemId)
            .OnDelete(DeleteBehavior.Cascade);

        // ApprovalStep -> ApproverUser: no cascade
        modelBuilder.Entity<ApprovalStep>()
            .HasOne(a => a.ApproverUser)
            .WithMany()
            .HasForeignKey(a => a.ApproverUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // ApprovalStep -> WorkItem
        modelBuilder.Entity<ApprovalStep>()
            .HasOne(a => a.WorkItem)
            .WithMany(w => w.ApprovalSteps)
            .HasForeignKey(a => a.WorkItemId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes on frequently queried columns
        modelBuilder.Entity<WorkItem>()
            .HasIndex(w => w.Module);

        modelBuilder.Entity<WorkItem>()
            .HasIndex(w => w.StatusId);

        modelBuilder.Entity<WorkItem>()
            .HasIndex(w => w.CategoryId);

        modelBuilder.Entity<WorkItem>()
            .HasIndex(w => w.AssignedToUserId);

        modelBuilder.Entity<WorkItem>()
            .HasIndex(w => w.SubmittedByUserId);
    }
}

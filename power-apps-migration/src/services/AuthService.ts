/**
 * Migrated from: FlankSpeedLegacyDemo.Web/Services/CurrentUserService.cs
 *
 * In the legacy app, user identity was managed via session cookies with a
 * demo "user switcher" dropdown. In the Power Apps Code App, authentication
 * is handled automatically by Microsoft Entra (Azure AD) SSO.
 *
 * The @microsoft/power-apps client library provides the current user context
 * without any custom auth code.
 */
import { User } from "../models";

/**
 * Returns the currently authenticated user from Microsoft Entra.
 * In Power Apps Code Apps, this is provided automatically via the host.
 *
 * Legacy equivalent: CurrentUserService.GetCurrentUser()
 */
export async function getCurrentUser(): Promise<User> {
  // In production, this calls the Power Platform host API:
  // const context = await PowerApps.getContext();
  // return context.user;

  // During local development, return a mock user
  const response = await fetch("/api/users/current");
  return response.json();
}

/**
 * Returns the current user's ID.
 *
 * Legacy equivalent: CurrentUserService.GetCurrentUserId()
 */
export async function getCurrentUserId(): Promise<number> {
  const user = await getCurrentUser();
  return user.id;
}

/**
 * Checks if the current user has a specific role.
 * Maps to role-based conditional rendering in the UI.
 */
export function hasRole(user: User, role: string): boolean {
  return user.role === role;
}

/**
 * Checks if the current user can approve a given approval step.
 *
 * Legacy equivalent: step.ApproverUserId == currentUser.Id (in Details.cshtml)
 * Power Fx equivalent: If(ThisItem.ApproverUserId = User().Email, true, false)
 */
export function canApprove(user: User, approverUserId: number | null): boolean {
  return approverUserId === user.id;
}

/*
 * Generic validator component for complex checking of logic strings.
 *
 * Used to create specialized validators, like PermissionValidator or RoleValidator
 *
 * Authors: @codyduong
 * Date Created: 2025-02-25
 * Revision History:
 * - 2025-02-05 - @codyduong - init RBAC
 */

import { Permission } from "./jwt_utils"; // Assuming Permission is a string type
import { GenericValidator } from "./validator";

// @ts-expect-error: Yes, but no... -@codyduong, just don't misuse this that this could happen
export class PermissionValidator extends GenericValidator<Permission> {
  static new(): PermissionValidator {
    return new PermissionValidator();
  }
}

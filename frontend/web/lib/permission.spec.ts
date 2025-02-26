/*
 * Tests written for jest to validate behavior of PermissionValidator
 *
 * Authors: @codyduong
 * Date Created: 2025-02-26
 * Revision History:
 * - 2025-02-26 - @codyduong - init RBAC
 */

import { PermissionValidator } from "./permissions";

describe("PermissionValidator", () => {
  it("should validate a single permission", () => {
    const validator = PermissionValidator.new().with("read:all");
    expect(validator.validate("read:all")).toBe(true);
    expect(validator.validate("delete:all")).toBe(false);
  });

  it("should validate multiple permissions with AND", () => {
    const validator = PermissionValidator.new()
      .with("read:all")
      .and("delete:all");
    expect(validator.validate("read:all", "delete:all")).toBe(true);
    expect(validator.validate("read:all")).toBe(false);
    expect(validator.validate("delete:all")).toBe(false);
  });

  it("should validate multiple permissions with OR", () => {
    const validator = PermissionValidator.new()
      .with("read:all")
      .or("delete:all");
    expect(validator.validate("read:all")).toBe(true);
    expect(validator.validate("delete:all")).toBe(true);
    expect(validator.validate("create:all")).toBe(false);
  });

  it("should validate NOT permissions", () => {
    const validator = PermissionValidator.new()
      .with("read:all")
      .not("read:product");
    expect(validator.validate("read:all")).toBe(true);
    expect(validator.validate("read:all", "read:product")).toBe(false);
  });

  it("should handle complex AND/OR combinations", () => {
    const validator = PermissionValidator.new()
      .with("read:all")
      .and(["delete:all", "create:all"])
      .or("update:all");

    expect(validator.validate("read:all", "delete:all", "create:all")).toBe(
      true,
    );
    expect(validator.validate("update:all")).toBe(true);
    expect(validator.validate("read:all", "delete:all")).toBe(false);
    expect(validator.validate("create:all")).toBe(false);
  });

  it("should handle nested AND/OR/NOT combinations", () => {
    const validator = PermissionValidator.new()
      .with("read:all")
      .and({ type: "Or", values: ["delete:all", "create:all"] })
      .not("read:product");
    expect(validator.validate("read:all", "delete:all")).toBe(true);
    expect(validator.validate("read:all", "create:all")).toBe(true);
    expect(validator.validate("read:all", "delete:all", "read:product")).toBe(
      false,
    );
    expect(validator.validate("read:all", "update:all")).toBe(false);
  });

  it("should handle NOT with nested AND/OR", () => {
    const validator = PermissionValidator.new()
      .with("read:all")
      .not({ type: "And", values: ["delete:all", "create:all"] });
    expect(validator.validate("read:all")).toBe(true);
    expect(validator.validate("read:all", "delete:all")).toBe(true);
    expect(validator.validate("read:all", "delete:all", "create:all")).toBe(
      false,
    );
  });

  it("should handle multiple NOT conditions", () => {
    const validator = PermissionValidator.new()
      .with("read:all")
      .not("delete:all")
      .not("create:all");
    expect(validator.validate("read:all")).toBe(true);
    expect(validator.validate("read:all", "delete:all")).toBe(false);
    expect(validator.validate("read:all", "create:all")).toBe(false);
    expect(validator.validate("read:all", "update:all")).toBe(true);
  });

  it("should handle deeply nested logic", () => {
    const validator = PermissionValidator.new()
      .with("read:all")
      .and({
        type: "Or",
        values: [
          { type: "And", values: ["delete:all", "create:all"] },
          { type: "Not", values: "read:product" },
        ],
      });
    expect(validator.validate("read:product")).toBe(false);
    expect(validator.validate("read:all", "delete:all", "create:all")).toBe(
      true,
    );
    expect(validator.validate("read:all", "update:all")).toBe(true);
    expect(validator.validate("read:all", "read:product")).toBe(false);
    expect(validator.validate("read:all", "delete:all", "read:product")).toBe(
      false,
    );
  });

  it("should handle empty requirements as always valid", () => {
    const validator = PermissionValidator.new();
    expect(validator.validate("read:all")).toBe(true);
    expect(validator.validate()).toBe(true);
  });

  it("should handle invalid permissions gracefully", () => {
    const validator = PermissionValidator.new()
      .with("read:all")
      .and("delete:all");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(validator.validate("read:all", "invalid_permission" as any)).toBe(
      false,
    );
  });
});

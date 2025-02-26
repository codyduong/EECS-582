/*
 * Tests written for jest to validate behavior of PermissionValidator
 *
 * Authors: @codyduong
 * Date Created: 2025-02-26
 * Revision History:
 * - 2025-02-26 - @codyduong - init RBAC
 */

import { GenericValidator } from "./validator";

describe("PermissionValidator", () => {
  it("A monad is just a monoid in the category of endofunctors -@codyduong", () => {
    const validator = GenericValidator.new<number>()
      .with(1)
      .and(GenericValidator.new<number>().not({ type: "Or", values: [2, 3] }))
      .and(4, 5)
      .not(6)
      .or(
        GenericValidator.new<number>().and({ type: "And", values: [100, 200] }),
      );

    expect(validator.validate(1, 4, 5)).toBe(true);
    expect(validator.validate(1, 4)).toBe(false);
    expect(validator.validate(1, 5)).toBe(false);
    expect(validator.validate(1, 4, 5, 2)).toBe(false);
    expect(validator.validate(1, 4, 5, 3)).toBe(false);
    expect(validator.validate(1, 4, 5, 2, 3)).toBe(false);
    expect(validator.validate(1, 4, 5, 6)).toBe(false);
    expect(validator.validate(1, 4, 5, 2, 3, 6)).toBe(false);
    expect(validator.validate(100)).toBe(false);
    expect(validator.validate(200)).toBe(false);
    expect(validator.validate([100, 200])).toBe(true);
  });
});

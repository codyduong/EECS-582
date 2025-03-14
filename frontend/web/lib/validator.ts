/*
 * Generic validator component for complex checking of logic strings.
 *
 * Made with the help of LLMs. So tedious to make a monad.
 *
 * Used to create specialized validators, like PermissionValidator or RoleValidator
 *
 * Authors: @codyduong
 * Date Created: 2025-02-25
 * Revision History:
 * - 2025-02-25 - @codyduong - init RBAC
 */

export const GroupType = {
  Scope: "Scope",
  And: "And",
  Or: "Or",
  Not: "Not",
} as const;
export type GroupTypeLiteral = (typeof GroupType)[keyof typeof GroupType];

export interface Group<T extends string | number> {
  type: GroupTypeLiteral;
  values: T | T[] | Group<T> | Group<T>[] | GenericValidator<T>;
}

interface NormalizedGroup<T extends string | number> {
  type: GroupTypeLiteral;
  values: T | T[] | NormalizedGroup<T> | NormalizedGroup<T>[];
}

type Requirements<T extends string | number> = (
  | T
  | T[]
  | ReadonlyArray<T>
  | Group<T>
  | Group<T>[]
  | ReadonlyArray<Group<T>>
  | GenericValidator<T>
)[];

// used for jsdoc
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { PermissionValidator } from "./permissions";

/**
 * @classdesc This class should rarely be used by itself, instead consider making
 * a specialized subclass. See {@linkcode PermissionValidator}
 */
export class GenericValidator<T extends string | number> {
  private requiredScopes: NormalizedGroup<T> | null = null;

  static new<T extends string | number>(): GenericValidator<T> {
    return new GenericValidator<T>();
  }

  /**
   * Same as {@linkcode and GenericValidator.and}
   *
   * @param requirements - The value(s) or group(s) to add.
   * @returns {GenericValidator} A new GenericValidator instance with the added OR requirements.
   * @example
   * const validator = GenericValidator.new<Permission>()
   *   .with("read")
   *   .and("write", { type: ScopeGroupType.Not, value: "guest" });
   */
  with(...scopes: Requirements<T>): GenericValidator<T> {
    return this.and(...scopes);
  }

  /**
   * Adds one or more values or groups to the validator, combining them with a logical AND.
   *
   * @param requirements - The value(s) or group(s) to add.
   * @returns {GenericValidator} A new GenericValidator instance with the added OR requirements.
   * @example
   * const validator = GenericValidator.new<Permission>()
   *   .with("read")
   *   .and("write", { type: ScopeGroupType.Not, value: "guest" });
   */
  and(...requirements: Requirements<T>): GenericValidator<T> {
    const normalizedRequirements = requirements.map((req) =>
      this.normalizeScope(req),
    );
    const andRequirement =
      normalizedRequirements.length === 1
        ? normalizedRequirements[0]
        : { type: GroupType.And, values: normalizedRequirements };

    const newValidator = new GenericValidator<T>();
    newValidator.requiredScopes = this.requiredScopes
      ? {
          type: GroupType.And,
          values: [this.requiredScopes, andRequirement],
        }
      : andRequirement;
    return newValidator;
  }

  /**
   * Adds one or more values or groups to the validator, combining them with a logical OR.
   *
   * @param requirements - The value(s) or group(s) to add.
   * @returns {GenericValidator} A new GenericValidator instance with the added OR requirements.
   * @example
   * const validator = GenericValidator.new<Permission>()
   *   .with("read")
   *   .or("admin", { type: ScopeGroupType.And, values: ["edit", "publish"] });
   */
  or(...requirements: Requirements<T>): GenericValidator<T> {
    const normalizedRequirements = requirements.map((req) =>
      this.normalizeScope(req),
    );
    const orRequirement =
      normalizedRequirements.length === 1
        ? normalizedRequirements[0]
        : { type: GroupType.Or, values: normalizedRequirements };

    const newValidator = new GenericValidator<T>();
    newValidator.requiredScopes = this.requiredScopes
      ? { type: GroupType.Or, values: [this.requiredScopes, orRequirement] }
      : orRequirement;
    return newValidator;
  }

  /**
   * Adds one or more permissions or scope groups to the validator, negating them with a logical NOT.
   *
   * Multiple values are assumed to be a NOT(AND(...values)).
   * @param requirements - The values to negate.
   * @returns {GenericValidator} A new GenericValidator instance with the added NOT requirements.
   * @example
   * const validator = GenericValidator.new<Permission>()
   *   .with("read")
   *   .not("guest", { type: ScopeGroupType.Or, values: ["temp", "restricted"] });
   */
  not(...requirements: Requirements<T>): GenericValidator<T> {
    const normalizedRequirements = requirements.map((req) =>
      this.normalizeScope(req),
    );
    const notRequirement =
      normalizedRequirements.length === 1
        ? {
            type: GroupType.Not,
            values: normalizedRequirements[0],
          }
        : {
            type: GroupType.Not,
            values: { type: GroupType.And, values: normalizedRequirements },
          };

    const newValidator = new GenericValidator<T>();
    newValidator.requiredScopes = this.requiredScopes
      ? {
          type: GroupType.And,
          values: [this.requiredScopes, notRequirement],
        }
      : notRequirement;
    return newValidator;
  }

  /**
   * Normalizes a group into a Group into a NormalizedGroup.
   * @param group - The group to normalize.
   * @returns {ScopeGroup} The normalized ScopeGroup.
   * @throws {TypeError} If the group type is invalid.
   */
  private normalizeScope(group: Requirements<T>[number]): NormalizedGroup<T> {
    // Look, I'm not going to explain this, since any Typescript IDE illustrates
    // dataflow narrowing. I don't really enjoy the imperiative control flow
    // as much as the next person, but just use your IDE. Besides this functionality
    // is robustly tested. No amount of comments would save implicit control flow
    // from being terrible, so tests were made instead.

    // todo: probably should genericize this into a typeguard, or extractor
    // monad, which will probably serve our purposes of specializing this class better...
    // ,w/e never happening -@codyduong feb26,2025
    if (typeof group === "string" || typeof group === "number") {
      return { type: GroupType.Scope, values: group };
    }

    if (group instanceof GenericValidator) {
      return group.requiredScopes || { type: GroupType.Scope, values: "" as T };
    }

    if (typeof group === "object" && "type" in group && "values" in group) {
      const values = group.values;
      if (values instanceof GenericValidator) {
        return {
          type: group.type,
          values: values.requiredScopes || {
            type: GroupType.Scope,
            values: "" as T,
          },
        };
      }

      if (typeof values === "string" || typeof values === "number") {
        return {
          type: group.type,
          values: values,
        };
      }

      if (Array.isArray(values)) {
        return {
          type: group.type,
          // @ts-expect-error: No. -@codyduong
          values: values.map((v) =>
            typeof v === "string" || typeof values === "number"
              ? v
              : this.normalizeScope(v),
          ),
        };
      }

      return {
        type: group.type,
        values: this.normalizeScope(values),
      };
    }

    if (Array.isArray(group)) {
      return {
        type: GroupType.And,
        values: group.map((s) => this.normalizeScope(s)),
      };
    }

    throw new TypeError(`Invalid group type ${group}`);
  }

  /**
   * Validates the provided values against the schema.
   * Accepts variadic arguments: a single value, an array of values (mutable or readonly),
   * or multiple value arguments.
   * @param {...(T | T[] | ReadonlyArray<T>)[]} values - The values to validate.
   * @returns {boolean} True if the values satisfy the requirements, false otherwise.
   * @example
   * const validator = GenericValidator.new<Permission>()
   *   .with("read", ["write", "execute"])
   *   .and("delete")
   *   .not("guest");
   *
   * const hasAccess = validator.validate("read", "write", "execute", "delete");
   */
  validate(...values: (T | T[] | ReadonlyArray<T>)[]): boolean {
    // i wonder if this op is expensive on prohibitively complex sets... w/e wont-fix -@codyduong

    if (!this.requiredScopes) return true; // No requirements, always valid

    // @ts-expect-error: Yeah, it could be, but it's not. I think... -@codyduong
    const flattenedValues: T[] = values.flat();

    return this._validate(this.requiredScopes, flattenedValues);
  }

  /**
   * Recursively validates a Schema against the provided values.
   * @param schema - The NormalizedGroup to validate.
   * @param values - The values to validate against.
   * @returns {boolean} True if the values satisfy the Schema, false otherwise.
   */
  private _validate(schema: NormalizedGroup<T>, values: T[]): boolean {
    switch (schema.type) {
      case GroupType.Scope:
        return values.includes(schema.values as T);

      case GroupType.And:
        if (Array.isArray(schema.values)) {
          return schema.values.every((r) => {
            if (typeof r === "string" || typeof r === "number") {
              return values.includes(r);
            } else {
              return this._validate(r, values);
            }
          });
        } else {
          if (
            typeof schema.values === "string" ||
            typeof schema.values === "number"
          ) {
            return values.includes(schema.values);
          } else {
            return this._validate(schema.values, values);
          }
        }

      case GroupType.Or:
        if (Array.isArray(schema.values)) {
          return schema.values.some((r) => {
            if (typeof r === "string" || typeof r === "number") {
              return values.includes(r);
            } else {
              return this._validate(r, values);
            }
          });
        } else {
          if (
            typeof schema.values === "string" ||
            typeof schema.values === "number"
          ) {
            return values.includes(schema.values);
          } else {
            return this._validate(schema.values, values);
          }
        }

      case GroupType.Not:
        if (Array.isArray(schema.values)) {
          return schema.values.every((r) => {
            if (typeof r === "string" || typeof r === "number") {
              return !values.includes(r);
            } else {
              return !this._validate(r, values);
            }
          });
        } else {
          if (
            typeof schema.values === "string" ||
            typeof schema.values === "number"
          ) {
            return !values.includes(schema.values);
          } else {
            return !this._validate(schema.values, values);
          }
        }

      default:
        throw new Error(`Unknown scope group type: ${schema} ${schema.type}`);
    }
  }
}

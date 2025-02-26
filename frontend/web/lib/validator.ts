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

export class GenericValidator<T extends string | number> {
  public requiredScopes: NormalizedGroup<T> | null = null;

  static new<T extends string | number>(): GenericValidator<T> {
    return new GenericValidator<T>();
  }

  with(...scopes: Requirements<T>): GenericValidator<T> {
    return this.and(...scopes);
  }

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

  private normalizeScope(scope: Requirements<T>[number]): NormalizedGroup<T> {
    if (typeof scope === "string" || typeof scope === "number") {
      return { type: GroupType.Scope, values: scope };
    }
    if (scope instanceof GenericValidator) {
      return scope.requiredScopes || { type: GroupType.Scope, values: "" as T };
    }
    if (typeof scope === "object" && "type" in scope && "values" in scope) {
      const values = scope.values;
      if (values instanceof GenericValidator) {
        return {
          type: scope.type,
          values: values.requiredScopes || {
            type: GroupType.Scope,
            values: "" as T,
          },
        };
      }

      if (typeof values === "string" || typeof values === "number") {
        return {
          type: scope.type,
          values: values,
        };
      }

      if (Array.isArray(values)) {
        return {
          type: scope.type,
          // @ts-expect-error: No. -@codyduong
          values: values.map((v) =>
            typeof v === "string" || typeof values === "number"
              ? v
              : this.normalizeScope(v),
          ),
        };
      }

      return {
        type: scope.type,
        values: this.normalizeScope(values),
      };
    }
    if (Array.isArray(scope)) {
      return {
        type: GroupType.And,
        values: scope.map((s) => this.normalizeScope(s)),
      };
    }

    throw new TypeError(`Invalid scope type ${scope}`);
  }

  // i wonder if this op is expensive on prohibitively complex sets... w/e wont-fix -@codyduong
  validate(...permissions: (T | T[] | ReadonlyArray<T>)[]): boolean {
    if (!this.requiredScopes) return true; // No requirements, always valid

    // @ts-expect-error: Yeah, it could be, but it's not. I think... -@codyduong
    const flattenedPermissions: T[] = permissions.flat();

    return this._validate(this.requiredScopes, flattenedPermissions);
  }

  private _validate(group: NormalizedGroup<T>, permissions: T[]): boolean {
    switch (group.type) {
      case GroupType.Scope:
        return permissions.includes(group.values as T);

      case GroupType.And:
        if (Array.isArray(group.values)) {
          return group.values.every((r) => {
            if (typeof r === "string" || typeof r === "number") {
              return permissions.includes(r);
            } else {
              return this._validate(r, permissions);
            }
          });
        } else {
          if (
            typeof group.values === "string" ||
            typeof group.values === "number"
          ) {
            return permissions.includes(group.values);
          } else {
            return this._validate(group.values, permissions);
          }
        }

      case GroupType.Or:
        if (Array.isArray(group.values)) {
          return group.values.some((r) => {
            if (typeof r === "string" || typeof r === "number") {
              return permissions.includes(r);
            } else {
              return this._validate(r, permissions);
            }
          });
        } else {
          if (
            typeof group.values === "string" ||
            typeof group.values === "number"
          ) {
            return permissions.includes(group.values);
          } else {
            return this._validate(group.values, permissions);
          }
        }

      case GroupType.Not:
        if (Array.isArray(group.values)) {
          return group.values.every((r) => {
            if (typeof r === "string" || typeof r === "number") {
              return !permissions.includes(r);
            } else {
              return !this._validate(r, permissions);
            }
          });
        } else {
          if (
            typeof group.values === "string" ||
            typeof group.values === "number"
          ) {
            return !permissions.includes(group.values);
          } else {
            return !this._validate(group.values, permissions);
          }
        }

      default:
        throw new Error(`Unknown scope group type: ${group} ${group.type}`);
    }
  }
}

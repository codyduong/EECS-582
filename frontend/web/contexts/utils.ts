/**
 * Utility funcitons/errors for Context specific applications
 *
 * Author: @codyduong
 * Creation Date: 2025, Feb 26
 * Revisions:
 * - 2025, Feb 26 - initial creation
 */

export class ContextNotProvidedError<T> extends Error {
  context: React.Context<T>;
  name = "ContextNotProvidedError";

  constructor(component: React.Context<T>) {
    super();
    this.context = component;
    const componentName = component.name;
    this.message = `Failed to load React Context, was the necessary <${componentName}> loaded in a parent component?
Read more: https://react.dev/learn/passing-data-deeply-with-context`;
  }
}

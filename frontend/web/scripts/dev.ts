import { $ } from "bun";

await Promise.all([
    $`bun run graphql-codegen --config codegen.ts --watch`,
    $`bun run next dev --turbopack`
])
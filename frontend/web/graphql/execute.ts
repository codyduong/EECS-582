import { GRAPHQL_URL } from '@/lib/consts'
import type { TypedDocumentString } from './graphql'

// https://the-guild.dev/graphql/codegen/docs/guides/react-query#type-safe-graphql-operation-execution
// TODO, is this good? lmaooo! -@codyduong
export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  const response = await fetch(`${GRAPHQL_URL}/graphql/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/graphql-response+json'
    },
    body: JSON.stringify({
      query,
      variables
    })
  })
 
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
 
  return (await response.json() as {data: TResult}).data
}
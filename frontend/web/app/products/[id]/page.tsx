/*
 *  Page at "/products"
 *
 *  Authors:  @codyduong
 *  Date Created: 2025-03-01
 *  Revision History:
 *  - 2025-03-01 - @codyduong - make page data
 */

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  return <div>My Post: {id}</div>;
}

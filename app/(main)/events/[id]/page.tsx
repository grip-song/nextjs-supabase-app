export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <h1>이벤트 상세</h1>
      <p>ID: {id}</p>
    </div>
  );
}

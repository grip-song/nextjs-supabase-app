export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <h1>이벤트 수정</h1>
      <p>ID: {id}</p>
    </div>
  );
}

export default async function JoinEventPage({
  params,
}: {
  params: Promise<{ invite_code: string }>;
}) {
  const { invite_code } = await params;

  return (
    <div>
      <h1>이벤트 초대</h1>
      <p>초대 코드: {invite_code}</p>
    </div>
  );
}

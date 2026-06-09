export default async function DepartmentScorecardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <div>Department Scorecard: {slug}</div>;
}

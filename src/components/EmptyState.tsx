export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border-[1.5px] border-dashed border-line px-5 py-9 text-center text-[13.5px] text-chalk-faint">
      <b className="mb-1 block font-heading text-[17px] tracking-wide text-chalk">
        {title}
      </b>
      {description}
    </div>
  );
}

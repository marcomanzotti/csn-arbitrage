import CSNTool from '@/components/CSNTool';

export default function Home() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Should you take the CSN loan?
        </h1>
        <p className="mt-3 max-w-2xl text-base text-gray-600">
          CSN offers a{' '}
          <span className="font-medium text-gray-900">SEK 9,472 loan</span> and a{' '}
          <span className="font-medium text-gray-900">SEK 4,120 grant</span> per four weeks
          (full-time, 2026). The loan charges{' '}
          <span className="font-medium text-gray-900">2.135% interest per year</span>. If SEK
          bonds yield more than that, you can invest the loan, let it grow, repay in full on day
          one — and keep the grant as pure profit.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Model your scenario below. All numbers update live.
        </p>
      </div>

      <CSNTool />
    </div>
  );
}

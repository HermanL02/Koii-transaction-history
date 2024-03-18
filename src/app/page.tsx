// Assuming this is inside a server component like `page.tsx`
import dynamic from 'next/dynamic';

const TransactionsList = dynamic(() => import('../components/TransactionsList.client'), {
  ssr: false,
});

function Page() {
  return (
    <div>
      {/* Other server-rendered components */}
      <TransactionsList/>
    </div>
  );
}

export default Page;
